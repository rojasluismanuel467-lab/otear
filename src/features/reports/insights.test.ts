import assert from "node:assert/strict";
import test from "node:test";
import { compareWithHistory, computeInsights } from "./insights.ts";
import type {
  Finding,
  Flight,
  FlightDocument,
  Invoice,
  Site,
} from "../demo/types";

const site = {
  id: "s",
  name: "Sitio",
  sector: "agriculture",
  sectorLabel: "Agricultura",
  location: "",
  zoneLabel: "Lotes",
  center: [0, 0],
  imageUrl: "",
  zones: [
    { id: "z1", name: "Lote 1", description: "", outline: [] },
    { id: "z2", name: "Lote 2", description: "", outline: [] },
  ],
} as Site;

function flight(id: string, date: string, extra: Partial<Flight> = {}): Flight {
  return {
    id,
    siteId: "s",
    title: id,
    objective: "",
    date,
    time: "08:00",
    status: "completed",
    pilot: "",
    operator: "",
    manager: "",
    drone: "",
    zoneIds: ["z1"],
    route: [],
    duration: 30,
    distance: 5,
    photoCount: 100,
    checklist: [],
    ...extra,
  };
}

function finding(
  id: string,
  flightId: string,
  zoneId: string,
  extra: Partial<Finding> = {},
): Finding {
  return {
    id,
    siteId: "s",
    flightId,
    zoneId,
    title: id,
    description: "",
    priority: "low",
    status: "confirmed",
    position: [0, 0],
    imageUrl: "",
    source: "",
    taskAssigned: false,
    ...extra,
  };
}

const base = {
  site,
  invoices: [] as Invoice[],
  documents: [] as FlightDocument[],
  zoneMeasure: { z1: 10, z2: 20 },
  checklistTotal: 15,
};

test("totals add up completed flights only", () => {
  const result = computeInsights({
    ...base,
    flights: [
      flight("a", "2026-01-01"),
      flight("b", "2026-02-01", { duration: 90 }),
      flight("c", "2026-03-01", { status: "scheduled" }),
    ],
    findings: [],
  });
  assert.equal(result.totals.flights, 2);
  assert.equal(result.totals.hours, 2);
  assert.equal(result.totals.photos, 200);
});

test("a zone that repeats across three flights is flagged", () => {
  const flights = ["a", "b", "c"].map((id, i) =>
    flight(id, `2026-0${i + 1}-01`),
  );
  const findings = flights.map((f, i) => finding(`f${i}`, f.id, "z1"));
  const result = computeInsights({ ...base, flights, findings });
  assert.equal(result.byZone[0].zoneId, "z1");
  assert.equal(result.byZone[0].flightsWithFindings, 3);
  assert.ok(result.attention.some((item) => item.id === "rec-z1"));
});

test("pending high priority findings, expired documents and balances need attention", () => {
  const result = computeInsights({
    ...base,
    flights: [flight("a", "2026-01-01")],
    findings: [
      finding("f", "a", "z2", { status: "pending", priority: "high" }),
    ],
    documents: [
      {
        id: "d",
        siteId: "s",
        title: "Póliza",
        subject: "Dron",
        category: "drone",
        status: "expired",
        validUntil: "2026-01-01",
        reference: "",
        fileName: null,
      },
    ],
    invoices: [
      {
        id: "i",
        siteId: "s",
        flightId: "a",
        reference: "FV-1",
        description: "",
        operator: "",
        total: 100,
        paid: 40,
        dueDate: "2026-02-01",
      },
    ],
  });
  const ids = result.attention.map((item) => item.id);
  assert.ok(ids.includes("high-pending"));
  assert.ok(ids.includes("doc-d"));
  assert.ok(ids.includes("inv-i"));
  assert.equal(result.totals.pending, 1);
});

test("cost per hectare uses the zones that were flown", () => {
  const result = computeInsights({
    ...base,
    flights: [flight("a", "2026-01-01", { zoneIds: ["z1", "z2"] })],
    findings: [],
    invoices: [
      {
        id: "i",
        siteId: "s",
        flightId: "a",
        reference: "FV-1",
        description: "",
        operator: "",
        total: 300000,
        paid: 300000,
        dueDate: "",
      },
    ],
  });
  assert.equal(result.cost.perUnit, 10000);
  assert.equal(result.cost.unit, "ha");
});

test("log fields feed the operation summary", () => {
  const log = {
    weather: "rain" as const,
    windKmh: 30,
    maxAltitudeM: 100,
    batteries: ["B1", "B2"],
    authorizationRef: "",
    incidents: "Enlace perdido",
  };
  const result = computeInsights({
    ...base,
    flights: [flight("a", "2026-01-01", { log }), flight("b", "2026-02-01")],
    findings: [],
  });
  assert.equal(result.operation.windyFlights, 1);
  assert.equal(result.operation.incidents, 1);
  assert.equal(result.operation.batteries.length, 2);
  assert.ok(result.attention.some((item) => item.id === "no-log"));
});

import { buildConsolidatedReport } from "./consolidated-report.ts";

test("consolidated report covers only the chosen period", () => {
  const flights = [
    flight("a", "2026-01-10", { title: "Enero" }),
    flight("b", "2026-03-10", { title: "Marzo" }),
  ];
  const text = buildConsolidatedReport(
    { ...base, flights, findings: [finding("f", "b", "z1")] },
    { from: "2026-03-01", to: "2026-03-31" },
    {
      summary: true,
      flights: true,
      zones: true,
      operation: false,
      attention: false,
      costs: false,
    },
  );
  assert.ok(text.includes("Marzo"));
  assert.ok(!text.includes("Enero"));
  assert.ok(text.includes("Lote 1: 1"));
  assert.ok(
    buildConsolidatedReport(
      { ...base, flights, findings: [] },
      { from: "2027-01-01", to: "2027-02-01" },
      {
        summary: true,
        flights: true,
        zones: true,
        operation: true,
        attention: true,
        costs: true,
      },
    ).includes("No hay vuelos completados"),
  );
});

