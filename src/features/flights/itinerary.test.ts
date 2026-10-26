import assert from "node:assert/strict";
import test from "node:test";
import { buildItinerary } from "./itinerary.ts";
import { newEvidence, withSignature } from "../traceability/integrity.ts";
import type { Flight, Invoice } from "../demo/types";

const flight = {
  id: "f",
  siteId: "s",
  status: "completed",
  route: [
    [0, 0],
    [1, 1],
  ],
  zoneIds: ["z"],
  checklist: [],
  duration: 30,
  photoCount: 10,
} as unknown as Flight;

const base = {
  flight,
  findings: [],
  invoices: [] as Invoice[],
  documents: [],
  evidences: [],
  checklistTotal: 16,
};

test("a planned flight with nothing else leaves the rest to do", () => {
  const stages = buildItinerary({
    ...base,
    flight: { ...flight, status: "scheduled" },
  });
  assert.equal(stages.length, 7);
  assert.equal(stages[0].state, "done");
  assert.equal(stages[3].state, "todo");
  assert.equal(stages[6].state, "todo");
});

test("delivery needs both signatures and payment follows the invoices", () => {
  let act = newEvidence(
    {
      siteId: "s",
      flightId: "f",
      kind: "drafted",
      templateId: "delivery-acceptance",
      title: "Acta",
      fields: {
        deliverables: "x",
        date: "2026-10-24",
        result: "A satisfacción",
      },
    },
    "2026-10-24T10:00:00Z",
  );
  act = withSignature(
    act,
    { role: "Operador", name: "A", documentId: "1", method: "typed" },
    "2026-10-24T10:01:00Z",
  );
  const partial = buildItinerary({ ...base, evidences: [act] });
  assert.equal(partial[5].state, "partial");
  assert.ok(partial[5].detail.includes("Cliente o responsable"));
  act = withSignature(
    act,
    {
      role: "Cliente o responsable",
      name: "B",
      documentId: "2",
      method: "typed",
    },
    "2026-10-24T10:02:00Z",
  );
  const invoice = {
    id: "i",
    siteId: "s",
    flightId: "f",
    reference: "FV",
    description: "",
    operator: "",
    total: 100,
    paid: 100,
    dueDate: "",
  };
  const done = buildItinerary({
    ...base,
    evidences: [act],
    invoices: [invoice],
  });
  assert.equal(done[5].state, "done");
  assert.equal(done[6].state, "done");
});
