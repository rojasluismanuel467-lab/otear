import {
  centerOf,
  fromLocalMeters,
  polygonAreaHa,
  toLocalMeters,
  type LocalXY,
} from "../../lib/geo.ts";
import type { Position, Sector } from "../demo/types";

/**
 * Plans the route of a mapping or inspection flight from the zones it covers, the way a
 * flight-planning app does: line spacing from the camera footprint and the side overlap,
 * photo spacing from the front overlap, and a pattern that fits the sector. Everything that
 * the flight record says about the work (distance, duration, photos, area covered) is read
 * from the route, so the numbers and the drawing agree. It plans; it does not fly.
 *
 * Formulas: ground sample distance GSD = height × sensor width / (focal length × image width);
 * footprint = GSD × pixels; line spacing = across-track footprint × (1 − side overlap);
 * photo spacing = along-track footprint × (1 − front overlap).
 */

type XY = LocalXY;

export interface CameraSpec {
  sensorWidthMm: number;
  focalMm: number;
  imageWidthPx: number;
  imageHeightPx: number;
}

/**
 * A representative 4/3-format, 20 MP mapping camera. These are illustrative values, not the
 * datasheet of any product: check the manufacturer's figures before quoting a model.
 */
export const mappingCamera: CameraSpec = {
  sensorWidthMm: 17.3,
  focalMm: 12.3,
  imageWidthPx: 5280,
  imageHeightPx: 3956,
};

export interface MissionSettings {
  camera: CameraSpec;
  /** Ground sample distance, cm per pixel. */
  gsdCm: number;
  /** Side and front overlap as fractions (0.75 = 75 %). */
  sideOverlap: number;
  frontOverlap: number;
  /** Ground speed while surveying, m/s. */
  cruiseMs: number;
}

export const defaultSettings: MissionSettings = {
  camera: mappingCamera,
  gsdCm: 2.1,
  sideOverlap: 0.75,
  frontOverlap: 0.75,
  cruiseMs: 8,
};

/** Seconds spent on takeoff, climb, descent and landing, and on each turn at the end of a line. */
const TAKEOFF_AND_LANDING_S = 120;
const TURN_S = 6;
/** Distance from a zone to the take-off point, and offset of the façade pass from a building. */
const HOME_OFFSET_M = 35;
const FACADE_STANDOFF_M = 15;
/** The patrol runs this far inside the fence line. */
const PATROL_INSET_M = 10;
const COVERAGE_CELL_M = 5;

export interface PlanZone {
  id: string;
  outline: Position[];
}

export interface MissionInput {
  sector: Sector;
  /** Zones this flight covers, in any order; the planner orders them. */
  zones: PlanZone[];
  settings?: Partial<MissionSettings>;
  /** Take-off and landing point; by default a point outside the zones. */
  home?: Position;
  /**
   * The mission ends after this share (0–1) of its survey lines, as when a battery runs out
   * before the last lines. The lines not flown are left uncovered.
   */
  endEarlyAt?: number;
}

export interface MissionPlan {
  /** Take-off point, every turning point, and the landing point (the same as the first). */
  route: Position[];
  home: Position;
  /** The parts of the route where photos are taken. */
  surveyPaths: Position[][];
  distanceKm: number;
  surveyKm: number;
  /** Estimated flight time, in minutes. */
  durationMin: number;
  photoCount: number;
  lineCount: number;
  heightM: number;
  /** Ground width of one photo across the track, and the distance between lines and photos. */
  swathM: number;
  lineSpacingM: number;
  photoSpacingM: number;
  orderedHa: number;
  /** Area the survey lines reach inside the zones; 0 for zones that are lines (roads). */
  coveredHa: number;
  uncovered: { zoneId: string; ha: number }[];
}

export function heightFor(gsdCm: number, camera: CameraSpec) {
  return (
    ((gsdCm / 100) * camera.focalMm * camera.imageWidthPx) /
    camera.sensorWidthMm
  );
}

