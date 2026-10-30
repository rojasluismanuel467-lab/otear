"use client";

import { Button } from "@heroui/react";
import { useState, type FormEvent } from "react";
import { DEFAULT_TOLERANCE_PCT } from "@/features/billing/coverage";
import { DEMO_DATE } from "@/features/demo/demo-data";
import type { ServiceRequest } from "@/features/demo/types";
import { formatDate, formatMoney } from "@/lib/format";
import type { ActionInput } from "./use-services";
import { replyKinds, type ActionId } from "./workflow";
import styles from "./services.module.css";

const number = (text: string) => Number(text.trim().replace(",", "."));
const hectares = (value: number) =>
  `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(value)} ha`;
const optional = (text: string) => {
  const value = number(text);
  return text && Number.isFinite(value) && value > 0 ? value : undefined;
};

/** One form per step of the flow; it validates what it can and hands the rest to the workflow. */
export function ActionForm({
  request,
  action,
  orderedHa,
  flightDate,
  onSubmit,
  onCancel,
}: {
  request: ServiceRequest;
  action: ActionId;
  orderedHa: number;
  /** Date of the flight this service scheduled, to warn when it has not happened yet. */
  flightDate?: string;
  onSubmit: (input: ActionInput) => string | undefined;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const perHa = request.unit === "ha";
  const declared = request.delivery?.coveredHa;
  const chosen = request.quotes.find((item) => item.state === "chosen");
  const [billedText, setBilledText] = useState(
    String(declared ?? "").replace(".", ","),
  );
  const billed = number(billedText);
  const kinds = replyKinds(request);
  const [replyKind, setReplyKind] = useState<"adjusted" | "upheld" | "">(
    kinds.length === 1 ? kinds[0] : "",
  );
  const [adjustedText, setAdjustedText] = useState("");
  const adjusted = number(adjustedText);

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
          coveredHa: perHa ? number(read("coveredHa")) : undefined,
          deliverables: read("deliverables")
            .split(/[,\n]/)
            .map((item) => item.trim())
            .filter(Boolean),
          note: read("note"),
          durationMin: optional(read("durationMin")),
          photoCount: optional(read("photoCount")),
        };
        break;
      case "reply": {
        const supportFiles = read("supportFiles")
          .split(/[,\n]/)
          .map((item) => item.trim())
          .filter(Boolean);
        if (replyKind === "adjusted") {
          input = {
            id: "reply",
            kind: "adjusted",
            adjustedHa: number(adjustedText),
            note: read("note"),
            supportFiles,
          };
        } else if (replyKind === "upheld") {
          input = {
            id: "reply",
            kind: "upheld",
            note: read("note"),
            supportFiles,
          };
        } else {
          setError(
            "Elija cómo responde: aceptar el ajuste o sostener lo entregado.",
          );
          return;
        }
        break;
      }
      case "verify": {
        const result = read("result");
        if (result !== "accepted" && result !== "disputed") {
          setError("Elija si acepta la entrega o pide un ajuste.");
          return;
        }
        input = { id: "verify", result, note: read("note") };
        break;
      }
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
      (input.id === "deliver" &&
        input.coveredHa !== undefined &&
        !Number.isFinite(input.coveredHa)) ||
      (input.id === "reply" &&
        input.kind === "adjusted" &&
        !Number.isFinite(input.adjustedHa)) ||
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
          {flightDate && flightDate > DEMO_DATE && (
            <p className={styles.notice}>
              Este vuelo estaba programado para el {formatDate(flightDate)} y la
              fecha de referencia de la demo es el {formatDate(DEMO_DATE)}. Si
              ya voló, registre la entrega: el vuelo quedará completado con la
              fecha de hoy. Si todavía no voló, vuelva y espere al día del
              vuelo.
            </p>
          )}
          <div className={styles.formGrid}>
            {perHa && (
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
            )}
            <label className="form-field">
              <span className="field-label">Archivos que entrega</span>
              <input
                className="field-input"
                name="deliverables"
                autoFocus={!perHa}
                placeholder="Ortomosaico (GeoTIFF), Registro de vuelo (CSV)"
              />
              <span className="text-muted">
                Sepárelos con comas. En esta demo solo se anotan los nombres: no
                se sube ni se guarda ningún archivo. Cómo llegan los archivos
                (carga directa o un enlace a su almacenamiento) está por
                definir.
              </span>
            </label>
          </div>
          <div className={styles.formGrid}>
            <label className="form-field">
              <span className="field-label">
                Duración del vuelo, en minutos (opcional)
              </span>
              <input
                className="field-input"
                name="durationMin"
                inputMode="numeric"
              />
            </label>
            <label className="form-field">
              <span className="field-label">Fotos tomadas (opcional)</span>
              <input
                className="field-input"
                name="photoCount"
                inputMode="numeric"
              />
            </label>
          </div>
          <label className="form-field">
            <span className="field-label">Observaciones (opcional)</span>
            <input className="field-input" name="note" maxLength={300} />
          </label>
        </>
      )}
      {action === "reply" && (
        <>
          {request.verification && (
            <p className={styles.notice}>
              El cliente escribió
              {request.verification.note
                ? `: «${request.verification.note}»`
                : " que pide ajustar la entrega."}{" "}
              Su respuesta queda en la historia y la ve quien contrata.
            </p>
          )}
          <fieldset className={styles.choices}>
            <legend>Su respuesta</legend>
            {kinds.includes("adjusted") && (
              <label className={styles.choice}>
                <input
                  type="radio"
                  name="replyKind"
                  value="adjusted"
                  checked={replyKind === "adjusted"}
                  onChange={() => setReplyKind("adjusted")}
                />
                <span>
                  Aceptar el ajuste: facturo menos hectáreas, las que el cliente
                  pide.
                </span>
              </label>
            )}
            <label className={styles.choice}>
              <input
                type="radio"
                name="replyKind"
                value="upheld"
                checked={replyKind === "upheld"}
                onChange={() => setReplyKind("upheld")}
              />
              <span>
                Sostener lo entregado: explico por qué y puedo anotar los
                archivos que lo respaldan.
              </span>
            </label>
          </fieldset>
          {replyKind === "adjusted" && declared !== undefined && (
            <label className="form-field">
              <span className="field-label">
                Hectáreas que acepta dejar como cubiertas
              </span>
              <input
                className="field-input"
                inputMode="decimal"
                autoFocus
                value={adjustedText}
                onChange={(event) => setAdjustedText(event.target.value)}
              />
              <span className="text-muted" aria-live="polite">
                Declaró {hectares(declared)}; la cifra nueva debe ser menor.
                {chosen && Number.isFinite(adjusted) && adjusted > 0
                  ? ` A ${formatMoney(chosen.price)} por hectárea, ${hectares(adjusted)} son ${formatMoney(Math.round(chosen.price * adjusted))} en vez de ${formatMoney(Math.round(chosen.price * declared))} (cifras de ejemplo).`
                  : ""}
              </span>
            </label>
          )}
          <label className="form-field">
            <span className="field-label">
              {replyKind === "upheld"
                ? "Su nota para el cliente (obligatoria)"
                : "Su nota para el cliente (opcional)"}
            </span>
            <input
              className="field-input"
              name="note"
              maxLength={300}
              autoFocus={replyKind !== "adjusted"}
            />
          </label>
          <label className="form-field">
            <span className="field-label">Archivos de soporte (opcional)</span>
            <input
              className="field-input"
              name="supportFiles"
              placeholder="Registro de vuelo (CSV), Captura de la ruta (PNG)"
            />
            <span className="text-muted">
              Sepárelos con comas. Solo se anotan los nombres: en esta demo no
              se sube ningún archivo.
            </span>
          </label>
        </>
      )}
      {action === "verify" && (
        <>
          {request.disputeReply && (
            <p className={styles.notice}>
              {request.disputeReply.kind === "adjusted"
                ? `El operador aceptó el ajuste: ahora declara ${hectares(request.disputeReply.adjustedHa ?? 0)} (antes ${hectares(request.disputeReply.previousHa ?? 0)}).`
                : "El operador sostiene lo entregado y lo explicó."}{" "}
              Su respuesta está arriba, junto al reclamo.
            </p>
          )}
          {declared === undefined && (
            <p className={styles.notice}>
              Acepte la entrega si recibió lo acordado. Los archivos que anotó
              el operador están en la entrega; en esta demo no hay archivos que
              abrir.
            </p>
          )}
          {declared !== undefined && (
            <p className={styles.notice}>
              El operador declaró {hectares(declared)}
              {orderedHa > 0
                ? ` de las ${hectares(orderedHa)} pedidas (${Math.round((declared / orderedHa) * 100)} %)`
                : ""}
              .
              {perHa && chosen
                ? ` A ${formatMoney(chosen.price)} por hectárea, son ${formatMoney(Math.round(chosen.price * declared))}.`
                : ""}{" "}
              Aceptar la entrega da por buena esa cifra. Cifras de ejemplo;
              Otear no mide el área con las imágenes.
            </p>
          )}
          <fieldset className={styles.choices}>
            <legend>¿Qué decide?</legend>
            <label className={styles.choice}>
              <input type="radio" name="result" value="accepted" />
              <span>Aceptar la entrega: el operador podrá facturar.</span>
            </label>
            <label className={styles.choice}>
              <input type="radio" name="result" value="disputed" />
              <span>
                Pedir un ajuste: queda en disputa hasta que el operador responda
                o vuelva a entregar.
              </span>
            </label>
          </fieldset>
          <label className="form-field">
            <span className="field-label">
              Comentario (obligatorio si pide un ajuste)
            </span>
            <input className="field-input" name="note" maxLength={300} />
          </label>
        </>
      )}
      {action === "invoice" && (
        <>
          {!request.flightId && (
            <p className={styles.notice}>
              Este servicio no tiene un vuelo asociado. La factura se crea
              igual, con las hectáreas de la entrega; solo no podrá abrir el
              vuelo desde Pagos.
            </p>
          )}
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
                value={billedText}
                onChange={(event) => setBilledText(event.target.value)}
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
                : `Se factura el precio acordado${chosen ? `: ${formatMoney(chosen.price)}` : ""}.`}
            </span>
          </label>
          {perHa && chosen && Number.isFinite(billed) && billed > 0 && (
            <p className={styles.notice} aria-live="polite">
              {hectares(billed)} × {formatMoney(chosen.price)} por hectárea ={" "}
              <strong>{formatMoney(Math.round(chosen.price * billed))}</strong>.
              Cifra de ejemplo.
              {declared !== undefined && billed > declared && (
                <>
                  {" "}
                  Usted declaró {hectares(declared)} al entregar. Si factura
                  más, el cliente verá la diferencia marcada en Pagos
                  {((billed - declared) / declared) * 100 >
                  DEFAULT_TOLERANCE_PCT
                    ? ` (supera el ${DEFAULT_TOLERANCE_PCT} % que la demo tolera)`
                    : ""}
                  . Puede facturar así si hay una razón; explíquela al cliente.
                </>
              )}
            </p>
          )}
        </>
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
