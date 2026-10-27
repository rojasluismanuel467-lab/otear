"use client";

import { useSyncExternalStore } from "react";
import { useDemo } from "@/features/demo/demo-context";
import {
  defaultConfig,
  moduleTitle,
  term,
  type CompanyConfig,
  type ModuleId,
  type TermKey,
} from "./config";
import {
  getServerSnapshot,
  getSnapshot,
  setConfig,
  subscribe,
} from "./config-store";

export function useConfig() {
  const config = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return {
    config,
    setConfig: (next: CompanyConfig) => setConfig(next),
    update: (change: (current: CompanyConfig) => CompanyConfig) =>
      setConfig(change(getSnapshot())),
    reset: () => setConfig({ ...defaultConfig, planId: getSnapshot().planId }),
  };
}

/** `t("finding", "plural")` gives the company's word for a term. */
export function useTerm() {
  const { config } = useConfig();
  return (key: TermKey, form: "singular" | "plural" = "singular") =>
    term(config, key, form);
}

/** Page title of a module, with the company's own name if it set one. */
export function useModuleTitle(id: ModuleId) {
  const { config } = useConfig();
  const { site } = useDemo();
  return moduleTitle(config, id, site.zoneLabel);
}
