import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCaptures,
  comparisonReliability,
  indicatorFor,
  paceOf,
  phaseOf,
  plannedAt,
  progressColor,
  stalledZones,
  sustainedDeclines,
  vigorColor,
  type CapturePoint,
} from "./evolution.ts";
import type { Flight, Site } from "../demo/types";

const point = (
  date: string,
  values: Record<string, number>,
  extra: Partial<CapturePoint> = {},
): CapturePoint => ({
  flightId: date,
  date,
  values,
  mean:
    Object.values(values).reduce((s, v) => s + v, 0) /
    Object.values(values).length,
  ...extra,
});

test("planned progress is linear between the start and the end", () => {
  const schedule = { start: "2026-01-01", end: "2026-01-11" };
  assert.equal(plannedAt(schedule, "2026-01-01"), 0);
  assert.equal(plannedAt(schedule, "2026-01-06"), 50);
  assert.equal(plannedAt(schedule, "2027-01-01"), 100);
  assert.equal(plannedAt(schedule, "2026-01-06", 8), 4);
});

test("pace projects when the target would be reached", () => {
  const pace = paceOf(
    [
      { date: "2026-01-01", value: 0 },
      { date: "2026-01-11", value: 10 },
    ],
    100,
  );
  assert.equal(pace?.perDay, 1);
  assert.equal(pace?.projectedEnd, "2026-04-11");
  assert.equal(
    paceOf(
      [
        { date: "2026-01-01", value: 5 },
        { date: "2026-01-11", value: 5 },
      ],
      100,
    )?.projectedEnd,
    undefined,
  );
  assert.equal(paceOf([{ date: "2026-01-01", value: 5 }], 100), undefined);
});

test("stalled zones gained almost nothing in the last captures", () => {
  const points = [
    point("2026-01-01", { a: 10, b: 10 }),
    point("2026-02-01", { a: 40, b: 25 }),
    point("2026-03-01", { a: 70, b: 26 }),
    point("2026-04-01", { a: 95, b: 27 }),
  ];
  assert.deepEqual(stalledZones(points, ["a", "b"]), ["b"]);
  const finished = [
    point("1", { a: 100 }),
    point("2", { a: 100 }),
    point("3", { a: 100 }),
    point("4", { a: 100 }),
  ];
  assert.deepEqual(stalledZones(finished, ["a"]), []);
});

test("a sustained decline needs a drop on each consecutive capture", () => {
  const points = [
    point("1", { a: 0.8, b: 0.7 }),
    point("2", { a: 0.75, b: 0.72 }),
    point("3", { a: 0.6, b: 0.74 }),
  ];
  assert.deepEqual(sustainedDeclines(points, ["a", "b"]), ["a"]);
  assert.deepEqual(sustainedDeclines(points.slice(1), ["a"]), []);
});

test("comparison reliability depends on control points", () => {
  assert.equal(
    comparisonReliability(
      point("1", {}, { controlPoints: true }),
      point("2", {}, { controlPoints: true }),
    ).level,
    "high",
  );
  assert.equal(
    comparisonReliability(
      point("1", {}, { controlPoints: true }),
      point("2", {}, { controlPoints: false }),
    ).level,
    "medium",
  );
  assert.equal(
    comparisonReliability(point("1", {}), point("2", {})).level,
    "unknown",
  );
});

test("phases and vigor colors follow their scales", () => {
  assert.equal(phaseOf(10).label, "Movimiento de tierras");
  assert.equal(phaseOf(60).label, "Base");
  assert.equal(phaseOf(100).label, "Terminado");
  assert.notEqual(vigorColor(0.3), vigorColor(0.85));
});

test("buildCaptures keeps completed flights in date order and counts findings for security", () => {
  const site = {
    sector: "security",
    zones: [{ id: "z1" }, { id: "z2" }],
  } as unknown as Site;
  const flights = [
    { id: "b", date: "2026-02-01", status: "completed" },
    { id: "a", date: "2026-01-01", status: "completed" },
    { id: "c", date: "2026-03-01", status: "scheduled" },
  ] as Flight[];
  const findings = [
    { flightId: "a", zoneId: "z1" },
    { flightId: "a", zoneId: "z1" },
    { flightId: "b", zoneId: "z2" },
  ] as never;
  const captures = buildCaptures(site, flights, findings);
  assert.deepEqual(
    captures.map((item) => item.flightId),
    ["a", "b"],
  );
  assert.equal(captures[0].values.z1, 2);
});

test("mining reports its progress as a percentage of the plan", () => {
  const indicator = indicatorFor("mining");
  assert.equal(indicator.kind, "progress");
  assert.equal(indicator.noun, "avance");
  assert.equal(progressColor(0), progressColor(-20));
  assert.equal(progressColor(100), progressColor(250));
  assert.notEqual(progressColor(10), progressColor(90));
});
