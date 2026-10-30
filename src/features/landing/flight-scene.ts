import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  NotEqualStencilFunc,
  Object3D,
  OrthographicCamera,
  PMREMGenerator,
  ReplaceStencilOp,
  Scene,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { createDroneModel } from "@/components/drone/drone-model";
import {
  buildRoute,
  clamp,
  pathAt,
  wrapPi,
  type Waypoint,
} from "./flight-path.ts";

/** Hero element whose box the aircraft first circles. */
const SLOT = "[data-drone-slot]";
/** Page elements the route passes by: «head» is a section heading, «home» the footer logo. */
const PERCH = "[data-flight-perch]";

/** Tilt of the camera from straight down, so the aircraft keeps some volume. */
const TILT = (24 * Math.PI) / 180;
/** Model units across the wingtips (see buildViper). */
const MODEL_SPAN = 5.5;
const ARRIVAL_MS = 3400;
/** Radians per second around the loiter circle. */
const LOITER_RATE = 1.05;
/** How far below the aircraft its shadow falls, as a share of the wingspan. */
const SHADOW_OFFSET = { x: 0.07, y: 0.1 };

export type FlightOptions = {
  /** Called after the first frame has been drawn. */
  onReady?: () => void;
  /** Called when WebGL is not available. */
  onUnavailable?: () => void;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Measures the page and returns the route for the current layout and viewport. */
function measureRoute(width: number, height: number): Waypoint[] {
  const narrow = width < 800;
  const cruise = clamp(width * 0.17, 130, 260) * (narrow ? 0.8 : 1);
  const stops: Waypoint[] = [];
  const scrollY = window.scrollY;

  const slot = document.querySelector(SLOT);
  if (slot) {
    const box = slot.getBoundingClientRect();
    const size = narrow
      ? Math.min(box.width * 0.62, 240)
      : Math.min(box.width * 0.78, 400);
    stops.push({
      scroll: 0,
      x: box.left + window.scrollX + box.width / 2,
      y: box.top + scrollY + box.height / 2,
      size,
    });
  }

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - height);
  document.querySelectorAll(PERCH).forEach((element) => {
    const box = element.getBoundingClientRect();
    const pageTop = box.top + scrollY;
    if (element.getAttribute("data-flight-perch") === "home") {
      // It lands beside the logo, not on top of it, so the logo stays readable.
      const centerY = pageTop + box.height / 2;
      const size = cruise * 0.7;
      const side = box.left + window.scrollX + box.width + size * 0.7;
      stops.push({
        scroll: maxScroll,
        x: Math.min(side, width - size * 0.6),
        y: clamp(centerY - maxScroll, height * 0.15, height * 0.85),
        size,
      });
      return;
    }
    // A section heading: the aircraft rests in the empty space to its right.
    const section = element.closest("section") ?? element.parentElement;
    const sectionBox = section?.getBoundingClientRect() ?? box;
    const y = narrow ? height * 0.17 : height * 0.34;
    stops.push({
      scroll: Math.max(1, pageTop + (narrow ? -14 : 56) - y),
      x: narrow
        ? width * 0.8
        : sectionBox.left + window.scrollX + sectionBox.width * 0.8,
      y,
      size: cruise,
    });
  });

  if (stops.length === 0) {
    stops.push({ scroll: 0, x: width * 0.75, y: height * 0.4, size: cruise });
  }
  return buildRoute(stops, { width, height });
}

/**
 * Mounts the aircraft on a fixed, click-through canvas inside `host`. It arrives flying
 * from the side of the screen, circles over the hero, and as the page scrolls it follows a
 * route past each section; when the scroll stops it loiters around where it is. Returns
 * a function that unmounts everything.
 */
