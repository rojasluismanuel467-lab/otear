import type { Sector } from "../demo/types.ts";
import { moduleDefs, type ModuleId, type PresetId } from "../config/config.ts";
import { presets } from "../config/presets.ts";

export type ChoiceId = Sector | "other";

export interface SectorChoice {
  id: ChoiceId;
  /** Short name shown on the chip. */
  label: string;
  /** What the visitor opens: «la demo de {demoLabel}». */
  demoLabel: string;
  preset: PresetId;
  /** Words the demo will use once it opens with this sector. */
  words: { zones: string; finding: string; report: string };
  /** An illustrative item, never presented as real data. */
  example: { zone: string; finding: string };
}

export const sectorChoices: SectorChoice[] = [
  {
    id: "agriculture",
    label: "Finca o cultivo",
    demoLabel: "una finca",
    preset: "agricultura",
    words: { zones: "Lotes", finding: "Hallazgo de campo", report: "Informe" },
    example: { zone: "Lote 4", finding: "Cobertura irregular" },
  },
  {
    id: "roads",
    label: "Vía o carretera",
    demoLabel: "una vía",
    preset: "carreteras",
    words: { zones: "Tramos", finding: "No conformidad", report: "Informe" },
    example: { zone: "PK 12+000 – 12+400", finding: "Deterioro superficial" },
  },
  {
    id: "construction",
    label: "Obra",
    demoLabel: "una obra",
    preset: "construccion",
    words: {
      zones: "Frentes",
      finding: "Observación",
      report: "Informe de avance",
    },
    example: { zone: "Frente norte", finding: "Material por retirar" },
  },
  {
    id: "security",
    label: "Predio o perímetro",
    demoLabel: "un predio",
    preset: "vigilancia",
    words: { zones: "Sectores", finding: "Novedad", report: "Informe" },
    example: { zone: "Sector occidental", finding: "Cerramiento por revisar" },
  },
  {
    id: "mining",
    label: "Mina a cielo abierto",
    demoLabel: "una mina",
    preset: "mineria",
    words: {
      zones: "Bancos",
      finding: "Novedad de talud",
      report: "Informe de avance",
    },
    example: { zone: "Banco norte", finding: "Grieta en la cresta del talud" },
  },
  {
    id: "other",
    label: "Otro sector",
    demoLabel: "su operación",
    preset: "general",
    words: { zones: "Zonas", finding: "Hallazgo", report: "Informe" },
    example: { zone: "Zona 1", finding: "Hallazgo" },
  },
];

/** What the visitor told us. `launch` asks the demo to open with it, once. */
export interface Entry {
  choice: ChoiceId;
  /** Free text when the choice is «other». */
  other?: string;
  launch?: boolean;
  /**
   * The demo was already opened with this choice, so the sector's words are saved
   * in the browser: after a reload the demo goes back to that sector's example.
   */
  opened?: boolean;
  /** Opened from a button without picking a sector: nothing was chosen. */
  unchosen?: boolean;
  /** Open the demo seen as the drone operator (Servicios). */
  viewAs?: "operator";
}

export const ENTRY_KEY = "otear.entry";
export const MAX_OTHER = 60;

export function choiceById(id: ChoiceId): SectorChoice {
  return sectorChoices.find((item) => item.id === id) ?? sectorChoices[0];
}

/** Stored values come from the browser: accept only what we wrote. */
export function parseEntry(raw: string | null): Entry | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { choice, other, launch, opened, unchosen, viewAs } = value as Record<
      string,
      unknown
    >;
    if (!sectorChoices.some((item) => item.id === choice)) return null;
    const entry: Entry = { choice: choice as ChoiceId };
    if (typeof other === "string" && other.trim()) {
      entry.other = other.trim().slice(0, MAX_OTHER);
    }
    if (launch === true) entry.launch = true;
    if (opened === true) entry.opened = true;
    if (unchosen === true) entry.unchosen = true;
    if (viewAs === "operator") entry.viewAs = "operator";
    return entry;
  } catch {
    return null;
  }
}

export function serializeEntry(entry: Entry): string {
  return JSON.stringify(entry);
}

/** Text for the contact form's sector field. */
export function entryLabel(entry: Entry | null): string {
  if (!entry || entry.unchosen) return "";
  if (entry.choice === "other") return entry.other ?? "";
  return choiceById(entry.choice).label;
}

/** Every welcome message starts with this, so the invite does not count it as something the visitor did. */
export const WELCOME_NOTICE = "Bienvenido";

/** Name of a screen as this sector's preset calls it in the menu. */
function screenName(preset: PresetId, id: ModuleId): string {
  return (
    presets.find((item) => item.id === preset)?.modules[id] ??
    moduleDefs.find((item) => item.id === id)?.label ??
    id
  );
}

function routeOf(id: ModuleId): string {
  return moduleDefs.find((item) => item.id === id)?.href ?? "/programacion";
}

interface FirstScreen {
  module: ModuleId;
  /** Why to start there, in the sector's own question. */
  because: string;
  next: { module: ModuleId; because: string };
}

/**
 * The screen that answers each sector's main question. Opening on the pilot's
 * schedule hid the value behind several clicks.
 */
