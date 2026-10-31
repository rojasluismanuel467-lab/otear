import type { Finding, Site } from "../demo/types";
import {
  comparisonReliability,
  findingChange,
  indicatorFor,
  zoneVerdict,
  paceOf,
  phaseOf,
  plannedAt,
  stalledZones,
  sustainedDeclines,
  type CapturePoint,
} from "./evolution.ts";
import { agree, findingWords } from "../flights/finding-words.ts";

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
  } else if (site.sector === "roads" || site.sector === "mining") {
    const mining = site.sector === "mining";
    lines.push({
      tone: "info",
      text: mining
        ? `Avance medio de la excavación: ${number(current.mean, 0)} % de lo planeado al ${date(current.date)}.`
        : `Avance medio del tramo: ${number(current.mean, 0)} % al ${date(current.date)}.`,
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
        text: mining
          ? `${name(id)} casi no avanza: ${number(current.values[id], 0)} % de lo planeado y apenas se movió en los últimos dos vuelos.`
          : `${name(id)} casi no avanza: ${number(current.values[id], 0)} % y apenas se movió en los últimos dos vuelos. Está en ${phaseOf(current.values[id]).label.toLowerCase()}.`,
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

/**
 * The answer to "did it get better or worse?" between the capture shown and the one it is
 * compared with: zone by zone, the findings that appeared or went away, and how far to trust it.
 * Plain sentences from the series, no model.
 */
export function comparisonSummary(input: {
  site: Site;
  captures: CapturePoint[];
  index: number;
  referenceIndex: number;
  zoneNames: Record<string, string>;
  findings: Finding[];
  /** The company's word for a finding, lowercase. */
  findingWord?: { singular: string; plural: string };
}): Line[] {
  const { site, captures, index, referenceIndex, zoneNames, findings } = input;
  const current = captures[index];
  const reference = captures[referenceIndex];
  if (!current || !reference || reference === current) return [];
  const kind = indicatorFor(site.sector).kind;
  // The gender comes from the company's word: «nuevas» for «observaciones», «nuevos» for «hallazgos».
  const word = input.findingWord
    ? findingWords(input.findingWord.singular, input.findingWord.plural)
    : findingWords("hallazgo", "hallazgos");
  const digits = kind === "vigor" ? 2 : 0;
  const unit = kind === "progress" ? " puntos" : "";
  const sign = (change: number) =>
    `${change >= 0 ? "+" : "−"}${kind === "vigor" ? vigor(Math.abs(change)) : number(Math.abs(change), digits)}${unit}`;
  const groups: Record<"better" | "worse" | "same", string[]> = {
    better: [],
    worse: [],
    same: [],
  };
  const declining = new Set(
    sustainedDeclines(
      captures.slice(0, index + 1),
      site.zones.map((zone) => zone.id),
    ),
  );
  for (const zone of site.zones) {
    const now = current.values[zone.id];
    const before = reference.values[zone.id];
    if (now === undefined || before === undefined) continue;
    const change = now - before;
    const verdict = zoneVerdict(kind, change);
    const name = zoneNames[zone.id] ?? zone.id;
    // Better than the comparison date but falling now: the bare sign would hide the fall.
    const falling =
      verdict === "better" && kind !== "count" && declining.has(zone.id);
    groups[verdict].push(
      verdict === "same"
        ? name
        : `${name} (${sign(change)}${falling ? ", pero viene bajando" : ""})`,
    );
  }
  const lines: Line[] = [];
  const words =
    kind === "progress"
      ? { better: "avanzó", worse: "retrocedió", same: "casi no se movió" }
      : { better: "mejoró", worse: "empeoró", same: "sin cambio notable en" };
  const parts = [
    groups.worse.length ? `${words.worse}: ${groups.worse.join(", ")}` : "",
    groups.better.length ? `${words.better}: ${groups.better.join(", ")}` : "",
    groups.same.length
      ? kind === "progress"
        ? `${words.same}: ${groups.same.join(", ")}`
        : `${words.same} ${groups.same.join(", ")}`
      : "",
  ].filter(Boolean);
  if (parts.length) {
    lines.push({
      tone: groups.worse.length ? "warning" : "good",
      text: `Frente al ${date(reference.date)}, ${parts.join("; ")}.`,
    });
  }
  const change = findingChange(findings, current, reference);
  if (change.appeared || change.gone || change.persistent) {
    const pieces = [
      `${change.appeared} ${change.appeared === 1 ? agree(word, "nuevo", "nueva") : agree(word, "nuevos", "nuevas")}`,
      `${change.gone} ${change.gone === 1 ? "ya no aparece" : "ya no aparecen"}`,
      `${change.persistent} ${change.persistent === 1 ? "sigue" : "siguen"} ${change.persistent === 1 ? agree(word, "abierto", "abierta") : agree(word, "abiertos", "abiertas")}`,
    ];
    lines.push({
      tone: change.appeared > change.gone ? "warning" : "info",
      text: `En ${word.plural}, frente a entonces: ${pieces.join(", ")}.`,
    });
  }
  const reliability = comparisonReliability(reference, current);
  lines.push({
    tone: reliability.level === "high" ? "good" : "warning",
    text: `Qué tan fiable es la comparación: ${reliability.text}`,
  });
  return lines;
}
