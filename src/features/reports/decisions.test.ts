import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultReportPeriod,
  latestMovement,
  requestsAfter,
  serviceDecisionLines,
} from "./decisions.ts";
import { buildConsolidatedReport } from "./consolidated-report.ts";
import { operatorSummaries } from "./operators.ts";
import type {
  Flight,
  Invoice,
  Party,
  ServiceRequest,
  Site,
} from "../demo/types";

const site = {
  id: "s",
  name: "Sitio",
  sector: "agriculture",
  sectorLabel: "Agricultura",
  zoneLabel: "Lotes",
  zones: [
    {
      id: "z1",
      name: "Lote 1",
      description: "",
      outline: [
        [-76, 3],
        [-75.9935, 3],
        [-75.9935, 3.0065],
        [-76, 3.0065],
      ],
    },
  ],
} as unknown as Site;
const parties: Party[] = [
  { id: "m", role: "manager", name: "Ingenio", siteIds: ["s"] },
  { id: "o", role: "operator", name: "AeroUno", siteIds: ["s"] },
  { id: "p", role: "operator", name: "AeroDos", siteIds: ["s"] },
];
const request = {
  id: "r",
  siteId: "s",
  kind: "monitoring",
  title: "Vigor del cultivo",
  description: "",
  zoneIds: ["z1"],
  requestedBy: "Ingenio",
  invited: ["o", "p"],
  windowStart: "2026-10-18",
  windowEnd: "2026-10-26",
  unit: "ha",
  maxPrice: 4500,
  status: "invoiced",
  operatorId: "o",
  flightId: "f",
  invoiceId: "i",
  createdOn: "2026-10-12",
  quotes: [
    {
      operatorId: "o",
      price: 3500,
      startDate: "2026-10-22",
      note: "",
      state: "chosen",
      on: "2026-10-13",
    },
    {
      operatorId: "p",
      price: 4100,
      startDate: "2026-10-24",
      note: "",
      state: "declined",
      on: "2026-10-14",
    },
  ],
  delivery: {
    coveredHa: 9.5,
    deliveredOn: "2026-10-24",
    note: "",
    deliverables: [],
  },
  verification: {
    result: "accepted",
    note: "",
    on: "2026-10-25",
    by: "Ingenio",
  },
  events: [],
} as unknown as ServiceRequest;
const invoice = {
  id: "i",
  siteId: "s",
  flightId: "f",
  reference: "FV-1",
  description: "",
  operator: "AeroUno",
  total: 35000,
  paid: 10000,
  dueDate: "",
  billedHa: 10,
} as Invoice;
const flights = [
  {
    id: "f",
    title: "Vuelo",
    date: "2026-10-24",
    status: "completed",
    operator: "AeroUno",
    zoneIds: ["z1"],
    duration: 30,
    log: { coveredHa: 9.5, incidents: "", batteries: [], windKmh: 5 },
    origin: {
      agent: "next-flight",
      reasons: ["Lote 1: vigor en baja"],
      approvedOn: "2026-10-20",
    },
  },
] as unknown as Flight[];
const period = { from: "2026-10-01", to: "2026-10-31" };

test("the decisions of a request read in order with the chosen quote and the hectares", () => {
  const text = serviceDecisionLines({
    site,
    requests: [request],
    parties,
    invoices: [invoice],
    flights,
    zoneMeasure: { z1: 10 },
    operators: operatorSummaries({
      flights,
      findings: [],
      invoices: [invoice],
      requests: [request],
      zones: site.zones,
      sector: site.sector,
    }),
    period,
  }).join("\n");
  assert.ok(text.includes("Solo de Sitio"));
  assert.ok(text.includes("Cotizaciones: 2"));
  assert.ok(text.includes("Cotización elegida: AeroUno"));
  assert.ok(text.includes("$ 35.000 COP para 10 ha"));
  assert.ok(text.includes("Sin motivo anotado al elegir"));
  assert.ok(text.includes("declaró 9,5 ha cubiertas"));
  assert.ok(text.includes("Factura FV-1"));
  // Ordered (the zone drawn on the map) is never less than what was declared as covered.
  assert.match(text, /AeroUno: 1\d,\d \/ 9,5 \/ 10 ha/);
  assert.ok(!text.includes("más de las que miden"));
  assert.ok(text.includes("propuesta de IA aprobada el"));
});

test("outside the period there is nothing to report and the text says so", () => {
  const text = serviceDecisionLines({
    site,
    requests: [request],
    parties,
    invoices: [],
    flights: [],
    zoneMeasure: { z1: 10 },
    operators: [],
    period: { from: "2027-01-01", to: "2027-01-31" },
  });
  assert.ok(text[0].includes("No hay solicitudes"));
});

test("the consolidated report adds the decisions section only when asked", () => {
  const input = {
    site,
    flights,
    findings: [],
    invoices: [invoice],
    documents: [],
    zoneMeasure: { z1: 10 },
    checklistTotal: 15,
    serviceRequests: [request],
    parties,
  };
  const sections = {
    summary: false,
    flights: false,
    zones: false,
    operation: false,
    attention: false,
    costs: false,
  };
  assert.ok(
    !buildConsolidatedReport(input, period, sections).includes(
      "SERVICIOS CONTRATADOS",
    ),
  );
  assert.ok(
    buildConsolidatedReport(input, period, {
      ...sections,
      services: true,
    }).includes("SERVICIOS CONTRATADOS Y DECISIONES"),
  );
});