test("a finding repeated from earlier flights is persistent", () => {
  const flights = [
    flight("a", "2026-01-01"),
    flight("b", "2026-02-01"),
    flight("c", "2026-03-01"),
  ];
  const findings = [
    finding("f1", "a", "z1", { title: "Cobertura irregular" }),
    finding("f2", "b", "z1", { title: "Cobertura irregular" }),
    finding("f3", "c", "z1", { title: "Cobertura irregular" }),
    finding("f4", "c", "z2", { title: "Otra" }),
  ];
  const third = compareWithHistory(findings[2], findings, flights);
  assert.equal(third.trend, "persistent");
  assert.equal(third.earlierFlights, 2);
  assert.equal(compareWithHistory(findings[0], findings, flights).trend, "new");
  assert.equal(compareWithHistory(findings[3], findings, flights).trend, "new");
});

test("unreviewed suggestions from the image assistant stay out of every count", () => {
  const flights = [flight("a", "2026-01-01")];
  const suggested = finding("s", "a", "z1", {
    status: "pending",
    priority: "high",
    suggestion: {
      agent: "image",
      confidence: "low",
      evidence: [],
      limits: "",
      photoSpan: [0, 1],
    },
  });
  const result = computeInsights({
    ...base,
    flights,
    findings: [finding("own", "a", "z1"), suggested],
  });
  assert.equal(result.totals.findings, 1);
  assert.equal(result.totals.pending, 0);
  assert.equal(result.totals.suggestionsPending, 1);
  assert.equal(result.byZone[0].findings, 1);
  assert.ok(!result.attention.some((item) => item.id === "high-pending"));
});

test("cost per hectare divides the invoices by the area of the flights that were invoiced", () => {
  const result = computeInsights({
    ...base,
    flights: [
      flight("a", "2026-01-01", { zoneIds: ["z1"] }),
      flight("b", "2026-02-01", { zoneIds: ["z2"] }),
    ],
    findings: [],
    invoices: [
      {
        id: "i",
        siteId: "s",
        flightId: "a",
        reference: "FV-1",
        description: "",
        operator: "",
        total: 100000,
        paid: 0,
        dueDate: "",
      },
    ],
  });
  // Flight b has no invoice: its 20 ha do not enter the denominator.
  assert.equal(result.cost.perUnit, 10000);
  assert.deepEqual(result.cost.perUnitBasis, {
    invoices: 1,
    flights: 1,
    billed: 100000,
  });
});

const measure = (
  status: "open" | "inProgress" | "closed",
  dueDate: string,
  extra: Partial<NonNullable<Finding["followUp"]>> = {},
): NonNullable<Finding["followUp"]> => ({
  owner: "Contratista",
  dueDate,
  status,
  history: [],
  ...extra,
});

const measureFlights = [flight("a", "2026-09-01"), flight("b", "2026-10-01")];
const measureFindings = [
  finding("late", "a", "z1", {
    title: "Drenaje",
    followUp: measure("inProgress", "2026-10-16"),
  }),
  finding("ok", "b", "z1", { followUp: measure("open", "2026-11-06") }),
  finding("done", "a", "z2", {
    followUp: measure("closed", "2026-09-20", { closedOn: "2026-09-18" }),
  }),
  finding("ai", "b", "z2", {
    status: "pending",
    followUp: measure("open", "2026-10-01"),
    suggestion: {
      agent: "image",
      confidence: "low",
      evidence: [],
      limits: "",
      photoSpan: [0, 0],
    },
  }),
];

test("measures are counted by state and a late one needs attention; unreviewed suggestions stay out", () => {
  const result = computeInsights({
    ...base,
    flights: measureFlights,
    findings: measureFindings,
    today: "2026-10-30",
  });
  assert.deepEqual(result.measures, {
    open: 1,
    inProgress: 1,
    closed: 1,
    overdue: 1,
    active: 2,
    withoutMeasure: 0,
  });
  const alert = result.attention.find((item) => item.id === "overdue-measures");
  assert.equal(alert?.tone, "danger");
  assert.match(alert?.text ?? "", /1 medida correctiva vencida.*Drenaje/);
  const quiet = computeInsights({
    ...base,
    flights: measureFlights,
    findings: measureFindings,
    today: "2026-10-10",
  });
  assert.ok(!quiet.attention.some((item) => item.id === "overdue-measures"));
});

test("the consolidated report lists pending measures and the ones closed in the period", () => {
  const text = buildConsolidatedReport(
    { ...base, flights: measureFlights, findings: measureFindings },
    { from: "2026-10-01", to: "2026-10-31" },
    {
      summary: false,
      flights: false,
      zones: false,
      operation: false,
      attention: false,
      costs: false,
      followUp: true,
    },
  );
  assert.match(text, /SEGUIMIENTO DE MEDIDAS CORRECTIVAS/);
  assert.match(
    text,
    /3 medidas: 1 abierta, 1 en corrección, 1 cerrada · 1 vencida/,
  );
  assert.match(text, /- Drenaje .*Vencida \(en corrección\)/);
  // Closed on 18 September: outside October, so it is counted but not listed.
  assert.ok(!text.includes("- done"));
  const september = buildConsolidatedReport(
    { ...base, flights: measureFlights, findings: measureFindings },
    { from: "2026-09-01", to: "2026-09-30" },
    {
      summary: false,
      flights: false,
      zones: false,
      operation: false,
      attention: false,
      costs: false,
      followUp: true,
    },
  );
  assert.ok(september.includes("- done"));
});
