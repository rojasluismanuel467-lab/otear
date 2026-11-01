"use client";

import { useEffect, useRef } from "react";
import {
  Button,
  ButtonWithReason,
  ErrorText,
  LOADING_MS,
  Placeholder,
  StateBox,
  useLater,
} from "./parts";
import {
  EXAMPLE_MAP_NAME,
  EXAMPLE_MAP_TEXT,
  OWN_FLIGHTS,
  type Labor,
} from "./data";
import type { VerifySession } from "./session";
import {
  flightProblemText,
  MAP_PROBLEM_TEXT,
  checkFlight,
  checkMapFile,
  hectares,
  lotsPhrase,
  pesos,
  readOperatorMap,
  shortDate,
  verifyCharge,
  type Verification,
} from "./verification";
import styles from "./prototype.module.css";

type Props = {
  labor: Labor;
  session: VerifySession;
  failAccept: boolean;
  onChange: (change: Partial<VerifySession>) => void;
  onBack: () => void;
  onShare: (verification: Verification) => void;
  onAccepted: () => void;
};

/** Screen 11 of S1, «Verificar cobro»: charged, applied and ordered side by side, and what to do about it. */
export function VerifyScreen({
  labor,
  session,
  failAccept,
  onChange,
  onBack,
  onShare,
  onAccepted,
}: Props) {
  const later = useLater();
  const fileInput = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const { map, compare, accept } = session;
  const locked = compare.kind === "loading" || compare.kind === "done";
  const verification =
    compare.kind === "done" ? compare.verification : undefined;
  const billedTotal = Math.round(
    (labor.billedHa ?? 0) * (labor.pricePerHa ?? 0),
  );
  const flight = OWN_FLIGHTS.find((item) => item.id === session.flightId);

  /* The confirmation is a native dialog: it traps the focus and Escape closes it. */
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (accept.kind === "asking" && !element.open) element.showModal();
    if (accept.kind !== "asking" && element.open) element.close();
  }, [accept.kind]);

  const startMap = (file?: File) => {
    const fileName = file?.name ?? EXAMPLE_MAP_NAME;
    onChange({ map: { kind: "loading", fileName } });
    const finish = (outcome: ReturnType<typeof readOperatorMap>) =>
      later(
        () =>
          onChange({
            map: outcome.ok
              ? { kind: "ready", reading: outcome.reading }
              : { kind: "error", problem: outcome.problem, fileName },
          }),
        LOADING_MS,
      );
    const early = file ? checkMapFile(file.name, file.size) : undefined;
    if (early) return finish({ ok: false, problem: early });
    (file ? file.text() : Promise.resolve(EXAMPLE_MAP_TEXT))
      .then((text) => finish(readOperatorMap(text, fileName)))
      .catch(() => finish({ ok: false, problem: "unreadable" }));
  };

  const startCompare = () => {
    if (map.kind !== "ready" || !flight) return;
    onChange({ compare: { kind: "loading" } });
    later(() => {
      const result = checkFlight(flight, labor);
      onChange({
        compare: result.ok
          ? {
              kind: "done",
              flightId: flight.id,
              verification: verifyCharge({
                labor,
                appliedHa: map.reading.appliedHa,
                measuredHa: result.measuredHa,
                flightDate: flight.date,
              }),
            }
          : { kind: "error", problem: result.problem },
      });
    }, LOADING_MS);
  };

  const confirmAccept = () => {
    onChange({ accept: { kind: "loading" } });
    later(() => {
      if (failAccept) onChange({ accept: { kind: "error" } });
      else onAccepted();
    }, LOADING_MS);
  };

  const compareReason =
    map.kind !== "ready"
      ? "Falta leer el mapa del operador."
      : !session.flightId
        ? "Falta elegir su vuelo."
        : undefined;

  return (
    <>
      <Button variant="link" className={styles.crumb} onClick={onBack}>
        ← Volver a Labores y tareas
      </Button>
      <header className={styles.head}>
        <h1 className={styles.title}>
          Verificar el cobro de la {labor.name.toLowerCase()}
        </h1>
        <p className={styles.subtitle}>
          {labor.lotsText} · {labor.doneBy} · {shortDate(labor.date)} ·{" "}
          {pesos(labor.pricePerHa ?? 0)} por hectárea
        </p>
      </header>
      <p className={styles.sim}>
        Simulación con datos de ejemplo: no se envía nada a nadie.
      </p>

      <div className={styles.columns}>
        <div className={styles.stack}>
          {/* Step 1: the operator's map */}
          <section
            className={`${styles.step} ${locked ? styles.stepLocked : ""}`}
            aria-labelledby="step-map"
          >
            <h2 id="step-map" className={styles.stepTitle}>
              1. Mapa de aplicación del operador
            </h2>
            <input
              ref={fileInput}
              type="file"
              className={styles.srOnly}
              tabIndex={-1}
              aria-hidden="true"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) startMap(file);
              }}
            />
            {map.kind === "loading" ? (
              <StateBox tone="loading" title={`Leyendo ${map.fileName}…`}>
                <p>Estoy contando las hectáreas que dibujó el operador.</p>
              </StateBox>
            ) : map.kind === "ready" ? (
              <StateBox
                tone="ok"
                title={`${hectares(map.reading.appliedHa)} leídas del mapa`}
              >
                <p className={styles.reason}>
                  {map.reading.fileName} ·{" "}
                  {map.reading.zones
                    .map((zone) => `${zone.name} ${hectares(zone.ha)}`)
                    .join(" · ")}
                </p>
              </StateBox>
            ) : map.kind === "error" ? (
              <StateBox
                tone="error"
                title={MAP_PROBLEM_TEXT[map.problem].what}
                autoFocus
              >
                <p className={styles.reason}>Archivo: {map.fileName}</p>
                <ErrorText
                  why={MAP_PROBLEM_TEXT[map.problem].why}
                  todo={MAP_PROBLEM_TEXT[map.problem].todo}
                />
              </StateBox>
            ) : (
              <p>
                Cargue el mapa en KML o GeoJSON que le entregó el operador, o
                use el de ejemplo.
              </p>
            )}
            {map.kind === "idle" && map.requested ? (
              <StateBox
                tone="info"
                title="Mapa pedido al operador (simulación)."
              >
                <p>
                  Se prepararía un mensaje para {labor.doneBy}. No se envió
                  nada. Cuando lo reciba, cárguelo aquí.
                </p>
              </StateBox>
            ) : null}
            <div className={styles.actions}>
              {map.kind === "ready" ? (
                <Button
                  disabled={locked}
                  onClick={() => fileInput.current?.click()}
                >
                  Cambiar el mapa
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    loading={map.kind === "loading"}
                    disabled={locked}
                    onClick={() => fileInput.current?.click()}
                  >
                    {map.kind === "loading" ? "Cargando…" : "Elegir archivo"}
                  </Button>
                  <Button
                    loading={map.kind === "loading"}
                    disabled={locked}
                    onClick={() => startMap()}
                  >
                    Usar el mapa de ejemplo
                  </Button>
                </>
              )}
              {map.kind === "error" ? (
                <Button
                  onClick={() =>
                    onChange({ map: { kind: "idle", requested: true } })
                  }
                >
                  Pedir el mapa al operador
                </Button>
              ) : null}
            </div>
            {locked ? (
              <p className={styles.reason}>
                Bloqueado mientras hay una comparación. Use «Cambiar la
                comparación» para modificarlo.
              </p>
            ) : null}
          </section>

          {/* Step 2: the farm's own flight */}
          <section
            className={`${styles.step} ${locked ? styles.stepLocked : ""}`}
            aria-labelledby="step-flight"
          >
            <h2 id="step-flight" className={styles.stepTitle}>
              2. Su vuelo para comprobar los lotes
            </h2>
            <fieldset
              style={{ border: 0, padding: 0, margin: 0 }}
              disabled={locked}
            >
              <legend className={styles.srOnly}>Elija uno de sus vuelos</legend>
              <div className={styles.stack}>
                {OWN_FLIGHTS.map((item) => (
                  <label
                    key={item.id}
                    className={`${styles.radio} ${
                      locked
                        ? styles.radioOff
                        : session.flightId === item.id
                          ? styles.radioOn
                          : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="own-flight"
                      checked={session.flightId === item.id}
                      onChange={() =>
                        onChange({
                          flightId: item.id,
                          compare: { kind: "idle" },
                        })
                      }
                    />
                    <span>
                      {shortDate(item.date).replace(/ \d{4}$/, "")} ·{" "}
                      {item.photos} fotos · {lotsPhrase(item.lotIds)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </section>

          {/* Compare */}
          <div className={styles.stack}>
            {compare.kind === "error" ? (
              <StateBox
                tone="error"
                title={flightProblemText(compare.problem, labor).what}
                autoFocus
                actions={
                  <Button
                    onClick={() => onChange({ compare: { kind: "idle" } })}
                  >
                    Elegir otro vuelo
                  </Button>
                }
              >
                <ErrorText
                  why={flightProblemText(compare.problem, labor).why}
                  todo={flightProblemText(compare.problem, labor).todo}
                />
              </StateBox>
            ) : null}
            {compare.kind === "done" ? (
              <Button
                onClick={() =>
                  onChange({
                    compare: { kind: "idle" },
                    accept: { kind: "idle" },
                  })
                }
              >
                Cambiar la comparación
              </Button>
            ) : (
              <ButtonWithReason
                id="compare"
                variant="primary"
                loading={compare.kind === "loading"}
                reason={compareReason}
                onClick={startCompare}
              >
                {compare.kind === "loading" ? "Comparando…" : "Comparar"}
              </ButtonWithReason>
            )}
          </div>
        </div>

        {/* Right column: figures, verdict and actions */}
        <div className={styles.stack} aria-live="polite">
          <div className={styles.cards}>
            <div className={styles.card}>
              <span className={styles.cardLabel}>Cobrado</span>
              <span className={styles.cardValue}>
                {hectares(labor.billedHa ?? 0)}
              </span>
              <span className={styles.cardSub}>{pesos(billedTotal)}</span>
              <span className={styles.cardSource}>
                Factura {labor.invoiceNo ?? "sin número"} de {labor.doneBy}
              </span>
            </div>
            <div
              className={`${styles.card} ${verification ? styles.cardOn : ""}`}
            >
              <span className={styles.cardLabel}>Aplicado</span>
              <span className={styles.cardValue}>
                {map.kind === "ready" ? hectares(map.reading.appliedHa) : "—"}
              </span>
              <span className={styles.cardSub}>
                {verification
                  ? pesos(verification.appliedTotal)
                  : map.kind === "ready"
                    ? "Falta comparar"
                    : "Sin leer"}
              </span>
              <span className={styles.cardSource}>
                {map.kind === "ready"
                  ? `Según el mapa ${map.reading.fileName}`
                  : "Según el mapa del operador"}
              </span>
            </div>
            <div className={styles.card}>
              <span className={styles.cardLabel}>
                {lotsPhrase(labor.lotIds).replace(/^l/, "L")}
              </span>
              <span className={styles.cardValue}>
                {verification ? hectares(verification.check.orderedHa) : "—"}
              </span>
              <span className={styles.cardSub}>Pedido</span>
              <span className={styles.cardSource}>
                {flight && verification
                  ? `Medido en su vuelo del ${shortDate(flight.date)}`
                  : "Medido en su vuelo"}
              </span>
            </div>
          </div>

          {compare.kind === "loading" ? (
            <StateBox
              tone="loading"
              title="Comparando lo cobrado con lo aplicado…"
            />
          ) : verification ? (
            <VerdictBox verification={verification} />
          ) : (
            <StateBox tone="info" title="Todavía no hay una comparación.">
              <p>
                {map.kind === "ready"
                  ? "Elija uno de sus vuelos y pulse «Comparar». Aquí aparecerá si lo cobrado coincide con lo aplicado."
                  : "Lea el mapa del operador, elija uno de sus vuelos y pulse «Comparar». Aquí aparecerá si lo cobrado coincide con lo aplicado."}
              </p>
            </StateBox>
          )}

          {accept.kind === "error" ? (
            <StateBox
              tone="error"
              title="No se pudo registrar que aceptó el cobro."
              autoFocus
              actions={
                <>
                  <Button variant="primary" onClick={confirmAccept}>
                    Reintentar
                  </Button>
                  <Button
                    onClick={() => onChange({ accept: { kind: "idle" } })}
                  >
                    Cerrar
                  </Button>
                </>
              }
            >
              <ErrorText
                why="La simulación falló al guardar, y su cobro sigue sin aceptar."
                todo="Reintente, o cierre este aviso y decida más tarde: no se cambió nada."
              />
            </StateBox>
          ) : null}

          <div className={styles.actions}>
            <ButtonWithReason
              id="send"
              variant={
                verification?.primary === "send" ? "primary" : "secondary"
              }
              reason={
                !verification
                  ? "Compare primero para ver qué enviar."
                  : verification.noCharge
                    ? "No hay diferencia que reclamar: la factura está en $0."
                    : undefined
              }
              onClick={() => verification && onShare(verification)}
            >
              Enviar evidencia al operador
            </ButtonWithReason>
            <ButtonWithReason
              id="accept"
              variant={
                verification?.primary === "accept" ? "primary" : "secondary"
              }
              loading={accept.kind === "loading"}
              reason={
                !verification
                  ? "Compare primero para poder decidir."
                  : verification.noCharge
                    ? "No hay cobro que aceptar: la factura está en $0."
                    : undefined
              }
              onClick={() => onChange({ accept: { kind: "asking" } })}
            >
              {accept.kind === "loading" ? "Registrando…" : "Aceptar el cobro"}
            </ButtonWithReason>
          </div>

          {labor.operatorNote ? (
            <details className={styles.note}>
              <summary className={styles.noteLabel}>
                Nota del operador en la factura ({labor.operatorNote.length}{" "}
                caracteres)
              </summary>
              <p style={{ maxWidth: "none", marginTop: 8 }}>
                {labor.operatorNote}
              </p>
            </details>
          ) : null}

          <Placeholder
            label={`Mapa de aplicación del operador sobre los ${lotsPhrase(labor.lotIds)}`}
            ratio="16 / 9"
          />
        </div>
      </div>

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-labelledby="accept-title"
        onClose={() =>
          accept.kind === "asking" && onChange({ accept: { kind: "idle" } })
        }
      >
        <h2 id="accept-title" className={styles.dialogTitle}>
          ¿Aceptar el cobro de {pesos(billedTotal)}?
        </h2>
        <p>
          La labor queda como pagable y no se puede reabrir desde aquí.
          {verification?.primary === "send"
            ? ` Todavía hay una diferencia de ${hectares(Math.abs(verification.value?.differenceHa ?? 0))} sin aclarar con el operador.`
            : ""}
        </p>
        <div className={styles.actions} style={{ marginTop: 16 }}>
          <Button
            autoFocus
            variant="primary"
            onClick={() => onChange({ accept: { kind: "idle" } })}
          >
            Cancelar
          </Button>
          <Button onClick={confirmAccept}>Sí, aceptar el cobro</Button>
        </div>
      </dialog>
    </>
  );
}

function VerdictBox({ verification }: { verification: Verification }) {
  const { check, value } = verification;
  const gap = value?.differenceHa;
  const pct = check.billedVsCoveredPct;
  const title = verification.noCharge
    ? "El operador no cobró esta labor ($0)"
    : check.state === "match"
      ? "Coincide"
      : gap !== undefined && value
        ? `Diferencia: ${hectares(Math.abs(Math.round(gap * 10) / 10))} (${pesos(Math.abs(value.differenceCop))})`
        : "No se puede calcular la diferencia en pesos";
  return (
    <section className={styles.verdict} aria-labelledby="verdict-title">
      <h2 id="verdict-title" className={styles.verdictTitle}>
        {title}
      </h2>
      <p>
        {verification.headline}
        {pct !== undefined && check.state !== "match" && !verification.noCharge
          ? ` (${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1, signDisplay: "exceptZero" }).format(pct)} % frente a lo aplicado)`
          : ""}
      </p>
      <p className={styles.reason}>{verification.toleranceNote}</p>
    </section>
  );
}
