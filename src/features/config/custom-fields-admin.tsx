"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import {
  Archive,
  ArchiveRestore,
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useDemo } from "@/features/demo/demo-context";
import {
  MAX_FIELDS_PER_TARGET,
  createField,
  editField,
  editOptions,
  fieldsFor,
  newId,
  removeOrArchive,
  restoreField,
  targetLabels,
  typeLabels,
  usageCount,
  usedOptions,
  type CustomField,
  type FieldTarget,
  type FieldType,
} from "./custom-fields";
import { useConfig } from "./use-config";
import styles from "./custom-fields-admin.module.css";

const targets = Object.keys(targetLabels) as FieldTarget[];
const types = Object.keys(typeLabels) as FieldType[];

interface Draft {
  type: FieldType;
  title: string;
  description: string;
  unit: string;
  options: string;
  required: boolean;
}
const emptyDraft: Draft = {
  type: "text",
  title: "",
  description: "",
  unit: "",
  options: "",
  required: false,
};

/** Where the administrator creates, renames and archives the company's own fields. */
export function CustomFieldsAdmin({
  onMessage,
}: {
  onMessage: (message: { tone: "ok" | "error"; text: string }) => void;
}) {
  const { config, setFields } = useConfig();
  const { allRecords } = useDemo();
  const [target, setTarget] = useState<FieldTarget>("flight");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [edit, setEdit] = useState({
    title: "",
    description: "",
    unit: "",
    required: false,
    options: "",
  });

  const all = fieldsFor(config.fields, target, true);
  const active = all.filter((field) => !field.archived);
  const archived = all.filter((field) => field.archived);
  const records = allRecords[target];

  function create() {
    const result = createField(config.fields, {
      target,
      type: draft.type,
      title: draft.title,
      description: draft.description,
      unit: draft.unit,
      options: draft.options.split("\n"),
      required: draft.required,
    });
    if (!result.ok) return onMessage({ tone: "error", text: result.error });
    setFields([...config.fields, result.value]);
    setDraft(emptyDraft);
    setCreating(false);
    onMessage({
      tone: "ok",
      text: `Campo «${result.value.title}» creado. Ya aparece en cada ${targetLabels[target].singular.toLowerCase()}.`,
    });
  }

  function startEdit(field: CustomField) {
    setEditing(field.id);
    setEdit({
      title: field.title,
      description: field.description,
      unit: field.unit ?? "",
      required: Boolean(field.required),
      options: (field.options ?? []).map((option) => option.label).join("\n"),
    });
  }

  function saveEdit(field: CustomField) {
    let next = editField(config.fields, field.id, {
      title: edit.title,
      description: edit.description,
      unit: edit.unit,
      required: edit.required,
    });
    if (!next.ok) return onMessage({ tone: "error", text: next.error });
    if (field.type === "list") {
      // Lines keep their option when the text at that position is the same or was renamed in place.
      const lines = edit.options
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const old = field.options ?? [];
      const options = lines.map((label, index) => ({
        id: old[index]?.id ?? newId("opt"),
        label,
      }));
      const optionResult = editOptions(
        next.value,
        field.id,
        options,
        usedOptions(field, records),
      );
      if (!optionResult.ok)
        return onMessage({ tone: "error", text: optionResult.error });
      next = optionResult;
    }
    setFields(next.value);
    setEditing(null);
    onMessage({ tone: "ok", text: "Cambios guardados." });
  }

  function remove(field: CustomField) {
    const inUse = usageCount(field, records);
    const result = removeOrArchive(config.fields, field.id, inUse);
    setFields(result.fields);
    onMessage({
      tone: "ok",
      text:
        result.outcome === "deleted"
          ? `Campo «${field.title}» eliminado.`
          : `«${field.title}» tiene datos en ${inUse} ${inUse === 1 ? "registro" : "registros"}; se archivó y sus datos se conservan.`,
    });
  }

  function restore(field: CustomField) {
    const result = restoreField(config.fields, field.id);
    if (!result.ok) return onMessage({ tone: "error", text: result.error });
    setFields(result.value);
    onMessage({ tone: "ok", text: `«${field.title}» volvió a estar activo.` });
  }

  return (
    <div className={styles.admin}>
      <div
        className={styles.targets}
        role="group"
        aria-label="A qué registro se agrega el campo"
      >
        {targets.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === target}
            onClick={() => {
              setTarget(item);
              setCreating(false);
              setEditing(null);
            }}
          >
            {targetLabels[item].singular}
            <small>{fieldsFor(config.fields, item).length}</small>
          </button>
        ))}
      </div>
      <p className={styles.hint}>
        {targetLabels[target].hint} Hasta {MAX_FIELDS_PER_TARGET} campos. El
        tipo no se puede cambiar después de crear el campo, para no romper los
        datos ya escritos; sí el título y la descripción.
      </p>

      {active.length === 0 && !creating && (
        <p className={styles.empty}>
          Todavía no hay campos para este registro.
        </p>
      )}
      <ul className={styles.list}>
        {active.map((field) => {
          const inUse = usageCount(field, records);
          return (
            <li key={field.id}>
              {editing === field.id ? (
                <form
                  className={styles.form}
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveEdit(field);
                  }}
                >
                  <label>
                    <span>Título</span>
                    <input
                      className="field-input"
                      value={edit.title}
                      maxLength={60}
                      onChange={(event) =>
                        setEdit({ ...edit, title: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span>Descripción (ayuda bajo el campo)</span>
                    <input
                      className="field-input"
                      value={edit.description}
                      maxLength={200}
                      onChange={(event) =>
                        setEdit({ ...edit, description: event.target.value })
                      }
                    />
                  </label>
                  {field.type === "number" && (
                    <label>
                      <span>Unidad</span>
                      <input
                        className="field-input"
                        value={edit.unit}
                        maxLength={12}
                        onChange={(event) =>
                          setEdit({ ...edit, unit: event.target.value })
                        }
                      />
                    </label>
                  )}
                  {field.type === "list" && (
                    <label>
                      <span>Opciones, una por línea</span>
                      <textarea
                        className="field-input"
                        rows={5}
                        value={edit.options}
                        onChange={(event) =>
                          setEdit({ ...edit, options: event.target.value })
                        }
                      />
                      <small>
                        Cambie el texto de una línea para renombrarla. Una
                        opción con datos no se puede quitar.
                      </small>
                    </label>
                  )}
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={edit.required}
                      onChange={(event) =>
                        setEdit({ ...edit, required: event.target.checked })
                      }
                    />
                    <span>Obligatorio (se avisa cuando falta)</span>
                  </label>
                  <div className={styles.actions}>
                    <Button type="submit" variant="primary">
                      <Check size={15} aria-hidden="true" />
                      Guardar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onPress={() => setEditing(null)}
                    >
                      <X size={15} aria-hidden="true" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className={styles.row}>
                  <div className={styles.rowBody}>
                    <strong>{field.title}</strong>
                    <span>
                      {typeLabels[field.type]}
                      {field.type === "list"
                        ? ` · ${field.options?.length} opciones`
                        : ""}
                      {field.unit ? ` · ${field.unit}` : ""}
                      {field.required ? " · obligatorio" : ""}
                    </span>
                    <small>
                      {inUse
                        ? `Con datos en ${inUse} ${inUse === 1 ? "registro" : "registros"}`
                        : "Sin datos todavía"}
                    </small>
                  </div>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      aria-label={`Editar ${field.title}`}
                      onClick={() => startEdit(field)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={
                        inUse
                          ? `Archivar ${field.title}`
                          : `Eliminar ${field.title}`
                      }
                      onClick={() => remove(field)}
                    >
                      {inUse ? (
                        <Archive size={16} aria-hidden="true" />
                      ) : (
                        <Trash2 size={16} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {creating ? (
        <form
          className={`${styles.form} ${styles.create}`}
          onSubmit={(event) => {
            event.preventDefault();
            create();
          }}
        >
          <h4>
            Nuevo campo para {targetLabels[target].singular.toLowerCase()}
          </h4>
          <label>
            <span>Título</span>
            <input
              className="field-input"
              value={draft.title}
              maxLength={60}
              placeholder="Por ejemplo: Orden de trabajo"
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
            />
          </label>
          <label>
            <span>Tipo</span>
            <select
              className="field-select"
              value={draft.type}
              onChange={(event) =>
                setDraft({ ...draft, type: event.target.value as FieldType })
              }
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {typeLabels[type]}
                </option>
              ))}
            </select>
          </label>
          {draft.type === "number" && (
            <label>
              <span>Unidad (opcional)</span>
              <input
                className="field-input"
                value={draft.unit}
                maxLength={12}
                placeholder="m, kg, COP…"
                onChange={(event) =>
                  setDraft({ ...draft, unit: event.target.value })
                }
              />
            </label>
          )}
          {draft.type === "list" && (
            <label>
              <span>Opciones, una por línea (mínimo dos)</span>
              <textarea
                className="field-input"
                rows={4}
                value={draft.options}
                onChange={(event) =>
                  setDraft({ ...draft, options: event.target.value })
                }
              />
            </label>
          )}
          <label>
            <span>Descripción (opcional)</span>
            <input
              className="field-input"
              value={draft.description}
              maxLength={200}
              placeholder="Ayuda que se muestra bajo el campo"
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
            />
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(event) =>
                setDraft({ ...draft, required: event.target.checked })
              }
            />
            <span>Obligatorio (se avisa cuando falta)</span>
          </label>
          <div className={styles.actions}>
            <Button type="submit" variant="primary">
              Crear campo
            </Button>
            <Button
              type="button"
              variant="ghost"
              onPress={() => setCreating(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="secondary"
          onPress={() => setCreating(true)}
          isDisabled={active.length >= MAX_FIELDS_PER_TARGET}
        >
          <Plus size={16} aria-hidden="true" />
          Nuevo campo
        </Button>
      )}

      {archived.length > 0 && (
        <details className={styles.archived}>
          <summary>Archivados ({archived.length})</summary>
          <ul>
            {archived.map((field) => (
              <li key={field.id}>
                <span>
                  <strong>{field.title}</strong> · {typeLabels[field.type]}
                </span>
                <button type="button" onClick={() => restore(field)}>
                  <ArchiveRestore size={15} aria-hidden="true" />
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
