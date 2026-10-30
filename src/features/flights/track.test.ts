import assert from "node:assert/strict";
import test from "node:test";
import { lineLengthKm } from "../../lib/geo.ts";
import {
  footprint,
  heightFor,
  mappingCamera,
  planMission,
} from "./mission-plan.ts";
import {
  buildTrack,
  indexAt,
  neighbouringEvents,
  stateAt,
  surveyRuns,
  trailUpTo,
} from "./track.ts";
import type { Position } from "../demo/types";

const lots = [
  {
    id: "lot3",
    outline: [
      [3.7759, -76.32035],
      [3.77509, -76.31765],
      [3.7712, -76.3187],
      [3.77191, -76.32138],
    ] as Position[],
  },
  {
    id: "lot4",
    outline: [
      [3.77506, -76.31763],
      [3.77464, -76.31624],
      [3.77079, -76.31734],
      [3.7712, -76.3187],
    ] as Position[],
  },
];

function trackFor(options: { endEarlyAt?: number; findings?: boolean } = {}) {
  const plan = planMission({
    sector: "agriculture",
    zones: lots,
    ...(options.endEarlyAt ? { endEarlyAt: options.endEarlyAt } : {}),
  });
  const { across, along } = footprint(2.1, mappingCamera);
  const track = buildTrack({
    route: plan.route,
    durationMin: 25,
    heightM: heightFor(2.1, mappingCamera),
    swathM: across,
    photoCount: plan.photoCount,
    photoSpacingM: along * 0.25,
    zones: lots,
    findings: options.findings
      ? [
          { id: "a", title: "Uno", position: [3.7735, -76.3195] },
          { id: "b", title: "Dos", position: [3.7728, -76.3168] },
        ]
      : [],
  });
  return { plan, track };
}

test("the track lasts as long as the flight and starts and ends at rest on the ground", () => {
  const { track } = trackFor();
  const first = track.points[0];
  const last = track.points[track.points.length - 1];
  assert.equal(first.t, 0);
  assert.equal(last.t, 25 * 60);
  assert.equal(first.altM, 0);
  assert.equal(last.altM, 0);
  assert.equal(stateAt(track, 0).speedMs, 0);
  assert.equal(stateAt(track, track.duration).speedMs, 0);
  assert.deepEqual(first.position, last.position, "it lands where it took off");
  // Time never goes backwards, and neither does the distance flown.
  track.points.forEach((point, index) => {
    if (index === 0) return;
    assert.ok(point.t >= track.points[index - 1].t);
    assert.ok(point.distM >= track.points[index - 1].distM - 1e-9);
  });
});

test("it flies at the height of the mapping camera and the phases come in order", () => {
  const { track } = trackFor();
  const mid = stateAt(track, track.duration / 2);
  assert.ok(Math.abs(mid.altM - track.heightM) < 1e-6);
  assert.equal(stateAt(track, 1).phase, "takeoff");
  assert.equal(mid.phase, "survey");
  assert.equal(stateAt(track, track.duration - 1).phase, "landing");
  const order = ["takeoff", "transit", "survey", "return", "landing"];
  const seen = track.points.map((point) => order.indexOf(point.phase));
  seen.forEach((value, index) => {
    if (index > 0) assert.ok(value >= seen[index - 1], "phases never go back");
  });
});

test("corners are rounded: the heading changes a little at a time and the path stays smooth", () => {
  const { track } = trackFor();
  for (let i = 1; i < track.points.length; i += 1) {
    const step = Math.abs(
      track.points[i].heading - track.points[i - 1].heading,
    );
    assert.ok(step < 0.6, `heading jumps by ${step} rad at point ${i}`);
  }
  // Turns are slower than the straight lines.
  const speeds = track.points
    .filter((point) => point.survey)
    .map((point) => point.speedMs);
  assert.ok(Math.min(...speeds) < Math.max(...speeds));
  // The rounded path is not longer than the route plus a little for the arcs.
  const rounded = track.points[track.points.length - 2].distM / 1000;
  const raw = lineLengthKm(trackFor().plan.route);
  assert.ok(rounded <= raw * 1.001 && rounded > raw * 0.9);
});

