import type {
  Flight,
  Position,
  Sector,
  Site,
  Zone,
} from "@/features/demo/types";
import {
  approximateOutline,
  centerlineFromRoutes,
  clusterCenters,
  convexHull,
  densify,
  expandOutline,
  lineLengthKm,
  polygonAreaHa,
  rectangleAround,
  splitByWeights,
  splitIntoStrips,
  splitLineByFractions,
  splitLineIntoParts,
  voronoiCells,
  type LasHeader,
} from "@/lib/geo";
import type { ProductionRow } from "./production";

export type OutlineKind = "polygon" | "line";
export type SourceKind =
  "history" | "file" | "zones" | "lidar" | "deed" | "draw";

export interface DraftZone {
  id: string;
  name: string;
  use: string;
  outline: Position[];
  /** Replaces the generated description (for example "Nivel 2 · 3,2–6,4 m"). */
  note?: string;
}

/** Roads are mapped as an axis split into stretches; every other sector as an area. */
export function outlineKindFor(sector: Sector): OutlineKind {
  return sector === "roads" ? "line" : "polygon";
}

export const zoneUses: Record<Sector, string[]> = {
  agriculture: ["Caña", "Aguacate", "Plátano", "Pastos", "Sin sembrar"],
  roads: ["Calzada existente", "Intervención", "Mantenimiento"],
  construction: [
    "Cimentación",
    "Estructura",
    "Acabados",
    "Vías internas",
    "Acopio",
  ],
  security: ["Perímetro", "Acceso", "Bodega", "Parqueadero", "Zona verde"],
};

const defaultAreaHa: Record<Sector, number> = {
  agriculture: 120,
  roads: 0,
  construction: 2.4,
  security: 18,
};

/** "Lotes" → "Lote", "Sectores" → "Sector". */
export function singularOf(label: string) {
  return label.endsWith("ores") ? label.slice(0, -2) : label.replace(/s$/, "");
}

export function formatHa(value: number) {
  if (value < 0.5) {
    return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value * 10_000)} m²`;
  }
  return `${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: value < 10 ? 1 : 0,
    maximumFractionDigits: 1,
  }).format(value)} ha`;
}

export function formatKm(value: number) {
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value)} km`;
}

function formatChainage(km: number) {
  const whole = Math.floor(km);
  const meters = Math.round((km - whole) * 1000);
  return `${whole}+${String(meters).padStart(3, "0")}`;
}

export function measureOutline(kind: OutlineKind, points: Position[]) {
  return kind === "line" ? lineLengthKm(points) : polygonAreaHa(points);
}

export function formatMeasure(kind: OutlineKind, value: number) {
  return kind === "line" ? formatKm(value) : formatHa(value);
}

/** Text stored in Zone.description, like "Caña · 12,4 ha" or "PK 0+000 – 2+400 · 2,4 km". */
export function describeDraft(
  kind: OutlineKind,
  zones: DraftZone[],
  index: number,
) {
  const zone = zones[index];
  if (zone.note) return zone.note;
  if (kind === "line") {
    const before = zones
      .slice(0, index)
      .reduce((sum, item) => sum + lineLengthKm(item.outline), 0);
    const length = lineLengthKm(zone.outline);
    return `PK ${formatChainage(before)} – ${formatChainage(before + length)} · ${formatKm(length)}`;
  }
  return `${zone.use} · ${formatHa(polygonAreaHa(zone.outline))}`;
}

export function routesOf(flights: Flight[]) {
  return flights
    .map((flight) => flight.route)
    .filter((route) => route.length >= 2);
}

/** Boundary estimated from where past flights actually went. */
export function outlineFromHistory(
  routes: Position[][],
  kind: OutlineKind,
): Position[] {
  if (!routes.length) return [];
  if (kind === "line") return centerlineFromRoutes(routes);
  return expandOutline(convexHull(routes.flat()), 60);
}

