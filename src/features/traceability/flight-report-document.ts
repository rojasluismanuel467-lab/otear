import type { Evidence } from "../demo/types";
import { agree, type FindingWords } from "../flights/finding-words.ts";
import { templateFor } from "./templates.ts";

/**
 * The part of the signable flight report that comes from the flight's record. It has two parts with
 * two authors: what the operator declares (the log, the figures, the points they marked) and what
 * whoever contracts decides (corrective measures, who answers for them and by when, the review
 * notes). The report screen builds both from what it is showing, so what a person signs is what
 * they read, and the operator's signature can say which part it confirms.
 */
export interface FlightReportInput {
  /** The lines of «En breve» that are not about the client's corrective measures. */
  brief: string[];
  /** «En breve» lines about the client's corrective measures (see `splitBrief`). */
  clientBrief: string[];
  /** «Cómo fue el vuelo»: label and value. */
  logRows: [string, string][];
  debrief?: string;
  /** Heading for the findings, in the sector's word («NO CONFORMIDADES INCLUIDAS»). */
  findingsTitle: string;
  /** One block of text per included finding: what the operator marked. */
  findings: string[];
  /** One block per included finding, in the same order: status, trend, next step and measure. */
  reviews: string[];
  notes: string;
  technical: string[];
}

export function flightReportFields(
  input: FlightReportInput,
): Record<string, string> {
  const numbered = (blocks: string[]) =>
    blocks.map((block, index) => `${index + 1}. ${block}`).join("\n");
  return {
    summary: input.brief.map((line) => `- ${line}`).join("\n"),
    clientSummary: input.clientBrief.map((line) => `- ${line}`).join("\n"),
    log: input.logRows.map(([label, text]) => `${label}: ${text}`).join("\n"),
    debrief: input.debrief?.trim() ?? "",
    findingsTitle: input.findingsTitle.toUpperCase(),
    findings: numbered(input.findings),
    reviews: numbered(input.reviews),
    notes: input.notes.trim(),
    technical: input.technical.map((line) => `- ${line}`).join("\n"),
  };
}

/**
 * Splits the lines of «En breve»: the ones about corrective measures belong to whoever contracts
 * (they decide the measure, who answers and when), so they go to the client's part of the report
 * and not to the part the operator signs.
 */
export function splitBrief(brief: string[]): {
  operator: string[];
  client: string[];
} {
  const isMeasure = (line: string) => /\bmedidas? correctivas?\b/i.test(line);
  return {
    operator: brief.filter((line) => !isMeasure(line)),
    client: brief.filter(isMeasure),
  };
}

/**
 * Which parts of a saved report no longer match what the screen shows now, by their name in the
 * document. Empty when nothing changed (or nothing was saved yet).
 */
export function flightReportChanges(
  stored: Evidence | undefined,
  current: Record<string, string>,
): string[] {
  if (!stored || stored.kind !== "drafted") return [];
  const template = templateFor("flight-report", undefined);
  return Object.keys(current)
    .filter((key) => (stored.fields[key] ?? "") !== (current[key] ?? ""))
    .map((key) => template.fields.find((field) => field.key === key)?.label)
    .filter((label): label is string => Boolean(label));
}

/**
 * The report's sentences about its findings, in the company's word with the right gender and
 * number («No conformidades incluidas», «Observaciones incluidas», «Hallazgos incluidos»).
 * The heading is part of the signed text, so it must read right before it is fingerprinted.
 */
export function reportPhrases(words: FindingWords) {
  const included = agree(words, "incluidos", "incluidas");
  return {
    /** Heading above the list of included findings. */
    heading: `${words.Plural} ${included}`,
    /** Line when none were included. */
    none: `Sin ${words.plural} ${included}.`,
    /** Same, for the on-screen draft. */
    noneInDraft: `No hay ${words.plural} ${included} en este borrador.`,
    /** «Marque los hallazgos» / «Marque las no conformidades». */
    pick: `Marque ${agree(words, "los", "las")} ${words.plural} que quiere incluir.`,
    /** «Este vuelo no tiene hallazgos.» */
    noneInFlight: `Este vuelo no tiene ${words.plural}.`,
  };
}
