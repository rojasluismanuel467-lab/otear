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

/** Alert kinds: the same five as the `Alert/*` components of the UI Kit page in Figma. */
export type AlertKind = "info" | "loading" | "success" | "warning" | "error";

const kindClass: Record<AlertKind, string> = {
  info: styles.alertInfo,
  loading: styles.alertLoading,
  success: styles.alertSuccess,
  warning: styles.alertWarning,
  error: styles.alertError,
};
/** The word that tells the state apart, so colour is never the only cue (WCAG 1.4.1). */
export const kindLabel: Record<AlertKind, string> = {
  info: "Aviso",
  loading: "Cargando",
  success: "Listo",
  warning: "Atención",
  error: "Error",
};
const kindName: Record<AlertKind, string> = {
  info: "Alert/Info",
  loading: "Alert/Loading",
  success: "Alert/Success",
  warning: "Alert/Warning",
  error: "Alert/Error",
};

/** The indicator of a state in progress. It turns; with reduced motion it stays still and the word says it. */
export function Spinner() {
  return <span className={styles.spinner} aria-hidden="true" />;
}

/** A state resolved inside the screen: told apart by its word and its border, never by colour alone. */
export function Alert({
  kind,
  title,
  children,
  actions,
  autoFocus,
}: {
  kind: AlertKind;
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
      role={kind === "error" ? "alert" : "status"}
      aria-busy={kind === "loading" || undefined}
      data-ds={kindName[kind]}
      className={`${styles.alert} ${kindClass[kind]}`}
    >
      <span className={styles.alertLabel}>
        {kind === "loading" ? <Spinner /> : null}
        {kindLabel[kind]}
      </span>
      <p className={styles.alertTitle}>{title}</p>
      {children}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}

/** The state of a labor in the list: the `Badge/Status/*` components of the UI Kit. */
export function Badge({
  kind,
  children,
}: {
  kind: "default" | "success" | "warning" | "error";
  children: ReactNode;
}) {
  const names = {
    default: ["Badge/Status/Default", styles.badgeDefault],
    success: ["Badge/Status/Success", styles.badgeSuccess],
    warning: ["Badge/Status/Warning", styles.badgeWarning],
    error: ["Badge/Status/Error", styles.badgeError],
  } as const;
  const [name, className] = names[kind];
  return (
    <span data-ds={name} className={`${styles.badge} ${className}`}>
      {children}
    </span>
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
      data-ds={`Button/${variant === "primary" ? "Primary" : variant === "link" ? "Link" : "Secondary"}`}
      className={`${styles.btn} ${variantClass} ${className ?? ""}`}
    >
      {loading ? <Spinner /> : null}
      {rest.children}
    </button>
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
