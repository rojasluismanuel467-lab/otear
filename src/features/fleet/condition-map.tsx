"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import {
  Camera,
  Eye,
  EyeOff,
  Plus,
  ScanLine,
  Trash2,
  Wrench,
} from "lucide-react";
import { PartSheet } from "./part-sheet";
import { StageDrawer } from "@/components/ui/stage-drawer";
import { partHistory } from "./parts-history";
import { UsagePanel } from "./usage-panel";
import { batteryCycles } from "./fleet";
import {
  heatColor,
  relativeUse,
  usageFor,
  type UsageInput,
} from "./parts-usage";
import type {
  ConditionSource,
  ScenePart,
  SceneStatus,
  ScenePick,
  ViewName,
} from "@/components/drone/condition-scene";
import { specKey } from "@/components/drone/drone-model";
import { DEMO_DATE } from "@/features/demo/demo-data";
import { useDemo } from "@/features/demo/demo-context";
import type { Aircraft, PartCondition, PartMark } from "@/features/demo/types";
import { droneOptionFor } from "@/features/drones/drone-catalog";
import { formatDate } from "@/lib/format";
import {
  conditionInfo,
  sizeFactor,
  sizeLabels,
  summarize,
  worstCondition,
} from "./condition";
import {
  catalogForModelKey,
  groupLabels,
  markPartName,
  nearestPart,
  partById,
  partLabel,
  sourcesOf,
  type PartDef,
} from "./parts-catalog";
import { readPhoto } from "./photo";
import styles from "./condition-map.module.css";

const ConditionScene = dynamic(
  () =>
    import("@/components/drone/condition-scene").then(
      (module) => module.ConditionScene,
    ),
  {
    ssr: false,
    loading: () => <div className={styles.loading}>Preparando el modelo…</div>,
  },
);

const MAX_SCAN_MB = 80;
/** Scans loaded in this browser tab, kept per aircraft while the demo is open. */
const scans = new Map<string, { name: string; url: string; key: string }>();

type Editor = {
  /** Present when editing a saved mark. */
  id?: string;
  point?: [number, number, number];
  size: PartMark["size"];
  part: string;
  condition: PartCondition;
  note: string;
  photo?: PartMark["photo"];
};

const conditions: PartCondition[] = ["ok", "watch", "replace"];

const viewButtons: { name: ViewName; label: string }[] = [
  { name: "three-quarter", label: "3/4" },
  { name: "front", label: "Frente" },
  { name: "rear", label: "Atrás" },
  { name: "left", label: "Izquierda" },
  { name: "right", label: "Derecha" },
  { name: "top", label: "Arriba" },
  { name: "bottom", label: "Abajo" },
];

