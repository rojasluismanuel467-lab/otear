import assert from "node:assert/strict";
import test from "node:test";
import { comparisonSummary, narrate } from "./narrative.ts";
import type { CapturePoint } from "./evolution.ts";
import type { Site } from "../demo/types";

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
const names = { a: "Lote A", b: "Lote B" };

test("agriculture narration flags a sustained decline", () => {
  const site = {
    sector: "agriculture",
    zones: [{ id: "a" }, { id: "b" }],
  } as unknown as Site;
  const captures = [
    point("2026-01-01", { a: 0.8, b: 0.6 }),
    point("2026-02-01", { a: 0.75, b: 0.65 }),
    point("2026-03-01", { a: 0.6, b: 0.7 }),
  ];
  const lines = narrate({
    site,
    captures,
    index: 2,
    referenceIndex: 1,
    zoneNames: names,
  });
  assert.ok(
    lines.some(
      (line) => line.tone === "danger" && line.text.includes("Lote A"),
    ),
  );
  assert.ok(lines.some((line) => line.text.includes("Confiabilidad")));
});

test("construction narration compares against the plan and projects the end", () => {
  const site = {
    sector: "construction",
    zones: [{ id: "a" }],
    schedule: { start: "2026-01-01", end: "2026-07-01", targetLevels: 8 },
  } as unknown as Site;
  const captures = [
    point("2026-02-01", { a: 10 }, { levels: 1 }),
    point("2026-03-01", { a: 20 }, { levels: 2 }),
    point("2026-04-01", { a: 30 }, { levels: 3 }),
  ];
  const lines = narrate({
    site,
    captures,
    index: 2,
    referenceIndex: 1,
    zoneNames: names,
  });
  const text = lines.map((line) => line.text).join(" ");
  assert.ok(text.includes("3 de 8 niveles"));
  assert.ok(text.includes("atrasado"));
  assert.ok(text.includes("terminaría el"));
});

test("road narration names stalled stretches with their phase", () => {
  const site = {
    sector: "roads",
    zones: [{ id: "a" }, { id: "b" }],
  } as unknown as Site;
  const captures = [
    point("2026-01-01", { a: 10, b: 20 }),
    point("2026-02-01", { a: 40, b: 26 }),
    point("2026-03-01", { a: 80, b: 27 }),
  ];
  const lines = narrate({
    site,
    captures,
    index: 2,
    referenceIndex: 1,
    zoneNames: names,
  });
  assert.ok(
    lines.some(
      (line) =>
        line.text.includes("Lote B casi no avanza") &&
        line.text.includes("subbase"),
    ),
  );
});

test("comparison says better, worse or the same, and keeps a fall from hiding behind a plus sign", () => {
  const site = {
    sector: "agriculture",
    zones: [{ id: "a" }, { id: "b" }, { id: "c" }],
  } as unknown as Site;
  const captures = [
    point("2026-01-01", { a: 0.5, b: 0.7, c: 0.7 }),
    point("2026-02-01", { a: 0.75, b: 0.7, c: 0.6 }),
    point("2026-03-01", { a: 0.72, b: 0.71, c: 0.5 }),
    point("2026-04-01", { a: 0.62, b: 0.7, c: 0.4 }),
  ];
  const lines = comparisonSummary({
    site,
    captures,
    index: 3,
    referenceIndex: 0,
    zoneNames: { a: "Lote A", b: "Lote B", c: "Lote C" },
    findings: [],
  });
  const first = lines[0].text;
  assert.ok(first.includes("empeoró: Lote C (−0,30)"));
  assert.ok(first.includes("Lote A (+0,12, pero viene bajando)"));
  assert.ok(first.includes("sin cambio notable en Lote B"));
  assert.equal(lines[0].tone, "warning");
  assert.ok(lines.some((line) => line.text.includes("Qué tan fiable")));
  // Comparing a capture with itself says nothing.
  assert.deepEqual(
    comparisonSummary({
      site,
      captures,
      index: 3,
      referenceIndex: 3,
      zoneNames: {},
      findings: [],
    }),
    [],
  );
});
