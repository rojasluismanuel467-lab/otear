import assert from "node:assert/strict";
import test from "node:test";
import {
  operatorRecord,
  readQuotes,
  referenceFor,
  suggestedCeiling,
  unstatedTopics,
} from "./quote-reading.ts";
import type { ServiceQuote, ServiceRequest } from "../demo/types";

const names: Record<string, string> = {
  a: "Aero",
  b: "Pacífico",
  c: "Tercero",
};
const nameOf = (id: string) => names[id] ?? id;

function quote(
  operatorId: string,
  price: number,
  extra: Partial<ServiceQuote> = {},
): ServiceQuote {
  return {
    operatorId,
    price,
    startDate: "2026-11-03",
    note: "",
    state: "open",
    on: "2026-10-24",
    ...extra,
  };
}

function request(
  id: string,
  extra: Partial<ServiceRequest> = {},
): ServiceRequest {
  return {
    id,
    siteId: "s",
    kind: "monitoring",
    title: id,
    description: "",
    zoneIds: ["z1"],
    requestedBy: "m",
    invited: ["a", "b"],
    windowStart: "2026-11-02",
    windowEnd: "2026-11-12",
    unit: "ha",
    status: "quoted",
    quotes: [],
    createdOn: "2026-10-23",
    events: [],
    ...extra,
  };
}

const ordered = () => 10;

// Two earlier monitoring services at 3500 and 3700, one mapping at 7200.
const past = [
  request("p1", {
    status: "invoiced",
    operatorId: "a",
    quotes: [quote("a", 3500, { state: "chosen" })],
  }),
  request("p2", {
    status: "scheduled",
    operatorId: "a",
    quotes: [quote("a", 3700, { state: "chosen" })],
  }),
  request("p3", {
    kind: "mapping",
    status: "delivered",
    operatorId: "b",
    quotes: [quote("b", 7200, { state: "chosen" })],
  }),
  request("p4", {
    status: "cancelled",
    quotes: [quote("a", 9000, { state: "chosen" })],
  }),
];

test("the reference is the median of what was agreed for the same kind and unit", () => {
  const ref = referenceFor("monitoring", "ha", past);
  assert.equal(ref?.price, 3600);
  assert.equal(ref?.low, 3500);
  assert.equal(ref?.high, 3700);
  assert.equal(ref?.count, 2);
  assert.equal(referenceFor("inspection", "ha", past), undefined);
  assert.equal(referenceFor("monitoring", "flight", past), undefined);
  assert.equal(referenceFor("monitoring", "ha", past, "p1")?.price, 3700);
});

test("the suggested ceiling is 25 % above, to the nearest hundred", () => {
  assert.equal(suggestedCeiling(3500), 4400);
  assert.equal(suggestedCeiling(3600), 4500);
});

test("flags a quote far above the reference and one over the ceiling", () => {
  const current = request("now", {
    maxPrice: 5000,
    quotes: [quote("a", 6000), quote("b", 4000)],
  });
  const reading = readQuotes({
    request: current,
    requests: [...past, current],
    orderedOf: ordered,
    nameOf,
  });
  const a = reading.assessments.find((item) => item.operatorId === "a");
  assert.equal(a?.blocked, true);
  assert.ok(
    a?.notes.some((note) => /Supera su tope de \$ 5\.000/.test(note.text)),
  );
  assert.ok(a?.notes.some((note) => /67 % por encima/.test(note.text)));
  const b = reading.assessments.find((item) => item.operatorId === "b");
  assert.equal(b?.blocked, false);
  assert.ok(b?.notes.some((note) => /11 % por encima/.test(note.text)));
  // Only one quote is left in the comparison.
  assert.equal(reading.verdict.kind, "single");
});

