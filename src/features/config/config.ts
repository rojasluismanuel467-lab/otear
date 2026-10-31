import type { Sector } from "../demo/types";
import { sanitizeFields, type CustomField } from "./custom-fields.ts";
import { can, type PlanId } from "./licence.ts";

/**
 * Per-company configuration, kept apart from the product's code like Moodle keeps its
 * local language pack apart from the official one: the core never changes, and what the
 * company customises is a small set of overrides on top of the defaults.
 */

export type ModuleId =
  | "programacion"
  | "servicios"
  | "vuelos"
  | "mapa"
  | "evolucion"
  | "equipos"
  | "informes"
  | "pagos"
  | "documentos";

export interface ModuleDef {
  id: ModuleId;
  href: string;
  /** Name in the menu. `{zona}` is replaced by the zone word of the active site. */
  label: string;
  /** Title of the page. */
  title: string;
}

export const moduleDefs: ModuleDef[] = [
  {
    id: "programacion",
    href: "/programacion",
    label: "Programación",
    title: "Programación",
  },
  {
    id: "servicios",
    href: "/servicios",
    label: "Servicios contratados",
    title: "Servicios contratados",
  },
  {
    id: "vuelos",
    href: "/vuelos",
    label: "Vuelos y evidencias",
    title: "Archivo de vuelos",
  },
  { id: "mapa", href: "/mapa", label: "Mapa y {zona}", title: "Mapa y {zona}" },
  {
    id: "evolucion",
    href: "/evolucion",
    label: "Evolución",
    title: "Evolución",
  },
  {
    id: "equipos",
    href: "/equipos",
    label: "Equipos y mantenimiento",
    title: "Equipos y mantenimiento",
  },
  {
    id: "informes",
    href: "/informes",
    label: "Informes y cifras",
    title: "Informes y cifras",
  },
  {
    id: "pagos",
    href: "/pagos",
    label: "Pagos y costos",
    title: "Pagos y costos",
  },
  {
    id: "documentos",
    href: "/documentos",
    label: "Documentos",
    title: "Documentos",
  },
];

export type TermKey =
  | "flight"
  | "finding"
  | "pilot"
  | "aircraft"
  | "report"
  | "operator"
  | "manager"
  | "owner";

export interface TermForms {
  singular: string;
  plural: string;
}

export const termDefs: Record<TermKey, TermForms & { hint: string }> = {
  flight: { singular: "Vuelo", plural: "Vuelos", hint: "Una salida del dron." },
  finding: {
    singular: "Hallazgo",
    plural: "Hallazgos",
    hint: "Algo que el vuelo encontró y hay que revisar.",
  },
  pilot: {
    singular: "Piloto",
    plural: "Pilotos",
    hint: "Quien maneja el dron.",
  },
  operator: {
    singular: "Operador",
    plural: "Operadores",
    hint: "La empresa que presta el servicio de vuelo.",
  },
  manager: {
    singular: "Gestor",
    plural: "Gestores",
    hint: "Quien administra el programa y paga el servicio, por ejemplo un ingenio.",
  },
  owner: {
    singular: "Propietario",
    plural: "Propietarios",
    hint: "Quien es dueño de la tierra o de la obra, por ejemplo un cañicultor.",
  },
  aircraft: {
    singular: "Aeronave",
    plural: "Aeronaves",
    hint: "El equipo que vuela.",
  },
  report: {
    singular: "Informe",
    plural: "Informes",
    hint: "El resumen que se entrega.",
  },
};

export type PresetId =
  | "general"
  | "cana"
  | "agricultura"
  | "carreteras"
  | "construccion"
  | "vigilancia"
  | "mineria";

export interface CompanyConfig {
  version: 1;
  company: {
    name: string;
    logo?: string;
    accent?: string;
    hideVendor?: boolean;
  };
  presetId: PresetId | "custom";
  planId: PlanId;
  terms: Partial<Record<TermKey, TermForms>>;
  modules: Partial<Record<ModuleId, { hidden?: boolean; label?: string }>>;
  order: ModuleId[];
  /** The company's own fields on flights, findings, aircraft and invoices. */
  fields: CustomField[];
  /** The company's word for the zones of a sector, in plural: «Suertes», «Frentes»… */
  zoneWords?: Partial<Record<Sector, string>>;
}

export const defaultConfig: CompanyConfig = {
  version: 1,
  company: { name: "" },
  presetId: "general",
  // The demo starts with every layer open so each one can be seen; the licence tab changes it.
  planId: "enterprise",
  terms: {},
  modules: {},
  order: moduleDefs.map((item) => item.id),
  fields: [],
  zoneWords: {},
};

const clean = (text: string | undefined) => text?.trim() ?? "";

/** Word the company uses for a term, falling back to the product's own word. */
export function term(
  config: CompanyConfig,
  key: TermKey,
  form: "singular" | "plural" = "singular",
) {
  const own = can(config.planId, "vocabulary")
    ? clean(config.terms[key]?.[form])
    : "";
  return own || termDefs[key][form];
}

const withZone = (text: string, zone: string) =>
  text.replace("{zona}", zone.toLowerCase());

