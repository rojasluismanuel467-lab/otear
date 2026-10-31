import { preparationGroups } from "@/features/flights/planning/preparation-items";
import { newEvidence, withSignature } from "@/features/traceability/integrity";
import { autofill, templates } from "@/features/traceability/templates";
import { defaultPlan } from "@/features/fleet/fleet";
import { planMission } from "@/features/flights/mission-plan";
import { ROAD_ILLUSTRATION_URL } from "@/lib/illustration";
import { canaExampleValues } from "@/features/config/preset-fields";
import { dayText, FOLLOW_UP_TODAY } from "@/features/flights/follow-up";
import {
  lineLengthKm,
  pointAlongLine,
  pointInsideOutline,
  polygonAreaHa,
  splitLineByFractions,
} from "@/lib/geo";
import type {
  Aircraft,
  Capture,
  Battery,
  Evidence,
  MaintenanceRecord,
  PartMark,
  Sector,
  Finding,
  FindingFollowUp,
  FindingSuggestion,
  Flight,
  FlightDocument,
  Invoice,
  Party,
  Payment,
  Position,
  ServiceEvent,
  ServiceRequest,
  Site,
  Zone,
} from "./types";

/** The demo's only «today»: it is `FOLLOW_UP_TODAY`, so no screen can disagree. */
export const DEMO_DATE = FOLLOW_UP_TODAY;
/**
 * Outlines were traced by hand over satellite imagery so each zone sits on a real field, road
 * stretch, building plot or industrial block. The people, companies and works are still examples.
 */
const cropByZone: Record<string, string> = {
  "zone-sr-3": "Caña · plantilla",
  "zone-sr-4": "Caña · primera soca",
  "zone-sr-5": "Caña · segunda soca",
};

const formatHa = (value: number) => value.toFixed(1).replace(".", ",");
const pesos = (value: number) =>
  `$ ${new Intl.NumberFormat("es-CO").format(Math.round(value))}`;

/** «los lotes», «los tramos»…: the site's own word for what it is divided into. */
function zoneWords(site: Site) {
  const word = site.zoneLabel.toLowerCase();
  return { word, the: `los ${word}`, all: `todos los ${word}` };
}

function describeZone(site: Site, zone: Zone) {
  if (site.sector === "roads") {
    const km = lineLengthKm(zone.outline).toFixed(1).replace(".", ",");
    return `Seguimiento de pavimento · ${km} km`;
  }
  const ha = polygonAreaHa(zone.outline).toFixed(1).replace(".", ",");
  return `${cropByZone[zone.id] ?? "Zona"} · ${ha} ha`;
}

/**
 * Abscissa (PK) of a road stretch, written the way a road contract does: «PK 12+400» is 12 km and
 * 400 m from the origin of the contract. The example road starts at PK 12+000.
 */
const ROAD_START_M = 12_000;
const formatPk = (meters: number) => {
  const whole = Math.round(meters);
  return `${Math.floor(whole / 1000)}+${String(whole % 1000).padStart(3, "0")}`;
};

/** The centre line traced over the real road, in one piece (it used to be two zones). */
const roadCenterline: Position[] = [
  [3.799, -76.31076],
  [3.80114, -76.30979],
  [3.80349, -76.30893],
  [3.80542, -76.3084],
  [3.80756, -76.30829],
  [3.8097, -76.3085],
  [3.81184, -76.30825],
  [3.81399, -76.30797],
  [3.81548, -76.3076],
  [3.8172, -76.307],
  [3.81912, -76.30646],
];

/** Five stretches of 400 m and a shorter one at the end, each with its own range of PK. */
const roadZones: Zone[] = (() => {
  const totalM = lineLengthKm(roadCenterline) * 1000;
  const cuts = [400, 400, 400, 400, 400, totalM - 2000];
  const parts = splitLineByFractions(roadCenterline, cuts);
  let from = ROAD_START_M;
  return parts.map((outline, index) => {
    const startM = from;
    const endM = from + cuts[index];
    from = endM;
    return {
      id: `zone-vh-${index + 1}`,
      name: `PK ${formatPk(startM)} – ${formatPk(endM)}`,
      description: "",
      outline,
      chainage: { startM, endM },
    };
  });
})();

const baseSites: Site[] = [
  {
    id: "santa-rita",
    name: "Hacienda Santa Rita",
    sector: "agriculture",
    sectorLabel: "Agricultura",
    location: "Guacarí, Valle del Cauca",
    zoneLabel: "Lotes",
    center: [3.77295, -76.31822],
    imageUrl: "/images/aerial-field.jpg",
    zones: [
      {
        id: "zone-sr-3",
        name: "Lote 3",
        description: "",
        outline: [
          [3.7759, -76.32035],
          [3.77509, -76.31765],
          [3.7712, -76.3187],
          [3.77191, -76.32138],
        ],
      },
      {
        id: "zone-sr-4",
        name: "Lote 4",
        description: "",
        outline: [
          [3.77506, -76.31763],
          [3.77464, -76.31624],
          [3.77079, -76.31734],
          [3.7712, -76.3187],
        ],
      },
      {
        id: "zone-sr-5",
        name: "Lote 5",
        description: "",
        outline: [
          [3.77464, -76.31624],
          [3.7742, -76.31495],
          [3.77041, -76.316],
          [3.77079, -76.31734],
        ],
      },
    ],
  },
  {
    id: "via-la-habana",
    name: "Troncal de Occidente · Guacarí–Buga",
    sector: "roads",
    sectorLabel: "Carreteras",
    location: "Guacarí – Buga, Valle del Cauca",
    zoneLabel: "Tramos",
    center: [3.80756, -76.30829],
    imageUrl: ROAD_ILLUSTRATION_URL,
    zones: [...roadZones],
  },
  {
    id: "obra-alameda",
    name: "Obra Alameda",
    sector: "construction",
    sectorLabel: "Construcción",
    location: "Cali, Valle del Cauca",
    zoneLabel: "Frentes",
    center: [3.40872, -76.53076],
    imageUrl: "/images/aerial-road.jpg",
    zones: [
      {
        id: "zone-oa-1",
        name: "Frente norte",
        description: "Movimiento de tierras",
        outline: [
          [3.40937, -76.53141],
          [3.4092, -76.53001],
          [3.40866, -76.53005],
          [3.40881, -76.53143],
        ],
      },
      {
        id: "zone-oa-2",
        name: "Frente sur",
        description: "Avance de cimentación",
        outline: [
          [3.40881, -76.53143],
          [3.40866, -76.53005],
          [3.40802, -76.53012],
          [3.40823, -76.53146],
        ],
      },
    ],
  },
  {
    id: "parque-del-pacifico",
    name: "Parque del Pacífico",
    sector: "security",
    sectorLabel: "Vigilancia",
    location: "Yumbo, Valle del Cauca",
    zoneLabel: "Sectores",
    center: [3.5404, -76.4983],
    imageUrl: "/images/aerial-road.jpg",
    zones: [
      {
        id: "zone-pp-1",
        name: "Sector occidental",
        description: "Cerramiento y accesos",
        outline: [
          [3.54229, -76.49984],
          [3.54161, -76.49686],
          [3.53893, -76.49729],
          [3.53834, -76.49973],
          [3.53882, -76.50089],
          [3.54032, -76.50048],
          [3.54118, -76.50012],
        ],
      },
      {
        id: "zone-pp-2",
        name: "Sector oriental",
        description: "Perímetro y bodegas",
        outline: [
          [3.54161, -76.49686],
          [3.54233, -76.49619],
          [3.54198, -76.49439],
          [3.54075, -76.493],
          [3.53834, -76.49312],
          [3.53877, -76.49589],
          [3.53893, -76.49729],
        ],
      },
    ],
  },
  {
    id: "mina-mulalo",
    name: "Mina de caliza · Mulaló",
    sector: "mining",
    sectorLabel: "Minería",
    location: "Mulaló, Yumbo, Valle del Cauca",
    zoneLabel: "Bancos",
    center: [3.64204, -76.47632],
    imageUrl: "/images/aerial-road.jpg",
    zones: [
      {
        id: "zone-mm-1",
        name: "Banco norte",
        description: "Arranque y cargue",
        outline: [
          [3.64847, -76.47729],
          [3.64879, -76.47557],
          [3.64847, -76.47407],
          [3.64697, -76.47396],
          [3.64568, -76.47407],
          [3.64397, -76.47418],
          [3.64397, -76.47836],
          [3.64483, -76.47815],
          [3.64654, -76.47772],
          [3.64783, -76.4775],
        ],
      },
      {
        id: "zone-mm-2",
        name: "Banco central",
        description: "Perforación y voladura",
        outline: [
          [3.64397, -76.47836],
          [3.64397, -76.47418],
          [3.64269, -76.47407],
          [3.6414, -76.47429],
          [3.64055, -76.4745],
          [3.63947, -76.47493],
          [3.63947, -76.47922],
          [3.64097, -76.47879],
          [3.64269, -76.47858],
        ],
      },
      {
        id: "zone-mm-3",
        name: "Banco sur",
        description: "Rampa de acceso y acopio",
        outline: [
          [3.63947, -76.47922],
          [3.63947, -76.47493],
          [3.63883, -76.47407],
          [3.63755, -76.47407],
          [3.63626, -76.47429],
          [3.63541, -76.47514],
          [3.6353, -76.47643],
          [3.63573, -76.47836],
          [3.63669, -76.47943],
          [3.63776, -76.47986],
          [3.63883, -76.47954],
        ],
      },
    ],
  },
];

const schedules: Record<string, Site["schedule"]> = {
  "obra-alameda": { start: "2026-06-01", end: "2027-02-15", targetLevels: 8 },
  "via-la-habana": { start: "2026-06-15", end: "2027-01-31" },
  "mina-mulalo": { start: "2026-06-01", end: "2027-03-31" },
};

