"use client";

import { followUpLine } from "../follow-up";
import { chainageLabel } from "@/features/sites/mapping/chainage";
import { sourceLabel, isSuggested } from "@/features/agents/image-candidates";
import { useState } from "react";
import { Button } from "@heroui/react";
import { Download, FileText, Printer } from "lucide-react";
import type { Finding, Flight, Site } from "@/features/demo/types";
import { useDemo } from "@/features/demo/demo-context";
import {
  measureOutline,
  outlineKindFor,
} from "@/features/sites/mapping/mapping-model";
import { textToHtml, printHtml } from "@/features/traceability/document-export";
import { flightReportFields } from "@/features/traceability/flight-report-document";
import { FlightReportSigning } from "@/features/traceability/flight-report-signing";
import {
  displayTitle,
  evidenceState,
  statusLabels as evidenceLabels,
} from "@/features/traceability/integrity";
import { flightStatusText } from "@/features/traceability/templates";
import { compareWithHistory } from "@/features/reports/insights";
import { downloadText, formatDate } from "@/lib/format";
import { agree, type FindingWords } from "../finding-words";
import { flightBrief, loggedConditions } from "../flight-brief";
import { useFindingWords } from "../use-finding-words";
import styles from "./flight-review.module.css";

const priorityLabels = {
  high: "alta",
  medium: "media",
  low: "baja",
};

function statusLabel(status: Finding["status"], words: FindingWords) {
  if (status === "pending") return "Pendiente de revisión";
  return status === "confirmed"
    ? `${agree(words, "Confirmado", "Confirmada")} en esta demo`
    : `${agree(words, "Descartado", "Descartada")} en esta demo`;
}

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

const decimal = (value: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value);

/** Technical details of the survey, in everyday words; they go below the part an administrator reads. */
function technicalLines(flight: Flight) {
  const log = flight.log;
  if (!log) return ["Sin bitácora registrada."];
  return [
    `Sensor: ${log.sensor ? sensorLabels[log.sensor] : "No registrado"}`,
    `Detalle de la imagen: ${log.gsdCm !== undefined ? `cada píxel cubre ${decimal(log.gsdCm)} cm (GSD)` : "No registrado"}`,
    `Traslape entre fotos: ${log.overlapPct !== undefined ? `${log.overlapPct} %` : "No registrado"}`,
    `Puntos de referencia medidos en el terreno (puntos de control): ${log.controlPoints === undefined ? "No registrado" : log.controlPoints ? "Sí" : "No se usaron"}`,
    `Archivos entregados: ${log.deliverables?.length ? log.deliverables.join("; ") : "No registrados"}`,
  ];
}

function trendLabel(value: {
  trend: "new" | "persistent";
  earlierFlights: number;
}) {
  return value.trend === "persistent"
    ? `se repite (ya se reportó en ${value.earlierFlights} ${value.earlierFlights === 1 ? "vuelo anterior" : "vuelos anteriores"})`
    : "primera vez que se reporta";
}

