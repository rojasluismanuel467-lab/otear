/**
 * The clock of a flight replay. One playback is shared by every map and control that shows the
 * same flight, so the aircraft is in the same place on the Resumen map, on the Observaciones
 * map and on the timeline. It does not run by itself: whoever draws frames calls `advance`.
 */

export const SPEEDS = [1, 2, 4, 8, 16] as const;
export type Speed = (typeof SPEEDS)[number];

export interface PlaybackState {
  /** Seconds from the start of the flight. */
  time: number;
  playing: boolean;
  speed: Speed;
  /** Whether the map follows the aircraft. */
  follow: boolean;
  ended: boolean;
}

export interface Playback {
  readonly duration: number;
  getState(): PlaybackState;
  /**
   * Listens to changes the interface cares about. While playing, time changes are announced at
   * most every `intervalMs`, so a slider can follow without redrawing 60 times a second.
   */
  subscribe(listener: () => void): () => void;
  /** Listens to every change of time, for drawing the aircraft. Called with the new time. */
  onFrame(listener: (time: number) => void): () => void;
  play(): void;
  pause(): void;
  toggle(): void;
  seek(time: number): void;
  setSpeed(speed: Speed): void;
  setFollow(follow: boolean): void;
  /** Moves the clock forward by `seconds` of wall time (scaled by the speed). */
  advance(seconds: number): void;
  reset(): void;
}

const INTERFACE_INTERVAL_MS = 120;

export function createPlayback(
  duration: number,
  now: () => number = () => Date.now(),
): Playback {
  let state: PlaybackState = {
    time: 0,
    playing: false,
    speed: 4,
    follow: false,
    ended: false,
  };
  const listeners = new Set<() => void>();
  const frames = new Set<(time: number) => void>();
  let announced = 0;

  const announce = (force: boolean) => {
    const at = now();
    if (!force && at - announced < INTERFACE_INTERVAL_MS) return;
    announced = at;
    listeners.forEach((listener) => listener());
  };
  const set = (patch: Partial<PlaybackState>, force = true) => {
    const timeChanged = patch.time !== undefined && patch.time !== state.time;
    state = { ...state, ...patch };
    if (timeChanged) frames.forEach((frame) => frame(state.time));
    announce(force);
  };
  const clamp = (time: number) => Math.min(duration, Math.max(0, time));

  return {
    duration,
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    onFrame(listener) {
      frames.add(listener);
      return () => frames.delete(listener);
    },
    play() {
      if (state.playing) return;
      // Playing from the end starts over.
      if (state.ended) set({ time: 0, ended: false, playing: true });
      else set({ playing: true });
    },
    pause() {
      if (state.playing) set({ playing: false });
    },
    toggle() {
      if (state.playing) this.pause();
      else this.play();
    },
    seek(time) {
      const next = clamp(time);
      set({ time: next, ended: next >= duration });
    },
    setSpeed(speed) {
      set({ speed });
    },
    setFollow(follow) {
      set({ follow });
    },
    advance(seconds) {
      if (!state.playing) return;
      const next = clamp(state.time + seconds * state.speed);
      if (next >= duration)
        set({ time: duration, ended: true, playing: false });
      else set({ time: next }, false);
    },
    reset() {
      set({ time: 0, ended: false, playing: false });
    },
  };
}
