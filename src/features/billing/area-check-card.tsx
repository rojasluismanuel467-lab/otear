"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { formatMoney } from "@/lib/format";
import {
  areaHeadline,
  toleranceText,
  type AreaCheck,
  type AreaValue,
} from "./coverage";
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
  value,
  invoiceTotal,
  coveredSource = "flight",
  operatorNote,
  onBilledChange,
}: {
  /** Where the covered hectares come from: the flight record, or the delivery when there is no flight. */
  coveredSource?: "flight" | "delivery";
  /** What the operator wrote when invoicing, if anything. */
  operatorNote?: string;
  check: AreaCheck;
  /** The same difference in pesos, when the invoice or the service gives a price. */
  value?: AreaValue;
  invoiceTotal: number;
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
      <p className={styles.headline}>{areaHeadline(check)}</p>
      {value && Math.abs(value.differenceHa) >= 0.05 && (
        <p className={styles.value}>
          Son unos <strong>{formatMoney(Math.abs(value.differenceCop))}</strong>{" "}
          {value.differenceHa > 0 ? "de más" : "de menos"}, a{" "}
          {formatMoney(Math.round(value.unitPrice))} por hectárea
          {value.source === "quote"
            ? " (el precio cotizado para este servicio)"
            : " (el total de la factura entre sus hectáreas, porque falta el precio cotizado)"}
          . Cifra de ejemplo.
        </p>
      )}
      <dl className={styles.numbers}>
        <div>
          <dt>Pedido</dt>
          <dd>{ha(check.orderedHa)}</dd>
          <small>Suma de las zonas del vuelo ({zoneWord.toLowerCase()})</small>
        </div>
        <div>
          <dt>Cubierto</dt>
          <dd>{ha(check.coveredHa)}</dd>
          <small>
            {coveredSource === "delivery"
              ? "Según la entrega del operador"
              : "Según el registro de vuelo del operador"}
          </small>
        </div>
        <div>
          <dt>Facturado (la factura dice)</dt>
          <dd>
            <input
              className="field-input"
              aria-label="Hectáreas que dice la factura"
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
          <small>
            {error || "Puede corregirla si la factura dice otra cosa"}
          </small>
        </div>
      </dl>
      {value?.expectedTotal !== undefined && value.totalGap !== undefined && (
        <p className={styles.value} data-gap={Math.abs(value.totalGap) > 1}>
          {Math.abs(value.totalGap) <= 1
            ? `El total de la factura (${formatMoney(invoiceTotal)}) coincide con las hectáreas facturadas por el precio cotizado.`
            : `Valor esperado: ${ha(check.billedHa)} facturadas × el precio cotizado = ${formatMoney(value.expectedTotal)}; la factura dice ${formatMoney(invoiceTotal)} (${value.totalGap > 0 ? "+" : "-"}${formatMoney(Math.abs(value.totalGap))}). Pida la explicación antes de pagar.`}
        </p>
      )}
      {check.messages.length > 0 && (
        <ul className={styles.messages}>
          {check.messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      <p className={styles.note}>
        El área cubierta es la que reporta el operador; Otear no la mide con las
        imágenes. {toleranceText(check.tolerancePct)}
      </p>
      {operatorNote && (
        <p className={styles.note}>
          <strong>Nota del operador:</strong> {operatorNote}
        </p>
      )}
    </section>
  );
}
