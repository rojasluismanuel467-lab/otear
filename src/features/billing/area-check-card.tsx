"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import type { AreaCheck } from "./coverage";
import styles from "./area-check.module.css";

const stateText = {
  match: "Coincide",
  over: "Facturó de más",
  under: "Facturó de menos",
  unknown: "Sin verificar",
} as const;

const ha = (value?: number) =>
  value === undefined
    ? "—"
    : `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value)} ha`;

/** Ordered, covered and billed hectares side by side, with the difference and what to do about it. */
export function AreaCheckCard({
  check,
  zoneWord,
  onBilledChange,
}: {
  check: AreaCheck;
  /** Plural word for the zones, to say what was ordered («suertes», «lotes»). */
  zoneWord: string;
  onBilledChange: (value: number | undefined) => void;
}) {
  const [error, setError] = useState("");
  return (
    <section
      className={styles.card}
      aria-labelledby="area-title"
      data-state={check.state}
    >
      <header>
        <h3 id="area-title">
          <Ruler size={17} aria-hidden="true" />
          Verificación del área
        </h3>
        <span className={styles.chip} data-state={check.state}>
          {stateText[check.state]}
        </span>
      </header>
      <dl className={styles.numbers}>
        <div>
          <dt>Pedido</dt>
          <dd>{ha(check.orderedHa)}</dd>
          <small>Suma de las zonas del vuelo ({zoneWord.toLowerCase()})</small>
        </div>
        <div>
          <dt>Cubierto</dt>
          <dd>{ha(check.coveredHa)}</dd>
          <small>Según el registro de vuelo del operador</small>
        </div>
        <div>
          <dt>Facturado</dt>
          <dd>
            <input
              className="field-input"
              aria-label="Hectáreas facturadas"
              inputMode="decimal"
              defaultValue={
                check.billedHa === undefined
                  ? ""
                  : String(check.billedHa).replace(".", ",")
              }
              onBlur={(event) => {
                const text = event.target.value.trim();
                if (!text) {
                  setError("");
                  return onBilledChange(undefined);
                }
                const value = Number(text.replace(",", "."));
                if (!Number.isFinite(value) || value < 0)
                  return setError("Escriba un número de hectáreas.");
                setError("");
                onBilledChange(value);
              }}
            />
          </dd>
          <small>{error || "Lo que dice la factura"}</small>
        </div>
      </dl>
      {check.messages.length > 0 && (
        <ul className={styles.messages}>
          {check.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      <p className={styles.note}>
        El área cubierta es la que reporta el operador; Otear no la mide con las
        imágenes. La tolerancia es de {check.tolerancePct} %.
      </p>
    </section>
  );
}
