"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Hand, RotateCcw } from "lucide-react";
import type { DroneModelSpec } from "./drone-model";
import { whenIdle } from "@/lib/idle";
import styles from "./drone-preview.module.css";

// three.js (~500 KB) only loads when a drone is actually shown.
const DroneScene = dynamic(
  () => import("./drone-scene").then((module) => module.DroneScene),
  {
    ssr: false,
    loading: () => <div className={styles.loading} aria-hidden="true" />,
  },
);

export function DronePreview({
  tone = "light",
  spec = { kind: "compact" },
}: {
  tone?: "light" | "dark";
  spec?: DroneModelSpec;
}) {
  const [resetSignal, setResetSignal] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);
  // The 3D scene (three.js chunk, shaders, a render loop) starts only once this panel is
  // near the screen and the page is idle, so it never competes with the first paint.
  const [wanted, setWanted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelIdle = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        cancelIdle = whenIdle(() => setWanted(true), 1500);
      },
      { rootMargin: "200px" },
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      cancelIdle();
    };
  }, []);

  return (
    <div className={`${styles.preview} ${tone === "dark" ? styles.dark : ""}`}>
      <div className={styles.stage} ref={stageRef}>
        {wanted ? (
          <DroneScene
            tone={tone}
            spec={spec}
            resetSignal={resetSignal}
            onInteract={() => setHasInteracted(true)}
            onUnavailable={() => setIsUnavailable(true)}
          />
        ) : (
          <div className={styles.loading} aria-hidden="true" />
        )}
        {!isUnavailable && (
          <>
            <span
              className={`${styles.hint} ${hasInteracted ? styles.hintHidden : ""}`}
              aria-hidden="true"
            >
              <Hand size={14} />
              Arrastre para girar
            </span>
            <button
              type="button"
              className={`icon-button ${styles.reset}`}
              title="Restablecer orientación"
              aria-label="Restablecer orientación del dron"
              onClick={() => setResetSignal((value) => value + 1)}
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
      <p className={styles.disclaimer}>
        Modelo ilustrativo · no representa el equipo exacto
      </p>
    </div>
  );
}
