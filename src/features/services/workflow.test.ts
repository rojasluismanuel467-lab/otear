import assert from "node:assert/strict";
import test from "node:test";
import {
  assign,
  checkQuotePrice,
  availableActions,
  cancel,
  createRequest,
  decline,
  deliver,
  invoice,
  invoiceNote,
  invoicePlan,
  MAX_REASON_LENGTH,
  quote,
  quoteStateLabel,
  rankedQuotes,
  reply,
  replyKinds,
  schedule,
  stepIndex,
  verify,
  type Context,
} from "./workflow.ts";
import type { Party, ServiceRequest } from "../demo/types";

const parties: Party[] = [
  { id: "m", role: "manager", name: "Ingenio", siteIds: ["s"] },
  { id: "g", role: "owner", name: "Cañicultor", siteIds: ["s"] },
  { id: "o1", role: "operator", name: "Operador 1", siteIds: ["s"] },
  { id: "o2", role: "operator", name: "Operador 2", siteIds: ["s"] },
];
const as = (id: string): Context => ({
  today: "2026-10-25",
  parties,
  actor: parties.find((p) => p.id === id)!,
});
const ok = <T extends { ok: boolean }>(result: T) => {
  assert.ok(
    result.ok,
    "error" in result ? String((result as { error: string }).error) : "",
  );
  return result as Extract<T, { ok: true }>;
};

const base = () =>
  ok(
    createRequest(
      {
        siteId: "s",
        kind: "monitoring",
        title: "Vigor suertes 3 y 4",
        description: "",
        zoneIds: ["z1"],
        invited: ["o1", "o2"],
        windowStart: "2026-11-01",
        windowEnd: "2026-11-15",
        unit: "ha",
        maxPrice: 10000,
      },
      as("m"),
    ),
  ).request;

test("only whoever contracts can create a request and it needs title, zones and operators", () => {
  const input = {
    siteId: "s",
    kind: "monitoring" as const,
    title: "x",
    description: "",
    zoneIds: ["z"],
    invited: ["o1"],
    windowStart: "2026-11-01",
    windowEnd: "2026-11-02",
    unit: "ha" as const,
  };
  assert.equal(createRequest(input, as("o1")).ok, false);
  assert.equal(createRequest({ ...input, title: " " }, as("m")).ok, false);
  assert.equal(createRequest({ ...input, zoneIds: [] }, as("m")).ok, false);
  assert.equal(createRequest({ ...input, invited: [] }, as("m")).ok, false);
  assert.equal(
    createRequest({ ...input, windowEnd: "2026-10-01" }, as("m")).ok,
    false,
  );
  const created = ok(createRequest(input, as("g"))).request;
  assert.equal(created.status, "requested");
  assert.equal(created.events.length, 1);
});

test("the full path from request to invoice, with who can act at each step", () => {
  let request = base();
  assert.deepEqual(
    availableActions(request, "operator", "o1").map((a) => a.id),
    ["quote", "decline"],
  );
  assert.deepEqual(
    availableActions(request, "manager").map((a) => a.id),
    ["cancel"],
  );

  request = ok(
    quote(
      request,
      { price: 9500, startDate: "2026-11-03", note: "" },
      as("o1"),
    ),
  ).request;
  request = ok(
    quote(
      request,
      { price: 8200, startDate: "2026-11-05", note: "Incluye reporte" },
      as("o2"),
    ),
  ).request;
  assert.equal(request.status, "quoted");
  assert.deepEqual(
    rankedQuotes(request).map((q) => q.operatorId),
    ["o2", "o1"],
  );
  assert.ok(
    availableActions(request, "manager").some((a) => a.id === "assign"),
  );

  request = ok(assign(request, "o2", as("m"))).request;
  assert.equal(request.status, "assigned");
  assert.equal(
    request.quotes.find((q) => q.operatorId === "o1")?.state,
    "declined",
  );
  assert.deepEqual(
    availableActions(request, "operator", "o2").map((a) => a.id),
    ["schedule"],
  );
  assert.deepEqual(availableActions(request, "operator", "o1"), []);

  request = ok(
    schedule(request, { date: "2026-11-06", flightId: "f1" }, as("o2")),
  ).request;
  request = ok(
    deliver(
      request,
      { coveredHa: 150, deliverables: ["NDVI (GeoTIFF)"], note: "" },
      as("o2"),
    ),
  ).request;
  assert.equal(request.status, "delivered");
  assert.deepEqual(
    availableActions(request, "owner").map((a) => a.id),
    ["verify"],
  );

  request = ok(
    verify(request, { result: "accepted", note: "" }, as("g")),
  ).request;
  assert.equal(request.status, "verified");
  request = ok(
    invoice(request, { invoiceId: "inv-1", billedHa: 150 }, as("o2")),
  ).request;
  assert.equal(request.status, "invoiced");
  assert.equal(stepIndex("invoiced"), 6);
  assert.ok(request.events.length >= 8);
});

