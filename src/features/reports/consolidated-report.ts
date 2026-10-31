import type { Party, ServiceRequest } from "../demo/types";
import { isFeminine } from "../flights/finding-words.ts";
import {
  FOLLOW_UP_TODAY,
  dayText,
  followUpLine,
  measureList,
  measuresText,
  summarizeFollowUps,
} from "../flights/follow-up.ts";
import { signedRecordRows, signingSummary } from "../compliance/signed-rows.ts";
import { requestInPeriod, serviceDecisionLines } from "./decisions.ts";
import { computeInsights, ownFindings, type InsightInput } from "./insights.ts";
import { operatorSummaries } from "./operators.ts";

export interface ReportSections {
  summary: boolean;
  flights: boolean;
  zones: boolean;
  operation: boolean;
  attention: boolean;
  costs: boolean;
  /** Service requests, quote chosen, delivery, check and invoice; off when missing. */
  services?: boolean;
  /** Corrective measures on the findings: who answers, by when, what is late, what was closed. */
  followUp?: boolean;
}

/** What the consolidated report reads: the insights' input plus the contracting records. */
export interface ConsolidatedInput extends InsightInput {
  serviceRequests?: ServiceRequest[];
  parties?: Party[];
}

const weatherLabels = { clear: "despejado", cloudy: "nublado", rain: "lluvia" };

function date(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function number(value: number, digits = 1) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: digits,
  }).format(value);
}

function money(value: number) {
  return `$ ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)} COP`;
}

