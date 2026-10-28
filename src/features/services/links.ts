import type { Flight, ServiceRequest } from "../demo/types";

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
