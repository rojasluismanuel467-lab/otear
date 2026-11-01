"use client";

import { useRef, useState } from "react";
import {
  Button,
  ButtonWithReason,
  ErrorText,
  LOADING_MS,
  Placeholder,
  StateBox,
  useLater,
} from "./parts";
import type { Labor } from "./data";
import type { Claim } from "./session";
import {
  LINK_DAYS,
  MAX_MESSAGE_LENGTH,
  supportsFor,
  linkExpiry,
  lotsPhrase,
  deliveryOutcome,
  evidenceMessage,
  hectares,
  normalizePhone,
  pesos,
  sendBlockers,
  type Verification,
} from "./verification";
import styles from "./prototype.module.css";

type SendState =
  { kind: "idle" } | { kind: "loading" } | { kind: "sent" } | { kind: "error" };

const evidenceLink = (labor: Labor) =>
  `otear.app/e/santa-rita-${labor.id} (enlace de ejemplo)`;

/** Screen 12 of S1, «Compartir evidencia»: only what is needed, with a link that expires. */
export function ShareScreen({
  labor,
  verification,
  claim,
  onBack,
  onSent,
}: {
  labor: Labor;
  verification: Verification;
  /** Set when the labor already has a claim: the screen then only shows what was sent. */
  claim?: Claim;
  onBack: () => void;
  onSent: (claim: Claim) => void;
}) {
  const later = useLater();
  const destinationField = useRef<HTMLInputElement>(null);
  const [destination, setDestination] = useState(
    claim?.destination ?? labor.contact ?? "",
  );
  const [message, setMessage] = useState(
    claim?.message ?? evidenceMessage(labor, verification),
  );
  const available = supportsFor(labor, verification.flightDate);
  const [chosen, setChosen] = useState<boolean[]>(() =>
    available.map((support) =>
      claim ? claim.supports.includes(support) : true,
    ),
  );
  const [send, setSend] = useState<SendState>(
    claim ? { kind: "sent" } : { kind: "idle" },
  );
  const [copied, setCopied] = useState(false);

  const supports = available.filter((_, index) => chosen[index]);
  const blockers = sendBlockers({
    destination,
    message,
    supports: supports.length,
  });
  const busy = send.kind === "loading" || send.kind === "sent";
  const number = normalizePhone(destination);

  const submit = () => {
    setSend({ kind: "loading" });
    later(() => {
      if (deliveryOutcome(destination) === "failed") {
        setSend({ kind: "error" });
        return;
      }
      setSend({ kind: "sent" });
      onSent({
        destination,
        message,
        supports,
        verification,
      });
    }, LOADING_MS);
  };

  const copyForMyself = async () => {
    try {
      await navigator.clipboard.writeText(
        `${message}\n\n${evidenceLink(labor)}`,
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const gap = verification.value?.differenceHa ?? 0;

  return (
    <>
      <Button variant="link" className={styles.crumb} onClick={onBack}>
        {claim
          ? "← Volver a Labores y tareas"
          : "← Volver a verificar el cobro"}
      </Button>
      <header className={styles.head}>
        <h1 className={styles.title}>Compartir evidencia</h1>
        <p className={styles.subtitle}>
          {labor.name} de los {labor.lotsText.toLowerCase()} · diferencia de{" "}
          {hectares(Math.abs(Math.round(gap * 10) / 10))} (
          {pesos(Math.abs(verification.value?.differenceCop ?? 0))})
        </p>
      </header>
      <p className={styles.sim}>
        Simulación con datos de ejemplo: no se envía nada a nadie.
      </p>

      {send.kind === "sent" ? (
        <StateBox
          tone="ok"
          title={`Evidencia enviada a ${labor.doneBy}.`}
          autoFocus
          actions={
            <Button variant="primary" onClick={onBack}>
              Volver a Labores y tareas
            </Button>
          }
        >
          <p>
            La labor quedó en reclamo. El enlace vence el {linkExpiry()} (
            {LINK_DAYS} días) y no permite descargar las demás fotos de la
            finca.
          </p>
        </StateBox>
      ) : null}

      {send.kind === "loading" ? (
        <StateBox tone="loading" title="Enviando la evidencia…" />
      ) : null}

      {send.kind === "error" ? (
        <StateBox
          tone="error"
          title="El mensaje no llegó."
          autoFocus
          actions={
            <>
              <Button variant="primary" onClick={submit}>
                Reintentar
              </Button>
              <Button
                onClick={() => {
                  setSend({ kind: "idle" });
                  destinationField.current?.focus();
                }}
              >
                Corregir el número
              </Button>
              <Button onClick={copyForMyself}>
                {copied
                  ? "Copiado: péguelo en su WhatsApp"
                  : "Copiar el mensaje y el enlace"}
              </Button>
            </>
          }
        >
          <ErrorText
            why={`WhatsApp no pudo entregarlo al ${destination}; puede estar mal escrito o no tener WhatsApp.`}
            todo="Revise el número y reintente, o copie el mensaje y mándelo usted desde su teléfono."
          />
        </StateBox>
      ) : null}

      <div className={styles.columns}>
        <div className={styles.stack}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="destination">
              Para (WhatsApp de {labor.doneBy})
            </label>
            <input
              id="destination"
              ref={destinationField}
              className={`${styles.input} ${send.kind === "error" ? styles.inputError : ""}`}
              value={destination}
              inputMode="tel"
              autoComplete="off"
              disabled={busy}
              aria-invalid={Boolean(destination) && !number}
              aria-describedby="destination-help"
              onChange={(event) => {
                setDestination(event.target.value);
                if (send.kind === "error") setSend({ kind: "idle" });
              }}
            />
            <p id="destination-help" className={styles.reason}>
              El WhatsApp que tiene la finca de {labor.doneBy}. Puede
              corregirlo.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="message">
              Mensaje
            </label>
            <textarea
              id="message"
              className={styles.textarea}
              value={message}
              disabled={busy}
              aria-describedby="message-count"
              onChange={(event) => setMessage(event.target.value)}
            />
            <span id="message-count" className={styles.counter}>
              {message.length} de {MAX_MESSAGE_LENGTH} caracteres
            </span>
          </div>

          <fieldset
            style={{ border: 0, padding: 0, margin: 0 }}
            disabled={busy}
          >
            <legend className={styles.label}>Se comparte</legend>
            {available.map((support, index) => (
              <label key={support} className={styles.check}>
                <input
                  type="checkbox"
                  checked={chosen[index]}
                  onChange={(event) =>
                    setChosen((current) =>
                      current.map((value, at) =>
                        at === index ? event.target.checked : value,
                      ),
                    )
                  }
                />
                <span>{support}</span>
              </label>
            ))}
            <p className={styles.reason}>
              El enlace vence en {LINK_DAYS} días y no permite descargar las
              demás fotos de la finca.
            </p>
          </fieldset>
        </div>

        <div className={styles.stack}>
          <Placeholder
            label={`Vista previa de la evidencia: mapa del operador y fotos de los ${lotsPhrase(labor.lotIds)}`}
            ratio="16 / 9"
          />
          {claim ? null : (
            <div className={styles.actions}>
              <ButtonWithReason
                id="submit"
                variant="primary"
                loading={send.kind === "loading"}
                reason={blockers[0]}
                onClick={submit}
              >
                {send.kind === "loading" ? "Enviando…" : "Enviar"}
              </ButtonWithReason>
              <Button onClick={onBack} disabled={send.kind === "loading"}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
