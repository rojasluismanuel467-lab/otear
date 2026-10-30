import L from "leaflet";
import type { Replay } from "@/features/flights/replay/use-replay";
import { stateAt, surveyRuns, trailUpTo } from "@/features/flights/track";
import { REPLAY_DRONE_BOX, mountReplayDrone } from "./replay-drone";

/**
 * Draws a flight replay on a Leaflet map: the area the photos have reached so far, the path
 * flown, the findings the aircraft has passed, and the aircraft itself. Nothing here moves the
 * clock; it listens to the playback and draws where it is.
 */

const PANE = "replay";
/** Pixels from the middle of the map at which "follow" starts to move the map. */
const FOLLOW_DEADZONE = 90;
const EARTH_CIRCUMFERENCE_M = 40_075_016.686;

/** Metres a pixel covers at the map's current zoom and the given latitude. */
function metersPerPixel(map: L.Map, lat: number) {
  return (
    (EARTH_CIRCUMFERENCE_M * Math.cos((lat * Math.PI) / 180)) /
    (256 * Math.pow(2, map.getZoom()))
  );
}

export function mountReplay(
  map: L.Map,
  replay: Replay,
  colors: { trail: string; casing: string; coverage: string },
): () => void {
  const { track, playback } = replay;
  const container = map.getContainer();

  const pane = map.getPane(PANE) ?? map.createPane(PANE);
  // Above the zones and the planned route, below the markers.
  pane.style.zIndex = "430";
  pane.style.pointerEvents = "none";

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;";
  canvas.setAttribute("aria-hidden", "true");
  pane.appendChild(canvas);
  const context = canvas.getContext("2d");

  const drone = mountReplayDrone(
    container,
    replay.aircraft === "brand" ? "viper" : replay.flightKind,
  );
  drone.element.style.zIndex = "640";

  let heading = track.points[0]?.heading ?? 0;
  let bank = 0;
  let lastTime = playback.getState().time;
  let lastWall = performance.now();
  let passedKey = "";

  const syncSize = () => {
    const size = map.getSize();
    const ratio = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(size.x * ratio)) {
      canvas.width = Math.round(size.x * ratio);
      canvas.height = Math.round(size.y * ratio);
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
    }
    return { size, ratio };
  };

  const draw = (time: number) => {
    const now = performance.now();
    const elapsed = Math.min(0.1, (now - lastWall) / 1000);
    lastWall = now;
    const state = stateAt(track, time);
    const { size, ratio } = syncSize();
    const origin = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(canvas, origin);

    if (context) {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, size.x, size.y);
      const toCanvas = (position: [number, number]) => {
        const point = map.latLngToLayerPoint(position);
        return [point.x - origin.x, point.y - origin.y] as const;
      };
      // What the photos have reached: one stroke as wide as the photos, drawn once so that
      // passes that overlap do not darken each other.
      const swathPx = Math.max(
        2,
        track.swathM / metersPerPixel(map, state.position[0]),
      );
      context.lineJoin = "round";
      context.lineCap = "butt";
      context.strokeStyle = colors.coverage;
      context.globalAlpha = 0.34;
      context.lineWidth = swathPx;
      context.beginPath();
      surveyRuns(track, time).forEach((run) => {
        run.forEach((position, index) => {
          const [x, y] = toCanvas(position);
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
      });
      context.stroke();
      // The path flown: a dark casing under a bright line, so it reads on any image.
      const trail = trailUpTo(track, time);
      context.globalAlpha = 1;
      context.lineCap = "round";
      [
        [colors.casing, 5],
        [colors.trail, 2.5],
      ].forEach(([color, width]) => {
        context.strokeStyle = color as string;
        context.lineWidth = width as number;
        context.beginPath();
        trail.forEach((position, index) => {
          const [x, y] = toCanvas(position);
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.stroke();
      });
    }

    // Soft follow: the map only moves once the aircraft drifts away from the middle.
    let point = map.latLngToContainerPoint(state.position);
    if (playback.getState().follow) {
      const middle = map.getSize().divideBy(2);
      const offset = point.subtract(middle);
      const distance = Math.hypot(offset.x, offset.y);
      if (distance > FOLLOW_DEADZONE) {
        map.panBy(offset.multiplyBy(0.14), { animate: false });
        point = map.latLngToContainerPoint(state.position);
      }
    }
    drone.element.style.transform = `translate(${(point.x - REPLAY_DRONE_BOX / 2).toFixed(1)}px, ${(point.y - REPLAY_DRONE_BOX / 2).toFixed(1)}px)`;

    // The wing banks into a turn, smoothed so that a seek does not make it flip.
    const ahead = stateAt(track, Math.min(track.duration, time + 0.6));
    const behind = stateAt(track, Math.max(0, time - 0.6));
    const rate = (ahead.heading - behind.heading) / 1.2;
    const wanted =
      time === lastTime ? bank : Math.max(-0.6, Math.min(0.6, -0.4 * rate));
    bank += (wanted - bank) * Math.min(1, elapsed * 6 + 0.1);
    lastTime = time;
    heading = state.heading;
    drone.draw({
      heading,
      bank,
      lift: track.heightM > 0 ? Math.min(1, state.altM / track.heightM) : 0,
      elapsed,
      spinning: playback.getState().playing,
    });

    // Findings the aircraft has passed light up.
    const passed = track.events
      .filter((event) => event.kind === "finding" && event.t <= time)
      .map((event) => event.findingId)
      .join(",");
    if (passed !== passedKey) {
      passedKey = passed;
      const ids = new Set(passed.split(",").filter(Boolean));
      container
        .querySelectorAll<HTMLElement>("[data-finding-id]")
        .forEach((element) =>
          element.parentElement?.classList.toggle(
            "is-passed",
            ids.has(element.dataset.findingId ?? ""),
          ),
        );
    }
  };

  const redraw = () => draw(playback.getState().time);
  const stopFrames = playback.onFrame(draw);
  const stopState = playback.subscribe(redraw);
  map.on("move zoomend viewreset resize", redraw);
  // Moving the map by hand ends "follow".
  const release = () => {
    if (playback.getState().follow) playback.setFollow(false);
  };
  map.on("dragstart", release);
  redraw();
  // The model loads a moment after mounting; draw again once the map has settled.
  const settle = window.setTimeout(redraw, 250);

  const finding = container.closest(".site-map");
  finding?.setAttribute("data-replay", "on");

  return () => {
    window.clearTimeout(settle);
    stopFrames();
    stopState();
    map.off("move zoomend viewreset resize", redraw);
    map.off("dragstart", release);
    finding?.removeAttribute("data-replay");
    container
      .querySelectorAll(".is-passed")
      .forEach((element) => element.classList.remove("is-passed"));
    drone.dispose();
    canvas.remove();
  };
}
