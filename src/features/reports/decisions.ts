import type {
  Flight,
  Invoice,
  Party,
  ServiceRequest,
  Site,
} from "../demo/types";
import { quoteTotal } from "../services/workflow.ts";
import type { OperatorSummary } from "./operators.ts";

/**
 * What was decided, in order, for the consolidated report: each service request with its quotes,
 * the one chosen, the delivery, the check and the invoice, plus the plans an assistant proposed
 * and a person approved, and the hectares ordered, declared and billed per operator.
 * Everything comes from the session's state; the reason for choosing a quote is whatever the person
 * wrote when assigning (it is optional), and when they wrote none the text says so instead of
 * inventing one.
 */

export interface DecisionInput {
  site: Pick<Site, "name" | "sector" | "zones">;
  requests: ServiceRequest[];
  parties: Party[];
  invoices: Invoice[];
  flights: Flight[];
  /** Hectares (or km for roads) of each zone. */
  zoneMeasure: Record<string, number>;
  operators: OperatorSummary[];
  period: { from: string; to: string };
}

const date = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
const number = (value: number, digits = 1) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(
    value,
  );
const money = (value: number) =>
  `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)} COP`;

const statusText: Record<ServiceRequest["status"], string> = {
  requested: "solicitado",
  quoted: "con cotizaciones",
  assigned: "asignado",
  scheduled: "con vuelo programado",
  delivered: "entregado",
  disputed: "en disputa",
  verified: "verificado",
  invoiced: "facturado",
  cancelled: "cancelado",
};
const kindText: Record<ServiceRequest["kind"], string> = {
  monitoring: "monitoreo",
  application: "aplicación aérea",
  mapping: "mapeo",
  inspection: "inspección",
};

/** The text ends in one full stop, whether the person who wrote it typed one or not. */
const endSentence = (text: string) => `${text.trim().replace(/[.\s]+$/, "")}.`;

/**
 * The period the consolidated report opens with: from the earliest flight or request to the latest
 * thing that happened, whether a flight, a request, a step of a service or the demo's own «today»,
 * so what was just decided is in the report without moving the end date by hand.
 */
export function defaultReportPeriod(input: {
  flightDates: string[];
  requests: Pick<ServiceRequest, "createdOn" | "events">[];
  /** The demo's «today» (DEMO_DATE). */
  today: string;
}): { from: string; to: string } {
  const starts = [
    ...input.flightDates,
    ...input.requests.map((request) => request.createdOn),
  ]
    .filter(Boolean)
    .sort();
  const ends = [
    ...starts,
    ...input.requests.flatMap((request) =>
      request.events.map((event) => event.on),
    ),
    input.today,
  ].sort();
  return { from: starts[0] ?? input.today, to: ends[ends.length - 1] };
}

/** Requests with something that happened after `to`, which the period leaves out. */
export function requestsAfter(
  requests: Pick<ServiceRequest, "createdOn" | "events">[],
  to: string,
) {
  return requests.filter(
    (request) =>
      request.createdOn > to || request.events.some((event) => event.on > to),
  );
}

/** The latest date on which any of these requests was made or moved. */
export function latestMovement(
  requests: Pick<ServiceRequest, "createdOn" | "events">[],
) {
  return requests
    .flatMap((request) => [
      request.createdOn,
      ...request.events.map((event) => event.on),
    ])
    .sort()
    .reduce((latest, day) => (day > latest ? day : latest), "");
}

/** A request belongs to the period when it was made, or anything happened to it, within it. */
export function requestInPeriod(
  request: ServiceRequest,
  period: { from: string; to: string },
) {
  const within = (value: string) => value >= period.from && value <= period.to;
  return (
    within(request.createdOn) ||
    request.events.some((event) => within(event.on))
  );
}

