"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { StageDrawer } from "@/components/ui/stage-drawer";
import { ParcelMap } from "@/components/maps/parcel-map";
import { zonePalette } from "@/components/maps/zone-palette";
import { useDemo } from "@/features/demo/demo-context";
import type { Site } from "@/features/demo/types";
import { formatDate } from "@/lib/format";
import {
  buildCaptures,
  countColor,
  phaseOf,
  phases,
  plannedAt,
  vigorColor,
  type CapturePoint,
} from "./evolution";
import { issuesFor, type Issue } from "./issues";
import { IssueSheet } from "./issue-sheet";
import { LineChart, type ChartSeries } from "./line-chart";
import { narrate, type Line } from "./narrative";
import { TimelineBar } from "./timeline-bar";
import styles from "./evolution.module.css";

const BuildingScene = dynamic(
  () =>
    import("@/components/evolution/building-scene").then(
      (module) => module.BuildingScene,
    ),
  {
    ssr: false,
    loading: () => (
      <div className={styles.sceneLoading}>Preparando el modelo…</div>
    ),
  },
);

const fixed = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
const number = (value: number, digits = 1) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: digits }).format(
    value,
  );

function valueText(site: Site, point: CapturePoint) {
  if (site.sector === "construction") {
    const levels = point.levels ?? 0;
    return `${number(levels)} ${levels === 1 ? "nivel" : "niveles"} construidos`;
  }
  if (site.sector === "roads") return `${number(point.mean, 0)} % de avance`;
  if (site.sector === "agriculture") return `Vigor medio ${fixed(point.mean)}`;
  const total = Object.values(point.values).reduce(
    (sum, value) => sum + value,
    0,
  );
  return `${total} ${total === 1 ? "novedad" : "novedades"} en total`;
}

const toneIcon = {
  good: CircleCheck,
  warning: TriangleAlert,
  danger: TriangleAlert,
  info: Info,
} as const;

export function EvolutionView() {
  const { site, flights, findings } = useDemo();
  const captures = useMemo(
    () => buildCaptures(site, flights, findings),
    [site, flights, findings],
  );
  return (
    <div className={styles.view}>
      <PageHeading
        title="Evolución"
        description={`Cómo ha cambiado ${site.name} vuelo a vuelo, y dónde está pasando algo.`}
      />
      {captures.length < 2 ? (
        <EmptyState
          title="Todavía no hay una historia que mostrar"
          description="La evolución aparece cuando el sitio tiene al menos dos vuelos completados con datos medidos."
        />
      ) : (
        <EvolutionContent key={site.id} site={site} captures={captures} />
      )}
    </div>
  );
}

