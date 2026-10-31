"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Finding, Site } from "@/features/demo/types";
import { formatDate } from "@/lib/format";
import {
  FOLLOW_UP_TODAY,
  measuresText,
  dayText,
  dueText,
  followUpBadge,
  measureList,
  summarizeFollowUps,
  type MeasureFilter,
} from "../follow-up";
import { agree } from "../finding-words";
import { useFindingWords } from "../use-finding-words";
import styles from "./follow-up.module.css";

/**
 * The corrective measures of the whole site, not only of the flight on screen: what is late, what
 * is in correction and what was closed. Choosing one opens its finding.
 */
export function MeasureBoard({
  site,
  findings,
  flightDates,
  selectedId,
  onOpen,
}: {
  site: Pick<Site, "zones">;
  /** Every finding of the site. */
  findings: Finding[];
  /** Date of each flight by id, to say when the finding was seen. */
  flightDates: Record<string, string>;
  selectedId?: string;
  onOpen: (finding: Finding) => void;
}) {
  const words = useFindingWords();
  const [filter, setFilter] = useState<MeasureFilter>("active");
  const summary = summarizeFollowUps(findings, FOLLOW_UP_TODAY);
  const total = summary.active + summary.closed;
  const options: { id: MeasureFilter; label: string; count: number }[] = [
    { id: "active", label: "Abiertas y en corrección", count: summary.active },
    { id: "overdue", label: "Vencidas", count: summary.overdue },
    { id: "inProgress", label: "En corrección", count: summary.inProgress },
    { id: "closed", label: "Cerradas", count: summary.closed },
    { id: "all", label: "Todas", count: total },
  ];
  const shown = measureList(findings, FOLLOW_UP_TODAY, filter);
  const zoneName = (id: string) =>
    site.zones.find((zone) => zone.id === id)?.name ?? "";

  return (
    <section
      className={`surface ${styles.board}`}
      aria-labelledby="measure-board-title"
    >
      <div className={styles.boardHead}>
        <div className={styles.boardIntro}>
          <h3 id="measure-board-title">Medidas correctivas del sitio</h3>
          <p>
            Hoy en la demostración es {dayText(FOLLOW_UP_TODAY)}. Cada medida
            tiene un responsable y un plazo, y se cierra con una nota.
          </p>
        </div>
        <ul
          className={styles.counts}
          aria-label={`Resumen de las medidas. ${measuresText(summary)}`}
        >
          <li>
            <strong>{summary.open}</strong>{" "}
            {summary.open === 1 ? "abierta" : "abiertas"}
          </li>
          <li>
            <strong>{summary.inProgress}</strong> en corrección
          </li>
          <li>
            <strong>{summary.closed}</strong>{" "}
            {summary.closed === 1 ? "cerrada" : "cerradas"}
          </li>
          <li data-tone={summary.overdue ? "danger" : undefined}>
            de ellas, <strong>{summary.overdue}</strong>{" "}
            {summary.overdue === 1 ? "vencida" : "vencidas"}
          </li>
          {summary.discarded > 0 && (
            <li>
              y <strong>{summary.discarded}</strong>{" "}
              {summary.discarded === 1
                ? "descartada sin cerrar"
                : "descartadas sin cerrar"}{" "}
              (aparte)
            </li>
          )}
        </ul>
      </div>
      {total > 0 && (
        <div
          className={`segmented-control ${styles.filter}`}
          aria-label="Qué medidas ver"
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.id}
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      )}
      {shown.length > 0 ? (
        <ul className={styles.measures}>
          {shown.map(({ finding, followUp }) => (
            <li key={finding.id}>
              <button
                type="button"
                className={styles.measure}
                aria-current={selectedId === finding.id}
                onClick={() => onOpen(finding)}
              >
                <span className={styles.measureText}>
                  <strong>{finding.title}</strong>
                  <small>
                    {finding.locationLabel ?? zoneName(finding.zoneId)}
                    {flightDates[finding.flightId]
                      ? ` · visto el ${formatDate(flightDates[finding.flightId], { day: "numeric", month: "short" })}`
                      : ""}{" "}
                    · {followUp.owner}
                  </small>
                  <small>{dueText(followUp, FOLLOW_UP_TODAY)}</small>
                </span>
                <StatusBadge
                  tone={followUpBadge(followUp, FOLLOW_UP_TODAY).tone}
                >
                  {followUpBadge(followUp, FOLLOW_UP_TODAY).label}
                </StatusBadge>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          {total === 0
            ? `Aún no hay medidas. Abra una desde el detalle ${agree(words, "del", "de la")} ${words.singular}: responsable, plazo y nota de cierre.`
            : "Ninguna medida coincide con este filtro."}
        </p>
      )}
      {summary.withoutMeasure > 0 && (
        <p className={styles.empty}>
          {summary.withoutMeasure}{" "}
          {summary.withoutMeasure === 1
            ? `${words.singular} confirmad${words.feminine ? "a" : "o"} sin responsable`
            : `${words.plural} confirmad${words.feminine ? "as" : "os"} sin responsable`}
          .
        </p>
      )}
    </section>
  );
}
