import type { BasemapId } from "./basemaps";

const KEY = "otear.basemap";
const listeners = new Set<() => void>();
let cached: BasemapId | null = null;

function read(): BasemapId {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value === "satellite" || value === "streets") return value;
  } catch {
    // Storage can be blocked; the default still works.
  }
  return "satellite";
}

export function getBasemap(): BasemapId {
  if (!cached) cached = read();
  return cached;
}

export function getServerBasemap(): BasemapId {
  return "satellite";
}

export function setBasemap(next: BasemapId) {
  cached = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // The choice still applies for this session.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeBasemap(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