test("names a leader only when it is no worse on anything it can measure", () => {
  const current = request("now", {
    quotes: [
      quote("a", 3800, { startDate: "2026-11-03" }),
      quote("b", 3600, { startDate: "2026-11-03" }),
    ],
  });
  const reading = readQuotes({
    request: current,
    requests: [...past, current],
    orderedOf: ordered,
    nameOf,
  });
  assert.equal(reading.verdict.kind, "leader");
  assert.equal(
    reading.verdict.kind === "leader" && reading.verdict.operatorId,
    "b",
  );
});

test("lays out the trade-off when the cheapest starts later or did worse", () => {
  const current = request("now", {
    quotes: [
      quote("a", 6000, { startDate: "2026-11-03" }),
      quote("b", 5200, { startDate: "2026-11-06" }),
    ],
  });
  const reading = readQuotes({
    request: current,
    requests: [...past, current],
    orderedOf: ordered,
    nameOf,
  });
  assert.equal(reading.verdict.kind, "tradeoff");
  const text =
    reading.verdict.kind === "tradeoff" ? reading.verdict.lines[0] : "";
  assert.match(text, /La cotización de Pacífico es 13 % más económica/);
  assert.match(text, /\$ 8\.000 menos en total/);
  assert.match(text, /Aero empieza 3 días antes/);
});

test("a delivery below 95 % of the order weighs against an operator", () => {
  const pastWithGap = [
    request("g1", {
      status: "delivered",
      operatorId: "b",
      quotes: [quote("b", 4000, { state: "chosen" })],
      delivery: {
        coveredHa: 8.8,
        deliveredOn: "2026-10-24",
        note: "",
        deliverables: [],
      },
    }),
  ];
  const record = operatorRecord("b", pastWithGap, ordered);
  assert.ok(Math.abs((record.lastCoveragePct ?? 0) - 88) < 0.01);
  const current = request("now", {
    quotes: [quote("a", 4200), quote("b", 3900)],
  });
  const reading = readQuotes({
    request: current,
    requests: [...pastWithGap, current],
    orderedOf: ordered,
    nameOf,
  });
  const b = reading.assessments.find((item) => item.operatorId === "b");
  assert.ok(
    b?.notes.some((note) => /cubrió 88 % de lo pedido/.test(note.text)),
  );
});

test("asks about what a quote's note does not say", () => {
  const complete = quote("a", 3600, {
    note: "Incluye ortomosaico, desplazamiento, cámara RGB y repetición si hay viento.",
  });
  assert.deepEqual(unstatedTopics(request("x"), complete), []);
  const empty = quote("b", 3600);
  const keys = unstatedTopics(request("x"), empty).map((topic) => topic.key);
  assert.deepEqual(keys, ["deliverables", "travel", "redo", "sensor"]);
  assert.ok(
    unstatedTopics(request("x", { kind: "application" }), empty).some(
      (topic) => topic.key === "inputs",
    ),
  );
  const current = request("now", { quotes: [complete, empty] });
  const reading = readQuotes({
    request: current,
    requests: [current],
    orderedOf: ordered,
    nameOf,
  });
  assert.ok(reading.questions.length > 0);
  assert.ok(reading.questions.every((item) => item.operatorIds.join() === "b"));
});

test("without quotes it still offers the expected range and who has not answered", () => {
  const current = request("now", { status: "requested", quotes: [] });
  const reading = readQuotes({
    request: current,
    requests: [...past, current],
    orderedOf: ordered,
    nameOf,
  });
  assert.equal(reading.verdict.kind, "none");
  assert.equal(reading.expected?.total, 36000);
  assert.deepEqual(reading.waiting, ["a", "b"]);
});

test("a quote that starts after the window is left out of the comparison", () => {
  const current = request("now", {
    quotes: [quote("a", 3600, { startDate: "2026-11-20" }), quote("b", 4000)],
  });
  const reading = readQuotes({
    request: current,
    requests: [current],
    orderedOf: ordered,
    nameOf,
  });
  assert.equal(
    reading.assessments.find((item) => item.operatorId === "a")?.blocked,
    true,
  );
  assert.equal(reading.verdict.kind, "single");
});
