"use client";

import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import {
  ArrowLeft,
  Boxes,
  Check,
  FileUp,
  History,
  Map as MapIcon,
  Move,
  PencilRuler,
  ScrollText,
  Scissors,
  Undo2,
} from "lucide-react";
import { zonePalette } from "@/components/maps/zone-palette";
import type { Position, Site } from "@/features/demo/types";
import { parseLasHeader } from "@/lib/geo";
import { AutoProposal } from "./auto-proposal";
import {
  defaultDeclared,
  describeDraft,
  formatMeasure,
  lidarFromHeader,
  measureOutline,
  sampleLidar,
  singularOf,
  zoneUses,
  type DraftZone,
  type LidarInfo,
  type OutlineKind,
  type SourceKind,
} from "./mapping-model";
import styles from "./site-mapping.module.css";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function OverviewStep({
  site,
  kind,
  total,
  selectedZoneId,
  onSelect,
  onStart,
}: {
  site: Site;
  kind: OutlineKind;
  total: number;
  selectedZoneId?: string;
  onSelect: (id: string) => void;
  onStart: () => void;
}) {
  const noun = site.zoneLabel.toLowerCase();
  return (
    <>
      <header className={styles.stepHeader}>
        <h2>{site.name}</h2>
        <p>
          {site.zones.length
            ? `${site.zones.length} ${noun} · ${formatMeasure(kind, total)} en total`
            : `Todavía no hay ${noun} definidos.`}
        </p>
      </header>
      {site.zones.length ? (
        <ol className={styles.zoneList} aria-label={site.zoneLabel}>
          {site.zones.map((zone, index) => (
            <li key={zone.id}>
              <button
                type="button"
                className={styles.zoneRow}
                aria-pressed={zone.id === selectedZoneId}
                onClick={() => onSelect(zone.id)}
              >
                <i
                  style={{
                    background: zonePalette[index % zonePalette.length],
                  }}
                  aria-hidden="true"
                />
                <span>
                  <strong>{zone.name}</strong>
                  <small>{zone.description}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
      <div className={styles.callout}>
        <MapIcon size={20} aria-hidden="true" />
        <p>
          Otear puede proponer el contorno de {site.name} a partir de sus
          vuelos, de un mapa que ya tengan o de la escritura. Luego usted lo
          reparte en {noun}.
        </p>
      </div>
      <Button variant="primary" onPress={onStart}>
        <MapIcon size={17} aria-hidden="true" />
        {site.zones.length ? "Mapear de nuevo" : "Mapear este sitio"}
      </Button>
      <p className="demo-note">
        Geometrías de ejemplo. No es un levantamiento topográfico ni un dato
        catastral.
      </p>
    </>
  );
}

function sourceCopy(
  site: Site,
  kind: OutlineKind,
): Record<SourceKind, { title: string; text: string }> {
  const deedTitle =
    site.sector === "construction"
      ? "La licencia o el plano del lote"
      : site.sector === "roads"
        ? "El inventario o el contrato"
        : "La escritura o el plano";
  return {
    history: {
      title: "Mis vuelos anteriores",
      text:
        kind === "line"
          ? "Calcula la línea central de la vía con los recorridos que ya volaron."
          : "Calcula el contorno con la zona que ya sobrevolaron.",
    },
    file: {
      title: "Un mapa que ya tengo",
      text: "Archivo KML o GeoJSON de Google Earth, QGIS, el IGAC o su topógrafo.",
    },
    lidar: {
      title: "Un modelo LiDAR",
      text: "Nube de puntos LAS del edificio. Se toma su huella y su altura.",
    },
    deed: {
      title: deedTitle,
      text:
        kind === "line"
          ? "Use la longitud que dice el documento para proponer un eje que usted ajusta."
          : "Use el área declarada para proponer una forma que usted ajusta.",
    },
    draw: {
      title: "Dibujarlo yo",
      text: "Marca los puntos sobre el mapa, uno por uno.",
    },
  };
}

const sourceIcons = {
  history: History,
  file: FileUp,
  lidar: Boxes,
  deed: ScrollText,
  draw: PencilRuler,
} as const;

export function SourceStep({
  site,
  kind,
  routeCount,
  onHistory,
  onFile,
  onSample,
  onLidar,
  onDeed,
  onDraw,
  onBack,
  error,
}: {
  site: Site;
  kind: OutlineKind;
  routeCount: number;
  onHistory: () => void;
  onFile: (text: string, fileName: string) => void;
  onSample: () => void;
  onLidar: (lidar: LidarInfo) => void;
  onDeed: (declared: number, fileName: string) => void;
  onDraw: () => void;
  onBack: () => void;
  error: string;
}) {
  const [source, setSource] = useState<SourceKind>(
    routeCount ? "history" : "file",
  );
  const [declared, setDeclared] = useState(String(defaultDeclared(site)));
  const [localError, setLocalError] = useState("");
  const [deedName, setDeedName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const deedInput = useRef<HTMLInputElement>(null);
  const copy = sourceCopy(site, kind);
  const lidarInput = useRef<HTMLInputElement>(null);
  const sources = (
    site.sector === "construction"
      ? ["history", "file", "lidar", "deed", "draw"]
      : ["history", "file", "deed", "draw"]
  ) as SourceKind[];
  const unit = kind === "line" ? "km" : "ha";

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setLocalError("El archivo supera 5 MB. Prueba con uno más liviano.");
      return;
    }
    setLocalError("");
    onFile(await file.text(), file.name);
  }

  async function handleLidar(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!/\.las$/i.test(file.name)) {
      setLocalError("Elija un archivo LAS. LAZ y E57 aún no se admiten.");
      return;
    }
    const header = parseLasHeader(await file.slice(0, 375).arrayBuffer());
    if ("error" in header) {
      setLocalError(header.error);
      return;
    }
    setLocalError("");
    onLidar(lidarFromHeader(header, file.name));
  }

  function handleDeed() {
    const value = Number(declared.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setLocalError(
        `Escribe el ${kind === "line" ? "largo" : "área"} en ${unit}.`,
      );
      return;
    }
    setLocalError("");
    onDeed(value, deedName);
  }

  return (
    <>
      <header className={styles.stepHeader}>
        <h2>¿De dónde partimos?</h2>
        <p>Elija lo que ya tenga. Después ajusta el resultado.</p>
      </header>
      <div
        className={styles.sourceList}
        role="radiogroup"
        aria-label="Origen del mapa"
      >
        {sources.map((key) => {
          const Icon = sourceIcons[key];
          const selected = source === key;
          return (
            <div
              className={styles.sourceItem}
              key={key}
              data-selected={selected}
            >
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                className={styles.sourceRow}
                onClick={() => {
                  setSource(key);
                  setLocalError("");
                }}
              >
                <span className={styles.sourceIcon}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span>
                  <strong>{copy[key].title}</strong>
                  <small>{copy[key].text}</small>
                </span>
              </button>
              {selected && (
                <div className={styles.sourceBody}>
                  {key === "history" && (
                    <>
                      <p>
                        {routeCount
                          ? `Hay ${routeCount} ${routeCount === 1 ? "vuelo" : "vuelos"} con recorrido guardado.`
                          : "Todavía no hay vuelos con recorrido en este sitio."}
                      </p>
                      <Button
                        variant="primary"
                        isDisabled={!routeCount}
                        onPress={onHistory}
                      >
                        Calcular contorno
                      </Button>
                    </>
                  )}
                  {key === "file" && (
                    <>
                      <input
                        ref={fileInput}
                        type="file"
                        accept=".kml,.geojson,.json"
                        className={styles.hiddenInput}
                        aria-label="Elegir archivo KML o GeoJSON"
                        onChange={(event) => {
                          void handleFile(event.target.files);
                          event.target.value = "";
                        }}
                      />
                      <div className={styles.inline}>
                        <Button
                          variant="primary"
                          onPress={() => fileInput.current?.click()}
                        >
                          <FileUp size={16} aria-hidden="true" />
                          Elegir archivo
                        </Button>
                        <Button variant="secondary" onPress={onSample}>
                          Probar con un ejemplo
                        </Button>
                      </div>
                      <p className={styles.hint}>
                        Se lee en su navegador; no se envía a ningún servidor.
                        Shapefile y DXF aún no se admiten.
                      </p>
                    </>
                  )}
                  {key === "lidar" && (
                    <>
                      <input
                        ref={lidarInput}
                        type="file"
                        accept=".las"
                        className={styles.hiddenInput}
                        aria-label="Elegir modelo LiDAR en formato LAS"
                        onChange={(event) => {
                          void handleLidar(event.target.files);
                          event.target.value = "";
                        }}
                      />
                      <div className={styles.inline}>
                        <Button
                          variant="primary"
                          onPress={() => lidarInput.current?.click()}
                        >
                          <Boxes size={16} aria-hidden="true" />
                          Elegir modelo LAS
                        </Button>
                        <Button
                          variant="secondary"
                          onPress={() => onLidar(sampleLidar())}
                        >
                          Probar con un ejemplo
                        </Button>
                      </div>
                      <p className={styles.hint}>
                        Solo se lee el encabezado del archivo, en su navegador.
                        El encabezado no trae la posición en el mapa: el
                        edificio se ubica en el centro del sitio y usted lo
                        mueve.
                      </p>
                    </>
                  )}
                  {key === "deed" && (
                    <>
                      <label className="form-field">
                        <span className="field-label">
                          {kind === "line" ? "Longitud" : "Área"} que dice el
                          documento ({unit})
                        </span>
                        <input
                          className="field-input"
                          inputMode="decimal"
                          value={declared}
                          onChange={(event) => setDeclared(event.target.value)}
                        />
                      </label>
                      <input
                        ref={deedInput}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className={styles.hiddenInput}
                        aria-label="Elegir la escritura o el plano"
                        onChange={(event) => {
                          setDeedName(event.target.files?.[0]?.name ?? "");
                          event.target.value = "";
                        }}
                      />
                      <div className={styles.inline}>
                        <Button
                          variant="secondary"
                          onPress={() => deedInput.current?.click()}
                        >
                          <ScrollText size={16} aria-hidden="true" />
                          {deedName || "Adjuntar escritura (opcional)"}
                        </Button>
                        <Button variant="primary" onPress={handleDeed}>
                          Proponer contorno
                        </Button>
                      </div>
                      <p className={styles.hint}>
                        Otear no lee el contenido del documento: dibuja una
                        forma aproximada con esa medida, que usted debe ajustar
                        sobre el mapa.
                      </p>
                    </>
                  )}
                  {key === "draw" && (
                    <Button variant="primary" onPress={onDraw}>
                      <PencilRuler size={16} aria-hidden="true" />
                      Empezar a dibujar
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {(error || localError) && (
        <p className={styles.error} role="alert">
          {error || localError}
        </p>
      )}
      <Button variant="ghost" onPress={onBack}>
        <ArrowLeft size={16} aria-hidden="true" />
        Volver
      </Button>
    </>
  );
}

export function OutlineStep({
  site,
  kind,
  outline,
  origin,
  declared,
  canMove,
  tool,
  onToolChange,
  onUndo,
  onClear,
  onBack,
  onNext,
}: {
  site: Site;
  kind: OutlineKind;
  outline: Position[];
  origin: string;
  declared: number | null;
  canMove: boolean;
  tool: "none" | "edit" | "cut" | "move";
  onToolChange: (tool: "none" | "edit" | "cut" | "move") => void;
  onUndo: () => void;
  onClear: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const measure =
    outline.length >= (kind === "line" ? 2 : 3)
      ? measureOutline(kind, outline)
      : 0;
  const valid = measure > 0;
  const difference =
    declared && valid ? ((measure - declared) / declared) * 100 : null;
  return (
    <>
      <header className={styles.stepHeader}>
        <h2>Revise el contorno</h2>
        <p>{origin || "Dibuje los puntos sobre el mapa."}</p>
      </header>
      <dl className={styles.facts}>
        <div>
          <dt>
            {kind === "line" ? "Longitud del eje" : "Área medida en el mapa"}
          </dt>
          <dd>{valid ? formatMeasure(kind, measure) : "Sin medir"}</dd>
        </div>
        {declared !== null && (
          <div>
            <dt>Dice el documento</dt>
            <dd>{formatMeasure(kind, declared)}</dd>
          </div>
        )}
      </dl>
      {difference !== null && (
        <p
          className={Math.abs(difference) > 5 ? styles.warning : styles.ok}
          role="status"
        >
          {Math.abs(difference) <= 5
            ? "La medida coincide con el documento (diferencia menor a 5 %)."
            : `La medida difiere ${Math.abs(difference).toFixed(0)} % del documento. Ajuste los puntos o revise con su topógrafo.`}
        </p>
      )}
      <div className={styles.tools}>
        <Button
          variant={tool === "edit" ? "primary" : "secondary"}
          aria-pressed={tool === "edit"}
          onPress={() => onToolChange(tool === "edit" ? "none" : "edit")}
        >
          <PencilRuler size={16} aria-hidden="true" />
          {tool === "edit" ? "Terminar de ajustar" : "Ajustar puntos"}
        </Button>
        {canMove && (
          <Button
            variant={tool === "move" ? "primary" : "secondary"}
            aria-pressed={tool === "move"}
            onPress={() => onToolChange(tool === "move" ? "none" : "move")}
          >
            <Move size={16} aria-hidden="true" />
            {tool === "move" ? "Cancelar" : "Mover contorno"}
          </Button>
        )}
        <Button variant="ghost" isDisabled={!outline.length} onPress={onUndo}>
          <Undo2 size={16} aria-hidden="true" />
          Quitar último
        </Button>
        <Button variant="ghost" isDisabled={!outline.length} onPress={onClear}>
          Empezar de nuevo
        </Button>
      </div>
      <p className={styles.hint}>
        {kind === "line"
          ? `El eje de ${site.name} se dividirá en tramos por abscisa.`
          : `Con este contorno podrá repartir ${site.name} en ${site.zoneLabel.toLowerCase()}.`}
      </p>
      <div className={styles.footerActions}>
        <Button variant="ghost" onPress={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Cambiar origen
        </Button>
        <Button variant="primary" isDisabled={!valid} onPress={onNext}>
          Continuar
        </Button>
      </div>
    </>
  );
}

export function DistributeStep({
  site,
  kind,
  zones,
  selectedId,
  initialCount,
  outlineMeasure,
  tool,
  cutMessage,
  linkedFlights,
  routes,
  outline,
  lidar,
  proposalNote,
  onPropose,
  onSelect,
  onDistribute,
  onRename,
  onUse,
  onToolChange,
  onBack,
  onApply,
}: {
  site: Site;
  kind: OutlineKind;
  zones: DraftZone[];
  selectedId?: string;
  initialCount: number;
  outlineMeasure: number;
  tool: "none" | "edit" | "cut" | "move";
  cutMessage: string;
  linkedFlights: number;
  routes: Position[][];
  outline: Position[];
  lidar: LidarInfo | null;
  proposalNote: string;
  onPropose: (zones: DraftZone[], note: string) => void;
  onSelect: (id: string) => void;
  onDistribute: (count: number, axis: "ns" | "ew") => void;
  onRename: (id: string, name: string) => void;
  onUse: (id: string, use: string) => void;
  onToolChange: (tool: "none" | "edit" | "cut" | "move") => void;
  onBack: () => void;
  onApply: () => void;
}) {
  const noun = site.zoneLabel.toLowerCase();
  const [count, setCount] = useState(String(initialCount));
  const [axis, setAxis] = useState<"ns" | "ew">("ew");
  const total = zones.reduce(
    (sum, zone) => sum + measureOutline(kind, zone.outline),
    0,
  );
  const parsed = Math.round(Number(count));
  const countValid = Number.isFinite(parsed) && parsed >= 1 && parsed <= 24;
  return (
    <>
      <header className={styles.stepHeader}>
        <h2>Reparta {site.name}</h2>
        <p>
          {kind === "line"
            ? "Divida el eje en tramos. Cada uno lleva su abscisa."
            : `Dígame cuántos ${noun} tiene y cómo se reparten; luego ajusta nombres y usos.`}
        </p>
      </header>
      <AutoProposal
        site={site}
        kind={kind}
        outline={outline}
        routes={routes}
        lidar={lidar}
        onPropose={onPropose}
      />
      {proposalNote && (
        <p className={styles.ok} role="status">
          {proposalNote}
        </p>
      )}
      <div className={styles.assistant}>
        <label className="form-field">
          <span className="field-label">
            O repártalo en partes iguales: ¿cuántos {noun} tiene?
          </span>
          <input
            className="field-input"
            type="number"
            min={1}
            max={24}
            value={count}
            onChange={(event) => setCount(event.target.value)}
          />
        </label>
        {kind === "polygon" && (
          <div
            className="segmented-control"
            role="group"
            aria-label="Dirección del reparto"
          >
            <button
              type="button"
              aria-pressed={axis === "ew"}
              onClick={() => setAxis("ew")}
            >
              Franjas verticales
            </button>
            <button
              type="button"
              aria-pressed={axis === "ns"}
              onClick={() => setAxis("ns")}
            >
              Franjas horizontales
            </button>
          </div>
        )}
        <Button
          variant="secondary"
          isDisabled={!countValid}
          onPress={() => onDistribute(parsed, axis)}
        >
          Repartir en {countValid ? parsed : "…"}
        </Button>
      </div>
      <div className={styles.zoneHeading}>
        <h3>
          {zones.length}{" "}
          {zones.length === 1 ? singularOf(site.zoneLabel).toLowerCase() : noun}
        </h3>
        <span>
          {formatMeasure(kind, total)} de {formatMeasure(kind, outlineMeasure)}
        </span>
      </div>
      {kind === "polygon" && (
        <div className={styles.tools}>
          <Button
            variant={tool === "cut" ? "primary" : "secondary"}
            aria-pressed={tool === "cut"}
            onPress={() => onToolChange(tool === "cut" ? "none" : "cut")}
          >
            <Scissors size={16} aria-hidden="true" />
            {tool === "cut" ? "Cancelar corte" : `Dividir con una línea`}
          </Button>
        </div>
      )}
      {cutMessage && (
        <p className={styles.hint} role="status">
          {cutMessage}
        </p>
      )}
      <ol className={styles.editList}>
        {zones.map((zone, index) => (
          <li
            key={zone.id}
            className={styles.editRow}
            data-selected={zone.id === selectedId}
          >
            <button
              type="button"
              className={styles.swatch}
              style={{ background: zonePalette[index % zonePalette.length] }}
              aria-label={`Resaltar ${zone.name} en el mapa`}
              onClick={() => onSelect(zone.id)}
            />
            <div className={styles.editFields}>
              <input
                className="field-input"
                value={zone.name}
                aria-label={`Nombre del ${singularOf(site.zoneLabel).toLowerCase()} ${index + 1}`}
                maxLength={40}
                onFocus={() => onSelect(zone.id)}
                onChange={(event) => onRename(zone.id, event.target.value)}
              />
              {kind === "polygon" ? (
                <select
                  className="field-select"
                  value={zone.use}
                  aria-label={`Uso de ${zone.name}`}
                  onChange={(event) => onUse(zone.id, event.target.value)}
                >
                  {zoneUses[site.sector].map((use) => (
                    <option key={use}>{use}</option>
                  ))}
                </select>
              ) : null}
              <small>{describeDraft(kind, zones, index)}</small>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.hint}>
        {linkedFlights > 0
          ? `Al aplicar, los ${linkedFlights} vuelos y sus hallazgos se vuelven a asociar según su ubicación.`
          : "Al aplicar, los vuelos se asocian según su ubicación."}
      </p>
      <div className={styles.footerActions}>
        <Button variant="ghost" onPress={onBack}>
          <ArrowLeft size={16} aria-hidden="true" />
          Contorno
        </Button>
        <Button variant="primary" isDisabled={!zones.length} onPress={onApply}>
          <Check size={17} aria-hidden="true" />
          Usar este reparto
        </Button>
      </div>
    </>
  );
}
