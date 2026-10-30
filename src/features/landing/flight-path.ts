/**
 * Route of the landing's aircraft: where it is on screen for a given scroll offset.
 * Pure geometry; the DOM measuring lives in `flight-scene.ts`.
 */

/** A place the aircraft passes at a given scroll offset. All lengths are viewport pixels. */
export type Waypoint = {
  scroll: number;
  x: number;
  y: number;
  /** Wingspan on screen. */
  size: number;
};

export function wrapPi(angle: number) {
  const turn = (angle + Math.PI) % (2 * Math.PI);
  return (turn < 0 ? turn + 2 * Math.PI : turn) - Math.PI;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Channel = "x" | "y" | "size";

/** Slope of a channel at waypoint `k`, per scroll pixel (Catmull-Rom style). */
function slope(points: Waypoint[], k: number, channel: Channel) {
  const before = points[Math.max(0, k - 1)];
  const after = points[Math.min(points.length - 1, k + 1)];
  return (after[channel] - before[channel]) / (after.scroll - before.scroll);
}

/**
 * Smooth interpolation through the waypoints, parametrised by scroll. Outside the
 * first and last waypoint it holds the end values. `points` must be strictly
 * increasing in `scroll`.
 */
export function pathAt(points: Waypoint[], scroll: number): Waypoint {
  const last = points.length - 1;
  if (last < 0) throw new Error("pathAt needs at least one waypoint");
  if (last === 0 || scroll <= points[0].scroll) {
    return { ...points[0], scroll };
  }
  if (scroll >= points[last].scroll) return { ...points[last], scroll };

  let i = 0;
  while (points[i + 1].scroll < scroll) i += 1;
  const from = points[i];
  const to = points[i + 1];
  const span = to.scroll - from.scroll;
  const t = (scroll - from.scroll) / span;
  const t2 = t * t;
  const t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  const blend = (channel: Channel) =>
    h00 * from[channel] +
    h10 * span * slope(points, i, channel) +
    h01 * to[channel] +
    h11 * span * slope(points, i + 1, channel);
  return { scroll, x: blend("x"), y: blend("y"), size: blend("size") };
}

type RouteView = { width: number; height: number };

/**
 * Turns the measured stops into a route: drops stops that are too close in scroll,
 * and in long stretches between two stops adds swings to the side so the aircraft
 * weaves across the page instead of crawling along a straight line.
 */
export function buildRoute(stops: Waypoint[], view: RouteView): Waypoint[] {
  const narrow = view.width < 800;
  const sorted = [...stops].sort((a, b) => a.scroll - b.scroll);
  const kept: Waypoint[] = [];
  for (const stop of sorted) {
    const previous = kept[kept.length - 1];
    if (!previous || stop.scroll - previous.scroll >= 40) kept.push(stop);
  }

  const maxGap = view.height * 0.9;
  const swing = view.width * (narrow ? 0.06 : 0.14);
  const route: Waypoint[] = [];
  let side = -1;
  kept.forEach((stop, index) => {
    const previous = kept[index - 1];
    if (previous) {
      const gap = stop.scroll - previous.scroll;
      const inserts = Math.max(0, Math.ceil(gap / maxGap) - 1);
      for (let n = 1; n <= inserts; n += 1) {
        const k = n / (inserts + 1);
        const size = previous.size + (stop.size - previous.size) * k;
        const margin = size * 0.5 + 8;
        route.push({
          scroll: previous.scroll + gap * k,
          x: clamp(
            previous.x + (stop.x - previous.x) * k + side * swing,
            margin,
            view.width - margin,
          ),
          y: clamp(
            previous.y + (stop.y - previous.y) * k + side * view.height * 0.08,
            view.height * 0.12,
            view.height * 0.78,
          ),
          size,
        });
        side = -side;
      }
    }
    route.push(stop);
  });
  return route;
}