function EvolutionContent({
  site,
  captures,
}: {
  site: Site;
  captures: CapturePoint[];
}) {
  const { findings } = useDemo();
  const last = captures.length - 1;
  const [picked, setPicked] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [refPicked, setRefPicked] = useState(0);
  const [issueId, setIssueId] = useState<string>();
  const index = picked ?? last;
  const refIndex = Math.min(refPicked, Math.max(index - 1, 0));
  const isPlaying = playing && index < last;
  const current = captures[index];
  const reference = captures[refIndex];
  const zoneNames = useMemo(
    () => Object.fromEntries(site.zones.map((zone) => [zone.id, zone.name])),
    [site.zones],
  );

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(
      () => setPicked((value) => Math.min((value ?? last) + 1, last)),
      1500,
    );
    return () => clearInterval(timer);
  }, [isPlaying, last]);

  const issues = useMemo(
    () =>
      issuesFor({
        site,
        captures,
        index,
        referenceIndex: refIndex,
        findings,
        zoneNames,
      }),
    [site, captures, index, refIndex, findings, zoneNames],
  );
  const counts = useMemo(
    () =>
      captures.map(
        (_, i) =>
          issuesFor({
            site,
            captures,
            index: i,
            referenceIndex: Math.min(refPicked, Math.max(i - 1, 0)),
            findings,
            zoneNames,
          }).length,
      ),
    [site, captures, findings, zoneNames, refPicked],
  );
  const lines = useMemo(
    () =>
      narrate({ site, captures, index, referenceIndex: refIndex, zoneNames }),
    [site, captures, index, refIndex, zoneNames],
  );
  const selected = issues.find((item) => item.id === issueId);

  function go(next: number) {
    setPlaying(false);
    setPicked(next);
  }
  function togglePlay() {
    if (isPlaying) return setPlaying(false);
    if (index >= last) setPicked(0);
    setPlaying(true);
  }

  const target = site.schedule?.targetLevels ?? 8;
  const sheetSeries = selected
    ? seriesOf(site, captures.slice(0, index + 1), selected)
    : null;

  return (
    <section className={`surface ${styles.surface}`}>
      <header className={styles.head}>
        <div>
          <h2>{site.name}</h2>
          <p>
            {formatDate(current.date)} · {valueText(site, current)}
          </p>
        </div>
        <span
          className={styles.count}
          data-tone={issues.length ? "warning" : "good"}
        >
          {issues.length
            ? `${issues.length} ${issues.length === 1 ? "problema" : "problemas"} en este vuelo`
            : "Sin problemas en este vuelo"}
        </span>
      </header>

      <div className={styles.body}>
        <StageDrawer
          drawerLabel="Detalle de la evolución"
          stage={
            <>
              <div className={styles.stage}>
                {site.sector === "construction" ? (
                  <BuildingScene
                    levels={current.levels ?? 0}
                    planned={target}
                    reference={index > 0 ? (reference.levels ?? 0) : null}
                    markers={issues.map((issue) =>
                      buildingMarker(site, issue, current, target),
                    )}
                    selectedMarkerId={issueId}
                    onMarkerSelect={setIssueId}
                  />
                ) : (
                  <MapStage
                    site={site}
                    current={current}
                    captures={captures}
                    issues={issues}
                    selectedId={issueId}
                    onSelect={setIssueId}
                  />
                )}
              </div>
              <TimelineBar
                dates={captures.map((point) => point.date)}
                counts={counts}
                index={index}
                referenceIndex={refIndex}
                playing={isPlaying}
                onSelect={go}
                onTogglePlay={togglePlay}
              />
              <Legend site={site} />
            </>
          }
          drawer={
            selected && sheetSeries ? (
              <IssueSheet
                issue={selected}
                series={sheetSeries.points}
                seriesLabel={sheetSeries.label}
                format={sheetSeries.format}
                yDomain={sheetSeries.yDomain}
                onBack={() => setIssueId(undefined)}
              />
            ) : (
              <div className={styles.overview}>
                <header>
                  <h3>Qué pasa en este vuelo</h3>
                  <p>
                    Toque un marcador del escenario o un problema de la lista.
                  </p>
                </header>
                <label className={styles.compare}>
                  <span>Comparar con</span>
                  <select
                    className="field-select"
                    value={refIndex}
                    disabled={index === 0}
                    onChange={(event) =>
                      setRefPicked(Number(event.target.value))
                    }
                  >
                    {captures.slice(0, Math.max(index, 1)).map((point, i) => (
                      <option key={point.flightId} value={i}>
                        {formatDate(point.date, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </option>
                    ))}
                  </select>
                </label>
                {issues.length ? (
                  <ul
                    className={styles.issueList}
                    aria-label="Problemas detectados"
                  >
                    {issues.map((issue) => (
                      <li key={issue.id}>
                        <button
                          type="button"
                          onClick={() => setIssueId(issue.id)}
                        >
                          <span
                            className={styles.issueDot}
                            data-tone={issue.tone}
                            aria-hidden="true"
                          >
                            !
                          </span>
                          <span className={styles.issueText}>
                            <strong>{issue.title}</strong>
                            <small>{issue.summary}</small>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.allGood}>
                    <CircleCheck size={18} aria-hidden="true" />
                    No se detectaron problemas en este vuelo.
                  </p>
                )}
                <details className={styles.reading}>
                  <summary>Lectura completa de los datos</summary>
                  <ul>
                    {lines.map((line, i) => (
                      <ReadingLine key={i} line={line} />
                    ))}
                  </ul>
                </details>
              </div>
            )
          }
        />

        <section className={styles.block} aria-labelledby="curve-title">
          <h3 id="curve-title">{chartTitle(site)}</h3>
          <EvolutionChart site={site} captures={captures} index={index} />
        </section>

        <details className={styles.note}>
          <summary>Sobre estos datos</summary>
          <p>
            Los valores por zona son de ejemplo y las figuras son esquemáticas,
            no reconstrucciones a partir de imágenes. Con datos reales, cada
            vuelo aportaría su ortomosaico, modelo de superficie o índice NDVI
            ya procesado, alineado con puntos de control.
          </p>
        </details>
      </div>
    </section>
  );
}

function ReadingLine({ line }: { line: Line }) {
  const Icon = toneIcon[line.tone];
  return (
    <li data-tone={line.tone}>
      <Icon size={16} aria-hidden="true" />
      <span>{line.text}</span>
    </li>
  );
}

/** Values of the zone an issue belongs to (or of the whole site) up to the capture shown. */
function seriesOf(site: Site, upTo: CapturePoint[], issue: Issue) {
  if (issue.zoneId) {
    const id = issue.zoneId;
    const points = upTo.flatMap((point) =>
      point.values[id] === undefined
        ? []
        : [{ date: point.date, value: point.values[id] }],
    );
    if (site.sector === "agriculture")
      return {
        points,
        label: "Vigor de la zona",
        format: fixed,
        yDomain: [0.3, 0.9] as [number, number],
      };
    if (site.sector === "security")
      return {
        points,
        label: "Novedades de la zona",
        format: (value: number) => number(value, 0),
        yDomain: [0, Math.max(2, ...points.map((p) => p.value))] as [
          number,
          number,
        ],
      };
    return {
      points,
      label: "Avance de la zona",
      format: (value: number) => `${number(value, 0)} %`,
      yDomain: [0, 100] as [number, number],
    };
  }
  const levels = site.sector === "construction";
  return {
    points: upTo.map((point) => ({
      date: point.date,
      value: levels ? (point.levels ?? 0) : point.mean,
    })),
    label: levels ? "Niveles construidos" : "Avance medio",
    format: (value: number) =>
      levels ? number(value, 1) : `${number(value, 0)} %`,
    yDomain: [0, levels ? (site.schedule?.targetLevels ?? 8) : 100] as [
      number,
      number,
    ],
  };
}

/** Where an issue sits on the schematic building: by front along its width, by progress in height. */
function buildingMarker(
  site: Site,
  issue: Issue,
  current: CapturePoint,
  target: number,
) {
  const zoneIndex = issue.zoneId
    ? site.zones.findIndex((zone) => zone.id === issue.zoneId)
    : -1;
  const count = Math.max(site.zones.length, 1);
  const x =
    zoneIndex < 0 || count === 1 ? 0 : (zoneIndex / (count - 1)) * 2 - 1;
  const level =
    issue.kind === "delay" || zoneIndex < 0
      ? (current.levels ?? 0) + 0.4
      : Math.max(0.5, ((current.values[issue.zoneId!] ?? 0) / 100) * target);
  return { id: issue.id, x, level, tone: issue.tone, label: issue.title };
}

function MapStage({
  site,
  current,
  captures,
  issues,
  selectedId,
  onSelect,
}: {
  site: Site;
  current: CapturePoint;
  captures: CapturePoint[];
  issues: Issue[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const max = Math.max(1, ...captures.flatMap((p) => Object.values(p.values)));
  const colors = Object.fromEntries(
    site.zones.map((zone) => {
      const value = current.values[zone.id] ?? 0;
      return [
        zone.id,
        site.sector === "roads"
          ? phaseOf(value).color
          : site.sector === "agriculture"
            ? vigorColor(value)
            : countColor(value, max),
      ];
    }),
  );
  return (
    <ParcelMap
      siteName={site.name}
      center={site.center}
      outline={[]}
      outlineKind={site.sector === "roads" ? "line" : "polygon"}
      zones={site.zones}
      zoneColors={colors}
      mode="view"
      fitPoints={site.zones.flatMap((zone) => zone.outline)}
      fitKey={0}
      markers={issues.flatMap((issue) =>
        issue.position
          ? [
              {
                id: issue.id,
                position: issue.position,
                tone: issue.tone,
                label: issue.title,
                selected: issue.id === selectedId,
              },
            ]
          : [],
      )}
      onSelectMarker={onSelect}
    />
  );
}

function Legend({ site }: { site: Site }) {
  if (site.sector === "roads") {
    return (
      <ul className={styles.legend} aria-label="Fases de la vía">
        {phases.map((phase) => (
          <li key={phase.label}>
            <span aria-hidden="true" style={{ background: phase.color }} />
            {phase.label}
          </li>
        ))}
      </ul>
    );
  }
  const text =
    site.sector === "agriculture"
      ? "Color del lote: vigor, de rojizo (bajo) a verde (alto)."
      : site.sector === "security"
        ? "Color de la zona: más oscuro, más novedades."
        : "Verde: obra nueva desde la fecha de comparación. Arrastre para girar.";
  return <p className={styles.legendText}>{text}</p>;
}

function chartTitle(site: Site) {
  if (site.sector === "construction")
    return "Niveles construidos frente a lo previsto";
  if (site.sector === "roads") return "Avance acumulado frente a lo previsto";
  if (site.sector === "agriculture") return "Vigor de cada lote en el tiempo";
  return "Novedades por zona en cada vuelo";
}

function EvolutionChart({
  site,
  captures,
  index,
}: {
  site: Site;
  captures: CapturePoint[];
  index: number;
}) {
  const shown = captures.slice(0, index + 1);
  const first = captures[0].date;
  const end = captures[captures.length - 1].date;
  const cursor = captures[index].date;

  if (site.sector === "construction" || site.sector === "roads") {
    const target =
      site.sector === "construction" ? (site.schedule?.targetLevels ?? 8) : 100;
    const [start, finish] = site.schedule
      ? [site.schedule.start, site.schedule.end]
      : [first, end];
    const series: ChartSeries[] = [
      {
        id: "actual",
        name:
          site.sector === "construction"
            ? "Niveles construidos"
            : "Avance medio",
        color: "#216c50",
        points: shown.map((p) => ({
          date: p.date,
          value: site.sector === "construction" ? (p.levels ?? 0) : p.mean,
        })),
      },
    ];
    if (site.schedule) {
      series.push({
        id: "planned",
        name: "Lo previsto",
        color: "#7a8a82",
        dashed: true,
        points: [
          { date: start, value: plannedAt(site.schedule, start, target) },
          { date: finish, value: plannedAt(site.schedule, finish, target) },
        ],
      });
    }
    return (
      <LineChart
        label={chartTitle(site)}
        series={series}
        xDomain={[start, finish]}
        yDomain={[0, target]}
        cursor={cursor}
        format={(v) =>
          site.sector === "roads" ? `${number(v, 0)} %` : number(v, 1)
        }
      />
    );
  }

  const ids = site.zones.map((zone) => zone.id);
  const max = Math.max(
    1,
    ...captures.flatMap((p) => ids.map((id) => p.values[id] ?? 0)),
  );
  const series: ChartSeries[] = site.zones.map((zone, i) => ({
    id: zone.id,
    name: zone.name,
    color: zonePalette[i % zonePalette.length],
    points: shown.flatMap((p) =>
      p.values[zone.id] === undefined
        ? []
        : [{ date: p.date, value: p.values[zone.id] }],
    ),
  }));
  return (
    <LineChart
      label={chartTitle(site)}
      series={series}
      xDomain={[first, end]}
      yDomain={site.sector === "agriculture" ? [0.3, 0.9] : [0, Math.ceil(max)]}
      cursor={cursor}
      tickCount={
        site.sector === "agriculture" ? 4 : Math.min(5, Math.ceil(max))
      }
      format={(v) => (site.sector === "agriculture" ? fixed(v) : number(v, 0))}
    />
  );
}
