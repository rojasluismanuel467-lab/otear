"use client";

import { useSyncExternalStore } from "react";

const KEY = "otear.sidebar-collapsed";
const listeners = new Set<() => void>();
let cached: boolean | null = null;

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    // Sin almacenamiento el menú queda visible, que es el valor por defecto.
    return false;
  }
}

function getSnapshot(): boolean {
  if (cached === null) cached = read();
  return cached;
}

/** El servidor y el primer render del cliente muestran el menú, para que la hidratación coincida. */
function getServerSnapshot(): boolean {
  return false;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Preferencia de comodidad por navegador: el menú lateral oculto o visible. */
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  function toggle() {
    cached = !collapsed;
    try {
      window.localStorage.setItem(KEY, cached ? "1" : "0");
    } catch {
      // La preferencia sigue valiendo en esta sesión.
    }
    listeners.forEach((listener) => listener());
  }
  return { collapsed, toggle };
}
