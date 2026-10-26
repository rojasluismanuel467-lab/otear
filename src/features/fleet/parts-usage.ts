import type { MaintenanceRecord, PlanTask } from "../demo/types";
import type { PartDef } from "./parts-catalog.ts";

/** Flights per flight hour assumed to turn an hours interval into a flights interval. */
export const FLIGHTS_PER_HOUR = 1.5;

export type UsageDriver = "hours" | "flights" | "cycles";

export interface UsageInput {
  /** Total flight hours of the aircraft. */
  hours: number;
  /** Completed flights of this aircraft. */
  flights: { date: string }[];
  /** Maintenance records of this aircraft. */
  records: Pick<MaintenanceRecord, "date" | "hoursAt" | "taskId" | "partId">[];
  plan: PlanTask[];
  /** Active battery packs with their cycles so far and their limit. */
  batteries: { cycles: number; maxCycles: number }[];
}

export interface PartUsage {
  partId: string;
  driver: UsageDriver;
  /** Hours, flights or cycles since the part was last serviced or replaced. */
  value: number;
  /** The same unit for the interval the usage is compared with; 0 if unknown. */
  life: number;
  /** Share of that interval used, 0 to 1 or more. */
  fraction: number;
  /** Where the interval comes from. */
  basis: string;
  text: string;
}

const PROPELLER_IDS = new Set([
  "propellers",
  "propeller",
  "propeller-adapters",
]);
const BATTERY_IDS = new Set(["battery"]);

/** Plan task whose interval a part is compared with: propellers have their own. */
export function taskOf(
  part: Pick<PartDef, "id">,
  plan: PlanTask[],
): PlanTask | undefined {
  return plan.find(
    (task) =>
      task.id === (PROPELLER_IDS.has(part.id) ? "propellers" : "periodic"),
  );
}

/** Records that restarted the part's count, newest first. */
export function serviceRecordsOf(
  part: Pick<PartDef, "id">,
  input: Pick<UsageInput, "records" | "plan">,
) {
  const task = taskOf(part, input.plan);
  return input.records
    .filter(
      (record) =>
        record.partId === part.id || (task && record.taskId === task.id),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** What wears each part: running time, take-offs and landings, or charge cycles. */
export function driverOf(part: Pick<PartDef, "id" | "group">): UsageDriver {
  if (BATTERY_IDS.has(part.id)) return "cycles";
  if (part.group === "structure" || part.group === "ports") return "flights";
  if (part.group === "power") return "flights";
  return "hours";
}

const num = (value: number, digits = 0) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(
    value,
  );

/** Usage of every part since it was last serviced or replaced, as a share of its interval. */
export function usageFor(
  parts: Pick<PartDef, "id" | "group">[],
  input: UsageInput,
): Record<string, PartUsage> {
  const periodic = input.plan.find((task) => task.id === "periodic");
  const result: Record<string, PartUsage> = {};
  const cycles = input.batteries.length
    ? input.batteries.reduce((sum, pack) => sum + pack.cycles, 0) /
      input.batteries.length
    : 0;
  const maxCycles = input.batteries.length
    ? input.batteries.reduce((sum, pack) => sum + pack.maxCycles, 0) /
      input.batteries.length
    : 0;

  for (const part of parts) {
    const driver = driverOf(part);
    const task = taskOf(part, input.plan);
    const last = serviceRecordsOf(part, input)[0];

    let value: number;
    let life: number;
    let basis: string;
    if (driver === "cycles") {
      value = cycles;
      life = maxCycles;
      basis = "ciclos medios de las baterías frente a su límite";
    } else if (driver === "hours") {
      value = Math.max(0, input.hours - (last?.hoursAt ?? 0));
      life = task?.everyHours ?? 0;
      basis = task
        ? `intervalo del plan: ${task.title.toLowerCase()}`
        : "sin intervalo en el plan";
    } else {
      value = last
        ? input.flights.filter((flight) => flight.date > last.date).length
        : input.flights.length;
      life = (periodic?.everyHours ?? 0) * FLIGHTS_PER_HOUR;
      basis = `intervalo de la inspección periódica con ${FLIGHTS_PER_HOUR} vuelos por hora (supuesto)`;
    }
    const fraction = life > 0 ? value / life : 0;
    const unit =
      driver === "hours" ? "h" : driver === "flights" ? "vuelos" : "ciclos";
    result[part.id] = {
      partId: part.id,
      driver,
      value,
      life,
      fraction,
      basis,
      text:
        life > 0
          ? `${num(value, driver === "hours" ? 0 : 0)} ${unit} de ${num(life)} (${num(Math.min(fraction, 9.99) * 100)} %)`
          : `${num(value)} ${unit}, sin intervalo para comparar`,
    };
  }
  return result;
}

const stops: [number, [number, number, number]][] = [
  [0, [59, 130, 246]],
  [0.35, [34, 195, 176]],
  [0.65, [245, 197, 24]],
  [1, [239, 108, 26]],
];

/**
 * Position of each part between the least and the most used of the aircraft, 0 to 1, so
 * colours show the contrast between parts even when every one is still inside its interval.
 */
export function relativeUse(
  usage: Record<string, PartUsage>,
  /** Parts the scale is taken from, for example the ones shown on the model. */
  scale?: Set<string>,
): Record<string, number> {
  const all = Object.values(usage).filter((item) => item.life > 0);
  const inScale = all.filter((item) => scale?.has(item.partId));
  const measured = inScale.length > 1 ? inScale : all;
  const min = Math.min(...measured.map((item) => item.fraction));
  const max = Math.max(...measured.map((item) => item.fraction));
  return Object.fromEntries(
    Object.values(usage).map((item) => [
      item.partId,
      item.life <= 0
        ? 0
        : max > min
          ? Math.min(1, Math.max(0, (item.fraction - min) / (max - min)))
          : 0.5,
    ]),
  );
}

/** Blue for little use, through teal and yellow, to orange for a full interval. */
export function heatColor(fraction: number): string {
  const t = Math.max(0, Math.min(1, fraction));
  let i = 1;
  while (i < stops.length - 1 && t > stops[i][0]) i += 1;
  const [t0, c0] = stops[i - 1];
  const [t1, c1] = stops[i];
  const k = (t - t0) / (t1 - t0);
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${[0, 1, 2].map((j) => hex(c0[j] + (c1[j] - c0[j]) * k)).join("")}`;
}
