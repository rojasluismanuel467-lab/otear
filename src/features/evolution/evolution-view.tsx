"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import { CircleCheck, Info, Pause, Play, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeading } from "@/components/ui/page-heading";
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
import { LineChart, type ChartSeries } from "./line-chart";
import { narrate, type Line } from "./narrative";
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
    return `${number(levels)} ${levels === 1 ? "nivel" : "niveles"}`;
  }
  if (site.sector === "roads") return `${number(point.mean, 0)} % de avance`;
  if (site.sector === "agriculture") return `Vigor ${fixed(point.mean)}`;
  const total = Object.values(point.values).reduce(
    (sum, value) => sum + value,
    0,
  );
  return `${total} ${total === 1 ? "novedad" : "novedades"}`;
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
        description={`Cómo ha cambiado ${site.name} vuelo a vuelo: qué se construyó, qué avanzó y qué se quedó quieto.`}
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
  const last = captures.length - 1;
  const [picked, setPicked] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [refPicked, setRefPicked] = useState(0);
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

  const lines = useMemo(
    () =>
      narrate({ site, captures, index, referenceIndex: refIndex, zoneNames }),
    [site, captures, index, refIndex, zoneNames],
  );

  function togglePlay() {
    if (isPlaying) return setPlaying(false);
    if (index >= last) setPicked(0);
    setPlaying(true);
  }

  return (
    <section className={`surface ${styles.stage}`}>
      <aside
        className={`rail-panel ${styles.rail}`}
        aria-label="Vuelos en el tiempo"
      >
        <header className={styles.railHeader}>
          <h2>Línea de tiempo</h2>
          <p>
            {captures.length} vuelos ·{" "}
            {formatDate(captures[0].date, { day: "numeric", month: "short" })} a{" "}
            {formatDate(captures[last].date, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </header>
        <ol className={styles.dates} aria-label="Vuelos medidos">
          {captures.map((point, i) => (
            <li
              key={point.flightId}
              style={{ "--i": i } as React.CSSProperties}
            >
              <button
                type="button"
                className={styles.dateRow}
                aria-pressed={i === index}
                data-reference={
                  i === refIndex && i !== index ? "true" : undefined
                }
                onClick={() => {
                  setPlaying(false);
                  setPicked(i);
                }}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span className={styles.dateBody}>
                  <strong>
                    {formatDate(point.date, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                  <span>{valueText(site, point)}</span>
                  {i === refIndex && i !== index && (
                    <small>Fecha de comparación</small>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <div className={styles.detail}>
        <div className={styles.controls}>
          <Button
            variant="secondary"
            onPress={togglePlay}
            aria-label={
              isPlaying ? "Pausar la reproducción" : "Reproducir la evolución"
            }
          >
            {isPlaying ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            {isPlaying ? "Pausar" : "Reproducir"}
          </Button>
          <label className={styles.slider}>
            <span>Fecha: {formatDate(current.date)}</span>
            <input
              type="range"
              min={0}
              max={last}
              step={1}
              value={index}
              onChange={(event) => {
                setPlaying(false);
                setPicked(Number(event.target.value));
              }}
              aria-valuetext={`Vuelo ${index + 1} de ${captures.length}, ${formatDate(current.date)}`}
            />
          </label>
          <label className={styles.compare}>
            <span>Comparar con</span>
            <select
              className="field-select"
              value={refIndex}
              disabled={index === 0}
              onChange={(event) => setRefPicked(Number(event.target.value))}
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
        </div>

        <div className={styles.visual} key={site.sector}>
          {site.sector === "construction" && (
            <ConstructionVisual
              site={site}
              current={current}
              reference={index > 0 ? reference : undefined}
              zoneNames={zoneNames}
            />
          )}
          {site.sector === "roads" && (
            <RoadsVisual site={site} current={current} />
          )}
          {(site.sector === "agriculture" || site.sector === "security") && (
            <ZoneMapVisual site={site} current={current} captures={captures} />
          )}
        </div>

        <section className={styles.block} aria-labelledby="reading-title">
          <h3 id="reading-title">Qué dicen los datos</h3>
          <ul className={styles.reading}>
            {lines.map((line, i) => (
              <ReadingLine key={i} line={line} />
            ))}
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="curve-title">
          <h3 id="curve-title">{chartTitle(site)}</h3>
          <EvolutionChart site={site} captures={captures} index={index} />
        </section>

        <p className={styles.note}>
          Los valores por zona son de ejemplo y las figuras son esquemáticas, no
          reconstrucciones a partir de imágenes. Con datos reales, cada vuelo
          aportaría su ortomosaico, modelo de superficie o índice NDVI ya
          procesado, alineado con puntos de control.
        </p>
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

function ConstructionVisual({
  site,
  current,
  reference,
  zoneNames,
}: {
  site: Site;
  current: CapturePoint;
  reference?: CapturePoint;
  zoneNames: Record<string, string>;
}) {
  const target = site.schedule?.targetLevels ?? 8;
  const built = current.levels ?? 0;
  const before = reference?.levels ?? 0;
  return (
    <div className={styles.constructionGrid}>
      <div className={styles.scene}>
        <BuildingScene
          levels={built}
          planned={target}
          reference={reference ? before : null}
        />
        <span className={styles.sceneTag}>
          Modelo esquemático · arrastre para girar
        </span>
      </div>
      <div className={styles.sidePanels}>
        <section aria-labelledby="levels-title">
          <h3 id="levels-title">Niveles</h3>
          <ol className={styles.levels}>
            {Array.from({ length: target }, (_, i) => target - i).map(
              (level) => {
                const done = built >= level;
                const partial = !done && built > level - 1;
                const isNew = reference && done && before < level;
                return (
                  <li
                    key={level}
                    data-state={done ? "done" : partial ? "partial" : "pending"}
                  >
                    <span>Nivel {level}</span>
                    <small>
                      {done
                        ? "Terminado"
                        : partial
                          ? `En obra · ${number((built - (level - 1)) * 100, 0)} %`
                          : "Pendiente"}
                      {isNew ? " · nuevo" : ""}
                    </small>
                  </li>
                );
              },
            )}
          </ol>
        </section>
        <section aria-labelledby="fronts-title">
          <h3 id="fronts-title">Frentes de obra</h3>
          <ul className={styles.bars}>
            {site.zones.map((zone) => {
              const value = current.values[zone.id] ?? 0;
              return (
                <li key={zone.id}>
                  <span>{zoneNames[zone.id]}</span>
                  <meter
                    min={0}
                    max={100}
                    value={value}
                    aria-label={`${zone.name}: ${number(value, 0)} %`}
                  />
                  <strong>{number(value, 0)} %</strong>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function RoadsVisual({ site, current }: { site: Site; current: CapturePoint }) {
  const colors = Object.fromEntries(
    site.zones.map((zone) => [
      zone.id,
      phaseOf(current.values[zone.id] ?? 0).color,
    ]),
  );
  return (
    <div className={styles.roads}>
      <ol className={styles.strip} aria-label="Tramos de la vía en orden">
        {site.zones.map((zone) => {
          const value = current.values[zone.id] ?? 0;
          const phase = phaseOf(value);
          return (
            <li key={zone.id} style={{ background: phase.color }}>
              <strong>{zone.name}</strong>
              <span>{number(value, 0)} %</span>
              <small>{phase.label}</small>
            </li>
          );
        })}
      </ol>
      <ul className={styles.legend} aria-label="Fases de la vía">
        {phases.map((phase) => (
          <li key={phase.label}>
            <span aria-hidden="true" style={{ background: phase.color }} />
            {phase.label}
          </li>
        ))}
      </ul>
      <MapBox site={site} colors={colors} />
    </div>
  );
}

function ZoneMapVisual({
  site,
  current,
  captures,
}: {
  site: Site;
  current: CapturePoint;
  captures: CapturePoint[];
}) {
  const max = Math.max(1, ...captures.flatMap((p) => Object.values(p.values)));
  const colors = Object.fromEntries(
    site.zones.map((zone) => {
      const value = current.values[zone.id] ?? 0;
      return [
        zone.id,
        site.sector === "agriculture"
          ? vigorColor(value)
          : countColor(value, max),
      ];
    }),
  );
  return (
    <div className={styles.zoneVisual}>
      <MapBox site={site} colors={colors} />
      <ul
        className={styles.zoneList}
        aria-label={
          site.sector === "agriculture"
            ? "Vigor por lote"
            : "Novedades por zona"
        }
      >
        {site.zones.map((zone) => {
          const value = current.values[zone.id] ?? 0;
          return (
            <li key={zone.id}>
              <span
                aria-hidden="true"
                style={{ background: colors[zone.id] }}
              />
              <strong>{zone.name}</strong>
              <em>{site.sector === "agriculture" ? fixed(value) : value}</em>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MapBox({
  site,
  colors,
}: {
  site: Site;
  colors: Record<string, string>;
}) {
  return (
    <div className={styles.mapBox}>
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
      />
    </div>
  );
}