export function footprint(gsdCm: number, camera: CameraSpec) {
  const gsd = gsdCm / 100;
  return {
    across: gsd * camera.imageWidthPx,
    along: gsd * camera.imageHeightPx,
  };
}

const dot = (a: XY, b: XY) => a[0] * b[0] + a[1] * b[1];
const sub = (a: XY, b: XY): XY => [a[0] - b[0], a[1] - b[1]];
const add = (a: XY, b: XY): XY => [a[0] + b[0], a[1] + b[1]];
const scale = (a: XY, k: number): XY => [a[0] * k, a[1] * k];
const length = (a: XY) => Math.hypot(a[0], a[1]);
const unit = (a: XY): XY => {
  const l = length(a) || 1;
  return [a[0] / l, a[1] / l];
};
const gap = (a: XY, b: XY) => length(sub(a, b));

function pathLength(points: XY[]) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1)
    total += gap(points[i - 1], points[i]);
  return total;
}

/** A survey line: both ends, in the direction it will be flown. */
type Line = [XY, XY];

/**
 * Flight lines across a polygon, parallel to the direction in which the polygon is narrowest
 * (fewest lines and turns), evenly spaced no wider than `spacing`, and extended by `extend` so
 * that the photos reach the edge.
 */
function sweepLines(
  outline: XY[],
  hull: XY[],
  spacing: number,
  extend: number,
): Line[] {
  let best: { d: XY; n: XY; min: number; max: number } | undefined;
  for (let i = 0; i < hull.length; i += 1) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    if (gap(a, b) < 1) continue;
    const d = unit(sub(b, a));
    const n: XY = [-d[1], d[0]];
    const projections = hull.map((p) => dot(p, n));
    const min = Math.min(...projections);
    const max = Math.max(...projections);
    if (!best || max - min < best.max - best.min) best = { d, n, min, max };
  }
  if (!best) return [];
  const { d, n, min, max } = best;
  const count = Math.max(1, Math.ceil((max - min) / spacing));
  const step = (max - min) / count;
  const lines: Line[] = [];
  for (let k = 0; k < count; k += 1) {
    const offset = min + (k + 0.5) * step;
    const along: number[] = [];
    for (let i = 0; i < outline.length; i += 1) {
      const a = outline[i];
      const b = outline[(i + 1) % outline.length];
      const sa = dot(a, n) - offset;
      const sb = dot(b, n) - offset;
      if (sa === sb || sa * sb > 0) continue;
      const t = sa / (sa - sb);
      along.push(dot(add(a, scale(sub(b, a), t)), d));
    }
    if (along.length < 2) continue;
    const from = Math.min(...along) - extend;
    const to = Math.max(...along) + extend;
    lines.push([
      add(scale(d, from), scale(n, offset)),
      add(scale(d, to), scale(n, offset)),
    ]);
  }
  return lines;
}

/**
 * The lines of a zone as a back-and-forth sweep that begins where the aircraft is: it tries
 * both ends of the zone and both directions, and keeps the one with the shortest hop to the
 * first line (and, for the last zone, to home).
 */
function serpentine(lines: Line[], from: XY, home?: XY): Line[] {
  const variants: Line[][] = [];
  for (const reverse of [false, true]) {
    for (const flip of [false, true]) {
      const ordered = reverse ? [...lines].reverse() : lines;
      variants.push(
        ordered.map(([a, b], index) =>
          (index % 2 === 0) !== flip ? ([a, b] as Line) : ([b, a] as Line),
        ),
      );
    }
  }
  const cost = (variant: Line[]) =>
    gap(from, variant[0][0]) +
    (home ? gap(variant[variant.length - 1][1], home) : 0);
  return variants.reduce((best, variant) =>
    cost(variant) < cost(best) ? variant : best,
  );
}

