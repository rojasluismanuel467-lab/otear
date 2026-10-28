"use client";

import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { ClipboardPen } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import type { Flight, FlightLog } from "@/features/demo/types";
import styles from "./log-dialog.module.css";

const LOG_ITEM = "Registrar baterías y novedades en la bitácora al aterrizar";
const sensors = {
  rgb: "Cámara RGB",
  thermal: "Térmica",
  multispectral: "Multiespectral",
  lidar: "LiDAR",
};

type Draft = {
  weather: FlightLog["weather"];
  windKmh: string;
  maxAltitudeM: string;
  batteries: string;
  authorizationRef: string;
  incidents: string;
  sensor: NonNullable<FlightLog["sensor"]>;
  gsdCm: string;
  overlapPct: string;
  controlPoints: "yes" | "no";
  deliverables: string;
  debrief: string;
  coveredHa: string;
};

function draftOf(log?: FlightLog): Draft {
  return {
    weather: log?.weather ?? "clear",
    windKmh: String(log?.windKmh ?? ""),
    maxAltitudeM: String(log?.maxAltitudeM ?? ""),
    batteries: log?.batteries.join(", ") ?? "",
    authorizationRef: log?.authorizationRef ?? "",
    incidents: log?.incidents ?? "",
    sensor: log?.sensor ?? "rgb",
    gsdCm: log?.gsdCm !== undefined ? String(log.gsdCm) : "",
    overlapPct: log?.overlapPct !== undefined ? String(log.overlapPct) : "",
    controlPoints: log?.controlPoints ? "yes" : "no",
    deliverables: log?.deliverables?.join("\n") ?? "",
    debrief: log?.debrief ?? "",
    coveredHa: log?.coveredHa !== undefined ? String(log.coveredHa) : "",
  };
}

