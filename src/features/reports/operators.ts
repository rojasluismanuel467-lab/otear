import type { Finding, Flight, Invoice, ServiceRequest } from "../demo/types";
import { coveredHaFor } from "../services/links.ts";

export interface OperatorSummary {
  operator: string;
  flights: number;
  hours: number;
  /** Findings of its flights and how many were confirmed or discarded after review. */
  findings: number;
  confirmed: number;
  dismissed: number;
  pending: number;
  billed: number;
  paid: number;
  balance: number;
  /** Hectares covered (from its flight records) and billed on the invoices that state an area. */
  coveredHa: number;
  billedHa: number;
  /** Invoices where the billed area exceeds the covered area by more than the tolerance. */
  overBilled: number;
  /** Billed money per hectare billed, when areas are stated. */
  perHa: number | null;
  lastFlight?: string;
}

/**
 * One row per operator that flew for the company: what it delivered, what it charged and how
 * its billed area compares with the area it reports having covered. Useful when the company
 * buys flights from more than one provider; with one provider it is a summary of that one.
 */
export function operatorSummaries(input: {
  flights: Flight[];
  findings: Finding[];
  invoices: Invoice[];
  /** Service requests, whose deliveries also state the hectares covered. */
  requests?: ServiceRequest[];
  tolerancePct?: number;
}): OperatorSummary[] {
  const tolerance = input.tolerancePct ?? 5;
  const rows = new Map<string, OperatorSummary>();
  const row = (operator: string) => {
    let current = rows.get(operator);
    if (!current) {
      current = {
        operator,
        flights: 0,
        hours: 0,
        findings: 0,
        confirmed: 0,
        dismissed: 0,
        pending: 0,
        billed: 0,
        paid: 0,
        balance: 0,
        coveredHa: 0,
        billedHa: 0,
        overBilled: 0,
        perHa: null,
      };
      rows.set(operator, current);
    }
    return current;
  };
  const byFlight = new Map(input.flights.map((flight) => [flight.id, flight]));
  for (const flight of input.flights.filter(
    (item) => item.status === "completed",
  )) {
    const summary = row(flight.operator);
    summary.flights += 1;
    summary.hours += flight.duration / 60;
    if (!summary.lastFlight || flight.date > summary.lastFlight)
      summary.lastFlight = flight.date;
    // Suggestions from the image assistant are not the operator's observations.
    for (const finding of input.findings.filter(
      (item) => item.flightId === flight.id && !item.suggestion,
    )) {
      summary.findings += 1;
      if (finding.status === "confirmed") summary.confirmed += 1;
      else if (finding.status === "dismissed") summary.dismissed += 1;
      else summary.pending += 1;
    }
  }
  const moneyHa = new Map<string, { money: number; ha: number }>();
  for (const invoice of input.invoices) {
    const flight = byFlight.get(invoice.flightId);
    const summary = row(invoice.operator || flight?.operator || "Sin operador");
    summary.billed += invoice.total;
    summary.paid += invoice.paid;
    summary.balance += invoice.total - invoice.paid;
    if (invoice.billedHa !== undefined) {
      summary.billedHa += invoice.billedHa;
      const covered = coveredHaFor(flight, input.requests ?? []);
      if (covered !== undefined) {
        summary.coveredHa += covered;
        if (
          covered > 0 &&
          ((invoice.billedHa - covered) / covered) * 100 > tolerance
        )
          summary.overBilled += 1;
      }
      const acc = moneyHa.get(summary.operator) ?? { money: 0, ha: 0 };
      acc.money += invoice.total;
      acc.ha += invoice.billedHa;
      moneyHa.set(summary.operator, acc);
    }
  }
  for (const [operator, acc] of moneyHa) {
    if (acc.ha > 0) row(operator).perHa = acc.money / acc.ha;
  }
  return [...rows.values()].sort(
    (a, b) => b.flights - a.flights || a.operator.localeCompare(b.operator),
  );
}
