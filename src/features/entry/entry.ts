import type { Sector } from "../demo/types.ts";
import type { PresetId } from "../config/config.ts";

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
    example: { zone: "Lote 3", finding: "Falla de germinación" },
  },
  {
    id: "roads",
    label: "Vía o carretera",
    demoLabel: "una vía",
    preset: "carreteras",
    words: { zones: "Tramos", finding: "No conformidad", report: "Informe" },
    example: { zone: "Tramo PK 12+400", finding: "Drenaje obstruido" },
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
    example: { zone: "Torre A, nivel 4", finding: "Acero sin cubrir" },
  },
  {
    id: "security",
    label: "Predio o perímetro",
    demoLabel: "un predio",
    preset: "vigilancia",
    words: { zones: "Sectores", finding: "Novedad", report: "Informe" },
    example: { zone: "Sector norte", finding: "Cerramiento caído" },
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
    example: { zone: "Banco 2", finding: "Grieta en la cresta del talud" },
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
    const { choice, other, launch } = value as Record<string, unknown>;
    if (!sectorChoices.some((item) => item.id === choice)) return null;
    const entry: Entry = { choice: choice as ChoiceId };
    if (typeof other === "string" && other.trim()) {
      entry.other = other.trim().slice(0, MAX_OTHER);
    }
    if (launch === true) entry.launch = true;
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
  if (!entry) return "";
  if (entry.choice === "other") return entry.other ?? "";
  return choiceById(entry.choice).label;
}
