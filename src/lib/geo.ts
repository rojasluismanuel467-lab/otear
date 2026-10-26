import type { Position } from "@/features/demo/types";

/** Small planar geometry helpers for site outlines. Positions are [lat, lng]. */

type XY = [number, number];
const EARTH_RADIUS_M = 6_371_008.8;
const RAD = Math.PI / 180;

function project(points: Position[], origin: Position): XY[] {
  const cosLat = Math.cos(origin[0] * RAD);
  return points.map(([lat, lng]) => [
    (lng - origin[1]) * RAD * EARTH_RADIUS_M * cosLat,
    (lat - origin[0]) * RAD * EARTH_RADIUS_M,
  ]);
}

function unproject(points: XY[], origin: Position): Position[] {
  const cosLat = Math.cos(origin[0] * RAD);
  return points.map(([x, y]) => [
    Number((origin[0] + y / (RAD * EARTH_RADIUS_M)).toFixed(6)),
    Number((origin[1] + x / (RAD * EARTH_RADIUS_M * cosLat)).toFixed(6)),
  ]);
}

function originOf(points: Position[]): Position {
  const lat = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const lng = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return [lat, lng];
}

function signedArea(points: XY[]) {
  let sum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[(index + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return sum / 2;
}

export function polygonAreaHa(points: Position[]) {
  if (points.length < 3) return 0;
  return Math.abs(signedArea(project(points, originOf(points)))) / 10_000;
}

export function lineLengthKm(points: Position[]) {
  const xy = project(points, originOf(points));
  let meters = 0;
  for (let index = 1; index < xy.length; index += 1) {
    meters += Math.hypot(
      xy[index][0] - xy[index - 1][0],
      xy[index][1] - xy[index - 1][1],
    );
  }
  return meters / 1000;
}

export function centerOf(points: Position[]): Position {
  return originOf(points);
}

/** Smallest convex outline containing all points (monotone chain). */
export function convexHull(points: Position[]): Position[] {
  if (points.length < 3) return points;
  const origin = originOf(points);
  const xy = project(points, origin)
    .map((point, index) => ({ point, index }))
    .sort((a, b) => a.point[0] - b.point[0] || a.point[1] - b.point[1]);
  const cross = (o: XY, a: XY, b: XY) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const build = (items: typeof xy) => {
    const chain: typeof xy = [];
    for (const item of items) {
      while (
        chain.length >= 2 &&
        cross(
          chain[chain.length - 2].point,
          chain[chain.length - 1].point,
          item.point,
        ) <= 0
      ) {
        chain.pop();
      }
      chain.push(item);
    }
    chain.pop();
    return chain;
  };
  const hull = [...build(xy), ...build([...xy].reverse())];
  return hull.map(({ index }) => points[index]);
}

/** Pushes every vertex away from the centre by `meters`. */
export function expandOutline(points: Position[], meters: number): Position[] {
  const origin = originOf(points);
  const xy = project(points, origin);
  const grown = xy.map(([x, y]) => {
    const length = Math.hypot(x, y) || 1;
    return [x + (x / length) * meters, y + (y / length) * meters] as XY;
  });
  return unproject(grown, origin);
}

/** Keeps the part of the polygon where dot(p - point, normal) >= 0. */
function clipHalfPlane(polygon: XY[], point: XY, normal: XY): XY[] {
  const side = (p: XY) =>
    (p[0] - point[0]) * normal[0] + (p[1] - point[1]) * normal[1];
  const result: XY[] = [];
  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index];
    const next = polygon[(index + 1) % polygon.length];
    const currentSide = side(current);
    const nextSide = side(next);
    if (currentSide >= 0) result.push(current);
    if (currentSide >= 0 !== nextSide >= 0) {
      const t = currentSide / (currentSide - nextSide);
      result.push([
        current[0] + (next[0] - current[0]) * t,
        current[1] + (next[1] - current[1]) * t,
      ]);
    }
  }
  return result;
}

/** Splits a polygon with the infinite line through a and b. */
export function splitPolygon(
  points: Position[],
  a: Position,
  b: Position,
): Position[][] {
  const origin = originOf(points);
  const polygon = project(points, origin);
  const [pa, pb] = project([a, b], origin);
  const direction: XY = [pb[0] - pa[0], pb[1] - pa[1]];
  if (!direction[0] && !direction[1]) return [points];
  const normal: XY = [-direction[1], direction[0]];
  return [
    clipHalfPlane(polygon, pa, normal),
    clipHalfPlane(polygon, pa, [-normal[0], -normal[1]]),
  ]
    .filter((part) => part.length >= 3 && Math.abs(signedArea(part)) > 1)
    .map((part) => unproject(part, origin));
}