/** Moves a convex polygon's edges outward by `meters` (negative: inward). */
function offsetConvex(ring: XY[], meters: number): XY[] {
  const signed = ring.reduce((sum, p, i) => {
    const q = ring[(i + 1) % ring.length];
    return sum + (p[0] * q[1] - q[0] * p[1]);
  }, 0);
  // The outward normal of a counter-clockwise ring points to the right of each edge.
  const sign = signed >= 0 ? 1 : -1;
  const lines = ring.map((p, i) => {
    const q = ring[(i + 1) % ring.length];
    const d = unit(sub(q, p));
    const outward: XY = [d[1] * sign, -d[0] * sign];
    return { point: add(p, scale(outward, meters)), d };
  });
  return lines.map((current, i) => {
    const before = lines[(i + lines.length - 1) % lines.length];
    const cross = before.d[0] * current.d[1] - before.d[1] * current.d[0];
    if (Math.abs(cross) < 1e-9) return current.point;
    const t =
      ((current.point[0] - before.point[0]) * current.d[1] -
        (current.point[1] - before.point[1]) * current.d[0]) /
      cross;
    return add(before.point, scale(before.d, t));
  });
}

/** The line shifted sideways by `meters` (left of its direction when positive), mitred at corners. */
function offsetPolyline(points: XY[], meters: number): XY[] {
  return points.map((point, i) => {
    const before = i > 0 ? unit(sub(point, points[i - 1])) : undefined;
    const after =
      i < points.length - 1 ? unit(sub(points[i + 1], point)) : undefined;
    const d1 = before ?? after!;
    const d2 = after ?? before!;
    const n1: XY = [-d1[1], d1[0]];
    const n2: XY = [-d2[1], d2[0]];
    const n = unit(add(n1, n2));
    const reach = Math.max(0.5, dot(n, n1));
    return add(point, scale(n, meters / reach));
  });
}

/** Where the aircraft takes off and lands: outside the zones, near their south-western corner. */
function defaultHome(points: XY[]): XY {
  const hull = toHull(points);
  const corner = hull.reduce((best, p) =>
    p[0] + p[1] < best[0] + best[1] ? p : best,
  );
  const middle = hull.reduce((sum, p) => add(sum, scale(p, 1 / hull.length)), [
    0, 0,
  ] as XY);
  return add(corner, scale(unit(sub(corner, middle)), HOME_OFFSET_M));
}

/** Smallest convex outline containing the points (monotone chain), counter-clockwise. */
function toHull(points: XY[]): XY[] {
  if (points.length < 3) return points;
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: XY, a: XY, b: XY) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const chain = (items: XY[]) => {
    const result: XY[] = [];
    for (const point of items) {
      while (
        result.length >= 2 &&
        cross(result[result.length - 2], result[result.length - 1], point) <= 0
      )
        result.pop();
      result.push(point);
    }
    result.pop();
    return result;
  };
  return [...chain(sorted), ...chain([...sorted].reverse())];
}

export function rayInside(point: XY, ring: XY[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > point[1] !== yj > point[1]) {
      const x = ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
      if (point[0] < x) inside = !inside;
    }
  }
  return inside;
}

export function distanceToSegment(p: XY, a: XY, b: XY) {
  const ab = sub(b, a);
  const l2 = dot(ab, ab);
  const t = l2 ? Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2)) : 0;
  return gap(p, add(a, scale(ab, t)));
}

