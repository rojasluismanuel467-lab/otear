import type { Finding, Flight, Sector, Site } from "../demo/types";

export type IndicatorKind = "progress" | "vigor" | "count";

export interface Indicator {
  kind: IndicatorKind;
  label: string;
  /** Short name of the value, used in sentences ("avance", "vigor"). */
  noun: string;
}

export function indicatorFor(sector: Sector): Indicator {
  if (sector === "agriculture")
    return { kind: "vigor", label: "Vigor del cultivo (NDVI)", noun: "vigor" };
  if (sector === "construction" || sector === "roads") {
    return { kind: "progress", label: "Avance de obra", noun: "avance" };
  }
  return { kind: "count", label: "Novedades por vuelo", noun: "novedades" };
}

export interface CapturePoint {
  flightId: string;
  date: string;
  values: Record<string, number>;
  levels?: number;
  /** Average of the zone values: percent, vigor or count. */
  mean: number;
  controlPoints?: boolean;
  gsdCm?: number;
}

/** One point per completed flight, in date order. Security sites use findings per zone. */
export function buildCaptures(
  site: Site,
  flights: Flight[],
  findings: Finding[],
): CapturePoint[] {
  const indicator = indicatorFor(site.sector);
  return flights
    .filter((flight) => flight.status === "completed")
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((flight) => {
      let values = flight.capture?.values;
      if (indicator.kind === "count") {
        values = Object.fromEntries(
          site.zones.map((zone) => [
            zone.id,
            findings.filter(
              (item) => item.flightId === flight.id && item.zoneId === zone.id,
            ).length,
          ]),
        );
      }
      if (!values || !Object.keys(values).length) return [];
      const list = Object.values(values);
      return [
        {
          flightId: flight.id,
          date: flight.date,
          values,
          levels: flight.capture?.levels,
          mean: list.reduce((sum, value) => sum + value, 0) / list.length,
          controlPoints: flight.log?.controlPoints,
          gsdCm: flight.log?.gsdCm,
        },
      ];
    });
}

const DAY_MS = 86_400_000;
const days = (from: string, to: string) =>
  (new Date(`${to}T12:00:00`).getTime() -
    new Date(`${from}T12:00:00`).getTime()) /
  DAY_MS;

/** Expected value at a date if the work advanced evenly between the planned start and end. */
export function plannedAt(
  schedule: { start: string; end: string },
  date: string,
  target = 100,
) {
  const total = days(schedule.start, schedule.end);
  if (total <= 0) return target;
  return Math.max(0, Math.min(1, days(schedule.start, date) / total)) * target;
}

export interface Pace {
  perDay: number;
  /** Date when the target would be reached at this pace, if it ever is. */
  projectedEnd?: string;
}

/** Linear pace over the last `window` captures, and the date the target would be reached. */
export function paceOf(
  series: { date: string; value: number }[],
  target: number,
  window = 3,
): Pace | undefined {
  const recent = series.slice(-window);
  if (recent.length < 2) return undefined;
  const first = recent[0];
  const last = recent[recent.length - 1];
  const elapsed = days(first.date, last.date);
  if (elapsed <= 0) return undefined;
  const perDay = (last.value - first.value) / elapsed;
  if (perDay <= 0 || last.value >= target) return { perDay };
  const end = new Date(
    new Date(`${last.date}T12:00:00`).getTime() +
      ((target - last.value) / perDay) * DAY_MS,
  );
  return { perDay, projectedEnd: end.toISOString().slice(0, 10) };
}

/** Zones that gained less than `minGain` over the last `captures` captures and are not finished. */
export function stalledZones(
  points: CapturePoint[],
  zoneIds: string[],
  options: { captures?: number; minGain?: number; finished?: number } = {},
): string[] {
  const { captures = 2, minGain = 8, finished = 100 } = options;
  if (points.length < captures + 1) return [];
  const last = points[points.length - 1];
  const before = points[points.length - 1 - captures];
  return zoneIds.filter((id) => {
    const now = last.values[id];
    const then = before.values[id];
    return (
      now !== undefined &&
      then !== undefined &&
      now < finished &&
      now - then < minGain
    );
  });
}

/** Zones whose vigor fell on each of the last `captures` consecutive captures. */
export function sustainedDeclines(
  points: CapturePoint[],
  zoneIds: string[],
  options: { captures?: number; minDrop?: number } = {},
): string[] {
  const { captures = 2, minDrop = 0.03 } = options;
  if (points.length < captures + 1) return [];
  const window = points.slice(-(captures + 1));
  return zoneIds.filter((id) =>
    window.slice(1).every((point, index) => {
      const previous = window[index].values[id];
      const current = point.values[id];
      return (
        previous !== undefined &&
        current !== undefined &&
        previous - current >= minDrop
      );
    }),
  );
}

export type Reliability = {
  level: "high" | "medium" | "unknown";
  text: string;
};

/**
 * How far to trust a difference between two captures. Repeat-survey variance is about
 * 2 to 5 cm with ground control points and 5 to 15 cm with RTK alone (vendor figures,
 * planning values only), so small changes are noise unless both flights used control points.
 */
export function comparisonReliability(
  a: CapturePoint,
  b: CapturePoint,
): Reliability {
  if (a.controlPoints === undefined || b.controlPoints === undefined) {
    return {
      level: "unknown",
      text: "Falta registrar si hubo puntos de control en alguno de los dos vuelos.",
    };
  }
  if (a.controlPoints && b.controlPoints) {
    return {
      level: "high",
      text: "Ambos vuelos usaron puntos de control: cambios de unos 5 cm ya se distinguen del ruido.",
    };
  }
  return {
    level: "medium",
    text: "Al menos un vuelo no usó puntos de control: tome como fiables solo cambios grandes (más de 15 cm).",
  };
}

export const phases = [
  { max: 25, label: "Movimiento de tierras", color: "#b5654a" },
  { max: 50, label: "Subbase", color: "#c28b2c" },
  { max: 75, label: "Base", color: "#8a9a3a" },
  { max: 99.9, label: "Carpeta asfáltica", color: "#3f7f9c" },
  { max: Infinity, label: "Terminado", color: "#2f7d5b" },
];

export function phaseOf(percent: number) {
  return (
    phases.find((phase) => percent < phase.max) ?? phases[phases.length - 1]
  );
}

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

/** Red to yellow to green, for vigor between 0.3 and 0.85. */
export function vigorColor(value: number) {
  const t = Math.max(0, Math.min(1, (value - 0.3) / 0.55));
  const low = [181, 101, 74];
  const mid = [217, 180, 74];
  const high = [47, 125, 91];
  const [from, to, k] =
    t < 0.5 ? [low, mid, t * 2] : [mid, high, (t - 0.5) * 2];
  return `rgb(${lerp(from[0], to[0], k)}, ${lerp(from[1], to[1], k)}, ${lerp(from[2], to[2], k)})`;
}

/** Soft green scale for counts, from none (pale) to many (dark). */
export function countColor(value: number, max: number) {
  const t = max > 0 ? Math.min(1, value / max) : 0;
  return `rgb(${lerp(226, 181, t)}, ${lerp(235, 101, t)}, ${lerp(226, 74, t)})`;
}
