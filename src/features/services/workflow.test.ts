import assert from "node:assert/strict";
import test from "node:test";
import {
  assign,
  availableActions,
  cancel,
  createRequest,
  decline,
  deliver,
  invoice,
  invoicePlan,
  quote,
  quoteStateLabel,
  rankedQuotes,
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
    ["deliver"],
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
