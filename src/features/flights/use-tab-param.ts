"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { tabFromParam, withTab, type TabParams } from "./tab-param";

/**
 * The selected tab of a screen, following `?tab=` in the address: opening a link with the
 * parameter selects that tab, and choosing a tab writes it back (without adding history entries),
 * so the address can be copied or reloaded. Without the parameter the screen keeps `fallback`.
 * Must sit inside a `Suspense` boundary because it reads the query.
 */
export function useTabParam(tabs: TabParams, fallback: string) {
  const fromAddress = tabFromParam(useSearchParams().get("tab"), tabs);
  const [state, setState] = useState({
    address: fromAddress,
    tab: fromAddress ?? fallback,
  });
  // A link inside the app can change the address while this screen stays mounted: follow it.
  if (state.address !== fromAddress) {
    setState({ address: fromAddress, tab: fromAddress ?? state.tab });
  }

  function select(id: string) {
    setState((current) => ({ ...current, tab: id }));
    if (typeof window === "undefined") return;
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${withTab(window.location.search, id, tabs)}${window.location.hash}`,
    );
  }

  return [state.tab, select] as const;
}