export const sites: Site[] = baseSites.map((site) => ({
  ...site,
  zones: site.zones.map((zone) => ({
    ...zone,
    description: zone.description || describeZone(site, zone),
  })),
  ...(schedules[site.id] ? { schedule: schedules[site.id] } : {}),
}));

const captureDates = [
  "2026-07-18",
  "2026-08-22",
  "2026-09-19",
  "2026-10-10",
  "2026-10-24",
];
// One row per zone, one column per capture date. Works are % progress, crops are vigor (0 to 1).
const captureSeries: Partial<
  Record<Site["sector"], { levels?: number[]; zones: number[][] }>
> = {
  construction: {
    levels: [1.0, 2.2, 3.0, 3.4, 3.6],
    zones: [
      [30, 52, 68, 74, 76],
      [10, 28, 40, 44, 45],
    ],
  },
  // Progress of the pavement works by stretch (PK 12+000 onwards). The fifth stretch stalls.
  roads: {
    zones: [
      [20, 45, 70, 85, 100],
      [15, 38, 62, 80, 95],
      [10, 28, 50, 66, 80],
      [8, 20, 38, 50, 60],
      [5, 15, 25, 25, 30],
      [2, 8, 14, 18, 22],
    ],
  },
  // Share of the volume planned for each bench that has been removed. The third bench stalls.
  mining: {
    zones: [
      [28, 45, 60, 72, 80],
      [12, 22, 30, 36, 40],
      [4, 9, 12, 12, 13],
    ],
  },
  agriculture: {
    zones: [
      [0.52, 0.68, 0.78, 0.81, 0.79],
      [0.5, 0.66, 0.75, 0.72, 0.62],
      [0.45, 0.6, 0.7, 0.76, 0.8],
    ],
  },
};

function captureFor(site: Site, date: string): Capture | undefined {
  const series = captureSeries[site.sector];
  const column = captureDates.indexOf(date);
  if (!series || column < 0) return undefined;
  const values: Record<string, number> = {};
  site.zones.forEach((zone, row) => {
    const value = series.zones[row]?.[column];
    if (value !== undefined) values[zone.id] = value;
  });
  return { values, levels: series.levels?.[column] };
}

const allChecklist = preparationGroups.flatMap((group) => group.items);

/** Four older completed flights per site, so the history has something to summarize. */
const history = [
  {
    n: 3,
    gsdCm: 2.2,
    overlapPct: 70,
    date: "2026-07-18",
    time: "07:30",
    duration: 38,
    distance: 6.1,
    photoCount: 118,
    log: {
      weather: "clear",
      windKmh: 8,
      maxAltitudeM: 105,
      batteries: ["BAT-A10", "BAT-A11"],
      authorizationRef: "AUT-2026-0233",
      incidents: "",
    },
  },
  {
    n: 4,
    gsdCm: 2.0,
    overlapPct: 75,
    date: "2026-08-22",
    time: "08:00",
    duration: 44,
    distance: 6.6,
    photoCount: 131,
    log: {
      weather: "cloudy",
      windKmh: 14,
      maxAltitudeM: 110,
      batteries: ["BAT-A10", "BAT-A12"],
      authorizationRef: "AUT-2026-0301",
      incidents: "",
    },
  },
  {
    n: 5,
    gsdCm: 2.1,
    overlapPct: 80,
    date: "2026-09-19",
    time: "07:45",
    duration: 41,
    distance: 6.3,
    photoCount: 126,
    log: {
      weather: "clear",
      windKmh: 11,
      maxAltitudeM: 108,
      batteries: ["BAT-A11", "BAT-A13"],
      authorizationRef: "AUT-2026-0357",
      incidents: "",
    },
  },
  {
    n: 6,
    gsdCm: 2.3,
    overlapPct: 75,
    date: "2026-10-10",
    time: "09:10",
    duration: 33,
    distance: 5.2,
    photoCount: 94,
    log: {
      weather: "rain",
      windKmh: 27,
      maxAltitudeM: 95,
      batteries: ["BAT-A12", "BAT-A13"],
      authorizationRef: "AUT-2026-0398",
      incidents: "Pérdida breve de enlace al norte; se retomó el recorrido.",
    },
  },
] as const;

function historyFor(
  site: Site,
  common: Omit<
    Flight,
    | "id"
    | "title"
    | "objective"
    | "date"
    | "time"
    | "status"
    | "duration"
    | "distance"
    | "photoCount"
  >,
): Flight[] {
  return history.map((item) => ({
    ...common,
    id: `flight-${site.id}-0${item.n}`,
    title: "Seguimiento mensual",
    objective: `Registro periódico para comparar el estado de ${zoneWords(site).the}.`,
    date: item.date,
    time: item.time,
    status: "completed",
    duration: item.duration,
    distance: item.distance,
    photoCount: item.photoCount,
    checklist: allChecklist,
    capture: captureFor(site, item.date),
    ...(item.n === 4 || item.n === 6
      ? {
          drone: "DJI Matrice 350 RTK",
          aircraftId: `aircraft-${site.id}-2`,
        }
      : {}),
    log: {
      ...item.log,
      batteries:
        item.n === 4 || item.n === 6
          ? ["BAT-B01", "BAT-B02"]
          : [...item.log.batteries],
      sensor: "rgb",
      // Camera settings changed a little from month to month, as they do in practice.
      gsdCm: item.gsdCm,
      overlapPct: item.overlapPct,
      controlPoints: false,
      deliverables: ["Fotografías originales (JPG)", "Ortomosaico (GeoTIFF)"],
    },
    // Past flights covered one or two zones, with the first zone flown most often.
    zoneIds: site.zones
      .filter((_, index) => index === 0 || (index + item.n) % 2 === 0)
      .map((zone) => zone.id),
  }));
}

/** A point that always falls on the zone (or along the road), so markers never float off it. */
function findingPosition(
  site: Site,
  zone: Zone,
  u: number,
  v: number,
): [number, number] {
  const point =
    site.sector === "roads"
      ? pointAlongLine(zone.outline, v)
      : pointInsideOutline(zone.outline, u, v);
  return [point[0], point[1]];
}

/**
 * On a road a finding is cited by abscissa and side, not by latitude and longitude. The example
 * values are deterministic: the side alternates with the position along the stretch.
 */
function findingLocation(site: Site, zone: Zone, v: number) {
  if (site.sector !== "roads" || !zone.chainage) return {};
  const at =
    zone.chainage.startM + v * (zone.chainage.endM - zone.chainage.startM);
  const side =
    Math.round(v * 20) % 2 === 0 ? "margen derecha" : "margen izquierda";
  return { locationLabel: `PK ${formatPk(at)} · ${side}` };
}

/** What the evidence image is: only the agriculture site has a photo of its own kind of place. */
const exampleSource = (site: Site, source: string) =>
  site.sector === "agriculture"
    ? source
    : `${source} · imagen ilustrativa, no es del sitio`;

/** Roads lead the description with the abscissa, so it reads before any coordinate. */
const describeAt = (location: { locationLabel?: string }, text: string) =>
  location.locationLabel ? `${location.locationLabel}. ${text}` : text;

/**
 * Zones the follow-up flight of 29 October covers. In agriculture it leaves out the second lot, which
 * is the one whose vigor keeps falling, so the next-flight assistant has something real to propose;
 * the other sites already have everything the history flags on the agenda.
 */
function bookedZoneIds(site: Site) {
  return site.zones
    .filter((_, index) => site.sector !== "agriculture" || index !== 1)
    .map((zone) => zone.id);
}

/**
 * How a site's services are priced, in the example data: by hectare where an area is what is
 * ordered (crops, mine benches), per flight where it is not (a road has length, a building site
 * only a couple of hectares, a fence is flown as a loop). Quotes, invoices and flight records all follow it, so the money adds up.
 */
const priceUnit = (site: Site): "ha" | "flight" =>
  site.sector === "agriculture" || site.sector === "mining" ? "ha" : "flight";
/** Example tariff of the monthly follow-up, per hectare. Not a market price. */
const HA_RATE = 30_000;
/** Example flat fee of the same follow-up where it is priced per flight. */
const FLIGHT_FEE = 700_000;

/** Hectares of the given zones, to one decimal: what an invoice shows and what the area check compares. */
const orderedHaOf = (site: Site, zoneIds: string[]) =>
  Math.round(
    site.zones
      .filter((zone) => zoneIds.includes(zone.id))
      .reduce((sum, zone) => sum + polygonAreaHa(zone.outline), 0) * 10,
  ) / 10;

