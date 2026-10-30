import assert from "node:assert/strict";
import test from "node:test";
import {
  chainageOf,
  chainageRanges,
  formatChainage,
  rangeText,
} from "./chainage.ts";
import type { Position } from "../../demo/types";

// About 1,1 km per 0,01 degree of latitude.
const south: Position[] = [
  [0, 0],
  [0.005, 0],
  [0.009, 0],
];
const north: Position[] = [
  [0.009, 0],
  [0.015, 0],
];
const zones = [
  { id: "s", outline: south },
  { id: "n", outline: north },
];

test("chainage is written as km+meters and carries the rounding", () => {
  assert.equal(formatChainage(0), "0+000");
  assert.equal(formatChainage(12.4), "12+400");
  assert.equal(formatChainage(0.9996), "1+000");
});

test("stretches are counted one after another from 0+000", () => {
  const ranges = chainageRanges(zones);
  assert.equal(ranges[0].fromKm, 0);
  assert.ok(Math.abs(ranges[1].fromKm - ranges[0].toKm) < 1e-9);
  assert.ok(Math.abs(ranges[0].lengthKm - 1.0) < 0.02);
  assert.match(rangeText(ranges[0]), /^PK 0\+000 – 1\+00[0-9]$/);
});

test("a point projects onto the axis and says which stretch it falls on", () => {
  const found = chainageOf([0.012, 0.0001], zones);
  assert.equal(found?.zoneId, "n");
  assert.ok(found && found.km > 1.2 && found.km < 1.5);
  assert.ok(found && found.offsetM < 20);
  assert.equal(chainageOf([0, 0], []), undefined);
});
