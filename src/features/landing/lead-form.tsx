"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarClock, Mail, MessageCircle } from "lucide-react";
import { entryLabel, sectorChoices } from "@/features/entry/entry";
import { useEntry } from "@/features/entry/entry-store";
import { mailtoHref, whatsappHref, type Lead } from "./lead-message";
import styles from "./landing.module.css";

/**
 * There is no server: the site never receives what is typed here. The second
 * step builds a message and the visitor sends it from their own WhatsApp or mail.
 */
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
/** Unset channels are shown as pending while developing and hidden in production. */
const SHOW_PENDING = process.env.NODE_ENV !== "production";

type Step = "contact" | "send";

function field(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

export function LeadForm() {
  const entry = useEntry();
  const [step, setStep] = useState<Step>("contact");
  const [error, setError] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [detailsAdded, setDetailsAdded] = useState(false);
  const [typedSector, setTypedSector] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sector = typedSector ?? entryLabel(entry);

  useEffect(() => {
    if (step === "send") headingRef.current?.focus();
  }, [step]);

  function handleContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Lead = {
      name: field(data, "name"),
      email: field(data, "email"),
      sector: field(data, "sector"),
      company: lead?.company ?? "",
      role: lead?.role ?? "",
      whatsapp: lead?.whatsapp ?? "",
      message: lead?.message ?? "",
    };

    if (!next.name || !next.email) {
      setError("Nombre y correo son obligatorios para contactarle.");
      return;
    }

    setError(null);
    setLead(next);
    setStep("send");
  }

  function handleDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lead) return;
    const data = new FormData(event.currentTarget);
    setLead({
      ...lead,
      company: field(data, "company"),
      role: field(data, "role"),
      whatsapp: field(data, "whatsapp"),
      message: field(data, "message"),
    });
    setDetailsAdded(true);
  }

  const progress = (
    <div className={styles.steps} aria-hidden>
      <span className={styles.stepsBar} data-on />
      <span
        className={styles.stepsBar}
        data-on={step === "send" || undefined}
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
            defaultValue={lead?.name}
            placeholder="Nombre y apellido"
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
            defaultValue={lead?.email}
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

        <p className={styles.formNotice}>
          Este paso no envía nada. En el siguiente se abre su WhatsApp o su
          correo con el mensaje ya escrito, y usted lo envía. Esta página no
          guarda ni recibe sus datos.
        </p>

        <button
          type="submit"
          className={`${styles.linkBtn} ${styles.primary} ${styles.submit}`}
        >
          Continuar: preparar mi mensaje
        </button>

        {error && (
          <div
            className={`${styles.formResult} ${styles.formResultErr}`}
            role="alert"
          >
            {error}
          </div>
        )}
      </form>
    );
  }

  const current: Lead = lead ?? {
    name: "",
    email: "",
    sector: "",
    company: "",
    role: "",
    whatsapp: "",
    message: "",
  };
  const firstName = current.name.split(" ")[0] ?? "";
  const whatsapp = whatsappHref(WHATSAPP_NUMBER, current);
  const mail = mailtoHref(CONTACT_EMAIL, current);
  const hasChannel = Boolean(whatsapp || mail || BOOKING_URL);

  return (
    <div className={styles.form}>
      {progress}
      <p className={styles.stepLabel}>Paso 2 de 2 · Falta enviarlo</p>
      <h4 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
        Listo, {firstName}. Elija cómo enviarnos su mensaje.
      </h4>
      <p className={styles.formNotice}>
        Se abre su WhatsApp o su correo con el mensaje ya escrito. Revíselo y
        pulse enviar: hasta entonces no hemos recibido nada.
      </p>

      <div className={styles.channels}>
        {whatsapp ? (
          <a
            className={styles.channel}
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden />
            <span>
              <strong>Enviar por WhatsApp</strong>
              <small>Respuesta directa del equipo</small>
            </span>
          </a>
        ) : (
          SHOW_PENDING && (
            <div className={`${styles.channel} ${styles.channelPending}`}>
              <MessageCircle size={18} aria-hidden />
              <span>
                <strong>Enviar por WhatsApp</strong>
                <small>Pendiente: defina NEXT_PUBLIC_WHATSAPP_NUMBER</small>
              </span>
            </div>
          )
        )}
        {mail ? (
          <a className={styles.channel} href={mail}>
            <Mail size={18} aria-hidden />
            <span>
              <strong>Enviar por correo</strong>
              <small>Se abre su programa de correo</small>
            </span>
          </a>
        ) : (
          SHOW_PENDING && (
            <div className={`${styles.channel} ${styles.channelPending}`}>
              <Mail size={18} aria-hidden />
              <span>
                <strong>Enviar por correo</strong>
                <small>Pendiente: defina NEXT_PUBLIC_CONTACT_EMAIL</small>
              </span>
            </div>
          )
        )}
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
      </div>

      {!hasChannel && !SHOW_PENDING && (
        <div
          className={`${styles.formResult} ${styles.formResultErr}`}
          role="alert"
        >
          Todavía no hay un canal de contacto disponible en esta página.
          Escríbanos a <a href="mailto:hola@otear.app">hola@otear.app</a>.
        </div>
      )}

      <details className={styles.details}>
        <summary>Agregar detalles al mensaje (opcional)</summary>
        <form className={styles.detailsForm} onSubmit={handleDetails}>
          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <label htmlFor="lead-company">Empresa u organización</label>
              <input
                id="lead-company"
                name="company"
                type="text"
                autoComplete="organization"
                defaultValue={current.company}
                placeholder="Nombre de su empresa"
              />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="lead-role">Cargo</label>
              <select id="lead-role" name="role" defaultValue={current.role}>
                <option value="">Seleccione</option>
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
              defaultValue={current.whatsapp}
              placeholder="+57 300 000 0000"
            />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="lead-message">¿Qué le gustaría resolver?</label>
            <textarea
              id="lead-message"
              name="message"
              defaultValue={current.message}
              placeholder="Ej.: Quiero comparar mes a mes el avance de mi obra, mi vía o mis lotes, o llevar un control propio de mi sector."
            />
          </div>
          <button
            type="submit"
            className={`${styles.linkBtn} ${styles.primary} ${styles.submit}`}
          >
            Agregar al mensaje
          </button>
          {detailsAdded && (
            <div
              className={`${styles.formResult} ${styles.formResultOk}`}
              role="status"
            >
              Detalles agregados. Los botones de arriba ya los incluyen.
            </div>
          )}
        </form>
      </details>

      <button
        type="button"
        className={`${styles.linkBtn} ${styles.ghost}`}
        onClick={() => {
          setDetailsAdded(false);
          setStep("contact");
        }}
      >
        Corregir mis datos
      </button>
    </div>
  );
}