const flightDrafts: Flight[] = sites.flatMap((site, index) => {
  const common = {
    siteId: site.id,
    pilot: "Camilo Torres",
    operator: "AeroVisión del Valle",
    manager: "Luis Rojas",
    drone: "DJI Mavic 3 Enterprise",
    aircraftId: `aircraft-${site.id}-1`,
    zoneIds: site.zones.map((zone) => zone.id),
    route: [],
    checklist: [
      "Definir objetivo y recorrido",
      "Revisar equipo y baterías",
      "Revisar condiciones meteorológicas",
    ],
  };
  return [
    {
      ...common,
      id: `flight-${site.id}-01`,
      title: [
        "Inspección de labores",
        "Seguimiento de intervención vial",
        "Avance de obra",
        "Inspección de perímetro",
        "Levantamiento de bancos y taludes",
      ][index],
      objective: [
        "Revisar labores y localizar puntos por verificar en campo.",
        "Documentar pavimento, drenajes y taludes de los tramos intervenidos.",
        "Documentar el avance de los frentes y los puntos pendientes.",
        "Documentar el cerramiento y los accesos para revisión del responsable.",
        "Medir el avance de cada banco, el volumen removido y el estado de los taludes.",
      ][index],
      date: "2026-10-24",
      time: "08:30",
      status: "completed",
      duration: 42,
      distance: 6.4,
      photoCount: 128,
      capture: captureFor(site, "2026-10-24"),
      log: {
        weather: "clear",
        windKmh: 12,
        maxAltitudeM: 110,
        batteries: ["BAT-A12", "BAT-A13"],
        authorizationRef: "AUT-2026-0412",
        incidents: "",
        sensor: "rgb",
        gsdCm: 2.1,
        overlapPct: 75,
        controlPoints: false,
        deliverables: ["Fotografías originales (JPG)", "Ortomosaico (GeoTIFF)"],
        debrief:
          "Cobertura completa. Revisar la esquina norte con más traslape en el próximo vuelo.",
      },
    },
    {
      ...common,
      id: `flight-${site.id}-02`,
      title: "Seguimiento programado",
      objective: `Comparar el estado de ${zoneWords(site).the} con el registro anterior.`,
      zoneIds: bookedZoneIds(site),
      date: "2026-10-29",
      time: "07:00",
      status: "scheduled",
      duration: 35,
      distance: 5.8,
      photoCount: 0,
    },
    // The flight behind the service «Mapeo de la última zona»: another operator, delivered on the 24th.
    {
      ...common,
      id: `flight-${site.id}-07`,
      title: "Mapeo de la última zona",
      objective:
        "Ortomosaico y modelo de superficie para actualizar la cartografía.",
      zoneIds: site.zones.slice(-1).map((zone) => zone.id),
      date: "2026-10-24",
      time: "10:30",
      status: "completed",
      pilot: "Piloto de Drones del Pacífico (ejemplo)",
      operator: "Drones del Pacífico (ejemplo)",
      drone: "DJI Matrice 350 RTK",
      aircraftId: undefined,
      checklist: [],
      duration: 0,
      distance: 0,
      photoCount: 0,
    },
    ...historyFor(site, common),
  ];
});

/**
 * The first flight of the agriculture site ends early: the battery runs out with the last lines of
 * the last lot still to fly (about 94 % of the area is reached), so the area check in Pagos has
 * something to find, and the map shows where the gap is.
 */
const EARLY_END_AT = 0.84;

/**
 * Every flight gets its route from the planner, so the route, the kilometres, the minutes, the
 * photos and the hectares covered agree with each other (and with the camera and overlap the log
 * says were used). Scheduled flights keep zero photos: nothing has been delivered.
 */
export const initialFlights: Flight[] = flightDrafts.map((draft) => {
  const site = sites.find((item) => item.id === draft.siteId);
  if (!site) return draft;
  const early =
    site.sector === "agriculture" &&
    draft.status === "completed" &&
    draft.id.endsWith("-01");
  const overlap = draft.log?.overlapPct;
  const plan = planMission({
    sector: site.sector,
    zones: site.zones.filter((zone) => draft.zoneIds.includes(zone.id)),
    settings: {
      ...(draft.log?.gsdCm !== undefined ? { gsdCm: draft.log.gsdCm } : {}),
      ...(overlap !== undefined
        ? { sideOverlap: overlap / 100, frontOverlap: overlap / 100 }
        : {}),
    },
    ...(early ? { endEarlyAt: EARLY_END_AT } : {}),
  });
  const flight: Flight = {
    ...draft,
    route: plan.route,
    distance: Math.round(plan.distanceKm * 10) / 10,
    duration: Math.round(plan.durationMin),
    photoCount: draft.status === "completed" ? plan.photoCount : 0,
    // Example values for the sugar-cane preset's fields; they stay hidden unless that preset is on.
    ...(site.sector === "agriculture"
      ? { customValues: canaExampleValues(draft.date) }
      : {}),
  };
  if (
    priceUnit(site) !== "ha" ||
    !flight.log ||
    !(draft.status === "completed")
  )
    return flight;
  // The operator reports hectares: what the route reached, or a bit under for the complete ones.
  const coveredHa = early
    ? plan.coveredHa
    : plan.orderedHa * (flight.id.endsWith("-01") ? 1 : 0.99);
  const missing = plan.uncovered[0];
  const missingZone = site.zones.find((zone) => zone.id === missing?.zoneId);
  return {
    ...flight,
    log: {
      ...flight.log,
      coveredHa: Math.round(coveredHa * 10) / 10,
      ...(early && missing && missingZone
        ? {
            debrief: `Vuelo cerrado antes de terminar las últimas líneas de ${missingZone.name} por batería. Quedaron ${formatHa(missing.ha)} ha sin cubrir; reprogramar esas líneas.`,
          }
        : {}),
    },
  };
});

const findingNames = {
  agriculture: [
    "Cobertura irregular",
    "Zona por revisar",
    "Seguimiento de resiembra",
  ],
  roads: [
    "Deterioro superficial",
    "Drenaje por revisar",
    "Seguimiento de talud",
  ],
  construction: [
    "Material por retirar",
    "Frente por verificar",
    "Seguimiento de avance",
  ],
  security: [
    "Cerramiento por revisar",
    "Acceso por verificar",
    "Seguimiento de perímetro",
  ],
  mining: [
    "Grieta en la cresta del talud",
    "Agua empozada en el banco",
    "Seguimiento de la rampa",
  ],
};

/** The company's word for a finding in each sector's own vocabulary; the screens may swap it for the one set in Configuración. */
const operatorSourceWord: Record<Sector, string> = {
  agriculture: "Hallazgo",
  roads: "No conformidad",
  construction: "Observación",
  security: "Novedad",
  mining: "Novedad de talud",
};

/**
 * What each sector's seeded findings say, in that sector's own terms: what to check and where. The
 * titles are in `findingNames`; the three texts of `current` follow them in the same order.
 */
const findingTexts: Record<
  Sector,
  { current: [string, string, string]; past: string }
> = {
  agriculture: {
    current: [
      "El operador marcó un tramo del lote con la cobertura menos pareja que la del resto. Revise la foto y recorra el lote para ver si hay fallas de siembra antes de decidir.",
      "El operador marcó una zona con un color distinto al del cultivo vecino. Revise la foto y verifíquela en el lote antes de decidir.",
      "Punto de seguimiento de la resiembra anterior. Compárelo con el vuelo previo y confirme en el lote si las plantas prendieron.",
    ],
    past: "Punto de un vuelo anterior, ya revisado por el responsable en el escenario de ejemplo.",
  },
  roads: {
    current: [
      "El operador marcó un punto de la calzada con deterioro (grietas o material suelto). Revise la foto, verifique en la vía y decida si exige la reparación al contratista.",
      "El operador marcó una obra de drenaje (cuneta o alcantarilla) con posible obstrucción. Verifique en la vía si hay sedimento o agua represada antes de pedir su limpieza.",
      "Punto de seguimiento de un talud. Compárelo con el recorrido anterior y verifique en la vía si hay cambios o material caído.",
    ],
    past: "Punto de un recorrido anterior, ya revisado por la interventoría en el escenario de ejemplo.",
  },
  construction: {
    current: [
      "El operador marcó material acopiado en el frente. Verifique en la obra si debe retirarse y quién responde por hacerlo.",
      "El operador marcó un frente con un avance distinto al previsto (losa, estructura o acabado). Compárelo con el programa y verifíquelo en la obra.",
      "Punto de seguimiento del avance de un frente. Compárelo con el vuelo anterior y confirme en la obra el estado del acabado.",
    ],
    past: "Punto de un vuelo anterior, ya revisado por la residencia de obra en el escenario de ejemplo.",
  },
  security: {
    current: [
      "El operador marcó un tramo del cerramiento con posible daño o abertura. Verifique en el perímetro y decida si se repara.",
      "El operador marcó un acceso con algo fuera de lo normal (puerta abierta u obstáculo). Verifíquelo con el personal de la ronda.",
      "Punto de seguimiento del perímetro. Compárelo con la ronda anterior y verifique en el sitio si hubo cambios.",
    ],
    past: "Punto de una ronda anterior, ya revisado por el supervisor en el escenario de ejemplo.",
  },
  mining: {
    current: [
      "El operador marcó una línea que podría ser una grieta junto a la cresta del talud. Verifíquela en el banco con el equipo geotécnico antes de operar cerca.",
      "El operador marcó agua empozada en el piso del banco. Verifique en el banco el drenaje y el estado del piso.",
      "Punto de seguimiento de la rampa de acceso. Compárelo con el vuelo anterior y verifique su estado en el sitio.",
    ],
    past: "Punto de un levantamiento anterior, ya revisado por el equipo geotécnico en el escenario de ejemplo.",
  },
};

interface FollowUpSeed {
  owner: string;
  /** Day the measure was opened, and the deadline. */
  opened: string;
  due: string;
  /** Day it went into correction; empty while it is only open. */
  started?: string;
  closedOn?: string;
  closure?: string;
}

/** The people in charge of corrections in each sector's example (all invented). */
const seedOwners: Record<Sector, [string, string]> = {
  agriculture: [
    "Jefe de campo (ejemplo)",
    "Administrador de la hacienda (ejemplo)",
  ],
  roads: [
    "Contratista de mantenimiento vial (ejemplo)",
    "Residente de obra del concesionario (ejemplo)",
  ],
  construction: [
    "Residente de obra (ejemplo)",
    "Contratista de estructura (ejemplo)",
  ],
  security: [
    "Supervisor de seguridad (ejemplo)",
    "Jefe de mantenimiento del parque (ejemplo)",
  ],
  mining: ["Jefe de geotecnia (ejemplo)", "Superintendente de mina (ejemplo)"],
};

