import type { MaintenanceRecord } from "../demo/types";
import type { PartDef } from "./parts-catalog.ts";
import {
  driverOf,
  serviceRecordsOf,
  type PartUsage,
  type UsageInput,
} from "./parts-usage.ts";

export interface PartFlight {
  id: string;
  date: string;
  title: string;
  /** Minutes in the air. */
  duration: number;
  pilot: string;
}

export interface PartMarkLike {
  id: string;
  part: string;
  date: string;
  note: string;
  condition: "ok" | "watch" | "replace";
  resolvedOn?: string;
}

export interface PartEvent {
  id: string;
  date: string;
  kind: "flight" | "service" | "mark";
  title: string;
  detail: string;
  /** What the event added to the part's count, for flights. */
  amount?: string;
}

export interface WearPoint {
  date: string;
  /** Share of the interval used at that date, 0 to 1 or more. */
  fraction: number;
}

const num = (value: number, digits = 1) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(
    value,
  );

const conditionWord = {
  ok: "bueno",
  watch: "vigilar",
  replace: "cambiar",
} as const;

/**
 * What happened to one part: the flights that wore it since its last service, the services
 * that restarted it and the inspection marks, plus how its wear grew over time.
 */
export function partHistory(input: {
  part: Pick<PartDef, "id" | "group" | "es">;
  usage: PartUsage;
  usageInput: UsageInput;
  flights: PartFlight[];
  marks: PartMarkLike[];
  today: string;
}): { events: PartEvent[]; series: WearPoint[]; last?: MaintenanceRecord } {
  const { part, usage, usageInput, flights, marks, today } = input;
  const driver = driverOf(part);
  const services = serviceRecordsOf(part, usageInput) as MaintenanceRecord[];
  const last = services[0];
  const since = flights
    .filter((flight) => !last || flight.date > last.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const delta = (flight: PartFlight) =>
    driver === "hours" ? flight.duration / 60 : 1;
  const life = usage.life;
  const unit =
    driver === "hours" ? "h" : driver === "flights" ? "vuelo" : "ciclo";
  const total = since.reduce((sum, flight) => sum + delta(flight), 0);
  const start = Math.max(0, usage.value - total);
  let running = start;
  const series: WearPoint[] = [
    {
      date: last?.date ?? since[0]?.date ?? today,
      fraction: life > 0 ? start / life : 0,
    },
  ];
  const events: PartEvent[] = [];
  for (const flight of since) {
    running += delta(flight);
    series.push({ date: flight.date, fraction: life > 0 ? running / life : 0 });
    events.push({
      id: `flight-${flight.id}`,
      date: flight.date,
      kind: "flight",
      title: flight.title,
      detail: `${flight.duration} min · piloto ${flight.pilot}`,
      amount: `+${num(delta(flight), driver === "hours" ? 2 : 0)} ${unit === "vuelo" ? "vuelo" : unit}`,
    });
  }
  if (series.length > 1 || series[0].fraction > 0) {
    series.push({ date: today, fraction: life > 0 ? usage.value / life : 0 });
  }
  for (const record of services) {
    events.push({
      id: `service-${record.id}`,
      date: record.date,
      kind: "service",
      title: record.title,
      detail: `A las ${num(record.hoursAt, 0)} h${record.performedBy ? ` · ${record.performedBy}` : ""}`,
    });
  }
  for (const mark of marks.filter((item) => item.part === part.id)) {
    events.push({
      id: `mark-${mark.id}`,
      date: mark.date,
      kind: "mark",
      title: `Inspección: ${mark.resolvedOn ? "resuelta" : conditionWord[mark.condition]}`,
      detail: mark.note || "Sin nota",
    });
  }
  events.sort((a, b) => b.date.localeCompare(a.date));
  return { events, series, last };
}
