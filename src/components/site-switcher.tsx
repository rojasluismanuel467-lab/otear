"use client";

import {
  HardHat,
  Route,
  ShieldCheck,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import type { Sector } from "@/features/demo/types";

const sectorIcons: Record<Sector, LucideIcon> = {
  agriculture: Sprout,
  roads: Route,
  construction: HardHat,
  security: ShieldCheck,
};

/**
 * Cambio de caso de ejemplo, siempre visible en la barra superior: son solo cuatro
 * sectores, así que van todos a la vista y no detrás de un menú. Al elegir, un aviso
 * cuenta qué cambió (las palabras de la demo) para que el salto se entienda.
 */
export function SiteSwitcher() {
  const { site, sites, setSiteId, setNotice } = useDemo();

  function choose(id: string) {
    const next = sites.find((item) => item.id === id);
    if (!next || next.id === site.id) return;
    setSiteId(id);
    setNotice(
      `Ahora ve «${next.name}» (${next.sectorLabel.toLowerCase()}). Es el mismo producto: aquí ${next.zoneLabel.toLowerCase()} son las partes del lugar.`,
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