/** How the second kind of finding (drainage, access, front...) was closed, per sector. */
const seedClosures: Record<Sector, [string, string]> = {
  agriculture: [
    "Se visitó la zona con el jefe de campo y se corrigió; verificada con foto del 11 de agosto (ejemplo).",
    "Se corrigió la zona y se comprobó en el lote con foto del 8 de septiembre (ejemplo).",
  ],
  roads: [
    "Se limpió la alcantarilla y se retiró el sedimento; la interventoría lo verificó en sitio con foto del 11 de agosto (ejemplo).",
    "Se reparó la cuneta y se verificó en sitio con foto del 8 de septiembre (ejemplo).",
  ],
  construction: [
    "El residente ajustó el frente al programa; la interventoría lo verificó con foto del 11 de agosto (ejemplo).",
    "Se corrigió el frente y se comprobó en la obra con foto del 8 de septiembre (ejemplo).",
  ],
  security: [
    "Se corrigió el acceso y el supervisor lo verificó en la ronda del 11 de agosto (ejemplo).",
    "Se aseguró el acceso y se comprobó en la ronda del 8 de septiembre (ejemplo).",
  ],
  mining: [
    "Se habilitó el drenaje del banco y geotecnia lo verificó con foto del 11 de agosto (ejemplo).",
    "Se drenó el banco y geotecnia lo comprobó con foto del 8 de septiembre (ejemplo).",
  ],
};

/**
 * Corrective measures in the example, told from the demo's «today» (25 October 2026, `DEMO_DATE`; no
 * closing date may be later): one closed with its note, one in correction and already late
 * (due 16 Oct, 9 days), one in correction and on time, one open and on time. Roads, where the
 * follow-up is the work itself, carry more, in every state, plus one open and already late. Keys are the finding id without the
 * «finding-<site>-» prefix, with «_» in place of «-».
 */
function followUpSeeds(sector: Sector): Record<string, FollowUpSeed> {
  const [a, b] = seedOwners[sector];
  const [closedA, closedB] = seedClosures[sector];
  const seeds: Record<string, FollowUpSeed> = {
    h3_2: {
      owner: a,
      opened: "2026-07-20",
      started: "2026-07-29",
      due: "2026-08-14",
      closedOn: "2026-08-11",
      closure: closedA,
    },
    h5_2: {
      owner: b,
      opened: "2026-09-21",
      started: "2026-10-02",
      due: "2026-10-16",
    },
    "1": { owner: a, opened: "2026-10-24", due: "2026-11-06" },
  };
  if (sector !== "roads") {
    seeds["2"] = {
      owner: b,
      opened: "2026-10-24",
      started: "2026-10-25",
      due: "2026-11-03",
    };
  }
  if (sector === "roads") {
    seeds.h4_2 = {
      owner: a,
      opened: "2026-08-24",
      started: "2026-08-31",
      due: "2026-09-12",
      closedOn: "2026-09-08",
      closure: closedB,
    };
    seeds.h6_1 = { owner: b, opened: "2026-10-12", due: "2026-10-22" };
    seeds.h6_2 = {
      owner: a,
      opened: "2026-10-12",
      started: "2026-10-20",
      due: "2026-11-06",
    };
  }
  return seeds;
}

function followUpFrom(seed: FollowUpSeed): FindingFollowUp {
  const history = [
    {
      at: seed.opened,
      text: `Se abrió la medida: responsable ${seed.owner}, plazo ${dayText(seed.due)}.`,
    },
  ];
  if (seed.started) {
    history.push({ at: seed.started, text: "Pasó a «en corrección»." });
  }
  if (seed.closedOn && seed.closure) {
    history.push({ at: seed.closedOn, text: `Cerrada. ${seed.closure}` });
  }
  return {
    owner: seed.owner,
    dueDate: seed.due,
    status: seed.closedOn ? "closed" : seed.started ? "inProgress" : "open",
    ...(seed.closedOn && seed.closure
      ? { closedOn: seed.closedOn, closure: seed.closure }
      : {}),
    history,
  };
}

/** The follow-up the example gives a finding, and the flag that goes with it. */
function seededFollowUp(site: Site, key: string) {
  const seed = followUpSeeds(site.sector)[key];
  return seed
    ? { followUp: followUpFrom(seed), taskAssigned: true }
    : { taskAssigned: false };
}

const currentFindings: Finding[] = sites.flatMap((site) =>
  [0, 1, 2].map((index) => {
    const zone = site.zones[index % site.zones.length];
    const location = findingLocation(site, zone, 0.35 + index * 0.15);
    return {
      id: `finding-${site.id}-${index + 1}`,
      siteId: site.id,
      flightId: `flight-${site.id}-01`,
      zoneId: zone.id,
      title: findingNames[site.sector][index],
      description: describeAt(
        location,
        findingTexts[site.sector].current[index],
      ),
      priority: (["high", "medium", "low"] as const)[index],
      status: "pending" as const,
      position: findingPosition(
        site,
        zone,
        0.3 + index * 0.2,
        0.35 + index * 0.15,
      ),
      ...location,
      imageUrl: site.imageUrl,
      source: exampleSource(
        site,
        `${operatorSourceWord[site.sector]} del operador · ejemplo`,
      ),
      ...seededFollowUp(site, String(index + 1)),
    };
  }),
);

const historyFindings: Finding[] = sites.flatMap((site) =>
  history.flatMap((item, flightIndex) =>
    [0, 1, 2]
      .slice(0, flightIndex === 1 || flightIndex === 3 ? 3 : 2)
      .map((index) => {
        const zone =
          site.zones[
            index === 0 ? 0 : (index + flightIndex) % site.zones.length
          ];
        const location = findingLocation(site, zone, 0.35 + index * 0.15);
        return {
          id: `finding-${site.id}-h${item.n}-${index + 1}`,
          siteId: site.id,
          flightId: `flight-${site.id}-0${item.n}`,
          // The first zone repeats on purpose: recurrence is what the insights surface.
          zoneId: zone.id,
          title: findingNames[site.sector][index],
          description: describeAt(location, findingTexts[site.sector].past),
          priority: (["high", "medium", "low"] as const)[
            (index + flightIndex) % 3
          ],
          status: (index === 2
            ? "dismissed"
            : "confirmed") as Finding["status"],
          position: findingPosition(
            site,
            zone,
            0.3 + index * 0.2 + flightIndex * 0.02,
            0.35 + index * 0.15,
          ),
          ...location,
          imageUrl: site.imageUrl,
          source: exampleSource(
            site,
            `${operatorSourceWord[site.sector]} del operador · ejemplo`,
          ),
          ...seededFollowUp(site, `h${item.n}_${index + 1}`),
        };
      }),
  ),
);

/**
 * What the image assistant would propose after going through the photos of a flight, per sector.
 * They are examples written by hand, not the output of a model. Each says what it saw, what in the
 * photos led to it and what a photo cannot tell; wording describes what is visible and avoids
 * naming a cause. The second candidate is deliberately weak, so the review flow shows a caution.
 */
const imageCandidates: Record<
  Sector,
  {
    title: string;
    description: string;
    priority: Finding["priority"];
    suggestion: Omit<FindingSuggestion, "agent" | "photoSpan">;
    photoSpan: [number, number];
  }[]
> = {
  agriculture: [
    {
      title: "Falla en el surco",
      description: "Un tramo del surco sin plantas, con el suelo a la vista.",
      priority: "medium",
      photoSpan: [0.28, 0.31],
      suggestion: {
        confidence: "high",
        evidence: [
          "Hueco sin plantas de unos 12 m en una línea continua.",
          "Se ve en tres fotos seguidas con traslape.",
        ],
        limits:
          "Desde una foto no se distingue una falla de siembra de un daño o de un suelo distinto; hay que verlo en el lote.",
      },
    },
    {
      title: "Zona de color distinto",
      description: "Un parche más claro que el cultivo que lo rodea.",
      priority: "low",
      photoSpan: [0.64, 0.64],
      suggestion: {
        confidence: "low",
        evidence: ["Una mancha más clara en una sola foto."],
        limits:
          "El color cambia con la luz y la hora del vuelo; una foto no basta. Contrástelo con el vigor del lote en Evolución.",
      },
    },
  ],
  roads: [
    {
      title: "Posible grieta en la calzada",
      description: "Una línea oscura que sigue el carril.",
      priority: "high",
      photoSpan: [0.4, 0.43],
      suggestion: {
        confidence: "medium",
        evidence: [
          "Línea oscura continua de unos 8 m a lo largo del carril.",
          "Visible en dos fotos seguidas.",
        ],
        limits:
          "No mide ancho ni profundidad: una grieta superficial y una estructural se ven parecidas desde el aire.",
      },
    },
    {
      title: "Posible agua estancada junto a la vía",
      description: "Una superficie con reflejo distinto junto a la berma.",
      priority: "medium",
      photoSpan: [0.7, 0.7],
      suggestion: {
        confidence: "low",
        evidence: ["Superficie con reflejo distinto en una sola foto."],
        limits:
          "Puede ser humedad, sombra o un charco pasajero; no indica si el drenaje falla.",
      },
    },
  ],
  construction: [
    {
      title: "Posible acopio fuera del área",
      description: "Una pila de material fuera del límite marcado.",
      priority: "medium",
      photoSpan: [0.35, 0.38],
      suggestion: {
        confidence: "medium",
        evidence: [
          "Pila de material de unos 6 m fuera del límite marcado.",
          "Visible en dos fotos.",
        ],
        limits:
          "No identifica el material ni si un permiso lo autoriza en ese lugar.",
      },
    },
    {
      title: "Posible elemento sobresaliente en la losa",
      description: "Un objeto alargado que sale del borde de la losa.",
      priority: "high",
      photoSpan: [0.6, 0.6],
      suggestion: {
        confidence: "low",
        evidence: ["Objeto alargado en el borde de la losa, en una sola foto."],
        limits:
          "Puede ser acero de espera previsto en el diseño; solo la obra lo confirma.",
      },
    },
  ],
  security: [
    {
      title: "Posible abertura en el cerramiento",
      description: "Una interrupción en la línea de la malla.",
      priority: "high",
      photoSpan: [0.45, 0.48],
      suggestion: {
        confidence: "medium",
        evidence: [
          "Interrupción en la malla de unos 3 m.",
          "Visible en tres fotos seguidas.",
        ],
        limits: "No distingue un daño de una puerta o un acceso previsto.",
      },
    },
    {
      title: "Objeto junto al perímetro",
      description: "Un objeto de forma irregular pegado a la cerca.",
      priority: "low",
      photoSpan: [0.72, 0.72],
      suggestion: {
        confidence: "low",
        evidence: ["Un objeto irregular junto a la cerca, en una sola foto."],
        limits:
          "No identifica personas ni vehículos, y no es un sistema de alarma.",
      },
    },
  ],
  mining: [
    {
      title: "Línea oscura cerca de la cresta del talud",
      description: "Una línea más oscura y continua junto al borde del banco.",
      priority: "high",
      photoSpan: [0.2, 0.23],
      suggestion: {
        confidence: "medium",
        evidence: [
          "Línea oscura de unos 25 m, paralela al borde del banco.",
          "Se ve en tres fotos seguidas con traslape.",
        ],
        limits:
          "Desde una foto no se distingue una grieta de una sombra o de una cuneta; hay que verla en el banco, con un geotecnista.",
      },
    },
    {
      title: "Mancha oscura en el piso del banco",
      description: "Una zona más oscura y lisa, de contorno irregular.",
      priority: "low",
      photoSpan: [0.66, 0.66],
      suggestion: {
        confidence: "low",
        evidence: ["Una mancha más oscura en una sola foto."],
        limits:
          "Puede ser agua, material húmedo o una sombra. Compárela con la fecha anterior antes de decidir.",
      },
    },
  ],
};

