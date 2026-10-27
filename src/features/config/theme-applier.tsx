"use client";

import { useEffect } from "react";
import { accentTokens } from "./config";
import { can } from "./licence";
import { useConfig } from "./use-config";

/** Applies the company's brand colour to the design tokens; renders nothing. */
export function ThemeApplier() {
  const { config } = useConfig();
  const accent = can(config.planId, "branding")
    ? config.company.accent
    : undefined;
  useEffect(() => {
    const tokens = accentTokens(accent);
    if (!tokens) return;
    const style = document.documentElement.style;
    style.setProperty("--accent", tokens.accent);
    style.setProperty("--accent-hover", tokens.hover);
    style.setProperty("--accent-soft", tokens.soft);
    style.setProperty("--accent-soft-foreground", tokens.accent);
    style.setProperty("--focus", tokens.accent);
    return () => {
      for (const name of [
        "--accent",
        "--accent-hover",
        "--accent-soft",
        "--accent-soft-foreground",
        "--focus",
      ]) {
        style.removeProperty(name);
      }
    };
  }, [accent]);
  return null;
}
