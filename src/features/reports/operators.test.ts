import assert from "node:assert/strict";
import test from "node:test";
import { operatorSummaries } from "./operators.ts";
import type {
  Finding,
  Flight,
  Invoice,
  ServiceRequest,
} from "../demo/types";

const flight = (id: string, operator: string, extra: Partial<Flight> = {}) =>
  ({
    id,
    operator,
    status: "completed",
    duration: 60,
    date: "2026-10-01",
    ...extra,
  }) as Flight;
const finding = (id: string, flightId: string, status: Finding["status"]) =>
  ({ id, flightId, status }) as Finding;
const invoice = (
  id: string,
  flightId: string,
  operator: string,
  total: number,
  paid: number,
  billedHa?: number,
) => ({ id, flightId, operator, total, paid, billedHa }) as Invoice;

test("each operator gets its flights, review outcomes and money", () => {
  const rows = operatorSummaries({
    flights: [
      flight("a", "Norte", { duration: 90 }),
      flight("b", "Norte", { date: "2026-10-05" }),
      flight("c", "Sur"),
      flight("d", "Sur", { status: "scheduled" }),
    ],
    findings: [
      finding("1", "a", "confirmed"),
      finding("2", "a", "dismissed"),
      finding("3", "b", "pending"),
      finding("4", "c", "confirmed"),
    ],
    invoices: [
      invoice("i1", "a", "Norte", 1000, 400),
      invoice("i2", "c", "Sur", 500, 500),
    ],
  });
  const north = rows.find((row) => row.operator === "Norte")!;
  assert.equal(rows[0].operator, "Norte");
  assert.equal(north.flights, 2);
  assert.equal(north.hours, 2.5);
  assert.deepEqual(
    [north.findings, north.confirmed, north.dismissed, north.pending],
    [3, 1, 1, 1],
  );
  assert.deepEqual([north.billed, north.paid, north.balance], [1000, 400, 600]);
  assert.equal(north.lastFlight, "2026-10-05");
  assert.equal(rows.find((row) => row.operator === "Sur")?.flights, 1);
});

test("billed area is compared with covered area and cost per hectare is reported", () => {
  const rows = operatorSummaries({
    flights: [
      flight("a", "Norte", { log: { coveredHa: 100 } as Flight["log"] }),
      flight("b", "Norte", { log: { coveredHa: 100 } as Flight["log"] }),
    ],
    findings: [],
    invoices: [
      invoice("i1", "a", "Norte", 2000000, 0, 110),
      invoice("i2", "b", "Norte", 1000000, 0, 100),
    ],
  });
  const north = rows[0];
  assert.equal(north.billedHa, 210);
  assert.equal(north.coveredHa, 200);
  assert.equal(north.overBilled, 1);
  assert.ok(north.perHa && Math.abs(north.perHa - 3000000 / 210) < 1e-6);
});

const square = (size: number): [number, number][] => [
  [-76, 3],
  [-76 + size, 3],
  [-76 + size, 3 + size],
  [-76, 3 + size],
];

test("a service invoiced without a flight takes covered and ordered hectares from its delivery and zones", () => {
  const request = {
    id: "r",
    invoiceId: "i1",
    zoneIds: ["z1"],
    delivery: { coveredHa: 6.4 },
  } as ServiceRequest;
  const rows = operatorSummaries({
    flights: [],
    findings: [],
    invoices: [invoice("i1", "", "Pacífico", 192000, 0, 7)],
    requests: [request],
    zones: [{ id: "z1", outline: square(0.0065) }],
    sector: "agriculture",
  });
  const row = rows[0];
  // Billed 7 ha against 6.4 declared: the delivery counts, so it is not «7 / 0 ha».
  assert.equal(row.billedHa, 7);
  assert.equal(row.coveredHa, 6.4);
  assert.equal(row.overBilled, 1);
  assert.equal(row.invoicesWithoutCovered, 0);
  assert.ok(row.orderedHa > 0);
});

test("an invoice with an area but no declared hectares anywhere is counted, not hidden", () => {
  const rows = operatorSummaries({
    flights: [],
    findings: [],
    invoices: [invoice("i1", "", "Pacífico", 100, 0, 5)],
    requests: [],
  });
  assert.equal(rows[0].coveredHa, 0);
  assert.equal(rows[0].invoicesWithoutCovered, 1);
});

test("an operator with invoices but no flights still appears", () => {
  const rows = operatorSummaries({
    flights: [],
    findings: [],
    invoices: [invoice("i1", "x", "Otro", 10, 0)],
  });
  assert.equal(rows[0].operator, "Otro");
  assert.equal(rows[0].perHa, null);
});

test("cost per hectare uses only the invoices that state an area, and says how many they are", () => {
  const rows = operatorSummaries({
    flights: [flight("a", "Norte"), flight("b", "Norte")],
    findings: [],
    invoices: [
      invoice("i1", "a", "Norte", 850000, 400000, 25),
      invoice("i2", "a", "Norte", 620000, 620000),
      invoice("i3", "b", "Norte", 1000000, 0),
    ],
  });
  const north = rows[0];
  assert.equal(north.invoices, 3);
  assert.equal(north.invoicesWithArea, 1);
  // The money of the three invoices is billed, but only the first one enters the quotient.
  assert.equal(north.billed, 2470000);
  assert.equal(north.billedWithArea, 850000);
  assert.equal(north.perHa, 850000 / 25);
});
