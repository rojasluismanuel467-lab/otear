"use client";

import { useEffect, useState } from "react";
import { Modal } from "@heroui/react";
import { Check, Fan, Plane } from "lucide-react";
import { DronePreview } from "@/components/drone/drone-preview";
import type { DroneModelSpec } from "@/components/drone/drone-model";
import type { Sector } from "@/features/demo/types";
import {
  droneOptions,
  optionsByCategory,
  sectorNames,
  type DroneOption,
} from "./drone-catalog";
import styles from "./drone-gallery.module.css";

/**
 * A still of the aircraft drawn by one shared renderer (see `drone-thumbnail.ts`). `undefined` while
 * it is being drawn, `null` when the browser cannot draw it.
 */
function useThumbnail(spec: DroneModelSpec) {
  const [url, setUrl] = useState<string | null | undefined>();
  useEffect(() => {
    let current = true;
    import("@/components/drone/drone-thumbnail")
      .then((module) => module.droneThumbnail(spec))
      .catch(() => null)
      .then((result) => {
        if (current) setUrl(result);
      });
    return () => {
      current = false;
    };
  }, [spec]);
  return url;
}

function Thumbnail({ option }: { option: DroneOption }) {
  const url = useThumbnail(option.spec);
  const Fallback = option.category === "long-range" ? Plane : Fan;
  return (
    <span
      className={`${styles.thumb} ${url === undefined ? styles.thumbLoading : ""}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- a data URL drawn in the browser
        <img src={url} alt="" width={420} height={280} />
      ) : (
        url === null && <Fallback size={34} aria-hidden="true" />
      )}
    </span>
  );
}

const sectorFilters: Sector[] = [
  "agriculture",
  "roads",
  "construction",
  "security",
];

function GalleryBody({
  currentId,
  chooseLabel,
  onChoose,
}: {
  currentId?: string;
  chooseLabel: string;
  onChoose: (option: DroneOption) => void;
}) {
  const [highlightId, setHighlightId] = useState(
    currentId ?? droneOptions[0].id,
  );
  const [filter, setFilter] = useState<Sector | undefined>();
  const highlighted =
    droneOptions.find((option) => option.id === highlightId) ?? droneOptions[0];
  const groups = optionsByCategory(filter);
  return (
    <div className={styles.layout}>
      <section className={styles.stagePanel} aria-label="Vista del modelo">
        <div className={styles.stage}>
          <DronePreview tone="dark" spec={highlighted.spec} />
        </div>
        <div className={styles.detail} key={highlighted.id}>
          <span className={styles.detailMaker}>{highlighted.maker}</span>
          <h3>{highlighted.label}</h3>
          <p>{highlighted.description}</p>
          <dl>
            <div>
              <dt>Uso típico</dt>
              <dd>{highlighted.sectors}</dd>
            </div>
            {highlighted.examples.length > 0 &&
              highlighted.group === "generic" && (
                <div>
                  <dt>Se parece a</dt>
                  <dd>{highlighted.examples.join(" · ")}</dd>
                </div>
              )}
          </dl>
        </div>
        <button
          type="button"
          className={styles.choose}
          onClick={() => onChoose(highlighted)}
        >
          <Check size={18} aria-hidden="true" />
          {chooseLabel} «{highlighted.label}»
        </button>
        <p className={styles.note}>
          Las familias genéricas son formas ilustrativas, no el equipo exacto.
          El nombre del equipo del vuelo lo confirma usted.
        </p>
      </section>

      <div className={styles.catalog}>
        <div
          className={styles.filters}
          role="group"
          aria-label="Filtrar por sector"
        >
          <button
            type="button"
            aria-pressed={!filter}
            onClick={() => setFilter(undefined)}
          >
            Todos
          </button>
          {sectorFilters.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={filter === id}
              onClick={() => setFilter(id)}
            >
              {sectorNames[id]}
            </button>
          ))}
        </div>
        {groups.map((group) => (
          <section
            key={group.id}
            className={styles.group}
            aria-labelledby={`drone-group-${group.id}`}
          >
            <h3 id={`drone-group-${group.id}`} className={styles.band}>
              {group.label}
              <span>
                {group.options.length}{" "}
                {group.options.length === 1 ? "modelo" : "modelos"}
              </span>
            </h3>
            <p className={styles.hint}>{group.hint}</p>
            <ul className={styles.grid}>
              {group.options.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    className={styles.card}
                    aria-pressed={option.id === highlighted.id}
                    onClick={() => setHighlightId(option.id)}
                    onDoubleClick={() => onChoose(option)}
                  >
                    <Thumbnail option={option} />
                    <span className={styles.cardText}>
                      <span className={styles.maker}>{option.maker}</span>
                      <span className={styles.name}>{option.label}</span>
                    </span>
                    {option.id === currentId && (
                      <span className={styles.inUse}>En uso</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * Gallery of common aircraft, in the manner of a simulator's aircraft picker: a grid of 3D
 * stills by purpose, and a large model to turn around before choosing it.
 */
export function DroneGalleryDialog({
  isOpen,
  onOpenChange,
  currentId,
  chooseLabel = "Usar",
  onChoose,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Option that is in use now; the gallery opens on it. */
  currentId?: string;
  chooseLabel?: string;
  onChoose: (option: DroneOption) => void;
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg" scroll="inside">
          <Modal.Dialog className={styles.dialog}>
            <Modal.Header>
              <Modal.Heading>Modelos de dron</Modal.Heading>
              <Modal.CloseTrigger aria-label="Cerrar la galería" />
            </Modal.Header>
            <Modal.Body>
              <GalleryBody
                currentId={currentId}
                chooseLabel={chooseLabel}
                onChoose={(option) => {
                  onChoose(option);
                  onOpenChange(false);
                }}
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
