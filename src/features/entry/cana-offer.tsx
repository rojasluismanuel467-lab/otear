"use client";

import { can } from "@/features/config/licence";
import { applyPreset } from "@/features/config/presets";
import { useConfig } from "@/features/config/use-config";
import { useDemo } from "@/features/demo/demo-context";
import { WELCOME_NOTICE } from "./entry";
import { readEntry } from "./entry-store";
import styles from "./cana-offer.module.css";

/**
 * Inside the welcome of the farm example: whoever grows sugar cane says «suertes», not «lotes».
 * One press applies that vocabulary (the same template as Configuración > Nombres y menú), so the
 * demo can speak like them from the first minute. Offered only on the farm, only while the
 * welcome is up, and never to someone who said their sector is another one.
 */
export function CanaOffer() {
  const { site, notice, setNotice } = useDemo();
  const { config, update } = useConfig();
  if (
    !notice.startsWith(WELCOME_NOTICE) ||
    site.sector !== "agriculture" ||
    config.presetId === "cana" ||
    !can(config.planId, "vocabulary") ||
    readEntry()?.choice === "other"
  ) {
    return null;
  }
  return (
    <button
      type="button"
      className={styles.offer}
      onClick={() => {
        update((current) => applyPreset(current, "cana"));
        setNotice(
          "Ahora la demo habla en suertes y novedades de campo. Para volver a los nombres anteriores, vaya a Configuración > Nombres y menú.",
        );
      }}
    >
      ¿Cultiva caña? Hable en suertes
    </button>
  );
}
