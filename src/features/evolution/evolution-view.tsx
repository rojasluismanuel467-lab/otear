"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
import { PropellerSpinner } from "@/components/ui/propeller-spinner";
import { StageDrawer } from "@/components/ui/stage-drawer";
import { ParcelMap } from "@/components/maps/parcel-map";
import { zonePalette } from "@/components/maps/zone-palette";
import { useDemo } from "@/features/demo/demo-context";
import { useModuleTitle, useTerm } from "@/features/config/use-config";
import { measureOutline } from "@/features/sites/mapping/mapping-model";
import type { Position, Site } from "@/features/demo/types";
import { formatDate } from "@/lib/format";
import {
  buildCaptures,
  countColor,
  progressColor,
  phaseOf,
  phases,
  plannedAt,
  vigorColor,
  type CapturePoint,
} from "./evolution";
import { summarizeFollowUps } from "@/features/flights/follow-up";
import { issuesFor, type Issue } from "./issues";
import { IssueSheet } from "./issue-sheet";
import { LineChart, type ChartSeries } from "./line-chart";
import { comparisonSummary, narrate, type Line } from "./narrative";
import { DeliverablesHelp, ModelBar, type ModelStatus } from "./model-panel";
import { TimelineBar } from "./timeline-bar";
import type { LoadedModel, Up } from "@/components/evolution/model-loader";
import styles from "./evolution.module.css";

