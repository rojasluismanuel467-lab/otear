import type { Evidence, EvidenceSignature } from "../demo/types";
import { sha256Hex } from "./sha256.ts";
import { templates, type TemplateId } from "./templates.ts";

export type EvidenceStatus =
  "draft" | "partial" | "signed" | "altered" | "attached" | "requested";

/** Exact text that is fingerprinted: the rendered document, or the file hash. */
export function contentOf(evidence: Evidence): string {
  if (evidence.kind === "attachment") return evidence.attachment?.hash ?? "";
  const template = evidence.templateId
    ? templates[evidence.templateId as TemplateId]
    : undefined;
  return `${evidence.title}\n${template ? template.render(evidence.fields) : ""}`;
}

export function contentHash(evidence: Evidence): string {
  return sha256Hex(contentOf(evidence));
}

export function requiredRoles(evidence: Evidence): string[] {
  const template = evidence.templateId
    ? templates[evidence.templateId as TemplateId]
    : undefined;
  return template
    ? template.signers.filter((s) => s.required).map((s) => s.role)
    : [];
}

export interface EvidenceState {
  status: EvidenceStatus;
  hash: string;
  validRoles: string[];
  missingRoles: string[];
  /** Signatures made on a version of the content that no longer matches. */
  staleSignatures: EvidenceSignature[];
}

export function evidenceState(evidence: Evidence): EvidenceState {
  const hash = contentHash(evidence);
  if (evidence.kind === "attachment") {
    return {
      status: evidence.attachment ? "attached" : "requested",
      hash,
      validRoles: [],
      missingRoles: [],
      staleSignatures: [],
    };
  }
  const valid = evidence.signatures.filter((s) => s.contentHash === hash);
  const stale = evidence.signatures.filter((s) => s.contentHash !== hash);
  const validRoles = [...new Set(valid.map((s) => s.role))];
  const missingRoles = requiredRoles(evidence).filter(
    (r) => !validRoles.includes(r),
  );
  let status: EvidenceStatus;
  if (stale.length && missingRoles.length) status = "altered";
  else if (!missingRoles.length && valid.length) status = "signed";
  else if (valid.length) status = "partial";
  else status = "draft";
  return { status, hash, validRoles, missingRoles, staleSignatures: stale };
}

export const statusLabels: Record<EvidenceStatus, string> = {
  draft: "Borrador",
  partial: "Faltan firmas",
  signed: "Firmado",
  altered: "Modificado tras firmar",
  attached: "Archivo adjunto",
  requested: "Solicitado",
};

export function isComplete(evidence: Evidence | undefined): boolean {
  if (!evidence) return false;
  const { status } = evidenceState(evidence);
  return status === "signed" || status === "attached";
}

/** Returns a copy with the fields changed and an event recording what happened to the signatures. */
export function withFields(
  evidence: Evidence,
  fields: Record<string, string>,
  now: string,
): Evidence {
  const before = evidenceState(evidence);
  const next: Evidence = { ...evidence, fields };
  const after = evidenceState(next);
  const events = [...evidence.events];
  if (after.hash !== before.hash) {
    const template = evidence.templateId
      ? templates[evidence.templateId as TemplateId]
      : undefined;
    const shown = (value: string | undefined) => {
      const text = (value ?? "").trim();
      if (!text) return "vacío";
      return `«${text.length > 60 ? `${text.slice(0, 57)}…` : text}»`;
    };
    const changes = Object.keys({ ...evidence.fields, ...fields })
      .filter((key) => (evidence.fields[key] ?? "") !== (fields[key] ?? ""))
      .map((key) => {
        const label = template?.fields.find((f) => f.key === key)?.label ?? key;
        return `${label}: ${shown(evidence.fields[key])} → ${shown(fields[key])}`;
      });
    events.push({
      at: now,
      text: changes.length
        ? `Se modificó el contenido del documento. ${changes.join("; ")}.`
        : "Se modificó el contenido del documento.",
    });
    if (before.validRoles.length) {
      events.push({
        at: now,
        text: `Las firmas anteriores (${before.validRoles.join(", ")}) quedaron sin validez porque el contenido cambió.`,
      });
    }
  }
  return { ...next, events };
}

export function withSignature(
  evidence: Evidence,
  signer: Omit<EvidenceSignature, "contentHash" | "signedAt">,
  now: string,
): Evidence {
  const hash = contentHash(evidence);
  const signature: EvidenceSignature = {
    ...signer,
    contentHash: hash,
    signedAt: now,
  };
  return {
    ...evidence,
    signatures: [
      // A new signature for the same role replaces the old one.
      ...evidence.signatures.filter((s) => s.role !== signer.role),
      signature,
    ],
    events: [
      ...evidence.events,
      {
        at: now,
        text: `Firmó ${signer.name} (${signer.role}) sobre la versión ${hash.slice(0, 12)}.`,
      },
    ],
  };
}

export function newEvidence(
  base: Pick<Evidence, "siteId" | "flightId" | "kind" | "title"> &
    Partial<Evidence>,
  now: string,
): Evidence {
  return {
    id: `evidence-${now}-${Math.random().toString(36).slice(2, 8)}`,
    fields: {},
    signatures: [],
    events: [
      {
        at: now,
        text:
          base.kind === "attachment"
            ? "Se registró la solicitud de un archivo."
            : "Se creó el documento desde la plantilla.",
      },
    ],
    ...base,
  };
}
