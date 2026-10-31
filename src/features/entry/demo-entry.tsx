"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
const WELCOME_MS = 15000;

export function DemoEntry() {
  const { sites, setSiteId, setNotice, setActingAs } = useDemo();
  const pathname = usePathname();
  const welcomeAt = useRef<string | null>(null);
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
    // The welcome says where to look, so it leaves by itself and when the visitor
    // goes to another screen; another notice replaces it earlier.
    welcomeAt.current = pathname;
    setNotice(start.notice);
    window.setTimeout(
      () =>
        setNotice((current) =>
          current.startsWith(WELCOME_NOTICE) ? "" : current,
        ),
      WELCOME_MS,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites, setSiteId, setNotice, setActingAs, update]);

  useEffect(() => {
    if (welcomeAt.current && pathname !== welcomeAt.current) {
      welcomeAt.current = null;
      setNotice((current) =>
        current.startsWith(WELCOME_NOTICE) ? "" : current,
      );
    }
  }, [pathname, setNotice]);

  return null;
}
