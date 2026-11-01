import { rectangleAround } from "../../../lib/geo.ts";
import type { Position } from "../../demo/types";

/**
 * Example data for the S2 prototype «Verificar el cobro de una labor contratada» (screens 10, 11 and 12
 * of the S1 low-fidelity prototype). The figures are the ones S1 shows and must add up across screens:
 * lots 3 to 6 measure 44,0 ha, lots 5 and 6 measure 20,8 ha, the operator billed 18,4 ha, its map shows
 * 17,1 ha and the difference is 1,3 ha, which at $90.000 per hectare is $117.000. Everything is
 * synthetic: Hacienda Santa Rita, its people and companies are not a real client.
 */

/** The one «today» of the demo (the same day `FOLLOW_UP_TODAY` and `DEMO_DATE` name). */
export const TODAY = "2026-10-25";

export interface Lot {
  id: number;
  name: string;
  /** Rectangle of the lot, or nothing when the prototype only needs its area. */
  outline?: Position[];
  areaHa: number;
}

const M_PER_DEG = 111_194.93; // metres per degree of latitude (R = 6 371 008,8 m)

/** Moves a point east and north by the given metres. */
function offsetM(from: Position, eastM: number, northM: number): Position {
  const cosLat = Math.cos((from[0] * Math.PI) / 180);
  return [
    Number((from[0] + northM / M_PER_DEG).toFixed(6)),
    Number((from[1] + eastM / (M_PER_DEG * cosLat)).toFixed(6)),
  ];
}

const LOT_5_CENTER: Position = [3.36, -76.24];
const LOT_5 = { widthM: 400, depthM: 280 }; // 11,2 ha
const LOT_6 = { widthM: 400, depthM: 240 }; // 9,6 ha
const LOT_6_CENTER = offsetM(
  LOT_5_CENTER,
  0,
  -(LOT_5.depthM + LOT_6.depthM) / 2,
);
/** The operator's map shows the north 147,5 m of lot 6 sprayed (5,9 ha); the south strip is missing. */
const SPRAYED_DEPTH_M = 147.5;
const LOT_6_SPRAYED_CENTER = offsetM(
  LOT_6_CENTER,
  0,
  (LOT_6.depthM - SPRAYED_DEPTH_M) / 2,
);

export const LOTS: Lot[] = [
  { id: 3, name: "Lote 3", areaHa: 9.6 },
  { id: 4, name: "Lote 4", areaHa: 13.6 },
  {
    id: 5,
    name: "Lote 5",
    areaHa: 11.2,
    outline: rectangleAround(LOT_5_CENTER, LOT_5.widthM, LOT_5.depthM),
  },
  {
    id: 6,
    name: "Lote 6",
    areaHa: 9.6,
    outline: rectangleAround(LOT_6_CENTER, LOT_6.widthM, LOT_6.depthM),
  },
];

export const lotById = (id: number) => LOTS.find((lot) => lot.id === id);

/** What the operator's application map draws: lot 5 in full and the north part of lot 6. */
const SPRAYED_ZONES: { name: string; outline: Position[] }[] = [
  {
    name: "Lote 5 aplicado",
    outline: rectangleAround(LOT_5_CENTER, LOT_5.widthM, LOT_5.depthM),
  },
  {
    name: "Lote 6 aplicado",
    outline: rectangleAround(
      LOT_6_SPRAYED_CENTER,
      LOT_6.widthM,
      SPRAYED_DEPTH_M,
    ),
  },
];

