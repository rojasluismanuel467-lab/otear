import {
  centerOf,
  fromLocalMeters,
  polygonAreaHa,
  toLocalMeters,
  type LocalXY,
} from "../../lib/geo.ts";
import { distanceToSegment, rayInside } from "./mission-plan.ts";
import type { Position } from "../demo/types";

/**
 * A flight turned into something that can be played back: where the aircraft is, which way it
 * points, how fast and how high at every second, when it took a photo and when it passed each
 * finding. It is built from the planned route (corners rounded to a turning radius, a speed
 * that drops in the turns, time scaled to the flight's recorded duration), so it is an
 * illustration of the route and never a recording; `source` says so, and a real track read from
 * the operator's file would take the same shape with `source: "operator"`.
 */

type XY = LocalXY;

export type TrackSource = "planned" | "operator";
export type Phase = "takeoff" | "transit" | "survey" | "return" | "landing";

export const phaseLabels: Record<Phase, string> = {
  takeoff: "Despegue",
  transit: "Traslado a la zona",
  survey: "Recorrido",
  return: "Regreso",
  landing: "Aterrizaje",
};

export interface TrackPoint {
  /** Seconds from the start. */
  t: number;
  position: Position;
  /** Direction of travel in radians, east = 0, counter-clockwise, continuous (not wrapped). */
  heading: number;
  speedMs: number;
  altM: number;
  /** Metres flown since take-off. */
  distM: number;
  /** Phase of the stretch that starts at this point. */
  phase: Phase;
  /** Whether the stretch that starts here is a survey (photos are taken along it). */
  survey: boolean;
}

export interface TrackEvent {
  id: string;
  t: number;
  kind: "takeoff" | "survey" | "finding" | "return" | "landing";
  label: string;
  findingId?: string;
}

export interface Track {
  source: TrackSource;
  points: TrackPoint[];
  /** Seconds. */
  duration: number;
  events: TrackEvent[];
  photoTimes: number[];
  heightM: number;
  swathM: number;
  surveyM: number;
  /** For polygon zones: the time at which each sampled cell is first reached, sorted. */
  cellTimes: Float32Array;
  cellCount: number;
  orderedHa: number;
}

export interface TrackInput {
  route: Position[];
  durationMin: number;
  heightM: number;
  swathM: number;
  /** Photos taken; 0 spaces them by `photoSpacingM`. */
  photoCount: number;
  photoSpacingM: number;
  cruiseMs?: number;
  turnRadiusM?: number;
  findings?: { id: string; title: string; position: Position }[];
  /** Zones whose area is measured (not roads or fences). */
  zones?: { id: string; outline: Position[] }[];
}

const DEFAULT_CRUISE_MS = 8;
const DEFAULT_TURN_RADIUS_M = 12;
/** Lateral acceleration allowed in a turn, which sets how much the aircraft slows down. */
const LATERAL_ACCEL = 3;
const MIN_SPEED_MS = 2;
const ARC_STEP_M = 3;
const MAX_CELLS = 6000;

const sub = (a: XY, b: XY): XY => [a[0] - b[0], a[1] - b[1]];
const add = (a: XY, b: XY): XY => [a[0] + b[0], a[1] + b[1]];
const scale = (a: XY, k: number): XY => [a[0] * k, a[1] * k];
const gap = (a: XY, b: XY) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const unit = (a: XY): XY => {
  const l = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / l, a[1] / l];
};

interface Raw {
  p: XY;
  /** Turning radius at this point (Infinity on a straight). */
  radius: number;
  /** Whether the stretch that starts here is survey. */
  survey: boolean;
}

