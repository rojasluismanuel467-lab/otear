import assert from "node:assert/strict";
import test from "node:test";
import {
  aircraftAlerts,
  aircraftHistory,
  aircraftHours,
  batteryCycles,
  batteryState,
  costSummary,
  defaultPlan,
  isAirworthy,
  pilotSummaries,
  taskStatuses,
} from "./fleet.ts";
import type {
  Aircraft,
  Battery,
  Flight,
  MaintenanceRecord,
} from "../demo/types";

const aircraft: Aircraft = {
  id: "a1",
  siteId: "s",
  name: "Mavic A",
  make: "DJI",
  model: "Mavic 3 Enterprise",
  serial: "123",
  registration: "UAS-1",
  acquiredOn: "2024-01-01",
  purchaseCost: 24_000_000,
  ownership: "own",
  status: "active",
  firmware: "v1",
  initialHours: 100,
  insurer: "X",
  policyNumber: "P-1",
  policyUntil: "2027-01-01",
  warrantyUntil: "2025-01-01",
  plan: defaultPlan,
};

function flight(
  id: string,
  date: string,
  minutes: number,
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
    pilot: "Ana",
    operator: "",
    manager: "",
    drone: "",
    zoneIds: [],
    route: [],
    duration: minutes,
    distance: 5,
    photoCount: 0,
    checklist: [],
    aircraftId: "a1",
    ...extra,
  } as Flight;
}

function record(extra: Partial<MaintenanceRecord>): MaintenanceRecord {
  return {
    id: "r",
    aircraftId: "a1",
    date: "2026-04-10",
    kind: "inspection",
    taskId: "periodic",
    title: "T",
    description: "",
    hoursAt: 150,
    performedBy: "",
    cost: 100000,
    ...extra,
  };
}

test("hours add logged flights to the starting hours", () => {
  const flights = [
    flight("f1", "2026-01-01", 90),
    flight("f2", "2026-02-01", 30),
    flight("f3", "2026-02-02", 60, { aircraftId: "other" }),
  ];
  assert.equal(aircraftHours(aircraft, flights), 102);
});

test("battery cycles count completed flights that used the pack", () => {
  const battery: Battery = {
    id: "b",
    aircraftId: "a1",
    label: "BAT-1",
    serial: "",
    initialCycles: 10,
    maxCycles: 200,
  };
  const flights = [
    flight("f1", "2026-01-01", 30, {
      log: {
        weather: "clear",
        windKmh: 0,
        maxAltitudeM: 100,
        batteries: ["BAT-1"],
        authorizationRef: "",
        incidents: "",
      },
    }),
    flight("f2", "2026-01-02", 30),
  ];
  assert.equal(batteryCycles(battery, flights), 11);
});

test("a task is overdue by months even if the hours are fine", () => {
  const statuses = taskStatuses(aircraft, [record({})], 160, "2026-10-25");
  const periodic = statuses.find((item) => item.task.id === "periodic");
  assert.equal(periodic?.state, "overdue");
  assert.ok(periodic?.detail.includes("meses"));
  assert.equal(
    statuses.find((item) => item.task.id === "propellers")?.state,
    "unknown",
  );
});

test("a task close to its interval is flagged as soon", () => {
  const statuses = taskStatuses(
    aircraft,
    [record({ taskId: "propellers", date: "2026-10-01", hoursAt: 100 })],
    190,
    "2026-10-25",
  );
  assert.equal(
    statuses.find((item) => item.task.id === "propellers")?.state,
    "soon",
  );
});

test("battery state follows cycles and capacity", () => {
  const battery: Battery = {
    id: "b",
    aircraftId: "a1",
    label: "B",
    serial: "",
    initialCycles: 0,
    maxCycles: 200,
  };
  assert.equal(batteryState(battery, 50).state, "ok");
  assert.equal(batteryState(battery, 170).state, "watch");
  assert.equal(batteryState(battery, 200).state, "retire");
  assert.equal(
    batteryState({ ...battery, capacityPct: 78 }, 10).state,
    "retire",
  );
  assert.equal(
    batteryState({ ...battery, capacityPct: 83 }, 10).state,
    "watch",
  );
});

test("alerts cover an expired policy and make the aircraft not airworthy", () => {
  const alerts = aircraftAlerts({
    aircraft: { ...aircraft, policyUntil: "2026-10-20" },
    flights: [],
    records: [
      record({ date: "2026-10-01", hoursAt: 99 }),
      record({ taskId: "propellers", date: "2026-10-01", hoursAt: 99 }),
      record({ taskId: "firmware", date: "2026-10-01", hoursAt: 99 }),
    ],
    batteries: [],
    today: "2026-10-25",
  });
  assert.ok(alerts.some((a) => a.id === "policy" && a.tone === "danger"));
  assert.equal(isAirworthy(alerts), false);
  const ok = aircraftAlerts({
    aircraft,
    flights: [],
    records: [
      record({ date: "2026-10-01", hoursAt: 99 }),
      record({ taskId: "propellers", date: "2026-10-01", hoursAt: 99 }),
      record({ taskId: "firmware", date: "2026-10-01", hoursAt: 99 }),
    ],
    batteries: [],
    today: "2026-10-25",
  });
  assert.equal(isAirworthy(ok), true);
});

test("cost per hour divides spending by hours flown", () => {
  const summary = costSummary(
    aircraft,
    [record({ cost: 200000 }), record({ id: "r2", cost: 300000 })],
    100,
  );
  assert.equal(summary.maintenance, 500000);
  assert.equal(summary.maintenancePerHour, 5000);
  assert.equal(summary.ownershipPerHour, (500000 + 24_000_000) / 100);
  assert.equal(costSummary(aircraft, [], 0).maintenancePerHour, null);
});

test("history merges flights, incidents and maintenance, newest first", () => {
  const flights = [
    flight("f1", "2026-09-01", 30, {
      log: {
        weather: "rain",
        windKmh: 10,
        maxAltitudeM: 90,
        batteries: [],
        authorizationRef: "",
        incidents: "Pérdida de enlace",
      },
    }),
  ];
  const events = aircraftHistory({
    aircraft,
    flights,
    records: [record({ date: "2026-10-01" })],
    evidences: [],
  });
  assert.deepEqual(
    events.map((event) => event.kind),
    ["maintenance", "flight", "incident"],
  );
});

test("pilot summaries total hours per pilot", () => {
  const list = pilotSummaries([
    flight("a", "2026-01-01", 60),
    flight("b", "2026-02-01", 30),
    flight("c", "2026-03-01", 120, { pilot: "Beto" }),
  ]);
  assert.equal(list[0].name, "Beto");
  assert.equal(list[1].hours, 1.5);
});
