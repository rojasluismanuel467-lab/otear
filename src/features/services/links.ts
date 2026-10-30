import type { Aircraft, Flight, ServiceRequest } from "../demo/types";

/**
 * Hectares an operator says it covered for a flight: from its flight record when it filled one in,
 * otherwise from the delivery it registered on the service request that created the flight.
 */
export function coveredHaFor(
  flight: Pick<Flight, "id" | "log"> | undefined,
  requests: Pick<ServiceRequest, "flightId" | "delivery">[],
): number | undefined {
  if (!flight) return undefined;
  return (
    flight.log?.coveredHa ??
    requests.find((request) => request.flightId === flight.id)?.delivery
      ?.coveredHa
  );
}

/**
 * The aircraft to put on a flight that a service schedules: the one an operator has flown most at
 * this site, among the aircraft that are in service. An aircraft has no owner field in the demo,
 * so the link is its past flights under the operator's name; an operator without flights on an
 * aircraft of the example fleet gets none and the flight keeps «Por definir».
 */
export function aircraftForOperator(
  operatorName: string,
  flights: Pick<Flight, "operator" | "aircraftId">[],
  aircraft: Pick<Aircraft, "id" | "make" | "model" | "status">[],
): { id: string; label: string } | undefined {
  const counts = new Map<string, number>();
  for (const flight of flights) {
    if (flight.operator !== operatorName || !flight.aircraftId) continue;
    counts.set(flight.aircraftId, (counts.get(flight.aircraftId) ?? 0) + 1);
  }
  const best = [...counts.entries()]
    .filter(([id]) =>
      aircraft.some((item) => item.id === id && item.status === "active"),
    )
    .sort((a, b) => b[1] - a[1])[0];
  const found = aircraft.find((item) => item.id === best?.[0]);
  return found
    ? { id: found.id, label: `${found.make} ${found.model}` }
    : undefined;
}