test("rules: wrong actor, bad inputs and dates outside the window are refused", () => {
  let request = base();
  assert.equal(
    quote(request, { price: 0, startDate: "2026-11-02", note: "" }, as("o1"))
      .ok,
    false,
  );
  assert.equal(
    quote(request, { price: 100, startDate: "", note: "" }, as("o1")).ok,
    false,
  );
  assert.equal(
    quote(request, { price: 100, startDate: "2026-11-02", note: "" }, as("m"))
      .ok,
    false,
  );
  request = ok(
    quote(
      request,
      { price: 12000, startDate: "2026-11-02", note: "" },
      as("o1"),
    ),
  ).request;
  assert.ok(
    request.events[request.events.length - 1].text.includes("supera el tope"),
  );
  assert.equal(assign(request, "o2", as("m")).ok, false);
  assert.equal(assign(request, "o1", as("o1")).ok, false);
  request = ok(assign(request, "o1", as("m"))).request;
  assert.equal(
    schedule(request, { date: "2027-01-01", flightId: "f" }, as("o1")).ok,
    false,
  );
  assert.equal(
    schedule(request, { date: "2026-11-05", flightId: "f" }, as("o2")).ok,
    false,
  );
});

test("a disputed delivery must say why and goes back to the operator", () => {
  let request = base();
  request = ok(
    quote(
      request,
      { price: 9000, startDate: "2026-11-02", note: "" },
      as("o1"),
    ),
  ).request;
  request = ok(assign(request, "o1", as("m"))).request;
  request = ok(
    schedule(request, { date: "2026-11-03", flightId: "f" }, as("o1")),
  ).request;
  assert.equal(
    deliver(request, { coveredHa: 0, deliverables: ["x"], note: "" }, as("o1"))
      .ok,
    false,
  );
  assert.equal(
    deliver(request, { coveredHa: 10, deliverables: [], note: "" }, as("o1"))
      .ok,
    false,
  );
  request = ok(
    deliver(
      request,
      { coveredHa: 100, deliverables: ["Ortomosaico"], note: "" },
      as("o1"),
    ),
  ).request;
  assert.equal(
    verify(request, { result: "disputed", note: " " }, as("m")).ok,
    false,
  );
  request = ok(
    verify(request, { result: "disputed", note: "Falta la suerte 4" }, as("m")),
  ).request;
  assert.equal(request.status, "disputed");
  assert.equal(stepIndex("disputed"), 4);
  assert.deepEqual(
    availableActions(request, "operator", "o1").map((a) => a.id),
    ["reply", "deliver"],
  );
  request = ok(
    deliver(
      request,
      {
        coveredHa: 140,
        deliverables: ["Ortomosaico"],
        note: "Se completó la suerte 4",
      },
      as("o1"),
    ),
  ).request;
  assert.equal(request.status, "delivered");
  assert.equal(request.verification, undefined);
});

test("declining and cancelling close the request when nobody is left", () => {
  let request = base();
  request = ok(decline(request, "Sin cupo", as("o1"))).request;
  assert.equal(request.status, "requested");
  request = ok(decline(request, "", as("o2"))).request;
  assert.equal(request.status, "cancelled");
  const fresh = base();
  assert.equal(
    ok(cancel(fresh, "Ya no hace falta", as("g"))).request.status,
    "cancelled",
  );
  assert.equal(cancel(fresh, "", as("o1")).ok, false);
  const done: ServiceRequest = { ...fresh, status: "delivered" };
  assert.equal(cancel(done, "", as("m")).ok, false);
});

