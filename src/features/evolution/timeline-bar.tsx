"use client";

import { useEffect, useRef } from "react";
import { Pause, Play } from "lucide-react";
import { formatDate } from "@/lib/format";
import styles from "./evolution.module.css";

/** The flights of the site as stops on a line, with how many problems each one shows. */
export function TimelineBar({
  dates,
  counts,
  index,
  referenceIndex,
  playing,
  onSelect,
  onTogglePlay,
}: {
  dates: string[];
  counts: number[];
  index: number;
  referenceIndex: number;
  playing: boolean;
  onSelect: (index: number) => void;
  onTogglePlay: () => void;
}) {
  const list = useRef<HTMLOListElement>(null);

  // On narrow screens the stops scroll sideways: keep the selected one in view (centred) as it
  // changes, including while playing. Only the list moves, never the page.
  useEffect(() => {
    const node = list.current;
    const stop = node?.querySelector<HTMLElement>(
      'button[aria-pressed="true"]',
    );
    if (!node || !stop) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const a = stop.getBoundingClientRect();
    const b = node.getBoundingClientRect();
    const delta = a.left + a.width / 2 - (b.left + b.width / 2);
    if (Math.abs(delta) < 2) return;
    node.scrollTo({
      left: node.scrollLeft + delta,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [index]);

  return (
    <div className={styles.timeline}>
      <button
        type="button"
        className={styles.play}
        onClick={onTogglePlay}
        aria-label={
          playing ? "Pausar la reproducción" : "Reproducir la evolución"
        }
      >
        {playing ? (
          <Pause size={18} aria-hidden="true" />
        ) : (
          <Play size={18} aria-hidden="true" />
        )}
      </button>
      <ol ref={list} className={styles.stops} aria-label="Vuelos en el tiempo">
        {dates.map((date, i) => (
          <li key={date} data-past={i <= index ? "true" : undefined}>
            <button
              type="button"
              aria-pressed={i === index}
              data-reference={
                i === referenceIndex && i !== index ? "true" : undefined
              }
              onClick={() => onSelect(i)}
            >
              <span className={styles.node}>
                {counts[i] > 0 && <b aria-hidden="true">{counts[i]}</b>}
              </span>
              <span className={styles.stopDate}>
                {formatDate(date, { day: "numeric", month: "short" })}
              </span>
              <span className={styles.srOnly}>
                {counts[i] === 0
                  ? "sin problemas"
                  : `${counts[i]} ${counts[i] === 1 ? "problema" : "problemas"}`}
                {i === referenceIndex && i !== index
                  ? ", fecha de comparación"
                  : ""}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
