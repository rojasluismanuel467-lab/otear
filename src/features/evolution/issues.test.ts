import assert from "node:assert/strict";
import test from "node:test";
import { issuesFor } from "./issues.ts";
import type { CapturePoint } from "./evolution.ts";
import type { Finding, Site } from "../demo/types";

const point = (
  date: string,
  values: Record<string, number>,
  extra: Partial<CapturePoint> = {},
): CapturePoint => ({
  flightId: `f-${date}`,
  date,
  values,
  mean:
    Object.values(values).reduce((s, v) => s + v, 0) /
    Object.values(values).length,
  ...extra,
});
const names = { a: "Lote A", b: "Lote B" };
const outline = (lat: number): [number, number][] => [
  [lat, 0],
  [lat + 1, 0],
  [lat + 1, 1],
];

test("agriculture flags a sustained decline with its place and numbers", () => {
  const site = {
    sector: "agriculture",
    zones: [
      { id: "a", outline: outline(0) },
      { id: "b", outline: outline(5) },
    ],
  } as unknown as Site;
  const captures = [
    point("2026-01-01", { a: 0.8, b: 0.6 }),
    point("2026-02-01", { a: 0.75, b: 0.65 }),
    point("2026-03-01", { a: 0.6, b: 0.7 }),
  ];
  const issues = issuesFor({
    site,
    captures,
    index: 2,
    referenceIndex: 0,
    findings: [],
    zoneNames: names,
  });
  const decline = issues.find((item) => item.kind === "decline");
  assert.equal(decline?.zoneId, "a");
  assert.equal(decline?.tone, "danger");
  assert.ok(decline?.position);
  // The comparison says which date and what the vigor was then, not just a bare sign.
  assert.ok(decline?.facts.some((fact) => fact.label.startsWith("Frente al")));
  // And says since when it falls, with the date of the highest capture before the fall.
  assert.ok(decline?.summary.includes("Viene bajando desde el 1 de ene"));
  assert.ok(decline?.facts.some((fact) => fact.label === "Los demás hoy"));
});

test("construction reports the delay against the plan and stalled fronts", () => {
  const site = {
    sector: "construction",
    zones: [
      { id: "a", outline: outline(0) },
      { id: "b", outline: outline(5) },
    ],
    schedule: { start: "2026-01-01", end: "2026-07-01", targetLevels: 8 },
  } as unknown as Site;
  const captures = [
    point("2026-02-01", { a: 10, b: 10 }, { levels: 1 }),
    point("2026-03-01", { a: 30, b: 12 }, { levels: 2 }),
    point("2026-04-01", { a: 50, b: 13 }, { levels: 3 }),
    point("2026-05-01", { a: 70, b: 14 }, { levels: 4 }),
  ];
  const issues = issuesFor({
    site,
    captures,
    index: 3,
    referenceIndex: 0,
    findings: [],
    zoneNames: names,
  });
  assert.equal(issues[0].kind, "delay");
  assert.ok(
    issues.some((item) => item.kind === "stalled" && item.zoneId === "b"),
  );
});

test("findings of the flight become issues placed on the map and dismissed ones do not", () => {
  const site = {
    sector: "security",
    zones: [{ id: "a", outline: outline(0) }],
  } as unknown as Site;
  const captures = [
    point("2026-01-01", { a: 0 }),
    point("2026-02-01", { a: 1 }),
  ];
  const finding = (id: string, status: Finding["status"]) =>
    ({
      id,
      flightId: "f-2026-02-01",
      zoneId: "a",
      title: `H${id}`,
      description: "d",
      priority: "high",
      status,
      position: [1, 2],
      taskAssigned: false,
    }) as Finding;
  const issues = issuesFor({
    site,
    captures,
    index: 1,
    referenceIndex: 0,
    findings: [finding("1", "pending"), finding("2", "dismissed")],
    zoneNames: names,
  });
  assert.equal(issues.length, 1);
  assert.deepEqual(issues[0].position, [1, 2]);
  assert.equal(issues[0].tone, "danger");
});

test("mining measures progress in percent per bench and speaks of benches", () => {
  const site = {
    sector: "mining",
    zones: [
      { id: "a", outline: outline(0) },
      { id: "b", outline: outline(5) },
    ],
    schedule: { start: "2026-01-01", end: "2026-07-01" },
  } as unknown as Site;
  const captures = [
    point("2026-02-01", { a: 10, b: 5 }),
    point("2026-03-01", { a: 20, b: 6 }),
    point("2026-04-01", { a: 30, b: 6 }),
  ];
  const issues = issuesFor({
    site,
    captures,
    index: 2,
    referenceIndex: 0,
    findings: [],
    zoneNames: names,
  });
  const delay = issues.find((item) => item.kind === "delay");
  assert.equal(delay?.tone, "danger");
  assert.match(delay?.summary ?? "", /puntos por debajo/);
  assert.match(delay?.advice ?? "", /bancos/);
  const stalled = issues.find((item) => item.kind === "stalled");
  assert.equal(stalled?.zoneId, "b");
  assert.match(stalled?.advice ?? "", /banco/);
  assert.ok(stalled?.position);
});
