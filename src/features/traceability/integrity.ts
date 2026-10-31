import type { Evidence, EvidenceEvent, EvidenceSignature } from "../demo/types";
import { sha256Hex } from "./sha256.ts";
import { matchPerson, type PersonMatch } from "./signers.ts";
import {
  roleLabel,
  sectorOf,
  templateFor,
  type TemplateDef,
  type TemplateId,
} from "./templates.ts";

export type EvidenceStatus =
  "draft" | "partial" | "signed" | "altered" | "attached" | "requested";

/** The template a document was made from, worded for the sector it was made for. */
export function templateOf(evidence: Evidence): TemplateDef | undefined {
  return evidence.templateId
    ? templateFor(evidence.templateId as TemplateId, sectorOf(evidence.fields))
    : undefined;
}

/** The title shown and fingerprinted: a templated document takes it from its template, in its sector's words. */
export function displayTitle(evidence: Evidence): string {
  return templateOf(evidence)?.title ?? evidence.title;
}

/** A stored role as it reads in this document («Propietario o administrador» is «Titular o administrador de la vía» on a road). */
export function roleLabelOf(evidence: Evidence, role: string): string {
  const template = templateOf(evidence);
  return template ? roleLabel(template, role) : role;
}

/** Exact text that is fingerprinted: the rendered document, or the file hash. */
export function contentOf(evidence: Evidence): string {
  if (evidence.kind === "attachment") return evidence.attachment?.hash ?? "";
  const template = templateOf(evidence);
  return `${displayTitle(evidence)}\n${template ? template.render(evidence.fields) : ""}`;
}

export function contentHash(evidence: Evidence): string {
  return sha256Hex(contentOf(evidence));
}

export function requiredRoles(evidence: Evidence): string[] {
  const template = templateOf(evidence);
  return template
    ? template.signers.filter((s) => s.required).map((s) => s.role)
    : [];
}

export interface EvidenceState {
  status: EvidenceStatus;
  hash: string;
  validRoles: string[];
  missingRoles: string[];
  /** The same roles as they read in this document, for screens and exports. */
  validRoleLabels: string[];
  missingRoleLabels: string[];
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
      validRoleLabels: [],
      missingRoleLabels: [],
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
  return {
    status,
    hash,
    validRoles,
    missingRoles,
    validRoleLabels: validRoles.map((r) => roleLabelOf(evidence, r)),
    missingRoleLabels: missingRoles.map((r) => roleLabelOf(evidence, r)),
    staleSignatures: stale,
  };
}

export const statusLabels: Record<EvidenceStatus, string> = {
  draft: "Borrador",
  partial: "Faltan firmas",
  signed: "Firmado",
  altered: "Modificado tras firmar",
  attached: "Archivo adjunto",
  requested: "Solicitado",
};

/**
 * A history line. `by` is who made the change; the demo has no sign-in, so it is the demo profile
 * (see `demo-profile.ts`), and lines written without it (the examples) say that no author was kept.
 * `EvidenceEvent` in `demo/types.ts` has no `by` field yet: it travels as an extra property.
 */
export type AuthoredEvent = EvidenceEvent & { by?: string };

export function eventOf(at: string, text: string, by?: string): EvidenceEvent {
  const event: AuthoredEvent = by ? { at, text, by } : { at, text };
  return event;
}

/** Who made a change, when the history line kept it. */
export function eventAuthor(event: EvidenceEvent): string | undefined {
  const by = (event as AuthoredEvent).by;
  return typeof by === "string" && by ? by : undefined;
}

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
  by?: string,
): Evidence {
  const before = evidenceState(evidence);
  const next: Evidence = { ...evidence, fields };
  const after = evidenceState(next);
  const events = [...evidence.events];
  if (after.hash !== before.hash) {
    const template = templateOf(next);
    const shown = (value: string | undefined) => {
      const text = (value ?? "").trim().replace(/\s*\n\s*/g, " / ");
      if (!text) return "vacío";
      return `«${text.length > 60 ? `${text.slice(0, 57)}…` : text}»`;
    };
    const changes = Object.keys({ ...evidence.fields, ...fields })
      .filter((key) => (evidence.fields[key] ?? "") !== (fields[key] ?? ""))
      .map((key) => {
        const label = template?.fields.find((f) => f.key === key)?.label ?? key;
        return `${label}: ${shown(evidence.fields[key])} → ${shown(fields[key])}`;
      });
    events.push(
      eventOf(
        now,
        changes.length
          ? `Se modificó el contenido del documento. ${changes.join("; ")}.`
          : "Se modificó el contenido del documento.",
        by,
      ),
    );
    if (before.validRoles.length) {
      events.push(
        eventOf(
          now,
          `Las firmas anteriores (${before.validRoleLabels.join(", ")}) quedaron sin validez porque el contenido cambió.`,
          by,
        ),
      );
    }
  }
  return { ...next, events };
}

export function withSignature(
  evidence: Evidence,
  signer: Omit<EvidenceSignature, "contentHash" | "signedAt">,
  now: string,
  by?: string,
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
      eventOf(
        now,
        `Firmó ${signer.name} (${roleLabelOf(evidence, signer.role)}) sobre la versión ${hash.slice(0, 12)}.`,
        by,
      ),
    ],
  };
}

/** True when two signers are, as far as the form can tell, the same person (same document number or same name). */
export function samePerson(
  a: { name: string; documentId: string },
  b: { name: string; documentId: string },
): boolean {
  return matchPerson(a, b) !== null;
}

/** Said wherever the rule appears: the demo compares what was typed, it does not check anyone. */
export const NO_IDENTITY_CHECK =
  "En la demostración no hay verificación de identidad real: solo se compara lo que se escribe (nombre y número de documento).";

/**
 * Some documents need a different person for each role (the operator cannot also be the reviewer of
 * their own report). Returns the reason a signature must be refused, or null when it can go ahead.
 * The name is compared without accents, case or word order, and the document number without dots;
 * the form cannot prove who someone is.
 */
export function signingConflict(
  evidence: Evidence,
  role: string,
  signer: { name: string; documentId: string },
): string | null {
  if (!templateOf(evidence)?.separateRoles) return null;
  let found: { signature: EvidenceSignature; match: PersonMatch } | undefined;
  for (const signature of evidence.signatures) {
    if (signature.role === role) continue;
    const match = matchPerson(signature, signer);
    if (match && (!found || match === "document")) found = { signature, match };
  }
  if (!found) return null;
  const earlier = roleLabelOf(evidence, found.signature.role);
  const next = roleLabelOf(evidence, role);
  const why =
    found.match === "document"
      ? `El documento ${signer.documentId.trim()} ya firmó como ${earlier} (${found.signature.name.trim()}).`
      : `El nombre «${signer.name.trim()}» coincide con el de ${found.signature.name.trim()}, que ya firmó como ${earlier}, aunque el número de documento sea otro.`;
  return `${why} En este documento cada rol lo firma una persona distinta; pida a otra persona que firme como ${next}. ${NO_IDENTITY_CHECK}`;
}

export function newEvidence(
  base: Pick<Evidence, "siteId" | "flightId" | "kind" | "title"> &
    Partial<Evidence>,
  now: string,
  by?: string,
): Evidence {
  return {
    id: `evidence-${now}-${Math.random().toString(36).slice(2, 8)}`,
    fields: {},
    signatures: [],
    events: [
      eventOf(
        now,
        base.kind === "attachment"
          ? "Se registró la solicitud de un archivo."
          : "Se creó el documento desde la plantilla.",
        by,
      ),
    ],
    ...base,
  };
}