/** The route with every corner replaced by an arc of at most `radius` metres. */
function roundCorners(route: XY[], radius: number): Raw[] {
  const n = route.length;
  // Only the first leg (to the work) and the last (home) are not survey.
  const legSurvey = (k: number) => n < 4 || (k >= 1 && k <= n - 3);
  const out: Raw[] = [];
  /** Where the current straight stretch begins. */
  let start = route[0];
  for (let i = 1; i < n; i += 1) {
    const here = route[i];
    const next = route[i + 1];
    out.push({ p: start, radius: Infinity, survey: legSurvey(i - 1) });
    if (!next) {
      out.push({ p: here, radius: Infinity, survey: false });
      break;
    }
    const along = unit(sub(here, start));
    const after = unit(sub(next, here));
    const cross = along[0] * after[1] - along[1] * after[0];
    const turn = Math.atan2(
      Math.abs(cross),
      along[0] * after[0] + along[1] * after[1],
    );
    if (turn < 0.05) {
      start = here;
      continue;
    }
    // The tangent length is capped so the arc fits inside both neighbouring legs.
    const room = Math.min(gap(start, here), gap(here, next)) / 2;
    const tangent = Math.min(radius * Math.tan(turn / 2), room);
    const r = tangent / Math.tan(turn / 2);
    const entry = sub(here, scale(along, tangent));
    const sign = cross >= 0 ? 1 : -1;
    const normal: XY = [-along[1] * sign, along[0] * sign];
    const centre = add(entry, scale(normal, r));
    const from = Math.atan2(entry[1] - centre[1], entry[0] - centre[0]);
    const steps = Math.max(3, Math.ceil((turn * r) / ARC_STEP_M));
    const arcSurvey = legSurvey(i - 1) && legSurvey(i);
    for (let s = 0; s <= steps; s += 1) {
      const angle = from + sign * turn * (s / steps);
      out.push({
        p: [centre[0] + Math.cos(angle) * r, centre[1] + Math.sin(angle) * r],
        radius: r,
        // The arc ends where the next straight leg begins.
        survey: s === steps ? legSurvey(i) : arcSurvey,
      });
    }
    start = out[out.length - 1].p;
    out.pop();
  }
  return out.filter(
    (raw, index) => index === 0 || gap(raw.p, out[index - 1].p) > 0.01,
  );
}

