"use client";

import Link from "next/link";
import {
  ArrowRight,
  HardHat,
  Pickaxe,
  Plus,
  Route,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import {
  choiceById,
  MAX_OTHER,
  sectorChoices,
  type ChoiceId,
} from "@/features/entry/entry";
import { useEntry, writeEntry } from "@/features/entry/entry-store";
import styles from "./sector-picker.module.css";

const icons = {
  agriculture: Sprout,
  roads: Route,
  construction: HardHat,
  security: ShieldCheck,
  mining: Pickaxe,
  other: Plus,
} satisfies Record<ChoiceId, typeof Sprout>;

/**
 * «¿Qué opera usted?»: choosing a sector shows right away how its words would
 * read, and the demo then opens with them. Nothing here pops up or moves on
 * its own; it only reacts to what the visitor picks.
 */
export function SectorPicker() {
  const entry = useEntry();
  const choice = entry ? choiceById(entry.choice) : null;
  const other = entry?.choice === "other" ? (entry.other ?? "") : "";

  function pick(id: ChoiceId) {
    writeEntry({ choice: id, other: id === "other" ? other : undefined });
  }

  function openDemo() {
    if (entry) writeEntry({ ...entry, launch: true });
  }

  return (
    <section
      className={styles.wrap}
      id="pruebelo"
      aria-labelledby="picker-title"
    >
      <div className={styles.panel} data-cursor-theme="dark">
        <div className={styles.controls}>
          <span className={styles.tag}>Pruébelo con su sector</span>
          <h2 id="picker-title" className={styles.title}>
            ¿Qué <span className="accent">opera</span> usted?
          </h2>
          <p className={styles.lead}>
            Elija una opción y vea cómo se llamarían sus cosas. La demo se abre
            con ese vocabulario.
          </p>

          <div
            role="radiogroup"
            aria-label="Su sector"
            className={styles.choices}
          >
            {sectorChoices.map((item) => {
              const Icon = icons[item.id];
              const selected = entry?.choice === item.id;
              return (
                <label
                  key={item.id}
                  className={`${styles.choice} ${selected ? styles.choiceOn : ""}`}
                >
                  <input
                    type="radio"
                    name="picker-sector"
                    className={styles.radio}
                    checked={selected}
                    onChange={() => pick(item.id)}
                  />
                  <Icon size={16} aria-hidden />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>

          {entry?.choice === "other" && (
            <div className={styles.otherRow}>
              <label htmlFor="picker-other">¿Cuál es su sector?</label>
              <input
                id="picker-other"
                type="text"
                maxLength={MAX_OTHER}
                value={other}
                onChange={(event) =>
                  writeEntry({ choice: "other", other: event.target.value })
                }
                placeholder="Ej.: minería, forestal, puertos…"
              />
            </div>
          )}

          <div className={styles.actions}>
            <Link
              href="/programacion/"
              className={styles.primary}
              onClick={openDemo}
            >
              Abrir la demo de {choice ? choice.demoLabel : "ejemplo"}{" "}
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link href="#contacto" className={styles.secondary}>
              Prefiero que me la muestren
            </Link>
          </div>
        </div>

        <div className={styles.preview} aria-live="polite">
          {choice ? (
            <div key={choice.id} className={styles.card}>
              <div className={styles.cardHead}>
                <span>
                  Así se vería en «
                  {(choice.id === "other" && other
                    ? other
                    : choice.label
                  ).toLowerCase()}
                  »
                </span>
                <span className={styles.note}>Ejemplo ilustrativo</span>
              </div>
              <dl className={styles.words}>
                <div>
                  <dt>Sus zonas se llaman</dt>
                  <dd>{choice.words.zones}</dd>
                </div>
                <div>
                  <dt>Lo que encuentra se llama</dt>
                  <dd>{choice.words.finding}</dd>
                </div>
                <div>
                  <dt>Su informe se llama</dt>
                  <dd>{choice.words.report}</dd>
                </div>
              </dl>
              <div className={styles.sample}>
                <span className={styles.dot} aria-hidden />
                <div>
                  <strong>{choice.example.zone}</strong>
                  <span>
                    {choice.id === "other" && other
                      ? `${choice.words.finding} en ${other.toLowerCase()}`
                      : choice.example.finding}
                  </span>
                </div>
                <span className={styles.badge}>Pendiente</span>
              </div>
              {choice.id === "other" && (
                <p className={styles.otherNote}>
                  Empieza con los nombres generales. En Configuración usted
                  renombra zonas, hallazgos e informes, y si hace falta
                  construimos componentes propios.
                </p>
              )}
            </div>
          ) : (
            <div className={`${styles.card} ${styles.cardEmpty}`}>
              <span className={styles.emptyTitle}>Su sector aparece aquí</span>
              <span className={styles.skeleton} aria-hidden />
              <span className={styles.skeleton} aria-hidden />
              <span className={styles.skeleton} aria-hidden />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
