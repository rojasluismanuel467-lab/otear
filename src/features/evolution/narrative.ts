import type { Site } from "../demo/types";
import {
  comparisonReliability,
  paceOf,
  phaseOf,
  plannedAt,
  stalledZones,
  sustainedDeclines,
  type CapturePoint,
} from "./evolution.ts";

export interface Line {
  tone: "good" | "warning" | "danger" | "info";
  text: string;
}

const number = (value: number, digits = 1) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(
    value,
  );

const vigor = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const date = (value: string) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));

const DAY_MS = 86_400_000;
const daysBetween = (from: string, to: string) =>
  Math.round(
    (new Date(`${to}T12:00:00`).getTime() -
      new Date(`${from}T12:00:00`).getTime()) /
      DAY_MS,
  );

/**
 * Plain-language reading of the capture at `index`, compared with the one at `referenceIndex`.
 * Everything is computed from the series; nothing here is inferred by a model.
 */
export function narrate(input: {
  site: Site;
  captures: CapturePoint[];
  index: number;
  referenceIndex: number;
  zoneNames: Record<string, string>;
}): Line[] {
  const { site, captures, index, referenceIndex, zoneNames } = input;
  const current = captures[index];
  const reference = captures[referenceIndex];
  if (!current) return [];
  const upTo = captures.slice(0, index + 1);
  const zoneIds = site.zones.map((zone) => zone.id);
  const name = (id: string) => zoneNames[id] ?? id;
  const lines: Line[] = [];

  if (site.sector === "construction") {
    const target = site.schedule?.targetLevels ?? 8;
    const built = current.levels ?? 0;
    lines.push({
      tone: "info",
      text: `${number(built)} de ${target} niveles construidos (${number((built / target) * 100, 0)} %) al ${date(current.date)}.`,
    });
    if (site.schedule) {
      const expected = plannedAt(site.schedule, current.date, target);
      const gap = built - expected;
      lines.push({
        tone: gap < -0.5 ? "danger" : gap < 0 ? "warning" : "good",
        text:
          Math.abs(gap) < 0.05
            ? `Va al día: lo previsto a esta fecha son ${number(expected)} niveles.`
            : `${gap < 0 ? "Va atrasado" : "Va adelantado"} ${number(Math.abs(gap))} niveles: lo previsto a esta fecha son ${number(expected)}.`,
      });
    }
    const series = upTo.map((point) => ({
      date: point.date,
      value: point.levels ?? 0,
    }));
    const pace = paceOf(series, target);
    if (pace && pace.perDay > 0) {
      const perWeek = pace.perDay * 7;
      let text = `Ritmo reciente: ${number(perWeek, 2)} niveles por semana.`;
      if (pace.projectedEnd && site.schedule) {
        const late = daysBetween(site.schedule.end, pace.projectedEnd);
        text += ` Si sigue así, terminaría el ${date(pace.projectedEnd)}${late > 0 ? `, ${late} días después de lo previsto` : ", dentro de lo previsto"}.`;
      }
      lines.push({
        tone:
          pace.projectedEnd &&
          site.schedule &&
          daysBetween(site.schedule.end, pace.projectedEnd) > 0
            ? "warning"
            : "info",
        text,
      });
    }
    const stalled = stalledZones(upTo, zoneIds);
    if (stalled.length) {
      lines.push({
        tone: "warning",
        text: `Frentes con poco avance en los últimos dos vuelos: ${stalled.map(name).join(", ")}.`,
      });
    }
  } else if (site.sector === "roads") {
    lines.push({
      tone: "info",
      text: `Avance medio del tramo: ${number(current.mean, 0)} % al ${date(current.date)}.`,
    });
    if (site.schedule) {
      const expected = plannedAt(site.schedule, current.date);
      const gap = current.mean - expected;
      lines.push({
        tone: gap < -10 ? "danger" : gap < 0 ? "warning" : "good",
        text: `Lo previsto a esta fecha es ${number(expected, 0)} %: va ${number(Math.abs(gap), 0)} puntos ${gap < 0 ? "por debajo" : "por encima"}.`,
      });
    }
    const pace = paceOf(
      upTo.map((point) => ({ date: point.date, value: point.mean })),
      100,
    );
    if (pace?.projectedEnd && site.schedule) {
      const late = daysBetween(site.schedule.end, pace.projectedEnd);
      lines.push({
        tone: late > 0 ? "warning" : "info",
        text: `Al ritmo reciente llegaría al 100 % el ${date(pace.projectedEnd)}${late > 0 ? ` (${late} días después de lo previsto)` : ""}.`,
      });
    }
    for (const id of stalledZones(upTo, zoneIds)) {
      lines.push({
        tone: "warning",
        text: `${name(id)} casi no avanza: ${number(current.values[id], 0)} % y apenas se movió en los últimos dos vuelos. Está en ${phaseOf(current.values[id]).label.toLowerCase()}.`,
      });
    }
  } else if (site.sector === "agriculture") {
    const ranked = [...zoneIds]
      .filter((id) => current.values[id] !== undefined)
      .sort((a, b) => current.values[b] - current.values[a]);
    if (ranked.length) {
      lines.push({
        tone: "info",
        text: `Mejor vigor: ${name(ranked[0])} (${vigor(current.values[ranked[0]])}). Más bajo: ${name(ranked[ranked.length - 1])} (${vigor(current.values[ranked[ranked.length - 1]])}).`,
      });
    }
    for (const id of sustainedDeclines(upTo, zoneIds)) {
      lines.push({
        tone: "danger",
        text: `${name(id)} baja de vigor en dos vuelos seguidos (${vigor(upTo[upTo.length - 3].values[id])} → ${vigor(upTo[upTo.length - 2].values[id])} → ${vigor(current.values[id])}). Conviene ir a campo: riego, plaga o nutrientes. Un solo dato del dron no distingue la causa.`,
      });
    }
  } else {
    const worst = [...zoneIds].sort(
      (a, b) => (current.values[b] ?? 0) - (current.values[a] ?? 0),
    )[0];
    if (worst) {
      lines.push({
        tone: "info",
        text: `Más novedades en este vuelo: ${name(worst)} (${current.values[worst] ?? 0}).`,
      });
    }
  }

  if (reference && reference !== current) {
    const changes = zoneIds
      .filter(
        (id) =>
          current.values[id] !== undefined &&
          reference.values[id] !== undefined,
      )
      .map((id) => ({ id, change: current.values[id] - reference.values[id] }))
      .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    if (changes.length) {
      const top = changes[0];
      const unit =
        site.sector === "agriculture"
          ? ""
          : site.sector === "security"
            ? ""
            : " puntos";
      lines.push({
        tone: "info",
        text: `Frente al ${date(reference.date)}, el mayor cambio es ${name(top.id)}: ${top.change >= 0 ? "+" : "−"}${number(Math.abs(top.change), site.sector === "agriculture" ? 2 : 0)}${unit}.`,
      });
    }
    const reliability = comparisonReliability(reference, current);
    lines.push({
      tone: reliability.level === "high" ? "good" : "warning",
      text: `Confiabilidad de la comparación: ${reliability.text}`,
    });
  }
  return lines;
}
