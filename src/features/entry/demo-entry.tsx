"use client";

import { useEffect } from "react";
import { useDemo } from "@/features/demo/demo-context";
import { useConfig } from "@/features/config/use-config";
import { applyPreset } from "@/features/config/presets";
import { choiceById } from "./entry";
import { readEntry, writeEntry } from "./entry-store";

/** Starts with «Entró como»; the invite does not count it as something the visitor did. */
export const WELCOME_NOTICE = "Entró como";
const WELCOME_MS = 9000;

/**
 * When the visitor picked a sector on the landing, opens the demo on a matching
 * example project with that sector's words. It runs once per choice.
 */
export function DemoEntry() {
  const { sites, setSiteId, setNotice } = useDemo();
  const { update } = useConfig();

  useEffect(() => {
    const entry = readEntry();
    if (!entry?.launch) return;
    writeEntry({ ...entry, launch: false });

    const choice = choiceById(entry.choice);
    const site = sites.find((item) => item.sector === entry.choice);
    if (site) setSiteId(site.id);
    update((current) => applyPreset(current, choice.preset));
    setNotice(
      entry.choice === "other"
        ? `${WELCOME_NOTICE} ${entry.other ?? "su sector"}: la demo usa los nombres generales; en Configuración los cambia.`
        : `${WELCOME_NOTICE} ${choice.label.toLowerCase()}: ya ve «${choice.words.zones.toLowerCase()}» y «${choice.words.finding.toLowerCase()}» como en su sector.`,
    );
    // The welcome is a greeting, not a result to act on: it leaves by itself
    // unless another notice has replaced it.
    window.setTimeout(
      () =>
        setNotice((current) =>
          current.startsWith(WELCOME_NOTICE) ? "" : current,
        ),
      WELCOME_MS,
    );
  }, [sites, setSiteId, setNotice, update]);

  return null;
}
