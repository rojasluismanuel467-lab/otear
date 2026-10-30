import type {
  Evidence,
  Finding,
  Flight,
  FlightDocument,
  Invoice,
  Site,
} from "../demo/types";
import {
  FOLLOW_UP_TODAY,
  dueText,
  measureList,
  summarizeFollowUps,
  type FollowUpSummary,
} from "../flights/follow-up.ts";
import { evidenceState } from "../traceability/integrity.ts";
import { itemsWithoutSupport } from "../traceability/requirements.ts";

export interface InsightInput {
  site: Site;
  flights: Flight[];
  findings: Finding[];
  invoices: Invoice[];
  documents: FlightDocument[];
  /** Hectares (or km for roads) of each zone, measured from its outline. */
  zoneMeasure: Record<string, number>;
  /** Total number of items in the pre-flight list. */
  checklistTotal: number;
  /** Signed documents and attachments that support the flights. */
  evidences?: Evidence[];
  /** The company's word for a finding (see `useTerm`), lowercase; defaults to «hallazgo(s)». */
  findingWord?: { singular: string; plural: string };
  /** The day corrective measures are read against; the demo's day by default. */
  today?: string;
}

export interface ZoneInsight {
  zoneId: string;
  name: string;
  findings: number;
  confirmed: number;
  dismissed: number;
  pending: number;
  /** Distinct completed flights that reported something in this zone. */
  flightsWithFindings: number;
}

export interface AttentionItem {
  id: string;
  tone: "danger" | "warning" | "info";
  text: string;
  href: string;
}

export interface TimelinePoint {
  flightId: string;
  date: string;
  findings: number;
  photos: number;
  minutes: number;
}

export interface SiteInsights {
  completed: Flight[];
  totals: {
    flights: number;
    hours: number;
    km: number;
    photos: number;
    findings: number;
    reviewed: number;
    pending: number;
    /** Candidates from the image assistant still waiting for a person; they are not counted above. */
    suggestionsPending: number;
  };
  /** Corrective measures by state; unreviewed suggestions and dismissed findings are out. */
  measures: FollowUpSummary;
  byZone: ZoneInsight[];
  timeline: TimelinePoint[];
  attention: AttentionItem[];
  operation: {
    windyFlights: number;
    flightsWithLog: number;
    incidents: number;
    batteries: { id: string; flights: number }[];
  };
  cost: {
    billed: number;
    paid: number;
    perFlight: number;
    /** Cost per hectare (km for roads) flown; null when no zone was measured. */
    perUnit: number | null;
    unit: "ha" | "km";
    /**
     * What `perUnit` divides: the invoices tied to a completed flight, over the area of the flights
     * that have at least one such invoice (each flight adds its whole area). Flights without an
     * invoice do not enter the denominator.
     */
    perUnitBasis: { invoices: number; flights: number; billed: number };
  };
}

const WINDY_KMH = 25;
const RECURRENCE_MIN_FLIGHTS = 3;

function money(value: number) {
  return `$ ${Math.round(value).toLocaleString("es-CO")}`;
}

/**
 * Findings of each zone, most first. Counts only what a person has seen or confirmed: pass the
 * findings without the image assistant's unreviewed suggestions.
 */
export function findingsByZone(
  site: Pick<Site, "zones">,
  findings: Finding[],
  flights: Flight[],
): ZoneInsight[] {
  const completedIds = new Set(
    flights
      .filter((flight) => flight.status === "completed")
      .map((flight) => flight.id),
  );
  return site.zones
    .map((zone) => {
      const inZone = findings.filter((finding) => finding.zoneId === zone.id);
      return {
        zoneId: zone.id,
        name: zone.name,
        findings: inZone.length,
        confirmed: inZone.filter((f) => f.status === "confirmed").length,
        dismissed: inZone.filter((f) => f.status === "dismissed").length,
        pending: inZone.filter((f) => f.status === "pending").length,
        flightsWithFindings: new Set(
          inZone
            .filter((f) => completedIds.has(f.flightId))
            .map((f) => f.flightId),
        ).size,
      };
    })
    .sort((a, b) => b.findings - a.findings);
}

/** Findings that count as the site's own: everything except unreviewed suggestions. */
export function ownFindings(findings: Finding[]) {
  return findings.filter(
    (finding) => !(finding.suggestion && finding.status === "pending"),
  );
}