export function serviceDecisionLines(input: DecisionInput): string[] {
  const { site, parties, zoneMeasure } = input;
  const name = (id: string | undefined) =>
    parties.find((party) => party.id === id)?.name ?? "Sin nombre";
  // Who acted, as a name; a value that is not a known party is already a name (older records).
  const who = (id: string) =>
    parties.find((party) => party.id === id)?.name ?? id;
  const roads = site.sector === "roads";
  const requests = input.requests
    .filter((request) => requestInPeriod(request, input.period))
    .sort((a, b) => a.createdOn.localeCompare(b.createdOn));
  const lines: string[] = [];
  const planned = input.flights.filter(
    (flight) =>
      flight.origin &&
      flight.date >= input.period.from &&
      flight.date <= input.period.to,
  );
  if (!requests.length && !planned.length) {
    lines.push(
      `No hay solicitudes de servicio ni propuestas de IA aprobadas de ${site.name} en este periodo.`,
    );
    return lines;
  }
  lines.push(`Solo de ${site.name}; otros sitios no se incluyen.`);

  for (const request of requests) {
    const zoneNames = request.zoneIds
      .map((id) => site.zones.find((zone) => zone.id === id)?.name ?? id)
      .join(", ");
    const ordered = request.zoneIds.reduce(
      (sum, id) => sum + (zoneMeasure[id] ?? 0),
      0,
    );
    const orderedText = roads
      ? `${number(ordered)} km`
      : `${number(ordered)} ha`;
    const unitText = request.unit === "ha" ? "por ha" : "por vuelo";
    lines.push(
      `- ${request.title} (${kindText[request.kind]}) · ${statusText[request.status]} · pedido el ${date(request.createdOn)} por ${who(request.requestedBy)}`,
      `  Qué se pidió: ${zoneNames || "sin zonas"} · ${orderedText} · entre el ${date(request.windowStart)} y el ${date(request.windowEnd)}` +
        (request.maxPrice
          ? ` · tope ${money(request.maxPrice)} ${unitText}`
          : ""),
    );
    const received = request.quotes;
    if (received.length) {
      lines.push(
        `  Cotizaciones: ${received.length} (${received
          .map(
            (quote) =>
              `${name(quote.operatorId)} ${money(quote.price)} ${unitText}`,
          )
          .join("; ")})`,
      );
    } else {
      lines.push("  Cotizaciones: ninguna todavía.");
    }
    const chosen = received.find((quote) => quote.state === "chosen");
    if (chosen) {
      const total = quoteTotal(request, chosen, ordered);
      lines.push(
        `  Cotización elegida: ${name(chosen.operatorId)} a ${money(chosen.price)} ${unitText}` +
          (request.unit === "ha" && !roads
            ? ` (${money(total)} para ${orderedText})`
            : "") +
          (request.assignReason
            ? `. Motivo de la elección: ${endSentence(request.assignReason)}`
            : `. Sin motivo anotado al elegir (es opcional).`),
      );
    }
    if (request.delivery) {
      lines.push(
        request.delivery.coveredHa === undefined
          ? `  Entrega: ${name(request.operatorId)} entregó el ${date(request.delivery.deliveredOn)}.`
          : `  Entrega: ${name(request.operatorId)} declaró ${number(request.delivery.coveredHa)} ha cubiertas el ${date(request.delivery.deliveredOn)} (cifra declarada por el operador, no medida por Otear).`,
      );
    }
    if (request.verification) {
      lines.push(
        `  Verificación: ${request.verification.result === "accepted" ? "aceptada" : "en disputa"} el ${date(request.verification.on)} por ${who(request.verification.by)}` +
          (request.verification.result === "disputed" &&
          request.verification.note
            ? `: ${request.verification.note}.`
            : "."),
      );
    }
    const answer = request.disputeReply;
    if (answer) {
      lines.push(
        `  Respuesta del operador a la disputa (${date(answer.on)}): ` +
          (answer.kind === "adjusted"
            ? `aceptó el ajuste, de ${number(answer.previousHa ?? 0)} a ${number(answer.adjustedHa ?? 0)} ha`
            : "sostuvo lo entregado") +
          (answer.note ? `. ${endSentence(answer.note)}` : ".") +
          (answer.supportFiles.length
            ? ` Soportes anotados: ${answer.supportFiles.join(", ")}.`
            : ""),
      );
    }
    const invoice = input.invoices.find(
      (item) => item.id === request.invoiceId,
    );
    if (invoice) {
      lines.push(
        `  Factura ${invoice.reference}: ${money(invoice.total)}, pagado ${money(invoice.paid)}, saldo ${money(invoice.total - invoice.paid)}` +
          (invoice.billedHa !== undefined
            ? ` · facturó ${number(invoice.billedHa)} ha`
            : " · sin área facturada"),
      );
    }
  }

  // Same rows as the operator table in Informes: every invoice of the site that states an area,
  // with the hectares ordered, declared and billed taken over those same invoices.
  const withOps = input.operators.filter(
    (row) => row.invoicesWithArea > 0 || row.coveredHa > 0,
  );
  if (withOps.length && !roads) {
    lines.push(
      "",
      "Hectáreas por operador, de todas las facturas del sitio con área (pedidas / declaradas cubiertas / facturadas)",
    );
    for (const row of withOps) {
      const over = row.coveredHa - row.orderedHa;
      lines.push(
        `- ${row.operator}: ${row.orderedHa ? number(row.orderedHa) : "—"} / ${row.coveredHa ? number(row.coveredHa) : "—"} / ${row.billedHa ? number(row.billedHa) : "—"} ha` +
          (row.invoices
            ? ` · ${row.invoicesWithArea} de ${row.invoices} facturas traen área`
            : "") +
          (row.orderedHa > 0 && over > 0.05
            ? ` · declaró ${number(over)} ha más de las que miden las zonas pedidas`
            : "") +
          (row.invoicesWithoutCovered
            ? ` · ${row.invoicesWithoutCovered} sin hectáreas cubiertas declaradas`
            : ""),
      );
    }
  }

  if (planned.length) {
    lines.push("", "Propuestas de IA aprobadas por una persona");
    for (const flight of planned) {
      lines.push(
        `- ${flight.title} (${date(flight.date)}): propuesta de IA aprobada el ${date(flight.origin!.approvedOn)}. Razones: ${endSentence(flight.origin!.reasons.join("; "))}`,
      );
    }
  }
  return lines;
}
