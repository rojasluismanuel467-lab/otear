"use client";

import { useState } from "react";
import { PageHeading } from "@/components/ui/page-heading";
import { ParcelMap } from "@/components/maps/parcel-map";
import { useDemo } from "@/features/demo/demo-context";
import type { Position } from "@/features/demo/types";
import { parseGeometry, splitPolygon, translateTo } from "@/lib/geo";
import {
  distribute,
  measureOutline,
  measureZones,
  outlineFromDeed,
  outlineFromHistory,
  outlineFromLidar,
  outlineKindFor,
  routesOf,
  sampleGeoJson,
  singularOf,
  toZones,
  formatMeasure,
  type DraftZone,
  type LidarInfo,
} from "./mapping-model";
import {
  DistributeStep,
  OutlineStep,
  OverviewStep,
  SourceStep,
} from "./mapping-steps";
import styles from "./site-mapping.module.css";

type Step = "overview" | "source" | "outline" | "distribute";
type Tool = "none" | "edit" | "cut" | "move";

const stepNumber: Record<Step, number> = {
  overview: 0,
  source: 1,
  outline: 2,
  distribute: 3,
};

function SiteMapping() {
  const { site, flights, replaceZones, setNotice } = useDemo();
  const kind = outlineKindFor(site.sector);
  const routes = routesOf(flights);
  const [step, setStep] = useState<Step>("overview");
  const [outline, setOutline] = useState<Position[]>([]);
  const [origin, setOrigin] = useState("");
  const [declared, setDeclared] = useState<number | null>(null);
  const [zones, setZones] = useState<DraftZone[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [tool, setTool] = useState<Tool>("none");
  const [fitKey, setFitKey] = useState(0);
  const [sourceError, setSourceError] = useState("");
  const [cutMessage, setCutMessage] = useState("");
  const [lidar, setLidar] = useState<LidarInfo | null>(null);
  const [proposalNote, setProposalNote] = useState("");
  const currentOutline =
    step === "overview" ? site.zones.flatMap((zone) => zone.outline) : outline;
  const outlineValid = outline.length >= (kind === "line" ? 2 : 3);

  function goTo(next: Step) {
    setStep(next);
    setTool("none");
    setCutMessage("");
    setFitKey((value) => value + 1);
  }

  function acceptOutline(
    points: Position[],
    note: string,
    declaredValue: number | null,
  ) {
    setOutline(points);
    setOrigin(note);
    setDeclared(declaredValue);
    setSourceError("");
    goTo("outline");
  }

  function handleHistory() {
    const points = outlineFromHistory(routes, kind);
    acceptOutline(
      points,
      `Calculado con ${routes.length} ${routes.length === 1 ? "vuelo" : "vuelos"} anteriores.`,
      null,
    );
  }

  function handleFile(text: string, fileName: string) {
    const result = parseGeometry(text, fileName);
    if ("error" in result) {
      setSourceError(result.error);
      return;
    }
    if (result.kind !== kind) {
      setSourceError(
        kind === "line"
          ? "Este sitio se mapea como un eje. Elija un archivo con una línea."
          : "Este sitio se mapea como un área. Elija un archivo con un polígono.",
      );
      return;
    }
    acceptOutline(
      result.points,
      `Leído de «${fileName}» en su navegador.`,
      null,
    );
  }

  function handleDeed(value: number, fileName: string) {
    acceptOutline(
      outlineFromDeed(site, value),
      `Forma aproximada${fileName ? ` para «${fileName}»` : ""}. Ajuste los puntos sobre el mapa.`,
      value,
    );
    setTool("edit");
  }

  function handleLidar(info: LidarInfo) {
    const size = (value: number) =>
      new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(
        value,
      );
    setLidar(info);
    acceptOutline(
      outlineFromLidar(site, info),
      `Modelo «${info.fileName}»: ${size(info.widthM)} × ${size(info.depthM)} m y ${size(info.heightM)} m de alto. Está en el centro del sitio; muévalo a su lugar.`,
      null,
    );
  }

  function handleMove(to: Position) {
    setOutline((points) => translateTo(points, to));
    setFitKey((value) => value + 1);
    setTool("none");
  }

  function handlePropose(next: DraftZone[], note: string) {
    setZones(next);
    setProposalNote(note);
    setSelectedId(undefined);
    setCutMessage("");
  }

  function handleDraw() {
    setOutline([]);
    setLidar(null);
    setOrigin("");
    setDeclared(null);
    setSourceError("");
    goTo("outline");
    setTool("edit");
  }

  function startDistribution(count: number, axis: "ns" | "ew") {
    setZones(distribute(site, outline, count, axis));
    setSelectedId(undefined);
    setCutMessage("");
  }

  function handleNext() {
    const initial = Math.min(Math.max(site.zones.length || 4, 1), 12);
    setZones(distribute(site, outline, initial, "ew"));
    setSelectedId(undefined);
    goTo("distribute");
  }

  function handleCut(a: Position, b: Position) {
    let crossed = 0;
    const next: DraftZone[] = [];
    let serial = zones.length;
    for (const zone of zones) {
      const parts = splitPolygon(zone.outline, a, b);
      if (parts.length === 2) {
        crossed += 1;
        next.push({ ...zone, outline: parts[0] });
        serial += 1;
        next.push({
          id: `draft-${Date.now()}-${serial}`,
          name: `${singularOf(site.zoneLabel)} ${serial}`,
          use: zone.use,
          outline: parts[1],
        });
      } else {
        next.push(zone);
      }
    }
    setCutMessage(
      crossed
        ? `La línea dividió ${crossed} ${crossed === 1 ? "zona" : "zonas"}. Revise los nombres.`
        : "La línea no cruza ninguna zona. Trace otra sobre el área.",
    );
    if (crossed) setZones(next);
    setTool("none");
  }

  function handleApply() {
    const result = replaceZones(site.id, toZones(site, zones));
    setNotice(
      `Distribución guardada solo en esta sesión. ${result.flights} vuelos y ${result.findings} hallazgos quedaron asociados a ${site.zoneLabel.toLowerCase()}.`,
    );
    goTo("overview");
  }

  const mode =
    step === "outline" && tool === "edit"
      ? "edit-outline"
      : step === "outline" && tool === "move"
        ? "move"
        : step === "distribute" && tool === "cut"
          ? "cut"
          : "view";
  const mapZones =
    step === "overview" ? site.zones : step === "distribute" ? zones : [];
  const overviewTotal = measureZones(kind, site.zones);
  const outlineMeasure = outlineValid ? measureOutline(kind, outline) : 0;

  return (
    <div className={styles.view}>
      <PageHeading
        title={`Mapa y ${site.zoneLabel.toLowerCase()}`}
        description={`Parta de lo que ya existe y repártalo en ${site.zoneLabel.toLowerCase()}. Así los vuelos, hallazgos y costos hablan de lo mismo.`}
      />
      <section className={`surface ${styles.stage}`}>
        <aside
          className={`rail-panel ${styles.rail}`}
          aria-label="Asistente de mapeo"
        >
          {step !== "overview" && (
            <p
              className={styles.progress}
              aria-label={`Paso ${stepNumber[step]} de 3`}
            >
              Paso {stepNumber[step]} de 3
              <span
                style={
                  { "--step": stepNumber[step] / 3 } as React.CSSProperties
                }
                aria-hidden="true"
              />
            </p>
          )}
          <div className={styles.step} key={step}>
            {step === "overview" && (
              <OverviewStep
                site={site}
                kind={kind}
                total={overviewTotal}
                selectedZoneId={selectedId}
                onSelect={setSelectedId}
                onStart={() => {
                  setSourceError("");
                  goTo("source");
                }}
              />
            )}
            {step === "source" && (
              <SourceStep
                site={site}
                kind={kind}
                routeCount={routes.length}
                error={sourceError}
                onHistory={handleHistory}
                onFile={handleFile}
                onSample={() =>
                  handleFile(sampleGeoJson(site), "predio-de-ejemplo.geojson")
                }
                onLidar={handleLidar}
                onDeed={handleDeed}
                onDraw={handleDraw}
                onBack={() => goTo("overview")}
              />
            )}
            {step === "outline" && (
              <OutlineStep
                site={site}
                kind={kind}
                outline={outline}
                origin={origin}
                declared={declared}
                canMove={lidar !== null}
                tool={tool}
                onToolChange={setTool}
                onUndo={() => setOutline((points) => points.slice(0, -1))}
                onClear={() => setOutline([])}
                onBack={() => goTo("source")}
                onNext={handleNext}
              />
            )}
            {step === "distribute" && (
              <DistributeStep
                site={site}
                kind={kind}
                zones={zones}
                selectedId={selectedId}
                initialCount={zones.length || 4}
                outlineMeasure={outlineMeasure}
                tool={tool}
                cutMessage={cutMessage}
                linkedFlights={flights.length}
                routes={routes}
                outline={outline}
                lidar={lidar}
                proposalNote={proposalNote}
                onPropose={handlePropose}
                onSelect={setSelectedId}
                onDistribute={startDistribution}
                onRename={(id, name) =>
                  setZones((items) =>
                    items.map((zone) =>
                      zone.id === id ? { ...zone, name } : zone,
                    ),
                  )
                }
                onUse={(id, use) =>
                  setZones((items) =>
                    items.map((zone) =>
                      zone.id === id ? { ...zone, use } : zone,
                    ),
                  )
                }
                onToolChange={setTool}
                onBack={() => goTo("outline")}
                onApply={handleApply}
              />
            )}
          </div>
        </aside>
        <div className={styles.mapStage}>
          <ParcelMap
            siteName={site.name}
            center={site.center}
            outline={step === "overview" ? [] : currentOutline}
            outlineKind={kind}
            zones={mapZones}
            selectedZoneId={selectedId}
            onSelectZone={setSelectedId}
            history={
              step === "source" || step === "outline" ? routes : undefined
            }
            mode={mode}
            onOutlineChange={setOutline}
            onCut={handleCut}
            onMove={handleMove}
            fitPoints={
              step === "overview"
                ? site.zones.flatMap((zone) => zone.outline)
                : step === "distribute"
                  ? outline
                  : undefined
            }
            fitKey={fitKey}
          />
          {step === "overview" && site.zones.length > 0 && (
            <span className={styles.mapTag}>
              {formatMeasure(kind, overviewTotal)}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

export function SiteMappingView() {
  const { site } = useDemo();
  return <SiteMapping key={site.id} />;
}
