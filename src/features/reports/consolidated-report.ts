import type { Party, ServiceRequest } from "../demo/types";
import { serviceDecisionLines } from "./decisions.ts";
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
  const invoices = input.invoices.filter((invoice) =>
    ids.has(invoice.flightId),
  );
  const insights = computeInsights({
    ...input,
    flights,
    findings: allFindings,
    invoices,
  });
  const fw = input.findingWord ?? { singular: "hallazgo", plural: "hallazgos" };
  const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
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
      `Uso de baterías: ${o.batteries.map((b) => `${b.id} (${b.flights} vuelos)`).join(", ") || "sin registro"}`,
      "",
    );
  }
  if (sections.attention) {
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