test("the reason written when assigning appears in the report, and the dispute answer too", () => {
  const withReason = {
    ...request,
    assignReason: "La más barata y con mejor historial en el sitio",
    verification: {
      result: "disputed" as const,
      note: "Cuento 1 ha menos",
      on: "2026-10-25",
      by: "m",
    },
    disputeReply: {
      kind: "adjusted" as const,
      note: "De acuerdo.",
      supportFiles: ["Registro de vuelo (CSV)"],
      on: "2026-10-26",
      by: "o",
      previousHa: 9.5,
      adjustedHa: 8.5,
    },
  } as ServiceRequest;
  const text = serviceDecisionLines({
    site,
    requests: [withReason],
    parties,
    invoices: [],
    flights: [],
    zoneMeasure: { z1: 10 },
    operators: [],
    period,
  }).join("\n");
  assert.ok(
    text.includes(
      "Motivo de la elección: La más barata y con mejor historial en el sitio.",
    ),
  );
  assert.ok(!text.includes("Sin motivo anotado"));
  assert.ok(text.includes("por Ingenio: Cuento 1 ha menos"));
  assert.ok(text.includes("aceptó el ajuste, de 9,5 a 8,5 ha"));
  assert.ok(text.includes("Soportes anotados: Registro de vuelo (CSV)"));
});

test("the reason and the answer keep a single full stop when the person already typed one", () => {
  const text = serviceDecisionLines({
    site,
    requests: [
      {
        ...request,
        assignReason: "La cotización más baja de las dos.",
        verification: { ...request.verification!, result: "accepted" },
      } as ServiceRequest,
    ],
    parties,
    invoices: [],
    flights,
    zoneMeasure: { z1: 10 },
    operators: [],
    period,
  }).join("\n");
  assert.ok(text.includes("de las dos."));
  assert.ok(!text.includes(".."));
});

test("a service invoiced without a flight adds up the same in the operator rows, the services text and the costs", () => {
  const noFlight = {
    ...request,
    id: "r2",
    title: "Seguimiento sin vuelo",
    flightId: undefined,
    invoiceId: "i2",
    delivery: { ...request.delivery!, coveredHa: 6.4 },
  } as ServiceRequest;
  const orphan = {
    ...invoice,
    id: "i2",
    flightId: "",
    reference: "FV-2",
    total: 192000,
    paid: 0,
    billedHa: 7,
  } as Invoice;
  const rows = operatorSummaries({
    flights,
    findings: [],
    invoices: [invoice, orphan],
    requests: [request, noFlight],
    zones: site.zones,
    sector: site.sector,
  });
  const row = rows.find((item) => item.operator === "AeroUno")!;
  // Covered: the flight record (9,5) plus the delivery without flight (6,4); billed 10 + 7.
  assert.equal(row.coveredHa, 9.5 + 6.4);
  assert.equal(row.billedHa, 17);
  const input = {
    site,
    flights,
    findings: [],
    invoices: [invoice, orphan],
    documents: [],
    zoneMeasure: { z1: 10 },
    checklistTotal: 15,
    serviceRequests: [request, noFlight],
    parties,
  };
  const report = buildConsolidatedReport(input, period, {
    summary: false,
    flights: false,
    zones: false,
    operation: false,
    attention: false,
    costs: true,
    services: true,
  });
  // Costs count both invoices (35.000 + 192.000), as the Informes tab does.
  assert.ok(report.includes("Facturado: $ 227.000 COP"));
  assert.ok(report.includes("Factura FV-2: $ 192.000 COP"));
  assert.match(report, /AeroUno: 2\d,\d \/ 15,9 \/ 17 ha/);
});

test("the report opens up to the latest decision, not only to the last flight", () => {
  const requests = [
    { createdOn: "2026-10-12", events: [{ on: "2026-10-24" }] },
    { createdOn: "2026-10-25", events: [{ on: "2026-10-25" }] },
  ];
  assert.deepEqual(
    defaultReportPeriod({
      flightDates: ["2026-07-18", "2026-10-24"],
      requests: requests as never,
      today: "2026-10-25",
    }),
    { from: "2026-07-18", to: "2026-10-25" },
  );
  // A step recorded after the flights and after «today» still ends the period.
  assert.equal(
    defaultReportPeriod({
      flightDates: ["2026-10-01"],
      requests: [{ createdOn: "2026-10-02", events: [{ on: "2026-11-03" }] }] as never,
      today: "2026-10-25",
    }).to,
    "2026-11-03",
  );
  // «Today» counts even when nothing else happened that late.
  assert.equal(
    defaultReportPeriod({
      flightDates: ["2026-10-01"],
      requests: [],
      today: "2026-10-25",
    }).to,
    "2026-10-25",
  );
  // Nothing at all: the period is the day of the demo.
  assert.deepEqual(
    defaultReportPeriod({ flightDates: [], requests: [], today: "2026-10-25" }),
    { from: "2026-10-25", to: "2026-10-25" },
  );
});

test("requests with movements after the end date are found, and the latest day is given", () => {
  const requests = [
    { createdOn: "2026-10-12", events: [{ on: "2026-10-24" }] },
    { createdOn: "2026-10-25", events: [{ on: "2026-10-26" }] },
  ] as never;
  assert.equal(requestsAfter(requests, "2026-10-24").length, 1);
  assert.equal(requestsAfter(requests, "2026-10-26").length, 0);
  assert.equal(latestMovement(requests), "2026-10-26");
});

test("a delivery without hectares (a service priced per flight) says only that it was delivered", () => {
  const perFlight = {
    ...request,
    unit: "flight",
    delivery: { deliveredOn: "2026-10-24", note: "", deliverables: [] },
  } as ServiceRequest;
  const text = serviceDecisionLines({
    site,
    requests: [perFlight],
    parties,
    invoices: [],
    flights: [],
    zoneMeasure: { z1: 10 },
    operators: [],
    period,
  }).join("\n");
  assert.ok(text.includes("AeroUno entregó el"));
  assert.ok(!text.includes("cubiertas"));
});
