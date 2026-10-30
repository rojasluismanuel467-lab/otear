import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildRoute, pathAt, wrapPi, type Waypoint } from "./flight-path.ts";

const stops: Waypoint[] = [
  { scroll: 0, x: 300, y: 400, size: 380 },
  { scroll: 1600, x: 1000, y: 300, size: 220 },
  { scroll: 3000, x: 1000, y: 320, size: 220 },
  { scroll: 5200, x: 700, y: 640, size: 150 },
];
const view = { width: 1400, height: 900 };

describe("pathAt", () => {
  it("passes exactly through every waypoint", () => {
    for (const stop of stops) {
      const at = pathAt(stops, stop.scroll);
      assert.ok(Math.abs(at.x - stop.x) < 1e-9);
      assert.ok(Math.abs(at.y - stop.y) < 1e-9);
      assert.ok(Math.abs(at.size - stop.size) < 1e-9);
    }
  });

  it("holds the end values outside the route", () => {
    assert.equal(pathAt(stops, -300).x, stops[0].x);
    assert.equal(pathAt(stops, 99999).y, stops[3].y);
  });

  it("moves in small steps, with no jumps between waypoints", () => {
    let previous = pathAt(stops, 0);
    for (let scroll = 5; scroll <= 5200; scroll += 5) {
      const at = pathAt(stops, scroll);
      assert.ok(Math.hypot(at.x - previous.x, at.y - previous.y) < 5);
      previous = at;
    }
  });
});

describe("buildRoute", () => {
  it("keeps the first and last stop and orders the scrolls strictly", () => {
    const route = buildRoute(stops, view);
    assert.deepEqual(route[0], stops[0]);
    assert.deepEqual(route[route.length - 1], stops[3]);
    route.slice(1).forEach((point, index) => {
      assert.ok(point.scroll > route[index].scroll);
    });
  });

  it("adds swings only where the stops are far apart, inside the viewport", () => {
    const route = buildRoute(stops, view);
    assert.ok(route.length > stops.length);
    for (const point of route) {
      assert.ok(point.x - point.size / 2 >= 0);
      assert.ok(point.x + point.size / 2 <= view.width);
    }
    const close = buildRoute([stops[0], { ...stops[1], scroll: 500 }], view);
    assert.equal(close.length, 2);
  });

  it("drops a stop that is almost on top of the previous one", () => {
    const route = buildRoute(
      [stops[0], { ...stops[1], scroll: 10 }, stops[2]],
      view,
    );
    assert.ok(!route.some((point) => point.scroll === 10));
  });
});

describe("wrapPi", () => {
  it("brings an angle to the shortest turn", () => {
    assert.ok(Math.abs(wrapPi(3 * Math.PI) + Math.PI) < 1e-9);
    assert.ok(Math.abs(wrapPi(-0.5) + 0.5) < 1e-9);
    assert.ok(Math.abs(wrapPi(2 * Math.PI + 0.3) - 0.3) < 1e-9);
  });
});
