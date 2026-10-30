import assert from "node:assert/strict";
import test from "node:test";
import { planMission } from "../../features/flights/mission-plan.ts";
import type { Flight, Position, Zone } from "../../features/demo/types";
import { unflownLines } from "./unflown-lines.ts";

const lot = (id: string, outline: Position[]) =>
  ({ id, name: id, outline }) as unknown as Zone;
const zones: Zone[] = [
  lot("lot3", [
    [3.7759, -76.32035],
    [3.77509, -76.31765],
    [3.7712, -76.3187],
    [3.77191, -76.32138],
  ]),
  lot("lot4", [
    [3.77506, -76.31763],
    [3.77464, -76.31624],
    [3.77079, -76.31734],
    [3.7712, -76.3187],
  ]),
];
const site = { sector: "agriculture" as const, zones };

function flightWith(route: Position[], status: Flight["status"] = "completed") {
  return { status, route, zoneIds: ["lot3", "lot4"], log: undefined };
}

const input = { sector: "agriculture" as const, zones };

test("a flight that ended early shows the lines it did not fly", () => {
  const full = planMission(input);
  const early = planMission({ ...input, endEarlyAt: 0.8 });
  assert.ok(early.lineCount < full.lineCount);
  const gap = unflownLines({ site, flight: flightWith(early.route) });
  assert.equal(gap.length, full.lineCount - early.lineCount);
  assert.ok(gap.every((line) => line.length === 2));
});

test("a complete flight has no unflown lines", () => {
  const full = planMission(input);
  assert.deepEqual(unflownLines({ site, flight: flightWith(full.route) }), []);
});

test("a route drawn by hand is not compared with the plan", () => {
  const drawn: Position[] = [
    [3.7755, -76.3198],
    [3.7745, -76.3185],
    [3.7735, -76.3172],
    [3.7755, -76.3198],
  ];
  assert.deepEqual(unflownLines({ site, flight: flightWith(drawn) }), []);
});

test("scheduled flights and sectors without hectares are left alone", () => {
  const early = planMission({ ...input, endEarlyAt: 0.8 });
  assert.deepEqual(
    unflownLines({ site, flight: flightWith(early.route, "scheduled") }),
    [],
  );
  assert.deepEqual(
    unflownLines({
      site: { ...site, sector: "roads" },
      flight: flightWith(early.route),
    }),
    [],
  );
  assert.deepEqual(unflownLines({ site, flight: undefined }), []);
});
