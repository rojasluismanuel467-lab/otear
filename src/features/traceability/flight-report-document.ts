import type { Evidence } from "../demo/types";
import { agree, type FindingWords } from "../flights/finding-words.ts";
import { templateFor } from "./templates.ts";

/**
 * The part of the signable flight report that comes from the flight's record: the brief, the log
 * the operator wrote, the findings that were included and the notes. The report screen builds it
 * from what it is showing, so what a person signs is what they read.
 */
export interface FlightReportInput {
  /** The lines of «En breve». */
  brief: string[];
  /** «Cómo fue el vuelo»: label and value. */
  logRows: [string, string][];
  debrief?: string;
  /** Heading for the findings, in the sector's word («NO CONFORMIDADES INCLUIDAS»). */
  findingsTitle: string;
  /** One block of text per included finding. */
  findings: string[];
  notes: string;
  technical: string[];
}

export function flightReportFields(
  input: FlightReportInput,
): Record<string, string> {
  return {
    summary: input.brief.map((line) => `- ${line}`).join("\n"),
    log: input.logRows.map(([label, text]) => `${label}: ${text}`).join("\n"),
    debrief: input.debrief?.trim() ?? "",
    findingsTitle: input.findingsTitle.toUpperCase(),
    findings: input.findings
      .map((block, index) => `${index + 1}. ${block}`)
      .join("\n"),
    notes: input.notes.trim(),
    technical: input.technical.map((line) => `- ${line}`).join("\n"),
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
