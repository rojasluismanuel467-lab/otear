"use client";

import { useEffect, useRef } from "react";
import { useDemo } from "@/features/demo/demo-context";
import { OPERATOR_A } from "@/features/demo/demo-data";
import { useConfig } from "@/features/config/use-config";
import { applyPreset } from "@/features/config/presets";
import { demoStart, sectorToRestore, WELCOME_NOTICE } from "./entry";
import { readEntry, writeEntry } from "./entry-store";

export { WELCOME_NOTICE };

/**
 * When the visitor opened the demo from the landing, selects the matching example
 * project, applies that sector's words and shows a welcome that says where to look
 * (the route itself is the link they pressed). It runs once per press.
 *
 * On a reload the words saved in the browser would otherwise sit on top of the
 * first example, so the sector's example project is selected again.
 */
export function DemoEntry() {
  const { sites, setSiteId, setNotice, setActingAs } = useDemo();
  const { update } = useConfig();
  const handled = useRef(false);

  useEffect(() => {
    const entry = readEntry();
    if (!entry) return;

    if (!entry.launch) {
      if (handled.current) return;
      handled.current = true;
      const sector = sectorToRestore(entry);
      const site = sector && sites.find((item) => item.sector === sector);
      if (site) setSiteId(site.id);
      return;
    }

    handled.current = true;
    // Nothing chosen leaves no trace; a choice stays so a reload can restore it.
    if (entry.unchosen) writeEntry(null);
    else
      writeEntry({ ...entry, launch: false, opened: true, viewAs: undefined });

    const start = demoStart(entry);
    const site = start.sector
      ? sites.find((item) => item.sector === start.sector)
      : undefined;
    if (site) setSiteId(site.id);
    const preset = start.preset;
    if (preset) update((current) => applyPreset(current, preset));
    if (entry.viewAs === "operator") setActingAs(OPERATOR_A);
    // The welcome stays until the visitor closes it or another notice replaces it.
    setNotice(start.notice);
  }, [sites, setSiteId, setNotice, setActingAs, update]);

  return null;
}