test("a verified service without a flight can still be invoiced; without a chosen quote it says why", () => {
  let request = base();
  request = ok(
    quote(
      request,
      { price: 4000, startDate: "2026-11-02", note: "" },
      as("o1"),
    ),
  ).request;
  request = ok(
    quote(
      request,
      { price: 5000, startDate: "2026-11-03", note: "" },
      as("o2"),
    ),
  ).request;
  const withoutChoice = invoicePlan(request, { orderedHa: 100 });
  assert.equal(withoutChoice.ok, false);
  assert.ok(
    !withoutChoice.ok && withoutChoice.error.includes("cotización elegida"),
  );
  request = ok(assign(request, "o1", as("m"))).request;
  // A seed that jumped straight to «delivered»: no flight id, but it has a delivery.
  const delivered: ServiceRequest = {
    ...request,
    status: "verified",
    flightId: undefined,
    delivery: {
      coveredHa: 90,
      deliveredOn: "2026-10-24",
      note: "",
      deliverables: ["Ortomosaico"],
    },
  };
  const plan = invoicePlan(delivered, { orderedHa: 100 });
  assert.ok(plan.ok);
  assert.equal(plan.ok && plan.flightId, "");
  assert.equal(plan.ok && plan.billedHa, 90);
  assert.equal(plan.ok && plan.total, 360000);
  const more = invoicePlan(delivered, { orderedHa: 100, billedHa: 95 });
  assert.equal(more.ok && more.total, 380000);
  assert.equal(
    invoicePlan({ ...delivered, unit: "flight" }, { orderedHa: 0 }).ok &&
      (
        invoicePlan({ ...delivered, unit: "flight" }, { orderedHa: 0 }) as {
          total: number;
        }
      ).total,
    4000,
  );
  assert.ok(
    invoice(delivered, { invoiceId: "inv", billedHa: 90 }, as("o1")).ok,
  );
});

test("a quote that was not selected keeps its price and is not labelled as one the operator declined", () => {
  let request = base();
  request = ok(
    quote(
      request,
      { price: 4000, startDate: "2026-11-02", note: "" },
      as("o1"),
    ),
  ).request;
  request = ok(
    quote(
      request,
      { price: 5000, startDate: "2026-11-03", note: "" },
      as("o2"),
    ),
  ).request;
  request = ok(assign(request, "o1", as("m"))).request;
  const lost = request.quotes.find((q) => q.operatorId === "o2")!;
  assert.equal(lost.price, 5000);
  assert.equal(quoteStateLabel(lost), "No fue seleccionada");
  assert.equal(quoteStateLabel(request.quotes[0]), "Elegida");
  const withdrawn = ok(decline(base(), "Sin cupo", as("o1"))).request.quotes[0];
  assert.equal(quoteStateLabel(withdrawn), "No puede");
});

/** A request on its way to a dispute: assigned to o1, delivered with 100 ha, then returned. */
function disputed(unit: "ha" | "flight" = "ha") {
  let request: ServiceRequest = { ...base(), unit };
  request = ok(
    quote(
      request,
      { price: 9000, startDate: "2026-11-02", note: "" },
      as("o1"),
    ),
  ).request;
  request = ok(assign(request, "o1", as("m"))).request;
  request = ok(
    schedule(request, { date: "2026-11-03", flightId: "f" }, as("o1")),
  ).request;
  request = ok(
    deliver(
      request,
      {
        coveredHa: unit === "ha" ? 100 : undefined,
        deliverables: ["Ortomosaico"],
        note: "",
      },
      as("o1"),
    ),
  ).request;
  return ok(
    verify(
      request,
      { result: "disputed", note: "Cuento 8 ha menos de las declaradas" },
      as("m"),
    ),
  ).request;
}