/** Cuts a polygon into equal-width strips along its north-south or east-west axis. */
export function splitIntoStrips(
  points: Position[],
  count: number,
  axis: "ns" | "ew",
): Position[][] {
  if (count <= 1) return [points];
  const origin = originOf(points);
  const polygon = project(points, origin);
  const index = axis === "ew" ? 0 : 1;
  const values = polygon.map((point) => point[index]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / count;
  const normalFor = (sign: number): XY => (index === 0 ? [sign, 0] : [0, sign]);
  const pointAt = (value: number): XY =>
    index === 0 ? [value, 0] : [0, value];
  const strips: Position[][] = [];
  for (let step = 0; step < count; step += 1) {
    const lower = min + width * step;
    const upper = lower + width;
    let part = clipHalfPlane(polygon, pointAt(lower), normalFor(1));
    if (part.length >= 3) {
      part = clipHalfPlane(part, pointAt(upper), normalFor(-1));
    }
    if (part.length >= 3 && Math.abs(signedArea(part)) > 1) {
      strips.push(unproject(part, origin));
    }
  }
  return strips;
}

/** Cuts a polyline into consecutive pieces whose lengths follow `fractions`. */
export function splitLineByFractions(
  points: Position[],
  fractions: number[],
): Position[][] {
  const sum = fractions.reduce((total, value) => total + value, 0);
  if (fractions.length < 2 || points.length < 2 || sum <= 0) return [points];
  const origin = originOf(points);
  const xy = project(points, origin);
  const lengths = xy
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - xy[i][0], p[1] - xy[i][1]));
  const total = lengths.reduce((value, item) => value + item, 0);
  const targets: number[] = [];
  let cumulative = 0;
  for (const fraction of fractions.slice(0, -1)) {
    cumulative += fraction / sum;
    targets.push(cumulative * total);
  }
  const parts: XY[][] = [[xy[0]]];
  let travelled = 0;
  let next = 0;
  for (let segment = 0; segment < lengths.length; segment += 1) {
    let from = xy[segment];
    const to = xy[segment + 1];
    let remaining = lengths[segment];
    while (
      next < targets.length &&
      travelled + remaining >= targets[next] - 1e-9
    ) {
      const needed = targets[next] - travelled;
      const t = remaining ? needed / remaining : 0;
      const cut: XY = [
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
      ];
      parts[parts.length - 1].push(cut);
      parts.push([cut]);
      travelled = targets[next];
      remaining = Math.hypot(to[0] - cut[0], to[1] - cut[1]);
      from = cut;
      next += 1;
    }
    parts[parts.length - 1].push(to);
    travelled += remaining;
  }
  return parts.map((part) => unproject(part, origin));
}

/** Cuts a polyline into `count` consecutive pieces of equal length. */
export function splitLineIntoParts(
  points: Position[],
  count: number,
): Position[][] {
  return splitLineByFractions(
    points,
    Array.from({ length: count }, () => 1),
  );
}

/** Strips whose areas follow `weights` (for example hectares from production records). */
export function splitByWeights(
  points: Position[],
  weights: number[],
  axis: "ns" | "ew",
): Position[][] {
  const positive = weights.filter((weight) => weight > 0);
  if (positive.length < 2) return [points];
  const origin = originOf(points);
  const polygon = project(points, origin);
  const index = axis === "ew" ? 0 : 1;
  const values = polygon.map((point) => point[index]);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const normalFor = (sign: number): XY => (index === 0 ? [sign, 0] : [0, sign]);
  const pointAt = (value: number): XY =>
    index === 0 ? [value, 0] : [0, value];
  const strip = (lower: number, upper: number) => {
    let part = clipHalfPlane(polygon, pointAt(lower), normalFor(1));
    if (part.length >= 3)
      part = clipHalfPlane(part, pointAt(upper), normalFor(-1));
    return part.length >= 3 ? part : [];
  };
  const areaTo = (limit: number) => Math.abs(signedArea(strip(min, limit)));
  const total = areaTo(max);
  const sum = positive.reduce((value, item) => value + item, 0);
  const cuts: number[] = [];
  let cumulative = 0;
  for (const weight of positive.slice(0, -1)) {
    cumulative += weight / sum;
    let low = min;
    let high = max;
    for (let step = 0; step < 40; step += 1) {
      const middle = (low + high) / 2;
      if (areaTo(middle) < total * cumulative) low = middle;
      else high = middle;
    }
    cuts.push((low + high) / 2);
  }
  const bounds = [min, ...cuts, max];
  return positive
    .map((_, step) => strip(bounds[step], bounds[step + 1]))
    .filter((part) => part.length >= 3)
    .map((part) => unproject(part, origin));
}

