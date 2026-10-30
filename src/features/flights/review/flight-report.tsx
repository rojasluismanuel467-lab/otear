"use client";

import { sourceLabel } from "@/features/agents/image-candidates";
import { useState } from "react";
import { Button } from "@heroui/react";
import { Download, FileText, Printer } from "lucide-react";
import type { Finding, Flight, Site } from "@/features/demo/types";
import { useDemo } from "@/features/demo/demo-context";
import { textToHtml, printHtml } from "@/features/traceability/document-export";
import {
  evidenceState,
  statusLabels as evidenceLabels,
} from "@/features/traceability/integrity";
import { compareWithHistory } from "@/features/reports/insights";
import { downloadText, formatDate } from "@/lib/format";
import styles from "./flight-review.module.css";

const statusLabels = {
  pending: "Pendiente de revisión",
  confirmed: "Confirmado en esta demo",
  dismissed: "Descartado en esta demo",
};

const priorityLabels = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};
const nextStepLabels = {
  pending: "Verificar en campo antes de decidir.",
  confirmed: "Programar la labor correctiva y asignar responsable.",
  dismissed: "Sin acción; conservar el registro de la decisión.",
};

const sensorLabels = {
  rgb: "Cámara RGB",
  thermal: "Térmica",
  multispectral: "Multiespectral",
  lidar: "LiDAR",
};

function qualityLines(flight: Flight) {
  const log = flight.log;
  if (!log) return ["Sin bitácora registrada."];
  return [
    `Sensor: ${log.sensor ? sensorLabels[log.sensor] : "No registrado"}`,
    `GSD: ${log.gsdCm !== undefined ? `${log.gsdCm} cm/píxel` : "No registrado"}`,
    `Traslape: ${log.overlapPct !== undefined ? `${log.overlapPct} %` : "No registrado"}`,
    `Puntos de control en tierra: ${log.controlPoints === undefined ? "No registrado" : log.controlPoints ? "Sí" : "No se usaron"}`,
    `Entregables: ${log.deliverables?.length ? log.deliverables.join("; ") : "No registrados"}`,
    `Debriefing: ${log.debrief || "Sin notas"}`,
  ];
}

function trendLabel(value: {
  trend: "new" | "persistent";
  earlierFlights: number;
}) {
  return value.trend === "persistent"
    ? `persistente (ya reportado en ${value.earlierFlights} ${value.earlierFlights === 1 ? "vuelo anterior" : "vuelos anteriores"})`
    : "nuevo";
}

function describeFlightLog(flight: Flight) {
  const executed = flight.status === "completed";
  return [
    ["Fecha y hora", `${formatDate(flight.date)} · ${flight.time}`],
    ["Piloto", flight.pilot],
    ["Operador", flight.operator],
    ["Responsable", flight.manager],
    ["Equipo", flight.drone],
    [
      "Duración",
      executed ? `${flight.duration} min` : "Sin ejecución registrada",
    ],
    [
      "Recorrido",
      executed
        ? `${flight.distance.toLocaleString("es-CO")} km`
        : `${flight.route.length} puntos previstos`,
    ],
    ["Fotografías", executed ? String(flight.photoCount) : "Sin entrega"],
    ["Autorización y espacio aéreo", "No registrada en la demo"],
    ["Clima durante el vuelo", "No registrado en la demo"],
  ] as const;
}

