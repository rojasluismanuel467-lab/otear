"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import {
  displayValue,
  fieldsFor,
  isEmpty,
  missingRequired,
  parseInput,
  type CustomValues,
  type FieldTarget,
} from "./custom-fields";
import { can } from "./licence";
import { useConfig } from "./use-config";
import styles from "./custom-fields-panel.module.css";

/**
 * The company's own fields on one record. It renders nothing when the plan does not include
 * custom fields or the company has defined none for this kind of record.
 */
export function CustomFieldsPanel({
  target,
  values,
  onChange,
  title = "Campos de la empresa",
}: {
  target: FieldTarget;
  values?: CustomValues;
  onChange: (next: CustomValues) => void;
  title?: string;
}) {
  const { config } = useConfig();
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!can(config.planId, "customFields")) return null;
  const fields = fieldsFor(config.fields, target);
  if (!fields.length) return null;
  const missing = missingRequired(fields, values);

  function commit(fieldId: string, raw: string) {
    const field = fields.find((item) => item.id === fieldId)!;
    const result = parseInput(field, raw);
    if (!result.ok)
      return setErrors((current) => ({ ...current, [fieldId]: result.error }));
    setErrors((current) => {
      const { [fieldId]: _removed, ...rest } = current;
      void _removed;
      return rest;
    });
    const next = { ...(values ?? {}) };
    if (result.value === null) delete next[fieldId];
    else next[fieldId] = result.value;
    onChange(next);
  }

  return (
    <section className={styles.panel} aria-label={title}>
      <header>
        <h3>
          <SlidersHorizontal size={17} aria-hidden="true" />
          {title}
        </h3>
        {missing.length > 0 && (
          <span className={styles.missing}>
            {missing.length === 1
              ? "Falta 1 dato obligatorio"
              : `Faltan ${missing.length} datos obligatorios`}
          </span>
        )}
      </header>
      <div className={styles.grid}>
        {fields.map((field) => {
          const value = values?.[field.id];
          const id = `cf-${field.id}`;
          const error = errors[field.id];
          const shared = {
            id,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": `${id}-help`,
          } as const;
          return (
            <div
              key={field.id}
              className={styles.field}
              data-wide={field.type === "paragraph" ? "true" : undefined}
            >
              <label htmlFor={id}>
                {field.title}
                {field.required && <abbr title="Obligatorio">*</abbr>}
              </label>
              {field.type === "paragraph" ? (
                <textarea
                  {...shared}
                  className="field-input"
                  rows={3}
                  defaultValue={isEmpty(value) ? "" : String(value)}
                  onBlur={(event) => commit(field.id, event.target.value)}
                />
              ) : field.type === "list" ? (
                <select
                  {...shared}
                  className="field-select"
                  value={isEmpty(value) ? "" : String(value)}
                  onChange={(event) => commit(field.id, event.target.value)}
                >
                  <option value="">Sin elegir</option>
                  {field.options?.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                  {!isEmpty(value) &&
                    !field.options?.some((option) => option.id === value) && (
                      <option value={String(value)}>
                        {displayValue(field, value)}
                      </option>
                    )}
                </select>
              ) : (
                <div className={styles.inputRow}>
                  <input
                    {...shared}
                    className="field-input"
                    type={field.type === "date" ? "date" : "text"}
                    inputMode={field.type === "number" ? "decimal" : undefined}
                    defaultValue={
                      isEmpty(value)
                        ? ""
                        : String(value).replace(
                            ".",
                            field.type === "number" ? "," : ".",
                          )
                    }
                    onBlur={(event) => commit(field.id, event.target.value)}
                  />
                  {field.type === "number" && field.unit && (
                    <span>{field.unit}</span>
                  )}
                </div>
              )}
              <small id={`${id}-help`} data-error={error ? "true" : undefined}>
                {error || field.description}
              </small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
