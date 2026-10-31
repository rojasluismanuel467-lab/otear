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
import { DemoLink } from "./demo-link";
import styles from "./sector-picker.module.css";

const icons = {
  agriculture: Sprout,
  roads: Route,
  construction: HardHat,
  security: ShieldCheck,
  mining: Pickaxe,
  other: Plus,
} satisfies Record<ChoiceId, typeof Sprout>;

/** How the demo's top bar names each sector (the same words as `Site.sectorLabel`). */
const demoSectorNames: Partial<Record<ChoiceId, string>> = {
  agriculture: "Agricultura",
  roads: "Carreteras",
  construction: "Construcción",
  security: "Vigilancia",
  mining: "Minería",
};

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

  return (
    <section
      className={styles.wrap}
      id="pruebelo"
      aria-labelledby="picker-title"
    >
      <div className={styles.panel} data-cursor-theme="dark" data-flight-clear>
        <div className={styles.controls}>
          <span className={styles.tag}>Pruébelo con su sector</span>
          <h2 id="picker-title" className={styles.title}>
            ¿Qué <span className="accent">supervisa</span> usted?
          </h2>
          <p className={styles.lead}>
            Elija una opción y vea cómo se llamarían sus cosas. La demo se abre
            con ese vocabulario y en la pantalla que responde la pregunta
            principal de su sector.
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
            <DemoLink className={styles.primary}>
              Abrir la demo de {choice ? choice.demoLabel : "ejemplo"}{" "}
              <ArrowRight size={16} aria-hidden />
            </DemoLink>
            <Link href="#contacto" className={styles.secondary}>
              Prefiero que me la muestren
            </Link>
          </div>
          <p className={styles.operatorLine}>
            ¿Opera drones para otras empresas?{" "}
            <DemoLink viewAs="operator" className={styles.operatorLink}>
              Abra la demo como operador
            </DemoLink>
            .
          </p>
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
              {demoSectorNames[choice.id] && (
                <p className={styles.otherNote}>
                  En la demo este sector se llama «{demoSectorNames[choice.id]}»
                  en la barra de arriba.
                </p>
              )}
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
              <span className={styles.emptyTitle}>
                Elija una opción para ver su caso
              </span>
              <span className={styles.emptyText}>
                Aquí verá cómo se llamarían sus cosas (zonas, hallazgos,
                informes) y qué pantalla abre primero la demo.
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
