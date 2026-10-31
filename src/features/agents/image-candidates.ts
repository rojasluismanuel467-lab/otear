import type { Finding, FindingSuggestion, Flight } from "../demo/types";
import { compareWithHistory } from "../reports/insights.ts";
import {
  defaultFindingWords,
  type FindingWords,
} from "../flights/finding-words.ts";

/**
 * Helpers for the findings that the image assistant proposes. In the demo the candidates are
 * seeded examples; the rules here are what the product would keep when a real model produces them:
 * a candidate is not a finding until a person confirms it, it says what it cannot know, and its
 * track record (how many were confirmed) is shown so trust is earned with results.
 */

export type Suggested = Finding & { suggestion: FindingSuggestion };

export function isSuggested(finding: Finding): finding is Suggested {
  return finding.suggestion !== undefined;
}

export const confidenceLabels = {
  high: "Confianza alta",
  medium: "Confianza media",
  low: "Confianza baja",
} as const;

/**
 * The seeded operator line starts with the sector's default word for a finding (roads: «No
 * conformidad del operador · ejemplo»); this is that start, so the company's word can replace it.
 */
const SEEDED_SOURCE =
  /^(?:Hallazgo|No conformidad|Observación|Novedad de talud|Novedad de campo|Novedad) del operador/;

/**
 * The source line of a finding, which follows the suggestion through its review. The seeded
 * operator line starts with a fixed word; when the company has its own word for a finding, that
 * first word is replaced so the same thing is not called two names on one screen.
 */
export function sourceLabel(finding: Finding, words?: FindingWords): string {
  if (!isSuggested(finding)) {
    const seeded = SEEDED_SOURCE.exec(finding.source);
    return words && seeded
      ? `${words.Singular} del operador${finding.source.slice(seeded[0].length)}`
      : finding.source;
  }
  if (finding.status === "confirmed") {
    return "Sugerencia automática · confirmada por una persona (ejemplo)";
  }
  if (finding.status === "dismissed") {
    return "Sugerencia automática · descartada por una persona (ejemplo)";
  }
  return "Sugerencia automática · sin revisar (ejemplo)";
}

export interface SuggestionStats {
  suggested: number;
  pending: number;
  confirmed: number;
  dismissed: number;
  /** Confirmed or dismissed by a person. */
  reviewed: number;
  /** Share of reviewed suggestions that were confirmed, in percent; null if none reviewed. */
  confirmedPct: number | null;
  /** Too few reviews to read as a measure of accuracy. */
  small: boolean;
}

export const SMALL_SAMPLE = 5;

export function suggestionStats(findings: Finding[]): SuggestionStats {
  const suggested = findings.filter(isSuggested);
  const confirmed = suggested.filter((item) => item.status === "confirmed");
  const dismissed = suggested.filter((item) => item.status === "dismissed");
  const reviewed = confirmed.length + dismissed.length;
  return {
    suggested: suggested.length,
    pending: suggested.length - reviewed,
    confirmed: confirmed.length,
    dismissed: dismissed.length,
    reviewed,
    confirmedPct: reviewed ? (confirmed.length / reviewed) * 100 : null,
    small: reviewed < SMALL_SAMPLE,
  };
}

export type ReviewFilter = "all" | "suggested" | "operator";

export function filterFindings(findings: Finding[], filter: ReviewFilter) {
  if (filter === "suggested") return findings.filter(isSuggested);
  if (filter === "operator") {
    return findings.filter((finding) => !isSuggested(finding));
  }
  return findings;
}

const priorityRank = { high: 0, medium: 1, low: 2 } as const;
const confidenceRank = { high: 0, medium: 1, low: 2 } as const;

/** Suggestions still to review, the most important first: priority, then how sure the assistant is. */
export function reviewQueue(findings: Finding[]): Suggested[] {
  return findings
    .filter(isSuggested)
    .filter((item) => item.status === "pending")
    .sort(
      (a, b) =>
        priorityRank[a.priority] - priorityRank[b.priority] ||
        confidenceRank[a.suggestion.confidence] -
          confidenceRank[b.suggestion.confidence],
    );
}

/** The photos where it shows, as 1-based numbers in the flight's sequence. */
export function photoRange(
  suggestion: FindingSuggestion,
  photoCount: number,
): [number, number] | null {
  if (photoCount <= 0) return null;
  const at = (fraction: number) =>
    Math.min(photoCount, Math.max(1, Math.round(fraction * photoCount)));
  const from = at(Math.min(...suggestion.photoSpan));
  const to = at(Math.max(...suggestion.photoSpan));
  return [from, Math.max(from, to)];
}

export function photoRangeText(
  suggestion: FindingSuggestion,
  photoCount: number,
): string {
  const range = photoRange(suggestion, photoCount);
  if (!range) return "";
  return range[0] === range[1]
    ? `Foto ${range[0]} de ${photoCount}`
    : `Fotos ${range[0]} a ${range[1]} de ${photoCount}`;
}

/** What to do before acting on it, when the candidate is weak or the stakes are high. */
export function caution(
  finding: Suggested,
  words: FindingWords = defaultFindingWords,
): string | null {
  const { confidence } = finding.suggestion;
  if (confidence === "low" && finding.priority === "high") {
    return "Prioridad alta con confianza baja: verifíquelo en sitio antes de decidir.";
  }
  if (confidence === "low") {
    return `Confianza baja: trátelo como una pista, no como ${words.a} ${words.singular}.`;
  }
  return null;
}

/** Whether the same kind of observation was already reported in this zone in earlier flights. */
export function historyNote(
  finding: Suggested,
  findings: Finding[],
  flights: Flight[],
): string | null {
  const { trend, earlierFlights } = compareWithHistory(
    finding,
    findings,
    flights,
  );
  if (trend !== "persistent") return null;
  return `Algo igual ya se había reportado en esta zona en ${earlierFlights} ${earlierFlights === 1 ? "vuelo anterior" : "vuelos anteriores"}.`;
}
