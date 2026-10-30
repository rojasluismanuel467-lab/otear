import { planMission } from "../../features/flights/mission-plan.ts";
import type { Flight, Position, Site } from "../../features/demo/types";

/**
 * Survey lines of a finished flight that its route does not include: the lines the operator
 * ended without flying (a battery that ran out before the last ones). The map draws them in
 * another colour and dashed, so the gap that the operator declares in the flight log is where
 * the eye can see it. It is the planner's own line set compared with the route, nothing the
 * operator drew: when the route does not come from that plan (the person drew it by hand) it
 * returns nothing instead of guessing. The area reached is only illustrative.
 */

/** About a metre in degrees: the route and the plan come from the same rounding. */
const SAME_POINT = 1e-5;

const sameSpot = (a: Position, b: Position) =>
  Math.abs(a[0] - b[0]) < SAME_POINT && Math.abs(a[1] - b[1]) < SAME_POINT;

type Input = {
  site: Pick<Site, "sector" | "zones">;
  flight: Pick<Flight, "status" | "route" | "zoneIds" | "log"> | undefined;
};

export function unflownLines({ site, flight }: Input): Position[][] {
  if (!flight || flight.status !== "completed" || flight.route.length < 3)
    return [];
  // Only where the aircraft maps a surface in parallel lines.
  if (!["agriculture", "construction", "mining"].includes(site.sector))
    return [];
  const zones = site.zones.filter((zone) => flight.zoneIds.includes(zone.id));
  if (!zones.length) return [];

  const overlap = flight.log?.overlapPct;
  const full = planMission({
    sector: site.sector,
    zones,
    settings: {
      ...(flight.log?.gsdCm !== undefined ? { gsdCm: flight.log.gsdCm } : {}),
      ...(overlap !== undefined
        ? { sideOverlap: overlap / 100, frontOverlap: overlap / 100 }
        : {}),
    },
  });
  // Straight lines only (the façade loop of a works site has many points and is not a gap).
  const lines = full.surveyPaths.filter((path) => path.length === 2);
  if (!lines.length) return [];

  const inRoute = (point: Position) =>
    flight.route.some((vertex) => sameSpot(vertex, point));
  const flown = lines.filter((line) => line.every(inRoute));
  // A route that shares almost nothing with the plan was not made by it.
  if (flown.length < lines.length / 2) return [];
  return lines.filter((line) => !line.every(inRoute));
}