/** Outline sized by the area (or length) written in a deed. */
export function outlineFromDeed(site: Site, declared: number): Position[] {
  if (outlineKindFor(site.sector) === "line") {
    const km = Math.max(declared, 0.3);
    const [lat, lng] = site.center;
    const degrees = km / 111.2;
    return [
      [lat - degrees * 0.35, lng - degrees * 0.45],
      [lat - degrees * 0.1, lng - degrees * 0.1],
      [lat + degrees * 0.12, lng + degrees * 0.15],
      [lat + degrees * 0.35, lng + degrees * 0.48],
    ];
  }
  return approximateOutline(site.center, Math.max(declared, 0.1));
}

/** Built-in GeoJSON so the file import can be tried without a real file. */
export function sampleGeoJson(site: Site) {
  const kind = outlineKindFor(site.sector);
  const points =
    kind === "line"
      ? site.zones.flatMap((zone) => zone.outline)
      : approximateOutline(site.center, defaultAreaHa[site.sector]);
  const coordinates = points.map(([lat, lng]) => [lng, lat]);
  const geometry =
    kind === "line"
      ? { type: "LineString", coordinates }
      : { type: "Polygon", coordinates: [[...coordinates, coordinates[0]]] };
  return JSON.stringify({
    type: "Feature",
    properties: { name: `${site.name} (ejemplo)` },
    geometry,
  });
}

export function defaultDeclared(site: Site) {
  return outlineKindFor(site.sector) === "line"
    ? Math.round(
        lineLengthKm(site.zones.flatMap((zone) => zone.outline)) * 10,
      ) / 10 || 6
    : defaultAreaHa[site.sector];
}

/** Splits the outline into `count` named zones. */
export function distribute(
  site: Site,
  outline: Position[],
  count: number,
  axis: "ns" | "ew",
): DraftZone[] {
  const kind = outlineKindFor(site.sector);
  const parts =
    kind === "line"
      ? splitLineIntoParts(outline, count)
      : splitIntoStrips(outline, count, axis);
  const name = singularOf(site.zoneLabel);
  const uses = zoneUses[site.sector];
  return parts.map((part, index) => ({
    id: `draft-${index + 1}`,
    name: `${name} ${index + 1}`,
    use: uses[0],
    outline: part,
  }));
}

export function toZones(site: Site, zones: DraftZone[]): Zone[] {
  const kind = outlineKindFor(site.sector);
  return zones.map((zone, index) => ({
    id: `zone-${site.id}-${index + 1}`,
    name: zone.name.trim() || `${singularOf(site.zoneLabel)} ${index + 1}`,
    description: describeDraft(kind, zones, index),
    outline: zone.outline,
  }));
}

/** Measure of the zones that exist today, shown on the overview. */
export function measureZones(kind: OutlineKind, zones: Zone[]) {
  return zones.reduce(
    (sum, zone) => sum + measureOutline(kind, zone.outline),
    0,
  );
}

/* ---------- Automatic proposals ---------- */

export interface LidarInfo {
  fileName: string;
  widthM: number;
  depthM: number;
  heightM: number;
  pointCount: number;
}

/** Size of the model from a LAS header (meters, or degrees converted to meters). */
export function lidarFromHeader(
  header: Exclude<LasHeader, { error: string }>,
  fileName: string,
): LidarInfo {
  const [minX, minY, minZ] = header.min;
  const [maxX, maxY, maxZ] = header.max;
  const geographic =
    maxX - minX < 1 && Math.abs(maxX) <= 180 && Math.abs(maxY) <= 90;
  const widthM = geographic
    ? (maxX - minX) * 111_320 * Math.cos((minY * Math.PI) / 180)
    : maxX - minX;
  const depthM = geographic ? (maxY - minY) * 110_574 : maxY - minY;
  return {
    fileName,
    widthM,
    depthM,
    heightM: maxZ - minZ,
    pointCount: header.pointCount,
  };
}

export function sampleLidar(): LidarInfo {
  return {
    fileName: "edificio-de-ejemplo.las",
    widthM: 42,
    depthM: 28,
    heightM: 21.5,
    pointCount: 3_200_000,
  };
}

/** The model is placed at the site centre because a LAS header has no map position. */
export function outlineFromLidar(site: Site, lidar: LidarInfo): Position[] {
  return rectangleAround(site.center, lidar.widthM, lidar.depthM);
}

