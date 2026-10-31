import type { Evidence, Flight } from "../demo/types";
import {
  displayTitle,
  evidenceState,
  roleLabelOf,
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
  /** Who signed the current content, with the role as this document words it and when. */
  signers: { name: string; roleLabel: string; signedAt: string }[];
}

const joinNames = (parts: string[]) =>
  parts.length <= 1
    ? (parts[0] ?? "")
    : `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;

/**
 * One line for the list: who signed and when, and who is still missing, so nobody has to open the
 * document to know. Only signatures on the current content count; the date is the signature's own.
 */
export function signingSummary(
  row: Pick<SignedRecordRow, "signers" | "missing">,
): string {
  const parts: string[] = [];
  if (row.signers.length) {
    const latest = row.signers
      .map((signer) => signer.signedAt)
      .sort()
      .pop();
    const day = latest
      ? new Intl.DateTimeFormat("es-CO", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(latest))
      : "";
    parts.push(
      `Firmó ${joinNames(row.signers.map((signer) => `${signer.name} (${signer.roleLabel.replace(/\s*\(.*\)$/, "")})`))}${day ? ` · ${day}` : ""}`,
    );
  }
  if (row.missing.length) parts.push(`Falta: ${row.missing.join(", ")}`);
  return parts.join(" · ") || "Sin firmas";
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
    const hash = state.hash;
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
      signers: evidence.signatures
        .filter((signature) => signature.contentHash === hash)
        .map((signature) => ({
          name: signature.name,
          roleLabel: roleLabelOf(evidence, signature.role),
          signedAt: signature.signedAt,
        })),
    });
  }
  return rows.sort(
    (a, b) =>
      b.flightDate.localeCompare(a.flightDate) ||
      a.templateId.localeCompare(b.templateId),
  );
}
