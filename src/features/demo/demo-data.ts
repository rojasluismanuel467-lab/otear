import { preparationGroups } from "@/features/flights/planning/preparation-items";
import { newEvidence, withSignature } from "@/features/traceability/integrity";
import { autofill, templates } from "@/features/traceability/templates";
import { defaultPlan } from "@/features/fleet/fleet";
import { polygonAreaHa } from "@/lib/geo";
import type {
  Aircraft,
  Capture,
  Battery,
  Evidence,
  MaintenanceRecord,
  PartMark,
  Finding,
  Flight,
  FlightDocument,
  Invoice,
  Payment,
  Site,
} from "./types";

export const DEMO_DATE = "2026-10-25";
const baseSites: Site[] = [
  {
    id: "santa-rita",
    name: "Hacienda Santa Rita",
    sector: "agriculture",
    sectorLabel: "Agricultura",
    location: "Guacarí, Valle del Cauca",
    zoneLabel: "Lotes",
    center: [3.764, -76.333],
    imageUrl: "/images/aerial-field.jpg",
    zones: [
      {
        id: "zone-sr-3",
        name: "Lote 3",
        description: "Caña · 74,0 ha",
        outline: [
          [3.77, -76.341],
          [3.773, -76.333],
          [3.767, -76.329],
          [3.764, -76.337],
        ],
      },
      {
        id: "zone-sr-4",
        name: "Lote 4",
        description: "Caña · 83,9 ha",
        outline: [
          [3.764, -76.337],
          [3.767, -76.329],
          [3.76, -76.325],
          [3.757, -76.333],
        ],
      },
      {
        id: "zone-sr-5",
        name: "Lote 5",
        description: "Aguacate · 85,1 ha",
        outline: [
          [3.759, -76.344],
          [3.764, -76.337],
          [3.757, -76.333],
          [3.752, -76.34],
        ],
      },
    ],
  },
  {
    id: "via-la-habana",
    name: "Vía Buga – La Habana",
    sector: "roads",
    sectorLabel: "Carreteras",
    location: "Buga, Valle del Cauca",
    zoneLabel: "Tramos",
    center: [3.872, -76.258],
    imageUrl: "/images/aerial-road.jpg",
    zones: [
      {
        id: "zone-vh-1",
        name: "Tramo K0–K6",
        description: "Seguimiento de pavimento · 1,4 km",
        outline: [
          [3.876, -76.27],
          [3.874, -76.264],
          [3.872, -76.258],
        ],
      },
      {
        id: "zone-vh-2",
        name: "Tramo K6–K12",
        description: "Taludes y drenaje · 1,6 km",
        outline: [
          [3.872, -76.258],
          [3.868, -76.252],
          [3.863, -76.247],
        ],
      },
    ],
  },
  {
    id: "obra-alameda",
    name: "Obra Alameda",
    sector: "construction",
    sectorLabel: "Construcción",
    location: "Cali, Valle del Cauca",
    zoneLabel: "Frentes",
    center: [3.41, -76.524],
    imageUrl: "/images/aerial-road.jpg",
    zones: [
      {
        id: "zone-oa-1",
        name: "Frente norte",
        description: "Movimiento de tierras",
        outline: [
          [3.414, -76.529],
          [3.415, -76.521],
          [3.41, -76.519],
          [3.409, -76.527],
        ],
      },
      {
        id: "zone-oa-2",
        name: "Frente sur",
        description: "Avance de cimentación",
        outline: [
          [3.409, -76.527],
          [3.41, -76.519],
          [3.405, -76.518],
          [3.404, -76.525],
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
    center: [3.538, -76.496],
    imageUrl: "/images/aerial-road.jpg",
    zones: [
      {
        id: "zone-pp-1",
        name: "Sector occidental",
        description: "Cerramiento y accesos",
        outline: [
          [3.544, -76.502],
          [3.544, -76.497],
          [3.537, -76.496],
          [3.536, -76.502],
        ],
      },
      {
        id: "zone-pp-2",
        name: "Sector oriental",
        description: "Perímetro y bodegas",
        outline: [
          [3.544, -76.497],
          [3.544, -76.491],
          [3.537, -76.49],
          [3.537, -76.496],
        ],
      },
    ],
  },
];

const schedules: Record<string, Site["schedule"]> = {
  "obra-alameda": { start: "2026-06-01", end: "2027-02-15", targetLevels: 8 },
  "via-la-habana": { start: "2026-06-15", end: "2027-01-31" },
};

export const sites: Site[] = baseSites.map((site) => ({
  ...site,
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
  roads: {
    zones: [
      [20, 45, 70, 85, 100],
      [5, 15, 25, 25, 30],
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
    objective: "Registro periódico para comparar el estado de las zonas.",
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
      gsdCm: 2.1,
      overlapPct: 75,
      controlPoints: false,
      deliverables: ["Fotografías originales (JPG)", "Ortomosaico (GeoTIFF)"],
    },
    // Past flights covered one or two zones, with the first zone flown most often.
    zoneIds: site.zones
      .filter((_, index) => index === 0 || (index + item.n) % 2 === 0)
      .map((zone) => zone.id),
  }));
}

const baseFlights: Flight[] = sites.flatMap((site, index) => {
  const [lat, lng] = site.center;
  const common = {
    siteId: site.id,
    pilot: "Camilo Torres",
    operator: "AeroVisión del Valle",
    manager: "Luis Rojas",
    drone: "DJI Mavic 3 Enterprise",
    aircraftId: `aircraft-${site.id}-1`,
    zoneIds: site.zones.map((zone) => zone.id),
    route: [
      [lat + 0.006, lng - 0.007],
      [lat + 0.006, lng + 0.004],
      [lat + 0.002, lng - 0.007],
      [lat + 0.002, lng + 0.004],
      [lat - 0.002, lng - 0.007],
      [lat - 0.002, lng + 0.004],
    ] as [number, number][],
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
      ][index],
      objective: [
        "Revisar labores y localizar puntos por verificar en campo.",
        "Documentar pavimento, drenajes y taludes de los tramos intervenidos.",
        "Documentar el avance de los frentes y los puntos pendientes.",
        "Documentar el cerramiento y los accesos para revisión del responsable.",
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
      objective: "Comparar el estado de las zonas con el registro anterior.",
      date: "2026-10-29",
      time: "07:00",
      status: "scheduled",
      duration: 35,
      distance: 5.8,
      photoCount: 0,
    },
    ...historyFor(site, common),
  ];
});

/**
 * Hectares each operator reports having covered, for area-priced sites. The first flight of
 * the agriculture site covers a bit less than was ordered, so the area check has something to find.
 */
export const initialFlights: Flight[] = baseFlights.map((flight) => {
  const site = sites.find((item) => item.id === flight.siteId);
  if (
    !site ||
    site.sector !== "agriculture" ||
    flight.status !== "completed" ||
    !flight.log
  )
    return flight;
  const ordered = site.zones
    .filter((zone) => flight.zoneIds.includes(zone.id))
    .reduce((sum, zone) => sum + polygonAreaHa(zone.outline), 0);
  const factor = flight.id.endsWith("-01") ? 0.94 : 0.99;
  return {
    ...flight,
    log: { ...flight.log, coveredHa: Math.round(ordered * factor * 10) / 10 },
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
};

const currentFindings: Finding[] = sites.flatMap((site) =>
  [0, 1, 2].map((index) => ({
    id: `finding-${site.id}-${index + 1}`,
    siteId: site.id,
    flightId: `flight-${site.id}-01`,
    zoneId: site.zones[index % site.zones.length].id,
    title: findingNames[site.sector][index],
    description:
      "El operador señaló este punto en su entrega. Revisar la evidencia y confirmar la observación en sitio antes de tomar una decisión.",
    priority: (["high", "medium", "low"] as const)[index],
    status: "pending",
    position: [
      site.center[0] + 0.003 - index * 0.002,
      site.center[1] - 0.003 + index * 0.003,
    ],
    imageUrl: site.imageUrl,
    source: "Observación del operador · ejemplo",
    taskAssigned: false,
  })),
);

const historyFindings: Finding[] = sites.flatMap((site) =>
  history.flatMap((item, flightIndex) =>
    [0, 1, 2]
      .slice(0, flightIndex === 1 || flightIndex === 3 ? 3 : 2)
      .map((index) => ({
        id: `finding-${site.id}-h${item.n}-${index + 1}`,
        siteId: site.id,
        flightId: `flight-${site.id}-0${item.n}`,
        // The first zone repeats on purpose: recurrence is what the insights surface.
        zoneId:
          site.zones[
            index === 0 ? 0 : (index + flightIndex) % site.zones.length
          ].id,
        title: findingNames[site.sector][index],
        description:
          "Observación de un vuelo anterior, ya revisada por el responsable en el escenario de ejemplo.",
        priority: (["high", "medium", "low"] as const)[
          (index + flightIndex) % 3
        ],
        status: (index === 2 ? "dismissed" : "confirmed") as Finding["status"],
        position: [
          site.center[0] + 0.003 - index * 0.002 + flightIndex * 0.0004,
          site.center[1] - 0.003 + index * 0.003,
        ] as [number, number],
        imageUrl: site.imageUrl,
        source: "Observación del operador · ejemplo",
        taskAssigned: index === 0,
      })),
  ),
);

export const initialFindings: Finding[] = [
  ...currentFindings,
  ...historyFindings,
];

const historyInvoices: Invoice[] = sites.flatMap((site, siteIndex) =>
  history.map((item, index) => ({
    id: `invoice-${site.id}-h${item.n}`,
    siteId: site.id,
    flightId: `flight-${site.id}-0${item.n}`,
    reference: `FV-2026-${100 + siteIndex * 10 + index}`,
    description: "Inspección aérea y entrega de evidencia",
    operator: "AeroVisión del Valle",
    total: 780000 + index * 20000,
    paid: 780000 + index * 20000,
    dueDate: item.date.replace(/-\d\d$/, "-28"),
    source: "manual" as const,
  })),
);

export const initialInvoices: Invoice[] = [
  ...sites.flatMap((site, index) => [
    {
      id: `invoice-${site.id}-01`,
      siteId: site.id,
      flightId: `flight-${site.id}-01`,
      reference: `FV-2026-0${34 + index}`,
      description: "Inspección aérea y entrega de evidencia",
      operator: "AeroVisión del Valle",
      total: 850000,
      paid: 400000,
      dueDate: "2026-10-30",
      ...(site.sector === "agriculture" ? { billedHa: 243 } : {}),
    },
    {
      id: `invoice-${site.id}-02`,
      siteId: site.id,
      flightId: `flight-${site.id}-01`,
      reference: `FV-2026-0${21 + index}`,
      description: "Registro aéreo de seguimiento anterior",
      operator: "AeroVisión del Valle",
      total: 620000,
      paid: 620000,
      dueDate: "2026-10-15",
    },
  ]),
  ...historyInvoices,
];

export const initialPayments: Payment[] = initialInvoices.map(
  (invoice, index) => ({
    id: `payment-${index + 1}`,
    invoiceId: invoice.id,
    amount: invoice.paid,
    date: invoice.id.includes("-h")
      ? invoice.dueDate
      : invoice.paid === invoice.total
        ? "2026-10-14"
        : "2026-10-24",
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
  const owner = {
    name: "Martha Lucía Ocampo",
    documentId: "31.456.789",
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
    ownerRole: "Propietario",
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
