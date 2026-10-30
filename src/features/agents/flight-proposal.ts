import type { Finding, Flight, Position, Site } from "../demo/types";
import {
  buildCaptures,
  comparisonReliability,
  indicatorFor,
  stalledZones,
  sustainedDeclines,
  type CapturePoint,
} from "../evolution/evolution.ts";
import { planMission } from "../flights/mission-plan.ts";
import { compareWithHistory } from "../reports/insights.ts";

/**
 * «Próximo vuelo» assistant. It reads what the platform already holds (completed flights, what
 * each one measured, findings and the agenda) and proposes where to fly next and why. It is a
 * set of explicit rules, not a trained model: every point of the score carries the sentence and
 * the numbers that produced it, so a person can check the reasoning and disagree. It proposes;
 * it never schedules, pays or sends anything.
 */

export type SignalKind =
  "decline" | "stalled" | "open" | "persistent" | "stale" | "never";

export interface ZoneSignal {
  kind: SignalKind;
  weight: number;
  text: string;
}

export type Level = "high" | "medium" | "low";

export interface ZoneAssessment {
  zoneId: string;
  name: string;
  score: number;
  level: Level;
  signals: ZoneSignal[];
  /** Upcoming flight that already covers this zone. */
  scheduled?: { flightId: string; title: string; date: string };
}

export type OpportunityKind =
  "review-first" | "coverage" | "spacing" | "reliability";

export interface Opportunity {
  id: string;
  kind: OpportunityKind;
  text: string;
}

export interface FlightProposal {
  zoneIds: string[];
  title: string;
  objective: string;
  /** The strongest reason for each chosen zone, untruncated. */
  reasons: string[];
  date: string;
  time: string;
  /** At least one chosen zone is rated high. */
  urgent: boolean;
  route: Position[];
  distanceKm: number;
  durationMin: number;
  photoCount: number;
  /** Hectares of the chosen zones; 0 when they are lines (roads). */
  orderedHa: number;
}

export interface Suggestion {
  assessments: ZoneAssessment[];
  proposal: FlightProposal | null;
  /** Why there is no proposal, when there is none. */
  none?: string;
  opportunities: Opportunity[];
  basis: {
    completedFlights: number;
    /** Fewer than three earlier flights: trends are weak. */
    limited: boolean;
    signals: number;
  };
}

export interface SuggestInput {
  site: Site;
  flights: Flight[];
  findings: Finding[];
  /** ISO date taken as «today». */
  today: string;
  /** Hectares (km for roads) of each zone, measured from its outline. */
  zoneMeasure: Record<string, number>;
}

/** Days after which a zone is due for another look, by sector. */
export const staleAfterDays = {
  agriculture: 21,
  roads: 14,
  construction: 14,
  security: 7,
  mining: 14,
} as const;

export const PROPOSE_MIN_SCORE = 25;
export const HIGH_MIN_SCORE = 50;
export const MAX_PROPOSED_ZONES = 4;
const COVERAGE_TOLERANCE = 0.05;

const DAY_MS = 86_400_000;
const dayNumber = (date: string) =>
  Math.floor(new Date(`${date}T12:00:00Z`).getTime() / DAY_MS);

export function addDays(date: string, days: number) {
  return new Date((dayNumber(date) + days) * DAY_MS).toISOString().slice(0, 10);
}

const number = (value: number, digits = 2) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
const whole = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

function levelOf(score: number): Level {
  return score >= HIGH_MIN_SCORE
    ? "high"
    : score >= PROPOSE_MIN_SCORE
      ? "medium"
      : "low";
}

function listNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

function lastValues(points: CapturePoint[], zoneId: string, count: number) {
  return points
    .map((point) => point.values[zoneId])
    .filter((value): value is number => value !== undefined)
    .slice(-count);
}

