"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Hand, RotateCcw } from "lucide-react";
import type { DroneModelSpec } from "@/components/drone/drone-model";
import styles from "./drone-greeting.module.css";

// three.js (~500 KB) loads only on this client component.
const DroneScene = dynamic(
  () =>
    import("@/components/drone/drone-scene").then(
      (module) => module.DroneScene,
    ),
  { ssr: false },
);

const SESSION_KEY = "otear.landing.intro.played";

type DroneGreetingProps = {
  /** CSS selector of the hero element whose rect the stage docks into. */
  slotSelector: string;
  spec?: DroneModelSpec;
};

const CAPTIONS: Array<{ text: string; delay: number; duration: number }> = [
  { text: "Hola. Soy Oto, el dron de Otear.", delay: 400, duration: 2200 },
  {
    text: "Reúno los vuelos de dron de su ingenio en un solo lugar.",
    delay: 2700,
    duration: 2600,
  },
  {
    text: "Explore cuando quiera. Yo le muestro.",
    delay: 5400,
    duration: 1700,
  },
];

export function DroneGreeting({
  slotSelector,
  spec = { kind: "enterprise" },
}: DroneGreetingProps) {
  // Intro state defaults to true, but we read sessionStorage in an effect so
  // SSR hydration doesn't mismatch.
  const [introActive, setIntroActive] = useState(true);
  const [docked, setDocked] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  // The three.js chunk is lazy-loaded, so for ~1s after mount the canvas has
  // no WebGL surface. We hide the whole overlay (and keep the DroneScene's
  // intro paused via playIntro=false) until the first render fires, so the
  // user never sees the dark overlay + caption + empty centre.
  const [canvasReady, setCanvasReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Decide if the intro should play (first visit this session only).
  // Checking sessionStorage during render would break hydration under static
  // export; we check once post-mount and skip the intro on return visits.
  useEffect(() => {
    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage blocked (private mode) → treat as first visit
    }
    if (played) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration-safe skip; both state writes batch in a single render
      setIntroActive(false);
      setDocked(true);
      return;
    }
    // First visit: lock scroll and start at the top so the dock-to animation
    // lands in the slot the user is about to see.
    window.scrollTo(0, 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // When intro finishes, release scroll immediately so the dock transition
  // runs against the stable layout.
  useEffect(() => {
    if (!introActive) {
      document.body.style.overflow = "";
    }
  }, [introActive]);

  // Track the slot element's rect so the stage can dock to it. We measure
  // synchronously in a layout effect so returning visitors (docked from the
  // start) never flash full-viewport before the first paint.
  useLayoutEffect(() => {
    const slot = document.querySelector(slotSelector);
    if (!(slot instanceof HTMLElement)) return;

    let raf = 0;
    const updateImmediate = () => {
      setRect(slot.getBoundingClientRect());
    };
    const updateRafed = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setRect(slot.getBoundingClientRect());
      });
    };
    updateImmediate();
    window.addEventListener("scroll", updateRafed, { passive: true });
    window.addEventListener("resize", updateRafed);
    const ro = new ResizeObserver(updateRafed);
    ro.observe(slot);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updateRafed);
      window.removeEventListener("resize", updateRafed);
      ro.disconnect();
    };
  }, [slotSelector]);

  function finishIntro() {
    setIntroActive(false);
    setDocked(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // ignore
    }
  }

  // When the DroneScene reports its scripted intro ended, dock.
  function handleIntroEnd() {
    finishIntro();
  }

  function handleSkip() {
    finishIntro();
  }

  function handleCanvasReady() {
    // Idempotent: fires once per DroneScene mount; a strict mode remount is
    // fine because setState with the same value is bailed out of by React.
    setCanvasReady(true);
  }

  // When returning (docked from mount) wait until rect is measured so the
  // first paint lands in the slot instead of covering the viewport.
  if (docked && !rect) return null;

  // The intro only runs once the canvas has painted its first frame, so the
  // user never sees the overlay with an empty centre during the dynamic chunk
  // load.
  const introReady = introActive && canvasReady;

  // Style: fullscreen during intro, slot rect once docked.
  const stageStyle: React.CSSProperties =
    docked && rect
      ? {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }
      : {
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        };

  // Hide the whole overlay (background + topographic texture + captions +
  // skip) until the canvas has rendered its first frame. The DroneScene is
  // still rendered — that's how the chunk loads and the first render fires —
  // just invisible. Returning visitors (docked from mount) skip this gate.
  const overlayHidden = introActive && !canvasReady;

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${docked ? styles.stageDocked : ""} ${
        overlayHidden ? styles.stageHidden : ""
      }`}
      style={stageStyle}
      data-cursor-theme="dark"
      aria-live="polite"
    >
      <div className={styles.canvasHost}>
        <DroneScene
          spec={spec}
          tone="dark"
          resetSignal={resetSignal}
          playIntro={introReady}
          onIntroEnd={handleIntroEnd}
          onInteract={() => setHasInteracted(true)}
          onReady={handleCanvasReady}
        />
      </div>

      {introReady && (
        <>
          <button
            type="button"
            className={styles.skip}
            onClick={handleSkip}
            aria-label="Saltar la introducción"
          >
            Saltar intro
          </button>
          <div className={styles.captions} aria-hidden="true">
            {CAPTIONS.map((caption) => (
              <span
                key={caption.text}
                className={styles.caption}
                style={{
                  ["--delay" as string]: `${caption.delay}ms`,
                  animationDuration: `${caption.duration}ms`,
                }}
              >
                {caption.text}
              </span>
            ))}
          </div>
        </>
      )}

      {docked && (
        <>
          <span
            className={`${styles.hint} ${hasInteracted ? "" : styles.hintVisible}`}
          >
            <Hand size={12} aria-hidden /> Oto · arrástralo para girar
          </span>
          <button
            type="button"
            className="icon-button"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 4,
            }}
            title="Restablecer orientación"
            aria-label="Restablecer orientación del dron"
            onClick={() => setResetSignal((n) => n + 1)}
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
