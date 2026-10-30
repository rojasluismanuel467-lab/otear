import type { Position } from "../../demo/types";
import { lineLengthKm, toLocalMeters } from "../../../lib/geo.ts";

/**
 * Chainage (PK, abscisa) of road stretches. A stretch that carries its own `chainage` (the example
 * roads do) keeps it; the others are counted from 0+000 along the geometry, in list order. Either way
 * it is a convention of the example, not a reference to any real contract.
 */
type StretchLike = {
  id: string;
  outline: Position[];
  chainage?: { startM: number; endM: number };
};

/** 1,4 km → "1+400". */
export function formatChainage(km: number) {
  let whole = Math.floor(km);
  let meters = Math.round((km - whole) * 1000);
  if (meters === 1000) {
    whole += 1;
    meters = 0;
  }
  return `${whole}+${String(meters).padStart(3, "0")}`;
}

export interface ChainageRange {
  zoneId: string;
  fromKm: number;
  toKm: number;
  lengthKm: number;
}

/** Start and end chainage of each stretch, one after another from 0+000. */
export function chainageRanges(
  zones: StretchLike[],
  startKm = 0,
): ChainageRange[] {
  let cursor = startKm;
  return zones.map((zone) => {
    const lengthKm = lineLengthKm(zone.outline);
    if (zone.chainage) {
      const fromKm = zone.chainage.startM / 1000;
      const toKm = zone.chainage.endM / 1000;
      cursor = toKm;
      return { zoneId: zone.id, fromKm, toKm, lengthKm };
    }
    const range = {
      zoneId: zone.id,
      fromKm: cursor,
      toKm: cursor + lengthKm,
      lengthKm,
    };
    cursor += lengthKm;
    return range;
  });
}

/** "PK 0+000 – 1+000". */
export function rangeText(range: Pick<ChainageRange, "fromKm" | "toKm">) {
  return `PK ${formatChainage(range.fromKm)} – ${formatChainage(range.toKm)}`;
}

/**
 * Chainage in km of the point on the axis closest to `point`, counting the stretches in order.
 * Returns the stretch it falls on and how far the point is from the axis, in meters.
 */
export function chainageOf(
  point: Position,
  zones: StretchLike[],
  startKm = 0,
): { km: number; zoneId: string; offsetM: number } | undefined {
  const usable = zones.filter((zone) => zone.outline.length >= 2);
  if (!usable.length) return undefined;
  const origin = usable[0].outline[0];
  const [p] = toLocalMeters([point], origin);
  let best: { km: number; zoneId: string; offsetM: number } | undefined;
  let before = startKm * 1000;
  for (const zone of usable) {
    const xy = toLocalMeters(zone.outline, origin);
    if (zone.chainage) before = zone.chainage.startM;
    let along = 0;
    for (let i = 1; i < xy.length; i += 1) {
      const [ax, ay] = xy[i - 1];
      const [bx, by] = xy[i];
      const dx = bx - ax;
      const dy = by - ay;
      const length = Math.hypot(dx, dy);
      const t = length
        ? Math.max(
            0,
            Math.min(
              1,
              ((p[0] - ax) * dx + (p[1] - ay) * dy) / (length * length),
            ),
          )
        : 0;
      const offsetM = Math.hypot(p[0] - (ax + t * dx), p[1] - (ay + t * dy));
      if (!best || offsetM < best.offsetM) {
        best = {
          km: (before + along + t * length) / 1000,
          zoneId: zone.id,
          offsetM,
        };
      }
      along += length;
    }
    before += along;
  }
  return best;
}

/** "PK 0+420" for a point, or undefined when the axis is not known. */
export function chainageLabel(point: Position, zones: StretchLike[]) {
  const found = chainageOf(point, zones);
  return found ? `PK ${formatChainage(found.km)}` : undefined;
}