/** Share of each polygon that lies within half a swath of a survey line, by sampling a grid. */
function coverageShares(
  rings: { id: string; ring: XY[] }[],
  paths: XY[][],
  swathM: number,
) {
  const segments: [XY, XY][] = [];
  paths.forEach((path) => {
    for (let i = 1; i < path.length; i += 1)
      segments.push([path[i - 1], path[i]]);
  });
  const reach = swathM / 2;
  return rings.map(({ id, ring }) => {
    const xs = ring.map((p) => p[0]);
    const ys = ring.map((p) => p[1]);
    let total = 0;
    let covered = 0;
    for (
      let x = Math.min(...xs) + COVERAGE_CELL_M / 2;
      x < Math.max(...xs);
      x += COVERAGE_CELL_M
    ) {
      for (
        let y = Math.min(...ys) + COVERAGE_CELL_M / 2;
        y < Math.max(...ys);
        y += COVERAGE_CELL_M
      ) {
        const cell: XY = [x, y];
        if (!rayInside(cell, ring)) continue;
        total += 1;
        if (segments.some(([a, b]) => distanceToSegment(cell, a, b) <= reach))
          covered += 1;
      }
    }
    return { id, share: total ? covered / total : 0 };
  });
}

/** Cuts a list of survey lines after `fraction` of their total length. */
function endEarly(lines: Line[], fraction: number): Line[] {
  const total = lines.reduce((sum, line) => sum + gap(line[0], line[1]), 0);
  const kept: Line[] = [];
  let flown = 0;
  for (const line of lines) {
    if (flown >= total * fraction) break;
    kept.push(line);
    flown += gap(line[0], line[1]);
  }
  return kept;
}

