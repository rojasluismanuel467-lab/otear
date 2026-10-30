import assert from "node:assert/strict";
import test from "node:test";
import { addDays, suggestNextFlight } from "./flight-proposal.ts";
import type { Finding, Flight, Position, Site } from "../demo/types";

function square(lat: number, lng: number): Position[] {
  const d = 0.002;
  return [
    [lat, lng],
    [lat, lng + d],
    [lat + d, lng + d],
    [lat + d, lng],
  ];
}

function makeSite(sector: Site["sector"] = "agriculture"): Site {
  return {
    id: "s",
    name: "Sitio",
    sector,
    sectorLabel: "",
    location: "",
    zoneLabel: "Lotes",
    center: [3.4, -76.5],
    imageUrl: "",
    zones: [
      {
        id: "z1",
        name: "Lote 1",
        description: "",
        outline: square(3.4, -76.5),
      },
      {
        id: "z2",
        name: "Lote 2",
        description: "",
        outline: square(3.4, -76.496),
      },
      {
        id: "z3",
        name: "Lote 3",
        description: "",
        outline: square(3.4, -76.492),
      },
    ],
  };
}

function flight(
  id: string,
  date: string,
  values: Record<string, number>,
  extra: Partial<Flight> = {},
): Flight {
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
    zoneIds: Object.keys(values),
    route: [],
    duration: 30,
    distance: 5,
    photoCount: 100,
    checklist: [],
    capture: { values },
    ...extra,
  };
}

function finding(id: string, flightId: string, extra: Partial<Finding> = {}) {
  return {
    id,
    siteId: "s",
    flightId,
    zoneId: "z1",
    title: "Zona seca",
    description: "",
    priority: "medium",
    status: "confirmed",
    position: [3.4, -76.5],
    imageUrl: "",
    source: "",
    taskAssigned: false,
    ...extra,
  } as Finding;
}

const today = "2026-10-25";

// z1 loses vigor on each flight, z2 is steady, z3 improves.
const history = [
  flight("f1", "2026-09-10", { z1: 0.74, z2: 0.7, z3: 0.6 }),
  flight("f2", "2026-09-30", { z1: 0.7, z2: 0.7, z3: 0.64 }),
  flight("f3", "2026-10-20", { z1: 0.64, z2: 0.71, z3: 0.68 }),
];

test("proposes the zone whose vigor fell over consecutive flights", () => {
  const result = suggestNextFlight({
    site: makeSite(),
    flights: history,
    findings: [],
    today,
    zoneMeasure: {},
  });
  assert.ok(result.proposal);
  assert.deepEqual(result.proposal.zoneIds, ["z1"]);
  const first = result.assessments[0];
  assert.equal(first.zoneId, "z1");
  assert.equal(first.signals[0].kind, "decline");
  assert.match(first.signals[0].text, /0,74 → 0,70 → 0,64/);
  assert.ok(result.proposal.route.length > 2);
  assert.ok(result.proposal.photoCount > 0);
});

test("the proposed date follows urgency", () => {
  const input = {
    site: makeSite(),
    flights: history,
    findings: [] as Finding[],
    today,
    zoneMeasure: {},
  };
  // A falling vigor alone is a medium reason: five days.
  const normal = suggestNextFlight(input).proposal;
  assert.equal(normal?.urgent, false);
  assert.equal(normal?.date, addDays(today, 5));
  // Add a confirmed high-priority observation and it becomes urgent: two days.
  const urgent = suggestNextFlight({
    ...input,
    findings: [finding("a", "f3", { priority: "high" })],
  }).proposal;
  assert.equal(urgent?.urgent, true);
  assert.equal(urgent?.date, addDays(today, 2));
  // Only the staleness signal: 15 days without flying is below the 21 of agriculture.
  const calm = suggestNextFlight({
    ...input,
    flights: [flight("f1", "2026-10-10", { z1: 0.7, z2: 0.7, z3: 0.7 })],
  });
  assert.equal(calm.proposal, null);
  assert.match(calm.none ?? "", /Ninguna zona/);
});

test("a zone that was never flown is proposed", () => {
  const result = suggestNextFlight({
    site: makeSite(),
    flights: [flight("f1", "2026-10-20", { z1: 0.7, z2: 0.7 })],
    findings: [],
    today,
    zoneMeasure: {},
  });
  assert.deepEqual(result.proposal?.zoneIds, ["z3"]);
  assert.equal(result.assessments[0].signals[0].kind, "never");
});

test("zones already in the agenda are shown but not proposed again", () => {
  const upcoming = flight(
    "next",
    "2026-10-29",
    {},
    { status: "scheduled", zoneIds: ["z1"], capture: undefined },
  );
  const result = suggestNextFlight({
    site: makeSite(),
    flights: [...history, upcoming],
    findings: [],
    today,
    zoneMeasure: {},
  });
  assert.equal(result.proposal, null);
  assert.match(result.none ?? "", /ya están en un vuelo de la agenda/);
  const z1 = result.assessments.find((item) => item.zoneId === "z1");
  assert.equal(z1?.scheduled?.flightId, "next");
});

