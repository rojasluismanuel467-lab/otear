"use client";

import { useRef, useState } from "react";
import { Boxes } from "lucide-react";
import { DronePreview } from "@/components/drone/drone-preview";
import { droneOptionFor, droneOptions } from "@/features/drones/drone-catalog";
import { DroneGalleryDialog } from "@/features/drones/drone-gallery";
import styles from "./drone-hangar.module.css";

/** Dark showcase panel for the aircraft assigned to a flight. */
export function DroneHangar({ droneName }: { droneName: string }) {
  const [selectedId, setSelectedId] = useState(
    () => droneOptionFor(droneName).id,
  );
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected =
    droneOptions.find((option) => option.id === selectedId) ?? droneOptions[0];
  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) setTimeout(() => triggerRef.current?.focus(), 50);
  }
  return (
    <section className={styles.hangar} aria-label="Equipo asignado">
      <header>
        <h2>Equipo asignado</h2>
        <span>Ilustración</span>
      </header>
      <div className={styles.stage}>
        <DronePreview tone="dark" spec={selected.spec} />
      </div>
      <button
        ref={triggerRef}
        type="button"
        className={styles.gallery}
        onClick={() => setIsOpen(true)}
      >
        <Boxes size={16} aria-hidden="true" />
        Ver otros modelos
      </button>
      <footer>
        <strong>{droneName}</strong>
        <p key={selected.id}>
          <b>{selected.label}.</b> {selected.description}
        </p>
        <small>Uso típico: {selected.sectors}</small>
      </footer>
      <DroneGalleryDialog
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        currentId={selected.id}
        chooseLabel="Ver"
        onChoose={(option) => setSelectedId(option.id)}
      />
    </section>
  );
}