function assessZones(
  input: SuggestInput,
  captures: CapturePoint[],
  completed: Flight[],
): ZoneAssessment[] {
  const { site, flights, findings, today } = input;
  const indicator = indicatorFor(site.sector);
  const zoneIds = site.zones.map((zone) => zone.id);
  const declining =
    indicator.kind === "vigor" ? sustainedDeclines(captures, zoneIds) : [];
  const stalled =
    indicator.kind === "progress" ? stalledZones(captures, zoneIds) : [];
  const staleDays = staleAfterDays[site.sector];
  const upcoming = flights
    .filter((flight) => flight.status === "scheduled" && flight.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return site.zones.map((zone) => {
    const signals: ZoneSignal[] = [];

    if (declining.includes(zone.id)) {
      const values = lastValues(captures, zone.id, 3);
      signals.push({
        kind: "decline",
        weight: 40,
        text: `El vigor bajó en cada uno de los últimos 2 vuelos (${values.map((value) => number(value)).join(" → ")}).`,
      });
    }
    if (stalled.includes(zone.id)) {
      const values = lastValues(captures, zone.id, 3);
      signals.push({
        kind: "stalled",
        weight: 35,
        text: `Avanzó menos de 8 puntos en los últimos 2 vuelos (${values.map((value) => `${whole(value)} %`).join(" → ")}).`,
      });
    }

    const inZone = findings.filter(
      (finding) =>
        finding.zoneId === zone.id &&
        completed.some((flight) => flight.id === finding.flightId),
    );
    const open = inZone.filter((finding) => finding.status === "confirmed");
    if (open.length) {
      const high = open.filter((finding) => finding.priority === "high");
      const medium = open.filter((finding) => finding.priority === "medium");
      const weight = high.length ? 25 : medium.length ? 15 : 8;
      signals.push({
        kind: "open",
        weight,
        text: `${plural(open.length, "observación confirmada sigue", "observaciones confirmadas siguen")} sin verificar${high.length ? ` (${high.length} de prioridad alta)` : ""}.`,
      });
    }
    const repeated = inZone
      .filter((finding) => finding.status !== "dismissed")
      .map((finding) => ({
        finding,
        ...compareWithHistory(finding, findings, flights),
      }))
      .filter((entry) => entry.trend === "persistent")
      .sort((a, b) => b.earlierFlights - a.earlierFlights)[0];
    if (repeated) {
      signals.push({
        kind: "persistent",
        weight: 15,
        text: `«${repeated.finding.title}» ya se había reportado en ${plural(repeated.earlierFlights, "vuelo anterior", "vuelos anteriores")}.`,
      });
    }

    const visits = completed.filter((flight) =>
      flight.zoneIds.includes(zone.id),
    );
    const last = visits[visits.length - 1];
    if (!last) {
      signals.push({
        kind: "never",
        weight: 30,
        text: "Ningún vuelo completado la ha recorrido todavía.",
      });
    } else {
      const since = dayNumber(today) - dayNumber(last.date);
      if (since >= staleDays) {
        const extra = Math.min(
          15,
          Math.floor(((since - staleDays) / staleDays) * 15),
        );
        signals.push({
          kind: "stale",
          weight: 15 + extra,
          text: `Hace ${since} días que no se vuela (lo habitual en este sector es revisar cada ${staleDays}).`,
        });
      }
    }

    const score = signals.reduce((sum, signal) => sum + signal.weight, 0);
    const booked = upcoming.find((flight) => flight.zoneIds.includes(zone.id));
    return {
      zoneId: zone.id,
      name: zone.name,
      score,
      level: levelOf(score),
      signals: signals.sort((a, b) => b.weight - a.weight),
      scheduled: booked
        ? { flightId: booked.id, title: booked.title, date: booked.date }
        : undefined,
    };
  });
}

function findOpportunities(
  input: SuggestInput,
  captures: CapturePoint[],
  completed: Flight[],
  assessments: ZoneAssessment[],
  chosen: ZoneAssessment[],
): Opportunity[] {
  const { site, findings, zoneMeasure } = input;
  const indicator = indicatorFor(site.sector);
  const opportunities: Opportunity[] = [];

  const pending = findings.filter((finding) => finding.status === "pending");
  if (pending.length) {
    opportunities.push({
      id: "review-first",
      kind: "review-first",
      text: `Hay ${plural(pending.length, "observación", "observaciones")} de vuelos anteriores sin revisar. Revíselas antes de volar para no repetir lo que ya se vio.`,
    });
  }

  if (site.sector !== "roads") {
    const withCover = completed
      .filter((flight) => flight.log?.coveredHa !== undefined)
      .at(-1);
    if (withCover) {
      const ordered = withCover.zoneIds.reduce(
        (sum, id) => sum + (zoneMeasure[id] ?? 0),
        0,
      );
      const covered = withCover.log?.coveredHa ?? 0;
      if (ordered > 0 && covered < ordered * (1 - COVERAGE_TOLERANCE)) {
        opportunities.push({
          id: `coverage-${withCover.id}`,
          kind: "coverage",
          text: `En «${withCover.title}» el operador declaró ${whole(covered)} de ${whole(ordered)} ha pedidas (${whole((covered / ordered) * 100)} %). Contraste la diferencia antes de pagar y pida completar lo que faltó.`,
        });
      }
    }
  }

  if (indicator.kind === "vigor" || indicator.kind === "count") {
    const steady = assessments.filter((assessment) => {
      if (chosen.some((item) => item.zoneId === assessment.zoneId)) {
        return false;
      }
      if (assessment.signals.length) return false;
      const values = lastValues(captures, assessment.zoneId, 3);
      if (values.length < 3) return false;
      const spread = Math.max(...values) - Math.min(...values);
      return indicator.kind === "vigor" ? spread <= 0.02 : spread === 0;
    });
    if (steady.length) {
      opportunities.push({
        id: "spacing",
        kind: "spacing",
        text: `${listNames(steady.map((item) => item.name))}: sin cambios en los últimos 3 vuelos y sin observaciones abiertas. Podría espaciar sus vuelos y ahorrar costo; la decisión es suya, porque el cultivo puede cambiar entre vuelos.`,
      });
    }
  }

  if (indicator.kind === "progress" && captures.length >= 2) {
    const reliability = comparisonReliability(
      captures[captures.length - 2],
      captures[captures.length - 1],
    );
    if (reliability.level !== "high") {
      opportunities.push({
        id: "reliability",
        kind: "reliability",
        text: `${reliability.text} Registre los puntos de control en el próximo vuelo.`,
      });
    }
  }
  return opportunities;
}

export function suggestNextFlight(input: SuggestInput): Suggestion {
  const { site, flights, findings, today } = input;
  const completed = flights
    .filter((flight) => flight.status === "completed")
    .sort((a, b) => a.date.localeCompare(b.date));
  const captures = buildCaptures(site, flights, findings);
  const assessments = assessZones(input, captures, completed).sort(
    (a, b) => b.score - a.score,
  );
  const signals = assessments.reduce(
    (sum, assessment) => sum + assessment.signals.length,
    0,
  );
  const basis = {
    completedFlights: completed.length,
    limited: completed.length < 3,
    signals,
  };

  const candidates = assessments.filter(
    (assessment) => assessment.score >= PROPOSE_MIN_SCORE,
  );
  const chosen = candidates
    .filter((assessment) => !assessment.scheduled)
    .slice(0, MAX_PROPOSED_ZONES);
  const opportunities = findOpportunities(
    input,
    captures,
    completed,
    assessments,
    chosen,
  );

  if (!chosen.length) {
    return {
      assessments,
      proposal: null,
      none: candidates.length
        ? "Las zonas que mostraron señales ya están en un vuelo de la agenda."
        : "Ninguna zona muestra señales que pidan un vuelo adicional con los datos de hoy.",
      opportunities,
      basis,
    };
  }

  const zones = site.zones.filter((zone) =>
    chosen.some((item) => item.zoneId === zone.id),
  );
  const plan = planMission({
    sector: site.sector,
    zones: zones.map((zone) => ({ id: zone.id, outline: zone.outline })),
  });
  const urgent = chosen.some((item) => item.level === "high");
  const names = chosen.map((item) => item.name);
  const reasons = chosen.map(
    (item) => `${item.name}: ${item.signals[0]?.text ?? ""}`,
  );
  const objective = reasons.join(" ").slice(0, 500);
  return {
    assessments,
    proposal: {
      zoneIds: chosen.map((item) => item.zoneId),
      title:
        names.length === 1
          ? `Seguimiento de ${names[0]}`
          : `Seguimiento de ${names[0]} y ${plural(names.length - 1, "zona más", "zonas más")}`,
      objective,
      reasons,
      date: addDays(today, urgent ? 2 : 5),
      time: "07:00",
      urgent,
      route: plan.route,
      distanceKm: plan.distanceKm,
      durationMin: plan.durationMin,
      photoCount: plan.photoCount,
      orderedHa: plan.orderedHa,
    },
    opportunities,
    basis,
  };
}
