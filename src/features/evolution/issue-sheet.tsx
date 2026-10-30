import { Button } from "@heroui/react";
import { ArrowLeft, Check, TriangleAlert } from "lucide-react";
import { zonePalette } from "@/components/maps/zone-palette";
import { LineChart } from "./line-chart";
import type { Issue } from "./issues";
import styles from "./evolution.module.css";

const toneLabel = {
  danger: "Urgente",
  warning: "Atención",
  info: "Para saber",
} as const;

/** Detail of one issue pinned on the stage: what it is, the numbers behind it and what to do. */
export function IssueSheet({
  issue,
  series,
  seriesLabel,
  seriesNote,
  listLabel,
  format,
  yDomain,
  onBack,
}: {
  issue: Issue;
  /** Values of the issue's zone over time, up to the capture shown. */
  series: { date: string; value: number }[];
  seriesLabel: string;
  /** Says what the curve is not, when it could be mistaken for the issue itself. */
  seriesNote?: string;
  /** «Todos los hallazgos»: the company's word for the list this sheet came from. */
  listLabel: string;
  format: (value: number) => string;
  yDomain: [number, number];
  onBack: () => void;
}) {
  return (
    <div className={styles.sheet}>
      <header className={styles.sheetHead}>
        <button type="button" className={styles.back} onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          {listLabel}
        </button>
        <span className={styles.toneChip} data-tone={issue.tone}>
          <TriangleAlert size={14} aria-hidden="true" />
          {toneLabel[issue.tone]}
        </span>
        <h3>{issue.title}</h3>
        <p>{issue.summary}</p>
      </header>

      <dl className={styles.facts}>
        {issue.facts.map((fact) => (
          <div key={fact.label}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      {series.length > 1 && (
        <section
          className={styles.sheetChart}
          aria-label="Evolución de la zona"
        >
          <strong>{seriesNote ? "Cómo va la zona" : "Cómo ha cambiado"}</strong>
          {seriesNote && <p className={styles.seriesNote}>{seriesNote}</p>}
          <LineChart
            label={seriesLabel}
            series={[
              {
                id: "zone",
                name: seriesLabel,
                color: zonePalette[0],
                points: series,
              },
            ]}
            xDomain={[series[0].date, series[series.length - 1].date]}
            yDomain={yDomain}
            format={format}
            tickCount={2}
            compact
          />
        </section>
      )}

      {issue.advice && (
        <p className={styles.advice}>
          <Check size={16} aria-hidden="true" />
          {issue.advice}
        </p>
      )}
      <Button variant="ghost" onPress={onBack}>
        Volver a la lista
      </Button>
    </div>
  );
}
