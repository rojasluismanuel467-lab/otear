/**
 * A screen's tab chosen by the address (`/vuelos?tab=hallazgos`), so a link can open the tab it
 * means. Pure: the hook that reads the address is `use-tab-param.ts`.
 *
 * Each tab has an internal id and a word for the address; either one is accepted, and anything
 * unknown is ignored (the screen keeps its own first tab).
 */

export interface TabParams {
  /** Internal ids, in the order the screen shows them. */
  ids: readonly string[];
  /** Words for the address, by internal id (Spanish, what a person would type or share). */
  words: Readonly<Record<string, string>>;
}

/** The tab an address asks for, or null when it asks for none that exists. */
export function tabFromParam(
  value: string | null | undefined,
  tabs: TabParams,
): string | null {
  const wanted = value?.trim().toLocaleLowerCase("es-CO");
  if (!wanted) return null;
  for (const id of tabs.ids) {
    if (id.toLocaleLowerCase("es-CO") === wanted) return id;
    if (tabs.words[id]?.toLocaleLowerCase("es-CO") === wanted) return id;
  }
  return null;
}

/** The word to write in the address for a tab. */
export function paramForTab(id: string, tabs: TabParams): string {
  return tabs.words[id] ?? id;
}

/** The address' query with `tab` set, keeping every other parameter. */
export function withTab(search: string, id: string, tabs: TabParams): string {
  const params = new URLSearchParams(search);
  params.set("tab", paramForTab(id, tabs));
  return `?${params.toString()}`;
}

export const flightTabs: TabParams = {
  ids: ["summary", "evidence", "findings", "report"],
  words: {
    summary: "resumen",
    evidence: "evidencias",
    findings: "hallazgos",
    report: "informe",
  },
};

export const reportTabs: TabParams = {
  ids: ["attention", "timeline", "costs", "report"],
  words: {
    attention: "pendientes",
    timeline: "evolucion",
    costs: "costos",
    report: "informe",
  },
};
