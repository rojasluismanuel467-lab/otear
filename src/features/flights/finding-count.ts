import type { Finding } from "../demo/types";
import { countOf, type FindingWords } from "./finding-words.ts";

/**
 * The one way to count what a flight «has» on any screen. The same flight used to read 6 in
 * Evolución, 5 in Vuelos and 3 in Informes because each screen counted something different; they
 * are three kinds of point and every screen says which it counts:
 *
 * - `operator`: findings the operator reported (or that a person confirmed from a suggestion),
 *   not discarded;
 * - `suggested`: candidates from the image assistant that nobody has reviewed yet (not findings
 *   until a person confirms them);
 * - `calculated`: alerts Otear works out by comparing flights (falling vigor, delay…); they only
 *   exist where the flights are compared, so the caller passes how many it found.
 */
export interface PointCount {
  operator: number;
  suggested: number;
  calculated: number;
  /** Discarded by a person; listed in Vuelos but never counted as a finding. */
  dismissed: number;
  /** `operator + suggested`: what the findings list of the flight shows, apart from discarded. */
  findings: number;
  /** `findings + calculated`: everything the Evolución list shows. */
  points: number;
  /** Every row of the findings list, discarded included. */
  listed: number;
}

/** Counts the findings of ONE flight (the caller filters by flight) plus the calculated alerts. */
export function countPoints(findings: Finding[], calculated = 0): PointCount {
  let operator = 0;
  let suggested = 0;
  let dismissed = 0;
  for (const finding of findings) {
    if (finding.status === "dismissed") dismissed += 1;
    else if (finding.suggestion !== undefined && finding.status === "pending")
      suggested += 1;
    else operator += 1;
  }
  return {
    operator,
    suggested,
    calculated,
    dismissed,
    findings: operator + suggested,
    points: operator + suggested + calculated,
    listed: operator + suggested + dismissed,
  };
}

const times = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/**
 * «5 hallazgos (3 del operador y 2 sugerencias sin revisar) y 1 alerta calculada». The breakdown
 * appears only when a number could be read two ways, so a plain count stays plain.
 */
export function pointsText(
  count: PointCount,
  words: FindingWords,
  options: { withCalculated?: boolean } = {},
): string {
  const calculated = options.withCalculated === false ? 0 : count.calculated;
  const alert = calculated
    ? times(calculated, "alerta calculada", "alertas calculadas")
    : "";
  if (!count.findings) {
    return alert || `Sin ${words.plural}`;
  }
  const base = countOf(words, count.findings);
  const suggestions = times(
    count.suggested,
    "sugerencia sin revisar",
    "sugerencias sin revisar",
  );
  const detail = count.suggested
    ? count.operator
      ? ` (${count.operator} del operador y ${suggestions})`
      : ` (${suggestions})`
    : "";
  return `${base}${detail}${alert ? ` y ${alert}` : ""}`;
}
