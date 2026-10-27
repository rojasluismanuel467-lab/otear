import { defaultConfig, validateConfig, type CompanyConfig } from "./config";

const KEY = "otear.config.v1";
const listeners = new Set<() => void>();
let cached: CompanyConfig | null = null;

function read(): CompanyConfig {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const result = validateConfig(JSON.parse(raw));
      if (result.ok) return result.config;
    }
  } catch {
    // Storage can be blocked or hold something unreadable; fall back to the defaults.
  }
  return defaultConfig;
}

export function getSnapshot(): CompanyConfig {
  if (!cached) cached = read();
  return cached;
}

/** Server and first client render use the defaults so hydration matches. */
export function getServerSnapshot(): CompanyConfig {
  return defaultConfig;
}

export function setConfig(next: CompanyConfig) {
  cached = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // The configuration still applies for this session.
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