test("photos are spread over the survey and their count is the one asked for", () => {
  const { plan, track } = trackFor();
  assert.equal(track.photoTimes.length, plan.photoCount);
  track.photoTimes.forEach((t, index) => {
    if (index > 0) assert.ok(t >= track.photoTimes[index - 1]);
  });
  assert.equal(stateAt(track, 0).photos, 0);
  assert.equal(stateAt(track, track.duration).photos, plan.photoCount);
  // No photo is taken on the way out or the way home.
  const start = track.events.find((event) => event.kind === "survey")!.t;
  const back = track.events.find((event) => event.kind === "return")!.t;
  assert.ok(
    track.photoTimes.every((t) => t >= start - 1e-6 && t <= back + 1e-6),
  );
});

test("each finding is reached while surveying, and events come in time order", () => {
  const { track } = trackFor({ findings: true });
  const findings = track.events.filter((event) => event.kind === "finding");
  assert.equal(findings.length, 2);
  const start = track.events.find((event) => event.kind === "survey")!;
  const back = track.events.find((event) => event.kind === "return")!;
  findings.forEach((event) =>
    assert.ok(event.t >= start.t && event.t <= back.t),
  );
  track.events.forEach((event, index) => {
    if (index > 0) assert.ok(event.t >= track.events[index - 1].t);
  });
  assert.equal(track.events[0].kind, "takeoff");
  assert.equal(track.events[track.events.length - 1].kind, "landing");
});

test("the area reached grows with time and ends where the planner says it ends", () => {
  const { plan, track } = trackFor();
  let before = -1;
  for (let t = 0; t <= track.duration; t += track.duration / 40) {
    const now = stateAt(track, t).coveredShare;
    assert.ok(now >= before - 1e-9);
    before = now;
  }
  const final = stateAt(track, track.duration);
  assert.ok(Math.abs(final.coveredHa - plan.coveredHa) / plan.orderedHa < 0.03);
  assert.ok(final.coveredShare > 0.97);
});

test("a flight cut short ends with part of the area uncovered", () => {
  const { plan, track } = trackFor({ endEarlyAt: 0.5 });
  const final = stateAt(track, track.duration);
  assert.ok(final.coveredShare < 0.97);
  assert.ok(Math.abs(final.coveredHa - plan.coveredHa) / plan.orderedHa < 0.03);
});

test("the trail and the painted runs end at the aircraft's present position", () => {
  const { track } = trackFor();
  const t = track.duration * 0.4;
  const now = stateAt(track, t);
  const trail = trailUpTo(track, t);
  assert.deepEqual(trail[trail.length - 1], now.position);
  const runs = surveyRuns(track, t);
  assert.ok(runs.length >= 1);
  assert.deepEqual(
    runs[runs.length - 1][runs[runs.length - 1].length - 1],
    now.position,
  );
  assert.ok(indexAt(track, t) < indexAt(track, t + 100));
});

test("the neighbouring events help to step forward and back", () => {
  const { track } = trackFor({ findings: true });
  const first = neighbouringEvents(track, 0);
  assert.equal(first.before, undefined);
  assert.equal(first.after?.kind, "survey");
  const end = neighbouringEvents(track, track.duration);
  assert.equal(end.after, undefined);
});

test("a route with nothing to follow gives an empty track instead of failing", () => {
  const track = buildTrack({
    route: [],
    durationMin: 10,
    heightM: 80,
    swathM: 100,
    photoCount: 0,
    photoSpacingM: 20,
  });
  assert.equal(track.points.length, 0);
  assert.equal(stateAt(track, 5).photos, 0);
});
