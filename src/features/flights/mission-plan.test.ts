import assert from "node:assert/strict";
import test from "node:test";
import {
  convexHull,
  distanceToLineM,
  lineLengthKm,
  pointInPolygon,
  polygonAreaHa,
} from "../../lib/geo.ts";
import {
  footprint,
  heightFor,
  mappingCamera,
  planMission,
} from "./mission-plan.ts";
import type { Position } from "../demo/types";

// The agriculture lots of the demo, three contiguous quadrilaterals.
const lot3: Position[] = [
  [3.7759, -76.32035],
  [3.77509, -76.31765],
  [3.7712, -76.3187],
  [3.77191, -76.32138],
];
const lot4: Position[] = [
  [3.77506, -76.31763],
  [3.77464, -76.31624],
  [3.77079, -76.31734],
  [3.7712, -76.3187],
];
const lot5: Position[] = [
  [3.77464, -76.31624],
  [3.7742, -76.31495],
  [3.77041, -76.316],
  [3.77079, -76.31734],
];
const lots = [
  { id: "lot3", outline: lot3 },
  { id: "lot4", outline: lot4 },
  { id: "lot5", outline: lot5 },
];

const roadSouth: Position[] = [
  [3.799, -76.31076],
  [3.80114, -76.30979],
  [3.80349, -76.30893],
  [3.80756, -76.30829],
];
const roadNorth: Position[] = [
  [3.80756, -76.30829],
  [3.81184, -76.30825],
  [3.81548, -76.3076],
  [3.81912, -76.30646],
];

const fence = [
  {
    id: "west",
    outline: [
      [3.54229, -76.49984],
      [3.54161, -76.49686],
      [3.53893, -76.49729],
      [3.53834, -76.49973],
      [3.53882, -76.50089],
      [3.54032, -76.50048],
      [3.54118, -76.50012],
    ] as Position[],
  },
  {
    id: "east",
    outline: [
      [3.54161, -76.49686],
      [3.54233, -76.49619],
      [3.54198, -76.49439],
      [3.54075, -76.493],
      [3.53834, -76.49312],
      [3.53877, -76.49589],
      [3.53893, -76.49729],
    ] as Position[],
  },
];

test("the camera maths gives the usual ground footprint and height", () => {
  const { across, along } = footprint(2.1, mappingCamera);
  assert.ok(Math.abs(across - 0.021 * 5280) < 1e-9);
  assert.ok(Math.abs(along - 0.021 * 3956) < 1e-9);
  // Height grows with the pixel size on the ground.
  assert.ok(heightFor(4, mappingCamera) > heightFor(2, mappingCamera));
});

test("a survey keeps its lines parallel, evenly spaced and at most one spacing apart", () => {
  const plan = planMission({ sector: "agriculture", zones: [lots[0]] });
  assert.ok(plan.surveyPaths.length >= 2);
  const direction = (path: Position[]) => {
    const [a, b] = [path[0], path[path.length - 1]];
    const angle = Math.atan2(b[0] - a[0], b[1] - a[1]);
    // The aircraft flies lines in alternating directions: compare them as undirected.
    return ((angle % Math.PI) + Math.PI) % Math.PI;
  };
  const first = direction(plan.surveyPaths[0]);
  plan.surveyPaths.forEach((path) => {
    const off = Math.abs(direction(path) - first);
    assert.ok(Math.min(off, Math.PI - off) < 0.02, "lines are parallel");
  });
  // Adjacent lines are never farther apart than the spacing the overlap allows.
  for (let i = 1; i < plan.surveyPaths.length; i += 1) {
    const gap = distanceToLineM(
      plan.surveyPaths[i][0],
      plan.surveyPaths[i - 1],
    );
    assert.ok(gap <= plan.lineSpacingM * 1.05, `line ${i} is ${gap} m away`);
  }
});

test("the lines alternate direction so the aircraft never flies back empty", () => {
  const plan = planMission({ sector: "agriculture", zones: [lots[0]] });
  const dx = (path: Position[]) => path[path.length - 1][1] - path[0][1];
  const dy = (path: Position[]) => path[path.length - 1][0] - path[0][0];
  const along = (path: Position[]) =>
    dx(path) * dx(plan.surveyPaths[0]) + dy(path) * dy(plan.surveyPaths[0]);
  plan.surveyPaths.forEach((path, index) => {
    assert.equal(along(path) > 0, index % 2 === 0);
  });
});

test("the distance, the photos and the minutes follow from the route", () => {
  const plan = planMission({ sector: "agriculture", zones: lots });
  assert.ok(Math.abs(plan.distanceKm - lineLengthKm(plan.route)) < 0.05);
  const surveyKm = plan.surveyPaths.reduce(
    (sum, path) => sum + lineLengthKm(path),
    0,
  );
  assert.ok(Math.abs(plan.surveyKm - surveyKm) < 0.05);
  // One photo every photo spacing along each line, plus the first.
  const expected = plan.surveyPaths.reduce(
    (sum, path) =>
      sum + Math.floor((lineLengthKm(path) * 1000) / plan.photoSpacingM) + 1,
    0,
  );
  assert.ok(Math.abs(plan.photoCount - expected) <= plan.surveyPaths.length);
  // Time is at least the time needed to fly the route at the cruise speed.
  assert.ok(plan.durationMin >= (plan.distanceKm * 1000) / 8 / 60);
  // Take off and land at the same place, outside the lots.
  assert.deepEqual(plan.route[0], plan.route[plan.route.length - 1]);
  assert.ok(lots.every((lot) => !pointInPolygon(plan.route[0], lot.outline)));
});

