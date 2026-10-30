"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  Crosshair,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { neighbouringEvents, phaseLabels, stateAt } from "../track";
import { SPEEDS } from "./playback";
import { replayKindLabels } from "./aircraft";
import type { Replay } from "./use-replay";
import styles from "./replay-bar.module.css";

const number = (value: number, digits = 0) =>
  new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);

function clock(seconds: number) {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}

/**
 * The controls and readings of a flight replay: play and pause, speed, a timeline with the
 * moments of the flight, and what the aircraft is doing at the instant shown. It reads from the
 * same playback as the map, so both always show the same moment.
 */
export function ReplayBar({ replay }: { replay: Replay }) {
  const {
    track,
    playback,
    preview,
    reducedMotion,
    measuresArea,
    recordedKm,
    declaredHa,
  } = replay;
  const playing = useSyncExternalStore(
    playback.subscribe,
    playback.getState,
    playback.getState,
  );
  const state = useMemo(
    () => stateAt(track, playing.time),
    [track, playing.time],
  );
  if (!replay.open) return null;

  const { before, after } = neighbouringEvents(track, playing.time);
  const total = track.photoTimes.length;
  const phase = phaseLabels[state.phase];
  const title = preview ? "Vista previa de la ruta" : "Simulación del vuelo";
  // The route is drawn with rounded corners, so its length differs a little from the recorded
  // kilometres; the reading follows the recorded figure so every screen shows the same number.
  const routeKm = (track.points[track.points.length - 1]?.distM ?? 0) / 1000;
  const totalKm = recordedKm ?? routeKm;
  const doneKm = routeKm > 0 ? totalKm * (state.distM / 1000 / routeKm) : 0;
  const jump = (event: { t: number } | undefined) => {
    if (!event) return;
    playback.pause();
    playback.seek(event.t);
  };

  return (
    <section
      className={`surface ${styles.bar}`}
      aria-label={title}
      data-replay-bar
    >
      <header className={styles.top}>
        <div>
          <h3>{title}</h3>
          <p>
            {preview
              ? "Así se recorrería la ruta planificada. El vuelo todavía no se ha realizado."
              : "Una repetición ilustrada del recorrido, a partir de la ruta planificada."}
          </p>
        </div>
        <span className={styles.badge}>
          {preview ? "Ruta planificada" : "Ruta ilustrativa"}
        </span>
      </header>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.icon}
          aria-label="Volver al inicio"
          title="Volver al inicio"
          onClick={() => {
            playback.pause();
            playback.seek(0);
          }}
        >
          <RotateCcw size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.icon}
          aria-label="Momento anterior"
          title="Momento anterior"
          disabled={!before}
          onClick={() => jump(before)}
        >
          <SkipBack size={18} aria-hidden="true" />
        </button>
        {!reducedMotion && (
          <button
            type="button"
            className={styles.play}
            aria-pressed={playing.playing}
            onClick={() => playback.toggle()}
          >
            {playing.playing ? (
              <Pause size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
            {playing.playing
              ? "Pausar"
              : playing.ended
                ? "Repetir"
                : "Reproducir"}
          </button>
        )}
        <button
          type="button"
          className={styles.icon}
          aria-label="Momento siguiente"
          title="Momento siguiente"
          disabled={!after}
          onClick={() => jump(after)}
        >
          <SkipForward size={18} aria-hidden="true" />
        </button>
        {!reducedMotion && (
          <div className={styles.group} role="group" aria-label="Velocidad">
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                aria-pressed={playing.speed === speed}
                onClick={() => playback.setSpeed(speed)}
              >
                {speed}×
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={playing.follow}
          onClick={() => playback.setFollow(!playing.follow)}
        >
          <Crosshair size={16} aria-hidden="true" />
          Seguir al dron
        </button>
      </div>
      {reducedMotion && (
        <p className={styles.note}>
          Su dispositivo pide menos movimiento: la simulación no se reproduce
          sola. Avance por los momentos del vuelo o arrastre la línea de tiempo.
        </p>
      )}

      <div className={styles.timeline}>
        <span className={styles.time}>{clock(playing.time)}</span>
        <div className={styles.track}>
          <input
            type="range"
            min={0}
            max={Math.round(track.duration)}
            step={1}
            value={Math.round(playing.time)}
            aria-label="Momento del vuelo"
            aria-valuetext={`Minuto ${clock(playing.time)} de ${clock(track.duration)}, ${phase.toLowerCase()}`}
            onChange={(event) => {
              playback.pause();
              playback.seek(Number(event.target.value));
            }}
          />
          <div className={styles.markers}>
            {track.events.map((event) => (
              <button
                key={event.id}
                type="button"
                className={`${styles.marker} ${styles[event.kind]}`}
                style={{ left: `${(event.t / track.duration) * 100}%` }}
                title={`${clock(event.t)} · ${event.label}`}
                aria-label={`Ir a ${clock(event.t)}: ${event.label}`}
                onClick={() => jump(event)}
              />
            ))}
          </div>
        </div>
        <span className={styles.time}>{clock(track.duration)}</span>
      </div>
      <span className="sr-only" role="status">
        {phase}
      </span>

      <dl className={styles.readings}>
        <div>
          <dt>Fase</dt>
          <dd>{phase}</dd>
        </div>
        <div>
          <dt>Altura</dt>
          <dd>{number(state.altM)} m</dd>
        </div>
        <div>
          <dt>Velocidad</dt>
          <dd>{number(state.speedMs * 3.6)} km/h</dd>
        </div>
        <div>
          <dt>Recorrido</dt>
          <dd>
            {number(doneKm, 1)} de {number(totalKm, 1)} km
          </dd>
        </div>
        {!preview && (
          <div>
            <dt>Fotos</dt>
            <dd>
              {number(state.photos)} de {number(total)}
            </dd>
          </div>
        )}
        {measuresArea && (
          <div>
            <dt>
              {preview ? "Área prevista de la ruta" : "Área de la ruta"}
              {!preview && " (ilustrativa)"}
            </dt>
            <dd>
              {number(state.coveredHa, 1)} de {number(track.orderedHa, 1)} ha
              pedidas · {number(state.coveredShare * 100)} %
            </dd>
          </div>
        )}
        {!preview && measuresArea && declaredHa !== undefined && (
          <div className={styles.declared}>
            <dt>Cubierto, según el operador</dt>
            <dd>
              {number(declaredHa, 1)} de {number(track.orderedHa, 1)} ha
              {track.orderedHa - declaredHa > 0.05 &&
                ` · faltaron ${number(track.orderedHa - declaredHa, 1)} ha`}
            </dd>
            <small>Lo declara en su bitácora; es la cifra que usa Pagos.</small>
          </div>
        )}
      </dl>

      <div className={styles.aircraft}>
        <span id="replay-aircraft">Aeronave</span>
        <div
          className={styles.group}
          role="group"
          aria-labelledby="replay-aircraft"
        >
          <button
            type="button"
            aria-pressed={replay.aircraft === "brand"}
            onClick={() => replay.setAircraft("brand")}
          >
            Otear · ilustrativa
          </button>
          <button
            type="button"
            aria-pressed={replay.aircraft === "flight"}
            onClick={() => replay.setAircraft("flight")}
          >
            {replayKindLabels[replay.flightKind]}
          </button>
        </div>
      </div>

      <details className={styles.moments}>
        <summary>Momentos del vuelo</summary>
        <ol>
          {track.events.map((event) => (
            <li key={event.id}>
              <button type="button" onClick={() => jump(event)}>
                <span>{clock(event.t)}</span>
                {event.label}
              </button>
            </li>
          ))}
        </ol>
      </details>

      <p className={styles.note}>
        {preview
          ? "Vista previa de la ruta planificada. Altura, velocidad y tiempos son estimados."
          : "Simulación ilustrativa: se dibuja desde la ruta planificada, por eso muestra la ruta completa aunque el operador haya declarado menos. Altura, velocidad, tiempos y área de la ruta son estimados; el recorrido en kilómetros es el registrado. Solo las hectáreas «según el operador» salen de su bitácora. El dron se dibuja a tamaño fijo, no a escala."}
      </p>
    </section>
  );
}
