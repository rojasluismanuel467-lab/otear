import type { Sector } from "../demo/types";
import type {
  CompanyConfig,
  ModuleId,
  PresetId,
  TermKey,
  TermForms,
} from "./config.ts";
import { applyPresetFields, type CustomField } from "./custom-fields.ts";
import { canaFields } from "./preset-fields.ts";

export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  terms: Partial<Record<TermKey, TermForms>>;
  modules: Partial<Record<ModuleId, string>>;
  /** Word for the zones of a sector, in plural. */
  zoneWords?: Partial<Record<Sector, string>>;
  /** Company fields the preset adds (see `preset-fields.ts`). */
  fields?: CustomField[];
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
    id: "cana",
    label: "Caña de azúcar (ingenio o cañicultor)",
    description:
      "Habla de suertes, haciendas, zafra y novedades de campo. Añade a cada vuelo los campos «Edad del cultivo» y «Estado de corte».",
    terms: {
      finding: { singular: "Novedad de campo", plural: "Novedades de campo" },
      operator: { singular: "Aplicador", plural: "Aplicadores" },
      manager: { singular: "Ingenio", plural: "Ingenios" },
      owner: { singular: "Cañicultor", plural: "Cañicultores" },
    },
    modules: { evolucion: "Evolución del cultivo" },
    zoneWords: { agriculture: "Suertes" },
    fields: canaFields,
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
  {
    id: "mineria",
    label: "Minería a cielo abierto",
    description:
      "Habla de bancos, avance de la excavación y novedades de talud.",
    terms: {
      finding: { singular: "Novedad de talud", plural: "Novedades de talud" },
      report: { singular: "Informe de avance", plural: "Informes de avance" },
    },
    modules: { evolucion: "Avance de la excavación" },
    zoneWords: { mining: "Bancos" },
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
  return {
    ...config,
    presetId: id,
    terms: { ...preset.terms },
    modules,
    zoneWords: { ...preset.zoneWords },
    fields: applyPresetFields(config.fields, preset.fields ?? []),
  };
}