const suggestedSource = (status: Finding["status"]) =>
  status === "confirmed"
    ? "Sugerencia de IA · confirmada por una persona (ejemplo)"
    : status === "dismissed"
      ? "Sugerencia de IA · descartada por una persona (ejemplo)"
      : "Sugerencia de IA · sin revisar (ejemplo)";

function suggestedFinding(
  site: Site,
  flightId: string,
  id: string,
  candidate: number,
  zoneIndex: number,
  status: Finding["status"],
  shift = 0,
): Finding {
  const item = imageCandidates[site.sector][candidate];
  const zone = site.zones[zoneIndex % site.zones.length];
  const location = findingLocation(site, zone, 0.55 - candidate * 0.15);
  return {
    id,
    siteId: site.id,
    flightId,
    zoneId: zone.id,
    title: item.title,
    description: describeAt(location, item.description),
    priority: item.priority,
    status,
    position: findingPosition(
      site,
      zone,
      0.45 + candidate * 0.2 + shift,
      0.55 - candidate * 0.15,
    ),
    ...location,
    imageUrl: site.imageUrl,
    source: suggestedSource(status),
    taskAssigned: false,
    suggestion: {
      agent: "image",
      ...item.suggestion,
      photoSpan: item.photoSpan,
    },
  };
}

/**
 * Candidates on the latest flight, and three earlier ones already reviewed so the assistant has a
 * track record to show. They sit in the zones that the next-flight assistant has on the agenda.
 */
const suggestedFindings: Finding[] = sites.flatMap((site) => [
  suggestedFinding(
    site,
    `flight-${site.id}-01`,
    `finding-${site.id}-ai-1`,
    0,
    2,
    "pending",
  ),
  suggestedFinding(
    site,
    `flight-${site.id}-01`,
    `finding-${site.id}-ai-2`,
    1,
    0,
    "pending",
  ),
  suggestedFinding(
    site,
    `flight-${site.id}-04`,
    `finding-${site.id}-h4-ai`,
    0,
    2,
    "confirmed",
    0.02,
  ),
  suggestedFinding(
    site,
    `flight-${site.id}-05`,
    `finding-${site.id}-h5-ai`,
    1,
    0,
    "dismissed",
    0.02,
  ),
  suggestedFinding(
    site,
    `flight-${site.id}-06`,
    `finding-${site.id}-h6-ai`,
    0,
    2,
    "confirmed",
    0.04,
  ),
]);

export const initialFindings: Finding[] = [
  ...currentFindings,
  ...historyFindings,
  ...suggestedFindings,
];

/** A date moved by whole days, for due and payment dates counted from a flight. */
function shiftDate(date: string, days: number) {
  const moved = new Date(`${date}T12:00:00Z`);
  moved.setUTCDate(moved.getUTCDate() + days);
  return moved.toISOString().slice(0, 10);
}

/**
 * Every invoice of the example data adds up: where a site is priced by hectare the total is the
 * billed hectares times the tariff, and where it is priced per flight the total is the flat fee. The
 * description says which, so nobody has to guess. Tariffs and fees are examples, not market prices.
 */
const historyRates = { 3: 28_500, 4: 29_000, 5: 29_500, 6: 30_000 } as const;
const historyFees = { 3: 660_000, 4: 680_000, 5: 690_000, 6: 700_000 } as const;

const historyInvoices: Invoice[] = sites.flatMap((site, siteIndex) =>
  history.map((item, index) => {
    const flightId = `flight-${site.id}-0${item.n}`;
    const flight = initialFlights.find((entry) => entry.id === flightId);
    const byArea = priceUnit(site) === "ha";
    const billedHa = orderedHaOf(site, flight?.zoneIds ?? []);
    const rate = historyRates[item.n];
    const total = byArea ? Math.round(billedHa * rate) : historyFees[item.n];
    // Paid on the due date, which falls before the demo date for every flight of the history.
    const dueDate = shiftDate(item.date, 14);
    return {
      id: `invoice-${site.id}-h${item.n}`,
      siteId: site.id,
      flightId,
      reference: `FV-2026-${100 + siteIndex * 10 + index}`,
      description: byArea
        ? `Seguimiento mensual · ${formatHa(billedHa)} ha × ${pesos(rate)} por ha (ejemplo)`
        : "Seguimiento mensual · tarifa fija por vuelo (ejemplo)",
      operator: "AeroVisión del Valle",
      total,
      paid: total,
      dueDate,
      source: "manual" as const,
      ...(byArea ? { billedHa } : {}),
    };
  }),
);

export const initialInvoices: Invoice[] = [
  ...sites.flatMap((site, index) => {
    const flightId = `flight-${site.id}-01`;
    const byArea = priceUnit(site) === "ha";
    // The contractor bills what was ordered, not what it reached.
    const billedHa = orderedHaOf(
      site,
      site.zones.map((zone) => zone.id),
    );
    const total = byArea ? Math.round(billedHa * HA_RATE) : FLIGHT_FEE;
    return [
      {
        id: `invoice-${site.id}-01`,
        siteId: site.id,
        flightId,
        reference: `FV-2026-0${34 + index}`,
        description: byArea
          ? `Seguimiento del mes · ${formatHa(billedHa)} ha × ${pesos(HA_RATE)} por ha (ejemplo)`
          : "Seguimiento del mes · tarifa fija por vuelo (ejemplo)",
        operator: "AeroVisión del Valle",
        total,
        // An advance of a bit under half, as the example payment of the 25th.
        paid: Math.round((total * 0.45) / 10_000) * 10_000,
        dueDate: "2026-10-30",
        ...(byArea ? { billedHa } : {}),
      },
      {
        id: `invoice-${site.id}-02`,
        siteId: site.id,
        flightId: `flight-${site.id}-06`,
        reference: `FV-2026-0${21 + index}`,
        description:
          "Ortomosaico adicional del vuelo del 10 de octubre · tarifa fija (ejemplo)",
        operator: "AeroVisión del Valle",
        total: 620000,
        paid: 620000,
        dueDate: "2026-10-15",
      },
    ];
  }),
  ...historyInvoices,
];

export const initialPayments: Payment[] = initialInvoices.map(
  (invoice, index) => ({
    id: `payment-${index + 1}`,
    invoiceId: invoice.id,
    amount: invoice.paid,
    // History invoices were paid on their due date; the advance of the current one is of the demo day.
    date: /-h\d$/.test(invoice.id)
      ? invoice.dueDate
      : invoice.paid === invoice.total
        ? "2026-10-14"
        : DEMO_DATE,
    method: "Transferencia registrada · ejemplo",
  }),
);

export const initialDocuments: FlightDocument[] = sites.flatMap((site) => [
  {
    id: `document-${site.id}-1`,
    siteId: site.id,
    title: "Documentación del operador",
    subject: "AeroVisión del Valle",
    category: "operator",
    status: "reviewed",
    validUntil: "2027-06-30",
    reference: "OP-2026-014",
    fileName: "operador-ejemplo.txt",
  },
  {
    id: `document-${site.id}-2`,
    siteId: site.id,
    title: "Soporte del piloto",
    subject: "Camilo Torres",
    category: "pilot",
    status: "pending",
    validUntil: "2027-02-10",
    reference: "PL-2026-028",
    fileName: "piloto-ejemplo.txt",
  },
  {
    id: `document-${site.id}-3`,
    siteId: site.id,
    title: "Póliza del equipo",
    subject: "DJI Mavic 3 Enterprise",
    category: "drone",
    status: "expired",
    validUntil: "2026-10-20",
    reference: "EQ-2026-006",
    fileName: "poliza-ejemplo.txt",
  },
  {
    id: `document-${site.id}-4`,
    siteId: site.id,
    title: "Soporte de la operación",
    subject: "Seguimiento del 29 de octubre",
    category: "flight",
    status: "missing",
    validUntil: null,
    reference: "VU-2026-029",
    fileName: null,
  },
]);

/**
 * Who signs the authorization of the area, per sector: the party that really holds the right to
 * allow the flight. All names are made up.
 */
const authorizers: Record<
  Sector,
  { name: string; documentId: string; role: string }
