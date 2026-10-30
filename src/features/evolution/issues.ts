import type { Finding, Position, Site } from "../demo/types";
import { chainageRanges, rangeText } from "../sites/mapping/chainage.ts";
import {
  fallingSince,
  paceOf,
  phaseOf,
  plannedAt,
  stalledZones,
  sustainedDeclines,
  type CapturePoint,
} from "./evolution.ts";

export interface Issue {
  id: string;
  kind: "delay" | "stalled" | "decline" | "low" | "hotspot" | "finding";
  tone: "danger" | "warning" | "info";
  title: string;
  summary: string;
  /** Zone the issue belongs to; its values over time feed the detail chart. */
  zoneId?: string;
  /** Spot on a map, when the issue has one. */
  position?: Position;
  facts: { label: string; value: string }[];
  advice?: string;
  /** Dates of the flights that reported this same finding (a finding only). */
  seenOn?: string[];
}

const number = (value: number, digits = 1) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(
    value,
  );
const fixed = (value: number) =>
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

const centerOfZone = (outline: Position[]): Position => {
  const n = outline.length || 1;
  return [
    outline.reduce((sum, p) => sum + p[0], 0) / n,
    outline.reduce((sum, p) => sum + p[1], 0) / n,
  ];
};

const priorityTone = {
  high: "danger",
  medium: "warning",
  low: "info",
} as const;

/**
 * What is going wrong at the capture shown, found with the same rules as the reading panel:
 * work behind the plan, stalled stretches, falling vigor, zones with many reports, and the
 * findings of that flight. Every issue says where it is when the data allows.
 */
