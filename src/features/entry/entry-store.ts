"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ENTRY_KEY, parseEntry, serializeEntry, type Entry } from "./entry";

const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(ENTRY_KEY);
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function readEntry(): Entry | null {
  return parseEntry(readRaw());
}

export function writeEntry(entry: Entry | null) {
  try {
    if (entry) window.localStorage.setItem(ENTRY_KEY, serializeEntry(entry));
    else window.localStorage.removeItem(ENTRY_KEY);
  } catch {
    // Without storage the choice only lasts for this visit.
  }
  listeners.forEach((listener) => listener());
}

/** The sector the visitor chose on the landing, if any (opening the demo from a button chooses nothing). */
export function useEntry(): Entry | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => {
    const entry = parseEntry(raw);
    return entry?.unchosen ? null : entry;
  }, [raw]);
}
