"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./drone-flight.module.css";

/**
 * The landing's aircraft: arrives flying, circles over the hero and follows the page
 * as it scrolls. three.js loads in its own chunk, so the page does not wait for it.
 * Purely decorative: it takes no clicks and says nothing to assistive technology.
 */
export function DroneFlight() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let unmount = () => {};
    let cancelled = false;
    import("./flight-scene").then(({ mountFlight }) => {
      if (cancelled) return;
      unmount = mountFlight(host, { onReady: () => setReady(true) });
    });
    return () => {
      cancelled = true;
      unmount();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`${styles.layer} ${ready ? styles.ready : ""}`}
      aria-hidden="true"
    />
  );
}
