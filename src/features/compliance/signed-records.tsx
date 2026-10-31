"use client";

import { useState } from "react";
import { FileSignature } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDemo } from "@/features/demo/demo-context";
import { EvidenceDialog } from "@/features/traceability/evidence-dialog";
import type { EvidenceStatus } from "@/features/traceability/integrity";
import { formatDate } from "@/lib/format";
import {
  signedRecordRows,
  signingSummary,
  type SignedRecordRow,
} from "./signed-rows";
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
 * The reports and delivery records of the site's flights, in two groups (signed, and still missing
 * signatures) with who signed and who is missing on every row, so nobody has to open each one. It
 * opens the document itself to read, check a downloaded copy or sign what is missing.
 */
export function SignedRecords() {
  const { site, flights, evidences } = useDemo();
  const [open, setOpen] = useState<SignedRecordRow | null>(null);
  const rows = signedRecordRows(evidences, flights);
  const groups: { id: string; title: string; rows: SignedRecordRow[] }[] = [
    {
      id: "signed",
      title: "Firmados",
      rows: rows.filter((row) => row.status === "signed"),
    },
    {
      id: "missing",
      title: "Faltan firmas",
      rows: rows.filter((row) => row.status !== "signed"),
    },
  ];
  const flight = open
    ? flights.find((item) => item.id === open.flightId)
    : undefined;
  return (
    <section
      className={`surface ${styles.signedRecords}`}
      aria-labelledby="signed-records"
    >
      <h2 id="signed-records">Informes y actas</h2>
      <p className={styles.smallNote}>
        Lo que se redactó en la pestaña «Informe» de cada vuelo: los firmados y
        los que todavía esperan firmas. La firma es de ejemplo, no tiene valor
        legal y la demostración no verifica la identidad de quien firma.
      </p>
      {rows.length ? (
        groups
          .filter((group) => group.rows.length)
          .map((group) => (
            <div key={group.id}>
              <h3>
                {group.title} ({group.rows.length})
              </h3>
              <ol
                className={`${styles.documentList} ${styles.signedList}`}
                aria-label={`Informes y actas: ${group.title.toLowerCase()}`}
              >
                {group.rows.map((row, index) => (
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
                        <span className={styles.signedWho}>
                          {signingSummary(row)}
                        </span>
                        <small>Huella {row.hash}…</small>
                        <StatusBadge tone={tones[row.status]}>
                          {row.statusLabel}
                        </StatusBadge>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ))
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
