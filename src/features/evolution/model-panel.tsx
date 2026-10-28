"use client";

import { useRef } from "react";
import { Box, Upload, X } from "lucide-react";
import { deliverables } from "./point-cloud";
import styles from "./evolution.module.css";

export type ModelStatus =
  | { state: "idle" }
  | { state: "loading"; name: string }
  | { state: "error"; text: string };

/** Controls over the stage to load the survey file of the date shown, and to go back to the schematic. */
export function ModelBar({
  loaded,
  info,
  status,
  up,
  onUp,
  onFile,
  onClear,
}: {
  /** Name of the file loaded for this date, if any. */
  loaded?: string;
  info?: string;
  status: ModelStatus;
  up: "z" | "y";
  onUp: (up: "z" | "y") => void;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={styles.modelBar}>
      <button
        type="button"
        className={styles.modelButton}
        onClick={() => input.current?.click()}
        disabled={status.state === "loading"}
      >
        <Upload size={15} aria-hidden="true" />
        {status.state === "loading"
          ? "Leyendo…"
          : loaded
            ? "Cambiar archivo"
            : "Cargar archivo de esta fecha"}
      </button>
      <input
        ref={input}
        type="file"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
      <label className={styles.modelUp}>
        <span>Eje vertical</span>
        <select
          className="field-select"
          value={up}
          onChange={(event) => onUp(event.target.value as "z" | "y")}
        >
          <option value="z">Z · topografía</option>
          <option value="y">Y · modelado (GLB)</option>
        </select>
      </label>
      {loaded && (
        <button type="button" className={styles.modelButton} onClick={onClear}>
          <X size={15} aria-hidden="true" />
          Ver el esquema
        </button>
      )}
      {(loaded || status.state === "error") && (
        <p
          className={styles.modelInfo}
          role={status.state === "error" ? "alert" : "status"}
          data-tone={status.state === "error" ? "error" : undefined}
        >
          {status.state === "error" ? (
            status.text
          ) : (
            <>
              <Box size={14} aria-hidden="true" />
              {loaded}
              {info ? ` · ${info}` : ""}
            </>
          )}
        </p>
      )}
    </div>
  );
}

/** What a survey usually delivers and what Otear does with each file. */
export function DeliverablesHelp() {
  return (
    <details className={styles.reading}>
      <summary>Qué archivos entrega un levantamiento</summary>
      <p className={styles.helpText}>
        Un vuelo de obra suele entregar estos archivos. El visor 3D lee los que
        están marcados; los demás se explican al cargarlos.
      </p>
      <ul className={styles.formats}>
        {deliverables.map((item) => (
          <li
            key={item.name}
            data-supported={item.supported ? "true" : "false"}
          >
            <strong>
              {item.name}
              <span>{item.ext.join(" ")}</span>
            </strong>
            <small>
              {item.what}
              {item.note ? ` ${item.note}` : ""}
            </small>
            <em>{item.supported ? "Se puede ver" : "No se puede ver aún"}</em>
          </li>
        ))}
      </ul>
    </details>
  );
}