test("confirmed findings and their repetition add reasons", () => {
  const result = suggestNextFlight({
    site: makeSite(),
    flights: [
      flight("f1", "2026-10-05", { z1: 0.7, z2: 0.7, z3: 0.7 }),
      flight("f2", "2026-10-20", { z1: 0.7, z2: 0.7, z3: 0.7 }),
    ],
    findings: [finding("a", "f1"), finding("b", "f2", { priority: "high" })],
    today,
    zoneMeasure: {},
  });
  const z1 = result.assessments[0];
  assert.equal(z1.zoneId, "z1");
  const kinds = z1.signals.map((signal) => signal.kind);
  assert.ok(kinds.includes("open"));
  assert.ok(kinds.includes("persistent"));
  assert.match(z1.signals[0].text, /1 de prioridad alta/);
  assert.equal(z1.level, "medium");
});

test("dismissed findings do not count", () => {
  const result = suggestNextFlight({
    site: makeSite(),
    flights: [
      flight("f1", "2026-10-05", { z1: 0.7, z2: 0.7, z3: 0.7 }),
      flight("f2", "2026-10-20", { z1: 0.7, z2: 0.7, z3: 0.7 }),
    ],
    findings: [
      finding("a", "f1", { status: "dismissed" }),
      finding("b", "f2", { status: "dismissed" }),
    ],
    today,
    zoneMeasure: {},
  });
  assert.equal(result.proposal, null);
});

test("lists opportunities: pending review, shortfall and steady zones", () => {
  const result = suggestNextFlight({
    site: makeSite(),
    flights: [
      flight("f1", "2026-09-10", { z1: 0.7, z2: 0.7, z3: 0.7 }),
      flight("f2", "2026-09-30", { z1: 0.7, z2: 0.7, z3: 0.7 }),
      flight(
        "f3",
        "2026-10-20",
        { z1: 0.7, z2: 0.7, z3: 0.7 },
        {
          log: {
            weather: "clear",
            windKmh: 5,
            maxAltitudeM: 100,
            batteries: [],
            authorizationRef: "",
            incidents: "",
            coveredHa: 20,
          },
        },
      ),
    ],
    findings: [finding("p", "f3", { status: "pending" })],
    today,
    zoneMeasure: { z1: 10, z2: 10, z3: 10 },
  });
  const kinds = result.opportunities.map((item) => item.kind);
  assert.deepEqual(kinds, ["review-first", "coverage", "spacing"]);
  assert.match(result.opportunities[1].text, /20 de 30 ha/);
  assert.ok(!result.basis.limited);
});

test("few earlier flights are flagged as weak evidence", () => {
  const result = suggestNextFlight({
    site: makeSite(),
    flights: [flight("f1", "2026-10-20", { z1: 0.7, z2: 0.7, z3: 0.7 })],
    findings: [],
    today,
    zoneMeasure: {},
  });
  assert.equal(result.basis.limited, true);
});

test("construction without control points is flagged as unreliable", () => {
  const log = (controlPoints: boolean) => ({
    weather: "clear" as const,
    windKmh: 5,
    maxAltitudeM: 100,
    batteries: [],
    authorizationRef: "",
    incidents: "",
    controlPoints,
  });
  const result = suggestNextFlight({
    site: makeSite("construction"),
    flights: [
      flight(
        "f1",
        "2026-10-05",
        { z1: 20, z2: 20, z3: 20 },
        { log: log(true) },
      ),
      flight(
        "f2",
        "2026-10-20",
        { z1: 25, z2: 30, z3: 40 },
        { log: log(false) },
      ),
    ],
    findings: [],
    today,
    zoneMeasure: {},
  });
  assert.ok(result.opportunities.some((item) => item.kind === "reliability"));
});

test("stalled works are proposed in construction", () => {
  const result = suggestNextFlight({
    site: makeSite("construction"),
    flights: [
      flight("f1", "2026-10-01", { z1: 20, z2: 20, z3: 20 }),
      flight("f2", "2026-10-10", { z1: 24, z2: 30, z3: 40 }),
      flight("f3", "2026-10-20", { z1: 26, z2: 45, z3: 60 }),
    ],
    findings: [],
    today,
    zoneMeasure: {},
  });
  assert.deepEqual(result.proposal?.zoneIds, ["z1"]);
  assert.equal(result.assessments[0].signals[0].kind, "stalled");
});

test("no more than four zones are proposed", () => {
  const site = makeSite();
  site.zones.push(
    {
      id: "z4",
      name: "Lote 4",
      description: "",
      outline: square(3.4, -76.488),
    },
    {
      id: "z5",
      name: "Lote 5",
      description: "",
      outline: square(3.4, -76.484),
    },
  );
  const result = suggestNextFlight({
    site,
    flights: [],
    findings: [],
    today,
    zoneMeasure: {},
  });
  assert.equal(result.proposal?.zoneIds.length, 4);
});

test("adds days across months", () => {
  assert.equal(addDays("2026-10-30", 5), "2026-11-04");
});
