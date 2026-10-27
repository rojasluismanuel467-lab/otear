import type { PartCondition, PartMark } from "../demo/types";
import { markPartName } from "./parts-catalog.ts";

export const conditionInfo: Record<
  PartCondition,
  { label: string; color: string; hint: string }
> = {
  ok: { label: "Bueno", color: "#506879", hint: "Revisada y sin novedad" },
  watch: {
    label: "Vigilar",
    color: "#d9a526",
    hint: "Desgaste o daño leve; revisar en la próxima inspección",
  },
  replace: {
    label: "Cambiar",
    color: "#d24a3c",
    hint: "Debe cambiarse o repararse antes de volar",
  },
};

/** Sphere radius of a mark, as a fraction of the model's half-width. */
export const sizeFactor = { s: 0.1, m: 0.18, l: 0.3 } as const;
export const sizeLabels = {
  s: "Pequeña",
  m: "Mediana",
  l: "Grande",
} as const;

const rank: Record<PartCondition, number> = { ok: 0, watch: 1, replace: 2 };

export function worstCondition(marks: PartMark[]): PartCondition | undefined {
  return marks.reduce<PartCondition | undefined>(
    (worst, mark) =>
      !worst || rank[mark.condition] > rank[worst] ? mark.condition : worst,
    undefined,
  );
}

export interface ConditionSummary {
  ok: number;
  watch: number;
  replace: number;
  resolved: number;
}

/** Counts of open marks by condition; resolved marks are counted apart. */
export function summarize(marks: PartMark[]): ConditionSummary {
  const summary = { ok: 0, watch: 0, replace: 0, resolved: 0 };
  for (const mark of marks) {
    if (mark.resolvedOn) summary.resolved += 1;
    else summary[mark.condition] += 1;
  }
  return summary;
}

/** Marks that still need action: replace first, then watch. */
export function openProblems(marks: PartMark[]) {
  return marks
    .filter((mark) => !mark.resolvedOn && mark.condition !== "ok")
    .sort((a, b) => rank[b.condition] - rank[a.condition]);
}

export function problemAlerts(marks: PartMark[]) {
  const replace = openProblems(marks).filter(
    (mark) => mark.condition === "replace",
  );
  const watch = openProblems(marks).filter(
    (mark) => mark.condition === "watch",
  );
  const alerts: { id: string; tone: "danger" | "info"; text: string }[] = [];
  for (const mark of replace) {
    alerts.push({
      id: `part-${mark.id}`,
      tone: "danger",
      text: `${markPartName(mark)}: marcada para cambiar${mark.note ? ` (${mark.note})` : ""}.`,
    });
  }
  if (watch.length) {
    alerts.push({
      id: "parts-watch",
      tone: "info",
      text: `${watch.length} ${watch.length === 1 ? "parte" : "partes"} por vigilar: ${[...new Set(watch.map(markPartName))].join(", ").toLowerCase()}.`,
    });
  }
  return alerts;
}
