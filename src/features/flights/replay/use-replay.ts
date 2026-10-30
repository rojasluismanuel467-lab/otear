"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { DroneKind } from "@/components/drone/drone-model";
import type { Finding, Flight, Site } from "@/features/demo/types";
import {
  defaultSettings,
  footprint,
  heightFor,
  mappingCamera,
} from "../mission-plan";
import { buildTrack, type Track } from "../track";
import { replayKindFor } from "./aircraft";
import { createPlayback, type Playback } from "./playback";

/** Which aircraft is drawn: the brand's own (the default) or the family of the flight's equipment. */
export type ReplayAircraft = "brand" | "flight";

export interface Replay {
  track: Track;
  playback: Playback;
  open: boolean;
  /** The flight has not happened: the route is a preview, not a repetition. */
  preview: boolean;
  /** Whether the area reached is measured (zones that are surfaces, not roads or fences). */
  measuresArea: boolean;
  reducedMotion: boolean;
  aircraft: ReplayAircraft;
  flightKind: DroneKind;
  setAircraft: (aircraft: ReplayAircraft) => void;
  toggle: () => void;
}

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(listener: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/**
 * The replay of one flight: its track, a clock shared by every map and control that shows it,
 * and whether the replay is open. The track is an illustration of the planned route.
 */
export function useReplay(
  flight: Flight,
  site: Site,
  findings: Finding[],
): Replay {
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
  const [open, setOpen] = useState(false);
  const [aircraft, setAircraft] = useState<ReplayAircraft>("brand");

  const preview = flight.status !== "completed";
  const measuresArea =
    site.sector === "agriculture" ||
    site.sector === "construction" ||
    site.sector === "mining";
  const gsdCm = flight.log?.gsdCm ?? defaultSettings.gsdCm;
  const overlap = (flight.log?.overlapPct ?? 75) / 100;
  // The track only needs the findings' places, so changing their status does not rebuild it.
  const findingsKey = findings
    .map((item) => `${item.id}:${item.position.join(",")}:${item.title}`)
    .join("|");

  const track = useMemo(() => {
    const { across, along } = footprint(gsdCm, mappingCamera);
    return buildTrack({
      route: flight.route,
      durationMin: flight.duration > 0 ? flight.duration : 30,
      heightM: heightFor(gsdCm, mappingCamera),
      swathM: across,
      photoCount: preview ? 0 : flight.photoCount,
      photoSpacingM: along * (1 - overlap),
      findings: preview
        ? []
        : findings.map((item) => ({
            id: item.id,
            title: item.title,
            position: item.position,
          })),
      ...(measuresArea
        ? {
            zones: site.zones.filter((zone) =>
              flight.zoneIds.includes(zone.id),
            ),
          }
        : {}),
    });
    // `findings` is represented by its key; the flight by the fields the track reads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    flight.id,
    flight.route,
    flight.duration,
    flight.photoCount,
    flight.zoneIds,
    preview,
    gsdCm,
    overlap,
    measuresArea,
    site,
    findingsKey,
  ]);

  const playback = useMemo(() => createPlayback(track.duration), [track]);

  // The clock runs while the replay is playing, and only then.
  useEffect(() => {
    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      const seconds = Math.min(0.1, (now - last) / 1000);
      last = now;
      playback.advance(seconds);
      if (playback.getState().playing) frame = requestAnimationFrame(loop);
      else frame = 0;
    };
    const check = () => {
      const playing = playback.getState().playing;
      if (playing && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(loop);
      } else if (!playing && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    const stop = playback.subscribe(check);
    check();
    return () => {
      stop();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [playback]);

  return {
    track,
    playback,
    open,
    preview,
    measuresArea,
    reducedMotion,
    aircraft,
    flightKind: replayKindFor(flight.drone),
    setAircraft,
    toggle: () => {
      if (open) playback.pause();
      setOpen(!open);
    },
  };
}
