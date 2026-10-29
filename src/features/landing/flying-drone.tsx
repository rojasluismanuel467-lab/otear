"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./flying-drone.module.css";

/**
 * Scroll-driven drone that flies across the landing. Not a 3D canvas — a
 * single SVG anchored to viewport that lerps along a path of keyframes mapped
 * to overall scroll progress. Cheap, works everywhere, respects reduced motion.
 */

type Waypoint = {
  /** scroll progress (0..1) at which the drone sits here */
  at: number;
  /** viewport-relative position (0..1 of width/height) */
  x: number;
  y: number;
  /** optional label shown as a callout while the drone is at this waypoint */
  label?: string;
  /** section theme at this altitude; drives colour and shadow */
  theme?: "light" | "dark";
};

// Hand-tuned path. The drone enters top-right, dives across the hero to the
// right of the headline, climbs over the stepper, loops back for the roles,
// descends toward the demo strip, and lands near the contact form.
const WAYPOINTS: Waypoint[] = [
  { at: 0.0, x: 1.08, y: 0.1, theme: "dark" },
  { at: 0.05, x: 0.72, y: 0.3, theme: "dark", label: "Despega" },
  { at: 0.14, x: 0.58, y: 0.55, theme: "dark", label: "Sobrevuela el cañal" },
  { at: 0.22, x: 0.85, y: 0.5, theme: "dark" },
  { at: 0.32, x: 0.2, y: 0.4, theme: "light", label: "Deja de recibir PDFs" },
  { at: 0.42, x: 0.75, y: 0.6, theme: "light", label: "Verifica hectáreas" },
  { at: 0.5, x: 0.25, y: 0.45, theme: "light", label: "Firma el informe" },
  { at: 0.6, x: 0.6, y: 0.55, theme: "light", label: "Reparte tareas" },
  { at: 0.72, x: 0.85, y: 0.3, theme: "dark", label: "Aterriza" },
  { at: 0.85, x: 0.3, y: 0.6, theme: "light" },
  { at: 1.0, x: 0.5, y: 0.75, theme: "light" },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sample(progress: number) {
  const p = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < WAYPOINTS.length - 1; i += 1) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    if (p >= a.at && p <= b.at) {
      const span = b.at - a.at || 1;
      const t = (p - a.at) / span;
      // ease-in-out for less linear motion
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      return {
        x: lerp(a.x, b.x, eased),
        y: lerp(a.y, b.y, eased),
        label: eased < 0.5 ? a.label : b.label,
        theme: eased < 0.5 ? a.theme : (b.theme ?? a.theme),
      };
    }
  }
  const last = WAYPOINTS[WAYPOINTS.length - 1];
  return { x: last.x, y: last.y, label: last.label, theme: last.theme };
}

function buildPathD(width: number, height: number) {
  if (!width || !height) return "";
  const points = WAYPOINTS.map((w) => ({
    x: w.x * width,
    y: w.y * height,
  }));
  if (points.length === 0) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    const cy = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
    d += ` T ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }
  return d;
}

export function FlyingDrone() {
  const craftRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [label, setLabel] = useState<string | undefined>(WAYPOINTS[0].label);
  const [pathD, setPathD] = useState("");

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    if (mql.matches) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const craft = craftRef.current;
    if (!craft) return;

    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRot = 0;
    let lastRecomputedAt = 0;
    let paused = false;

    function compute() {
      const scrollTop = window.scrollY;
      const viewport = window.innerHeight;
      const scrollable = Math.max(
        1,
        document.documentElement.scrollHeight - viewport,
      );
      const progress = scrollTop / scrollable;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const s = sample(progress);
      const targetX = s.x * vw;
      const targetY = s.y * vh;

      const smoothing = reduced ? 1 : 0.18;
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * smoothing;
      currentY += dy * smoothing;

      // Bank slightly in the direction of motion (clamped)
      const desiredRot = Math.max(-28, Math.min(28, dx * 0.4));
      currentRot += (desiredRot - currentRot) * (reduced ? 1 : 0.1);

      if (craft) {
        craft.style.transform = `translate3d(${currentX - 32}px, ${currentY - 32}px, 0) rotate(${currentRot.toFixed(2)}deg)`;
      }

      if (s.theme && s.theme !== theme) {
        setTheme(s.theme);
      }
      if (s.label !== label) {
        setLabel(s.label);
      }

      // Recompute path only every ~400ms (resize safety) rather than per frame
      if (performance.now() - lastRecomputedAt > 400) {
        lastRecomputedAt = performance.now();
        const next = buildPathD(vw, vh);
        if (next !== pathD) setPathD(next);
      }
    }

    function loop() {
      if (!paused) compute();
      frame = requestAnimationFrame(loop);
    }

    function handleVisibility() {
      paused = document.visibilityState !== "visible";
    }

    document.addEventListener("visibilitychange", handleVisibility);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // theme/label/pathD are intentionally omitted — the loop reads via refs/setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.layer} aria-hidden="true">
      <svg className={styles.trace} preserveAspectRatio="none">
        {pathD && <path className={styles.tracePath} d={pathD} />}
      </svg>

      <div
        ref={craftRef}
        className={`${styles.craft} ${theme === "dark" ? styles.craftDark : ""}`}
      >
        <div
          className={`${styles.callout} ${label ? styles.calloutVisible : ""} ${theme === "dark" ? "" : styles.calloutDark}`}
        >
          {label ?? ""}
        </div>
        <div className={styles.craftInner}>
          <svg
            viewBox="0 0 64 64"
            width="64"
            height="64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Central body with camera */}
            <rect x="26" y="26" width="12" height="12" rx="2" />
            <circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" />
            {/* Arms (X configuration) */}
            <line x1="32" y1="32" x2="14" y2="14" />
            <line x1="32" y1="32" x2="50" y2="14" />
            <line x1="32" y1="32" x2="14" y2="50" />
            <line x1="32" y1="32" x2="50" y2="50" />
            {/* Rotor arcs — spin illusion */}
            <g className={styles.rotorHub}>
              <circle cx="14" cy="14" r="6" opacity="0.5" />
              <circle cx="50" cy="14" r="6" opacity="0.5" />
              <circle cx="14" cy="50" r="6" opacity="0.5" />
              <circle cx="50" cy="50" r="6" opacity="0.5" />
            </g>
            {/* Static rotor rims */}
            <circle cx="14" cy="14" r="6" strokeWidth="1" opacity="0.3" />
            <circle cx="50" cy="14" r="6" strokeWidth="1" opacity="0.3" />
            <circle cx="14" cy="50" r="6" strokeWidth="1" opacity="0.3" />
            <circle cx="50" cy="50" r="6" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