/** KML text of those zones, in the order KML wants them: longitude, latitude, altitude. */
function kmlOf(zones: { name: string; outline: Position[] }[]) {
  const placemarks = zones
    .map(({ name, outline }) => {
      const ring = [...outline, outline[0]]
        .map(([lat, lng]) => `${lng},${lat},0`)
        .join(" ");
      return `<Placemark><name>${name}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>${ring}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Aplicación lotes 5 y 6</name>${placemarks}</Document></kml>`;
}

export const EXAMPLE_MAP_NAME = "aplicacion_lotes5-6.kml";
export const EXAMPLE_MAP_TEXT = kmlOf(SPRAYED_ZONES);
/** Where the farm is, to tell an operator's map of another farm from this one. */
export const FARM_CENTER: Position = LOT_5_CENTER;

export interface OwnFlight {
  id: string;
  date: string;
  photos: number;
  lotIds: number[];
}

/** Hernando's own flights: only the 24 October one is after the labor and covers lots 5 and 6. */
export const OWN_FLIGHTS: OwnFlight[] = [
  { id: "v-24-oct", date: "2026-10-24", photos: 412, lotIds: [3, 4, 5, 6] },
  { id: "v-18-oct", date: "2026-10-18", photos: 96, lotIds: [1, 2] },
  { id: "v-12-oct", date: "2026-10-12", photos: 388, lotIds: [3, 4, 5, 6] },
];

export type LaborKind = "contracted" | "own" | "task";
export type LaborStatus =
  "to-verify" | "claimed" | "accepted" | "done" | "assigned";

export interface Labor {
  id: string;
  name: string;
  lotIds: number[];
  /** Words for the lots as the list shows them, for example «Lotes 5 y 6». */
  lotsText: string;
  doneBy: string;
  date: string;
  kind: LaborKind;
  status: LaborStatus;
  /** Contracted labors: hectares the operator billed and the agreed price per hectare. */
  billedHa?: number;
  pricePerHa?: number;
  /** Own labors: what they cost. */
  cost?: number;
  invoiceNo?: string;
  /** What the operator wrote with the invoice, if anything. */
  operatorNote?: string;
  /** WhatsApp number of the operator, as the farm has it. */
  contact?: string;
}

export const OPERATOR_NAME = "Agrodron del Valle";
export const OPERATOR_CONTACT = "+57 315 642 1189";
/** A number the example delivery reports as not delivered, so the error can be reached on purpose. */
export const UNREACHABLE_CONTACT = "+57 300 000 0000";

export const TRACKED_LABOR_ID = "fumigacion-5-6";

const fumigation: Labor = {
  id: TRACKED_LABOR_ID,
  name: "Fumigación con dron",
  lotIds: [5, 6],
  lotsText: "Lotes 5 y 6",
  doneBy: OPERATOR_NAME,
  date: "2026-10-16",
  kind: "contracted",
  status: "to-verify",
  billedHa: 18.4,
  pricePerHa: 90_000,
  invoiceNo: "AV-0412",
  contact: OPERATOR_CONTACT,
};

const baseLabors: Labor[] = [
  fumigation,
  {
    id: "abonada-7",
    name: "Abonada",
    lotIds: [7],
    lotsText: "Lote 7",
    doneBy: "Cuadrilla de la hacienda",
    date: "2026-10-20",
    kind: "own",
    status: "done",
    cost: 2_349_000,
  },
  {
    id: "plateo-9-16",
    name: "Plateo",
    lotIds: [9, 10],
    lotsText: "Lotes 9 y 10",
    doneBy: "Cuadrilla de la hacienda",
    date: "2026-10-22",
    kind: "own",
    status: "done",
    cost: 1_180_000,
  },
  {
    id: "maleza-4",
    name: "Revisar la maleza del lote 4",
    lotIds: [4],
    lotsText: "Lote 4",
    doneBy: "Jhon Fredy Mina (mayordomo)",
    date: "2026-10-27",
    kind: "task",
    status: "assigned",
  },
];

/** The data cases the validation panel can load, to put the prototype under extreme content. */
export type Scenario =
  | "normal"
  | "long-operator"
  | "long-note"
  | "zero-charge"
  | "huge-charge"
  | "forty-labors"
  | "no-labors";

export const LONG_OPERATOR_NAME =
  "Servicios Aéreos de Precisión Agrícola y Fumigación del Valle del Cauca S.A.S.";

export const LONG_NOTE =
  "Buenas tardes, ingeniero. Le escribo por la factura AV-0412 de la fumigación de los lotes 5 y 6. Durante la aplicación del viernes 16 de octubre tuvimos viento de más de doce kilómetros por hora entre las diez y las doce, así que repetimos dos franjas del borde norte del lote 5 para asegurar la cobertura, y por eso facturamos las hectáreas que el dron recorrió y no solo las que quedaron dibujadas en el mapa de aplicación. El mapa que le enviamos es el que genera el controlador de vuelo y no marca las pasadas repetidas. Si usted lo prefiere, podemos pasar por la hacienda esta semana con el piloto y el registro de las baterías para mostrarle el recorrido completo y aclarar cualquier diferencia antes del pago.";

export const SCENARIO_LABELS: Record<Scenario, string> = {
  normal: "Datos de S1 (normal)",
  "long-operator": `Operador con un nombre de ${LONG_OPERATOR_NAME.length} caracteres`,
  "long-note": `Nota del operador de ${LONG_NOTE.length} caracteres`,
  "zero-charge": "Cobro de $0 (0 ha facturadas)",
  "huge-charge": "Cobro de casi $50.000.000 ($2.717.391 por ha)",
  "forty-labors": "40 labores en la lista",
  "no-labors": "0 labores en la lista",
};

const LABOR_NAMES = [
  "Abonada",
  "Plateo",
  "Control de maleza",
  "Riego",
  "Fumigación con dron",
  "Resiembra",
];

function manyLabors(count: number): Labor[] {
  const extra: Labor[] = Array.from({ length: count - baseLabors.length }).map(
    (_, index) => {
      const lot = (index % 12) + 1;
      const own = index % 3 !== 0;
      return {
        id: `labor-${index + 5}`,
        name: LABOR_NAMES[index % LABOR_NAMES.length],
        lotIds: [lot],
        lotsText: `Lote ${lot}`,
        doneBy: own ? "Cuadrilla de la hacienda" : OPERATOR_NAME,
        date: `2026-10-${String((index % 24) + 1).padStart(2, "0")}`,
        kind: own ? "own" : "contracted",
        status: own ? "done" : "to-verify",
        cost: own ? 900_000 + index * 15_000 : undefined,
        billedHa: own ? undefined : 8 + index / 4,
        pricePerHa: own ? undefined : 90_000,
      } satisfies Labor;
    },
  );
  return [...baseLabors, ...extra];
}

/** The list of labors a data case shows. */
export function laborsFor(scenario: Scenario): Labor[] {
  switch (scenario) {
    case "long-operator":
      return baseLabors.map((labor) =>
        labor.id === TRACKED_LABOR_ID
          ? { ...labor, doneBy: LONG_OPERATOR_NAME }
          : labor,
      );
    case "long-note":
      return baseLabors.map((labor) =>
        labor.id === TRACKED_LABOR_ID
          ? { ...labor, operatorNote: LONG_NOTE }
          : labor,
      );
    case "zero-charge":
      return baseLabors.map((labor) =>
        labor.id === TRACKED_LABOR_ID ? { ...labor, billedHa: 0 } : labor,
      );
    case "huge-charge":
      return baseLabors.map((labor) =>
        labor.id === TRACKED_LABOR_ID
          ? { ...labor, pricePerHa: 2_717_391 }
          : labor,
      );
    case "forty-labors":
      return manyLabors(40);
    case "no-labors":
      return [];
    default:
      return baseLabors;
  }
}
