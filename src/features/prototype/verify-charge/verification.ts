import {
  areaHeadline,
  areaValue,
  checkArea,
  shownHa,
  toleranceText,
  type AreaCheck,
  type AreaValue,
} from "../../billing/coverage.ts";
import { centerOf, parseZones, polygonAreaHa } from "../../../lib/geo.ts";
import {
  FARM_CENTER,
  TODAY,
  UNREACHABLE_CONTACT,
  lotById,
  type Labor,
  type OwnFlight,
} from "./data.ts";

/**
 * Pure rules of the prototype «Verificar el cobro»: reading the operator's map, checking the farm's own
 * flight, comparing billed against applied hectares and deciding when evidence can be sent. The
 * screens only show what these functions answer; none of them calculates hectares on its own.
 */

export const pesos = (amount: number) =>
  `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(amount)}`;

export const hectares = (value: number) =>
  `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value)} ha`;

const longDate = (date: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));

export const shortDate = (date: string) =>
  new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(new Date(`${date}T12:00:00`))
    .replace(",", "");

/** «lote 7», «lotes 5 y 6», «lotes 3 a 6»: how the lots of a flight or a labor read in a sentence. */
export function lotsPhrase(ids: number[]) {
  const sorted = [...ids].sort((a, b) => a - b);
  if (sorted.length === 1) return `lote ${sorted[0]}`;
  const consecutive = sorted.every(
    (id, i) => i === 0 || id === sorted[i - 1] + 1,
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (consecutive)
    return sorted.length === 2
      ? `lotes ${first} y ${last}`
      : `lotes ${first} a ${last}`;
  return `lotes ${sorted.slice(0, -1).join(", ")} y ${last}`;
}

/* ---------- Operator's map ---------- */

export type MapProblem =
  "format" | "too-large" | "empty" | "unreadable" | "elsewhere";

export const MAX_MAP_BYTES = 2_000_000;
/** An operator's map this far from the farm belongs to another property. */
const MAX_DISTANCE_M = 3_000;

export interface MapReading {
  fileName: string;
  appliedHa: number;
  zones: { name: string; ha: number }[];
}

/** What can be known about a file before reading it: its name and size. */
export function checkMapFile(
  fileName: string,
  size: number,
): MapProblem | undefined {
  if (!/\.(kml|json|geojson)$/i.test(fileName)) return "format";
  if (size > MAX_MAP_BYTES) return "too-large";
  return undefined;
}

function distanceM(a: [number, number], b: [number, number]) {
  const cosLat = Math.cos((a[0] * Math.PI) / 180);
  return Math.hypot((a[0] - b[0]) * 111_195, (a[1] - b[1]) * 111_195 * cosLat);
}

/** Reads the hectares an operator's map shows as applied, or says why it could not. */
export function readOperatorMap(
  text: string,
  fileName: string,
): { ok: true; reading: MapReading } | { ok: false; problem: MapProblem } {
  if (!text.trim()) return { ok: false, problem: "empty" };
  const parsed = parseZones(text, fileName);
  if ("error" in parsed) return { ok: false, problem: "unreadable" };
  const zones = parsed.zones.map((zone, index) => ({
    name: zone.name ?? `Zona ${index + 1}`,
    ha: polygonAreaHa(zone.points),
    center: centerOf(zone.points),
  }));
  const total = zones.reduce((sum, zone) => sum + zone.ha, 0);
  if (!(total > 0)) return { ok: false, problem: "empty" };
  if (
    zones.some((zone) => distanceM(zone.center, FARM_CENTER) > MAX_DISTANCE_M)
  )
    return { ok: false, problem: "elsewhere" };
  return {
    ok: true,
    reading: {
      fileName,
      appliedHa: shownHa(total),
      zones: zones.map(({ name, ha }) => ({ name, ha: shownHa(ha) })),
    },
  };
}

/** Error messages in three parts: what happened, why, and what the person can do. */
export const MAP_PROBLEM_TEXT: Record<
  MapProblem,
  { what: string; why: string; todo: string }
> = {
  format: {
    what: "No pude leer ese archivo.",
    why: "Otear lee mapas en KML o GeoJSON; los Shapefile (.shp) y los archivos comprimidos todavía no.",
    todo: "Pídale al operador el mismo mapa en KML, o elija otro archivo.",
  },
  "too-large": {
    what: "El archivo es demasiado grande.",
    why: "Pasa de 2 MB y un mapa de aplicación de dos lotes no debería pesar tanto: puede traer más de lo necesario.",
    todo: "Pídale al operador solo el mapa de la labor, o elija otro archivo.",
  },
  empty: {
    what: "El archivo está vacío.",
    why: "No trae ninguna zona dibujada, así que no hay hectáreas que contar.",
    todo: "Pídale al operador que lo vuelva a enviar, o elija otro archivo.",
  },
  unreadable: {
    what: "No encontré zonas aplicadas en el archivo.",
    why: "El archivo no tiene polígonos que se puedan leer; puede estar dañado o ser de otro tipo de mapa.",
    todo: "Pídale al operador el mapa de aplicación en KML, o elija otro archivo.",
  },
  elsewhere: {
    what: "Ese mapa no está sobre su finca.",
    why: "Las zonas quedan a más de 3 km de los lotes de la Hacienda Santa Rita; puede ser el mapa de otra labor.",
    todo: "Pídale al operador el mapa de esta fumigación, o elija otro archivo.",
  },
};

/* ---------- Own flight ---------- */

export type FlightProblem = "before-labor" | "not-covering";

export function checkFlight(
  flight: OwnFlight,
  labor: Labor,
): { ok: true; measuredHa: number } | { ok: false; problem: FlightProblem } {
  if (flight.date <= labor.date) return { ok: false, problem: "before-labor" };
  if (!labor.lotIds.every((id) => flight.lotIds.includes(id)))
    return { ok: false, problem: "not-covering" };
  const measured = labor.lotIds.reduce((sum, id) => {
    const lot = lotById(id);
    if (!lot) return sum;
    return sum + (lot.outline ? polygonAreaHa(lot.outline) : lot.areaHa);
  }, 0);
  return { ok: true, measuredHa: shownHa(measured) };
}

export function flightProblemText(problem: FlightProblem, labor: Labor) {
  const lots = lotsPhrase(labor.lotIds);
  const date = longDate(labor.date);
  return problem === "before-labor"
    ? {
        what: "Ese vuelo no sirve para comprobar la labor.",
        why: "Es anterior a la labor, así que no puede mostrar lo que se hizo después.",
        todo: `Elija un vuelo posterior al ${date}.`,
      }
    : {
        what: "Ese vuelo no cubre los lotes de la labor.",
        why: `Voló otros lotes y no incluye ${lots}, así que sus fotos no muestran lo que se hizo.`,
        todo: "Elija otro de sus vuelos posteriores a la labor.",
      };
}

/* ---------- Verdict ---------- */

export interface Verification {
  check: AreaCheck;
  value?: AreaValue;
  headline: string;
  billedTotal: number;
  appliedTotal: number;
  /** The button that should lead: send evidence when billed more, accept when it matches. */
  primary: "send" | "accept" | "none";
  /** The operator billed nothing: there is no charge to accept and no difference to claim. */
  noCharge: boolean;
  /** Date of the own flight the lots were measured on. */
  flightDate: string;
  toleranceNote: string;
}

export function verifyCharge(input: {
  labor: Labor;
  appliedHa: number;
  measuredHa: number;
  flightDate: string;
}): Verification {
  const { labor, appliedHa, measuredHa, flightDate } = input;
  const noCharge = !((labor.billedHa ?? 0) > 0);
  const price = labor.pricePerHa ?? 0;
  const billedTotal = Math.round((labor.billedHa ?? 0) * price);
  const check = checkArea({
    orderedHa: measuredHa,
    coveredHa: appliedHa,
    billedHa: labor.billedHa,
    operatorNote: Boolean(labor.operatorNote),
  });
  const value = areaValue({
    coveredHa: appliedHa,
    billedHa: labor.billedHa,
    invoiceTotal: billedTotal,
    quotedPrice: price,
  });
  return {
    check,
    value,
    headline: noCharge
      ? `Su mapa muestra ${hectares(appliedHa)} aplicadas y la factura está en $0.`
      : areaHeadline(check),
    noCharge,
    flightDate,
    billedTotal,
    appliedTotal: Math.round(appliedHa * price),
    primary: noCharge
      ? "none"
      : check.state === "over"
        ? "send"
        : check.state === "match" || check.state === "under"
          ? "accept"
          : "none",
    toleranceNote: toleranceText(check.tolerancePct),
  };
}

/* ---------- Evidence ---------- */

export const MAX_MESSAGE_LENGTH = 500;
export const LINK_DAYS = 15;

/** What can go with the evidence: only what the operator needs to see, with its dates and lots. */
export const supportsFor = (labor: Labor, flightDate: string) => [
  "Mapa de aplicación del operador con las zonas sin aplicar",
  `Medición de los ${lotsPhrase(labor.lotIds)} de su vuelo del ${longDate(flightDate)}`,
  `Fotos de los ${lotsPhrase(labor.lotIds)} de su vuelo del ${longDate(flightDate)}`,
];

/** The day the evidence link stops working: the demo's «today» plus `LINK_DAYS`. */
export function linkExpiry() {
  const date = new Date(`${TODAY}T12:00:00`);
  date.setDate(date.getDate() + LINK_DAYS);
  return shortDate(date.toISOString().slice(0, 10));
}

export function evidenceMessage(labor: Labor, verification: Verification) {
  const { check, value } = verification;
  const applied = check.coveredHa;
  const billed = check.billedHa;
  if (applied === undefined || billed === undefined || !value) return "";
  const gap = Math.abs(value.differenceHa);
  const more = value.differenceHa >= 0 ? "más" : "menos";
  return `Hola. Su mapa de aplicación del ${longDate(labor.date)} muestra ${hectares(applied)} en los ${labor.lotsText.toLowerCase()} y la factura dice ${hectares(billed)}. Le comparto la evidencia para revisar la diferencia de ${hectares(Math.round(gap * 10) / 10)} (${pesos(Math.abs(value.differenceCop))}), que cobró ${more} de lo aplicado.`;
}

/** Colombian mobile numbers as WhatsApp takes them: 10 digits starting with 3, with or without +57. */
export function normalizePhone(text: string): string | undefined {
  const digits = text.replace(/\D/g, "");
  const national = digits.startsWith("57") ? digits.slice(2) : digits;
  return /^3\d{9}$/.test(national) ? `+57${national}` : undefined;
}

/** What still stops «Enviar»; empty when it can be pressed. */
export function sendBlockers(input: {
  destination: string;
  message: string;
  supports: number;
}): string[] {
  const blockers: string[] = [];
  if (!normalizePhone(input.destination))
    blockers.push(
      "Escriba el WhatsApp del operador con 10 dígitos, por ejemplo 315 642 1189.",
    );
  if (!input.message.trim()) blockers.push("Escriba el mensaje.");
  if (input.message.length > MAX_MESSAGE_LENGTH)
    blockers.push(
      `El mensaje pasa de ${MAX_MESSAGE_LENGTH} caracteres; acórtelo.`,
    );
  if (input.supports === 0) blockers.push("Elija al menos un soporte.");
  return blockers;
}

/** The example delivery: one number is reported as not delivered so the error can be reached. */
export function deliveryOutcome(destination: string): "delivered" | "failed" {
  return normalizePhone(destination) === normalizePhone(UNREACHABLE_CONTACT)
    ? "failed"
    : "delivered";
}
