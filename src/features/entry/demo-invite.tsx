"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import { WELCOME_NOTICE } from "./demo-entry";
import { useEntry } from "./entry-store";
import styles from "./demo-invite.module.css";

const SESSION_KEY = "otear.invite";
/** The invite waits until the visitor has had time to look around. */
const MIN_TIME_MS = 45_000;
const MIN_SCREENS = 3;

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
 * A quiet, dismissible card offered once per visit, after the visitor has
 * explored (three screens, or one action) for a while. It never takes focus
 * and never blocks the screen.
 */
export function DemoInvite() {
  const pathname = usePathname();
  const { notice, site } = useDemo();
  const entry = useEntry();
  const [visible, setVisible] = useState(false);
  const startedAt = useRef<number | null>(null);
  const screens = useRef(new Set<string>());
  const acted = useRef(false);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    if (startedAt.current === null) {
      startedAt.current = Date.now();
      handled.current = alreadyHandled();
      if (handled.current) return;
    }
    screens.current.add(pathname);
    if (notice && !notice.startsWith(WELCOME_NOTICE)) acted.current = true;

    const engaged = screens.current.size >= MIN_SCREENS || acted.current;
    if (!engaged) return;
    const wait = Math.max(1500, MIN_TIME_MS - (Date.now() - startedAt.current));
    const timer = window.setTimeout(() => {
      handled.current = true;
      markHandled();
      setVisible(true);
    }, wait);
    return () => window.clearTimeout(timer);
  }, [pathname, notice]);

  function close() {
    setVisible(false);
  }

  if (!visible) return null;

  const mine =
    entry?.choice === "other" && entry.other
      ? `su operación de ${entry.other}`
      : `sus ${site.zoneLabel.toLowerCase()}`;

  return (
    <aside
      className={`${styles.invite} ${notice ? styles.aboveNotice : ""}`}
      aria-label="Invitación a conversar"
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
        ¿Esto, con <span className="accent">sus datos</span>?
      </h2>
      <p className={styles.text}>
        Lo que probó usa datos de ejemplo. Si quiere verlo con {mine}, nos
        sentamos 30 minutos y se lo mostramos.
      </p>
      <div className={styles.actions}>
        <Link href="/#contacto" className={styles.primary} onClick={close}>
          Quiero verlo con mis datos <ArrowRight size={14} aria-hidden />
        </Link>
        <button type="button" className={styles.later} onClick={close}>
          Ahora no
        </button>
      </div>
    </aside>
  );
}