/** Points along every route, about `stepM` meters apart. */
export function densify(routes: Position[][], stepM = 40): Position[] {
  const all = routes.flat();
  if (!all.length) return [];
  const origin = originOf(all);
  const result: XY[] = [];
  for (const route of routes) {
    const xy = project(route, origin);
    if (xy.length === 1) result.push(xy[0]);
    for (let i = 1; i < xy.length; i += 1) {
      const length = Math.hypot(
        xy[i][0] - xy[i - 1][0],
        xy[i][1] - xy[i - 1][1],
      );
      const steps = Math.max(1, Math.ceil(length / stepM));
      for (let k = 0; k < steps; k += 1) {
        const t = k / steps;
        result.push([
          xy[i - 1][0] + (xy[i][0] - xy[i - 1][0]) * t,
          xy[i - 1][1] + (xy[i][1] - xy[i - 1][1]) * t,
        ]);
      }
      if (i === xy.length - 1) result.push(xy[i]);
    }
  }
  return unproject(result, origin);
}

/** k-means centres (farthest-point start, so the result is deterministic). */
export function clusterCenters(points: Position[], count: number): Position[] {
  if (!points.length) return [];
  const origin = originOf(points);
  const xy = project(points, origin);
  const k = Math.min(count, xy.length);
  const centers: XY[] = [
    xy.reduce((best, point) => (point[0] < best[0] ? point : best)),
  ];
  while (centers.length < k) {
    let farthest = xy[0];
    let distance = -1;
    for (const point of xy) {
      const nearest = Math.min(
        ...centers.map((c) => Math.hypot(point[0] - c[0], point[1] - c[1])),
      );
      if (nearest > distance) {
        distance = nearest;
        farthest = point;
      }
    }
    centers.push(farthest);
  }
  for (let round = 0; round < 15; round += 1) {
    const sums = centers.map(() => [0, 0, 0]);
    for (const point of xy) {
      let best = 0;
      let bestDistance = Infinity;
      centers.forEach((c, i) => {
        const d = Math.hypot(point[0] - c[0], point[1] - c[1]);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      sums[best][0] += point[0];
      sums[best][1] += point[1];
      sums[best][2] += 1;
    }
    sums.forEach((sum, i) => {
      if (sum[2]) centers[i] = [sum[0] / sum[2], sum[1] / sum[2]];
    });
  }
  return unproject(centers, origin);
}

/** Splits a polygon into the cells closest to each centre (Voronoi, clipped). */
export function voronoiCells(
  outline: Position[],
  centers: Position[],
): Position[][] {
  if (centers.length < 2) return [outline];
  const origin = originOf(outline);
  const polygon = project(outline, origin);
  const xy = project(centers, origin);
  return xy
    .map((center, i) => {
      let cell = polygon;
      xy.forEach((other, j) => {
        if (i === j || cell.length < 3) return;
        const mid: XY = [
          (center[0] + other[0]) / 2,
          (center[1] + other[1]) / 2,
        ];
        cell = clipHalfPlane(cell, mid, [
          center[0] - other[0],
          center[1] - other[1],
        ]);
      });
      return cell;
    })
    .filter((cell) => cell.length >= 3 && Math.abs(signedArea(cell)) > 1)
    .map((cell) => unproject(cell, origin));
}

/** Smooth centre line of a corridor flown with zig-zag or parallel passes. */
export function centerlineFromRoutes(
  routes: Position[][],
  bins = 8,
): Position[] {
  const points = densify(routes, 25);
  if (points.length < 2) return [];
  const origin = originOf(points);
  const xy = project(points, origin);
  const mean = xy
    .reduce((sum, p) => [sum[0] + p[0], sum[1] + p[1]], [0, 0])
    .map((v) => v / xy.length);
  let cxx = 0;
  let cyy = 0;
  let cxy = 0;
  for (const p of xy) {
    cxx += (p[0] - mean[0]) ** 2;
    cyy += (p[1] - mean[1]) ** 2;
    cxy += (p[0] - mean[0]) * (p[1] - mean[1]);
  }
  const angle = 0.5 * Math.atan2(2 * cxy, cxx - cyy);
  const u: XY = [Math.cos(angle), Math.sin(angle)];
  const ranked = xy
    .map((p) => ({ p, t: (p[0] - mean[0]) * u[0] + (p[1] - mean[1]) * u[1] }))
    .sort((a, b) => a.t - b.t);
  const low = ranked[0].t;
  const span = ranked[ranked.length - 1].t - low || 1;
  const groups: XY[][] = Array.from({ length: bins }, () => []);
  for (const { p, t } of ranked) {
    groups[Math.min(bins - 1, Math.floor(((t - low) / span) * bins))].push(p);
  }
  const line = groups
    .filter((group) => group.length)
    .map(
      (group) =>
        [
          group.reduce((sum, p) => sum + p[0], 0) / group.length,
          group.reduce((sum, p) => sum + p[1], 0) / group.length,
        ] as XY,
    );
  return unproject(line, origin);
}

/** Rectangle of the given size in meters around a centre, optionally rotated. */
export function rectangleAround(
  center: Position,
  widthM: number,
  depthM: number,
  rotationDeg = 0,
): Position[] {
  const angle = rotationDeg * RAD;
  const corners: XY[] = [
    [-widthM / 2, -depthM / 2],
    [widthM / 2, -depthM / 2],
    [widthM / 2, depthM / 2],
    [-widthM / 2, depthM / 2],
  ];
  return unproject(
    corners.map(
      ([x, y]) =>
        [
          x * Math.cos(angle) - y * Math.sin(angle),
          x * Math.sin(angle) + y * Math.cos(angle),
        ] as XY,
    ),
    center,
  );
}

/** Moves a shape so that its centre lands on `target`. */
export function translateTo(points: Position[], target: Position): Position[] {
  const [lat, lng] = originOf(points);
  return points.map(([pLat, pLng]) => [
    Number((pLat + target[0] - lat).toFixed(6)),
    Number((pLng + target[1] - lng).toFixed(6)),
  ]);
}

export type LasHeader =
  | {
      version: string;
      pointCount: number;
      min: [number, number, number];
      max: [number, number, number];
    }
  | { error: string };

/** Reads the public header of a LAS point cloud (versions 1.0 to 1.4). */
export function parseLasHeader(buffer: ArrayBuffer): LasHeader {
  if (buffer.byteLength < 227)
    return { error: "El archivo es muy corto para ser LAS." };
  const view = new DataView(buffer);
  const signature = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  if (signature !== "LASF")
    return { error: "No es un archivo LAS (falta la firma LASF)." };
  const major = view.getUint8(24);
  const minor = view.getUint8(25);
  let pointCount = view.getUint32(107, true);
  if (!pointCount && major === 1 && minor >= 4 && buffer.byteLength >= 255) {
    pointCount = Number(view.getBigUint64(247, true));
  }
  const maxX = view.getFloat64(179, true);
  const minX = view.getFloat64(187, true);
  const maxY = view.getFloat64(195, true);
  const minY = view.getFloat64(203, true);
  const maxZ = view.getFloat64(211, true);
  const minZ = view.getFloat64(219, true);
  const values = [maxX, minX, maxY, minY, maxZ, minZ];
  if (
    values.some((value) => !Number.isFinite(value)) ||
    maxX < minX ||
    maxY < minY ||
    maxZ < minZ
  ) {
    return { error: "El encabezado del LAS no trae límites válidos." };
  }
  return {
    version: `${major}.${minor}`,
    pointCount,
    min: [minX, minY, minZ],
    max: [maxX, maxY, maxZ],
  };
}

/** An irregular but plausible outline with the requested area around `center`. */
export function approximateOutline(
  center: Position,
  areaHa: number,
  vertices = 9,
): Position[] {
  const raw: XY[] = Array.from({ length: vertices }, (_, index) => {
    const angle = (index / vertices) * Math.PI * 2;
    const radius =
      1 + 0.14 * Math.sin(3 * angle + 0.7) + 0.08 * Math.sin(5 * angle + 2.1);
    return [Math.cos(angle) * radius * 1.35, Math.sin(angle) * radius] as XY;
  });
  const scale = Math.sqrt((areaHa * 10_000) / Math.abs(signedArea(raw)));
  return unproject(
    raw.map(([x, y]) => [x * scale, y * scale] as XY),
    center,
  );
}

export function pointInPolygon(point: Position, polygon: Position[]) {
  if (polygon.length < 3) return false;
  const origin = originOf(polygon);
  const [p] = project([point], origin);
  const ring = project(polygon, origin);
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (
      yi > p[1] !== yj > p[1] &&
      p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/** Shortest distance in meters from a point to a polyline. */
export function distanceToLineM(point: Position, line: Position[]) {
  if (line.length < 2) return Infinity;
  const origin = originOf(line);
  const [p] = project([point], origin);
  const xy = project(line, origin);
  let best = Infinity;
  for (let i = 1; i < xy.length; i += 1) {
    const [ax, ay] = xy[i - 1];
    const [bx, by] = xy[i];
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared
      ? Math.max(
          0,
          Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / lengthSquared),
        )
      : 0;
    best = Math.min(
      best,
      Math.hypot(p[0] - (ax + t * dx), p[1] - (ay + t * dy)),
    );
  }
  return best;
}

export type ParsedGeometry =
  { kind: "polygon" | "line"; points: Position[] } | { error: string };

function isPosition(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

function openRing(points: Position[]) {
  const first = points[0];
  const last = points[points.length - 1];
  return points.length > 3 && first[0] === last[0] && first[1] === last[1]
    ? points.slice(0, -1)
    : points;
}

function findGeoJsonGeometry(
  node: unknown,
): { type: string; coordinates: unknown } | null {
  if (!node || typeof node !== "object") return null;
  const value = node as Record<string, unknown>;
  if (
    typeof value.type === "string" &&
    ["Polygon", "MultiPolygon", "LineString", "MultiLineString"].includes(
      value.type,
    )
  ) {
    return value as { type: string; coordinates: unknown };
  }
  if (value.type === "Feature") return findGeoJsonGeometry(value.geometry);
  const children = (value.features ?? value.geometries) as unknown;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findGeoJsonGeometry(child);
      if (found) return found;
    }
  }
  return null;
}

function toPositions(raw: unknown): Position[] | null {
  if (!Array.isArray(raw)) return null;
  const points: Position[] = [];
  for (const item of raw) {
    if (!Array.isArray(item) || item.length < 2) return null;
    const [lng, lat] = item as number[];
    if (!isPosition(lat, lng)) return null;
    points.push([lat, lng]);
  }
  return points;
}

function parseGeoJson(text: string): ParsedGeometry {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: "El archivo no es un GeoJSON válido." };
  }
  const geometry = findGeoJsonGeometry(data);
  if (!geometry) {
    return { error: "No encontré un polígono ni una línea en el archivo." };
  }
  const coordinates = geometry.coordinates as unknown[];
  const isPolygon = geometry.type.endsWith("Polygon");
  const ring =
    geometry.type === "Polygon"
      ? (coordinates[0] as unknown)
      : geometry.type === "MultiPolygon"
        ? ((coordinates[0] as unknown[])?.[0] as unknown)
        : geometry.type === "MultiLineString"
          ? coordinates[0]
          : coordinates;
  const points = toPositions(ring);
  if (!points || points.length < (isPolygon ? 4 : 2)) {
    return { error: "Las coordenadas del archivo no son válidas." };
  }
  return isPolygon
    ? { kind: "polygon", points: openRing(points) }
    : { kind: "line", points };
}

function parseKml(text: string): ParsedGeometry {
  const polygon =
    /<Polygon[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/i.exec(text);
  const line =
    /<LineString[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/i.exec(text);
  const match = polygon ?? line;
  if (!match) {
    return { error: "No encontré un polígono ni una línea en el KML." };
  }
  const points: Position[] = [];
  for (const tuple of match[1].trim().split(/\s+/)) {
    const [lng, lat] = tuple.split(",").map(Number);
    if (!isPosition(lat, lng)) {
      return { error: "Las coordenadas del KML no son válidas." };
    }
    points.push([lat, lng]);
  }
  if (points.length < (polygon ? 4 : 2)) {
    return { error: "El KML tiene muy pocos puntos." };
  }
  return polygon
    ? { kind: "polygon", points: openRing(points) }
    : { kind: "line", points };
}

/** Reads the first polygon or line from a GeoJSON or KML text. */
export function parseGeometry(text: string, fileName: string): ParsedGeometry {
  if (/\.kml$/i.test(fileName)) return parseKml(text);
  if (/\.(geo)?json$/i.test(fileName)) return parseGeoJson(text);
  return { error: "Usa un archivo KML o GeoJSON." };
}
