"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock, MessageCircle } from "lucide-react";
import { entryLabel, sectorChoices } from "@/features/entry/entry";
import { useEntry } from "@/features/entry/entry-store";
import styles from "./landing.module.css";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
/** Placeholders until the team has a calendar page and a WhatsApp number. */
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
/** Unset channels are shown as pending while developing and hidden in production. */
const SHOW_PENDING = process.env.NODE_ENV !== "production";

const LOCAL_KEY = "otear.leads";

type Step = "contact" | "next" | "done";
type Status =
  { kind: "idle" } | { kind: "sending" } | { kind: "err"; message: string };

type LeadRecord = {
  name: string;
  email: string;
  sector: string;
  company: string;
  role: string;
  whatsapp: string;
  message: string;
  savedAt: string;
};

function saveLocal(lead: LeadRecord) {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const list: LeadRecord[] = raw ? JSON.parse(raw) : [];
    // The second step completes the record that the first one created.
    const index = list.findIndex((item) => item.email === lead.email);
    if (index >= 0) list[index] = { ...list[index], ...lead };
    else list.push(lead);
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / private-mode failures
  }
}

/** Sends to Web3Forms when configured; otherwise (or on failure) keeps it in this browser. */
async function submitLead(lead: LeadRecord, stage: "contacto" | "detalles") {
  if (WEB3FORMS_KEY) {
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Interés en Otear (${stage}) — ${lead.company || lead.name}`,
          from_name: "Landing Otear",
          ...lead,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { sent: true };
    } catch {
      // fall through to local save so nothing se pierda
    }
  }
  saveLocal(lead);
  return { sent: false };
}

function field(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

export function LeadForm() {
  const entry = useEntry();
  const [step, setStep] = useState<Step>("contact");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [typedSector, setTypedSector] = useState<string | null>(null);
  const [sentOnline, setSentOnline] = useState(true);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sector = typedSector ?? entryLabel(entry);
  const isSending = status.kind === "sending";

  useEffect(() => {
    if (step !== "contact") headingRef.current?.focus();
  }, [step]);

  async function handleContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: LeadRecord = {
      name: field(data, "name"),
      email: field(data, "email"),
      sector: field(data, "sector"),
      company: "",
      role: "",
      whatsapp: "",
      message: "",
      savedAt: new Date().toISOString(),
    };

    if (!next.name || !next.email) {
      setStatus({
        kind: "err",
        message: "Nombre y correo son obligatorios para contactarle.",
      });
      return;
    }

    setStatus({ kind: "sending" });
    const { sent } = await submitLead(next, "contacto");
    setLead(next);
    setSentOnline(sent);
    setStatus({ kind: "idle" });
    setStep("next");
  }

  async function handleDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead) return;
    const data = new FormData(event.currentTarget);
    const full: LeadRecord = {
      ...lead,
      company: field(data, "company"),
      role: field(data, "role"),
      whatsapp: field(data, "whatsapp"),
      message: field(data, "message"),
    };
    setStatus({ kind: "sending" });
    const { sent } = await submitLead(full, "detalles");
    setLead(full);
    setSentOnline(sent);
    setStatus({ kind: "idle" });
    setStep("done");
  }

  const progress = (
    <div className={styles.steps} aria-hidden>
      <span className={styles.stepsBar} data-on />
      <span
        className={styles.stepsBar}
        data-on={step !== "contact" || undefined}
      />
    </div>
  );

  if (step === "contact") {
    return (
      <form
        className={styles.form}
        onSubmit={handleContact}
        aria-labelledby="contacto-title"
      >
        {progress}
        <p className={styles.stepLabel}>Paso 1 de 2 · Unos segundos</p>

        <div className={styles.formRow}>
          <label htmlFor="lead-name">Nombre</label>
          <input
            id="lead-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Hernando Álvarez"
          />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="lead-email">Correo</label>
          <input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="nombre@empresa.co"
          />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="lead-sector">Sector u operación</label>
          <input
            id="lead-sector"
            name="sector"
            type="text"
            list="lead-sector-options"
            value={sector}
            onChange={(event) => setTypedSector(event.target.value)}
            placeholder="Ej.: finca, vía, obra, minería, forestal, puertos…"
          />
          <datalist id="lead-sector-options">
            {sectorChoices
              .filter((item) => item.id !== "other")
              .map((item) => (
                <option key={item.id} value={item.label} />
              ))}
          </datalist>
        </div>

        <button
          type="submit"
          className={`${styles.linkBtn} ${styles.primary} ${styles.submit}`}
          disabled={isSending}
        >
          {isSending ? "Enviando…" : "Quiero una llamada"}
        </button>

        {status.kind === "err" && (
          <div
            className={`${styles.formResult} ${styles.formResultErr}`}
            role="alert"
          >
            {status.message}
          </div>
        )}

        <p className={styles.formNotice}>
          Después podrá elegir una hora o escribirnos por WhatsApp. Sus datos se
          usan únicamente para contactarle sobre Otear; no se comparten con
          terceros ni se usan para publicidad.
        </p>
      </form>
    );
  }

  const firstName = lead?.name.split(" ")[0] ?? "";
  const whatsappHref = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola, vi Otear${lead?.sector ? ` y opero en ${lead.sector}` : ""}. Quisiera conversar.`,
      )}`
    : null;

  if (step === "done") {
    return (
      <div className={styles.form}>
        {progress}
        <h4 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
          Gracias, {firstName}. Quedó todo.
        </h4>
        <div
          className={`${styles.formResult} ${styles.formResultOk}`}
          role="status"
        >
          {sentOnline
            ? "Recibimos sus datos y le escribiremos en el día."
            : "Guardado solo en este navegador (demo). Configure Web3Forms para recibir los correos."}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      {progress}
      <p className={styles.stepLabel}>Paso 2 de 2 · Opcional</p>
      <h4 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
        Listo, {firstName}. Ya recibimos su contacto.
      </h4>
      <p className={styles.formNotice}>
        {sentOnline
          ? "Le escribiremos en el día. Si quiere ir más rápido, elija cómo seguir:"
          : "Guardado solo en este navegador (demo). Si quiere ir más rápido, elija cómo seguir:"}
      </p>

      <div className={styles.channels}>
        {BOOKING_URL ? (
          <a
            className={styles.channel}
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalendarClock size={18} aria-hidden />
            <span>
              <strong>Elegir una hora</strong>
              <small>30 minutos, sin costo</small>
            </span>
          </a>
        ) : (
          SHOW_PENDING && (
            <div className={`${styles.channel} ${styles.channelPending}`}>
              <CalendarClock size={18} aria-hidden />
              <span>
                <strong>Elegir una hora</strong>
                <small>Pendiente: defina NEXT_PUBLIC_BOOKING_URL</small>
              </span>
            </div>
          )
        )}
        {whatsappHref ? (
          <a
            className={styles.channel}
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden />
            <span>
              <strong>Escribir por WhatsApp</strong>
              <small>Respuesta directa del equipo</small>
            </span>
          </a>
        ) : (
          SHOW_PENDING && (
            <div className={`${styles.channel} ${styles.channelPending}`}>
              <MessageCircle size={18} aria-hidden />
              <span>
                <strong>Escribir por WhatsApp</strong>
                <small>Pendiente: defina NEXT_PUBLIC_WHATSAPP_NUMBER</small>
              </span>
            </div>
          )
        )}
      </div>

      <details className={styles.details}>
        <summary>Dejar más detalles (opcional)</summary>
        <form className={styles.detailsForm} onSubmit={handleDetails}>
          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <label htmlFor="lead-company">Empresa u organización</label>
              <input
                id="lead-company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder="Nombre de su empresa"
              />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="lead-role">Cargo</label>
              <select id="lead-role" name="role" defaultValue="">
                <option value="" disabled>
                  Seleccione
                </option>
                <option>Gerente / dueño</option>
                <option>
                  Jefe de operación (campo, vía, obra, vigilancia u otro)
                </option>
                <option>Interventoría / supervisión</option>
                <option>Operador de dron</option>
                <option>Auditoría / certificación</option>
                <option>Otro</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <label htmlFor="lead-whatsapp">WhatsApp (opcional)</label>
            <input
              id="lead-whatsapp"
              name="whatsapp"
              type="tel"
              autoComplete="tel"
              placeholder="+57 300 000 0000"
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="lead-message">¿Qué le gustaría resolver?</label>
            <textarea
              id="lead-message"
              name="message"
              placeholder="Ej.: Quiero comparar mes a mes el avance de mi obra, mi vía o mis lotes, o llevar un control propio de mi sector."
            />
          </div>
          <button
            type="submit"
            className={`${styles.linkBtn} ${styles.primary} ${styles.submit}`}
            disabled={isSending}
          >
            {isSending ? "Enviando…" : "Enviar detalles"}
          </button>
        </form>
      </details>
    </div>
  );
}