export function LogDialog({ flight }: { flight: Flight }) {
  const { updateFlight, setNotice } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onPress={() => setIsOpen(true)}>
        <ClipboardPen size={16} aria-hidden="true" />
        {flight.log ? "Editar bitácora" : "Registrar bitácora"}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Bitácora del vuelo</Modal.Heading>
                <Modal.CloseTrigger aria-label="Cerrar bitácora" />
              </Modal.Header>
              <Modal.Body>
                <LogForm
                  key={flight.id}
                  flight={flight}
                  onSave={(log) => {
                    updateFlight(flight.id, {
                      log,
                      checklist: flight.checklist.includes(LOG_ITEM)
                        ? flight.checklist
                        : [...flight.checklist, LOG_ITEM],
                    });
                    setNotice(
                      "Bitácora guardada solo en esta sesión de demostración.",
                    );
                    setIsOpen(false);
                  }}
                  onCancel={() => setIsOpen(false)}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

function LogForm({
  flight,
  onSave,
  onCancel,
}: {
  flight: Flight;
  onSave: (log: FlightLog) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(() => draftOf(flight.log));
  const [error, setError] = useState("");
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  function submit() {
    const wind = Number(draft.windKmh.replace(",", "."));
    const altitude = Number(draft.maxAltitudeM.replace(",", "."));
    if (!Number.isFinite(wind) || wind < 0 || wind > 120) {
      setError("Escribe la velocidad del viento en km/h (0 a 120).");
      return;
    }
    if (!Number.isFinite(altitude) || altitude <= 0 || altitude > 500) {
      setError("Escribe la altura máxima en metros (1 a 500).");
      return;
    }
    const batteries = draft.batteries
      .split(/[,;]/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (!batteries.length) {
      setError("Anota al menos una batería usada.");
      return;
    }
    const optional = (value: string) => {
      const parsed = Number(value.replace(",", "."));
      return value.trim() && Number.isFinite(parsed) ? parsed : undefined;
    };
    setError("");
    onSave({
      weather: draft.weather,
      windKmh: wind,
      maxAltitudeM: altitude,
      batteries,
      authorizationRef: draft.authorizationRef.trim(),
      incidents: draft.incidents.trim(),
      sensor: draft.sensor,
      gsdCm: optional(draft.gsdCm),
      overlapPct: optional(draft.overlapPct),
      controlPoints: draft.controlPoints === "yes",
      deliverables: draft.deliverables
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      debrief: draft.debrief.trim(),
      coveredHa: optional(draft.coveredHa),
    });
  }

  return (
    <div className={styles.form}>
      <p className={styles.note}>
        Registro posterior al vuelo con los campos que piden las plantillas de
        bitácora: clima, baterías, autorización, incidentes y datos de calidad.{" "}
        {flight.title} · {flight.date}.
      </p>
      <h3>Condiciones</h3>
      <div className={styles.grid}>
        <label className="form-field">
          <span className="field-label">Clima</span>
          <select
            className="field-select"
            value={draft.weather}
            onChange={(e) => set("weather", e.target.value as Draft["weather"])}
          >
            <option value="clear">Despejado</option>
            <option value="cloudy">Nublado</option>
            <option value="rain">Lluvia</option>
          </select>
        </label>
        <label className="form-field">
          <span className="field-label">Viento (km/h)</span>
          <input
            className="field-input"
            inputMode="decimal"
            value={draft.windKmh}
            onChange={(e) => set("windKmh", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="field-label">Altura máxima (m)</span>
          <input
            className="field-input"
            inputMode="decimal"
            value={draft.maxAltitudeM}
            onChange={(e) => set("maxAltitudeM", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="field-label">Baterías usadas</span>
          <input
            className="field-input"
            value={draft.batteries}
            placeholder="BAT-A12, BAT-A13"
            onChange={(e) => set("batteries", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="field-label">Referencia de autorización</span>
          <input
            className="field-input"
            value={draft.authorizationRef}
            placeholder="Si aplica"
            onChange={(e) => set("authorizationRef", e.target.value)}
          />
        </label>
      </div>
      <label className="form-field">
        <span className="field-label">Incidentes u ocurrencias</span>
        <textarea
          className="field-input"
          rows={2}
          value={draft.incidents}
          placeholder="Pérdida de enlace, aterrizaje forzoso, personas en el área… Déjelo vacío si no hubo."
          onChange={(e) => set("incidents", e.target.value)}
        />
      </label>
      <h3>Calidad de los datos</h3>
      <div className={styles.grid}>
        <label className="form-field">
          <span className="field-label">Hectáreas cubiertas</span>
          <input
            className="field-input"
            inputMode="decimal"
            value={draft.coveredHa}
            placeholder="Según su registro de vuelo"
            onChange={(e) => set("coveredHa", e.target.value)}
          />
          <small className={styles.note}>
            Se compara con lo facturado antes de pagar.
          </small>
        </label>
        <label className="form-field">
          <span className="field-label">Sensor</span>
          <select
            className="field-select"
            value={draft.sensor}
            onChange={(e) => set("sensor", e.target.value as Draft["sensor"])}
          >
            {Object.entries(sensors).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="field-label">GSD (cm/píxel)</span>
          <input
            className="field-input"
            inputMode="decimal"
            value={draft.gsdCm}
            onChange={(e) => set("gsdCm", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="field-label">Traslape (%)</span>
          <input
            className="field-input"
            inputMode="decimal"
            value={draft.overlapPct}
            onChange={(e) => set("overlapPct", e.target.value)}
          />
        </label>
        <label className="form-field">
          <span className="field-label">Puntos de control en tierra</span>
          <select
            className="field-select"
            value={draft.controlPoints}
            onChange={(e) =>
              set("controlPoints", e.target.value as Draft["controlPoints"])
            }
          >
            <option value="no">No se usaron</option>
            <option value="yes">Sí se usaron</option>
          </select>
        </label>
      </div>
      <label className="form-field">
        <span className="field-label">
          Entregables, uno por línea con su formato
        </span>
        <textarea
          className="field-input"
          rows={3}
          value={draft.deliverables}
          placeholder={"Ortomosaico (GeoTIFF)\nFotografías originales (JPG)"}
          onChange={(e) => set("deliverables", e.target.value)}
        />
      </label>
      <label className="form-field">
        <span className="field-label">Debriefing: qué se aprendió</span>
        <textarea
          className="field-input"
          rows={2}
          value={draft.debrief}
          onChange={(e) => set("debrief", e.target.value)}
        />
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <Button variant="secondary" onPress={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" onPress={submit}>
          Guardar bitácora
        </Button>
      </div>
    </div>
  );
}
