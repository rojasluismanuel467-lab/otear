"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { whenIdle } from "@/lib/idle";
import { DemoLink } from "./demo-link";
import styles from "@/features/entry/demo-invite.module.css";

const SESSION_KEY = "otear.landing-invite";
/** The invitation waits until the visitor has looked at the first screen. */
const MIN_TIME_MS = 25_000;

function alreadyHandled() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

function markHandled() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Without storage it may appear again after a reload; that is acceptable.
  }
}

/**
 * A quiet, dismissible card that invites the visitor straight into the demo, once per visit,
 * after some seconds or once they scroll past the first screen (so it never covers the first screen's buttons). It never takes focus, never
 * blocks the page and says what the demo is (example data, no sign-up).
 */
export function LandingInvite() {
  const [visible, setVisible] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    if (alreadyHandled()) return;
    const show = () => {
      if (shown.current) return;
      shown.current = true;
      markHandled();
      setVisible(true);
    };
    const timer = window.setTimeout(() => whenIdle(show, 1000), MIN_TIME_MS);
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.9) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!visible) return null;
  const close = () => setVisible(false);

  return (
    <aside
      className={styles.invite}
      aria-label="Invitación a la demo"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <button
        type="button"
        className={styles.close}
        onClick={close}
        aria-label="Cerrar invitación"
      >
        <X size={16} aria-hidden />
      </button>
      <h2 className={styles.title}>
        Pruébelo <span className="accent">usted mismo</span>
      </h2>
      <p className={styles.text}>
        La demo usa datos de ejemplo: nada de lo que vea es real. Sin registro y
        sin instalar nada.
      </p>
      <div className={styles.actions}>
        <DemoLink className={styles.primary} onClick={close}>
          Abrir la demo <ArrowRight size={14} aria-hidden />
        </DemoLink>
        <button type="button" className={styles.later} onClick={close}>
          Ahora no
        </button>
      </div>
    </aside>
  );
}
