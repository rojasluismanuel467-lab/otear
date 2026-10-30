"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { FilePenLine, FileText, PenLine } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import type { Flight, Site } from "@/features/demo/types";
import { EvidenceDialog } from "./evidence-dialog";
import { flightReportChanges } from "./flight-report-document";
import { evidenceState, statusLabels, type EvidenceStatus } from "./integrity";
import { roleLabel, templateFor, type TemplateId } from "./templates";
import styles from "./traceability.module.css";

const toneOf: Record<EvidenceStatus, string> = {
  draft: "neutral",
  partial: "warning",
  signed: "ok",
  altered: "danger",
  attached: "ok",
  requested: "info",
};

/**
 * Signing from the flight report: the report itself (operator and reviewer) and the delivery
 * record («Acta de entrega»), which had no way in from the screens. Both open the same dialog as
 * the pre-flight documents, with the same fingerprint and signatures.
 */
export function FlightReportSigning({
  site,
  flight,
  prefill,
}: {
  site: Site;
  flight: Flight;
  /** What the report shows now, so the signed text is what the person read. */
  prefill: Record<string, string>;
}) {
  const { evidences } = useDemo();
  const [open, setOpen] = useState<TemplateId | null>(null);
  const done = flight.status === "completed";

  const rows: {
    templateId: TemplateId;
    action: (exists: boolean, complete: boolean) => string;
    unavailable: string;
    pre?: Record<string, string>;
  }[] = [
    {
      templateId: "flight-report",
      action: (_exists, complete) =>
        complete ? "Ver el informe firmado" : "Firmar el informe del vuelo",
      unavailable: "Un vuelo sin entrega no tiene informe que firmar.",
      pre: prefill,
    },
    {
      templateId: "delivery-acceptance",
      action: (exists) =>
        exists ? "Abrir el acta de entrega" : "Redactar el acta de entrega",
      unavailable: "El acta se hace cuando el vuelo ya entregó.",
    },
  ];

  return (
    <section className={styles.section} aria-label="Firmas del informe">
      <h3>Firmar el informe</h3>
      <p className={styles.hint}>
        Cada documento queda con su huella y las firmas por rol. Si cambia el
        contenido después de firmar, las firmas dejan de valer. La firma de la
        demo no tiene valor legal.
      </p>
      <ul className={styles.signers}>
        {rows.map((row) => {
          const template = templateFor(row.templateId, site.sector);
          const evidence = evidences.find(
            (entry) =>
              entry.flightId === flight.id &&
              entry.templateId === row.templateId,
          );
          const state = evidence ? evidenceState(evidence) : undefined;
          const complete = state?.status === "signed";
          const changed =
            row.pre && evidence ? flightReportChanges(evidence, row.pre) : [];
          return (
            <li key={row.templateId}>
              <span className={styles.signerName}>
                <strong>{template.title}</strong>
                <span className={styles.chips}>
                  {state ? (
                    <span
                      className={styles.chip}
                      data-tone={toneOf[state.status]}
                    >
                      {statusLabels[state.status]}
                      {state.status === "partial" &&
                        ` · falta ${state.missingRoleLabels.join(", ")}`}
                    </span>
                  ) : (
                    <span className={styles.chip} data-tone="neutral">
                      Sin documento
                    </span>
                  )}
                  {changed.length > 0 && (
                    <span className={styles.chip} data-tone="warning">
                      El informe cambió desde que se guardó
                    </span>
                  )}
                </span>
                <small>
                  {done
                    ? `Firman: ${template.signers.map((signer) => roleLabel(template, signer.role)).join(" y ")}`
                    : row.unavailable}
                </small>
              </span>
              <Button
                variant={complete ? "ghost" : "secondary"}
                isDisabled={!done}
                onPress={() => setOpen(row.templateId)}
              >
                {complete ? (
                  <FileText size={16} aria-hidden="true" />
                ) : evidence ? (
                  <PenLine size={16} aria-hidden="true" />
                ) : (
                  <FilePenLine size={16} aria-hidden="true" />
                )}
                {row.action(Boolean(evidence), complete)}
              </Button>
            </li>
          );
        })}
      </ul>
      {rows.map((row) => (
        <EvidenceDialog
          key={row.templateId}
          isOpen={open === row.templateId}
          onOpenChange={(next) => setOpen(next ? row.templateId : null)}
          site={site}
          flight={flight}
          templateId={row.templateId}
          prefill={row.pre}
          onComplete={() => undefined}
        />
      ))}
    </section>
  );
}
