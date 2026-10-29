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
const DOCK_MS = 1150;
/** If the canvas is not ready by then (no WebGL, failed chunk), the page must not stay locked. */
const FAILSAFE_MS = 8000;

type Box = { top: number; left: number; width: number; height: number };

function sameBox(a: Box | null, b: Box) {
  return (
    a !== null &&
    a.top === b.top &&
    a.left === b.left &&
    a.width === b.width &&
    a.height === b.height
  );
}

type DroneGreetingProps = {
  /** CSS selector of the hero element whose rect the stage docks into. */
  slotSelector: string;
  spec?: DroneModelSpec;
  /** When docked, whether the user has activated the drone for drag. Off by
   * default so the canvas doesn't swallow clicks meant for the hero's CTAs or
   * scroll. */
  interactive?: boolean;
};

const CAPTIONS: Array<{ text: string; delay: number; duration: number }> = [
  { text: "Hola. Soy Viper, el dron de Otear.", delay: 400, duration: 2200 },
  {
    text: "Reúno los vuelos de dron de su proyecto en un solo lugar.",
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
  spec = { kind: "viper" },
  interactive = false,
}: DroneGreetingProps) {
  // Intro state defaults to true, but we read sessionStorage in an effect so
  // SSR hydration doesn't mismatch.
  const [introActive, setIntroActive] = useState(true);
  const [docked, setDocked] = useState(false);
  // Once the dock transition ends the stage stops being `fixed` and rides the
  // page like any other element, so scrolling never goes through React.
  const [settled, setSettled] = useState(false);
  // Slot box in page coordinates (viewport rect + scroll offset).
  const [box, setBox] = useState<Box | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  // The three.js chunk is lazy-loaded, so for ~1s after mount the canvas has
  // no WebGL surface. We hide the whole overlay (and keep the DroneScene's
  // intro paused via playIntro=false) until the first render fires, so the
  // user never sees the dark overlay + caption + empty centre.
  const [canvasReady, setCanvasReady] = useState(false);
  // Without WebGL the stage has nothing to show; the landing still works.
  const [unavailable, setUnavailable] = useState(false);
  const canvasReadyRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // Decide if the intro should play (first visit this session only).
  // Checking sessionStorage during render would break hydration under static
  // export; we check once post-mount and skip the intro on return visits.
  useEffect(() => {
    // A link to a section (e.g. the invite inside the demo) must land there,
    // not at the top behind a scroll lock, so an anchor also skips the intro.
    let played = window.location.hash.length > 1;
    try {
      played = played || sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage blocked (private mode) → treat as first visit
    }
    if (played) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration-safe skip; both state writes batch in a single render
      setIntroActive(false);
      setDocked(true);
      setSettled(true);
      return;
    }
    // First visit: lock scroll and start at the top so the dock-to animation
    // lands in the slot the user is about to see.
    window.scrollTo(0, 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The lock is released when the dock settles, which needs the canvas. If it
    // never gets ready, release it here so the page is not stuck.
    const failsafe = window.setTimeout(() => {
      if (canvasReadyRef.current) return;
      document.body.style.overflow = previousOverflow;
      setIntroActive(false);
      setDocked(true);
      setSettled(true);
    }, FAILSAFE_MS);
    return () => {
      window.clearTimeout(failsafe);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Scroll stays locked through the dock transition (the stage is `fixed` and
  // lands on a rect measured at scroll 0); once settled it is released and
  // the stage switches to page-relative positioning at the same coordinates.
  useEffect(() => {
    if (!docked || settled) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(
      () => {
        document.body.style.overflow = "";
        setSettled(true);
      },
      reduced ? 0 : DOCK_MS + 80,
    );
    return () => window.clearTimeout(timer);
  }, [docked, settled]);

  // Track the slot's box so the stage can dock to it. Measured synchronously
  // in a layout effect so returning visitors (docked from the start) never
  // flash full-viewport before the first paint. Scroll is not observed: the
  // box is in page coordinates, so only size or layout changes re-measure.
  useLayoutEffect(() => {
    const slot = document.querySelector(slotSelector);
    if (!(slot instanceof HTMLElement)) return;

    let raf = 0;
    const measure = () => {
      const r = slot.getBoundingClientRect();
      const next = {
        top: Math.round(r.top + window.scrollY),
        left: Math.round(r.left + window.scrollX),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
      setBox((current) => (sameBox(current, next) ? current : next));
    };
    const measureSoon = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("resize", measureSoon);
    // The slot can move without resizing (a font swap reflowing the headline
    // changes the hero's height), so watch its section too.
    const ro = new ResizeObserver(measureSoon);
    ro.observe(slot);
    const section = slot.closest("section");
    if (section) ro.observe(section);
    document.fonts?.ready.then(measureSoon);
    // The slot can also change place without changing size (the hero's columns swapping sides,
    // for instance), which no observer above sees. Re-measure when the page finishes loading,
    // shortly after mount, and whenever the stylesheets change (a hot update in development).
    window.addEventListener("load", measureSoon);
    window.addEventListener("pageshow", measureSoon);
    const timers = [250, 1000, 2500].map((ms) =>
      window.setTimeout(measureSoon, ms),
    );
    const styleObserver = new MutationObserver(measureSoon);
    styleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureSoon);
      window.removeEventListener("load", measureSoon);
      window.removeEventListener("pageshow", measureSoon);
      timers.forEach((timer) => window.clearTimeout(timer));
      styleObserver.disconnect();
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

  // No WebGL: release the scroll lock and drop the stage (the scene's own
  // fallback text speaks of an assigned aircraft, which makes no sense here).
  function handleUnavailable() {
    document.body.style.overflow = "";
    setIntroActive(false);
    setDocked(true);
    setSettled(true);
    setUnavailable(true);
  }

  function handleCanvasReady() {
    canvasReadyRef.current = true;
    // Idempotent: fires once per DroneScene mount; a strict mode remount is
    // fine because setState with the same value is bailed out of by React.
    setCanvasReady(true);
  }

  // When returning (docked from mount) wait until rect is measured so the
  // first paint lands in the slot instead of covering the viewport.
  if (unavailable || (docked && !box)) return null;

  // The intro only runs once the canvas has painted its first frame, so the
  // user never sees the overlay with an empty centre during the dynamic chunk
  // load.
  const introReady = introActive && canvasReady;

  // Style: fullscreen during intro, slot rect once docked.
  const stageStyle: React.CSSProperties =
    docked && box
      ? {
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
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
  // When docked and the hero hasn't been clicked, let clicks pass through the
  // canvas to the page beneath (CTAs, scroll).
  const stageInactive = docked && !interactive;

  return (
    <div
      ref={stageRef}
      className={`${styles.stage} ${docked ? styles.stageDocked : ""} ${
        settled ? styles.stageSettled : ""
      } ${
        overlayHidden ? styles.stageHidden : ""
      } ${stageInactive ? styles.stageInactive : ""}`}
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
          onUnavailable={handleUnavailable}
          parallax={docked}
          followPointer={docked}
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

      {docked && interactive && (
        <>
          <span
            className={`${styles.hint} ${hasInteracted ? "" : styles.hintVisible}`}
          >
            <Hand size={12} aria-hidden /> Viper · arrástralo para girar
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
