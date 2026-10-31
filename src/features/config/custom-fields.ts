/**
 * Company-defined fields on the product's own records. The rules follow what Autodesk
 * documents for issue custom fields: a field has a title, a type and an optional description;
 * the type cannot change afterwards, only the title and description can; a field in use
 * cannot be deleted (it is archived instead); and the number of fields is capped.
 */

import { PRESET_FIELD_PREFIX } from "./preset-fields.ts";

export type FieldTarget = "flight" | "finding" | "aircraft" | "invoice";
export type FieldType = "text" | "paragraph" | "number" | "list" | "date";

export interface FieldOption {
  id: string;
  label: string;
}

export interface CustomField {
  id: string;
  target: FieldTarget;
  type: FieldType;
  title: string;
  description: string;
  /** Choices for a list field. */
  options?: FieldOption[];
  /** Unit written after a number, for example «m» or «COP». */
  unit?: string;
  required?: boolean;
  /** Hidden from forms but its stored values are kept. */
  archived?: boolean;
}

export type FieldValue = string | number;
export type CustomValues = Record<string, FieldValue>;

export const MAX_FIELDS_PER_TARGET = 15;
export const MAX_TITLE = 60;
export const MAX_OPTIONS = 30;

export const targetLabels: Record<
  FieldTarget,
  { singular: string; hint: string }
> = {
  flight: { singular: "Vuelo", hint: "Aparece en el resumen de cada vuelo." },
  finding: {
    singular: "Hallazgo",
    hint: "Aparece en el detalle de cada hallazgo.",
  },
  aircraft: {
    singular: "Aeronave",
    hint: "Aparece en Papeles y costos de cada aeronave.",
  },
  invoice: {
    singular: "Pago o factura",
    hint: "Aparece en el detalle de cada cobro.",
  },
};

