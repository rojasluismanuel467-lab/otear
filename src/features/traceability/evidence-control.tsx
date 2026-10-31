"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { FilePenLine, FileText } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import type { Flight, Site } from "@/features/demo/types";
import { EvidenceDialog } from "./evidence-dialog";
import { evidenceState, statusLabels, type EvidenceStatus } from "./integrity";
import { requirementFor } from "./requirements";
import type { TemplateId } from "./templates";
import styles from "./traceability.module.css";

const toneOf: Record<EvidenceStatus, string> = {
  draft: "neutral",
  partial: "warning",
  signed: "ok",
  altered: "danger",
  attached: "ok",
  requested: "info",
};

export function EvidenceControl({
  item,
  flight,
  site,
  checked,
  onComplete,
}: {
  item: string;
  flight: Flight;
  site: Site;
  checked: boolean;
  onComplete: (templateId: TemplateId) => void;
}) {
  const { evidences, documents } = useDemo();
  const [open, setOpen] = useState(false);
  const requirement = requirementFor(item);
  if (!requirement) return null;

  if (requirement.kind === "route") {
    const ok = flight.route.length >= 2;
    return (
      <p className={styles.chips}>
        <span className={styles.chip} data-tone={ok ? "ok" : "danger"}>
          {ok ? `Ruta con ${flight.route.length} puntos` : "Falta la ruta"}
        </span>
      </p>
    );
  }
  if (requirement.kind === "log") {
    return (
      <p className={styles.chips}>
        <span className={styles.chip} data-tone={flight.log ? "ok" : "warning"}>
          {flight.log ? "Bitácora registrada" : "Sin bitácora todavía"}
        </span>
      </p>
    );
  }
  if (requirement.kind === "documents") {
    const reviewed = documents.filter(
      (doc) => doc.status === "reviewed",
    ).length;
    const ok = reviewed === documents.length && documents.length > 0;
    return (
      <p className={styles.chips}>
        <span className={styles.chip} data-tone={ok ? "ok" : "warning"}>
          Soportes en orden: {reviewed} de {documents.length}
        </span>
        <Link className={styles.chipLink} href="/documentos">
          Ver documentos
        </Link>
      </p>
    );
  }

  const evidence = evidences.find(
    (entry) =>
      entry.flightId === flight.id &&
      entry.templateId === requirement.templateId,
  );
  const state = evidence ? evidenceState(evidence) : undefined;
  const complete = state?.status === "signed" || state?.status === "attached";
  return (
    <>
      <p className={styles.chips}>
        {state ? (
          <span className={styles.chip} data-tone={toneOf[state.status]}>
            {statusLabels[state.status]}
            {state.status === "partial" &&
              ` · falta ${state.missingRoleLabels.join(", ")}`}
          </span>
        ) : (
          <span
            className={styles.chip}
            data-tone={checked ? "warning" : "neutral"}
          >
            {checked ? "Marcado sin soporte" : "Sin documento"}
          </span>
        )}
        {checked && !complete && state && (
          <span className={styles.chip} data-tone="warning">
            Sin soporte completo
          </span>
        )}
        <Button variant="ghost" size="sm" onPress={() => setOpen(true)}>
          {evidence ? (
            <FileText size={15} aria-hidden="true" />
          ) : (
            <FilePenLine size={15} aria-hidden="true" />
          )}
          {evidence ? "Abrir documento" : "Redactar o adjuntar"}
        </Button>
      </p>
      <EvidenceDialog
        isOpen={open}
        onOpenChange={setOpen}
        site={site}
        flight={flight}
        templateId={requirement.templateId}
        onComplete={onComplete}
      />
    </>
  );
}