export function mountFlight(
  host: HTMLElement,
  options: FlightOptions = {},
): () => void {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      antialias: window.devicePixelRatio < 2,
      alpha: true,
      // The shadow is drawn once per pixel through the stencil.
      stencil: true,
    });
  } catch {
    options.onUnavailable?.();
    return () => {};
  }
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, coarsePointer ? 1.5 : 2),
  );
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;display:block;";
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  room.dispose();
  scene.environment = environment.texture;
  const keyLight = new DirectionalLight(0xfff1e0, 1.25);
  keyLight.position.set(-350, 600, 450);
  const rimLight = new DirectionalLight(0x9ed3ea, 1);
  rimLight.position.set(400, 250, -500);
  scene.add(keyLight, rimLight);

  // Orthographic, in pixels: the aircraft's world position is its screen position.
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 5000);
  const eye = 2000;
  camera.position.set(0, eye * Math.cos(TILT), eye * Math.sin(TILT));
  camera.lookAt(0, 0, 0);

  const drone = createDroneModel("viper");
  scene.add(drone.group);

  // The shadow is the same aircraft drawn flat, dark and translucent, a little lower
  // and to the side. The stencil lets each pixel take it once, so overlapping parts
  // (wing over fuselage) do not darken twice.
  const shadowMaterial = new MeshBasicMaterial({
    color: 0x07161f,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: NotEqualStencilFunc,
    stencilZPass: ReplaceStencilOp,
  });
  const shadow = drone.group.clone(true);
  shadow.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const original = Array.isArray(object.material)
      ? object.material[0]
      : object.material;
    // Decals and the propeller blur are translucent: they have no shadow of their own.
    if (original.transparent) object.visible = false;
    else object.material = shadowMaterial;
  });
  scene.add(shadow);
  const originals: Object3D[] = [];
  drone.group.traverse((object) => originals.push(object));
  const clones: Object3D[] = [];
  shadow.traverse((object) => clones.push(object));
  const shadowPropellers = drone.propellers.map(
    (propeller) => clones[originals.indexOf(propeller)],
  );

  let width = 1;
  let height = 1;
  /** Puts a group so that it appears at (px, py) on screen, `lift` units off the page. */
  const place = (group: Object3D, px: number, py: number, lift: number) => {
    const up = height / 2 - py - lift * Math.sin(TILT);
    group.position.set(
      px - width / 2,
      up * Math.sin(TILT) + lift,
      -up * Math.cos(TILT),
    );
  };

  let route: Waypoint[] = [];
  let arrivalStart: number | null = null;
  let arrivalDone = reducedMotion || window.scrollY > 160;
  let arrivalFrom = { x: 0, y: 0 };

  const resize = () => {
    if (window.innerWidth !== width || window.innerHeight !== height) {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height, false);
    }
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    route = measureRoute(width, height);
    // Arrives from the side of the screen where the hero's aircraft sits.
    arrivalFrom = {
      x: (route[0]?.x ?? width / 2) < width / 2 ? -width * 0.14 : width * 1.14,
      y: height * 0.92,
    };
  };
  resize();

  let raf = 0;
  let dirty = true;
  let didFireReady = false;
  let previousTime = performance.now();
  let smoothScroll = window.scrollY;
  let loiter = 1;
  let phase = Math.random() * Math.PI * 2;
  let heading = Math.PI / 2;
  let bank = 0;
  let previous: { x: number; y: number } | null = null;

  const render = (time: number) => {
    const delta = Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    if (arrivalStart === null) arrivalStart = time;

    // Scroll is smoothed, and its speed decides how much the aircraft loiters:
    // still page → circles in place; moving page → follows the route.
    const before = smoothScroll;
    smoothScroll = reducedMotion
      ? window.scrollY
      : smoothScroll +
        (window.scrollY - smoothScroll) * (1 - Math.exp(-delta * 7));
    const speed = delta > 0 ? Math.abs(smoothScroll - before) / delta : 0;
    const rest = reducedMotion ? 0 : 1 - clamp(speed / 500, 0, 1);
    loiter +=
      (rest - loiter) * (1 - Math.exp(-delta * (rest > loiter ? 1.6 : 6)));
    if (!reducedMotion) phase += delta * LOITER_RATE;

    // With reduced motion it stays parked over the hero and scrolls away with the page,
    // instead of travelling along the route as the scroll moves.
    const stop = reducedMotion
      ? { ...route[0], y: route[0].y - window.scrollY }
      : pathAt(route, smoothScroll);
    let size = stop.size;
    const radius = size * 0.36 * loiter;
    let x = stop.x + Math.cos(phase) * radius;
    let y = stop.y - Math.sin(phase) * radius * 0.72;

    if (!arrivalDone) {
      const progress = clamp((time - arrivalStart) / ARRIVAL_MS, 0, 1);
      const eased = easeOutCubic(progress);
      const toX = x - arrivalFrom.x;
      const toY = y - arrivalFrom.y;
      const length = Math.hypot(toX, toY) || 1;
      // A curved approach: bows to one side, then straightens as it arrives.
      const bow = Math.sin(Math.PI * eased) * length * 0.16;
      x = arrivalFrom.x + toX * eased + (-toY / length) * bow;
      y = arrivalFrom.y + toY * eased + (toX / length) * bow;
      size *= 0.7 + 0.3 * eased;
      if (progress >= 1) arrivalDone = true;
    }

    // Heading follows the real motion on screen; the wing banks into the turn.
    if (previous && delta > 0 && !reducedMotion) {
      const vx = (x - previous.x) / delta;
      const vy = -(y - previous.y) / delta;
      if (Math.hypot(vx, vy) > 30) {
        const wanted = Math.atan2(vy, vx);
        const turn = wrapPi(wanted - heading);
        const step = turn * (1 - Math.exp(-delta * 6));
        heading += step;
        bank +=
          (clamp(-0.42 * (step / delta), -0.65, 0.65) - bank) *
          (1 - Math.exp(-delta * 5));
      } else {
        bank += (0 - bank) * (1 - Math.exp(-delta * 4));
      }
    }
    previous = { x, y };

    const scale = size / MODEL_SPAN;
    const yaw = heading + Math.PI / 2;
    drone.group.rotation.set(0, yaw, bank, "YXZ");
    drone.group.scale.setScalar(scale);
    place(drone.group, x, y, 0);
    shadow.rotation.set(0, yaw, bank, "YXZ");
    shadow.scale.setScalar(scale);
    place(shadow, x + size * SHADOW_OFFSET.x, y + size * SHADOW_OFFSET.y, -400);

    const spin = reducedMotion ? 0 : delta * 26;
    drone.propellers.forEach((propeller, index) => {
      propeller.rotation.y += spin;
      const copy = shadowPropellers[index];
      if (copy) copy.rotation.y = propeller.rotation.y;
    });

    if (!reducedMotion || dirty) {
      renderer.render(scene, camera);
      dirty = false;
      if (!didFireReady) {
        didFireReady = true;
        options.onReady?.();
      }
    }
    if (!reducedMotion) raf = requestAnimationFrame(render);
  };
  raf = requestAnimationFrame(render);

  // Reduced motion draws only when something changes.
  const redraw = () => {
    dirty = true;
    if (reducedMotion) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    }
  };
  const remeasure = () => {
    resize();
    redraw();
  };
  window.addEventListener("resize", remeasure);
  window.addEventListener("load", remeasure);
  window.addEventListener("scroll", redraw, { passive: true });
  // The layout can move without a resize (fonts, images, a hot update in development).
  const observer = new ResizeObserver(remeasure);
  observer.observe(document.body);
  document.fonts?.ready.then(remeasure);
  const timers = [300, 1200, 3000].map((ms) =>
    window.setTimeout(remeasure, ms),
  );

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", remeasure);
    window.removeEventListener("load", remeasure);
    window.removeEventListener("scroll", redraw);
    observer.disconnect();
    timers.forEach((timer) => window.clearTimeout(timer));
    scene.remove(drone.group, shadow);
    drone.dispose();
    shadowMaterial.dispose();
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
