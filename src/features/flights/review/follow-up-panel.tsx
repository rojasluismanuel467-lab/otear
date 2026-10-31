"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { Check, ClipboardCheck, RotateCcw, UserRound, X } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import type { Finding } from "@/features/demo/types";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  FOLLOW_UP_TODAY,
  changeTerms,
  closeFollowUp,
  dayText,
  discardFollowUp,
  discardNote,
  dueText,
  followUpBadge,
  isDiscardedMeasure,
  openFollowUp,
  reopenFollowUp,
  startCorrection,
  statusLabel,
  whyNoFollowUp,
  type FollowUpResult,
} from "../follow-up";
import { agree } from "../finding-words";
import { useFindingWords } from "../use-finding-words";
import styles from "./follow-up.module.css";

/** What the person is filling in, if anything: one form at a time. */
type Form = "none" | "open" | "close" | "reopen" | "terms" | "discard";

/** «Próximo paso» of a finding: the corrective measure, from naming who answers for it to closing it. */
export function FollowUpPanel({ finding }: { finding: Finding }) {
  const words = useFindingWords();
  const { changeFollowUp, updateFinding, setNotice } = useDemo();
  const followUp = finding.followUp;
  const blocked = whyNoFollowUp(finding);
  const [form, setForm] = useState<Form>("none");
  const [owner, setOwner] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function show(next: Form) {
    setForm(next);
    setError("");
    setNote("");
    setOwner(next === "terms" && followUp ? followUp.owner : "");
    setDueDate(next === "terms" && followUp ? followUp.dueDate : "");
  }

  /** Runs one change; on success it says what happened and what did not (nobody is notified). */
  function apply(
    change: (current: Finding) => FollowUpResult,
    message: string,
  ) {
    const result = changeFollowUp(finding.id, change);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm("none");
    setError("");
    setNotice(
      `${message} No se avisó a nadie: el registro solo existe en esta demo.`,
    );
  }

  const badge = followUp ? followUpBadge(followUp, FOLLOW_UP_TODAY) : null;
  // A discarded finding keeps its measure written down but no longer moves it forward.
  const dropped = followUp !== undefined && blocked !== null;
  const active =
    followUp !== undefined && followUp.status !== "closed" && !dropped;
  const droppedNote =
    dropped && isDiscardedMeasure(finding) ? discardNote(followUp) : null;

  return (
    <div className={styles.panel}>
      <h4>Medida correctiva</h4>
      {!followUp && blocked && <p className={styles.hint}>{blocked}</p>}
      {!followUp && !blocked && form !== "open" && (
        <>
          <p className={styles.hint}>
            Nombre quién responde por corregir {agree(words, "este", "esta")}{" "}
            {words.singular} y para cuándo. Se cierra solo con una nota de qué
            se hizo y con qué evidencia. Nada se envía ni se notifica: queda
            anotado en esta demostración.
          </p>
          <Button variant="outline" onPress={() => show("open")}>
            <ClipboardCheck size={16} aria-hidden="true" />
            Asignar responsable y plazo
          </Button>
        </>
      )}
      {!followUp && !blocked && form === "open" && (
        <form
          className={styles.form}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            apply(
              (current) => openFollowUp(current, { owner, dueDate }),
              "Medida abierta.",
            );
          }}
        >
          <OwnerAndDue
            owner={owner}
            dueDate={dueDate}
            onOwner={setOwner}
            onDueDate={setDueDate}
            autoFocus
          />
          <FormError message={error} />
          <FormActions submit="Abrir la medida" onCancel={() => show("none")} />
        </form>
      )}

      {followUp && badge && (
        <>
          {dropped && (
            <p className={styles.hint}>
              {words.Singular} {agree(words, "descartado", "descartada")}
              {isDiscardedMeasure(finding)
                ? ": la medida quedó descartada sin cerrar. Se cuenta aparte en los resúmenes y ya no se puede avanzar. Si devuelve " +
                  `${agree(words, "este", "esta")} ${words.singular} a pendiente, la medida vuelve a seguirse.`
                : ": su medida estaba cerrada y queda anotada."}
            </p>
          )}
          <div className={styles.status}>
            {dropped && isDiscardedMeasure(finding) ? (
              <>
                <StatusBadge tone="neutral">Descartada sin cerrar</StatusBadge>
                <span className={styles.due}>
                  Estaba {statusLabel(followUp.status).toLowerCase()} · plazo{" "}
                  {dayText(followUp.dueDate)}
                </span>
              </>
            ) : (
              <>
                <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
                <span className={styles.due}>
                  {badge.label === "Vencida"
                    ? `${statusLabel(followUp.status)} · ${dueText(followUp, FOLLOW_UP_TODAY)}`
                    : dueText(followUp, FOLLOW_UP_TODAY)}
                </span>
              </>
            )}
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>
                <UserRound size={14} aria-hidden="true" /> Responsable (quien lo
                corrige)
              </dt>
              <dd>{followUp.owner}</dd>
            </div>
            <div>
              <dt>Plazo</dt>
              <dd>{dayText(followUp.dueDate)}</dd>
            </div>
            {droppedNote && (
              <div className={styles.discardNote}>
                <dt>Motivo del descarte · {dayText(droppedNote.at)}</dt>
                <dd>{droppedNote.reason}</dd>
              </div>
            )}
            {followUp.status === "closed" && followUp.closure && (
              <div className={styles.closure}>
                <dt>
                  Cierre
                  {followUp.closedOn ? ` · ${dayText(followUp.closedOn)}` : ""}
                </dt>
                <dd>{followUp.closure}</dd>
              </div>
            )}
          </dl>

          {active && form === "none" && (
            <p className={styles.hint}>
              En la demostración no hay inicio de sesión: el historial anota el
              perfil de la demostración, no a una persona verificada. Quién debe
              cerrar la medida en su empresa lo decide usted.
            </p>
          )}

          {form === "none" && (
            <div className={styles.actions}>
              {active && followUp.status === "open" && (
                <Button
                  variant="secondary"
                  onPress={() =>
                    apply(
                      (current) =>
                        current.followUp
                          ? startCorrection(current.followUp)
                          : { ok: false, error: "No hay medida abierta." },
                      "La medida pasó a «en corrección».",
                    )
                  }
                >
                  Pasar a «en corrección»
                </Button>
              )}
              {active && (
                <Button variant="primary" onPress={() => show("close")}>
                  <Check size={16} aria-hidden="true" />
                  Cerrar con nota
                </Button>
              )}
              {active && (
                <Button variant="tertiary" onPress={() => show("terms")}>
                  Cambiar responsable o plazo
                </Button>
              )}
              {active && (
                <Button variant="tertiary" onPress={() => show("discard")}>
                  <X size={16} aria-hidden="true" />
                  Descartar con motivo
                </Button>
              )}
              {followUp.status === "closed" && !dropped && (
                <Button variant="outline" onPress={() => show("reopen")}>
                  <RotateCcw size={16} aria-hidden="true" />
                  Reabrir
                </Button>
              )}
            </div>
          )}

          {form === "close" && (
            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                apply(
                  (current) =>
                    current.followUp
                      ? closeFollowUp(current.followUp, note)
                      : { ok: false, error: "No hay medida abierta." },
                  "Medida cerrada.",
                );
              }}
            >
              <NoteField
                label="Nota de cierre"
                hint="Qué se hizo y con qué evidencia se comprobó (una foto, un acta, una visita)."
                value={note}
                onChange={setNote}
              />
              <FormError message={error} />
              <FormActions
                submit="Cerrar la medida"
                onCancel={() => show("none")}
              />
            </form>
          )}

          {form === "discard" && (
            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                const result = changeFollowUp(finding.id, (current) =>
                  current.followUp
                    ? discardFollowUp(current.followUp, note)
                    : { ok: false, error: "No hay medida abierta." },
                );
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                updateFinding(finding.id, { status: "dismissed" });
                setForm("none");
                setError("");
                setNotice(
                  `${words.Singular} ${agree(words, "descartado", "descartada")} con motivo. La medida queda anotada como «descartada sin cerrar»; se cuenta aparte, en el tablero de Vuelos y en Evolución. No se avisó a nadie.`,
                );
              }}
            >
              <NoteField
                label="Motivo del descarte"
                hint="Por qué ya no hay nada que corregir. Queda escrito en el historial de la medida."
                value={note}
                onChange={setNote}
              />
              <FormError message={error} />
              <FormActions
                submit="Descartar y anotar el motivo"
                onCancel={() => show("none")}
              />
            </form>
          )}

          {form === "reopen" && (
            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                apply(
                  (current) =>
                    current.followUp
                      ? reopenFollowUp(current.followUp, {
                          reason: note,
                          dueDate,
                        })
                      : { ok: false, error: "No hay medida cerrada." },
                  "Medida reabierta.",
                );
              }}
            >
              <NoteField
                label="Por qué se reabre"
                value={note}
                onChange={setNote}
              />
              <DueField
                value={dueDate}
                onChange={setDueDate}
                label="Nuevo plazo"
              />
              <FormError message={error} />
              <FormActions
                submit="Reabrir la medida"
                onCancel={() => show("none")}
              />
            </form>
          )}

          {form === "terms" && (
            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                apply(
                  (current) =>
                    current.followUp
                      ? changeTerms(current.followUp, { owner, dueDate })
                      : { ok: false, error: "No hay medida abierta." },
                  "Medida actualizada.",
                );
              }}
            >
              <OwnerAndDue
                owner={owner}
                dueDate={dueDate}
                onOwner={setOwner}
                onDueDate={setDueDate}
                autoFocus
              />
              <FormError message={error} />
              <FormActions
                submit="Guardar el cambio"
                onCancel={() => show("none")}
              />
            </form>
          )}

          <details className={styles.history}>
            <summary>
              Historial de la medida ({followUp.history.length})
            </summary>
            <ol>
              {followUp.history.map((entry, index) => (
                <li key={`${entry.at}-${index}`}>
                  <time dateTime={entry.at}>{dayText(entry.at)}</time>
                  <span>
                    {entry.text}
                    {entry.by ? ` · ${entry.by}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          </details>
          <p className={styles.note}>
            Nada se notifica a nadie: la medida y su historial solo existen en
            esta sesión de la demostración.
          </p>
        </>
      )}
    </div>
  );
}

function DueField({
  value,
  onChange,
  label = "Plazo",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <label className="form-field">
      <span className="field-label">{label}</span>
      <input
        className="field-input"
        type="date"
        min={FOLLOW_UP_TODAY}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function OwnerAndDue({
  owner,
  dueDate,
  onOwner,
  onDueDate,
  autoFocus,
}: {
  owner: string;
  dueDate: string;
  onOwner: (value: string) => void;
  onDueDate: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className={styles.fields}>
      <label className="form-field">
        <span className="field-label">Responsable</span>
        <input
          className="field-input"
          type="text"
          value={owner}
          maxLength={80}
          placeholder="Persona o empresa que corrige"
          autoFocus={autoFocus}
          onChange={(event) => onOwner(event.target.value)}
        />
      </label>
      <DueField value={dueDate} onChange={onDueDate} />
    </div>
  );
}

function NoteField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="form-field">
      <span className="field-label">{label}</span>
      {hint && <span className={styles.fieldHint}>{hint}</span>}
      <textarea
        className="field-input"
        rows={3}
        value={value}
        autoFocus
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className={styles.error} role="alert">
      {message}
    </p>
  );
}

function FormActions({
  submit,
  onCancel,
}: {
  submit: string;
  onCancel: () => void;
}) {
  return (
    <div className={styles.actions}>
      <Button type="submit" variant="primary">
        {submit}
      </Button>
      <Button variant="tertiary" onPress={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}