/** Plain-text consolidated report for the flights between `from` and `to` (inclusive). */
export function buildConsolidatedReport(
  input: ConsolidatedInput,
  period: { from: string; to: string },
  sections: ReportSections,
): string {
  const flights = input.flights.filter(
    (flight) => flight.date >= period.from && flight.date <= period.to,
  );
  const ids = new Set(flights.map((flight) => flight.id));
  const allFindings = input.findings.filter((finding) =>
    ids.has(finding.flightId),
  );
  // Unreviewed suggestions of the image assistant are not counted; the report says how many.
  const findings = ownFindings(allFindings);
  const suggested = allFindings.length - findings.length;
  // The invoices of the period's flights, and those of services invoiced without a flight whose
  // request is in the period: the same ones the cost figures of Informes count.
  const requestsInPeriod = (input.serviceRequests ?? []).filter((request) =>
    requestInPeriod(request, period),
  );
  const invoices = input.invoices.filter(
    (invoice) =>
      ids.has(invoice.flightId) ||
      (!input.flights.some((flight) => flight.id === invoice.flightId) &&
        requestsInPeriod.some((request) => request.invoiceId === invoice.id)),
  );
  const insights = computeInsights({
    ...input,
    flights,
    findings: allFindings,
    invoices,
  });
  const fw = input.findingWord ?? { singular: "hallazgo", plural: "hallazgos" };
  const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
  const confirmed = (count: number) =>
    `confirmad${isFeminine(fw.singular) ? "a" : "o"}${count === 1 ? "" : "s"}`;
  const unit = insights.cost.unit;
  const lines: string[] = [
    "OTEAR — INFORME CONSOLIDADO · BORRADOR DE DEMOSTRACIÓN",
    "Datos de ejemplo: los nombres, las cifras y las facturas son inventados. No es un informe técnico ni una certificación de una operación real.",
    "",
    `${input.site.name} · ${input.site.sectorLabel}`,
    `Periodo: ${date(period.from)} a ${date(period.to)}`,
    "",
  ];
  if (!insights.completed.length) {
    lines.push("No hay vuelos completados en este periodo.");
    return lines.join("\n");
  }
  if (sections.summary) {
    const t = insights.totals;
    lines.push(
      "RESUMEN",
      `Vuelos completados: ${t.flights} · ${number(t.hours)} h · ${number(t.km)} km · ${t.photos} fotografías`,
      `${cap(fw.plural)}: ${t.findings} (${t.reviewed} revisados, ${t.pending} por revisar)` +
        (suggested
          ? `. Se excluyen ${suggested} ${suggested === 1 ? "sugerencia" : "sugerencias"} de IA que nadie ha revisado todavía.`
          : ""),
      "",
    );
  }
  if (sections.flights) {
    lines.push("VUELOS");
    for (const flight of insights.completed) {
      const log = flight.log;
      const count = findings.filter((f) => f.flightId === flight.id).length;
      lines.push(
        `- ${date(flight.date)} · ${flight.title} · ${flight.duration} min · ${number(flight.distance)} km · ${flight.photoCount} fotos · ${count} ${count === 1 ? fw.singular : fw.plural}` +
          (log
            ? ` · ${weatherLabels[log.weather]}, viento ${log.windKmh} km/h · baterías ${log.batteries.join(", ") || "sin registro"}`
            : " · sin bitácora"),
      );
    }
    lines.push("");
  }
  if (sections.zones) {
    lines.push(
      `${fw.plural.toUpperCase()} POR ${input.site.zoneLabel.toUpperCase()}`,
    );
    for (const zone of insights.byZone.filter((item) => item.findings > 0)) {
      lines.push(
        `- ${zone.name}: ${zone.findings} (${zone.confirmed} confirmados, ${zone.dismissed} descartados, ${zone.pending} por revisar) en ${zone.flightsWithFindings} vuelos`,
      );
    }
    lines.push("");
  }
  if (sections.followUp) {
    const today = input.today ?? FOLLOW_UP_TODAY;
    // Every site measure still pending, whenever it was opened, and the ones closed in the period.
    const siteFindings = ownFindings(input.findings);
    const shown = measureList(siteFindings, today).filter(
      (measure) =>
        measure.followUp.status !== "closed" ||
        ((measure.followUp.closedOn ?? "") >= period.from &&
          (measure.followUp.closedOn ?? "") <= period.to),
    );
    const m = summarizeFollowUps(siteFindings, today);
    lines.push(
      `SEGUIMIENTO DE MEDIDAS CORRECTIVAS (a ${dayText(today)}, día de la demostración)`,
      `${measuresText(m)}` +
        (m.withoutMeasure
          ? ` · ${m.withoutMeasure} ${m.withoutMeasure === 1 ? fw.singular : fw.plural} ${confirmed(m.withoutMeasure)} sin responsable`
          : ""),
    );
    for (const { finding, followUp } of shown) {
      const place =
        finding.locationLabel ??
        input.site.zones.find((zone) => zone.id === finding.zoneId)?.name ??
        "";
      lines.push(
        `- ${finding.title}${place ? ` (${place})` : ""}: ${followUpLine(finding, today)}`,
      );
      if (followUp.closure) lines.push(`  Cierre: ${followUp.closure}`);
    }
    if (!shown.length) lines.push("- Sin medidas en seguimiento.");
    lines.push(
      "Las medidas y su historial son un registro de esta demostración: no se notificó a nadie.",
      "",
    );
  }
  if (sections.operation) {
    const o = insights.operation;
    lines.push(
      "OPERACIÓN",
      `Vuelos con viento de 25 km/h o más: ${o.windyFlights} de ${o.flightsWithLog} con bitácora`,
      `Vuelos con incidentes registrados: ${o.incidents}`,
    );
    for (const flight of insights.completed.filter((f) =>
      f.log?.incidents.trim(),
    )) {
      lines.push(`  · ${date(flight.date)}: ${flight.log?.incidents}`);
    }
    lines.push(
      `Uso de baterías: ${o.batteries.map((b) => `${b.id} (${b.flights} ${b.flights === 1 ? "vuelo" : "vuelos"})`).join(", ") || "sin registro"}`,
      "",
    );
  }
  if (sections.attention) {
    // What was signed (and what is still missing) on the flights of the period, by document.
    const records = signedRecordRows(input.evidences ?? [], flights);
    if (input.evidences) {
      lines.push("INFORMES Y ACTAS DE LOS VUELOS (FIRMAS)");
      for (const row of records) {
        lines.push(
          `- ${row.title} · ${row.flightTitle} (${date(row.flightDate)}): ${row.statusLabel.toLowerCase()}. ${signingSummary(row)}`,
        );
      }
      if (!records.length) {
        lines.push("- Ningún informe ni acta guardado para estos vuelos.");
      }
      lines.push(
        "Las firmas son de ejemplo, sin valor legal; la demostración no verifica la identidad de quien firma.",
        "",
      );
    }
    lines.push("PENDIENTES Y ALERTAS");
    for (const item of insights.attention) lines.push(`- ${item.text}`);
    if (!insights.attention.length) lines.push("- Sin pendientes.");
    lines.push("");
  }
  if (sections.costs) {
    const c = insights.cost;
    lines.push(
      "COSTOS",
      `Facturado: ${money(c.billed)} · pagado: ${money(c.paid)}`,
      `Por vuelo: ${money(c.perFlight)}` +
        (c.perUnit !== null
          ? ` · por ${unit} sobrevolada: ${money(c.perUnit)} (${c.perUnitBasis.invoices} ${c.perUnitBasis.invoices === 1 ? "factura" : "facturas"} de ${c.perUnitBasis.flights} ${c.perUnitBasis.flights === 1 ? "vuelo" : "vuelos"}; no es la tarifa pactada en Servicios)`
          : ""),
      "",
    );
  }
  if (sections.services) {
    lines.push(
      "SERVICIOS CONTRATADOS Y DECISIONES",
      ...serviceDecisionLines({
        site: input.site,
        requests: input.serviceRequests ?? [],
        parties: input.parties ?? [],
        invoices: input.invoices.filter(
          (invoice) => invoice.siteId === input.site.id,
        ),
        flights: input.flights,
        zoneMeasure: input.zoneMeasure,
        operators: operatorSummaries({
          flights: input.flights,
          findings: input.findings,
          invoices: input.invoices,
          requests: input.serviceRequests,
          zones: input.site.zones,
          sector: input.site.sector,
        }),
        period,
      }),
      "",
    );
  }
  lines.push(
    "LÍMITES",
    "Cifras calculadas con los datos de la sesión de demostración; no incluyen análisis de IA ni mediciones de campo.",
    "La revisión humana de cada hallazgo sigue siendo necesaria.",
  );
  return lines.join("\n");
}
