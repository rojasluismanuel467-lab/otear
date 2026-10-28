import { polygonAreaHa } from "../../lib/geo.ts";
import type { Position } from "../demo/types";

/**
 * Checking an area-priced service before paying: the area ordered (from the map), the area the
 * operator says it covered (from its flight record) and the area it billed. Sugar mills have to
 * quantify what a contractor applied or flew by crossing its flight data with the mill's own
 * cartography, because the equipment records the work but not its area.
 */

export type AreaState = "match" | "over" | "under" | "unknown";

export interface AreaCheck {
  orderedHa: number;
  coveredHa?: number;
  billedHa?: number;
  tolerancePct: number;
  state: AreaState;
  /** Billed against covered, in percent (positive means billed more than was covered). */
  billedVsCoveredPct?: number;
  /** Covered against ordered, in percent of what was ordered. */
  coveredOfOrderedPct?: number;
  messages: string[];
}

/** Hectares of the zones of a flight; lines (roads) and degenerate shapes do not count. */
export function orderedHa(
  zones: { id: string; outline: Position[] }[],
  zoneIds: string[],
): number {
  return zones
    .filter((zone) => zoneIds.includes(zone.id) && zone.outline.length >= 3)
    .reduce((sum, zone) => sum + polygonAreaHa(zone.outline), 0);
}

const ha = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);
const pct = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);

export function checkArea(input: {
  orderedHa: number;
  coveredHa?: number;
  billedHa?: number;
  tolerancePct?: number;
}): AreaCheck {
  const tolerancePct = input.tolerancePct ?? 5;
  const { orderedHa: ordered, coveredHa, billedHa } = input;
  const messages: string[] = [];
  const coveredOfOrderedPct =
    coveredHa !== undefined && ordered > 0
      ? (coveredHa / ordered) * 100
      : undefined;
  if (coveredHa === undefined)
    messages.push(
      "El operador no reportó las hectáreas cubiertas en su registro de vuelo.",
    );
  else if (
    coveredOfOrderedPct !== undefined &&
    coveredOfOrderedPct < 100 - tolerancePct
  ) {
    messages.push(
      `Se cubrió el ${ha(coveredOfOrderedPct)} % de lo pedido (${ha(coveredHa)} de ${ha(ordered)} ha).`,
    );
  }
  if (billedHa === undefined)
    messages.push("Falta anotar las hectáreas que facturó el operador.");
  if (coveredHa === undefined || billedHa === undefined || coveredHa <= 0) {
    return {
      orderedHa: ordered,
      coveredHa,
      billedHa,
      tolerancePct,
      state: "unknown",
      coveredOfOrderedPct,
      messages,
    };
  }
  const billedVsCoveredPct = ((billedHa - coveredHa) / coveredHa) * 100;
  const state: AreaState =
    billedVsCoveredPct > tolerancePct
      ? "over"
      : billedVsCoveredPct < -tolerancePct
        ? "under"
        : "match";
  if (state === "over") {
    messages.push(
      `Facturó ${ha(billedHa - coveredHa)} ha más de las cubiertas (${pct(billedVsCoveredPct)} %). Pida la justificación antes de pagar.`,
    );
  } else if (state === "under") {
    messages.push(
      `Facturó ${ha(coveredHa - billedHa)} ha menos de las cubiertas (${pct(billedVsCoveredPct)} %).`,
    );
  }
  return {
    orderedHa: ordered,
    coveredHa,
    billedHa,
    tolerancePct,
    state,
    billedVsCoveredPct,
    coveredOfOrderedPct,
    messages,
  };
}
