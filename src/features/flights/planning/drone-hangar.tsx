"use client";

import { useState } from "react";
import { DronePreview } from "@/components/drone/drone-preview";
import {
  djiOptions,
  droneOptionFor,
  droneOptions,
  genericOptions,
  type DroneOption,
} from "@/features/drones/drone-catalog";
import styles from "./drone-hangar.module.css";

function OptionGroup({
  label,
  options,
  selectedId,
  onSelect,
}: {
  label: string;
  options: DroneOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.optionGroup}>
      <span id={`group-${label}`}>{label}</span>
      <div
        className={styles.options}
        role="group"
        aria-labelledby={`group-${label}`}
      >
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === selectedId}
            onClick={() => onSelect(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Dark showcase panel for the aircraft assigned to a flight. */
export function DroneHangar({ droneName }: { droneName: string }) {
  const [selectedId, setSelectedId] = useState(
    () => droneOptionFor(droneName).id,
  );
  const selected =
    droneOptions.find((option) => option.id === selectedId) ?? droneOptions[0];
  return (
    <section className={styles.hangar} aria-label="Equipo asignado">
      <header>
        <h2>Equipo asignado</h2>
        <span>Ilustración</span>
      </header>
      <div className={styles.stage}>
        <DronePreview tone="dark" spec={selected.spec} />
      </div>
      <OptionGroup
        label="Tipos genéricos"
        options={genericOptions}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <OptionGroup
        label="Modelos CAD de DJI"
        options={djiOptions}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <footer>
        <strong>{droneName}</strong>
        <p key={selected.id}>
          <b>{selected.label}.</b> {selected.description}
        </p>
        <small>Uso típico: {selected.sectors}</small>
      </footer>
    </section>
  );
}