function describeFlightLog(flight: Flight, orderedHa: number) {
  const executed = flight.status === "completed";
  const conditions = loggedConditions(flight.log);
  const rows: [string, string][] = [
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
    [
      "Clima, según la bitácora",
      executed ? conditions.weather : "Sin ejecución registrada",
    ],
    [
      "Autorización, según la bitácora",
      executed ? conditions.authorization : "Sin ejecución registrada",
    ],
  ];
  const covered = flight.log?.coveredHa;
  if (executed && covered !== undefined && orderedHa > 0) {
    rows.push([
      "Cubierto, según el operador",
      `${decimal(covered)} de ${decimal(orderedHa)} ha pedidas`,
    ]);
  }
  return rows;
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
  const words = useFindingWords();
  const flightEvidences = evidences.filter(
    (entry) => entry.flightId === flight.id,
  );
  const trend = (finding: Finding) =>
    compareWithHistory(finding, siteFindings, flights);
  // A suggestion nobody has reviewed is not yet a finding: it starts outside the report.
  const isOpenSuggestion = (finding: Finding) =>
    isSuggested(finding) && finding.status === "pending";
  const [includedIds, setIncludedIds] = useState(
    findings
      .filter((finding) => !isOpenSuggestion(finding))
      .map((finding) => finding.id),
  );
  const [notes, setNotes] = useState("");
  const included = findings.filter((finding) =>
    includedIds.includes(finding.id),
  );
  const zoneNames = site.zones
    .filter((zone) => flight.zoneIds.includes(zone.id))
    .map((zone) => zone.name)
    .join(", ");
  const kind = outlineKindFor(site.sector);
  const orderedHa =
    kind === "polygon"
      ? site.zones
          .filter((zone) => flight.zoneIds.includes(zone.id))
          .reduce((sum, zone) => sum + measureOutline(kind, zone.outline), 0)
      : 0;
  const brief = flightBrief({
    site,
    flight,
    flights,
    findings: siteFindings,
    orderedHa,
    words,
  });
  const logRows = describeFlightLog(flight, orderedHa);
  const technical = technicalLines(flight);
  const zoneName = (finding: Finding) =>
    site.zones.find((zone) => zone.id === finding.zoneId)?.name ??
    "Sin asignar";
  const coordinates = (finding: Finding) => {
    const raw = `${finding.position[0].toFixed(5)}, ${finding.position[1].toFixed(5)}`;
    const pk =
      kind === "line" ? chainageLabel(finding.position, site.zones) : undefined;
    return pk ? `${pk} (${raw})` : raw;
  };
  const findingBlocks = included.map(
    (finding) =>
      `${finding.title}\n   ${site.zoneLabel.replace(/s$/, "")}: ${zoneName(finding)} · prioridad ${priorityLabels[finding.priority]}\n   ${finding.description}\n   Fuente: ${sourceLabel(finding, words)}\n   Estado: ${statusLabel(finding.status, words)}\n   Frente a vuelos anteriores: ${trendLabel(trend(finding))}\n   Siguiente paso: ${nextStepLabels[finding.status]}\n   Medida correctiva: ${followUpLine(finding)}\n   Coordenadas de ejemplo: ${coordinates(finding)}\n   Referencia de muestra: ${finding.id}`,
  );
  // What the person signs is exactly what the report shows now.
  const signablePrefill = flightReportFields({
    brief,
    logRows,
    debrief: flight.log?.debrief,
    findingsTitle: `${words.Plural} incluidos`,
    findings: findingBlocks,
    notes,
    technical,
  });
  const reportText = [
    "OTEAR — INFORME DEL VUELO (BORRADOR DE DEMOSTRACIÓN)",
    "Datos de ejemplo. No es un informe técnico de una operación real.",
    "",
    `${site.name} · ${site.sectorLabel}`,
    `Vuelo: ${flight.title}`,
    `Fecha: ${formatDate(flight.date)} · ${flight.time}`,
    `Estado: ${flightStatusText(flight.status)}`,
    `Objetivo: ${flight.objective}`,
    `${site.zoneLabel}: ${zoneNames || "Sin zonas seleccionadas"}`,
    "",
    "EN BREVE",
    ...brief.map((line) => `- ${line}`),
    "",
    "CÓMO FUE EL VUELO",
    ...logRows.map(([label, value]) => `${label}: ${value}`),
    ...(flight.log?.debrief
      ? ["", "NOTAS DEL OPERADOR AL ATERRIZAR", flight.log.debrief]
      : []),
    "",
    "TRAZABILIDAD DE DOCUMENTOS",
    ...(flightEvidences.length
      ? flightEvidences.map((entry) => {
          const state = evidenceState(entry);
          return `- ${displayTitle(entry)}: ${evidenceLabels[state.status]} · sello ${state.hash.slice(0, 12)}${state.missingRoleLabels.length ? ` · falta ${state.missingRoleLabels.join(", ")}` : ""}`;
        })
      : ["- Sin documentos registrados para este vuelo."]),
    "",
    `${words.Plural.toUpperCase()} INCLUIDOS`,
    ...(included.length
      ? findingBlocks.map((block, index) => `${index + 1}. ${block}`)
      : [`Sin ${words.plural} incluidos.`]),
    "",
    "NOTAS DE REVISIÓN",
    notes.trim() || "Sin notas adicionales.",
    "",
    "DETALLE TÉCNICO",
    ...technical,
    "",
    "FIRMAS DEL INFORME",
    "Preparado por: ______________________  Fecha: ____________",
    "Revisado por:  ______________________  Fecha: ____________",
    "",
    "LÍMITES Y PROCEDENCIA",
    "Fotografías ilustrativas sin correspondencia técnica con el sitio del mapa. No acreditan lo descrito por los puntos de ejemplo.",
    "Ningún programa analizó las fotos ni midió la cobertura: las hectáreas cubiertas, el clima y la autorización los declara el operador en su bitácora.",
    "Las revisiones y tareas existen solo en la sesión de demostración. Este archivo de texto sí fue generado y descargado localmente; no se envió a terceros.",
  ].join("\n");

  return (
    <div className={styles.reportGrid}>
      <section className={`surface ${styles.reportOptions}`}>
        <h2 className="section-heading">Qué incluir en el informe</h2>
        <p className="text-muted">
          Marque los {words.plural} que quiere incluir. El contexto del vuelo
          acompaña al informe.
        </p>
        <fieldset className={styles.checklist}>
          <legend>{words.Plural} del vuelo</legend>
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
                  <small>
                    {isOpenSuggestion(finding)
                      ? "Sugerencia automática sin revisar"
                      : statusLabel(finding.status, words)}
                  </small>
                </span>
              </label>
            ))
          ) : (
            <p className="text-muted">Este vuelo no tiene {words.plural}.</p>
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
          técnica ni envío. Para dejar el informe con huella y firmas por rol
          use «Firmar el informe del vuelo», más abajo.
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
        <FlightReportSigning
          site={site}
          flight={flight}
          prefill={signablePrefill}
        />
      </section>
      <section
        className={`surface ${styles.reportPreview}`}
        aria-label="Vista previa del informe"
      >
        <div className={styles.reportBrand}>
          <FileText size={23} aria-hidden="true" />
          <span>OTEAR</span>
          <span className={styles.stamp}>Borrador de demostración</span>
        </div>
        <h2>{flight.title}</h2>
        <p className="text-muted">
          {site.name} · {formatDate(flight.date)}
        </p>
        <div className={styles.brief}>
          <h3>En breve</h3>
          <ul>
            {brief.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <h3>Qué se pidió</h3>
        <p>{flight.objective}</p>
        <p>
          <strong>{site.zoneLabel}:</strong> {zoneNames || "Sin asignar"}
        </p>
        <h3>Cómo fue el vuelo</h3>
        <dl className={styles.logGrid}>
          {logRows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {flight.log?.debrief && (
          <>
            <h3>Notas del operador al aterrizar</h3>
            <p>{flight.log.debrief}</p>
          </>
        )}
        <h3>{words.Plural} incluidos</h3>
        {included.length ? (
          included.map((finding) => (
            <article className={styles.reportFinding} key={finding.id}>
              <h4>{finding.title}</h4>
              <p>{finding.description}</p>
              <small>
                {zoneName(finding)} · prioridad{" "}
                {priorityLabels[finding.priority]}
              </small>
              <small>
                {sourceLabel(finding, words)} ·{" "}
                {statusLabel(finding.status, words)}
                {finding.followUp ? ` · ${followUpLine(finding)}` : ""}
              </small>
              <small>
                Frente a vuelos anteriores: {trendLabel(trend(finding))}
              </small>
              <small className={styles.nextStepLine}>
                Siguiente paso: {nextStepLabels[finding.status]}
              </small>
              <small className={styles.coordinates}>
                Coordenadas de ejemplo: {coordinates(finding)}
              </small>
            </article>
          ))
        ) : (
          <p className="text-muted">
            No hay {words.plural} incluidos en este borrador.
          </p>
        )}
        {notes.trim() && (
          <>
            <h3>Notas de revisión</h3>
            <p className={styles.preserveLines}>{notes}</p>
          </>
        )}
        <details className={styles.technical}>
          <summary>Detalle técnico</summary>
          <ul className={styles.limits}>
            {technical.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
        <h3>Límites de los datos</h3>
        <ul className={styles.limits}>
          <li>Las fotografías son ilustrativas y no corresponden al sitio.</li>
          <li>
            Ningún programa analizó las fotos ni midió la cobertura: el clima,
            la autorización y las hectáreas cubiertas los declara el operador.
          </li>
          <li>Las coordenadas y el recorrido son de ejemplo.</li>
        </ul>
        <p className="demo-note">
          Datos de ejemplo. Requiere revisión humana; no acredita un diagnóstico
          ni una operación real.
        </p>
      </section>
    </div>
  );
}