const firstScreens: Record<ChoiceId, FirstScreen> = {
  agriculture: {
    module: "evolucion",
    because: "ahí ve qué lote va peor entre un vuelo y otro",
    next: {
      module: "pagos",
      because:
        "para revisar lo pedido, lo cubierto y lo facturado antes de pagar",
    },
  },
  roads: {
    module: "vuelos",
    because: "ahí están la última visita y lo que marcó cada vuelo",
    next: {
      module: "evolucion",
      because: "para ver el avance de cada tramo en el tiempo",
    },
  },
  construction: {
    module: "evolucion",
    because: "ahí compara el avance de cada frente con lo planeado",
    next: {
      module: "vuelos",
      because: "para abrir un vuelo y revisar sus observaciones",
    },
  },
  security: {
    module: "vuelos",
    because: "ahí están la última ronda y sus novedades",
    next: {
      module: "evolucion",
      because: "para comparar una ronda con la anterior",
    },
  },
  mining: {
    module: "evolucion",
    because: "ahí compara el avance de cada banco con el plan",
    next: {
      module: "vuelos",
      because: "para revisar las novedades de talud de un vuelo",
    },
  },
  other: {
    module: "evolucion",
    because: "ahí compara cada zona con su vuelo anterior",
    next: {
      module: "vuelos",
      because: "para abrir un vuelo y revisar lo que se encontró",
    },
  },
};

export interface DemoStart {
  /** Where the demo opens. */
  route: string;
  /** Welcome notice; it stays until the visitor closes it. */
  notice: string;
  /** Preset to apply, or null to leave the words as they are. */
  preset: PresetId | null;
  /** Example project to select, or null to keep the one it starts with. */
  sector: Sector | null;
  /** Word for the zones of a sector, in plural, when it differs from the preset's. */
  zoneWords?: Partial<Record<Sector, string>>;
}

const GUIDE = "La «Guía de la demo», abajo a la izquierda, explica el resto.";

/**
 * What «Abrir la demo» does for each visitor: it opens the screen that answers
 * their main question and says where to look. With nothing chosen it keeps the
 * default example (a farm) and the product's own words.
 */
export function demoStart(entry: Entry | null): DemoStart {
  if (entry?.viewAs === "operator") {
    const choice = entry.unchosen ? null : choiceById(entry.choice);
    return {
      route: routeOf("servicios"),
      preset: choice?.preset ?? null,
      zoneWords: choice?.id === "other" ? { agriculture: "Zonas" } : undefined,
      sector: choice && choice.id !== "other" ? choice.id : null,
      notice: `${WELCOME_NOTICE}. Ve la demo como la vería un operador de dron: los pedidos que recibe con sus zonas, la ventana y el tope de precio, y lo que cotiza, entrega y factura. Son datos de ejemplo. ${GUIDE}`,
    };
  }

  if (!entry || entry.unchosen) {
    const first = firstScreens.agriculture;
    return {
      route: routeOf(first.module),
      preset: null,
      sector: null,
      notice: `${WELCOME_NOTICE} a la demo. Son datos de ejemplo de una hacienda; nada es real. Empiece por «${screenName("general", first.module)}»: ${first.because}. Luego «${screenName("general", first.next.module)}», ${first.next.because}. ${GUIDE}`,
    };
  }

  const choice = choiceById(entry.choice);
  const first = firstScreens[choice.id];
  const words =
    choice.id === "other"
      ? `Eligió ${entry.other ? `«${entry.other}»` : "otro sector"}: no hay un proyecto de ejemplo de ese sector. Verá una hacienda con nombres generales («zonas», «hallazgos»); los datos son de cultivo. En Configuración cambia las palabras.`
      : `Eligió ${choice.label.toLowerCase()}: ya ve «${choice.words.zones.toLowerCase()}» y «${choice.words.finding.toLowerCase()}» como en su sector.`;
  return {
    route: routeOf(first.module),
    preset: choice.preset,
    // The example behind «other» is the farm: its zones take the general word.
    zoneWords: choice.id === "other" ? { agriculture: "Zonas" } : undefined,
    sector: choice.id === "other" ? null : choice.id,
    notice: `${WELCOME_NOTICE}. ${words} Empiece por «${screenName(choice.preset, first.module)}»: ${first.because}. Luego «${screenName(choice.preset, first.next.module)}», ${first.next.because}. ${GUIDE}`,
  };
}

/**
 * The entry saved when the visitor presses a button that opens the demo: their
 * choice if they made one, otherwise nothing chosen (the default example).
 */
export function launchEntry(current: Entry | null, viewAs?: "operator"): Entry {
  const base: Entry =
    current && !current.unchosen
      ? { ...current }
      : { choice: "agriculture", unchosen: true };
  delete base.viewAs;
  return { ...base, launch: true, ...(viewAs ? { viewAs } : {}) };
}

/**
 * After a reload the sector's words are still saved in the browser but the data
 * starts again on the first example. If the demo had been opened with a sector,
 * this returns the sector whose example project should be selected again so words
 * and data agree. Null when there is nothing to restore.
 */
export function sectorToRestore(entry: Entry | null): Sector | null {
  if (!entry || entry.launch || !entry.opened || entry.unchosen) return null;
  return entry.choice === "other" ? null : entry.choice;
}
