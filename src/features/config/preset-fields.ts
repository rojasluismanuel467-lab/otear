import type { CustomField } from "./custom-fields.ts";

/**
 * Custom fields that a vocabulary preset brings with it. They are applied to flights, not to
 * zones: the product's records that accept company fields are flight, finding, aircraft and
 * invoice, and the age and cutting state of a lot are read at the moment a flight covers it.
 * Ids are fixed so applying the preset twice adds nothing and the example values in the seed
 * data find their field.
 */

export const PRESET_FIELD_PREFIX = "preset-";

export const CANA_AGE_FIELD = "preset-cana-edad";
export const CANA_CUT_FIELD = "preset-cana-corte";

export const CANA_CUT_OPTIONS = {
  toCut: "preset-cana-corte-por-cortar",
  cutting: "preset-cana-corte-en-corte",
  cut: "preset-cana-corte-cortada",
  ratoon: "preset-cana-corte-en-soca",
} as const;

export const canaFields: CustomField[] = [
  {
    id: CANA_AGE_FIELD,
    target: "flight",
    type: "number",
    title: "Edad del cultivo (meses)",
    description:
      "Edad promedio de la caña en los lotes del vuelo. Los valores de los vuelos de la hacienda son de ejemplo.",
  },
  {
    id: CANA_CUT_FIELD,
    target: "flight",
    type: "list",
    title: "Estado de corte",
    description:
      "Cómo estaban los lotes al volar. Los valores de los vuelos de la hacienda son de ejemplo.",
    options: [
      { id: CANA_CUT_OPTIONS.toCut, label: "Por cortar" },
      { id: CANA_CUT_OPTIONS.cutting, label: "En corte" },
      { id: CANA_CUT_OPTIONS.cut, label: "Cortada" },
      { id: CANA_CUT_OPTIONS.ratoon, label: "En soca" },
    ],
  },
];

const MONTH_MS = 30.4 * 24 * 60 * 60 * 1000;
const EXAMPLE_START = "2026-07-18";

/**
 * Example values for the flights of the agriculture site: about seven months old on the first
 * flight of the history and one more month for each month that passes; the last flights are
 * already at cutting age. Invented to show the fields, never a record of a real crop.
 */
export function canaExampleValues(date: string) {
  const months = Math.max(
    0,
    Math.round((Date.parse(date) - Date.parse(EXAMPLE_START)) / MONTH_MS),
  );
  const age = 7 + months;
  return {
    [CANA_AGE_FIELD]: age,
    [CANA_CUT_FIELD]:
      age >= 11 ? CANA_CUT_OPTIONS.cutting : CANA_CUT_OPTIONS.toCut,
  };
}
