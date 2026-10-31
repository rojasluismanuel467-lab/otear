import type { Evidence, Flight } from "../demo/types";
import {
  displayTitle,
  evidenceState,
  statusLabels,
  type EvidenceStatus,
} from "../traceability/integrity.ts";
import type { TemplateId } from "../traceability/templates.ts";

/** The signable records a flight leaves behind, kept in one place beside the supports. */
export const SIGNED_TEMPLATES: TemplateId[] = [
  "flight-report",
  "delivery-acceptance",
];

export interface SignedRecordRow {
  evidenceId: string;
  flightId: string;
  templateId: TemplateId;
  title: string;
  flightTitle: string;
  flightDate: string;
  status: EvidenceStatus;
  statusLabel: string;
  /** What is still missing, in the document's words («Revisor o interventor»). */
  missing: string[];
  /** First characters of the fingerprint, as the dialog shows it. */
  hash: string;
}

/**
 * Reports and delivery records of the site's flights with their signing state, newest flight
 * first. Nothing is added to the supports list: these are the documents signed in the app.
 */
export function signedRecordRows(
  evidences: Evidence[],
  flights: Flight[],
): SignedRecordRow[] {
  const rows: SignedRecordRow[] = [];
  for (const evidence of evidences) {
    if (evidence.kind !== "drafted") continue;
    const templateId = SIGNED_TEMPLATES.find(
      (id) => id === evidence.templateId,
    );
    const flight = flights.find((item) => item.id === evidence.flightId);
    if (!templateId || !flight) continue;
    const state = evidenceState(evidence);
    rows.push({
      evidenceId: evidence.id,
      flightId: flight.id,
      templateId,
      title: displayTitle(evidence),
      flightTitle: flight.title,
      flightDate: flight.date,
      status: state.status,
      statusLabel: statusLabels[state.status],
      missing: state.missingRoleLabels,
      hash: state.hash.slice(0, 16),
    });
  }
  return rows.sort(
    (a, b) =>
      b.flightDate.localeCompare(a.flightDate) ||
      a.templateId.localeCompare(b.templateId),
  );
}
