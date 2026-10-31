"use client";

import { useState } from "react";
import { FileSignature } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDemo } from "@/features/demo/demo-context";
import { EvidenceDialog } from "@/features/traceability/evidence-dialog";
import type { EvidenceStatus } from "@/features/traceability/integrity";
import { formatDate } from "@/lib/format";
import { signedRecordRows, type SignedRecordRow } from "./signed-rows";
import styles from "./compliance.module.css";

const tones: Record<
  EvidenceStatus,
  "success" | "warning" | "danger" | "info" | "neutral"
> = {
  draft: "neutral",
  partial: "warning",
  signed: "success",
  altered: "danger",
  attached: "success",
  requested: "info",
};

const iconStatus: Partial<Record<EvidenceStatus, string>> = {
  partial: "pending",
  draft: "missing",
  altered: "expired",
};

/**
 * The reports and delivery records signed in the app, listed with the supports of the same
 * operation: state of the signatures and fingerprint, and the document itself to read, check a
 * downloaded copy or sign what is missing.
 */
export function SignedRecords() {
  const { site, flights, evidences } = useDemo();
  const [open, setOpen] = useState<SignedRecordRow | null>(null);
  const rows = signedRecordRows(evidences, flights);
  const flight = open
    ? flights.find((item) => item.id === open.flightId)
    : undefined;
  return (
    <section className={styles.signedRecords} aria-labelledby="signed-records">
      <h3 id="signed-records">Informes y actas firmados</h3>
      <p className={styles.smallNote}>
        Lo que se firmó en la pestaña «Informe» de cada vuelo. La firma es de
        ejemplo y no tiene valor legal.
      </p>
      {rows.length ? (
        <ol className={styles.documentList} aria-label="Informes y actas">
          {rows.map((row, index) => (
            <li
              key={row.evidenceId}
              style={{ "--i": index } as React.CSSProperties}
            >
              <button
                type="button"
                className={styles.documentRow}
                data-status={iconStatus[row.status]}
                aria-haspopup="dialog"
                onClick={() => setOpen(row)}
              >
                <span className={styles.fileIcon}>
                  <FileSignature size={20} aria-hidden="true" />
                </span>
                <span className={styles.rowBody}>
                  <strong>{row.title}</strong>
                  <span>
                    {row.flightTitle} · {formatDate(row.flightDate)}
                  </span>
                  <small>
                    Huella {row.hash}…
                    {row.missing.length
                      ? ` · falta ${row.missing.join(", ")}`
                      : ""}
                  </small>
                  <StatusBadge tone={tones[row.status]}>
                    {row.statusLabel}
                  </StatusBadge>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.smallNote}>
          Todavía no hay informes ni actas guardados en esta sesión. Se crean
          desde «Informe» en Vuelos.
        </p>
      )}
      {open && flight && (
        <EvidenceDialog
          isOpen
          onOpenChange={(next) => {
            if (!next) setOpen(null);
          }}
          site={site}
          flight={flight}
          templateId={open.templateId}
          onComplete={() => undefined}
        />
      )}
    </section>
  );
}
