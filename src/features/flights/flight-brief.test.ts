import assert from "node:assert/strict";
import test from "node:test";
import {
  countsText,
  findingCounts,
  flightBrief,
  loggedConditions,
} from "./flight-brief.ts";
import { findingWords } from "./finding-words.ts";
import type { Finding, Flight, FlightLog, Site } from "../demo/types";

const site: Site = {
  id: "s",
  name: "Hacienda",
  sector: "agriculture",
  sectorLabel: "",
  location: "",
  zoneLabel: "Lotes",
  center: [3.4, -76.5],
  imageUrl: "",
  zones: [
    { id: "z1", name: "Lote 1", description: "", outline: [] },
    { id: "z2", name: "Lote 2", description: "", outline: [] },
  ],
};

const log: FlightLog = {
  weather: "clear",
  windKmh: 12,
  maxAltitudeM: 100,
  batteries: [],
  authorizationRef: "AUT-1",
  incidents: "",
  coveredHa: 26.4,
};

function flight(id: string, date: string, values: Record<string, number>) {
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
    zoneIds: ["z1", "z2"],
    route: [],
    duration: 30,
    distance: 5,
    photoCount: 100,
    checklist: [],
    capture: { values },
    log,
  } as Flight;
}

function finding(id: string, extra: Partial<Finding> = {}) {
  return {
    id,
    siteId: "s",
    flightId: "f3",
    zoneId: "z1",
    title: "Zona seca",
    description: "",
    priority: "medium",
    status: "pending",
    position: [0, 0],
    imageUrl: "",
    source: "",
    taskAssigned: false,
    ...extra,
  } as Finding;
}

const suggestion = {
  agent: "image" as const,
  confidence: "medium" as const,
  evidence: [],
  limits: "",
  photoSpan: [0.1, 0.2] as [number, number],
};

const flights = [
  flight("f1", "2026-09-10", { z1: 0.75, z2: 0.8 }),
  flight("f2", "2026-09-30", { z1: 0.72, z2: 0.8 }),
  flight("f3", "2026-10-20", { z1: 0.62, z2: 0.8 }),
];
const words = findingWords("Hallazgo", "Hallazgos");

test("a suggestion nobody reviewed is counted apart from the findings", () => {
  const counts = findingCounts([
    finding("a"),
    finding("b", { status: "confirmed" }),
    finding("c", { suggestion }),
    finding("d", { suggestion, status: "dismissed" }),
  ]);
  assert.deepEqual(counts, {
    total: 4,
    suggestedPending: 1,
    toVerify: 1,
    confirmed: 1,
    dismissed: 1,
  });
  assert.equal(
    countsText(counts, words),
    "1 hallazgo por verificar · 1 sugerencia automática sin revisar · 2 revisados",
  );
});

test("the brief opens with the trend, the uncovered area and what waits for a decision", () => {
  const lines = flightBrief({
    site,
    flight: flights[2],
    flights,
    findings: [finding("a"), finding("c", { suggestion })],
    orderedHa: 27.9,
    words,
  });
  assert.match(lines[0], /Lote 1: el vigor del cultivo bajó/);
  assert.match(lines[1], /26,4 de 27,9 ha pedidas: quedaron 1,5 ha sin cubrir/);
  assert.match(lines[2], /1 hallazgo por verificar/);
  assert.match(lines[3], /1 sugerencia automática sin revisar/);
});

test("the brief warns about corrective measures past their deadline, wherever the finding was seen", () => {
  const late = finding("late", {
    flightId: "f1",
    status: "confirmed",
    followUp: {
      owner: "Contratista",
      dueDate: "2026-10-16",
      status: "inProgress",
      history: [],
    },
  });
  const lines = flightBrief({
    site,
    flight: flights[2],
    flights,
    findings: [late],
    orderedHa: 0,
    words,
    today: "2026-10-30",
  });
  assert.ok(lines.some((line) => /1 medida correctiva vencida/.test(line)));
  const onTime = flightBrief({
    site,
    flight: flights[2],
    flights,
    findings: [late],
    orderedHa: 0,
    words,
    today: "2026-10-10",
  });
  assert.ok(!onTime.some((line) => /vencida/.test(line)));
});

test("the trend is read only up to the flight being reported", () => {
  const lines = flightBrief({
    site,
    flight: flights[1],
    flights,
    findings: [],
    orderedHa: 0,
    words,
  });
  assert.ok(!lines.some((line) => line.includes("el vigor")));
});

test("weather and authorization come from the operator's log", () => {
  assert.deepEqual(loggedConditions(log), {
    weather: "Despejado · viento 12 km/h",
    authorization: "AUT-1",
  });
  assert.equal(
    loggedConditions({ ...log, authorizationRef: "" }).authorization,
    "Sin referencia en la bitácora",
  );
  assert.equal(
    loggedConditions(undefined).weather,
    "Sin bitácora del operador",
  );
});

test("a flight not flown yet has no results to report", () => {
  const lines = flightBrief({
    site,
    flight: { ...flights[2], status: "scheduled" },
    flights,
    findings: [],
    words,
  });
  assert.match(lines[0], /todavía no hay entrega/);
});