> = {
  agriculture: {
    name: "Martha Lucía Ocampo",
    documentId: "31.456.789",
    role: "Propietario",
  },
  roads: {
    name: "Gustavo Adolfo Restrepo",
    documentId: "16.702.115",
    role: "Representante del titular del contrato de concesión",
  },
  construction: {
    name: "Martha Lucía Ocampo",
    documentId: "31.456.789",
    role: "Propietario del lote",
  },
  security: {
    name: "Andrés Felipe Cárdenas",
    documentId: "94.318.447",
    role: "Administrador de la copropiedad",
  },
  mining: {
    name: "Claudia Patricia Londoño",
    documentId: "66.905.212",
    role: "Representante del titular minero",
  },
};

/** Signed supports for the last completed flight of each site, so the traceability has something to show. */
export const initialEvidences: Evidence[] = sites.flatMap((site) => {
  const flight = initialFlights.find(
    (item) => item.id === `flight-${site.id}-01`,
  );
  if (!flight) return [];
  const at = (time: string) => `2026-10-24T${time}:00-05:00`;
  const create = (
    templateId: keyof typeof templates,
    fields: Record<string, string>,
  ) =>
    newEvidence(
      {
        id: `evidence-${site.id}-${templateId}`,
        siteId: site.id,
        flightId: flight.id,
        kind: "drafted",
        templateId,
        title: templates[templateId].title,
        fields: { ...autofill(templateId, { site, flight }), ...fields },
      },
      at("07:20"),
    );
  const pilot = {
    name: flight.pilot,
    documentId: "16.834.201",
    method: "typed" as const,
  };
  const authorizer = authorizers[site.sector];
  const owner = {
    name: authorizer.name,
    documentId: authorizer.documentId,
    method: "typed" as const,
  };

  let inspection = create("aircraft-inspection", {
    propellers: "Conforme",
    batteryState: "Conforme",
    firmware: "Sí",
    calibration: "Sí",
  });
  inspection = withSignature(
    inspection,
    { role: "Piloto", ...pilot },
    at("07:42"),
  );

  let authorization = create("landowner-authorization", {
    ownerName: owner.name,
    ownerId: owner.documentId,
    ownerRole: authorizer.role,
  });
  authorization = withSignature(
    authorization,
    { role: "Propietario o administrador", ...owner },
    at("07:10"),
  );
  authorization = withSignature(
    authorization,
    { role: "Operador", ...pilot },
    at("07:12"),
  );

  let acceptance = create("delivery-acceptance", {
    result: "A satisfacción",
    observations:
      "Fotografías completas; pendiente revisar los puntos señalados.",
  });
  acceptance = withSignature(
    acceptance,
    { role: "Operador", ...pilot },
    at("11:05"),
  );

  return [inspection, authorization, acceptance];
});

/** Two aircraft per site, with the papers and history a company that owns its drones keeps. */
export const initialAircraft: Aircraft[] = sites.flatMap((site, index) => [
  {
    id: `aircraft-${site.id}-1`,
    siteId: site.id,
    name: "Mavic 3E · A",
    make: "DJI",
    model: "Mavic 3 Enterprise",
    serial: `1581F5FJ${index}C23Q8`,
    registration: `UAS-CO-2024-04${index}2`,
    acquiredOn: "2024-03-12",
    purchaseCost: 24_500_000,
    ownership: "own",
    status: "active",
    firmware: "16.01.00.03",
    initialHours: 200,
    insurer: "Seguros del Valle (ejemplo)",
    policyNumber: "RC-2026-0381",
    // Same date as the expired equipment policy in Documentos.
    policyUntil: "2026-10-20",
    warrantyUntil: "2026-03-12",
    plan: defaultPlan,
  },
  {
    id: `aircraft-${site.id}-2`,
    siteId: site.id,
    name: "Matrice 350 · A",
    make: "DJI",
    model: "Matrice 350 RTK",
    serial: `1ZNBK3A0${index}0042P`,
    registration: `UAS-CO-2023-01${index}8`,
    acquiredOn: "2023-09-20",
    purchaseCost: 58_000_000,
    ownership: "own",
    status: "active",
    firmware: "09.01.00.07",
    initialHours: 540,
    insurer: "Seguros del Valle (ejemplo)",
    policyNumber: "RC-2026-0382",
    policyUntil: "2027-01-20",
    warrantyUntil: "2026-09-20",
    plan: defaultPlan,
  },
]);

export const initialBatteries: Battery[] = sites.flatMap((site) => [
  {
    id: `battery-${site.id}-a10`,
    aircraftId: `aircraft-${site.id}-1`,
    label: "BAT-A10",
    serial: "BA10-7731",
    initialCycles: 44,
    maxCycles: 200,
    capacityPct: 94,
  },
  {
    id: `battery-${site.id}-a11`,
    aircraftId: `aircraft-${site.id}-1`,
    label: "BAT-A11",
    serial: "BA11-7732",
    initialCycles: 58,
    maxCycles: 200,
    capacityPct: 91,
  },
  {
    id: `battery-${site.id}-a12`,
    aircraftId: `aircraft-${site.id}-1`,
    label: "BAT-A12",
    serial: "BA12-7733",
    initialCycles: 168,
    maxCycles: 200,
    capacityPct: 83,
  },
  {
    id: `battery-${site.id}-a13`,
    aircraftId: `aircraft-${site.id}-1`,
    label: "BAT-A13",
    serial: "BA13-7734",
    initialCycles: 97,
    maxCycles: 200,
    capacityPct: 88,
  },
  {
    id: `battery-${site.id}-b01`,
    aircraftId: `aircraft-${site.id}-2`,
    label: "BAT-B01",
    serial: "TB65-0141",
    initialCycles: 118,
    maxCycles: 300,
    capacityPct: 95,
  },
  {
    id: `battery-${site.id}-b02`,
    aircraftId: `aircraft-${site.id}-2`,
    label: "BAT-B02",
    serial: "TB65-0142",
    initialCycles: 126,
    maxCycles: 300,
    capacityPct: 93,
  },
]);

export const initialMaintenance: MaintenanceRecord[] = sites.flatMap((site) => {
  const one = `aircraft-${site.id}-1`;
  const two = `aircraft-${site.id}-2`;
  const make = (
    suffix: string,
    record: Omit<MaintenanceRecord, "id">,
  ): MaintenanceRecord => ({
    id: `maintenance-${site.id}-${suffix}`,
    ...record,
  });
  return [
    make("1a", {
      aircraftId: one,
      date: "2026-04-10",
      kind: "inspection",
      taskId: "periodic",
      title: "Inspección periódica",
      description:
        "Revisión de estructura, motores, gimbal y sensores. Sin hallazgos.",
      hoursAt: 160,
      performedBy: "Servicio autorizado (ejemplo)",
      cost: 380000,
    }),
    make("1b", {
      aircraftId: one,
      date: "2026-07-01",
      kind: "component",
      taskId: "propellers",
      title: "Hélices",
      description: "Cambio del juego completo por desgaste en los bordes.",
      hoursAt: 185,
      performedBy: "Camilo Torres",
      cost: 120000,
    }),
    make("1c", {
      aircraftId: one,
      date: "2026-08-15",
      kind: "firmware",
      taskId: "firmware",
      title: "Firmware 16.01.00.03 y calibración",
      description: "Actualización y calibración de brújula e IMU.",
      hoursAt: 192,
      performedBy: "Camilo Torres",
      cost: 0,
    }),
    make("1d", {
      aircraftId: one,
      date: "2026-10-10",
      kind: "incident",
      title: "Pérdida breve de enlace",
      description:
        "Ocurrió al norte del recorrido; el dron retomó la ruta. Sin daños.",
      hoursAt: 201,
      performedBy: "Camilo Torres",
      cost: 0,
    }),
    make("2a", {
      aircraftId: two,
      date: "2026-06-05",
      kind: "inspection",
      taskId: "periodic",
      title: "Inspección periódica",
      description: "Revisión general y cambio de tornillería de los brazos.",
      hoursAt: 530,
      performedBy: "Servicio autorizado (ejemplo)",
      cost: 1_800_000,
    }),
    make("2b", {
      aircraftId: two,
      date: "2026-09-02",
      kind: "repair",
      title: "Motor 2",
      description: "Cambio del motor 2 por vibración anormal.",
      hoursAt: 539,
      performedBy: "Servicio autorizado (ejemplo)",
      cost: 2_100_000,
    }),
  ];
});

const markModels = {
  one: "glb:/models/dji/mavic-3-enterprise.glb",
  two: "glb:/models/dji/matrice-350-rtk.glb",
};

/** Inspection marks on the 3D models. Points are set where the parts sit on each model. */
export const initialPartMarks: PartMark[] = sites.flatMap((site) => {
  const one = `aircraft-${site.id}-1`;
  const two = `aircraft-${site.id}-2`;
  const mark = (
    suffix: string,
    aircraftId: string,
    rest: Omit<PartMark, "id" | "aircraftId" | "modelKey" | "by" | "size"> &
      Partial<Pick<PartMark, "size" | "by">>,
  ): PartMark => ({
    id: `part-${site.id}-${suffix}`,
    aircraftId,
    modelKey: aircraftId === one ? markModels.one : markModels.two,
    size: "m",
    by: "Piloto de ejemplo",
    ...rest,
  });
  return [
    mark("1a", one, {
      point: [-0.95, -0.05, -0.72],
      size: "m",
      part: "propellers",
      condition: "watch",
      note: "Rayón leve en el borde de la hélice delantera izquierda",
      date: "2026-10-12",
    }),
    mark("1b", one, {
      point: [0, -0.13, -0.78],
      size: "s",
      part: "gimbal-camera",
      condition: "ok",
      note: "Giro suave en los tres ejes",
      date: "2026-10-12",
    }),
    mark("1c", one, {
      point: [0.95, -0.17, -0.72],
      size: "m",
      part: "motors",
      condition: "ok",
      note: "Sin ruido ni holgura",
      date: "2026-10-12",
    }),
    mark("2a", two, {
      point: [1.13, 0.05, -0.94],
      size: "m",
      part: "propellers",
      condition: "replace",
      note: "Muesca en el borde de ataque de la hélice 1 (delantera derecha)",
      date: "2026-10-20",
    }),
    mark("2b", two, {
      point: [-0.68, 0.2, -0.65],
      size: "m",
      part: "frame-arms",
      condition: "watch",
      note: "Seguro de plegado del brazo delantero izquierdo con juego",
      date: "2026-10-20",
    }),
    mark("2c", two, {
      point: [-0.6, -0.62, -0.05],
      size: "m",
      part: "landing-gears",
      condition: "ok",
      note: "Patines firmes, sin grietas",
      date: "2026-10-20",
    }),
  ];
});