export const typeLabels: Record<FieldType, string> = {
  text: "Texto corto",
  paragraph: "Párrafo",
  number: "Número",
  list: "Lista de opciones",
  date: "Fecha",
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ");

export const fieldsFor = (
  fields: CustomField[],
  target: FieldTarget,
  includeArchived = false,
) =>
  fields.filter(
    (field) => field.target === target && (includeArchived || !field.archived),
  );

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

let counter = 0;
export function newId(prefix: string) {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export function createField(
  fields: CustomField[],
  input: {
    target: FieldTarget;
    type: FieldType;
    title: string;
    description?: string;
    unit?: string;
    options?: string[];
    required?: boolean;
  },
): Result<CustomField> {
  const title = clean(input.title);
  if (!title) return { ok: false, error: "El campo necesita un título." };
  if (title.length > MAX_TITLE)
    return {
      ok: false,
      error: `El título no puede pasar de ${MAX_TITLE} caracteres.`,
    };
  const existing = fieldsFor(fields, input.target, true);
  if (existing.length >= MAX_FIELDS_PER_TARGET) {
    return {
      ok: false,
      error: `Ya hay ${MAX_FIELDS_PER_TARGET} campos para ${targetLabels[input.target].singular.toLowerCase()}. Archive uno para crear otro.`,
    };
  }
  if (
    existing.some(
      (field) =>
        !field.archived && field.title.toLowerCase() === title.toLowerCase(),
    )
  ) {
    return { ok: false, error: "Ya existe un campo con ese título." };
  }
  let options: FieldOption[] | undefined;
  if (input.type === "list") {
    const labels = [
      ...new Set((input.options ?? []).map(clean).filter(Boolean)),
    ].slice(0, MAX_OPTIONS);
    if (labels.length < 2)
      return { ok: false, error: "Una lista necesita al menos dos opciones." };
    options = labels.map((label) => ({ id: newId("opt"), label }));
  }
  return {
    ok: true,
    value: {
      id: newId("field"),
      target: input.target,
      type: input.type,
      title,
      description: clean(input.description ?? "").slice(0, 200),
      unit:
        input.type === "number"
          ? clean(input.unit ?? "").slice(0, 12) || undefined
          : undefined,
      options,
      required: input.required || undefined,
    },
  };
}

/** Only title, description, unit and the "required" flag can change after creation; never the type. */
export function editField(
  fields: CustomField[],
  id: string,
  change: {
    title?: string;
    description?: string;
    unit?: string;
    required?: boolean;
  },
): Result<CustomField[]> {
  const field = fields.find((item) => item.id === id);
  if (!field) return { ok: false, error: "No existe ese campo." };
  const title = change.title === undefined ? field.title : clean(change.title);
  if (!title) return { ok: false, error: "El campo necesita un título." };
  if (title.length > MAX_TITLE)
    return {
      ok: false,
      error: `El título no puede pasar de ${MAX_TITLE} caracteres.`,
    };
  if (
    fieldsFor(fields, field.target).some(
      (item) =>
        item.id !== id && item.title.toLowerCase() === title.toLowerCase(),
    )
  ) {
    return { ok: false, error: "Ya existe un campo con ese título." };
  }
  return {
    ok: true,
    value: fields.map((item) =>
      item.id === id
        ? {
            ...item,
            title,
            description:
              change.description === undefined
                ? item.description
                : clean(change.description).slice(0, 200),
            unit:
              item.type === "number" && change.unit !== undefined
                ? clean(change.unit).slice(0, 12) || undefined
                : item.unit,
            required:
              change.required === undefined
                ? item.required
                : change.required || undefined,
          }
        : item,
    ),
  };
}

/** Options can be added or renamed any time; one can be removed only if no record uses it. */
export function editOptions(
  fields: CustomField[],
  id: string,
  options: FieldOption[],
  usedOptionIds: Set<string>,
): Result<CustomField[]> {
  const field = fields.find((item) => item.id === id);
  if (!field || field.type !== "list")
    return { ok: false, error: "Ese campo no es una lista." };
  const kept = options
    .map((option) => ({ ...option, label: clean(option.label) }))
    .filter((option) => option.label);
  if (kept.length < 2)
    return { ok: false, error: "Una lista necesita al menos dos opciones." };
  if (kept.length > MAX_OPTIONS)
    return {
      ok: false,
      error: `Una lista admite hasta ${MAX_OPTIONS} opciones.`,
    };
  const removedInUse = (field.options ?? []).find(
    (old) =>
      usedOptionIds.has(old.id) && !kept.some((option) => option.id === old.id),
  );
  if (removedInUse)
    return {
      ok: false,
      error: `«${removedInUse.label}» está en uso; renómbrela en vez de quitarla.`,
    };
  return {
    ok: true,
    value: fields.map((item) =>
      item.id === id ? { ...item, options: kept } : item,
    ),
  };
}

export const isEmpty = (value: FieldValue | undefined) =>
  value === undefined ||
  value === "" ||
  (typeof value === "number" && Number.isNaN(value));

/** Records of a kind that hold a value for the field. */
export function usageCount(
  field: CustomField,
  records: { customValues?: CustomValues }[],
) {
  return records.filter((record) => !isEmpty(record.customValues?.[field.id]))
    .length;
}

export function usedOptions(
  field: CustomField,
  records: { customValues?: CustomValues }[],
) {
  return new Set(
    records.flatMap((record) => {
      const value = record.customValues?.[field.id];
      return typeof value === "string" && value ? [value] : [];
    }),
  );
}

/** A field in use cannot be deleted; it is archived. */
export function removeOrArchive(
  fields: CustomField[],
  id: string,
  inUse: number,
): { fields: CustomField[]; outcome: "deleted" | "archived" } {
  if (inUse === 0)
    return {
      fields: fields.filter((field) => field.id !== id),
      outcome: "deleted",
    };
  return {
    fields: fields.map((field) =>
      field.id === id ? { ...field, archived: true } : field,
    ),
    outcome: "archived",
  };
}

export function restoreField(
  fields: CustomField[],
  id: string,
): Result<CustomField[]> {
  const field = fields.find((item) => item.id === id);
  if (!field) return { ok: false, error: "No existe ese campo." };
  const active = fieldsFor(fields, field.target);
  if (active.length >= MAX_FIELDS_PER_TARGET)
    return {
      ok: false,
      error: `Ya hay ${MAX_FIELDS_PER_TARGET} campos activos.`,
    };
  if (
    active.some(
      (item) => item.title.toLowerCase() === field.title.toLowerCase(),
    )
  )
    return { ok: false, error: "Ya hay otro campo activo con ese título." };
  return {
    ok: true,
    value: fields.map((item) =>
      item.id === id ? { ...item, archived: undefined } : item,
    ),
  };
}

/**
 * Fields that come with a vocabulary preset. Applying a preset adds its fields (or brings back
 * the archived ones), and the fields of any other preset are archived, never deleted, so the
 * values already stored are kept. A field the company created itself is never touched, and a
 * preset field that would break the per-record cap or repeat an active title is skipped.
 */
export function applyPresetFields(
  fields: CustomField[],
  presetFields: CustomField[],
): CustomField[] {
  const wanted = new Set(presetFields.map((field) => field.id));
  let next = fields.map((field) =>
    field.id.startsWith(PRESET_FIELD_PREFIX) &&
    !wanted.has(field.id) &&
    !field.archived
      ? { ...field, archived: true }
      : field,
  );
  for (const field of presetFields) {
    const current = next.find((item) => item.id === field.id);
    if (current) {
      if (current.archived) {
        const restored = restoreField(next, field.id);
        if (restored.ok) next = restored.value;
      }
      continue;
    }
    const active = fieldsFor(next, field.target);
    const clash = active.some(
      (item) => item.title.toLowerCase() === field.title.toLowerCase(),
    );
    if (
      clash ||
      fieldsFor(next, field.target, true).length >= MAX_FIELDS_PER_TARGET
    )
      continue;
    next = [...next, field];
  }
  return next;
}

/** Reads what a person typed into the control of a field; null means "clear the value". */
export function parseInput(
  field: CustomField,
  raw: string,
): Result<FieldValue | null> {
  const text = raw.trim();
  if (!text) return { ok: true, value: null };
  if (field.type === "number") {
    const value = Number(text.replace(",", "."));
    if (!Number.isFinite(value))
      return { ok: false, error: "Escriba un número." };
    return { ok: true, value };
  }
  if (field.type === "list") {
    return field.options?.some((option) => option.id === text)
      ? { ok: true, value: text }
      : { ok: false, error: "Elija una de las opciones." };
  }
  if (field.type === "date") {
    return /^\d{4}-\d{2}-\d{2}$/.test(text) &&
      !Number.isNaN(Date.parse(`${text}T12:00:00`))
      ? { ok: true, value: text }
      : { ok: false, error: "Escriba una fecha válida." };
  }
  return {
    ok: true,
    value: text.slice(0, field.type === "paragraph" ? 2000 : 200),
  };
}

/** Text for a stored value, for exports and read-only views. */
export function displayValue(
  field: CustomField,
  value: FieldValue | undefined,
) {
  if (isEmpty(value)) return "";
  if (field.type === "list")
    return (
      field.options?.find((option) => option.id === value)?.label ??
      "Opción retirada"
    );
  if (field.type === "number") {
    const formatted = new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 4,
    }).format(Number(value));
    return field.unit ? `${formatted} ${field.unit}` : formatted;
  }
  return String(value);
}

