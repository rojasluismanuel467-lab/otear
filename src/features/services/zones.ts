import { lineLengthKm, polygonAreaHa } from "../../lib/geo.ts";
import type { Position } from "../demo/types";

export interface ZoneMeasure {
  id: string;
  name: string;
  /** Hectares of a polygon zone. */
  ha?: number;
  /** Kilometres of a line zone (a road stretch has length, not area). */
  km?: number;
}

/**
 * The zones a request asks for, each with what it measures, so the operator sees which piece of
 * land makes up the total and not only a name. `asLine` is true for roads, whose zones are lines.
 */
export function measureZones(
  zones: { id: string; name: string; outline: Position[] }[],
  zoneIds: string[],
  asLine: boolean,
): ZoneMeasure[] {
  return zones
    .filter((zone) => zoneIds.includes(zone.id))
    .map((zone) => {
      if (asLine || zone.outline.length < 3)
        return {
          id: zone.id,
          name: zone.name,
          km: zone.outline.length >= 2 ? lineLengthKm(zone.outline) : 0,
        };
      return { id: zone.id, name: zone.name, ha: polygonAreaHa(zone.outline) };
    });
}

const one = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);

/** «10,4 ha» or «1,8 km». */
export const measureText = (zone: ZoneMeasure) =>
  zone.ha !== undefined ? `${one(zone.ha)} ha` : `${one(zone.km ?? 0)} km`;
