"use client";

import { Info } from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import styles from "./example-notice.module.css";

/**
 * One line, at reading size, under the title of the flight screens: what is invented and the one
 * thing that is real. The small «Datos de ejemplo» notes further down stay, but nobody should have
 * to find them to know where they are.
 */
export function ExampleNotice() {
  const { site } = useDemo();
  return (
    <p className={styles.notice} role="note">
      <Info size={18} aria-hidden="true" />
      <span>
        <strong>Ejemplo, no real.</strong> Los nombres, las fotos, las cifras y
        los {site.zoneLabel.toLowerCase()} dibujados son inventados. Solo el
        mapa de fondo es una imagen real del lugar.
      </span>
    </p>
  );
}