/** The three actors. All names are made up; the operator «AeroVisión del Valle» is the one the rest of the demo uses. */
export const OPERATOR_A = "party-operator-aerovision";
export const OPERATOR_B = "party-operator-pacifico";

const siteParties: Record<string, [string, string]> = {
  "santa-rita": [
    "Ingenio Dulce Valle (ejemplo)",
    "Hacienda Santa Rita · Hernando Rojas (ejemplo)",
  ],
  "via-la-habana": [
    "Concesión Vía Buga (ejemplo)",
    "Interventoría Vial (ejemplo)",
  ],
  "obra-alameda": [
    "Constructora Alameda (ejemplo)",
    "Propietario del lote (ejemplo)",
  ],
  "parque-del-pacifico": [
    "Administración del parque (ejemplo)",
    "Copropiedad del parque (ejemplo)",
  ],
  "mina-mulalo": [
    "Operación minera de caliza (ejemplo)",
    "Titular del contrato de concesión (ejemplo)",
  ],
};

export const initialParties: Party[] = [
  ...sites.flatMap((site): Party[] => {
    const [manager, owner] = siteParties[site.id];
    return [
      {
        id: `party-manager-${site.id}`,
        role: "manager",
        name: manager,
        siteIds: [site.id],
      },
      {
        id: `party-owner-${site.id}`,
        role: "owner",
        name: owner,
        siteIds: [site.id],
      },
    ];
  }),
  {
    id: OPERATOR_A,
    role: "operator",
    name: "AeroVisión del Valle",
    siteIds: sites.map((site) => site.id),
    contact: "operaciones@aerovision.example",
  },
  {
    id: OPERATOR_B,
    role: "operator",
    name: "Drones del Pacífico (ejemplo)",
    siteIds: sites.map((site) => site.id),
    contact: "servicios@dronespacifico.example",
  },
];

const ev = (
  n: number,
  on: string,
  by: string,
  role: ServiceEvent["role"],
  type: string,
  text: string,
): ServiceEvent => ({
  id: `ev-seed-${n}-${type}`,
  on,
  by,
  role,
  type,
  text,
});

