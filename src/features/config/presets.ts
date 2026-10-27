import type {
  CompanyConfig,
  ModuleId,
  PresetId,
  TermKey,
  TermForms,
} from "./config.ts";

export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  terms: Partial<Record<TermKey, TermForms>>;
  modules: Partial<Record<ModuleId, string>>;
}

/** Starting points by sector. They only fill in overrides; the company can change any of them. */
export const presets: Preset[] = [
  {
    id: "general",
    label: "General",
    description: "Los nombres de Otear, sin cambios.",
    terms: {},
    modules: {},
  },
  {
    id: "agricultura",
    label: "Agricultura",
    description: "Habla de cultivo y labores.",
    terms: {
      finding: { singular: "Hallazgo de campo", plural: "Hallazgos de campo" },
    },
    modules: { evolucion: "Evolución del cultivo" },
  },
  {
    id: "carreteras",
    label: "Carreteras e interventoría",
    description: "Habla de tramos, avance y no conformidades.",
    terms: {
      finding: { singular: "No conformidad", plural: "No conformidades" },
    },
    modules: {
      evolucion: "Avance por tramos",
      documentos: "Documentos del contrato",
    },
  },
  {
    id: "construccion",
    label: "Construcción",
    description: "Habla de frentes, niveles y observaciones de obra.",
    terms: {
      finding: { singular: "Observación", plural: "Observaciones" },
      report: { singular: "Informe de avance", plural: "Informes de avance" },
    },
    modules: { evolucion: "Avance de obra" },
  },
  {
    id: "vigilancia",
    label: "Vigilancia",
    description: "Habla de rondas y novedades.",
    terms: {
      finding: { singular: "Novedad", plural: "Novedades" },
      pilot: { singular: "Operador de dron", plural: "Operadores de dron" },
    },
    modules: {
      evolucion: "Novedades en el tiempo",
      vuelos: "Rondas y evidencias",
    },
  },
];

/** Replaces the company's vocabulary and module names with the preset's; brand and licence stay. */
export function applyPreset(
  config: CompanyConfig,
  id: PresetId,
): CompanyConfig {
  const preset = presets.find((item) => item.id === id) ?? presets[0];
  const modules: CompanyConfig["modules"] = {};
  for (const [key, label] of Object.entries(preset.modules) as [
    ModuleId,
    string,
  ][]) {
    modules[key] = { label, hidden: config.modules[key]?.hidden };
  }
  for (const [key, value] of Object.entries(config.modules) as [
    ModuleId,
    { hidden?: boolean },
  ][]) {
    if (value.hidden && !modules[key]) modules[key] = { hidden: true };
  }
  return { ...config, presetId: id, terms: { ...preset.terms }, modules };
}