export function ConditionMap({
  aircraft,
  hours,
}: {
  aircraft: Aircraft;
  hours: number;
}) {
  const {
    partMarks,
    savePartMark,
    removePartMark,
    addMaintenance,
    setNotice,
    flights,
    batteries,
    maintenance,
  } = useDemo();
  const option = droneOptionFor(`${aircraft.make} ${aircraft.model}`);
  const [scan, setScan] = useState(() => scans.get(aircraft.id) ?? null);
  const [mode, setMode] = useState<"model" | "scan">(scan ? "scan" : "model");
  const [status, setStatus] = useState<SceneStatus>("loading");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const [focus, setFocus] = useState<{
    point: [number, number, number];
    n: number;
  }>();
  const [view, setView] = useState<{ name: ViewName; n: number }>();
  const [showParts, setShowParts] = useState(false);
  const [lens, setLens] = useState<"inspection" | "wear">("wear");
  const [selection, setSelection] = useState<{
    partId?: string;
    index?: number;
    point: [number, number, number];
  } | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [scanError, setScanError] = useState("");
  const viewerRef = useRef<HTMLDivElement>(null);
  const editing = editor !== null;

  useEffect(() => {
    if (editing) viewerRef.current?.scrollIntoView({ block: "start" });
  }, [editing]);

  const source: ConditionSource =
    mode === "scan" && scan
      ? { kind: "scan", url: scan.url }
      : { kind: "spec", spec: option.spec };
  const modelKey = mode === "scan" && scan ? scan.key : specKey(option.spec);
  const sceneKey = mode === "scan" && scan ? scan.url : specKey(option.spec);
  const catalog = useMemo(() => catalogForModelKey(modelKey), [modelKey]);
  const catalogSources = sourcesOf(catalog);
  const anchored = catalog.parts.flatMap((part) =>
    (part.anchors ?? []).map((anchor, index) => ({ part, anchor, index })),
  );
  const sceneParts: ScenePart[] = anchored.map(
    ({ part, anchor, index }, i) => ({
      id: `${part.id}#${index}`,
      label: String(i + 1),
      text: `${i + 1}. ${partLabel(part)}${anchor.where ? ` · ${anchor.where}` : ""}`,
      point: anchor.point,
    }),
  );

  const marks = useMemo(
    () => partMarks.filter((mark) => mark.aircraftId === aircraft.id),
    [partMarks, aircraft.id],
  );
  const usageInput = useMemo<UsageInput>(
    () => ({
      hours,
      flights: flights
        .filter(
          (flight) =>
            flight.aircraftId === aircraft.id && flight.status === "completed",
        )
        .map((flight) => ({ date: flight.date })),
      records: maintenance.filter(
        (record) => record.aircraftId === aircraft.id,
      ),
      plan: aircraft.plan,
      batteries: batteries
        .filter((pack) => pack.aircraftId === aircraft.id && !pack.retired)
        .map((pack) => ({
          cycles: batteryCycles(pack, flights),
          maxCycles: pack.maxCycles,
        })),
    }),
    [hours, flights, maintenance, batteries, aircraft.id, aircraft.plan],
  );
  const usage = useMemo(
    () => usageFor(catalog.parts, usageInput),
    [catalog, usageInput],
  );
  const relative = useMemo(
    () =>
      relativeUse(
        usage,
        new Set(
          catalog.parts
            .filter((part) => part.anchors?.length)
            .map((part) => part.id),
        ),
      ),
    [usage, catalog],
  );
  const selectedPart = selection?.partId
    ? partById(catalog, selection.partId)
    : undefined;
  const selectedWhere =
    selectedPart && selection?.index !== undefined
      ? selectedPart.anchors?.[selection.index]?.where
      : undefined;
  const activePart =
    selection?.partId && selection.index !== undefined
      ? `${selection.partId}#${selection.index}`
      : undefined;
  const highlights = useMemo(() => {
    if (lens === "wear") {
      return catalog.parts.flatMap((part) =>
        (part.anchors ?? []).map((anchor) => {
          const chosen =
            selection?.partId === part.id &&
            selection.point[0] === anchor.point[0] &&
            selection.point[1] === anchor.point[1] &&
            selection.point[2] === anchor.point[2];
          return {
            point: anchor.point,
            radius: (anchor.radius ?? 0.24) * (chosen ? 1.25 : 1),
            // The chosen part turns white so it stands out from the heat colours.
            color: chosen ? "#f4f8f5" : heatColor(relative[part.id] ?? 0),
          };
        }),
      );
    }
    if (!selection) return [];
    const same = selectedPart?.anchors ?? [];
    return [
      ...same
        .filter((_, i) => i !== selection.index)
        .map((anchor) => ({
          point: anchor.point,
          radius: 0.16,
          color: "#9db8f7",
        })),
      { point: selection.point, radius: 0.24, color: "#2f6df6" },
    ];
  }, [lens, selection, selectedPart, relative, catalog]);
  const nameLabel = useMemo(
    () =>
      selection
        ? {
            point: selection.point,
            text: selectedPart
              ? `${selectedPart.es}${selectedWhere ? ` · ${selectedWhere}` : ""}`
              : "Punto sin nombre",
          }
        : null,
    [selection, selectedPart, selectedWhere],
  );
  const summary = summarize(marks);
  const sceneMarks = marks.flatMap((mark, index) =>
    mark.point && mark.modelKey === modelKey
      ? [
          {
            id: mark.id,
            label: String(index + 1),
            point: mark.point,
            radius: sizeFactor[mark.size],
            color: conditionInfo[mark.resolvedOn ? "ok" : mark.condition].color,
          },
        ]
      : [],
  );
  const history = useMemo(() => {
    const use = selectedPart ? usage[selectedPart.id] : undefined;
    if (!selectedPart || !use) return null;
    return partHistory({
      part: selectedPart,
      usage: use,
      usageInput,
      flights: flights
        .filter(
          (flight) =>
            flight.aircraftId === aircraft.id && flight.status === "completed",
        )
        .map((flight) => ({
          id: flight.id,
          date: flight.date,
          title: flight.title,
          duration: flight.duration,
          pilot: flight.pilot,
        })),
      marks: marks.filter((mark) => mark.part === selectedPart.id),
      today: DEMO_DATE,
    });
  }, [selectedPart, usage, usageInput, flights, marks, aircraft.id]);
  const selectedCondition = selectedPart
    ? worstCondition(
        marks.filter(
          (mark) => mark.part === selectedPart.id && !mark.resolvedOn,
        ),
      )
    : undefined;
  const callouts = useMemo(() => {
    if (selection || editor) return [];
    if (lens === "wear") {
      const picked: {
        id: string;
        point: [number, number, number];
        text: string;
        color: string;
      }[] = [];
      const ranked = catalog.parts
        .filter((part) => part.anchors?.length && usage[part.id]?.life > 0)
        .sort((a, b) => usage[b.id].fraction - usage[a.id].fraction);
      for (const part of ranked) {
        const point = part.anchors![0].point;
        // Tags of nearby parts would pile up on the model.
        const crowded = picked.some(
          (item) =>
            Math.hypot(
              item.point[0] - point[0],
              item.point[1] - point[1],
              item.point[2] - point[2],
            ) < 0.8,
        );
        if (crowded) continue;
        picked.push({
          id: part.id,
          point,
          text: `${part.es} · ${Math.round(usage[part.id].fraction * 100)} %`,
          color: heatColor(relative[part.id] ?? 0),
        });
        if (picked.length === 3) break;
      }
      return picked;
    }
    return marks
      .filter(
        (mark) =>
          mark.point &&
          mark.modelKey === modelKey &&
          !mark.resolvedOn &&
          mark.condition !== "ok",
      )
      .map((mark) => ({
        id: mark.id,
        point: mark.point!,
        text: `${markPartName(mark)} · ${conditionInfo[mark.condition].label.toLowerCase()}`,
        color: conditionInfo[mark.condition].color,
      }));
  }, [selection, editor, lens, catalog, usage, relative, marks, modelKey]);
  const draft =
    lens === "inspection" && editor?.point && !editor.id
      ? {
          point: editor.point,
          radius: sizeFactor[editor.size],
          color: conditionInfo[editor.condition].color,
        }
      : null;

  function handlePick(pick: ScenePick) {
    if (editor) {
      // While a form is open, a click only moves its point.
      setEditor({ ...editor, point: pick.point });
      return;
    }
    const near = nearestPart(catalog, pick.point, pick.extent * 0.3);
    setSelection(
      near
        ? {
            partId: near.part.id,
            index: near.part.anchors?.indexOf(near.anchor),
            point: near.anchor.point,
          }
        : { point: pick.point },
    );
  }

  function markPart(part: PartDef, point?: [number, number, number]) {
    setEditor({
      point,
      size: "m",
      part: part.id,
      condition: "watch",
      note: "",
    });
  }

  function showPart(part: PartDef, index: number) {
    const anchor = part.anchors?.[index];
    if (!anchor) return;
    setSelection({ partId: part.id, index, point: anchor.point });
    setFocus((current) => ({
      point: anchor.point,
      n: (current?.n ?? 0) + 1,
    }));
  }

  function select(mark: PartMark) {
    setSelectedId(mark.id);
    setEditor({
      id: mark.id,
      point: mark.point,
      size: mark.size,
      part: mark.part,
      condition: mark.condition,
      note: mark.note,
      photo: mark.photo,
    });
    if (mark.point && mark.modelKey === modelKey)
      setFocus((current) => ({
        point: mark.point!,
        n: (current?.n ?? 0) + 1,
      }));
  }

  function replacePart() {
    if (!selectedPart) return;
    addMaintenance({
      aircraftId: aircraft.id,
      date: DEMO_DATE,
      kind: "component",
      partId: selectedPart.id,
      title: `${selectedPart.es}: cambio`,
      description: "Registrado desde el mapa de piezas.",
      hoursAt: hours,
      performedBy: "",
      cost: 0,
    });
  }

  function save() {
    if (!editor) return;
    const existing = editor.id
      ? marks.find((mark) => mark.id === editor.id)
      : undefined;
    const saved: PartMark = {
      id: existing?.id ?? `part-${crypto.randomUUID()}`,
      aircraftId: aircraft.id,
      modelKey: existing?.modelKey ?? modelKey,
      point: editor.point,
      size: editor.size,
      part: editor.part,
      condition: editor.condition,
      note: editor.note.trim(),
      date: existing?.date ?? DEMO_DATE,
      by: existing?.by ?? "Luis Rojas",
      photo: editor.photo,
      resolvedOn: existing?.resolvedOn,
    };
    savePartMark(saved);
    setSelectedId(saved.id);
    setEditor(null);
    setNotice(
      "Estado de la parte guardado solo en esta sesión de demostración.",
    );
  }

  function remove() {
    if (!editor?.id) return;
    removePartMark(editor.id);
    setSelectedId(undefined);
    setEditor(null);
    setNotice("Marca eliminada de esta sesión de demostración.");
  }

  function resolve() {
    const existing = marks.find((mark) => mark.id === editor?.id);
    if (!existing) return;
    savePartMark({ ...existing, resolvedOn: DEMO_DATE });
    addMaintenance({
      aircraftId: aircraft.id,
      date: DEMO_DATE,
      kind: "component",
      partId: existing.part,
      title: `${markPartName(existing)}: cambio o reparación`,
      description: existing.note || "Resuelto desde la inspección 3D.",
      hoursAt: hours,
      performedBy: "",
      cost: 0,
    });
    setEditor(null);
  }

  async function handlePhoto(file?: File) {
    if (!file) return;
    setPhotoError("");
    try {
      const photo = await readPhoto(file);
      setEditor((current) => (current ? { ...current, photo } : current));
    } catch {
      setPhotoError(
        "No se pudo leer la foto. Pruebe con una imagen JPG o PNG.",
      );
    }
  }

  function handleScan(file?: File) {
    if (!file) return;
    setScanError("");
    if (!/\.glb$/i.test(file.name)) {
      setScanError(
        "El archivo debe ser .glb. Exporte el escaneo en ese formato.",
      );
      return;
    }
    if (file.size > MAX_SCAN_MB * 1024 * 1024) {
      setScanError(
        `El archivo supera ${MAX_SCAN_MB} MB. Redúzcalo antes de cargarlo.`,
      );
      return;
    }
    const previous = scans.get(aircraft.id);
    if (previous) URL.revokeObjectURL(previous.url);
    const next = {
      name: file.name,
      url: URL.createObjectURL(file),
      key: `scan:${file.name}:${file.size}`,
    };
    scans.set(aircraft.id, next);
    setScan(next);
    setMode("scan");
    setEditor(null);
  }

  return (
    <div className={styles.map}>
      {scanError && (
        <p className={styles.error} role="alert">
          {scanError}
        </p>
      )}

      <StageDrawer
        drawerLabel="Detalle de la pieza"
        stage={
          <div ref={viewerRef} className={styles.viewer}>
            <div className={styles.stage}>
              <ConditionScene
                key={sceneKey}
                source={source}
                marks={lens === "inspection" ? sceneMarks : []}
                draft={draft}
                highlights={highlights}
                label={nameLabel}
                callouts={callouts}
                selectedId={selectedId}
                placing
                parts={sceneParts}
                showParts={showParts}
                activePartId={activePart}
                focus={focus}
                view={view}
                onPick={handlePick}
                onPickPart={(id) => {
                  const [partId, index] = id.split("#");
                  const part = partById(catalog, partId);
                  if (part) showPart(part, Number(index));
                }}
                onSelect={(id) => {
                  const mark = marks.find((item) => item.id === id);
                  if (mark) select(mark);
                }}
                onStatus={setStatus}
              />
              <div className={styles.stageTop}>
                <div
                  className={styles.stageSegment}
                  role="group"
                  aria-label="Qué mostrar"
                >
                  <button
                    type="button"
                    aria-pressed={lens === "wear"}
                    onClick={() => {
                      setLens("wear");
                      setEditor(null);
                    }}
                  >
                    Desgaste
                  </button>
                  <button
                    type="button"
                    aria-pressed={lens === "inspection"}
                    onClick={() => setLens("inspection")}
                  >
                    Inspección
                  </button>
                </div>
                {sceneParts.length > 0 && (
                  <button
                    type="button"
                    className={styles.stageChip}
                    aria-pressed={showParts}
                    onClick={() => setShowParts((value) => !value)}
                  >
                    {showParts ? (
                      <EyeOff size={15} aria-hidden="true" />
                    ) : (
                      <Eye size={15} aria-hidden="true" />
                    )}
                    <span>
                      {showParts ? "Ocultar partes" : "Mostrar partes"}
                    </span>
                  </button>
                )}
              </div>
              <div
                className={styles.stageViews}
                role="group"
                aria-label="Vistas del modelo"
              >
                {viewButtons.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() =>
                      setView((current) => ({
                        name: item.name,
                        n: (current?.n ?? 0) + 1,
                      }))
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.statusLine}>
              {lens === "inspection" && (
                <ul className={styles.legend} aria-label="Colores de estado">
                  {conditions.map((condition) => (
                    <li key={condition}>
                      <span
                        aria-hidden="true"
                        style={{ background: conditionInfo[condition].color }}
                      />
                      {conditionInfo[condition].label}
                      <strong>{summary[condition]}</strong>
                    </li>
                  ))}
                </ul>
              )}
              <p className={styles.hint}>
                {status === "unavailable"
                  ? "Sin vista 3D: agregue las partes desde la lista."
                  : lens === "wear"
                    ? "Azul: la pieza menos usada. Naranja: la más usada. Toque una pieza para ver su ficha."
                    : "Toque una parte para ver su nombre; arrastre para girar."}
              </p>
            </div>
            <div className={styles.toolbar}>
              <div
                className={styles.segment}
                role="group"
                aria-label="Modelo que se muestra"
              >
                <button
                  type="button"
                  aria-pressed={mode === "model"}
                  onClick={() => {
                    setMode("model");
                    setEditor(null);
                  }}
                >
                  Modelo de la aeronave
                </button>
                <button
                  type="button"
                  aria-pressed={mode === "scan"}
                  disabled={!scan}
                  onClick={() => {
                    setMode("scan");
                    setEditor(null);
                  }}
                >
                  Mi escaneo{scan ? ` · ${scan.name}` : ""}
                </button>
              </div>
              <label className={styles.upload}>
                <ScanLine size={16} aria-hidden="true" />
                Cargar escaneo (.glb)
                <input
                  type="file"
                  accept=".glb,model/gltf-binary"
                  onChange={(event) => {
                    handleScan(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        }
        drawer={
          <>
            {editor ? (
              <form
                className={styles.editor}
                onSubmit={(event) => {
                  event.preventDefault();
                  save();
                }}
              >
                <h4>{editor.id ? "Editar parte" : "Nueva marca"}</h4>
                <p className={styles.small}>
                  {editor.point
                    ? "El punto está sobre el modelo; toque otro lugar para moverlo."
                    : "Esta marca no tiene punto en el modelo."}
                </p>
                <label className={styles.field}>
                  <span className="field-label">Parte</span>
                  <select
                    className="field-select"
                    value={editor.part}
                    onChange={(event) =>
                      setEditor({ ...editor, part: event.target.value })
                    }
                  >
                    {(
                      Object.keys(groupLabels) as (keyof typeof groupLabels)[]
                    ).map((group) => {
                      const list = catalog.parts.filter(
                        (part) => part.group === group,
                      );
                      return list.length ? (
                        <optgroup key={group} label={groupLabels[group]}>
                          {list.map((part) => (
                            <option key={part.id} value={part.id}>
                              {partLabel(part)}
                            </option>
                          ))}
                        </optgroup>
                      ) : null;
                    })}
                    <option value="other">Otra parte</option>
                    {!partById(catalog, editor.part) &&
                      editor.part !== "other" && (
                        <option value={editor.part}>{editor.part}</option>
                      )}
                  </select>
                </label>
                <fieldset className={styles.states}>
                  <legend className="field-label">Estado</legend>
                  {conditions.map((condition) => (
                    <label key={condition} data-condition={condition}>
                      <input
                        type="radio"
                        name="condition"
                        checked={editor.condition === condition}
                        onChange={() => setEditor({ ...editor, condition })}
                      />
                      <span>
                        <i
                          aria-hidden="true"
                          style={{ background: conditionInfo[condition].color }}
                        />
                        {conditionInfo[condition].label}
                      </span>
                    </label>
                  ))}
                  <small>{conditionInfo[editor.condition].hint}</small>
                </fieldset>
                {editor.point && (
                  <label className={styles.field}>
                    <span className="field-label">Tamaño de la zona</span>
                    <select
                      className="field-select"
                      value={editor.size}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          size: event.target.value as PartMark["size"],
                        })
                      }
                    >
                      {(["s", "m", "l"] as const).map((size) => (
                        <option key={size} value={size}>
                          {sizeLabels[size]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className={styles.field}>
                  <span className="field-label">Qué se vio</span>
                  <textarea
                    className="field-input"
                    rows={3}
                    value={editor.note}
                    placeholder="Por ejemplo: muesca en el borde de la hélice"
                    onChange={(event) =>
                      setEditor({ ...editor, note: event.target.value })
                    }
                  />
                </label>
                <div className={styles.photo}>
                  <label className={styles.upload}>
                    <Camera size={16} aria-hidden="true" />
                    {editor.photo ? "Cambiar foto" : "Agregar foto"}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) => {
                        void handlePhoto(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {editor.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editor.photo.dataUrl}
                      alt={`Foto de ${partById(catalog, editor.part)?.es ?? editor.part}`}
                      width={72}
                      height={72}
                    />
                  )}
                </div>
                {editor.photo && (
                  <small className={styles.small}>
                    Huella SHA-256: {editor.photo.hash.slice(0, 16)}…
                  </small>
                )}
                {photoError && (
                  <p className={styles.error} role="alert">
                    {photoError}
                  </p>
                )}
                <div className={styles.actions}>
                  <Button type="submit" variant="primary">
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onPress={() => setEditor(null)}
                  >
                    Cancelar
                  </Button>
                  {editor.id && (
                    <Button type="button" variant="ghost" onPress={remove}>
                      <Trash2 size={15} aria-hidden="true" />
                      Eliminar
                    </Button>
                  )}
                </div>
                {editor.id &&
                  editor.condition !== "ok" &&
                  !marks.find((mark) => mark.id === editor.id)?.resolvedOn && (
                    <Button type="button" variant="secondary" onPress={resolve}>
                      <Wrench size={15} aria-hidden="true" />
                      Ya se cambió o reparó
                    </Button>
                  )}
              </form>
            ) : selection ? (
              <PartSheet
                part={selectedPart}
                where={selectedWhere}
                usage={selectedPart ? usage[selectedPart.id] : undefined}
                relative={selectedPart ? (relative[selectedPart.id] ?? 0) : 0}
                condition={selectedCondition}
                events={history?.events ?? []}
                series={history?.series ?? []}
                today={DEMO_DATE}
                lastService={history?.last}
                onMark={() => {
                  const point = selection!.point;
                  setLens("inspection");
                  setSelection(null);
                  if (selectedPart) markPart(selectedPart, point);
                  else
                    setEditor({
                      point,
                      size: "m",
                      part: "other",
                      condition: "watch",
                      note: "",
                    });
                }}
                onReplace={replacePart}
                onClear={() => setSelection(null)}
              />
            ) : lens === "wear" ? (
              <UsagePanel
                parts={catalog.parts}
                usage={usage}
                placed={
                  new Set(
                    catalog.parts
                      .filter((part) => part.anchors?.length)
                      .map((part) => part.id),
                  )
                }
                onSelect={(part) => {
                  if (part.anchors?.length) showPart(part, 0);
                }}
              />
            ) : (
              <>
                <div className={styles.listHeader}>
                  <h4>Partes registradas</h4>
                  <Button
                    variant="secondary"
                    onPress={() =>
                      setEditor({
                        size: "m",
                        part: catalog.parts[0]?.id ?? "other",
                        condition: "watch",
                        note: "",
                      })
                    }
                  >
                    <Plus size={15} aria-hidden="true" />
                    Agregar desde la lista
                  </Button>
                </div>
                {marks.length ? (
                  <ol className={styles.list}>
                    {marks.map((mark, index) => {
                      const shown = mark.resolvedOn ? "ok" : mark.condition;
                      const elsewhere =
                        mark.point && mark.modelKey !== modelKey;
                      return (
                        <li key={mark.id}>
                          <button
                            type="button"
                            aria-pressed={mark.id === selectedId}
                            onClick={() => select(mark)}
                          >
                            <span
                              className={styles.number}
                              style={{ background: conditionInfo[shown].color }}
                            >
                              {mark.point ? index + 1 : "–"}
                            </span>
                            <span className={styles.itemBody}>
                              <strong>
                                {markPartName(mark)} ·{" "}
                                {mark.resolvedOn
                                  ? "resuelta"
                                  : conditionInfo[
                                      mark.condition
                                    ].label.toLowerCase()}
                              </strong>
                              <span>{mark.note || "Sin nota"}</span>
                              <small>
                                {formatDate(mark.date)} · {mark.by}
                                {mark.photo ? " · con foto" : ""}
                                {elsewhere ? " · puesta en otro modelo" : ""}
                              </small>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className={styles.small}>
                    Aún no hay partes marcadas. Toque el modelo para empezar.
                  </p>
                )}
              </>
            )}
          </>
        }
      />

      <details className={styles.parts}>
        <summary>
          Partes de esta aeronave según el manual ({catalog.parts.length})
        </summary>
        <p className={styles.small}>
          {catalog.generic
            ? "Este modelo es una ilustración genérica; los nombres son los de documentos con licencia libre y no corresponden a un producto concreto."
            : "Los nombres y los números son los del manual del fabricante, en inglés y con su traducción al español. El español es traducción propia, salvo donde dice «español del manual». Las partes con número tienen un lugar aproximado en el modelo simplificado; las demás solo se pueden marcar desde la lista."}
        </p>
        {(Object.keys(groupLabels) as (keyof typeof groupLabels)[]).map(
          (group) => {
            const list = catalog.parts.filter((part) => part.group === group);
            if (!list.length) return null;
            return (
              <section key={group} className={styles.partGroup}>
                <h4>{groupLabels[group]}</h4>
                <ul>
                  {list.map((part) => {
                    const numbers = anchored
                      .map((item, i) => (item.part.id === part.id ? i + 1 : 0))
                      .filter(Boolean);
                    return (
                      <li
                        key={part.id}
                        data-active={
                          activePart?.startsWith(`${part.id}#`) || undefined
                        }
                      >
                        <span className={styles.partName}>
                          <strong>{part.es}</strong>
                          {part.es.toLowerCase() !== part.en.toLowerCase() && (
                            <em>{part.en}</em>
                          )}
                          <small>
                            {part.ref}
                            {part.esOfficial ? " · español del manual" : ""}
                            {numbers.length
                              ? ` · en el modelo: ${numbers.length > 1 ? `n.º ${numbers[0]}–${numbers[numbers.length - 1]}` : `n.º ${numbers[0]}`}`
                              : ""}
                          </small>
                        </span>
                        <span className={styles.partActions}>
                          {numbers.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowParts(true);
                                showPart(part, 0);
                                viewerRef.current?.scrollIntoView({
                                  block: "start",
                                });
                              }}
                            >
                              Ver
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              markPart(part, part.anchors?.[0]?.point);
                              if (part.anchors?.[0]) showPart(part, 0);
                            }}
                          >
                            Marcar
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          },
        )}
        <section className={styles.partGroup}>
          <h4>Fuentes</h4>
          <ul className={styles.sources}>
            {catalogSources.map((source) => (
              <li key={source.id}>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                ) : (
                  source.title
                )}
                <small>
                  {source.version ? `${source.version} · ` : ""}
                  {source.license}
                  {source.free ? " · licencia libre" : ""}
                </small>
              </li>
            ))}
          </ul>
          <p className={styles.small}>
            Los manuales de DJI son públicos pero tienen derechos reservados:
            aquí solo se citan los nombres de las partes y la numeración de sus
            diagramas, sin copiar sus textos ni dibujos. No hay un manual de
            licencia libre de estos equipos.
          </p>
        </section>
      </details>

      <details className={styles.help}>
        <summary>¿Cómo escanear la aeronave con el teléfono?</summary>
        <ol>
          <li>
            Use una app de escaneo 3D del teléfono (por ejemplo Polycam o
            Scaniverse; verifique que la suya exporte .glb) y recorra la
            aeronave sobre una superficie lisa y con luz pareja.
          </li>
          <li>Recorte el fondo y exporte el modelo como .glb.</li>
          <li>
            Cárguelo con «Cargar escaneo». El archivo se lee en este navegador;
            no se sube a ningún servidor.
          </li>
          <li>
            También puede cargar un modelo descargado de la web. Revise su
            licencia: no todos permiten usarlos en un producto.
          </li>
        </ol>
        <p>
          Sin escaneo, el modelo de la aeronave sirve igual para marcar y
          fotografiar cada parte. Las marcas son un registro de inspección
          visual; no reemplazan el manual del fabricante ni a un técnico
          autorizado.
        </p>
      </details>
    </div>
  );
}
