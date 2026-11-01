import type {
  FlightProblem,
  MapProblem,
  MapReading,
  Verification,
} from "./verification";

/**
 * What the prototype remembers while a labor is being verified. Each part is a union of mutually
 * exclusive states, so a button never has to guess whether it is loading and failed at once.
 */

export type MapState =
  | { kind: "idle"; requested: boolean }
  | { kind: "loading"; fileName: string }
  | { kind: "ready"; reading: MapReading }
  | { kind: "error"; problem: MapProblem; fileName: string };

export type CompareState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; verification: Verification; flightId: string }
  | { kind: "error"; problem: FlightProblem };

export type AcceptState =
  | { kind: "idle" }
  | { kind: "asking" }
  | { kind: "loading" }
  | { kind: "error" };

export interface VerifySession {
  laborId: string;
  map: MapState;
  flightId?: string;
  compare: CompareState;
  accept: AcceptState;
}

export const newSession = (laborId: string): VerifySession => ({
  laborId,
  map: { kind: "idle", requested: false },
  compare: { kind: "idle" },
  accept: { kind: "idle" },
});

/** The evidence a person sent for a labor: kept so the labor can show its claim afterwards. */
export interface Claim {
  destination: string;
  message: string;
  supports: string[];
  verification: Verification;
}

export type Screen =
  | { name: "labors" }
  | { name: "verify"; laborId: string }
  | { name: "share"; laborId: string };