export function issuesFor(input: {
  site: Site;
  captures: CapturePoint[];
  index: number;
  referenceIndex: number;
  findings: Finding[];
  zoneNames: Record<string, string>;
}): Issue[] {
  const { site, captures, index, referenceIndex, findings, zoneNames } = input;
  const current = captures[index];
  if (!current) return [];
  const reference = captures[referenceIndex];
  const upTo = captures.slice(0, index + 1);
  const zoneIds = site.zones.map((zone) => zone.id);
  const name = (id: string) => zoneNames[id] ?? id;
  const spot = (id: string) => {
    const zone = site.zones.find((item) => item.id === id);
    return zone ? centerOfZone(zone.outline) : undefined;
  };
  const issues: Issue[] = [];
  // Seeded roads carry no chainage: the stretches are counted from 0+000, as in Mapa.
  const ranges: Record<string, string> =
    site.sector === "roads"
      ? Object.fromEntries(
          chainageRanges(site.zones).map((range) => [
            range.zoneId,
            rangeText(range),
          ]),
        )
      : {};
  const change = (id: string) =>
    reference && reference !== current && reference.values[id] !== undefined
      ? current.values[id] - reference.values[id]
      : undefined;
  // «Frente al 18 de jul (0,50): +0,12». The sign alone reads as «mejoró»: when the zone is
  // falling now, the text says that the comparison is against a lower start.
  const versus = (
    id: string,
    format: (value: number) => string,
    rising: "better" | "worse",
    falling?: boolean,
  ) => {
    const diff = change(id);
    if (diff === undefined) return [];
    const better = rising === "better" ? diff > 0 : diff < 0;
    const note =
      diff === 0
        ? ""
        : falling && better
          ? " (sigue por encima de entonces, pero viene bajando)"
          : better
            ? " (mejor que entonces)"
            : " (peor que entonces)";
    return [
      {
        label: `Frente al ${date(reference.date)} (${format(reference.values[id])})`,
        value: `${diff >= 0 ? "+" : "−"}${format(Math.abs(diff))}${note}`,
      },
    ];
  };
  const pointsFmt = (value: number) => `${number(value, 0)} puntos`;

  if (
    site.sector === "construction" ||
    site.sector === "roads" ||
    site.sector === "mining"
  ) {
    const target =
      site.sector === "construction" ? (site.schedule?.targetLevels ?? 8) : 100;
    const value =
      site.sector === "construction" ? (current.levels ?? 0) : current.mean;
    if (site.schedule) {
      const expected = plannedAt(site.schedule, current.date, target);
      const gap = value - expected;
      const limit = site.sector === "construction" ? -0.5 : -10;
      if (gap < limit) {
        const series = upTo.map((point) => ({
          date: point.date,
          value:
            site.sector === "construction" ? (point.levels ?? 0) : point.mean,
        }));
        const pace = paceOf(series, target);
        const late = pace?.projectedEnd
          ? daysBetween(site.schedule.end, pace.projectedEnd)
          : undefined;
        issues.push({
          id: "delay",
          kind: "delay",
          tone: "danger",
          title: "Va atrasado frente a lo previsto",
          summary:
            site.sector === "construction"
              ? `${number(Math.abs(gap))} niveles menos de los ${number(expected)} previstos.`
              : `${number(Math.abs(gap), 0)} puntos por debajo de lo previsto (${number(expected, 0)} %).`,
          position: site.zones.length
            ? centerOfZone(site.zones.flatMap((zone) => zone.outline))
            : undefined,
          facts: [
            {
              label: "Avance actual",
              value:
                site.sector === "construction"
                  ? `${number(value)} de ${target} niveles`
                  : `${number(value, 0)} %`,
            },
            {
              label: "Previsto a esta fecha",
              value:
                site.sector === "construction"
                  ? `${number(expected)} niveles`
                  : `${number(expected, 0)} %`,
            },
            ...(pace?.projectedEnd
              ? [
                  {
                    label: "Al ritmo reciente terminaría",
                    value: `${date(pace.projectedEnd)}${late && late > 0 ? ` (${late} días tarde)` : ""}`,
                  },
                ]
              : []),
          ],
          advice:
            site.sector === "mining"
              ? "Revise qué bancos frenan la excavación y si hay equipos sin usar."
              : "Revise qué frentes frenan el avance y si hay recursos sin usar.",
        });
      }
    }
    for (const id of stalledZones(upTo, zoneIds)) {
      const now = current.values[id];
      const before = upTo[Math.max(0, upTo.length - 3)].values[id];
      issues.push({
        id: `stalled-${id}`,
        kind: "stalled",
        tone: "warning",
        title: `${name(id)} casi no avanza`,
        summary:
          site.sector === "roads"
            ? `${number(now, 0)} %, en ${phaseOf(now).label.toLowerCase()}, y se movió poco en los últimos dos vuelos.`
            : `${number(now, 0)} % y se movió poco en los últimos dos vuelos.`,
        zoneId: id,
        position: spot(id),
        facts: [
          { label: "Ahora", value: `${number(now, 0)} %` },
          { label: "Dos vuelos antes", value: `${number(before, 0)} %` },
          ...versus(id, pointsFmt, "better"),
          ...(site.sector === "roads" && ranges[id]
            ? [{ label: "Dónde", value: ranges[id] }]
            : []),
        ],
        advice:
          site.sector === "mining"
            ? "Pregunte al responsable del banco qué lo detiene: equipos, accesos, permisos o clima."
            : "Pregunte al responsable del frente qué lo detiene: material, cuadrilla, permisos o clima.",
      });
    }
  } else if (site.sector === "agriculture") {
    for (const id of sustainedDeclines(upTo, zoneIds)) {
      const start = fallingSince(upTo, id, index);
      const run = start ? upTo.slice(upTo.indexOf(start)) : upTo.slice(-3);
      const others = zoneIds
        .filter((other) => other !== id && current.values[other] !== undefined)
        .map((other) => `${name(other)} ${fixed(current.values[other])}`);
      issues.push({
        id: `decline-${id}`,
        kind: "decline",
        tone: "danger",
        title: `${name(id)} baja de vigor`,
        summary: `Viene bajando desde el ${date((start ?? run[0]).date)} (${fixed((start ?? run[0]).values[id])}): ${run.map((point) => fixed(point.values[id])).join(" → ")}.`,
        zoneId: id,
        position: spot(id),
        facts: [
          {
            label: "Vigor ahora",
            value: `${fixed(current.values[id])}, en una escala de 0 (poco verdor) a 1 (mucho)`,
          },
          {
            label: "Empezó a bajar",
            value: `${date((start ?? run[0]).date)}, con ${fixed((start ?? run[0]).values[id])}`,
          },
          ...(others.length
            ? [{ label: "Los demás hoy", value: others.join(" · ") }]
            : []),
          ...versus(id, fixed, "better", true),
        ],
        advice:
          "Conviene ir a campo: riego, plaga o nutrientes. Un solo dato del dron no distingue la causa.",
      });
    }
    for (const id of zoneIds) {
      const value = current.values[id];
      if (
        value !== undefined &&
        value < 0.55 &&
        !issues.some((item) => item.zoneId === id)
      ) {
        issues.push({
          id: `low-${id}`,
          kind: "low",
          tone: "warning",
          title: `${name(id)} tiene el vigor bajo`,
          summary: `Vigor de ${fixed(value)}, por debajo de 0,55.`,
          zoneId: id,
          position: spot(id),
          facts: [
            {
              label: "Vigor ahora",
              value: `${fixed(value)}, en una escala de 0 (poco verdor) a 1 (mucho)`,
            },
          ],
          advice: "Compare con los demás lotes y revise en campo.",
        });
      }
    }
  } else {
    const ranked = [...zoneIds].sort(
      (a, b) => (current.values[b] ?? 0) - (current.values[a] ?? 0),
    );
    const top = ranked[0];
    if (top && (current.values[top] ?? 0) >= 2) {
      issues.push({
        id: `hotspot-${top}`,
        kind: "hotspot",
        tone: "warning",
        title: `${name(top)} concentra las novedades`,
        summary: `${current.values[top]} novedades en este vuelo, más que en cualquier otra zona.`,
        zoneId: top,
        position: spot(top),
        facts: [
          { label: "Novedades ahora", value: String(current.values[top]) },
          ...versus(top, (value) => number(value, 0), "worse"),
        ],
        advice: "Revise la ruta de vigilancia y la iluminación de esa zona.",
      });
    }
  }

  for (const finding of findings.filter(
    (item) => item.flightId === current.flightId && item.status !== "dismissed",
  )) {
    // Every capture up to the one shown that reported the same finding in the same zone.
    const seenOn = upTo
      .filter((point) =>
        findings.some(
          (other) =>
            other.flightId === point.flightId &&
            other.zoneId === finding.zoneId &&
            other.title === finding.title &&
            other.status !== "dismissed" &&
            !(other.suggestion && other.status === "pending"),
        ),
      )
      .map((point) => point.date);
    issues.push({
      id: `finding-${finding.id}`,
      kind: "finding",
      tone: priorityTone[finding.priority],
      title: finding.title,
      summary: finding.description,
      zoneId: finding.zoneId,
      position: finding.position,
      seenOn,
      facts: [
        {
          label: "Zona",
          value: ranges[finding.zoneId]
            ? `${name(finding.zoneId)} · ${ranges[finding.zoneId]}`
            : name(finding.zoneId),
        },
        ...(seenOn.length > 1
          ? [
              {
                label: "Visto en",
                value: `${seenOn.map(date).join(", ")} · sigue abierto`,
              },
            ]
          : [
              {
                label: "Visto en",
                value: `${date(current.date)} · primera vez`,
              },
            ]),
        {
          label: "Prioridad",
          value: { high: "Alta", medium: "Media", low: "Baja" }[
            finding.priority
          ],
        },
        {
          label: "Estado",
          value:
            finding.status === "confirmed"
              ? "Confirmado"
              : "Pendiente de revisar",
        },
        {
          label: "Tarea",
          value: finding.taskAssigned ? "Asignada" : "Sin asignar",
        },
      ],
      advice: finding.taskAssigned
        ? undefined
        : "Asigne una tarea para que no se pierda.",
    });
  }
  const order = { danger: 0, warning: 1, info: 2 } as const;
  return issues.sort((a, b) => order[a.tone] - order[b.tone]);
}