const BuildingScene = dynamic(
  () =>
    import("@/components/evolution/building-scene").then(
      (module) => module.BuildingScene,
    ),
  {
    ssr: false,
    loading: () => (
      <div className={styles.sceneLoading}>
        <PropellerSpinner label="Cargando" />
        <span>Preparando el modelo…</span>
      </div>
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
  if (site.sector === "mining")
    return `${number(point.mean, 0)} % de la excavación planeada`;
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
  const moduleTitle = useModuleTitle("evolucion");
  const { site, flights, findings } = useDemo();
  // A road's average advance counts each stretch by its length, not as one more number.
  const captures = useMemo(
    () =>
      buildCaptures(
        site,
        flights,
        findings,
        site.sector === "roads"
          ? Object.fromEntries(
              site.zones.map((zone) => [
                zone.id,
                measureOutline("line", zone.outline),
              ]),
            )
          : undefined,
      ),
    [site, flights, findings],
  );
  return (
    <div className={styles.view}>
      <PageHeading
        title={moduleTitle}
        description={`Cómo ha cambiado ${site.name} vuelo a vuelo, y dónde está pasando algo. Los valores son de ejemplo, inventados para la demo.`}
      />
      {captures.length < 2 ? (
        <EmptyState
          level={2}
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
  const t = useTerm();
  const findingWord = {
    singular: t("finding").toLowerCase(),
    plural: t("finding", "plural").toLowerCase(),
  };
  const measures = useMemo(() => summarizeFollowUps(findings), [findings]);
  const last = captures.length - 1;
  const [picked, setPicked] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [refPicked, setRefPicked] = useState(0);
  const [issueId, setIssueId] = useState<string>();
  const [models, setModels] = useState<Record<string, LoadedModel>>({});
  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    state: "idle",
  });
  const [up, setUp] = useState<Up>("z");
  const modelsRef = useRef(models);

  useEffect(() => {
    modelsRef.current = models;
  }, [models]);
  useEffect(
    () => () =>
      Object.values(modelsRef.current).forEach((item) => item.dispose()),
    [],
  );
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
  const comparison = useMemo(
    () =>
      comparisonSummary({
        site,
        captures,
        index,
        referenceIndex: refIndex,
        zoneNames,
        findings,
        findingWord,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [site, captures, index, refIndex, zoneNames, findings, findingWord.plural],
  );
  const selected = issues.find((item) => item.id === issueId);

  async function loadModel(file: File) {
    const flightId = current.flightId;
    setModelStatus({ state: "loading", name: file.name });
    const { loadDeliverable } =
      await import("@/components/evolution/model-loader");
    const result = await loadDeliverable(file, up);
    if (!result.ok)
      return setModelStatus({ state: "error", text: result.error });
    setModels((all) => {
      all[flightId]?.dispose();
      return { ...all, [flightId]: result.model };
    });
    setModelStatus({ state: "idle" });
  }
  function clearModel() {
    setModels((all) => {
      all[current.flightId]?.dispose();
      const rest = { ...all };
      delete rest[current.flightId];
      return rest;
    });
    setModelStatus({ state: "idle" });
  }
  const model = models[current.flightId] ?? null;

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
            ? `${issues.length} ${issues.length === 1 ? findingWord.singular : findingWord.plural} en este vuelo`
            : `Sin ${findingWord.plural} en este vuelo`}
        </span>
      </header>

      <div className={styles.body}>
        <StageDrawer
          drawerLabel="Detalle de la evolución"
          stage={
            <>
              <div className={styles.stage}>
                {site.sector === "construction" && (
                  <ModelBar
                    loaded={model?.name}
                    info={model?.info}
                    status={modelStatus}
                    up={up}
                    onUp={setUp}
                    onFile={(file) => void loadModel(file)}
                    onClear={clearModel}
                  />
                )}
                {site.sector === "construction" ? (
                  <BuildingScene
                    levels={current.levels ?? 0}
                    planned={target}
                    reference={index > 0 ? (reference.levels ?? 0) : null}
                    model={model}
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
                noun={findingWord}
                onSelect={go}
                onTogglePlay={togglePlay}
              />
              <Legend site={site} />
              <p className={styles.legendText}>
                Datos de ejemplo: los valores por zona son inventados.
                {site.sector === "construction"
                  ? " La figura es esquemática."
                  : " Solo el mapa de fondo es una imagen real del lugar."}
              </p>
            </>
          }
          drawer={
            selected && sheetSeries ? (
              <IssueSheet
                issue={selected}
                series={sheetSeries.points}
                seriesLabel={sheetSeries.label}
                listLabel={`Todos los ${findingWord.plural}`}
                seriesNote={sheetSeries.note}
                format={sheetSeries.format}
                yDomain={sheetSeries.yDomain}
                onBack={() => setIssueId(undefined)}
              />
            ) : (
              <div className={styles.overview}>
                <header>
                  <h3>Qué pasa en este vuelo</h3>
                  <p>
                    Toque un marcador del escenario o un {findingWord.singular}{" "}
                    de la lista. Unos los marca quien vuela; otros salen de
                    comparar los valores de un vuelo con otro.
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
                {comparison.length > 0 && (
                  <section
                    className={styles.comparison}
                    aria-label="Frente a la fecha de comparación"
                  >
                    <ul>
                      {comparison.map((line, i) => (
                        <ReadingLine key={i} line={line} />
                      ))}
                    </ul>
                  </section>
                )}
                {measures.open +
                  measures.inProgress +
                  measures.closed +
                  measures.withoutMeasure >
                  0 && (
                  <p className={styles.measureLine}>
                    <strong>Medidas del sitio:</strong> {measures.open}{" "}
                    {measures.open === 1 ? "abierta" : "abiertas"} ·{" "}
                    {measures.inProgress} en corrección · {measures.closed}{" "}
                    {measures.closed === 1 ? "cerrada" : "cerradas"} ·{" "}
                    <span data-late={measures.overdue > 0}>
                      {measures.overdue}{" "}
                      {measures.overdue === 1 ? "vencida" : "vencidas"}
                    </span>
                    {measures.withoutMeasure > 0 &&
                      ` · ${measures.withoutMeasure} sin responsable`}
                    . Se asignan y se cierran en Vuelos.
                  </p>
                )}
                {issues.length ? (
                  <ul
                    className={styles.issueList}
                    aria-label={`${t("finding", "plural")} de este vuelo`}
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
                            {issue.measure && (
                              <small
                                className={styles.issueMeasure}
                                data-tone={issue.measure.tone}
                              >
                                Medida: {issue.measure.label.toLowerCase()}
                              </small>
                            )}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.allGood}>
                    <CircleCheck size={18} aria-hidden="true" />
                    Sin {findingWord.plural} en este vuelo.
                  </p>
                )}
                {site.sector === "construction" && <DeliverablesHelp />}
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
            Las figuras son esquemáticas, no reconstrucciones a partir de
            imágenes. Con datos reales, cada vuelo aportaría su ortomosaico,
            modelo de superficie o medida del verdor del cultivo (NDVI) ya
            procesados, alineados con puntos de control.
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
    // The curve of a finding's zone is the zone's own value (progress, vigor), not the finding.
    const note =
      issue.kind === "finding" && site.sector !== "security"
        ? "Es el valor de la zona; no mide este hallazgo."
        : undefined;
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
        note,
        format: fixed,
        yDomain: [0.3, 0.9] as [number, number],
      };
    if (site.sector === "security")
      return {
        points,
        label: "Novedades de la zona",
        note,
        format: (value: number) => number(value, 0),
        yDomain: [0, Math.max(2, ...points.map((p) => p.value))] as [
          number,
          number,
        ],
      };
    return {
      points,
      label: "Avance de la zona",
      note,
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
    label: levels
      ? "Niveles construidos"
      : site.sector === "roads"
        ? "Avance de la vía (ponderado por longitud)"
        : "Avance medio",
    note: undefined,
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

/** One shared empty outline: a fresh `[]` per render would redraw every zone and cut the fade. */
const noOutline: Position[] = [];

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
          : site.sector === "mining"
            ? progressColor(value)
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
      outline={noOutline}
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

/** «Lotes» → «lote». */
function singularLower(label: string) {
  const lower = label.toLowerCase();
  return lower.endsWith("ores") ? lower.slice(0, -2) : lower.replace(/s$/, "");
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
      ? `Color del ${singularLower(site.zoneLabel)}: vigor, de rojizo (bajo) a azul (alto). El vigor va de 0 (poco verdor) a 1 (mucho) y es una medida de ejemplo de qué tan sano se ve el cultivo desde arriba.`
      : site.sector === "security"
        ? "Color de la zona: más oscuro, más novedades."
        : site.sector === "mining"
          ? "Color del banco: más oscuro, más excavado frente a lo planeado."
          : "Azul: obra nueva desde la fecha de comparación. Arrastre para girar.";
  return <p className={styles.legendText}>{text}</p>;
}

function chartTitle(site: Site) {
  if (site.sector === "construction")
    return "Niveles construidos frente a lo previsto";
  if (site.sector === "roads") return "Avance acumulado frente a lo previsto";
  if (site.sector === "mining")
    return "Avance de la excavación frente a lo previsto";
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

  if (
    site.sector === "construction" ||
    site.sector === "roads" ||
    site.sector === "mining"
  ) {
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
            : site.sector === "roads"
              ? "Avance de la vía (ponderado por longitud)"
              : "Avance medio",
        color: "#1c6f8d",
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
        color: "#7a838a",
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
          site.sector === "construction" ? number(v, 1) : `${number(v, 0)} %`
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
