"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./prototype.module.css";

/** Runs a function after a delay and cancels everything still waiting when the screen goes away. */
export function useLater() {
  const ids = useRef<number[]>([]);
  useEffect(() => {
    const pending = ids.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);
  return useCallback((run: () => void, ms: number) => {
    ids.current.push(window.setTimeout(run, ms));
  }, []);
}

/** How long the example «loading» states stay on screen, so they can be seen and checked. */
export const LOADING_MS = 900;

type Tone = "error" | "loading" | "ok" | "info";

const toneClass: Record<Tone, string> = {
  error: styles.boxError,
  loading: styles.boxLoading,
  ok: styles.boxOk,
  info: styles.boxInfo,
};
const toneLabel: Record<Tone, string> = {
  error: "Error",
  loading: "Cargando",
  ok: "Listo",
  info: "Aviso",
};

/** A state resolved inside the screen: told apart by its border and its label, never by colour. */
export function StateBox({
  tone,
  title,
  children,
  actions,
  autoFocus,
}: {
  tone: Tone;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <div
      ref={ref}
      tabIndex={autoFocus ? -1 : undefined}
      role={tone === "error" ? "alert" : "status"}
      aria-busy={tone === "loading" || undefined}
      className={`${styles.box} ${toneClass[tone]}`}
    >
      <span className={styles.boxLabel}>{toneLabel[tone]}</span>
      <p className={styles.boxTitle}>{title}</p>
      {children}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

/** The three parts every error message has: what happened, why, and what can be done. */
export function ErrorText({ why, todo }: { why: string; todo: string }) {
  return (
    <>
      <p>
        <strong>Por qué pasó:</strong> {why}
      </p>
      <p>
        <strong>Qué puede hacer:</strong> {todo}
      </p>
    </>
  );
}

export function Button({
  variant = "secondary",
  loading,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "link";
  loading?: boolean;
}) {
  const variantClass =
    variant === "primary"
      ? styles.btnPrimary
      : variant === "link"
        ? styles.btnLink
        : "";
  return (
    <button
      type="button"
      {...rest}
      aria-busy={loading || undefined}
      disabled={rest.disabled || loading}
      className={`${styles.btn} ${variantClass} ${className ?? ""}`}
    />
  );
}

/** A button with its reason for being disabled written next to it, as the skill asks (rule 4.6). */
export function ButtonWithReason({
  reason,
  id,
  ...button
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "link";
  loading?: boolean;
  reason?: string;
  id: string;
}) {
  return (
    <div className={styles.actionCol}>
      <Button
        {...button}
        disabled={button.disabled || Boolean(reason)}
        aria-describedby={reason ? `${id}-reason` : undefined}
      />
      {reason ? (
        <p id={`${id}-reason`} className={styles.reason}>
          {reason}
        </p>
      ) : null}
    </div>
  );
}

/** A marker for an image, a map or a chart: an X, the real proportion and a label of what goes there. */
export function Placeholder({
  label,
  ratio,
}: {
  label: string;
  ratio: "16 / 9" | "4 / 3";
}) {
  return (
    <div
      className={styles.placeholder}
      role="img"
      aria-label={label}
      style={{ aspectRatio: ratio }}
    >
      <span>{label}</span>
    </div>
  );
}