export function computeInsights(input: InsightInput): SiteInsights {
  const { site, flights, invoices, documents, zoneMeasure } = input;
  // An unreviewed suggestion is not yet a finding of the site: it stays out of every count here.
  const suggestionsPending = input.findings.filter(
    (finding) => finding.suggestion && finding.status === "pending",
  ).length;
  const findings = ownFindings(input.findings);
  const completed = flights
    .filter((flight) => flight.status === "completed")
    .sort((a, b) => a.date.localeCompare(b.date));
  const completedIds = new Set(completed.map((flight) => flight.id));
  const reviewed = findings.filter((finding) => finding.status !== "pending");
  const pending = findings.filter((finding) => finding.status === "pending");

  const byZone = findingsByZone(site, findings, flights);

  const timeline = completed.map((flight) => ({
    flightId: flight.id,
    date: flight.date,
    findings: findings.filter((finding) => finding.flightId === flight.id)
      .length,
    photos: flight.photoCount,
    minutes: flight.duration,
  }));

  const batteryCount = new Map<string, number>();
  for (const flight of completed) {
    for (const battery of flight.log?.batteries ?? []) {
      batteryCount.set(battery, (batteryCount.get(battery) ?? 0) + 1);
    }
  }
  const withLog = completed.filter((flight) => flight.log);
  const operation = {
    windyFlights: withLog.filter((f) => (f.log?.windKmh ?? 0) >= WINDY_KMH)
      .length,
    flightsWithLog: withLog.length,
    incidents: withLog.filter((f) => f.log?.incidents.trim()).length,
    batteries: [...batteryCount.entries()]
      .map(([id, count]) => ({ id, flights: count }))
      .sort((a, b) => b.flights - a.flights || a.id.localeCompare(b.id)),
  };

  const billed = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paid = invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const unit: "ha" | "km" = site.sector === "roads" ? "km" : "ha";
  const invoicedFlights = completed.filter((flight) =>
    invoices.some((invoice) => invoice.flightId === flight.id),
  );
  const basisBilled = invoices
    .filter((invoice) => completedIds.has(invoice.flightId))
    .reduce((sum, invoice) => sum + invoice.total, 0);
  const flown = invoicedFlights.reduce(
    (sum, flight) =>
      sum + flight.zoneIds.reduce((acc, id) => acc + (zoneMeasure[id] ?? 0), 0),
    0,
  );

  const word = input.findingWord ?? {
    singular: "hallazgo",
    plural: "hallazgos",
  };
  const attention: AttentionItem[] = [];
  const highPending = pending.filter((finding) => finding.priority === "high");
  if (highPending.length) {
    attention.push({
      id: "high-pending",
      tone: "danger",
      text: `${highPending.length} ${highPending.length === 1 ? `${word.singular} de prioridad alta sigue` : `${word.plural} de prioridad alta siguen`} por revisar.`,
      href: "/vuelos",
    });
  }
  const today = input.today ?? FOLLOW_UP_TODAY;
  const measures = summarizeFollowUps(findings, today);
  if (measures.overdue) {
    const [worst] = measureList(findings, today, "overdue");
    attention.push({
      id: "overdue-measures",
      tone: "danger",
      text:
        `${measures.overdue} ${measures.overdue === 1 ? "medida correctiva vencida" : "medidas correctivas vencidas"}. ` +
        `La más atrasada: ${worst.finding.title}${worst.finding.locationLabel ? ` (${worst.finding.locationLabel})` : ""}, ` +
        `responsable ${worst.followUp.owner}, ${dueText(worst.followUp, today).toLowerCase()}.`,
      href: "/vuelos?tab=hallazgos",
    });
  }
  for (const document of documents) {
    if (document.status === "expired") {
      attention.push({
        id: `doc-${document.id}`,
        tone: "danger",
        text: `${document.title} (${document.subject}) tiene la fecha declarada vencida.`,
        href: "/documentos",
      });
    } else if (document.status === "missing") {
      attention.push({
        id: `doc-${document.id}`,
        tone: "warning",
        text: `${document.title} no tiene archivo asociado.`,
        href: "/documentos",
      });
    } else if (document.status === "pending") {
      attention.push({
        id: `doc-${document.id}`,
        tone: "warning",
        text: `${document.title} espera revisión.`,
        href: "/documentos",
      });
    }
  }
  const withBalance = invoices.filter(
    (invoice) => invoice.paid < invoice.total,
  );
  for (const invoice of withBalance) {
    attention.push({
      id: `inv-${invoice.id}`,
      tone: "warning",
      text: `${invoice.reference} tiene un saldo de ${money(invoice.total - invoice.paid)}.`,
      href: "/pagos",
    });
  }
  for (const flight of flights.filter((f) => f.status === "scheduled")) {
    if (flight.checklist.length < input.checklistTotal) {
      attention.push({
        id: `prep-${flight.id}`,
        tone: "info",
        text: `${flight.title} (${flight.date}): preparación ${flight.checklist.length} de ${input.checklistTotal}.`,
        href: "/programacion",
      });
    }
  }
  const evidences = input.evidences ?? [];
  const documentsInOrder =
    documents.length > 0 && documents.every((doc) => doc.status === "reviewed");
  if (input.evidences) {
    for (const flight of flights.filter((f) => f.status === "scheduled")) {
      const missing = itemsWithoutSupport(flight, evidences, documentsInOrder);
      if (missing.length) {
        attention.push({
          id: `support-${flight.id}`,
          tone: "warning",
          text: `${flight.title} (${flight.date}): ${missing.length} ${missing.length === 1 ? "ítem marcado no tiene" : "ítems marcados no tienen"} soporte completo.`,
          href: "/programacion",
        });
      }
    }
    for (const flight of completed) {
      const acceptance = evidences.find(
        (entry) =>
          entry.flightId === flight.id &&
          entry.templateId === "delivery-acceptance",
      );
      const state = acceptance ? evidenceState(acceptance) : undefined;
      if (state && state.status !== "signed" && state.missingRoles.length) {
        attention.push({
          id: `accept-${flight.id}`,
          tone: "warning",
          text: `El acta de entrega del ${flight.date} espera la firma de: ${state.missingRoles.join(", ")}.`,
          href: "/pagos",
        });
      }
    }
  }
  const unlogged = completed.filter((flight) => !flight.log);
  if (unlogged.length) {
    attention.push({
      id: "no-log",
      tone: "info",
      text: `${unlogged.length} ${unlogged.length === 1 ? "vuelo completado no tiene" : "vuelos completados no tienen"} bitácora.`,
      href: "/programacion",
    });
  }
  for (const zone of byZone) {
    if (zone.flightsWithFindings >= RECURRENCE_MIN_FLIGHTS) {
      attention.push({
        id: `rec-${zone.zoneId}`,
        tone: "info",
        text: `${zone.name} reportó ${word.plural} en ${zone.flightsWithFindings} vuelos distintos: conviene buscar la causa y no solo confirmar cada uno.`,
        href: "/vuelos",
      });
    }
  }

  return {
    completed,
    totals: {
      flights: completed.length,
      hours: completed.reduce((sum, f) => sum + f.duration, 0) / 60,
      km: completed.reduce((sum, f) => sum + f.distance, 0),
      photos: completed.reduce((sum, f) => sum + f.photoCount, 0),
      findings: findings.length,
      reviewed: reviewed.length,
      pending: pending.length,
      suggestionsPending,
    },
    measures,
    byZone,
    timeline,
    attention,
    operation,
    cost: {
      billed,
      paid,
      perFlight: completed.length ? billed / completed.length : 0,
      perUnit: flown > 0 ? basisBilled / flown : null,
      unit,
      perUnitBasis: {
        invoices: invoices.filter((invoice) =>
          completedIds.has(invoice.flightId),
        ).length,
        flights: invoicedFlights.length,
        billed: basisBilled,
      },
    },
  };
}

export type FindingTrend = "new" | "persistent";

export interface FindingComparison {
  trend: FindingTrend;
  /** Earlier completed flights that reported the same kind of finding in the same zone. */
  earlierFlights: number;
}

/**
 * Compares a finding against the findings of earlier completed flights.
 * "persistent" means the same title was already reported in the same zone.
 */
export function compareWithHistory(
  finding: Finding,
  findings: Finding[],
  flights: Flight[],
): FindingComparison {
  const flight = flights.find((item) => item.id === finding.flightId);
  if (!flight) return { trend: "new", earlierFlights: 0 };
  const earlier = new Set(
    findings
      .filter((other) => {
        if (other.id === finding.id) return false;
        if (other.zoneId !== finding.zoneId || other.title !== finding.title) {
          return false;
        }
        const otherFlight = flights.find((item) => item.id === other.flightId);
        return (
          otherFlight !== undefined &&
          otherFlight.status === "completed" &&
          otherFlight.date < flight.date
        );
      })
      .map((other) => other.flightId),
  );
  return {
    trend: earlier.size ? "persistent" : "new",
    earlierFlights: earlier.size,
  };
}