export function FlightReport({
  site,
  flight,
  findings,
  onDownload,
}: {
  site: Site;
  flight: Flight;
  findings: Finding[];
  onDownload: () => void;
}) {
  const { findings: siteFindings, flights, evidences } = useDemo();
  const flightEvidences = evidences.filter(
    (entry) => entry.flightId === flight.id,
  );
  const trend = (finding: Finding) =>
    compareWithHistory(finding, siteFindings, flights);
  const [includedIds, setIncludedIds] = useState(
    findings.map((finding) => finding.id),
  );
  const [notes, setNotes] = useState("");
  const included = findings.filter((finding) =>
    includedIds.includes(finding.id),
  );
  const zoneNames = site.zones
    .filter((zone) => flight.zoneIds.includes(zone.id))
    .map((zone) => zone.name)
    .join(", ");
  const reportText = [
    "OTEAR — BORRADOR DE DEMOSTRACIÓN",
    "Datos sintéticos. No es un informe técnico de una operación real.",
    "",
    `${site.name} · ${site.sectorLabel}`,
    `Vuelo: ${flight.title}`,
    `Fecha: ${formatDate(flight.date)} · ${flight.time}`,
    `Estado: ${flight.status === "completed" ? "Completado en el escenario de ejemplo" : flight.status === "scheduled" ? "Programado; sin entrega documentada" : "Cancelado en el escenario de ejemplo"}`,
    `Objetivo: ${flight.objective}`,
    `Zonas: ${zoneNames || "Sin zonas seleccionadas"}`,
    "",
    "REGISTRO DEL VUELO",
    ...describeFlightLog(flight).map(([label, value]) => `${label}: ${value}`),
    "",
    "CALIDAD DE LOS DATOS",
    ...qualityLines(flight),
    "",
    "TRAZABILIDAD DE DOCUMENTOS",
    ...(flightEvidences.length
      ? flightEvidences.map((entry) => {
          const state = evidenceState(entry);
          return `- ${entry.title}: ${evidenceLabels[state.status]} · huella ${state.hash.slice(0, 12)}${state.missingRoles.length ? ` · falta ${state.missingRoles.join(", ")}` : ""}`;
        })
      : ["- Sin documentos registrados para este vuelo."]),
    "",
    "OBSERVACIONES SELECCIONADAS",
    ...(included.length
      ? included.map(
          (finding, index) =>
            `${index + 1}. ${finding.title}\n   Zona: ${site.zones.find((zone) => zone.id === finding.zoneId)?.name ?? "Sin asignar"}\n   Fuente: ${sourceLabel(finding)}\n   Descripción: ${finding.description}\n   Prioridad: ${priorityLabels[finding.priority]}\n   Ubicación: ${finding.position[0].toFixed(5)}, ${finding.position[1].toFixed(5)}\n   Revisión: ${statusLabels[finding.status]}\n   Siguiente paso: ${nextStepLabels[finding.status]}\n   Frente a vuelos anteriores: ${trendLabel(trend(finding))}\n   Tarea local: ${finding.taskAssigned ? "Propuesta de verificación añadida" : "Sin tarea"}\n   Referencia de muestra: ${finding.id}`,
        )
      : ["Sin observaciones seleccionadas."]),
    "",
    "NOTAS DE REVISIÓN",
    notes.trim() || "Sin notas adicionales.",
    "",
    "FIRMAS DEL INFORME",
    "Preparado por: ______________________  Fecha: ____________",
    "Revisado por:  ______________________  Fecha: ____________",
    "",
    "LÍMITES Y PROCEDENCIA",
    "Fotografías ilustrativas sin correspondencia técnica con el sitio del mapa. No acreditan lo descrito por las observaciones sintéticas.",
    "No se ejecutó análisis de IA. No hay diagnóstico profesional ni validación de cobertura o calidad de una labor.",
    "Las revisiones y tareas existen solo en la sesión de demostración. Este archivo de texto sí fue generado y descargado localmente; no se envió a terceros.",
  ].join("\n");

  return (
    <div className={styles.reportGrid}>
      <section className={`surface ${styles.reportOptions}`}>
        <h2 className="section-heading">Preparar borrador</h2>
        <p className="text-muted">
          Selecciona qué observaciones quieres incluir. El contexto del vuelo
          acompaña al informe.
        </p>
        <fieldset className={styles.checklist}>
          <legend>Observaciones del vuelo</legend>
          {findings.length ? (
            findings.map((finding) => (
              <label key={finding.id}>
                <input
                  type="checkbox"
                  checked={includedIds.includes(finding.id)}
                  onChange={(event) =>
                    setIncludedIds(
                      event.target.checked
                        ? [...includedIds, finding.id]
                        : includedIds.filter((id) => id !== finding.id),
                    )
                  }
                />
                <span>
                  {finding.title}
                  <small>{statusLabels[finding.status]}</small>
                </span>
              </label>
            ))
          ) : (
            <p className="text-muted">Este vuelo no tiene observaciones.</p>
          )}
        </fieldset>
        <label className="form-field">
          <span className="field-label">Notas para quien revisa</span>
          <textarea
            className={`field-input ${styles.notes}`}
            value={notes}
            maxLength={2500}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Pendientes, límites de la evidencia o próxima verificación…"
          />
        </label>
        <p className="demo-note">
          Redacción manual. La descarga es un archivo .txt real, sin firma
          técnica, envío ni generación de PDF.
        </p>
        <Button
          variant="primary"
          onPress={() => {
            downloadText(`otear-${flight.id}-borrador.txt`, reportText);
            onDownload();
          }}
        >
          <Download size={17} aria-hidden="true" />
          Descargar borrador .txt
        </Button>
        <Button
          variant="secondary"
          onPress={() =>
            printHtml(textToHtml(`Informe · ${flight.title}`, reportText))
          }
        >
          <Printer size={17} aria-hidden="true" />
          Imprimir o guardar PDF
        </Button>
      </section>
      <section
        className={`surface ${styles.reportPreview}`}
        aria-label="Vista previa del informe"
      >
        <div className={styles.reportBrand}>
          <FileText size={23} aria-hidden="true" />
          <span>
            OTEAR<span>Borrador de demostración</span>
          </span>
        </div>
        <h2>{flight.title}</h2>
        <p className="text-muted">
          {site.name} · {formatDate(flight.date)}
        </p>
        <hr />
        <h3>Objetivo del vuelo</h3>
        <p>{flight.objective}</p>
        <p>
          <strong>{site.zoneLabel}:</strong> {zoneNames || "Sin asignar"}
        </p>
        <h3>Registro del vuelo</h3>
        <dl className={styles.logGrid}>
          {describeFlightLog(flight).map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <h3>Calidad de los datos</h3>
        <ul className={styles.limits}>
          {qualityLines(flight).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <h3>Observaciones seleccionadas</h3>
        {included.length ? (
          included.map((finding) => (
            <article className={styles.reportFinding} key={finding.id}>
              <h4>{finding.title}</h4>
              <p>{finding.description}</p>
              <small>
                Prioridad {priorityLabels[finding.priority].toLowerCase()} ·{" "}
                {finding.position[0].toFixed(5)},{" "}
                {finding.position[1].toFixed(5)}
              </small>
              <small>
                {sourceLabel(finding)} · {statusLabels[finding.status]}
                {finding.taskAssigned ? " · Con tarea local" : ""}
              </small>
              <small>
                Frente a vuelos anteriores: {trendLabel(trend(finding))}
              </small>
              <small className={styles.nextStepLine}>
                Siguiente paso: {nextStepLabels[finding.status]}
              </small>
            </article>
          ))
        ) : (
          <p className="text-muted">
            No hay observaciones incluidas en este borrador.
          </p>
        )}
        {notes.trim() && (
          <>
            <h3>Notas de revisión</h3>
            <p className={styles.preserveLines}>{notes}</p>
          </>
        )}
        <h3>Límites de los datos</h3>
        <ul className={styles.limits}>
          <li>Las fotografías son ilustrativas y no corresponden al sitio.</li>
          <li>No se ejecutó análisis de IA ni se midió cobertura o calidad.</li>
          <li>Las coordenadas y el recorrido son de ejemplo.</li>
        </ul>
        <p className="demo-note">
          Datos sintéticos. Requiere revisión humana; no acredita un diagnóstico
          ni una operación real.
        </p>
      </section>
    </div>
  );
}
