"use client";

import { useSyncExternalStore } from "react";
import { basemapOptions, type BasemapId } from "./basemaps";
import {
  getBasemap,
  getServerBasemap,
  setBasemap,
  subscribeBasemap,
} from "./basemap-store";

export function useBasemap(): BasemapId {
  return useSyncExternalStore(subscribeBasemap, getBasemap, getServerBasemap);
}

/** Satélite / Mapa. The choice is kept for every map in the demo. */
export function BasemapSwitch({ value }: { value: BasemapId }) {
  return (
    <div className="map-basemap-switch" role="group" aria-label="Tipo de mapa">
      {basemapOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => setBasemap(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