/** Example requests, at different steps so the board shows the whole flow. Prices are examples, not market prices. */
export const initialServiceRequests: ServiceRequest[] = sites.flatMap(
  (site): ServiceRequest[] => {
    const manager = `party-manager-${site.id}`;
    const owner = `party-owner-${site.id}`;
    const zoneIds = site.zones.map((zone) => zone.id);
    // Roads and works are priced per flight (a road has length, not hectares); the rest by hectare.
    // `n` is the example's base figure: per hectare it becomes the tariff of HA_RATE scaled (the
    // monthly follow-up is exactly HA_RATE), per flight the flat fee of FLIGHT_FEE scaled the same way.
    const unit = priceUnit(site);
    const price = (n: number) =>
      unit === "flight"
        ? Math.round(((n / 3500) * FLIGHT_FEE) / 10_000) * 10_000
        : Math.round(((n / 3500) * HA_RATE) / 500) * 500;
    const money = (n: number) =>
      `${pesos(price(n))}${unit === "ha" ? " por hectárea" : ""}`;
    const words = zoneWords(site);
    const flight1 = initialFlights.find(
      (item) => item.id === `flight-${site.id}-01`,
    );
    const base = {
      siteId: site.id,
      invited: [OPERATOR_A, OPERATOR_B],
      unit,
    };
    const thirdNotes: Record<Sector, string> = {
      agriculture: "Cámara multiespectral y mapa de vigor por lote.",
      roads: "Cámara RGB; ortofoto y fotos con PK por tramo.",
      construction: "Cámara RGB y nube de puntos; avance por frente.",
      security: "Cámara con zoom; recorrido del cerramiento por sector.",
      mining: "Modelo de superficie y volumen removido por banco.",
    };
    const first: ServiceRequest = {
      ...base,
      id: `service-${site.id}-1`,
      kind: "monitoring",
      title: "Seguimiento del mes",
      description: `Monitoreo de ${words.all} con el mismo recorrido del mes anterior.`,
      zoneIds,
      requestedBy: manager,
      windowStart: "2026-10-18",
      windowEnd: "2026-10-26",
      maxPrice: price(4500),
      status: "invoiced",
      operatorId: OPERATOR_A,
      flightId: `flight-${site.id}-01`,
      invoiceId: `invoice-${site.id}-01`,
      createdOn: "2026-10-12",
      quotes: [
        {
          operatorId: OPERATOR_A,
          price: price(3500),
          startDate: "2026-10-22",
          note: "Incluye ortomosaico y reporte de hallazgos.",
          state: "chosen",
          on: "2026-10-13",
        },
        {
          operatorId: OPERATOR_B,
          price: price(4100),
          startDate: "2026-10-24",
          note: "",
          state: "declined",
          on: "2026-10-14",
        },
      ],
      assignReason: "La cotización más baja de las dos.",
      delivery: {
        deliveredOn: "2026-10-24",
        note: "Cobertura completa.",
        deliverables: ["Ortomosaico (GeoTIFF)", "Fotografías originales (JPG)"],
      },
      verification: {
        result: "accepted",
        note: "Recibido y revisado.",
        on: "2026-10-25",
        by: manager,
      },
      events: [
        ev(
          1,
          "2026-10-12",
          manager,
          "manager",
          "requested",
          `${siteParties[site.id][0]} pidió el servicio e invitó a AeroVisión del Valle y Drones del Pacífico (ejemplo).`,
        ),
        ev(
          2,
          "2026-10-13",
          OPERATOR_A,
          "operator",
          "quoted",
          `AeroVisión del Valle cotizó ${money(3500)}, desde el 2026-10-22.`,
        ),
        ev(
          3,
          "2026-10-14",
          OPERATOR_B,
          "operator",
          "quoted",
          `Drones del Pacífico (ejemplo) cotizó ${money(4100)}, desde el 2026-10-24.`,
        ),
        ev(
          4,
          "2026-10-15",
          manager,
          "manager",
          "assigned",
          `${siteParties[site.id][0]} asignó el servicio a AeroVisión del Valle. Motivo: La cotización más baja de las dos.`,
        ),
        ev(
          5,
          "2026-10-15",
          OPERATOR_A,
          "operator",
          "scheduled",
          "AeroVisión del Valle programó el vuelo para el 2026-10-24.",
        ),
        ev(
          6,
          "2026-10-24",
          OPERATOR_A,
          "operator",
          "delivered",
          "AeroVisión del Valle entregó ortomosaico y fotografías.",
        ),
        ev(
          7,
          "2026-10-25",
          manager,
          "manager",
          "verified",
          `${siteParties[site.id][0]} aceptó la entrega: Recibido y revisado.`,
        ),
        ev(
          8,
          "2026-10-25",
          OPERATOR_A,
          "operator",
          "invoiced",
          "AeroVisión del Valle facturó. El pago se gestiona en Pagos y costos.",
        ),
      ],
    };
    const second: ServiceRequest = {
      ...base,
      id: `service-${site.id}-2`,
      kind: "monitoring",
      title: "Seguimiento programado del 29 de octubre",
      description: `Comparar el estado de ${words.the} con el registro anterior.`,
      zoneIds: bookedZoneIds(site),
      requestedBy: manager,
      windowStart: "2026-10-27",
      windowEnd: "2026-10-31",
      maxPrice: price(4500),
      status: "scheduled",
      operatorId: OPERATOR_A,
      flightId: `flight-${site.id}-02`,
      createdOn: "2026-10-20",
      quotes: [
        {
          operatorId: OPERATOR_A,
          price: price(3500),
          startDate: "2026-10-27",
          note: "",
          state: "chosen",
          on: "2026-10-21",
        },
        {
          operatorId: OPERATOR_B,
          price: price(3900),
          startDate: "2026-10-28",
          note: "",
          state: "declined",
          on: "2026-10-21",
        },
      ],
      events: [
        ev(
          11,
          "2026-10-20",
          manager,
          "manager",
          "requested",
          `${siteParties[site.id][0]} pidió el servicio e invitó a AeroVisión del Valle y Drones del Pacífico (ejemplo).`,
        ),
        ev(
          12,
          "2026-10-21",
          OPERATOR_A,
          "operator",
          "quoted",
          `AeroVisión del Valle cotizó ${money(3500)}, desde el 2026-10-27.`,
        ),
        ev(
          13,
          "2026-10-21",
          OPERATOR_B,
          "operator",
          "quoted",
          `Drones del Pacífico (ejemplo) cotizó ${money(3900)}, desde el 2026-10-28.`,
        ),
        ev(
          14,
          "2026-10-22",
          manager,
          "manager",
          "assigned",
          `${siteParties[site.id][0]} asignó el servicio a AeroVisión del Valle.`,
        ),
        ev(
          15,
          "2026-10-22",
          OPERATOR_A,
          "operator",
          "scheduled",
          "AeroVisión del Valle programó el vuelo para el 2026-10-29.",
        ),
      ],
    };
    const third: ServiceRequest = {
      ...base,
      id: `service-${site.id}-3`,
      kind: site.sector === "agriculture" ? "monitoring" : "inspection",
      title:
        site.sector === "agriculture"
          ? "Vigor del cultivo, para decidir riego"
          : "Verificar los puntos críticos",
      description:
        "Cotización pedida a dos operadores para elegir el más conveniente.",
      zoneIds: zoneIds.slice(0, 2),
      requestedBy: site.sector === "agriculture" ? owner : manager,
      windowStart: "2026-11-02",
      windowEnd: "2026-11-12",
      maxPrice: price(6500),
      status: "quoted",
      createdOn: "2026-10-23",
      quotes: [
        {
          operatorId: OPERATOR_A,
          price: price(6000),
          startDate: "2026-11-03",
          note: thirdNotes[site.sector],
          state: "open",
          on: "2026-10-24",
        },
        {
          operatorId: OPERATOR_B,
          price: price(5200),
          startDate: "2026-11-06",
          note: "Entrega en 72 horas.",
          state: "open",
          on: "2026-10-24",
        },
      ],
      events: [
        ev(
          21,
          "2026-10-23",
          site.sector === "agriculture" ? owner : manager,
          site.sector === "agriculture" ? "owner" : "manager",
          "requested",
          "Pidió el servicio e invitó a AeroVisión del Valle y Drones del Pacífico (ejemplo).",
        ),
        ev(
          22,
          "2026-10-24",
          OPERATOR_A,
          "operator",
          "quoted",
          `AeroVisión del Valle cotizó ${money(6000)}, desde el 2026-11-03.`,
        ),
        ev(
          23,
          "2026-10-24",
          OPERATOR_B,
          "operator",
          "quoted",
          `Drones del Pacífico (ejemplo) cotizó ${money(5200)}, desde el 2026-11-06.`,
        ),
      ],
    };
    const fourth: ServiceRequest = {
      ...base,
      id: `service-${site.id}-4`,
      kind: "mapping",
      title: "Mapeo de la última zona",
      description:
        "Ortomosaico y modelo de superficie para actualizar la cartografía.",
      zoneIds: zoneIds.slice(-1),
      requestedBy: manager,
      windowStart: "2026-10-20",
      windowEnd: "2026-10-27",
      maxPrice: price(8000),
      status: "delivered",
      operatorId: OPERATOR_B,
      flightId: `flight-${site.id}-07`,
      createdOn: "2026-10-16",
      quotes: [
        {
          operatorId: OPERATOR_B,
          price: price(7200),
          startDate: "2026-10-21",
          note: "",
          state: "chosen",
          on: "2026-10-17",
        },
        {
          operatorId: OPERATOR_A,
          price: price(7900),
          startDate: "2026-10-22",
          note: "",
          state: "declined",
          on: "2026-10-17",
        },
      ],
      delivery: {
        deliveredOn: "2026-10-24",
        note: "Quedó una franja sin cubrir por viento.",
        deliverables: [
          "Ortomosaico (GeoTIFF)",
          "Modelo de superficie (GeoTIFF)",
        ],
      },
      events: [
        ev(
          31,
          "2026-10-16",
          manager,
          "manager",
          "requested",
          `${siteParties[site.id][0]} pidió el servicio e invitó a AeroVisión del Valle y Drones del Pacífico (ejemplo).`,
        ),
        ev(
          32,
          "2026-10-17",
          OPERATOR_B,
          "operator",
          "quoted",
          `Drones del Pacífico (ejemplo) cotizó ${money(7200)}, desde el 2026-10-21.`,
        ),
        ev(
          33,
          "2026-10-17",
          OPERATOR_A,
          "operator",
          "quoted",
          `AeroVisión del Valle cotizó ${money(7900)}, desde el 2026-10-22.`,
        ),
        ev(
          34,
          "2026-10-18",
          manager,
          "manager",
          "assigned",
          `${siteParties[site.id][0]} asignó el servicio a Drones del Pacífico (ejemplo).`,
        ),
        ev(
          35,
          "2026-10-18",
          OPERATOR_B,
          "operator",
          "scheduled",
          "Drones del Pacífico (ejemplo) programó el vuelo para el 2026-10-24.",
        ),
        ev(
          36,
          "2026-10-24",
          OPERATOR_B,
          "operator",
          "delivered",
          "Drones del Pacífico (ejemplo) entregó ortomosaico y modelo de superficie.",
        ),
      ],
    };
    // Hectares the operators say they covered: the invoiced one matches what its flight record says, the delivered one falls a bit short.
    const polygonHa = (ids: string[]) =>
      site.sector === "roads"
        ? 0
        : Math.round(
            site.zones
              .filter((zone) => ids.includes(zone.id))
              .reduce((sum, zone) => sum + polygonAreaHa(zone.outline), 0) * 10,
          ) / 10;
    // The delivery says what the flight record says, so Servicios and Pagos show the same hectares.
    // Only services priced by hectare declare any: a road has length and a fence is flown as a loop.
    if (unit === "ha") {
      const orderedFirst = polygonHa(first.zoneIds);
      const coveredFirst = flight1?.log?.coveredHa;
      first.delivery!.coveredHa =
        coveredFirst ?? (Math.round(orderedFirst * 0.94 * 10) / 10 || 1);
      if (coveredFirst !== undefined && orderedFirst - coveredFirst >= 0.5) {
        first.delivery!.note = `Quedaron ${formatHa(orderedFirst - coveredFirst)} ha sin cubrir; está en el registro del vuelo.`;
      }
      fourth.delivery!.coveredHa =
        Math.round(polygonHa(fourth.zoneIds) * 0.88 * 10) / 10 || 1;
    }
    // A delivery the buyer returned, so the operator's answer can be tried: it declared almost
    // everything, the buyer counts less. Hectares are the zone's own; the tariff is the example one.
    if (site.sector !== "agriculture") return [first, second, third, fourth];
    const disputedZone = site.zones[1] ?? site.zones[site.zones.length - 1];
    const disputedOrdered = polygonHa([disputedZone.id]);
    const declaredHa = Math.round(disputedOrdered * 0.98 * 10) / 10;
    const countedHa = Math.round(disputedOrdered * 0.9 * 10) / 10;
    const fifth: ServiceRequest = {
      ...base,
      id: `service-${site.id}-5`,
      kind: "monitoring",
      title: `Seguimiento del ${disputedZone.name}`,
      description: `Recorrido de control de ${disputedZone.name} antes del seguimiento del mes.`,
      zoneIds: [disputedZone.id],
      requestedBy: manager,
      windowStart: "2026-10-14",
      windowEnd: "2026-10-21",
      maxPrice: price(4500),
      status: "disputed",
      operatorId: OPERATOR_B,
      createdOn: "2026-10-08",
      assignReason: "La cotización más baja de las dos.",
      quotes: [
        {
          operatorId: OPERATOR_B,
          price: price(3500),
          startDate: "2026-10-16",
          note: "",
          state: "chosen",
          on: "2026-10-09",
        },
        {
          operatorId: OPERATOR_A,
          price: price(3700),
          startDate: "2026-10-15",
          note: "",
          state: "declined",
          on: "2026-10-09",
        },
      ],
      delivery: {
        coveredHa: declaredHa,
        deliveredOn: "2026-10-21",
        note: "Recorrido completo según el registro de vuelo.",
        deliverables: ["Ortomosaico (GeoTIFF)", "Registro de vuelo (CSV)"],
      },
      verification: {
        result: "disputed",
        note: `En la ortofoto la franja del costado norte no aparece volada: cuento unas ${formatHa(declaredHa - countedHa)} ha menos de las declaradas. Pido facturar solo lo cubierto.`,
        on: "2026-10-22",
        by: manager,
      },
      events: [
        ev(
          41,
          "2026-10-08",
          manager,
          "manager",
          "requested",
          `${siteParties[site.id][0]} pidió el servicio e invitó a AeroVisión del Valle y Drones del Pacífico (ejemplo).`,
        ),
        ev(
          42,
          "2026-10-09",
          OPERATOR_B,
          "operator",
          "quoted",
          `Drones del Pacífico (ejemplo) cotizó ${money(3500)}, desde el 2026-10-16.`,
        ),
        ev(
          43,
          "2026-10-09",
          OPERATOR_A,
          "operator",
          "quoted",
          `AeroVisión del Valle cotizó ${money(3700)}, desde el 2026-10-15.`,
        ),
        ev(
          44,
          "2026-10-10",
          manager,
          "manager",
          "assigned",
          `${siteParties[site.id][0]} asignó el servicio a Drones del Pacífico (ejemplo). Motivo: La cotización más baja de las dos.`,
        ),
        ev(
          45,
          "2026-10-10",
          OPERATOR_B,
          "operator",
          "scheduled",
          "Drones del Pacífico (ejemplo) programó el vuelo para el 2026-10-20.",
        ),
        ev(
          46,
          "2026-10-21",
          OPERATOR_B,
          "operator",
          "delivered",
          `Drones del Pacífico (ejemplo) entregó: dice haber cubierto ${formatHa(declaredHa)} ha y entregó Ortomosaico (GeoTIFF), Registro de vuelo (CSV).`,
        ),
        ev(
          47,
          "2026-10-22",
          manager,
          "manager",
          "disputed",
          `${siteParties[site.id][0]} pidió ajustar la entrega: En la ortofoto la franja del costado norte no aparece volada: cuento unas ${formatHa(declaredHa - countedHa)} ha menos de las declaradas. Pido facturar solo lo cubierto.`,
        ),
      ],
    };
    return [first, second, third, fourth, fifth];
  },
);