export function buildTrack(input: TrackInput): Track {
  const duration = Math.max(1, input.durationMin * 60);
  const empty: Track = {
    source: "planned",
    points: [],
    duration,
    events: [],
    photoTimes: [],
    heightM: input.heightM,
    swathM: input.swathM,
    surveyM: 0,
    cellTimes: new Float32Array(),
    cellCount: 0,
    orderedHa: 0,
  };
  if (input.route.length < 2) return empty;

  const origin = centerOf(input.route);
  const route = toLocalMeters(input.route, origin);
  const raws = roundCorners(route, input.turnRadiusM ?? DEFAULT_TURN_RADIUS_M);
  if (raws.length < 2) return empty;
  const cruise = input.cruiseMs ?? DEFAULT_CRUISE_MS;
  const speedAt = (radius: number) =>
    Math.max(MIN_SPEED_MS, Math.min(cruise, Math.sqrt(LATERAL_ACCEL * radius)));

  // Nominal times along the route, then scaled so the whole flight lasts `duration`.
  const hold = Math.min(45, duration * 0.08);
  const nominal: number[] = [0];
  const dist: number[] = [0];
  for (let i = 1; i < raws.length; i += 1) {
    const d = gap(raws[i].p, raws[i - 1].p);
    const v = (speedAt(raws[i - 1].radius) + speedAt(raws[i].radius)) / 2;
    nominal.push(nominal[i - 1] + d / v);
    dist.push(dist[i - 1] + d);
  }
  const routeSeconds = duration - 2 * hold;
  const k = routeSeconds / (nominal[nominal.length - 1] || 1);

  const last = raws.length - 1;
  const firstSurvey = raws.findIndex((raw) => raw.survey);
  const lastSurveyEnd = raws.reduce(
    (best, raw, index) => (raw.survey ? index + 1 : best),
    -1,
  );
  const phaseOf = (index: number, survey: boolean): Phase => {
    if (survey) return "survey";
    if (firstSurvey < 0) return "transit";
    return index < firstSurvey ? "transit" : "return";
  };

  const headings: number[] = [];
  let unwrapped = 0;
  for (let i = 0; i < raws.length; i += 1) {
    const a = raws[Math.min(i, last - 1)].p;
    const b = raws[Math.min(i, last - 1) + 1].p;
    const wanted = Math.atan2(b[1] - a[1], b[0] - a[0]);
    if (i === 0) unwrapped = wanted;
    else
      unwrapped += Math.atan2(
        Math.sin(wanted - unwrapped),
        Math.cos(wanted - unwrapped),
      );
    headings.push(unwrapped);
  }

  const positions = fromLocalMeters(
    raws.map((raw) => raw.p),
    origin,
  );
  const points: TrackPoint[] = [];
  const push = (point: TrackPoint) => points.push(point);
  push({
    t: 0,
    position: positions[0],
    heading: headings[0],
    speedMs: 0,
    altM: 0,
    distM: 0,
    phase: "takeoff",
    survey: false,
  });
  raws.forEach((raw, i) => {
    push({
      t: hold + nominal[i] * k,
      position: positions[i],
      heading: headings[i],
      speedMs: (speedAt(raw.radius) * 1) / k,
      altM: input.heightM,
      distM: dist[i],
      phase: i === last ? "landing" : phaseOf(i, raw.survey),
      survey: i === last ? false : raw.survey,
    });
  });
  const end = points[points.length - 1];
  push({
    t: duration,
    position: end.position,
    heading: end.heading,
    speedMs: 0,
    altM: 0,
    distM: end.distM,
    phase: "landing",
    survey: false,
  });
  // It starts from rest at take-off and ends at rest on landing.
  points[1] = { ...points[1], speedMs: 0 };
  points[points.length - 2] = { ...points[points.length - 2], speedMs: 0 };

  // Survey length and the moments photos are taken along it.
  let surveyM = 0;
  for (let i = 1; i < points.length - 1; i += 1)
    if (points[i].survey) surveyM += points[i + 1].distM - points[i].distM;
  const count =
    input.photoCount > 0
      ? input.photoCount
      : Math.max(1, Math.floor(surveyM / input.photoSpacingM) + 1);
  const spacing = surveyM / Math.max(1, count);
  const photoTimes: number[] = [];
  let flown = 0;
  let next = 0;
  for (let i = 1; i < points.length - 1 && photoTimes.length < count; i += 1) {
    if (!points[i].survey) continue;
    const length = points[i + 1].distM - points[i].distM;
    while (photoTimes.length < count && next <= flown + length + 1e-9) {
      const share = length > 0 ? (next - flown) / length : 0;
      photoTimes.push(
        points[i].t + (points[i + 1].t - points[i].t) * Math.max(0, share),
      );
      next += spacing;
    }
    flown += length;
  }

  // Events: take-off, start of survey, each finding at its closest pass, return, landing.
  const events: TrackEvent[] = [
    { id: "takeoff", t: 0, kind: "takeoff", label: "Despegue" },
  ];
  if (firstSurvey >= 0)
    events.push({
      id: "survey",
      t: points[firstSurvey + 1].t,
      kind: "survey",
      label: "Inicio del recorrido",
    });
  (input.findings ?? []).forEach((finding) => {
    const [target] = toLocalMeters([finding.position], origin);
    let best = -1;
    let bestGap = Infinity;
    raws.forEach((raw, i) => {
      if (!raw.survey) return;
      const d = gap(raw.p, target);
      if (d < bestGap) {
        best = i;
        bestGap = d;
      }
    });
    if (best >= 0)
      events.push({
        id: `finding-${finding.id}`,
        t: points[best + 1].t,
        kind: "finding",
        label: finding.title,
        findingId: finding.id,
      });
  });
  if (lastSurveyEnd >= 0 && lastSurveyEnd < raws.length)
    events.push({
      id: "return",
      t: points[Math.min(lastSurveyEnd, last) + 1].t,
      kind: "return",
      label: "Regreso al punto de despegue",
    });
  events.push({
    id: "landing",
    t: points[points.length - 2].t,
    kind: "landing",
    label: "Aterrizaje",
  });
  events.sort((a, b) => a.t - b.t);

  // The time each sampled cell of the zones is first inside the photos' reach.
  const rings = (input.zones ?? [])
    .filter((zone) => zone.outline.length >= 3)
    .map((zone) => toLocalMeters(zone.outline, origin));
  const orderedHa = (input.zones ?? [])
    .filter((zone) => zone.outline.length >= 3)
    .reduce((sum, zone) => sum + polygonAreaHa(zone.outline), 0);
  const times: number[] = [];
  let cellCount = 0;
  if (rings.length) {
    const area = orderedHa * 10_000;
    const cell = Math.max(5, Math.sqrt(area / MAX_CELLS));
    const reach = input.swathM / 2;
    const segments: { a: XY; b: XY; t0: number; t1: number }[] = [];
    for (let i = 1; i < points.length - 1; i += 1) {
      if (!points[i].survey) continue;
      segments.push({
        a: raws[i - 1].p,
        b: raws[i].p,
        t0: points[i].t,
        t1: points[i + 1].t,
      });
    }
    rings.forEach((ring) => {
      const xs = ring.map((point) => point[0]);
      const ys = ring.map((point) => point[1]);
      for (let x = Math.min(...xs) + cell / 2; x < Math.max(...xs); x += cell) {
        for (
          let y = Math.min(...ys) + cell / 2;
          y < Math.max(...ys);
          y += cell
        ) {
          if (!rayInside([x, y], ring)) continue;
          cellCount += 1;
          for (const segment of segments) {
            if (distanceToSegment([x, y], segment.a, segment.b) > reach)
              continue;
            const ab = sub(segment.b, segment.a);
            const length2 = ab[0] * ab[0] + ab[1] * ab[1];
            const share = length2
              ? Math.max(
                  0,
                  Math.min(
                    1,
                    ((x - segment.a[0]) * ab[0] + (y - segment.a[1]) * ab[1]) /
                      length2,
                  ),
                )
              : 0;
            times.push(segment.t0 + (segment.t1 - segment.t0) * share);
            break;
          }
        }
      }
    });
  }

  return {
    source: "planned",
    points,
    duration,
    events,
    photoTimes,
    heightM: input.heightM,
    swathM: input.swathM,
    surveyM,
    cellTimes: Float32Array.from(times).sort(),
    cellCount,
    orderedHa,
  };
}