function newZone(
  site: Site,
  index: number,
  outline: Position[],
  extra: Partial<DraftZone> = {},
): DraftZone {
  return {
    id: `draft-${Date.now()}-${index + 1}`,
    name: `${singularOf(site.zoneLabel)} ${index + 1}`,
    use: zoneUses[site.sector][0],
    outline,
    ...extra,
  };
}

/** Stacked levels of a building, from the height of the LiDAR model. */
export function levelsFromLidar(
  site: Site,
  outline: Position[],
  lidar: LidarInfo,
  floorHeightM: number,
): DraftZone[] {
  const floor = Math.max(floorHeightM, 1);
  const levels = Math.max(1, Math.round(lidar.heightM / floor));
  const step = lidar.heightM / levels;
  const area = Math.round(polygonAreaHa(outline) * 10_000);
  const meters = (value: number) =>
    new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);
  return Array.from({ length: levels }, (_, index) =>
    newZone(site, index, outline, {
      name: `Nivel ${index + 1}`,
      use: "Estructura",
      note: `${meters(step * index)}–${meters(step * (index + 1))} m · ${new Intl.NumberFormat("es-CO").format(area)} m²`,
    }),
  );
}

/** Zones centred on where the past flights actually went (k-means + Voronoi). */
export function distributeByFlights(
  site: Site,
  outline: Position[],
  routes: Position[][],
  count: number,
): DraftZone[] {
  const centers = clusterCenters(densify(routes, 40), count);
  const cells = voronoiCells(outline, centers).sort(
    (a, b) =>
      a.reduce((sum, p) => sum + p[1], 0) / a.length -
      b.reduce((sum, p) => sum + p[1], 0) / b.length,
  );
  return cells.map((cell, index) => newZone(site, index, cell));
}

/** Zones sized by the production records the company already has. */
export function distributeByProduction(
  site: Site,
  outline: Position[],
  rows: ProductionRow[],
  axis: "ns" | "ew",
): DraftZone[] {
  const kind = outlineKindFor(site.sector);
  const quantities = rows.map((row) => row.quantity);
  const parts =
    kind === "line"
      ? splitLineByFractions(outline, quantities)
      : splitByWeights(outline, quantities, axis);
  return parts.map((part, index) =>
    newZone(site, index, part, {
      name: rows[index]?.name || `${singularOf(site.zoneLabel)} ${index + 1}`,
      use: rows[index]?.use || zoneUses[site.sector][0],
    }),
  );
}

/** Road stretches from the chainages (km) where each one ends, like "2,4; 5,1; 6". */
export function distributeByChainage(
  site: Site,
  outline: Position[],
  marksKm: number[],
): DraftZone[] {
  const marks = [0, ...marksKm];
  const fractions = marks.slice(1).map((mark, index) => mark - marks[index]);
  return splitLineByFractions(outline, fractions).map((part, index) =>
    newZone(site, index, part),
  );
}

/** Road stretches of a fixed length. */
export function distributeByInterval(
  site: Site,
  outline: Position[],
  intervalKm: number,
): DraftZone[] {
  const total = lineLengthKm(outline);
  const count = Math.max(1, Math.ceil(total / Math.max(intervalKm, 0.05)));
  const fractions = Array.from({ length: count }, (_, index) =>
    index < count - 1 ? intervalKm : total - intervalKm * (count - 1),
  );
  return splitLineByFractions(outline, fractions).map((part, index) =>
    newZone(site, index, part),
  );
}

export function sampleProduction(site: Site): string {
  if (site.sector === "roads") {
    return "Tramo 1; Intervención; 2,4\nTramo 2; Mantenimiento; 2,7\nTramo 3; Calzada existente; 0,9";
  }
  if (site.sector === "construction") {
    return "Frente norte; Cimentación; 0,8\nFrente central; Estructura; 1,1\nFrente sur; Vías internas; 0,5";
  }
  if (site.sector === "security") {
    return "Perímetro; Perímetro; 6\nBodegas; Bodega; 4\nAccesos; Acceso; 3\nZona verde; Zona verde; 5";
  }
  return "Lote 1; Caña; 38,5\nLote 2; Caña; 26\nLote 3; Aguacate; 21,5\nLote 4; Pastos; 14\nLote 5; Plátano; 20";
}
