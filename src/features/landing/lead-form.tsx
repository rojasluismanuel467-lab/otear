"use client";

import { useState } from "react";
import styles from "./landing.module.css";

type FormResult =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const LOCAL_KEY = "otear.leads";

type LeadRecord = {
  name: string;
  company: string;
  role: string;
  email: string;
  whatsapp: string;
  message: string;
  savedAt: string;
};

function saveLocal(lead: LeadRecord) {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const list: LeadRecord[] = raw ? JSON.parse(raw) : [];
    list.push(lead);
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / private-mode failures
  }
}

export function LeadForm() {
  const [result, setResult] = useState<FormResult>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const lead: LeadRecord = {
      name: String(data.get("name") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      role: String(data.get("role") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      whatsapp: String(data.get("whatsapp") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      savedAt: new Date().toISOString(),
    };

    if (!lead.name || !lead.email) {
      setResult({
        kind: "err",
        message: "Nombre y correo son obligatorios para contactarle.",
      });
      return;
    }

    setResult({ kind: "sending" });

    if (WEB3FORMS_KEY) {
      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `Interés en Otear — ${lead.company || lead.name}`,
            from_name: "Landing Otear",
            ...lead,
          }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setResult({
          kind: "ok",
          message: "Gracias. Recibimos sus datos y le escribiremos en el día.",
        });
        form.reset();
        return;
      } catch {
        // fall through to local save so nothing se pierda
      }
    }

    saveLocal(lead);
    setResult({
      kind: "ok",
      message: WEB3FORMS_KEY
        ? "No pudimos enviar al servidor; guardamos sus datos localmente y los recuperamos luego."
        : "Guardado solo en este navegador (demo). Configure Web3Forms para recibir los correos.",
    });
    form.reset();
  }

  const isSending = result.kind === "sending";

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-labelledby="contacto-title"
    >
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

      <div className={styles.formGrid}>
        <div className={styles.formRow}>
          <label htmlFor="lead-company">Empresa o ingenio</label>
          <input
            id="lead-company"
            name="company"
            type="text"
            autoComplete="organization"
            placeholder="Ingenio Santa Rita"
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="lead-role">Cargo</label>
          <select id="lead-role" name="role" defaultValue="">
            <option value="" disabled>
              Seleccione
            </option>
            <option>Gerente / dueño</option>
            <option>Jefe agrícola / de campo</option>
            <option>Operador de dron</option>
            <option>Auditoría / certificación</option>
            <option>Otro</option>
          </select>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formRow}>
          <label htmlFor="lead-email">Correo</label>
          <input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="hernando@ingenio.co"
          />
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
      </div>

      <div className={styles.formRow}>
        <label htmlFor="lead-message">¿Qué le gustaría resolver?</label>
        <textarea
          id="lead-message"
          name="message"
          placeholder="Ej.: Quiero ver cómo le va a tres suertes antes de la próxima cosecha."
        />
      </div>

      <button
        type="submit"
        className={`${styles.linkBtn} ${styles.primary} ${styles.submit}`}
        disabled={isSending}
      >
        {isSending ? "Enviando…" : "Quiero una llamada"}
      </button>

      {result.kind === "ok" && (
        <div
          className={`${styles.formResult} ${styles.formResultOk}`}
          role="status"
        >
          {result.message}
        </div>
      )}
      {result.kind === "err" && (
        <div
          className={`${styles.formResult} ${styles.formResultErr}`}
          role="alert"
        >
          {result.message}
        </div>
      )}

      <p className={styles.formNotice}>
        Sus datos se usan únicamente para contactarle sobre Otear. No se
        comparten con terceros ni se usan para publicidad.
      </p>
    </form>
  );
}
