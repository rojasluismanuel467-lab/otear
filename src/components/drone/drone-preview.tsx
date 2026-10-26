"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Hand, RotateCcw } from "lucide-react";
import type { DroneModelSpec } from "./drone-model";
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

  return (
    <div className={`${styles.preview} ${tone === "dark" ? styles.dark : ""}`}>
      <div className={styles.stage}>
        <DroneScene
          tone={tone}
          spec={spec}
          resetSignal={resetSignal}
          onInteract={() => setHasInteracted(true)}
          onUnavailable={() => setIsUnavailable(true)}
        />
        {!isUnavailable && (
          <>
            <span
              className={`${styles.hint} ${hasInteracted ? styles.hintHidden : ""}`}
              aria-hidden="true"
            >
              <Hand size={14} />
              Arrastra para girar
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
