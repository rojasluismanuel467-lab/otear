import type { Evidence } from "../demo/types";
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
