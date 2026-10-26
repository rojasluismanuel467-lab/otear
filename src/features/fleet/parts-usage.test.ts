import assert from "node:assert/strict";
import test from "node:test";
import {
  driverOf,
  heatColor,
  relativeUse,
  usageFor,
  type UsageInput,
} from "./parts-usage.ts";

const plan = [
  {
    id: "periodic",
    title: "Inspección periódica",
    everyHours: 200,
    source: "",
  },
  { id: "propellers", title: "Cambio de hélices", everyHours: 100, source: "" },
];
const input: UsageInput = {
  hours: 300,
  flights: [
    { date: "2026-01-10" },
    { date: "2026-03-10" },
    { date: "2026-06-10" },
  ],
  records: [
    { date: "2026-02-01", hoursAt: 150, taskId: "periodic" },
    { date: "2026-05-01", hoursAt: 270, taskId: "propellers" },
  ],
  plan,
  batteries: [
    { cycles: 100, maxCycles: 200 },
    { cycles: 60, maxCycles: 200 },
  ],
};
const parts = [
  { id: "motors", group: "propulsion" as const },
  { id: "propellers", group: "propulsion" as const },
  { id: "landing-gears", group: "structure" as const },
  { id: "battery", group: "power" as const },
];

test("each part is counted with what wears it", () => {
  assert.equal(driverOf(parts[0]), "hours");
  assert.equal(driverOf(parts[2]), "flights");
  assert.equal(driverOf(parts[3]), "cycles");
});

test("usage restarts at the last service of the part", () => {
  const usage = usageFor(parts, input);
  assert.equal(usage.motors.value, 150);
  assert.equal(usage.motors.fraction, 0.75);
  assert.equal(usage.propellers.value, 30);
  assert.equal(usage.propellers.fraction, 0.3);
  // two flights after the periodic inspection; interval 200 h x 1.5 flights per hour
  assert.equal(usage["landing-gears"].value, 2);
  assert.ok(Math.abs(usage["landing-gears"].fraction - 2 / 300) < 1e-9);
  assert.equal(usage.battery.fraction, 0.4);
});

test("a record for one part resets only that part", () => {
  const usage = usageFor(parts, {
    ...input,
    records: [
      ...input.records,
      { date: "2026-06-01", hoursAt: 290, partId: "motors" },
    ],
  });
  assert.equal(usage.motors.value, 10);
  assert.equal(usage.propellers.value, 30);
});

test("without an interval there is nothing to compare", () => {
  const usage = usageFor(parts, { ...input, plan: [] });
  assert.equal(usage.motors.fraction, 0);
  assert.ok(usage.motors.text.includes("sin intervalo"));
});

test("heat color runs from blue to orange and clamps", () => {
  assert.equal(heatColor(0), "#3b82f6");
  assert.equal(heatColor(1), "#ef6c1a");
  assert.equal(heatColor(5), "#ef6c1a");
  assert.equal(heatColor(-1), "#3b82f6");
  assert.notEqual(heatColor(0.5), heatColor(0.8));
});

test("relative use spreads the parts between the least and the most used", () => {
  const relative = relativeUse(usageFor(parts, input));
  const values = Object.values(relative);
  assert.equal(Math.min(...values), 0);
  assert.equal(Math.max(...values), 1);
  assert.equal(relative.motors > relative.propellers, true);
});