test("accepting the adjustment lowers the hectares and sends the request back to be verified", () => {
  const request = disputed();
  const result = ok(
    reply(
      request,
      { kind: "adjusted", adjustedHa: 92, note: "", supportFiles: [] },
      as("o1"),
    ),
  ).request;
  assert.equal(result.status, "delivered");
  assert.equal(result.delivery?.coveredHa, 92);
  assert.equal(result.disputeReply?.kind, "adjusted");
  assert.equal(result.disputeReply?.previousHa, 100);
  assert.equal(result.disputeReply?.adjustedHa, 92);
  // The claim stays beside the answer, and both are in the history.
  assert.equal(result.verification?.result, "disputed");
  const last = result.events[result.events.length - 1];
  assert.equal(last.type, "replied");
  assert.equal(last.role, "operator");
  assert.ok(last.text.includes("100 ha a 92 ha"));
  assert.deepEqual(
    availableActions(result, "manager").map((a) => a.id),
    ["verify"],
  );
  // What is billed by default follows the adjusted figure.
  const verified = ok(
    verify(result, { result: "accepted", note: "" }, as("m")),
  ).request;
  const plan = invoicePlan(verified, { orderedHa: 100 });
  assert.equal(plan.ok && plan.billedHa, 92);
  assert.equal(plan.ok && plan.total, 828000);
});

test("an adjustment must lower what was declared and be a real number of hectares", () => {
  const request = disputed();
  for (const adjustedHa of [0, -3, 100, 120, NaN]) {
    const result = reply(
      request,
      { kind: "adjusted", adjustedHa, note: "", supportFiles: [] },
      as("o1"),
    );
    assert.equal(result.ok, false, String(adjustedHa));
  }
});

test("standing by the delivery needs a note and keeps the figures and the support files", () => {
  const request = disputed();
  assert.equal(
    reply(request, { kind: "upheld", note: "  ", supportFiles: [] }, as("o1"))
      .ok,
    false,
  );
  const result = ok(
    reply(
      request,
      {
        kind: "upheld",
        note: "El registro de vuelo muestra la franja norte cubierta.",
        supportFiles: [
          "Registro de vuelo (CSV)",
          " ",
          "Captura de la ruta (PNG)",
        ],
      },
      as("o1"),
    ),
  ).request;
  assert.equal(result.status, "delivered");
  assert.equal(result.delivery?.coveredHa, 100);
  assert.deepEqual(result.disputeReply?.supportFiles, [
    "Registro de vuelo (CSV)",
    "Captura de la ruta (PNG)",
  ]);
  const last = result.events[result.events.length - 1];
  assert.ok(last.text.includes("sostiene lo entregado"));
  assert.ok(last.text.includes("Captura de la ruta (PNG)"));
});

test("only the assigned operator answers, and only while the delivery is in dispute", () => {
  const request = disputed();
  const answer = {
    kind: "upheld" as const,
    note: "Está completa",
    supportFiles: [],
  };
  assert.equal(reply(request, answer, as("o2")).ok, false);
  assert.equal(reply(request, answer, as("m")).ok, false);
  assert.equal(reply(request, answer, as("g")).ok, false);
  assert.deepEqual(availableActions(request, "operator", "o2"), []);
  assert.deepEqual(
    availableActions(request, "manager").map((a) => a.id),
    [],
  );
  const answered = ok(reply(request, answer, as("o1"))).request;
  // Once answered it is no longer in dispute: a second answer is refused.
  assert.equal(reply(answered, answer, as("o1")).ok, false);
  const scheduled: ServiceRequest = { ...request, status: "scheduled" };
  assert.equal(reply(scheduled, answer, as("o1")).ok, false);
  assert.equal(
    availableActions(scheduled, "operator", "o1").some((a) => a.id === "reply"),
    false,
  );
});

test("after an answer the requester can dispute again; the answer then leaves the request but not the history", () => {
  const first = ok(
    reply(
      disputed(),
      { kind: "upheld", note: "Está completa", supportFiles: [] },
      as("o1"),
    ),
  ).request;
  const again = ok(
    verify(first, { result: "disputed", note: "Sigo sin verla" }, as("m")),
  ).request;
  assert.equal(again.status, "disputed");
  assert.equal(again.disputeReply, undefined);
  assert.ok(again.events.some((event) => event.type === "replied"));
  // Delivering again also clears the previous answer.
  const redelivered = ok(
    deliver(
      again,
      { coveredHa: 105, deliverables: ["Ortomosaico"], note: "" },
      as("o1"),
    ),
  ).request;
  assert.equal(redelivered.disputeReply, undefined);
});

