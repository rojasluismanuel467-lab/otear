import assert from "node:assert/strict";
import test from "node:test";
import {
  caution,
  filterFindings,
  historyNote,
  isSuggested,
  photoRange,
  photoRangeText,
  reviewQueue,
  sourceLabel,
  suggestionStats,
  type Suggested,
} from "./image-candidates.ts";
import { findingWords } from "../flights/finding-words.ts";
import { buildCaptures } from "../evolution/evolution.ts";
import { operatorSummaries } from "../reports/operators.ts";
import type { Finding, FindingSuggestion, Flight, Site } from "../demo/types";

function suggestion(extra: Partial<FindingSuggestion> = {}): FindingSuggestion {
  return {
    agent: "image",
    confidence: "medium",
    evidence: ["Una línea continua"],
    limits: "No mide profundidad.",
    photoSpan: [0.3, 0.32],
    ...extra,
  };
}

function finding(id: string, extra: Partial<Finding> = {}): Finding {
  return {
    id,
    siteId: "s",
    flightId: "f2",
    zoneId: "z1",
    title: "Falla en el surco",
    description: "",
    priority: "medium",
    status: "pending",
    position: [0, 0],
    imageUrl: "",
    source: "Observación del operador · ejemplo",
    taskAssigned: false,
    ...extra,
  };
}

function flight(id: string, date: string): Flight {
  return {
    id,
    siteId: "s",
    title: id,
    objective: "",
    date,
    time: "08:00",
    status: "completed",
    pilot: "",
    operator: "Operador A",
    manager: "",
    drone: "",
    zoneIds: ["z1"],
    route: [],
    duration: 30,
    distance: 5,
    photoCount: 100,
    checklist: [],
  };
}

const suggested = (id: string, extra: Partial<Finding> = {}) =>
  finding(id, { suggestion: suggestion(), ...extra });

test("source follows the suggestion through its review", () => {
  assert.match(sourceLabel(suggested("a")), /sin revisar/);
  assert.match(
    sourceLabel(suggested("a", { status: "confirmed" })),
    /confirmada por una persona/,
  );
  assert.match(
    sourceLabel(suggested("a", { status: "dismissed" })),
    /descartada por una persona/,
  );
  assert.equal(sourceLabel(finding("b")), "Observación del operador · ejemplo");
});

test("the seeded operator line takes the company's word whichever sector's default it starts with", () => {
  const words = findingWords("Hallazgo de campo", "Hallazgos de campo");
  const roads = finding("r", {
    source: "No conformidad del operador · ejemplo · imagen ilustrativa",
  });
  assert.equal(
    sourceLabel(roads),
    "No conformidad del operador · ejemplo · imagen ilustrativa",
  );
  assert.equal(
    sourceLabel(roads, words),
    "Hallazgo de campo del operador · ejemplo · imagen ilustrativa",
  );
});

test("stats count only what a person reviewed", () => {
  const stats = suggestionStats([
    suggested("a", { status: "confirmed" }),
    suggested("b", { status: "confirmed" }),
    suggested("c", { status: "dismissed" }),
    suggested("d"),
    finding("e", { status: "confirmed" }),
  ]);
  assert.equal(stats.suggested, 4);
  assert.equal(stats.reviewed, 3);
  assert.equal(stats.pending, 1);
  assert.ok(Math.abs((stats.confirmedPct ?? 0) - 66.67) < 0.1);
  assert.equal(stats.small, true);
  assert.equal(suggestionStats([finding("x")]).confirmedPct, null);
});

test("filters by who proposed the finding", () => {
  const all = [suggested("a"), finding("b")];
  assert.deepEqual(
    filterFindings(all, "suggested").map((item) => item.id),
    ["a"],
  );
  assert.deepEqual(
    filterFindings(all, "operator").map((item) => item.id),
    ["b"],
  );
  assert.equal(filterFindings(all, "all").length, 2);
});

test("the review queue puts important and surer candidates first", () => {
  const queue = reviewQueue([
    suggested("low", { priority: "low" }),
    suggested("high-unsure", {
      priority: "high",
      suggestion: suggestion({ confidence: "low" }),
    }),
    suggested("high-sure", {
      priority: "high",
      suggestion: suggestion({ confidence: "high" }),
    }),
    suggested("done", { status: "confirmed" }),
    finding("operator"),
  ]);
  assert.deepEqual(
    queue.map((item) => item.id),
    ["high-sure", "high-unsure", "low"],
  );
});

test("photo numbers follow the flight's photo count and stay in range", () => {
  assert.deepEqual(
    photoRange(suggestion({ photoSpan: [0.3, 0.32] }), 130),
    [39, 42],
  );
  assert.deepEqual(photoRange(suggestion({ photoSpan: [0, 1] }), 10), [1, 10]);
  assert.equal(photoRange(suggestion(), 0), null);
  assert.equal(
    photoRangeText(suggestion({ photoSpan: [0.5, 0.5] }), 100),
    "Foto 50 de 100",
  );
  assert.equal(
    photoRangeText(suggestion({ photoSpan: [0.3, 0.32] }), 130),
    "Fotos 39 a 42 de 130",
  );
});

test("weak candidates carry a caution", () => {
  const weak = suggested("a", {
    suggestion: suggestion({ confidence: "low" }),
  }) as Suggested;
  assert.match(caution(weak) ?? "", /pista/);
  const risky = suggested("b", {
    priority: "high",
    suggestion: suggestion({ confidence: "low" }),
  }) as Suggested;
  assert.match(caution(risky) ?? "", /Prioridad alta con confianza baja/);
  assert.equal(caution(suggested("c") as Suggested), null);
});

test("notes when the same kind of finding was reported before in the zone", () => {
  const flights = [flight("f1", "2026-09-01"), flight("f2", "2026-10-01")];
  const earlier = finding("old", {
    flightId: "f1",
    status: "confirmed",
  });
  const now = suggested("now");
  assert.ok(isSuggested(now));
  assert.match(
    historyNote(now as Suggested, [earlier, now], flights) ?? "",
    /1 vuelo anterior/,
  );
  assert.equal(historyNote(now as Suggested, [now], flights), null);
});

test("unreviewed suggestions do not count in a security series", () => {
  const site = {
    id: "s",
    name: "S",
    sector: "security",
    sectorLabel: "",
    location: "",
    zoneLabel: "Sectores",
    center: [0, 0],
    imageUrl: "",
    zones: [{ id: "z1", name: "Z1", description: "", outline: [] }],
  } as Site;
  const flights = [flight("f2", "2026-10-01")];
  const findings = [
    finding("op"),
    suggested("pending"),
    suggested("kept", { status: "confirmed" }),
  ];
  const [point] = buildCaptures(site, flights, findings);
  // The operator's finding and the confirmed suggestion count; the pending suggestion does not.
  assert.equal(point.values.z1, 2);
});

test("suggestions are not credited to the operator", () => {
  const rows = operatorSummaries({
    flights: [flight("f2", "2026-10-01")],
    findings: [finding("op"), suggested("ai", { status: "confirmed" })],
    invoices: [],
  });
  assert.equal(rows[0].findings, 1);
  assert.equal(rows[0].confirmed, 0);
});
