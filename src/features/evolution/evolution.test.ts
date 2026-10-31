import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCaptures,
  comparisonReliability,
  fallingSince,
  findingChange,
  indicatorFor,
  paceOf,
  phaseOf,
  plannedAt,
  progressColor,
  stalledZones,
  sustainedDeclines,
  vigorColor,
  weightedMean,
  zoneVerdict,
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

test("buildCaptures leaves out a security flight with no log and no findings", () => {
  const site = {
    sector: "security",
    zones: [{ id: "z1" }],
  } as unknown as Site;
  const flights = [
    { id: "round", date: "2026-10-24", status: "completed" },
    { id: "mapping", date: "2026-10-24", status: "completed" },
    {
      id: "quiet",
      date: "2026-10-01",
      status: "completed",
      log: { weather: "clear" },
    },
  ] as Flight[];
  const findings = [{ flightId: "round", zoneId: "z1" }] as never;
  assert.deepEqual(
    buildCaptures(site, flights, findings).map((item) => item.flightId),
    ["quiet", "round"],
  );
});

test("mining reports its progress as a percentage of the plan", () => {
  const indicator = indicatorFor("mining");
  assert.equal(indicator.kind, "progress");
  assert.equal(indicator.noun, "avance");
  assert.equal(progressColor(0), progressColor(-20));
  assert.equal(progressColor(100), progressColor(250));
  assert.notEqual(progressColor(10), progressColor(90));
});

test("a road's average advance weighs each stretch by its length", () => {
  const values = { south: 100, north: 30 };
  assert.equal(weightedMean(values), 65);
  const weighted = weightedMean(values, { south: 1, north: 1.3 });
  assert.ok(Math.abs(weighted - (100 + 39) / 2.3) < 1e-9);
  // Without a usable weight for every zone it falls back to the simple average.
  assert.equal(weightedMean(values, { south: 1 }), 65);
  const site = {
    sector: "roads",
    zones: [{ id: "south" }, { id: "north" }],
  } as unknown as Site;
  const flights = [
    { id: "a", date: "2026-01-01", status: "completed", capture: { values } },
  ] as unknown as Flight[];
  const [capture] = buildCaptures(site, flights, [], { south: 1, north: 1.3 });
  assert.ok(Math.abs(capture.mean - 139 / 2.3) < 1e-9);
});

test("a zone is better or worse by its indicator, with a margin of noise", () => {
  assert.equal(zoneVerdict("vigor", 0.12), "better");
  assert.equal(zoneVerdict("vigor", -0.13), "worse");
  assert.equal(zoneVerdict("vigor", 0.02), "same");
  assert.equal(zoneVerdict("progress", -5), "worse");
  assert.equal(zoneVerdict("count", 2), "worse");
  assert.equal(zoneVerdict("count", -2), "better");
});

test("fallingSince finds where the decline began", () => {
  const points = [
    point("2026-01-01", { a: 0.5 }),
    point("2026-02-01", { a: 0.75 }),
    point("2026-03-01", { a: 0.72 }),
    point("2026-04-01", { a: 0.62 }),
  ];
  assert.equal(fallingSince(points, "a", 3)?.date, "2026-02-01");
  assert.equal(fallingSince(points, "a", 1), undefined);
});

test("finding change tells what appeared, what went away and what stays", () => {
  const finding = (flightId: string, title: string, status = "confirmed") =>
    ({ flightId, zoneId: "z", title, status }) as never;
  const findings = [
    finding("old", "Grieta"),
    finding("old", "Hundimiento"),
    finding("new", "Grieta"),
    finding("new", "Cuneta tapada"),
    finding("new", "Descartado", "dismissed"),
  ];
  assert.deepEqual(
    findingChange(findings, { flightId: "new" }, { flightId: "old" }),
    {
      appeared: 1,
      gone: 1,
      persistent: 1,
    },
  );
});
