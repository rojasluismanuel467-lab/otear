"use client";

import {
  HardHat,
  Pickaxe,
  Route,
  ShieldCheck,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { term } from "@/features/config/config";
import { configForSector } from "@/features/config/presets";
import { useConfig } from "@/features/config/use-config";
import { useDemo } from "@/features/demo/demo-context";
import type { Sector } from "@/features/demo/types";

const sectorIcons: Record<Sector, LucideIcon> = {
  agriculture: Sprout,
  roads: Route,
  construction: HardHat,
  security: ShieldCheck,
  mining: Pickaxe,
};

/**
 * Cambio de caso de ejemplo, siempre visible en la barra superior: son solo cinco
 * sectores, así que van todos a la vista y no detrás de un menú. Al elegir, un aviso
 * cuenta qué cambió (las palabras de la demo) para que el salto se entienda.
 */
export function SiteSwitcher() {
  const { site, sites, setSiteId, setNotice } = useDemo();
  const { config, setConfig } = useConfig();

  function choose(id: string) {
    const next = sites.find((item) => item.id === id);
    if (!next || next.id === site.id) return;
    // The words travel with the example: otherwise the menu and the texts would mix the
    // vocabulary of the sector left behind with the data of the new one.
    const nextConfig = configForSector(config, next.sector);
    if (nextConfig) setConfig(nextConfig);
    setSiteId(id);
    const zones = (
      (nextConfig ?? config).zoneWords?.[next.sector]?.trim() || next.zoneLabel
    ).toLowerCase();
    const words = nextConfig
      ? `Las palabras cambian a las de este sector (${zones}, ${term(nextConfig, "finding", "plural").toLowerCase()}).`
      : config.presetId === "custom"
        ? "Se quedan las palabras que usted eligió en Configuración."
        : `Aquí ${zones} son las partes del lugar.`;
    setNotice(
      `Ahora ve «${next.name}» (${next.sectorLabel.toLowerCase()}). Es el mismo producto. ${words}`,
    );
  }

  return (
    <div
      className="case-switcher"
      role="group"
      aria-label="Caso de ejemplo: cambie de sector"
    >
      {sites.map((item) => {
        const Icon = sectorIcons[item.sector];
        const selected = item.id === site.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`case-switcher-option sector-${item.sector}`}
            aria-pressed={selected}
            aria-label={`${item.sectorLabel}: ${item.name}`}
            title={`${item.name} · ${item.location}`}
            onClick={() => choose(item.id)}
          >
            <Icon size={17} aria-hidden="true" />
            <span>{item.sectorLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
