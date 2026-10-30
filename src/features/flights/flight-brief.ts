import type { Finding, Flight, FlightLog, Site } from "../demo/types";
import { isSuggested } from "../agents/image-candidates.ts";
import {
  buildCaptures,
  indicatorFor,
  stalledZones,
  sustainedDeclines,
} from "../evolution/evolution.ts";
import { agree, countOf, type FindingWords } from "./finding-words.ts";
import { summarizeFollowUps } from "./follow-up.ts";

/**
 * What a flight's screens say about it, worked out once so the map, the facts, the report and the
 * itinerary agree: what the operator declared in the log, how many findings there are and of
 * which kind, and the few lines that tell an administrator what matters.
 */

export const weatherLabels = {
  clear: "Despejado",
  cloudy: "Nublado",
  rain: "Lluvia",
} as const;

const number = (value: number, digits = 1) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(
    value,
  );

/** Weather and authorization as the operator wrote them in the flight log. */
export function loggedConditions(log: FlightLog | undefined) {
  return {
    weather: log
      ? `${weatherLabels[log.weather]} · viento ${number(log.windKmh, 0)} km/h`
      : "Sin bitácora del operador",
    authorization: log
      ? log.authorizationRef || "Sin referencia en la bitácora"
      : "Sin bitácora del operador",
  };
}

export interface FindingCounts {
  total: number;
  /** Proposed by an assistant and still waiting for a person. */
  suggestedPending: number;
  /** Reported by the operator or by an assistant, and not decided yet. */
  toVerify: number;
  confirmed: number;
  dismissed: number;
}

/**
 * One way to count a flight's findings. A suggestion nobody has reviewed is not a finding yet, so
 * it is counted apart and never added to the ones a person has to decide.
 */
export function findingCounts(findings: Finding[]): FindingCounts {
  const suggestedPending = findings.filter(
    (item) => isSuggested(item) && item.status === "pending",
  ).length;
  const pending = findings.filter((item) => item.status === "pending").length;
  return {
    total: findings.length,
    suggestedPending,
    toVerify: pending - suggestedPending,
    confirmed: findings.filter((item) => item.status === "confirmed").length,
    dismissed: findings.filter((item) => item.status === "dismissed").length,
  };
}

/** «3 del operador por verificar · 2 sugerencias sin revisar». */
export function countsText(counts: FindingCounts, words: FindingWords): string {
  if (!counts.total) return agree(words, "Ninguno", "Ninguna");
  const parts: string[] = [];
  const decided = counts.confirmed + counts.dismissed;
  if (counts.toVerify) {
    parts.push(`${countOf(words, counts.toVerify)} por verificar`);
  }
  if (counts.suggestedPending) {
    parts.push(
      `${counts.suggestedPending} ${counts.suggestedPending === 1 ? "sugerencia automática sin revisar" : "sugerencias automáticas sin revisar"}`,
    );
  }
  if (decided) {
    parts.push(
      `${decided} ${decided === 1 ? agree(words, "revisado", "revisada") : agree(words, "revisados", "revisadas")}`,
    );
  }
  return parts.join(" · ");
}

export interface BriefInput {
  site: Site;
  flight: Flight;
  /** Every flight of the site: the trend is read up to this flight only. */
  flights: Flight[];
  findings: Finding[];
  /** Hectares asked for in the zones of the flight; 0 or missing when they are lines. */
  orderedHa?: number;
  words: FindingWords;
  /** The day corrective measures are read against; the demo's day by default. */
  today?: string;
}

const COVERAGE_TOLERANCE = 0.05;

function listNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} y ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

/**
 * The lines that open a flight's report, written for someone who was not there: where the trend is
 * going, what the operator says was left uncovered, and what is waiting for a decision. Every line
 * comes from the flight's own data; none is a diagnosis.
 */
export function flightBrief(input: BriefInput): string[] {
  const { site, flight, flights, words } = input;
  if (flight.status !== "completed") {
    return [
      flight.status === "scheduled"
        ? "Vuelo programado: todavía no hay entrega, fotos ni resultados."
        : "Vuelo cancelado: no hay entrega.",
    ];
  }
  const lines: string[] = [];
  const findings = input.findings.filter((item) => item.flightId === flight.id);

  const upToHere = flights.filter(
    (item) => item.status === "completed" && item.date <= flight.date,
  );
  const captures = buildCaptures(site, upToHere, input.findings);
  const indicator = indicatorFor(site.sector);
  const nameOf = (ids: string[]) =>
    listNames(
      ids
        .map((id) => site.zones.find((zone) => zone.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    );
  const zoneIds = flight.zoneIds;
  if (indicator.kind === "vigor") {
    const falling = sustainedDeclines(captures, zoneIds);
    if (falling.length) {
      lines.push(
        `${nameOf(falling)}: el vigor del cultivo bajó en cada uno de los dos últimos vuelos.`,
      );
    }
  } else if (indicator.kind === "progress") {
    const slow = stalledZones(captures, zoneIds);
    if (slow.length) {
      lines.push(
        `${nameOf(slow)}: el avance casi no cambió en los dos últimos vuelos.`,
      );
    }
  }

  const ordered = input.orderedHa ?? 0;
  const covered = flight.log?.coveredHa;
  if (covered !== undefined && ordered > 0) {
    lines.push(
      covered < ordered * (1 - COVERAGE_TOLERANCE)
        ? `El operador declaró ${number(covered)} de ${number(ordered)} ha pedidas: quedaron ${number(ordered - covered)} ha sin cubrir.`
        : `El operador declaró haber cubierto ${number(covered)} de ${number(ordered)} ha pedidas.`,
    );
  }

  const counts = findingCounts(findings);
  if (counts.toVerify) {
    lines.push(`${countOf(words, counts.toVerify)} por verificar en campo.`);
  }
  if (counts.suggestedPending) {
    lines.push(
      `${counts.suggestedPending} ${counts.suggestedPending === 1 ? "sugerencia automática" : "sugerencias automáticas"} sin revisar: ${counts.suggestedPending === 1 ? "no cuenta" : "no cuentan"} como ${words.singular} hasta que una persona ${counts.suggestedPending === 1 ? "la confirme" : "las confirme"}.`,
    );
  }
  const measures = summarizeFollowUps(input.findings, input.today);
  if (measures.overdue) {
    lines.push(
      `${measures.overdue === 1 ? "Hay 1 medida correctiva vencida" : `Hay ${measures.overdue} medidas correctivas vencidas`} en el sitio: su plazo ya pasó y no está cerrada.`,
    );
  }
  if (!lines.length) {
    lines.push(
      counts.total
        ? `Todos los puntos de este vuelo ya fueron revisados.`
        : `Sin ${words.plural} ni diferencias que destacar en este vuelo.`,
    );
  }
  return lines;
}