export function planMission(input: MissionInput): MissionPlan {
  const settings: MissionSettings = { ...defaultSettings, ...input.settings };
  const { across, along } = footprint(settings.gsdCm, settings.camera);
  const lineSpacingM = across * (1 - settings.sideOverlap);
  const photoSpacingM = along * (1 - settings.frontOverlap);
  const heightM = heightFor(settings.gsdCm, settings.camera);

  const zones = input.zones.filter((zone) => zone.outline.length >= 2);
  if (!zones.length) {
    return {
      route: [],
      home: input.home ?? [0, 0],
      surveyPaths: [],
      distanceKm: 0,
      surveyKm: 0,
      durationMin: 0,
      photoCount: 0,
      lineCount: 0,
      heightM,
      swathM: across,
      lineSpacingM,
      photoSpacingM,
      orderedHa: 0,
      coveredHa: 0,
      uncovered: [],
    };
  }

  const all = zones.flatMap((zone) => zone.outline);
  const origin = centerOf(all);
  const local = zones.map((zone) => ({
    id: zone.id,
    outline: toLocalMeters(zone.outline, origin),
  }));
  const homeXY: XY = input.home
    ? toLocalMeters([input.home], origin)[0]
    : defaultHome(local.flatMap((zone) => zone.outline));

  // Survey paths in the order they are flown; "transit" is whatever joins them.
  let paths: XY[][] = [];
  const isPolygon = (outline: XY[]) => outline.length >= 3;

  if (input.sector === "roads") {
    // A corridor is flown at least twice, out and back along both sides of the centre line.
    const centre: XY[] = [];
    local.forEach((zone) =>
      zone.outline.forEach((point) => {
        const last = centre[centre.length - 1];
        if (!last || gap(last, point) > 0.5) centre.push(point);
      }),
    );
    const side = lineSpacingM / 2;
    const forward = offsetPolyline(centre, side);
    const backward = offsetPolyline([...centre].reverse(), side);
    paths = [forward, backward];
    const start = forward[0];
    const ahead = unit(sub(forward[1], forward[0]));
    const normal: XY = [ahead[1], -ahead[0]];
    // The take-off point sits at the roadside, near the start.
    if (!input.home) {
      homeXY[0] = start[0] + normal[0] * HOME_OFFSET_M;
      homeXY[1] = start[1] + normal[1] * HOME_OFFSET_M;
    }
  } else if (input.sector === "security") {
    // A patrol along the fence, a little inside it.
    const ring = offsetConvex(
      toHull(local.flatMap((zone) => zone.outline)),
      -PATROL_INSET_M,
    );
    const nearest = ring.reduce(
      (best, point, index) =>
        gap(point, homeXY) < gap(ring[best], homeXY) ? index : best,
      0,
    );
    const turned = [...ring.slice(nearest), ...ring.slice(0, nearest)];
    paths = [[...turned, turned[0]]];
  } else {
    // Mapping lines per zone, nearest zone first.
    const remaining = local.filter((zone) => isPolygon(zone.outline));
    let position = homeXY;
    const lines: Line[] = [];
    while (remaining.length) {
      const reach = (outline: XY[]) =>
        Math.min(...outline.map((point) => gap(position, point)));
      remaining.sort((a, b) => reach(a.outline) - reach(b.outline));
      const zone = remaining.shift()!;
      const zoneLines = sweepLines(
        zone.outline,
        toHull(zone.outline),
        lineSpacingM,
        photoSpacingM,
      );
      if (!zoneLines.length) continue;
      const ordered = serpentine(
        zoneLines,
        position,
        remaining.length ? undefined : homeXY,
      );
      lines.push(...ordered);
      position = ordered[ordered.length - 1][1];
    }
    const flown =
      input.endEarlyAt !== undefined
        ? endEarly(lines, input.endEarlyAt)
        : lines;
    paths = flown.map(([a, b]) => [a, b]);
    if (input.sector === "construction" || input.sector === "mining") {
      // A pass around the works (or the crest of the pit), at a safe distance, for the faces.
      const ring = offsetConvex(
        toHull(local.flatMap((zone) => zone.outline)),
        FACADE_STANDOFF_M,
      );
      const last = paths[paths.length - 1]?.[1] ?? homeXY;
      const nearest = ring.reduce(
        (best, point, index) =>
          gap(point, last) < gap(ring[best], last) ? index : best,
        0,
      );
      const turned = [...ring.slice(nearest), ...ring.slice(0, nearest)];
      paths.push([...turned, turned[0]]);
    }
  }

  // Route: home, each path (with the short hop that joins them), home.
  const route: XY[] = [homeXY];
  paths.forEach((path) => route.push(...path));
  route.push(homeXY);

  const surveyM = paths.reduce((sum, path) => sum + pathLength(path), 0);
  const totalM = pathLength(route);
  const photoCount =
    paths.reduce(
      (sum, path) => sum + Math.floor(pathLength(path) / photoSpacingM) + 1,
      0,
    ) || 0;
  const durationMin =
    (totalM / settings.cruiseMs +
      paths.length * TURN_S +
      TAKEOFF_AND_LANDING_S) /
    60;

  // Area only means something where the aircraft maps a surface: not along a road or a fence.
  const mapsArea =
    input.sector === "agriculture" ||
    input.sector === "construction" ||
    input.sector === "mining";
  const polygons = mapsArea
    ? local.filter((zone) => isPolygon(zone.outline))
    : [];
  const shares = coverageShares(
    polygons.map((zone) => ({ id: zone.id, ring: zone.outline })),
    paths,
    across,
  );
  const hectares = (id: string) => {
    const zone = zones.find((item) => item.id === id);
    return zone ? polygonAreaHa(zone.outline) : 0;
  };
  const orderedHa = polygons.reduce((sum, zone) => sum + hectares(zone.id), 0);
  const coveredHa = shares.reduce(
    (sum, item) => sum + hectares(item.id) * item.share,
    0,
  );

  return {
    route: fromLocalMeters(route, origin),
    home: fromLocalMeters([homeXY], origin)[0],
    surveyPaths: paths.map((path) => fromLocalMeters(path, origin)),
    distanceKm: totalM / 1000,
    surveyKm: surveyM / 1000,
    durationMin,
    photoCount,
    lineCount: paths.length,
    heightM,
    swathM: across,
    lineSpacingM,
    photoSpacingM,
    orderedHa,
    coveredHa,
    uncovered: shares
      .map((item) => ({
        zoneId: item.id,
        ha: hectares(item.id) * (1 - item.share),
      }))
      .filter((item) => item.ha >= 0.05),
  };
}