test("a service priced per flight has no hectares to adjust, but can still be answered", () => {
  assert.deepEqual(replyKinds({ unit: "flight" }), ["upheld"]);
  assert.deepEqual(replyKinds({ unit: "ha" }), ["adjusted", "upheld"]);
  const request = disputed("flight");
  assert.equal(request.delivery?.coveredHa, undefined);
  assert.equal(
    reply(
      request,
      { kind: "adjusted", adjustedHa: 5, note: "", supportFiles: [] },
      as("o1"),
    ).ok,
    false,
  );
  assert.equal(
    reply(
      request,
      { kind: "upheld", note: "Se voló todo el tramo", supportFiles: [] },
      as("o1"),
    ).ok,
    true,
  );
  const delivered = ok(
    deliver(
      { ...request, status: "scheduled" },
      { coveredHa: 12, deliverables: ["Informe (PDF)"], note: "" },
      as("o1"),
    ),
  ).request;
  // Hectares typed on a per-flight service are not kept.
  assert.equal(delivered.delivery?.coveredHa, undefined);
  assert.ok(
    !delivered.events[delivered.events.length - 1].text.includes(" ha "),
  );
});

test("the reason for the choice is optional, trimmed, kept on the request and in its history", () => {
  const quoted = () =>
    ok(
      quote(
        base(),
        { price: 4000, startDate: "2026-11-02", note: "" },
        as("o1"),
      ),
    ).request;
  const without = ok(assign(quoted(), "o1", as("m"))).request;
  assert.equal(without.assignReason, undefined);
  assert.ok(!without.events[without.events.length - 1].text.includes("Motivo"));

  const withReason = ok(
    assign(quoted(), "o1", as("g"), "  La más barata y con mejor historial  "),
  ).request;
  assert.equal(withReason.assignReason, "La más barata y con mejor historial");
  assert.ok(
    withReason.events[withReason.events.length - 1].text.endsWith(
      "Motivo: La más barata y con mejor historial",
    ),
  );
  const blank = ok(assign(quoted(), "o1", as("m"), "   ")).request;
  assert.equal(blank.assignReason, undefined);
  const long = ok(assign(quoted(), "o1", as("m"), "x".repeat(400))).request;
  assert.equal(long.assignReason?.length, MAX_REASON_LENGTH);
  // The rules do not change with a reason: an operator still cannot assign.
  assert.equal(assign(quoted(), "o1", as("o1"), "yo").ok, false);
});

test("a quoted price must be positive and not absurd next to the ceiling; above the ceiling it only warns", () => {
  const request = base();
  assert.equal(checkQuotePrice(request, 0).ok, false);
  assert.equal(checkQuotePrice(request, Number.NaN).ok, false);
  // 3.600.034.000 per hectare, the slip of typing over a prefilled price.
  const slip = checkQuotePrice(request, 3_600_034_000);
  assert.equal(slip.ok, false);
  assert.ok(!slip.ok && slip.error.includes("error de digitación"));
  assert.equal(
    quote(
      request,
      { price: 3_600_034_000, startDate: "2026-11-02", note: "" },
      as("o1"),
    ).ok,
    false,
  );
  // Over the ceiling (10.000) but plausible: allowed, with a warning.
  const over = checkQuotePrice(request, 12000);
  assert.ok(over.ok && over.overCeiling && over.warning);
  const fine = checkQuotePrice(request, 9000);
  assert.ok(fine.ok && !fine.overCeiling && !fine.warning);
  // Without a ceiling a plausibility cap still stops a slip.
  assert.equal(checkQuotePrice({ unit: "ha" }, 20_000_000).ok, false);
  assert.equal(checkQuotePrice({ unit: "flight" }, 20_000_000).ok, true);
});

test("the note left when invoicing is kept in the history and can be read back", () => {
  const verified: ServiceRequest = {
    ...base(),
    status: "verified",
    operatorId: "o1",
  };
  const noted = ok(
    invoice(
      verified,
      { invoiceId: "inv", billedHa: 7, note: "  Se voló un borde extra  " },
      as("o1"),
    ),
  ).request;
  assert.equal(invoiceNote(noted), "Se voló un borde extra");
  assert.ok(noted.events.some((event) => event.type === "invoiced"));
  const plain = ok(
    invoice(verified, { invoiceId: "inv", billedHa: 7 }, as("o1")),
  ).request;
  assert.equal(invoiceNote(plain), undefined);
});
