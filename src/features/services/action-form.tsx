"use client";

import { Button } from "@heroui/react";
import { useState, type FormEvent } from "react";
import { formatMoney } from "@/lib/format";
import type { ServiceRequest } from "@/features/demo/types";
import type { ActionInput } from "./use-services";
import type { ActionId } from "./workflow";
import styles from "./services.module.css";

const number = (text: string) => Number(text.trim().replace(",", "."));

/** One form per step of the flow; it validates what it can and hands the rest to the workflow. */
export function ActionForm({
  request,
  action,
  orderedHa,
  onSubmit,
  onCancel,
}: {
  request: ServiceRequest;
  action: ActionId;
  orderedHa: number;
  onSubmit: (input: ActionInput) => string | undefined;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const perHa = request.unit === "ha";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    let input: ActionInput;
    switch (action) {
      case "quote":
        input = {
          id: "quote",
          price: number(read("price")),
          startDate: read("startDate"),
          note: read("note"),
        };
        break;
      case "decline":
        input = { id: "decline", note: read("note") };
        break;
      case "schedule":
        input = {
          id: "schedule",
          date: read("date"),
          time: read("time"),
          pilot: read("pilot"),
        };
        break;
      case "deliver":
        input = {
          id: "deliver",
          coveredHa: number(read("coveredHa")),
          deliverables: read("deliverables")
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter(Boolean),
          note: read("note"),
        };
        break;
      case "verify":
        input = {
          id: "verify",
          result: read("result") === "disputed" ? "disputed" : "accepted",
          note: read("note"),
        };
        break;
      case "invoice": {
        const text = read("billedHa");
        input = {
          id: "invoice",
          billedHa: text ? number(text) : undefined,
        };
        break;
      }
      default:
        input = { id: "cancel", note: read("note") };
    }
    if (
      (input.id === "quote" && !Number.isFinite(input.price)) ||
      (input.id === "deliver" && !Number.isFinite(input.coveredHa)) ||
      (input.id === "invoice" &&
        input.billedHa !== undefined &&
        !Number.isFinite(input.billedHa))
    ) {
      setError("Escriba un número válido.");
      return;
    }
    const failure = onSubmit(input);
    if (failure) setError(failure);
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {action === "quote" && (
        <>
          <div className={styles.formGrid}>
            <label className="form-field">
              <span className="field-label">
                {perHa ? "Precio por hectárea (COP)" : "Precio por vuelo (COP)"}
              </span>
              <input
                className="field-input"
                name="price"
                inputMode="numeric"
                autoFocus
                defaultValue={
                  request.quotes.find((item) => item.state === "open")?.price
                }
              />
              {perHa && orderedHa > 0 && (
                <span className="text-muted">
                  Sobre{" "}
                  {new Intl.NumberFormat("es-CO", {
                    maximumFractionDigits: 1,
                  }).format(orderedHa)}{" "}
                  ha pedidas.
                </span>
              )}
            </label>
            <label className="form-field">
              <span className="field-label">Puedo volar desde</span>
              <input
                className="field-input"
                name="startDate"
                type="date"
                min={request.windowStart}
                max={request.windowEnd}
                defaultValue={request.windowStart}
              />
            </label>
          </div>
          <label className="form-field">
            <span className="field-label">Condiciones (opcional)</span>
            <input
              className="field-input"
              name="note"
              maxLength={300}
              placeholder="Ej. incluye el transporte del equipo"
            />
          </label>
        </>
      )}
      {(action === "decline" || action === "cancel") && (
        <label className="form-field">
          <span className="field-label">
            {action === "decline"
              ? "Motivo (opcional)"
              : "Motivo de la cancelación (opcional)"}
          </span>
          <input
            className="field-input"
            name="note"
            maxLength={300}
            autoFocus
          />
        </label>
      )}
      {action === "schedule" && (
        <div className={styles.formGrid}>
          <label className="form-field">
            <span className="field-label">Fecha del vuelo</span>
            <input
              className="field-input"
              name="date"
              type="date"
              min={request.windowStart}
              max={request.windowEnd}
              defaultValue={request.windowStart}
              autoFocus
            />
            <span className="text-muted">
              La ventana pedida va del {request.windowStart} al{" "}
              {request.windowEnd}.
            </span>
          </label>
          <label className="form-field">
            <span className="field-label">Hora</span>
            <input
              className="field-input"
              name="time"
              type="time"
              defaultValue="07:00"
            />
          </label>
          <label className="form-field">
            <span className="field-label">Piloto (opcional)</span>
            <input className="field-input" name="pilot" maxLength={80} />
          </label>
        </div>
      )}
      {action === "deliver" && (
        <>
          <div className={styles.formGrid}>
            <label className="form-field">
              <span className="field-label">Hectáreas que cubrió</span>
              <input
                className="field-input"
                name="coveredHa"
                inputMode="decimal"
                autoFocus
                placeholder={
                  orderedHa
                    ? new Intl.NumberFormat("es-CO", {
                        maximumFractionDigits: 1,
                      }).format(orderedHa)
                    : ""
                }
              />
              <span className="text-muted">
                Es lo que usted declara; quien contrata lo contrasta con lo
                pedido.
              </span>
            </label>
            <label className="form-field">
              <span className="field-label">Archivos que entrega</span>
              <input
                className="field-input"
                name="deliverables"
                placeholder="Ortomosaico (GeoTIFF), Registro de vuelo (CSV)"
              />
              <span className="text-muted">Sepárelos con comas.</span>
            </label>
          </div>
          <label className="form-field">
            <span className="field-label">Observaciones (opcional)</span>
            <input className="field-input" name="note" maxLength={300} />
          </label>
        </>
      )}
      {action === "verify" && (
        <>
          <fieldset className={styles.choices}>
            <legend>¿Qué decide?</legend>
            <label className={styles.choice}>
              <input
                type="radio"
                name="result"
                value="accepted"
                defaultChecked
              />
              <span>Aceptar la entrega: el operador podrá facturar.</span>
            </label>
            <label className={styles.choice}>
              <input type="radio" name="result" value="disputed" />
              <span>
                Pedir que la corrija: queda en disputa hasta que la vuelva a
                entregar.
              </span>
            </label>
          </fieldset>
          <label className="form-field">
            <span className="field-label">
              Comentario (obligatorio si pide corregir)
            </span>
            <input className="field-input" name="note" maxLength={300} />
          </label>
        </>
      )}
      {action === "invoice" && (
        <label className="form-field">
          <span className="field-label">
            {perHa ? "Hectáreas que va a facturar" : "Alcance facturado"}
          </span>
          {perHa ? (
            <input
              className="field-input"
              name="billedHa"
              inputMode="decimal"
              autoFocus
              defaultValue={String(request.delivery?.coveredHa ?? "").replace(
                ".",
                ",",
              )}
            />
          ) : (
            <input
              className="field-input"
              name="billedHa"
              disabled
              placeholder="Precio por vuelo"
            />
          )}
          <span className="text-muted">
            {perHa
              ? "Se multiplica por el precio cotizado. Quien paga lo verifica contra lo cubierto."
              : `Se factura el precio acordado${request.quotes.find((item) => item.state === "chosen") ? `: ${formatMoney(request.quotes.find((item) => item.state === "chosen")!.price)}` : ""}.`}
          </span>
        </label>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <div className={styles.formActions}>
        <Button type="submit" variant="primary">
          Confirmar
        </Button>
        <Button variant="secondary" onPress={onCancel}>
          Volver
        </Button>
      </div>
    </form>
  );
}