/** Required fields without a value on a record. */
export function missingRequired(
  fields: CustomField[],
  values: CustomValues | undefined,
) {
  return fields.filter(
    (field) => field.required && isEmpty(values?.[field.id]),
  );
}

/** Cleans a list of fields read from an imported file. */
export function sanitizeFields(raw: unknown): CustomField[] {
  if (!Array.isArray(raw)) return [];
  const targets: FieldTarget[] = ["flight", "finding", "aircraft", "invoice"];
  const types: FieldType[] = ["text", "paragraph", "number", "list", "date"];
  const out: CustomField[] = [];
  const counts: Record<string, number> = {};
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const data = item as Record<string, unknown>;
    const target = targets.find((value) => value === data.target);
    const type = types.find((value) => value === data.type);
    const id =
      typeof data.id === "string" && /^[\w-]{1,60}$/.test(data.id)
        ? data.id
        : null;
    const title =
      typeof data.title === "string"
        ? clean(data.title).slice(0, MAX_TITLE)
        : "";
    if (!target || !type || !id || !title || seen.has(id)) continue;
    if ((counts[target] ?? 0) >= MAX_FIELDS_PER_TARGET) continue;
    let options: FieldOption[] | undefined;
    if (type === "list") {
      const list = Array.isArray(data.options) ? data.options : [];
      options = list
        .flatMap((option) => {
          const o = option as Record<string, unknown>;
          return typeof o?.id === "string" &&
            /^[\w-]{1,60}$/.test(o.id) &&
            typeof o.label === "string" &&
            clean(o.label)
            ? [{ id: o.id, label: clean(o.label).slice(0, 60) }]
            : [];
        })
        .slice(0, MAX_OPTIONS);
      if (options.length < 2) continue;
    }
    seen.add(id);
    counts[target] = (counts[target] ?? 0) + 1;
    out.push({
      id,
      target,
      type,
      title,
      description:
        typeof data.description === "string"
          ? clean(data.description).slice(0, 200)
          : "",
      options,
      unit:
        type === "number" && typeof data.unit === "string"
          ? clean(data.unit).slice(0, 12) || undefined
          : undefined,
      required: data.required === true || undefined,
      archived: data.archived === true || undefined,
    });
  }
  return out;
}
