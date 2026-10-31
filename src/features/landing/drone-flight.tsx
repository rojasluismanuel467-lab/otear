"use client";

import { useEffect, useRef, useState } from "react";
import { whenIdle } from "@/lib/idle";
import styles from "./drone-flight.module.css";

/**
 * The landing's aircraft: arrives flying, circles over the hero and follows the page
 * as it scrolls. three.js loads in its own chunk, once the page is idle, so the page does not wait for it.
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
    // The text and the first screen come first: the three.js chunk and its shaders
    // wait for an idle moment (at most 1.5 s), so the headline is not held back.
    const cancelIdle = whenIdle(() => {
      import("./flight-scene").then(({ mountFlight }) => {
        if (cancelled) return;
        unmount = mountFlight(host, { onReady: () => setReady(true) });
      });
    }, 1500);
    return () => {
      cancelled = true;
      cancelIdle();
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