export function moduleLabel(
  config: CompanyConfig,
  id: ModuleId,
  zone = "lotes",
) {
  const def = moduleDefs.find((item) => item.id === id)!;
  const own = can(config.planId, "modules")
    ? clean(config.modules[id]?.label)
    : "";
  return withZone(own || def.label, zone);
}

/** Page title: the company's own name for the module if it set one, otherwise the default title. */
export function moduleTitle(
  config: CompanyConfig,
  id: ModuleId,
  zone = "lotes",
) {
  const def = moduleDefs.find((item) => item.id === id)!;
  const own = can(config.planId, "modules")
    ? clean(config.modules[id]?.label)
    : "";
  return withZone(own || def.title, zone);
}

/** Modules in the company's order, without the hidden ones (unless the plan does not allow hiding). */
export function visibleModules(config: CompanyConfig): ModuleDef[] {
  const allowed = can(config.planId, "modules");
  const known = new Set(moduleDefs.map((item) => item.id));
  const order = [
    ...(allowed ? config.order.filter((id) => known.has(id)) : []),
    ...moduleDefs.map((item) => item.id),
  ].filter((id, index, list) => list.indexOf(id) === index);
  return order
    .map((id) => moduleDefs.find((item) => item.id === id)!)
    .filter((item) => !allowed || !config.modules[item.id]?.hidden);
}

export function moveModule(
  order: ModuleId[],
  id: ModuleId,
  step: -1 | 1,
): ModuleId[] {
  const from = order.indexOf(id);
  const to = from + step;
  if (from < 0 || to < 0 || to >= order.length) return order;
  const next = [...order];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

// ---- Colour -------------------------------------------------------------

const hexOk = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

function channels(hex: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function luminance(hex: string) {
  const [r, g, b] = channels(hex).map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colours. */
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const mix = (hex: string, other: [number, number, number], amount: number) => {
  const c = channels(hex);
  return (
    "#" +
    c
      .map((v, i) =>
        Math.round(v + (other[i] - v) * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
};

/** Colours derived from the brand colour. Null when the colour cannot carry white text (below 4.5:1). */
export function accentTokens(hex: string | undefined) {
  if (!hex || !hexOk(hex) || contrast(hex, "#ffffff") < 4.5) return null;
  return {
    accent: hex.toLowerCase(),
    hover: mix(hex, [0, 0, 0], 0.18),
    soft: mix(hex, [255, 255, 255], 0.88),
  };
}

// ---- Validation of imported files ----------------------------------------

export function validateConfig(
  raw: unknown,
): { ok: true; config: CompanyConfig } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object")
    return { ok: false, error: "El archivo no tiene el formato esperado." };
  const data = raw as Record<string, unknown>;
  if (data.version !== 1)
    return { ok: false, error: "Versión de configuración no compatible." };
  const company = (data.company ?? {}) as Record<string, unknown>;
  const config: CompanyConfig = {
    version: 1,
    company: {
      name: typeof company.name === "string" ? company.name.slice(0, 80) : "",
      logo:
        typeof company.logo === "string" &&
        company.logo.startsWith("data:image/") &&
        company.logo.length < 400_000
          ? company.logo
          : undefined,
      accent:
        typeof company.accent === "string" && hexOk(company.accent)
          ? company.accent
          : undefined,
      hideVendor: company.hideVendor === true,
    },
    presetId:
      (
        [
          "general",
          "cana",
          "agricultura",
          "carreteras",
          "construccion",
          "vigilancia",
          "mineria",
          "custom",
        ] as const
      ).find((id) => id === data.presetId) ?? "custom",
    planId:
      (["base", "pro", "enterprise"] as const).find(
        (id) => id === data.planId,
      ) ?? "base",
    terms: {},
    modules: {},
    order: [],
    fields: sanitizeFields(data.fields),
    zoneWords: {},
  };
  const terms = (data.terms ?? {}) as Record<string, Partial<TermForms>>;
  for (const key of Object.keys(termDefs) as TermKey[]) {
    const item = terms[key];
    if (
      item &&
      typeof item.singular === "string" &&
      typeof item.plural === "string"
    ) {
      config.terms[key] = {
        singular: item.singular.slice(0, 40),
        plural: item.plural.slice(0, 40),
      };
    }
  }
  const modules = (data.modules ?? {}) as Record<
    string,
    { hidden?: unknown; label?: unknown }
  >;
  for (const def of moduleDefs) {
    const item = modules[def.id];
    if (!item) continue;
    config.modules[def.id] = {
      hidden: item.hidden === true,
      label:
        typeof item.label === "string" ? item.label.slice(0, 40) : undefined,
    };
  }
  const words = (data.zoneWords ?? {}) as Record<string, unknown>;
  for (const sector of [
    "agriculture",
    "roads",
    "construction",
    "security",
    "mining",
  ] as const) {
    const word = words[sector];
    if (typeof word === "string" && word.trim()) {
      config.zoneWords = {
        ...config.zoneWords,
        [sector]: word.trim().slice(0, 30),
      };
    }
  }
  const order = Array.isArray(data.order) ? data.order : [];
  config.order = [
    ...order.filter((id): id is ModuleId =>
      moduleDefs.some((item) => item.id === id),
    ),
    ...moduleDefs.map((item) => item.id),
  ].filter((id, index, list) => list.indexOf(id) === index);
  return { ok: true, config };
}
