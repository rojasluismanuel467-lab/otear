import { lineLengthKm, polygonAreaHa } from "../../lib/geo.ts";
import type { Position, Sector } from "../demo/types";

/**
 * Checking an area-priced service before paying: the area ordered (from the map), the area the
 * operator says it covered (from its flight record) and the area it billed. Sugar mills have to
 * quantify what a contractor applied or flew by crossing its flight data with the mill's own
 * cartography, because the equipment records the work but not its area.
 */

/** Difference, in percent, above which billing more (or less) than was covered is flagged. */
export const DEFAULT_TOLERANCE_PCT = 5;

/** The one way every screen says what the tolerance is: a demo reference, not an agreed rule. */
export const toleranceText = (pct = DEFAULT_TOLERANCE_PCT) =>
  `Referencia de la demo: ${pct} %; se pacta con el operador (por definir).`;

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

/**
 * Hectares of the zones of a flight. A road is a line, not a surface: with `sector` set to roads the
 * answer is zero, because a line drawn with five points is not a polygon of five corners. Without
 * `sector` only the shape decides (fewer than three points is not a surface).
 */
export function orderedHa(
  zones: { id: string; outline: Position[] }[],
  zoneIds: string[],
  sector?: Sector,
): number {
  if (sector === "roads") return 0;
  return zones
    .filter((zone) => zoneIds.includes(zone.id) && zone.outline.length >= 3)
    .reduce((sum, zone) => sum + polygonAreaHa(zone.outline), 0);
}

/** Kilometres of the line zones of a road service (the measure that replaces hectares there). */
export function orderedKm(
  zones: { id: string; outline: Position[] }[],
  zoneIds: string[],
): number {
  return zones
    .filter((zone) => zoneIds.includes(zone.id) && zone.outline.length >= 2)
    .reduce((sum, zone) => sum + lineLengthKm(zone.outline), 0);
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
  const tolerancePct = input.tolerancePct ?? DEFAULT_TOLERANCE_PCT;
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

/** The sentence that answers the buyer's question first: how far is billed from covered. */
export function areaHeadline(check: AreaCheck): string {
  const { coveredHa, billedHa } = check;
  if (check.state === "over")
    return `Facturó ${ha(billedHa! - coveredHa!)} ha más de las que el operador dice haber cubierto.`;
  if (check.state === "under")
    return `Facturó ${ha(coveredHa! - billedHa!)} ha menos de las que el operador dice haber cubierto.`;
  if (check.state === "match")
    return "Lo facturado coincide con lo que el operador dice haber cubierto.";
  return "Todavía no se puede comparar lo facturado con lo cubierto.";
}

export interface AreaValue {
  /** Price per hectare used to turn hectares into pesos. */
  unitPrice: number;
  /** «quote» is the price agreed on the service; «invoice» is the invoice total over its hectares. */
  source: "quote" | "invoice";
  /** Hectares billed minus hectares covered (negative when billed less). */
  differenceHa: number;
  /** The same difference in pesos at `unitPrice`. */
  differenceCop: number;
  /** Billed hectares times the quoted price, when there is a quote to check against. */
  expectedTotal?: number;
  /** Invoice total minus `expectedTotal`. */
  totalGap?: number;
}

/**
 * Pesos behind the hectares. With the price quoted for the service it also checks the invoice total
 * against billed hectares times that price; without it the price is the invoice's own total over
 * its billed hectares, so the difference in pesos is only as good as the invoice.
 */
export function areaValue(input: {
  coveredHa?: number;
  billedHa?: number;
  invoiceTotal: number;
  quotedPrice?: number;
}): AreaValue | undefined {
  const { coveredHa, billedHa, invoiceTotal, quotedPrice } = input;
  if (coveredHa === undefined || billedHa === undefined || !(billedHa > 0))
    return undefined;
  const source = quotedPrice && quotedPrice > 0 ? "quote" : "invoice";
  const unitPrice = source === "quote" ? quotedPrice! : invoiceTotal / billedHa;
  if (!Number.isFinite(unitPrice) || !(unitPrice > 0)) return undefined;
  const differenceHa = billedHa - coveredHa;
  const expectedTotal =
    source === "quote" ? Math.round(quotedPrice! * billedHa) : undefined;
  return {
    unitPrice,
    source,
    differenceHa,
    differenceCop: Math.round(differenceHa * unitPrice),
    expectedTotal,
    totalGap:
      expectedTotal === undefined ? undefined : invoiceTotal - expectedTotal,
  };
}