test("a flight that covers one lot stays on that lot", () => {
  const plan = planMission({ sector: "agriculture", zones: [lots[0]] });
  const margin = plan.photoSpacingM + 2;
  plan.surveyPaths.flat().forEach((point) => {
    const inside = pointInPolygon(point, lot3);
    const near = distanceToLineM(point, [...lot3, lot3[0]]) <= margin;
    assert.ok(
      inside || near,
      "every turning point is in the lot or at its edge",
    );
  });
  assert.ok(Math.abs(plan.orderedHa - polygonAreaHa(lot3)) < 0.01);
  assert.ok(plan.coveredHa / plan.orderedHa > 0.99);
});

test("flying every lot covers them all and leaves nothing behind", () => {
  const plan = planMission({ sector: "agriculture", zones: lots });
  assert.ok(plan.coveredHa / plan.orderedHa > 0.99);
  assert.deepEqual(plan.uncovered, []);
});

test("ending early leaves the last lot short and reports where", () => {
  const full = planMission({ sector: "agriculture", zones: lots });
  const short = planMission({
    sector: "agriculture",
    zones: lots,
    endEarlyAt: 0.84,
  });
  assert.ok(short.surveyKm < full.surveyKm);
  assert.ok(short.photoCount < full.photoCount);
  assert.ok(short.coveredHa < short.orderedHa);
  assert.ok(
    short.coveredHa / short.orderedHa > 0.9,
    "most of the area is still reached",
  );
  assert.equal(short.uncovered.length, 1);
  assert.equal(short.uncovered[0].zoneId, "lot5");
});

test("a road is flown out and back, once along each side of its centre line", () => {
  const plan = planMission({
    sector: "roads",
    zones: [
      { id: "south", outline: roadSouth },
      { id: "north", outline: roadNorth },
    ],
  });
  assert.equal(plan.surveyPaths.length, 2);
  const centre = [...roadSouth, ...roadNorth.slice(1)];
  const [out, back] = plan.surveyPaths;
  // The two lines are on opposite sides of the road: both within a spacing of it, and not the same line.
  out.forEach((point) =>
    assert.ok(distanceToLineM(point, centre) < plan.lineSpacingM),
  );
  back.forEach((point) =>
    assert.ok(distanceToLineM(point, centre) < plan.lineSpacingM),
  );
  assert.ok(distanceToLineM(out[3], back) > plan.lineSpacingM * 0.5);
  // A road is not an area: nothing is measured in hectares.
  assert.equal(plan.orderedHa, 0);
  assert.equal(plan.coveredHa, 0);
  assert.ok(plan.distanceKm > 2 * lineLengthKm(centre) * 0.95);
});

test("a patrol follows the fence from the inside and comes back to where it began", () => {
  const plan = planMission({ sector: "security", zones: fence });
  assert.equal(plan.surveyPaths.length, 1);
  const [loop] = plan.surveyPaths;
  assert.deepEqual(loop[0], loop[loop.length - 1]);
  const outer = convexHull(fence.flatMap((zone) => zone.outline));
  loop.forEach((point) => assert.ok(pointInPolygon(point, outer)));
  // Close to the fence, not wandering across the middle of the site.
  loop.forEach((point) =>
    assert.ok(distanceToLineM(point, [...outer, outer[0]]) < 40),
  );
  assert.ok(plan.distanceKm > 1);
  assert.equal(plan.coveredHa, 0, "a patrol does not measure area");
});

test("a works site is surveyed in lines and then circled for its façades", () => {
  const works: Position[] = [
    [3.40937, -76.53141],
    [3.4092, -76.53001],
    [3.40866, -76.53005],
    [3.40881, -76.53143],
  ];
  const plan = planMission({
    sector: "construction",
    zones: [{ id: "north", outline: works }],
  });
  assert.ok(plan.surveyPaths.length >= 3);
  const loop = plan.surveyPaths[plan.surveyPaths.length - 1];
  assert.deepEqual(
    loop[0],
    loop[loop.length - 1],
    "the last pass is a closed loop",
  );
  // The loop keeps its distance from the works, on the outside.
  loop.forEach((point) => {
    assert.ok(!pointInPolygon(point, works));
    assert.ok(distanceToLineM(point, [...works, works[0]]) > 8);
  });
  assert.ok(plan.coveredHa / plan.orderedHa > 0.99);
});

test("no zones gives an empty plan instead of failing", () => {
  const plan = planMission({ sector: "agriculture", zones: [] });
  assert.deepEqual(plan.route, []);
  assert.equal(plan.photoCount, 0);
});

test("a pit is surveyed in lines and then circled along its crest, and its area is measured", () => {
  const bench: Position[] = [
    [3.64847, -76.47729],
    [3.64879, -76.47557],
    [3.64847, -76.47407],
    [3.64697, -76.47396],
    [3.64568, -76.47407],
    [3.64397, -76.47418],
    [3.64397, -76.47836],
    [3.64483, -76.47815],
    [3.64654, -76.47772],
    [3.64783, -76.4775],
  ];
  const plan = planMission({
    sector: "mining",
    zones: [{ id: "north", outline: bench }],
  });
  assert.ok(plan.surveyPaths.length >= 3);
  const loop = plan.surveyPaths[plan.surveyPaths.length - 1];
  assert.deepEqual(
    loop[0],
    loop[loop.length - 1],
    "the last pass is a closed loop",
  );
  loop.forEach((point) => assert.ok(!pointInPolygon(point, bench)));
  assert.ok(plan.orderedHa > 20, "the bench is some tens of hectares");
  assert.ok(plan.coveredHa / plan.orderedHa > 0.99);
});