export interface TrackState {
  t: number;
  position: Position;
  heading: number;
  speedMs: number;
  altM: number;
  distM: number;
  phase: Phase;
  photos: number;
  /** Share (0–1) of the area of the zones reached so far; 0 when none is measured. */
  coveredShare: number;
  coveredHa: number;
}

function countUpTo(sorted: ArrayLike<number>, t: number) {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (sorted[middle] <= t) low = middle + 1;
    else high = middle;
  }
  return low;
}

/** Index of the last point at or before `t`. */
export function indexAt(track: Track, t: number) {
  const { points } = track;
  let low = 0;
  let high = points.length - 1;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (points[middle].t <= t) low = middle;
    else high = middle - 1;
  }
  return low;
}

export function stateAt(track: Track, time: number): TrackState {
  const t = Math.min(track.duration, Math.max(0, time));
  const { points } = track;
  if (!points.length) {
    return {
      t,
      position: [0, 0],
      heading: 0,
      speedMs: 0,
      altM: 0,
      distM: 0,
      phase: "takeoff",
      photos: 0,
      coveredShare: 0,
      coveredHa: 0,
    };
  }
  const i = indexAt(track, t);
  const a = points[i];
  const b = points[Math.min(i + 1, points.length - 1)];
  const span = b.t - a.t;
  const k = span > 0 ? (t - a.t) / span : 0;
  const mix = (x: number, y: number) => x + (y - x) * k;
  const share =
    track.cellCount > 0 ? countUpTo(track.cellTimes, t) / track.cellCount : 0;
  return {
    t,
    position: [
      mix(a.position[0], b.position[0]),
      mix(a.position[1], b.position[1]),
    ],
    heading: mix(a.heading, b.heading),
    speedMs: mix(a.speedMs, b.speedMs),
    altM: mix(a.altM, b.altM),
    distM: mix(a.distM, b.distM),
    phase: a.phase,
    photos: countUpTo(track.photoTimes, t),
    coveredShare: share,
    coveredHa: share * track.orderedHa,
  };
}

/** Where the aircraft has been up to `t`, ending at its present position. */
export function trailUpTo(track: Track, t: number): Position[] {
  const now = stateAt(track, t);
  const i = indexAt(track, t);
  return [
    ...track.points.slice(0, i + 1).map((point) => point.position),
    now.position,
  ];
}

/** Route stretches that are survey, as lists of positions with their times, for painting coverage. */
export function surveyRuns(track: Track, t: number): Position[][] {
  const runs: Position[][] = [];
  let current: Position[] = [];
  const i = indexAt(track, t);
  const now = stateAt(track, t);
  for (let index = 0; index <= i; index += 1) {
    const point = track.points[index];
    if (point.survey) current.push(point.position);
    else if (current.length) {
      current.push(point.position);
      runs.push(current);
      current = [];
    }
  }
  if (track.points[i]?.survey) current.push(now.position);
  if (current.length > 1) runs.push(current);
  return runs;
}

/** Time of the closest event at or after `t` (or the end), and the closest before it. */
export function neighbouringEvents(track: Track, t: number) {
  const before = [...track.events].reverse().find((event) => event.t < t - 0.5);
  const after = track.events.find((event) => event.t > t + 0.5);
  return { before, after };
}
