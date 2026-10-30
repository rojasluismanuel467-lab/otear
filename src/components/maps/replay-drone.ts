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
import {
  createDroneModel,
  type BrandKind,
  type DroneKind,
  type DroneModel,
} from "@/components/drone/drone-model";

/**
 * The aircraft of a flight replay, seen from above on a small transparent canvas that the map
 * moves to wherever the aircraft is. It is the same procedural model the rest of the app draws,
 * lit the same way, with a shadow that is the model drawn flat and that moves away as it climbs.
 * Where WebGL is not available it falls back to a flat silhouette, so the aircraft never goes
 * missing. The size is fixed on screen: at the zoom of a farm a real drone would not be visible.
 */

export type ReplayAircraftKind = DroneKind | BrandKind;

/** Square canvas, in CSS pixels, large enough for the wings at any heading and for the shadow. */
export const REPLAY_DRONE_BOX = 176;
/** Wingspan of the model on screen, in pixels. */
const SPAN_PX = 84;
const TILT = (18 * Math.PI) / 180;
const SHADOW_OFFSET = { x: 0.1, y: 0.14 };

export interface DronePose {
  /** Direction of travel, radians, east = 0, counter-clockwise. */
  heading: number;
  bank: number;
  /** 0 on the ground, 1 at flying height: how far the shadow lies from the aircraft. */
  lift: number;
  /** Seconds of wall time since the last pose, to turn the propellers. */
  elapsed: number;
  spinning: boolean;
}

export interface ReplayDroneHandle {
  element: HTMLElement;
  setKind(kind: ReplayAircraftKind): void;
  draw(pose: DronePose): void;
  dispose(): void;
}

/** A flat top-down glider for when WebGL is unavailable. Points up at rest. */
const silhouette = `
<svg viewBox="0 0 100 100" width="${SPAN_PX}" height="${SPAN_PX}" aria-hidden="true" focusable="false">
  <path d="M50 8 C52 8 53 12 53 18 L53 40 L94 58 L94 63 L53 56 L53 78 L66 88 L66 92 L50 88 L34 92 L34 88 L47 78 L47 56 L6 63 L6 58 L47 40 L47 18 C47 12 48 8 50 8 Z"
        fill="#e8edf0" stroke="#15262f" stroke-width="2" stroke-linejoin="round"/>
  <path d="M50 10 L50 86" stroke="#15262f" stroke-width="1.2" opacity="0.5"/>
</svg>`;

export function mountReplayDrone(
  host: HTMLElement,
  initial: ReplayAircraftKind,
): ReplayDroneHandle {
  const element = document.createElement("div");
  element.className = "replay-drone";
  element.setAttribute("aria-hidden", "true");
  element.style.cssText = `position:absolute;left:0;top:0;width:${REPLAY_DRONE_BOX}px;height:${REPLAY_DRONE_BOX}px;pointer-events:none;will-change:transform;`;
  host.appendChild(element);

  let renderer: WebGLRenderer | undefined;
  try {
    renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      // The shadow is drawn once per pixel through the stencil.
      stencil: true,
    });
  } catch {
    renderer = undefined;
  }

  if (!renderer) {
    // The fallback: a silhouette turned by CSS. It carries the heading but no depth.
    const flat = document.createElement("div");
    flat.style.cssText = `position:absolute;inset:0;display:grid;place-items:center;filter:drop-shadow(4px 7px 5px rgba(7,22,31,.35));`;
    flat.innerHTML = silhouette;
    element.appendChild(flat);
    return {
      element,
      setKind() {},
      draw({ heading }) {
        const turn = 90 - (heading * 180) / Math.PI;
        flat.style.transform = `rotate(${turn.toFixed(1)}deg)`;
      },
      dispose() {
        element.remove();
      },
    };
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(REPLAY_DRONE_BOX, REPLAY_DRONE_BOX, false);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.cssText = "width:100%;height:100%;display:block;";
  element.appendChild(renderer.domElement);

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

  const half = REPLAY_DRONE_BOX / 2;
  const camera = new OrthographicCamera(-half, half, half, -half, 1, 5000);
  const eye = 2000;
  camera.position.set(0, eye * Math.cos(TILT), eye * Math.sin(TILT));
  camera.lookAt(0, 0, 0);

  const shadowMaterial = new MeshBasicMaterial({
    color: 0x07161f,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    stencilWrite: true,
    stencilRef: 1,
    stencilFunc: NotEqualStencilFunc,
    stencilZPass: ReplaceStencilOp,
  });

  let kind = initial;
  let drone: DroneModel | undefined;
  let shadow: Object3D | undefined;
  let shadowPropellers: Object3D[] = [];

  const build = () => {
    if (drone && shadow) {
      scene.remove(drone.group, shadow);
      drone.dispose();
    }
    drone = createDroneModel(kind);
    scene.add(drone.group);
    // The shadow is the same aircraft drawn flat, so overlapping parts do not darken twice.
    shadow = drone.group.clone(true);
    shadow.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const original = Array.isArray(object.material)
        ? object.material[0]
        : object.material;
      // Decals and the propeller blur are translucent: they cast no shadow of their own.
      if (original.transparent) object.visible = false;
      else object.material = shadowMaterial;
    });
    scene.add(shadow);
    const originals: Object3D[] = [];
    drone.group.traverse((object) => originals.push(object));
    const clones: Object3D[] = [];
    shadow.traverse((object) => clones.push(object));
    shadowPropellers = drone.propellers.map(
      (propeller) => clones[originals.indexOf(propeller)],
    );
  };
  build();

  /** Puts a group so that it appears `lift` units below the page at (px, py) from the centre. */
  const place = (group: Object3D, px: number, py: number, lift: number) => {
    const up = -py - lift * Math.sin(TILT);
    group.position.set(px, up * Math.sin(TILT) + lift, -up * Math.cos(TILT));
  };

  let drawn: DronePose | undefined;
  const draw = (pose: DronePose) => {
    if (!renderer || !drone || !shadow) return;
    drawn = pose;
    // The glider is drawn a little wider than the multirotors, as it is the longer aircraft.
    const span = kind === "viper" ? SPAN_PX : SPAN_PX * 0.78;
    const scale = span / (drone.extent * 2);
    // Every procedural aircraft, the brand glider included, has its nose on +z.
    const yaw = pose.heading + Math.PI / 2;
    drone.group.rotation.set(0, yaw, pose.bank, "YXZ");
    drone.group.scale.setScalar(scale);
    place(drone.group, 0, 0, 0);
    shadow.rotation.set(0, yaw, pose.bank, "YXZ");
    shadow.scale.setScalar(scale);
    const reach = SPAN_PX * (0.02 + 0.98 * pose.lift);
    place(
      shadow,
      reach * SHADOW_OFFSET.x * 2,
      reach * SHADOW_OFFSET.y * 2,
      -400,
    );
    if (pose.spinning) {
      const spin = pose.elapsed * 26;
      drone.propellers.forEach((propeller, index) => {
        propeller.rotation.y += spin;
        const copy = shadowPropellers[index];
        if (copy) copy.rotation.y = propeller.rotation.y;
      });
    }
    renderer.render(scene, camera);
  };

  return {
    element,
    setKind(next) {
      if (next === kind) return;
      kind = next;
      build();
      if (drawn) draw(drawn);
    },
    draw,
    dispose() {
      if (drone && shadow) {
        scene.remove(drone.group, shadow);
        drone.dispose();
      }
      shadowMaterial.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      element.remove();
    },
  };
}
