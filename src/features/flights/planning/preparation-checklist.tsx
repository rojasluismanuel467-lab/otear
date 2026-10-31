"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import type { Flight } from "@/features/demo/types";
import { EvidenceControl } from "@/features/traceability/evidence-control";
import {
  lacksSupport,
  requirementFor,
} from "@/features/traceability/requirements";
import {
  placeWordsFor,
  type TemplateId,
} from "@/features/traceability/templates";
import { preparationGroups, preparationTotal } from "./preparation-items";
import styles from "./preparation-checklist.module.css";

export function PreparationChecklist({
  flight,
  onChange,
}: {
  flight: Flight;
  onChange: (next: string[]) => void;
}) {
  const { site, evidences, documents } = useDemo();
  const checklist = flight.checklist;
  const documentsInOrder =
    documents.length > 0 && documents.every((doc) => doc.status === "reviewed");
  const withoutSupport = preparationGroups
    .flatMap((group) => group.items)
    .filter(
      (item) =>
        checklist.includes(item) &&
        lacksSupport(item, flight, evidences, documentsInOrder),
    ).length;

  /** A finished document ticks every item it supports. */
  function handleEvidenceComplete(templateId: TemplateId) {
    const covered = preparationGroups
      .flatMap((group) => group.items)
      .filter((item) => {
        const requirement = requirementFor(item);
        return (
          requirement?.kind === "template" &&
          requirement.templateId === templateId
        );
      });
    onChange([...new Set([...checklist, ...covered])]);
  }

  const done = preparationGroups.reduce(
    (total, group) =>
      total + group.items.filter((item) => checklist.includes(item)).length,
    0,
  );
  const [openIds, setOpenIds] = useState<string[]>(() => {
    const firstPending = preparationGroups.find((group) =>
      group.items.some((item) => !checklist.includes(item)),
    );
    return firstPending ? [firstPending.id] : [];
  });

  function toggleItem(item: string) {
    onChange(
      checklist.includes(item)
        ? checklist.filter((value) => value !== item)
        : [...checklist, item],
    );
  }

  return (
    <div className={styles.checklist}>
      <div className={styles.heading}>
        <h3>Preparación</h3>
        <span>
          {done} de {preparationTotal} marcados
          {withoutSupport > 0 && ` · ${withoutSupport} sin documento`}
        </span>
      </div>
      <div
        className={styles.progress}
        role="presentation"
        style={{ "--progress": done / preparationTotal } as React.CSSProperties}
      />
      <p className={styles.help}>
        Lista orientativa basada en prácticas públicas. No certifica aptitud ni
        autorización; confirme los requisitos vigentes con la Aerocivil. Marcar
        un ítem sin documento es válido en esta demo; qué documentos pide cada
        cliente lo decide usted.
      </p>
      <div className={styles.groups}>
        {preparationGroups.map((group) => {
          const groupDone = group.items.filter((item) =>
            checklist.includes(item),
          ).length;
          const isOpen = openIds.includes(group.id);
          return (
            <section className={styles.group} key={group.id}>
              <button
                type="button"
                className={styles.groupToggle}
                aria-expanded={isOpen}
                aria-controls={`prep-${group.id}`}
                onClick={() =>
                  setOpenIds((current) =>
                    isOpen
                      ? current.filter((id) => id !== group.id)
                      : [...current, group.id],
                  )
                }
              >
                <strong>{group.title}</strong>
                <span
                  className={
                    groupDone === group.items.length ? styles.complete : ""
                  }
                >
                  {groupDone} de {group.items.length}
                </span>
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              <div
                id={`prep-${group.id}`}
                className={`${styles.collapse} ${isOpen ? styles.open : ""}`}
                inert={!isOpen}
              >
                <div className={styles.items}>
                  {group.items.map((item) => (
                    <div className={styles.itemWrap} key={item}>
                      <label className={styles.item}>
                        <input
                          type="checkbox"
                          checked={checklist.includes(item)}
                          onChange={() => toggleItem(item)}
                        />
                        {/* Only the reading changes: the stored label stays as seeded. */}
                        <span>
                          {item.replace(
                            "permiso del predio",
                            `permiso ${placeWordsFor(site.sector).of}`,
                          )}
                        </span>
                      </label>
                      <EvidenceControl
                        item={item}
                        flight={flight}
                        site={site}
                        checked={checklist.includes(item)}
                        onComplete={handleEvidenceComplete}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
