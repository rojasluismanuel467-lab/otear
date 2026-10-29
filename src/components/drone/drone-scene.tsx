"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  DirectionalLight,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  createDroneModel,
  loadFileDroneModel,
  specKey,
  type DroneModel,
  type DroneModelSpec,
} from "./drone-model";
import styles from "./drone-scene.module.css";

const DEFAULT_VIEW = { yaw: -0.65, pitch: 0.32 };
const PITCH_LIMITS = { min: -0.5, max: 1.15 };
const IDLE_DELAY_MS = 2800;
const KEY_STEP = 0.2;
const INTRO_DURATION_MS = 6500;
const FOV = 30;
const TAN_HALF_FOV = Math.tan((FOV / 2) * (Math.PI / 180));
/** Camera height as a share of its distance, so the viewing angle stays put. */
const CAMERA_RISE = 0.227;
/** Fraction of the aircraft's scale the intro flies at, so there is room to move. */
const INTRO_SCALE = 0.72;
const PARALLAX = { yaw: 0.3, pitch: 0.12, roll: 0.1 };
/** Nose-follow, tuned to be calm: how far the pointer can be (as a share of the stage's larger side),
 * the share at which the aircraft follows fully, the dead zone around its centre (px), how fast it
 * turns, how quickly the follow engages and fades, how much the pointer's direction is smoothed,
 * how far the pointer must cross the vertical before it shows its other side, and its slight pitch. */
const FOLLOW = {
  reach: 0.7,
  full: 0.4,
  deadzone: 60,
  turn: 2.4,
  engage: 2,
  smoothing: 3.5,
  hysteresis: 0.45,
  pitch: 0.2,
};
const AXIS_Z = new Vector3(0, 0, 1);
const wrapPi = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle));

type DroneSceneProps = {
  /** Increment to animate the model back to its default orientation. */
  spec: DroneModelSpec;
  resetSignal: number;
  onInteract?: () => void;
  onUnavailable?: () => void;
  /** "dark" renders on a transparent stage meant to sit over a dark surface. */
  tone?: "light" | "dark";
  /** When true, play a scripted entry flight for ~6.5s before interactive mode.
   * Reactive: can flip from false → true after mount; the intro starts on the
   * next frame. */
  playIntro?: boolean;
  /** Fired once when the scripted intro has finished. */
  onIntroEnd?: () => void;
  /** Fired after the first renderer.render(). Caller can gate overlay UI on it. */
  onReady?: () => void;
  /** Tilts the aircraft slightly toward the pointer (fine pointers only, off
   * with reduced motion). Listens on the window, so the canvas can stay inert. */
  parallax?: boolean;
  /** Turns the aircraft's nose toward the pointer while it is near, as if flying that way
   * (fine pointers only, off with reduced motion). */
  followPointer?: boolean;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createShadowTexture(tone: "light" | "dark") {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64);
    const shade = tone === "dark" ? "4, 18, 12" : "38, 59, 45";
    gradient.addColorStop(
      0,
      `rgba(${shade}, ${tone === "dark" ? 0.55 : 0.42})`,
    );
    gradient.addColorStop(1, `rgba(${shade}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
}

export function DroneScene({
  spec,
  resetSignal,
  onInteract,
  onUnavailable,
  tone = "light",
  playIntro = false,
  onIntroEnd,
  onReady,
  parallax = false,
  followPointer = false,
}: DroneSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<{ yaw: number; pitch: number } | null>(null);
  const nudgeRef = useRef<(yaw: number, pitch: number) => void>(() => {});
  const specRef = useRef(spec);
  const swapRef = useRef<(next: DroneModelSpec) => void>(() => {});
  const onInteractRef = useRef(onInteract);
  const onUnavailableRef = useRef(onUnavailable);
  const onIntroEndRef = useRef(onIntroEnd);
  const onReadyRef = useRef(onReady);
  const parallaxRef = useRef(parallax);
  const followRef = useRef(followPointer);
  // playIntro is read every frame via this ref so a false → true flip after
  // mount starts the intro script without rebuilding the renderer.
  const playIntroRef = useRef(playIntro);
  // These refs survive React Strict Mode's dev double-mount so the intro
  // timeline is one continuous animation across the mount → cleanup → mount.
  const introStartedRef = useRef(false);
  const introStartRef = useRef<number>(0);
  const introDoneRef = useRef(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    onInteractRef.current = onInteract;
    onUnavailableRef.current = onUnavailable;
    onIntroEndRef.current = onIntroEnd;
    onReadyRef.current = onReady;
    parallaxRef.current = parallax;
    followRef.current = followPointer;
  }, [onInteract, onUnavailable, onIntroEnd, onReady, parallax, followPointer]);

  // Sync playIntroRef in a layout effect so the render loop sees the new value
  // on the frame immediately after React commits (before the browser paints
  // the overlay fade-in).
  useLayoutEffect(() => {
    playIntroRef.current = playIntro;
  }, [playIntro]);

  useEffect(() => {
    specRef.current = spec;
    swapRef.current(spec);
  }, [spec]);

  useEffect(() => {
    if (resetSignal > 0) targetRef.current = { ...DEFAULT_VIEW };
  }, [resetSignal]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: WebGLRenderer;
    try {
      // MSAA is redundant at 2x density and costs fill rate there.
      renderer = new WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: true,
      });
    } catch {
      queueMicrotask(() => {
        setIsUnavailable(true);
        onUnavailableRef.current?.();
      });
      return;
    }
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    // Pixel ratio is the cheapest quality/cost dial: cap lower on touch devices.
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, coarsePointer ? 1.5 : 2),
    );
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = styles.canvas;
    container.appendChild(renderer.domElement);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    room.dispose();
    scene.environment = environment.texture;
    // Studio lights for aircraft that ask for them: the soft environment alone
    // shades everything evenly, and a glossy airframe needs highlights to read.
    const keyLight = new DirectionalLight(0xfff1e0, 0);
    keyLight.position.set(-3.5, 6, 4.5);
    const rimLight = new DirectionalLight(0x9ed3ea, 0);
    rimLight.position.set(4, 2.5, -5);
    scene.add(keyLight, rimLight);
    const applyLights = (model: DroneModel) => {
      keyLight.intensity = model.lit ? 1.25 : 0;
      rimLight.intensity = model.lit ? 1.0 : 0;
    };

    const camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
    camera.position.set(0, 6.6 * CAMERA_RISE, 6.6);
    camera.lookAt(0, -0.05, 0);

    const initialSpec = specRef.current;
    let drone = createDroneModel(
      "kind" in initialSpec ? initialSpec.kind : "compact",
    );
    let currentKey =
      "kind" in initialSpec
        ? specKey(initialSpec)
        : specKey({ kind: "compact" });
    let swapToken = 0;
    let isDisposed = false;
    let swapStart = -Infinity;
    const pivot = new Group();
    pivot.add(drone.group);
    scene.add(pivot);
    applyLights(drone);

    const shadowTexture = createShadowTexture(tone);
    const shadowGeometry = new PlaneGeometry(3.4, 3.4);
    const shadowMaterial = new MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    shadowMaterial.opacity = drone.shadow ?? 1;
    const shadow = new Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.05;
    scene.add(shadow);

    const view = { ...DEFAULT_VIEW };
    const velocity = { yaw: 0, pitch: 0 };
    let dragging = false;
    let lastPointer = { x: 0, y: 0, time: 0 };
    let lastInteraction = -Infinity;
    let visible = true;
    let frame = 0;
    let previousTime = performance.now();
    // Half the visible width at the aircraft's plane; the intro uses it to
    // size its flight path to whatever frame the stage currently has.
    let frameHalfWidth = 3;
    // Reduced motion has nothing to animate, so it only redraws when dirty.
    let dirty = true;
    const tilt = { x: 0, y: 0 };
    const tiltTarget = { x: 0, y: 0 };
    // Nose-follow: the pointer, how strongly the aircraft follows it, the direction it points
    // (screen space, y up), which side it shows, and its eased orientation.
    const pointer = { x: 0, y: 0, seen: false };
    const aimRaw = { x: 1, y: 0 };
    const aim = { x: 1, y: 0 };
    const qFollow = new Quaternion();
    const qTarget = new Quaternion();
    const qRoll = new Quaternion();
    const euler = new Euler();
    let follow = 0;
    let side = 1;
    let followReady = false;

    // Scripted entry flight. Only park the drone off-screen if the parent has
    // already asked for the intro and we haven't started it yet — that keeps
    // the drone at (0, 0, 0) for the return-visit path where no intro plays.
    if (
      playIntroRef.current &&
      !introStartedRef.current &&
      !introDoneRef.current
    ) {
      view.yaw = 0;
      view.pitch = 0.12;
      drone.group.position.set(-6, 0.4, 0);
      drone.group.scale.setScalar(0.6);
    }
    let didFireReady = false;

    const markInteraction = () => {
      lastInteraction = performance.now();
      targetRef.current = null;
      onInteractRef.current?.();
    };

    let sizedWidth = 0;
    let sizedHeight = 0;
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      // The dock transition resizes every frame; skip the buffer
      // reallocation when nothing changed.
      if (clientWidth !== sizedWidth || clientHeight !== sizedHeight) {
        sizedWidth = clientWidth;
        sizedHeight = clientHeight;
        renderer.setSize(clientWidth, clientHeight, false);
      }
      camera.aspect = clientWidth / clientHeight;
      // Fit the aircraft's reach (with 10% air) across the frame's width.
      const distance = Math.max(
        6,
        (drone.extent * 1.1) / (TAN_HALF_FOV * camera.aspect),
      );
      camera.position.set(0, distance * CAMERA_RISE, distance);
      // Re-aim every time: moving back without turning pushes the model off-centre.
      camera.lookAt(0, -0.05, 0);
      camera.updateProjectionMatrix();
      frameHalfWidth = TAN_HALF_FOV * distance * camera.aspect;
      dirty = true;
    };

    const applyModel = (model: DroneModel, token: number) => {
      if (isDisposed || token !== swapToken) {
        model.dispose();
        return;
      }
      pivot.remove(drone.group);
      drone.dispose();
      drone = model;
      pivot.add(drone.group);
      swapStart = performance.now();
      shadow.scale.setScalar(drone.extent / 1.7);
      shadowMaterial.opacity = drone.shadow ?? 1;
      applyLights(drone);
      resize();
    };

    swapRef.current = (next) => {
      const key = specKey(next);
      if (key === currentKey) return;
      currentKey = key;
      const token = ++swapToken;
      if ("kind" in next) {
        applyModel(createDroneModel(next.kind), token);
        return;
      }
      loadFileDroneModel(next.glbUrl, next.yaw).then(
        (model) => applyModel(model, token),
        () => {
          // Keep the model on screen if the file cannot be loaded.
          if (token === swapToken) currentKey = "";
        },
      );
    };

    const render = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;

      // --- Intro script -----------------------------------------------------
      // Viper's entry: fly in from the left side of the overlay, sweep across
      // to the right, swing back to the centre, nod to greet, and settle to
      // the hangar pose. Camera stays near front-on so motion is readable.
      //
      // The intro starts on the first frame on which the parent has flipped
      // `playIntro` on. We refuse to run until then so the parent can hold the
      // overlay invisible while three.js finishes loading, keeping the fly-in
      // phase from happening behind a dark overlay the user never sees.
      let introOverride = false;
      if (
        !introStartedRef.current &&
        !introDoneRef.current &&
        playIntroRef.current
      ) {
        introStartedRef.current = true;
        introStartRef.current = time;
        view.yaw = 0;
        view.pitch = 0.12;
        drone.group.position.set(-(frameHalfWidth + drone.extent), 0.4, 0);
        drone.group.scale.setScalar(0.6);
      }
      const introActive = introStartedRef.current && !introDoneRef.current;
      if (introActive) {
        const elapsed = time - introStartRef.current;
        const total = reducedMotion ? 1200 : INTRO_DURATION_MS;
        const t = clamp(elapsed / total, 0, 1);
        introOverride = true;

        const enterUntil = 0.18;
        const sweepUntil = 0.4;
        const arriveUntil = 0.55;
        const greetUntil = 0.78;

        const camYaw = 0;
        const camPitch = 0.12;
        const seconds = time / 1000;
        // Flight path measured against the frame: the aircraft enters from
        // just outside the left edge and sweeps as far as keeps it fully in view.
        const travel = clamp(
          frameHalfWidth - drone.extent * INTRO_SCALE * 1.05,
          0.25,
          1.8,
        );
        const startX = -(frameHalfWidth + drone.extent * 0.6);

        let px = 0;
        let py = 0;
        let rotX = 0;
        let rotZ = 0;
        let scale = 1;

        if (t <= enterUntil) {
          // Fly in from the left, slightly descending, banking right.
          const k = easeOutCubic(t / enterUntil);
          px = startX + (-travel - startX) * k; // off-screen → visible left
          py = 0.4 - 0.4 * k;
          scale = 0.6 + (INTRO_SCALE - 0.6) * k;
          rotZ = -0.35 * (1 - k * 0.3); // banked right (negative roll)
          view.yaw = camYaw;
          view.pitch = camPitch;
        } else if (t <= sweepUntil) {
          // Sweep across the screen to the right side.
          const k = easeInOutCubic(
            (t - enterUntil) / (sweepUntil - enterUntil),
          );
          px = -travel + 2 * travel * k; // crosses the centre
          py = Math.sin(seconds * 2) * 0.1;
          scale = INTRO_SCALE;
          rotZ = -0.25 + 0.55 * k; // transitions bank right → bank left
          view.yaw = camYaw;
          view.pitch = camPitch;
        } else if (t <= arriveUntil) {
          // Return from the right side and settle at the centre.
          const k = easeInOutCubic(
            (t - sweepUntil) / (arriveUntil - sweepUntil),
          );
          px = travel - travel * k; // back to the centre
          py = Math.sin(seconds * 1.6) * 0.08;
          scale = INTRO_SCALE;
          rotZ = 0.3 * (1 - k); // bank fades back to level
          view.yaw = camYaw;
          view.pitch = camPitch;
        } else if (t <= greetUntil) {
          // Hover centred and nod twice as a greeting.
          const k = (t - arriveUntil) / (greetUntil - arriveUntil);
          px = 0;
          py = Math.sin(seconds * 1.4) * 0.06;
          rotX = Math.sin(k * Math.PI * 2) * 0.3;
          rotZ = 0;
          scale = INTRO_SCALE;
          view.yaw = camYaw;
          view.pitch = camPitch;
        } else {
          // Blend pose and camera to the default hangar view.
          const k = easeInOutCubic((t - greetUntil) / (1 - greetUntil));
          px = 0;
          py = Math.sin(seconds * 1.6) * 0.045;
          rotX = 0;
          rotZ = 0;
          scale = INTRO_SCALE + (1 - INTRO_SCALE) * k;
          view.yaw = camYaw + (DEFAULT_VIEW.yaw - camYaw) * k;
          view.pitch = camPitch + (DEFAULT_VIEW.pitch - camPitch) * k;
        }

        drone.group.position.set(px, py, 0);
        drone.group.rotation.set(rotX, 0, rotZ);
        drone.group.scale.setScalar(scale);

        if (t >= 1) {
          introDoneRef.current = true;
          lastInteraction = time; // suppress idle spin for a moment
          velocity.yaw = velocity.pitch = 0;
          targetRef.current = null;
          drone.group.position.set(0, 0, 0);
          drone.group.rotation.set(0, 0, 0);
          drone.group.scale.setScalar(1);
          onIntroEndRef.current?.();
        }
      }

      if (!introOverride) {
        if (targetRef.current) {
          const ease = 1 - Math.exp(-delta * 7);
          view.yaw += (targetRef.current.yaw - view.yaw) * ease;
          view.pitch += (targetRef.current.pitch - view.pitch) * ease;
          velocity.yaw = velocity.pitch = 0;
          if (
            Math.abs(targetRef.current.yaw - view.yaw) < 0.002 &&
            Math.abs(targetRef.current.pitch - view.pitch) < 0.002
          ) {
            targetRef.current = null;
          }
        } else if (!dragging) {
          view.yaw += velocity.yaw * delta;
          view.pitch = clamp(
            view.pitch + velocity.pitch * delta,
            PITCH_LIMITS.min,
            PITCH_LIMITS.max,
          );
          const damping = Math.exp(-delta * 3.2);
          velocity.yaw *= damping;
          velocity.pitch *= damping;
          const idle = time - lastInteraction > IDLE_DELAY_MS;
          if (idle && !reducedMotion) view.yaw += delta * 0.28;
        }
      }

      // Nose-follow: while the pointer is near, the aircraft shows its profile and rolls in the plane
      // of the screen so its nose points at the pointer, even straight up (a climb) or down. Never
      // fights a drag, a reset or the intro.
      const followOn =
        followRef.current &&
        pointer.seen &&
        !reducedMotion &&
        !introOverride &&
        !dragging &&
        targetRef.current === null;
      let followTarget = 0;
      if (followOn) {
        const rect = container.getBoundingClientRect();
        const dx = pointer.x - (rect.left + rect.width / 2);
        const dy = pointer.y - (rect.top + rect.height / 2);
        const dist = Math.hypot(dx, dy);
        const reach = Math.max(rect.width, rect.height) * FOLLOW.reach;
        followTarget =
          1 -
          clamp(
            (dist - reach * FOLLOW.full) / (reach * (1 - FOLLOW.full)),
            0,
            1,
          );
        if (dist > FOLLOW.deadzone) {
          aimRaw.x = dx;
          aimRaw.y = -dy;
        }
      }
      follow +=
        (followTarget - follow) * (1 - Math.exp(-delta * FOLLOW.engage));
      // The pointer's direction is smoothed, so quick flicks of the mouse do not whip the nose around.
      const aimEase = 1 - Math.exp(-delta * FOLLOW.smoothing);
      aim.x += (aimRaw.x - aim.x) * aimEase;
      aim.y += (aimRaw.y - aim.y) * aimEase;
      if (follow > 0.01) {
        const theta = Math.atan2(aim.y, aim.x);
        // Profile with the nose to the right, or to the left when the pointer is left of the
        // vertical (with some margin so it does not flip back and forth), always right side up.
        if (side === 1 && Math.cos(theta) < -FOLLOW.hysteresis) side = -1;
        else if (side === -1 && Math.cos(theta) > FOLLOW.hysteresis) side = 1;
        const roll = side === 1 ? theta : wrapPi(theta - Math.PI);
        euler.set(FOLLOW.pitch, (side * Math.PI) / 2, 0, "YXZ");
        qTarget.setFromEuler(euler);
        qRoll.setFromAxisAngle(AXIS_Z, roll);
        qTarget.premultiply(qRoll);
        lastInteraction = time; // no idle spin while it is following (or right after)
        velocity.yaw = 0;
      }

      const swap = reducedMotion ? 1 : clamp((time - swapStart) / 480, 0, 1);
      if (!introOverride) {
        drone.group.scale.setScalar(0.78 + 0.22 * (1 - Math.pow(1 - swap, 3)));
      }
      // Pointer tilt eases toward its target and never fights a drag or the intro.
      const tiltEase = 1 - Math.exp(-delta * 4);
      const tiltOn = parallaxRef.current && !introOverride && !dragging;
      tilt.x += ((tiltOn ? tiltTarget.x : 0) - tilt.x) * tiltEase;
      tilt.y += ((tiltOn ? tiltTarget.y : 0) - tilt.y) * tiltEase;
      pivot.rotation.set(
        view.pitch + tilt.y * PARALLAX.pitch,
        view.yaw + tilt.x * PARALLAX.yaw,
        0,
        "YXZ",
      );
      if (follow > 0.01) {
        if (!followReady) {
          qFollow.copy(pivot.quaternion);
          followReady = true;
        }
        qFollow.slerp(qTarget, 1 - Math.exp(-delta * FOLLOW.turn));
        pivot.quaternion.slerp(qFollow, follow);
      } else {
        followReady = false;
      }
      if (!introOverride)
        drone.group.rotation.z = -tilt.x * PARALLAX.roll * (1 - follow);
      if (!reducedMotion) {
        if (!introOverride) {
          const seconds = time / 1000;
          drone.group.position.y = Math.sin(seconds * 1.6) * 0.045;
        }
        shadow.scale.setScalar(
          (drone.extent / 1.7) * (1 - Math.sin((time / 1000) * 1.6) * 0.04),
        );
        drone.propellers.forEach((propeller, index) => {
          propeller.rotation.y += delta * (index % 2 ? -26 : 26);
        });
      }
      const animating =
        !reducedMotion ||
        dirty ||
        dragging ||
        introActive ||
        targetRef.current !== null ||
        swap < 1 ||
        Math.abs(velocity.yaw) + Math.abs(velocity.pitch) > 0.001;
      if (animating) renderer.render(scene, camera);
      dirty = false;
      if (!didFireReady) {
        didFireReady = true;
        onReadyRef.current?.();
      }
      if (visible) frame = requestAnimationFrame(render);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      previousTime = performance.now();
      frame = requestAnimationFrame(render);
    };

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      renderer.domElement.setPointerCapture(event.pointerId);
      lastPointer = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
      };
      velocity.yaw = velocity.pitch = 0;
      markInteraction();
      container.dataset.dragging = "true";
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastPointer.x;
      const dy = event.clientY - lastPointer.y;
      const dt = Math.max((event.timeStamp - lastPointer.time) / 1000, 0.001);
      const yawStep = dx * 0.011;
      const pitchStep = dy * 0.009;
      view.yaw += yawStep;
      view.pitch = clamp(
        view.pitch + pitchStep,
        PITCH_LIMITS.min,
        PITCH_LIMITS.max,
      );
      velocity.yaw = yawStep / dt;
      velocity.pitch = pitchStep / dt;
      lastPointer = {
        x: event.clientX,
        y: event.clientY,
        time: event.timeStamp,
      };
      lastInteraction = performance.now();
      if (reducedMotion) velocity.yaw = velocity.pitch = 0;
      if (!visible) render(performance.now());
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      lastInteraction = performance.now();
      delete container.dataset.dragging;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      if (performance.now() - lastPointer.time > 90 - 0) {
        velocity.yaw = velocity.pitch = 0;
      }
      velocity.yaw = clamp(velocity.yaw, -9, 9);
      velocity.pitch = clamp(velocity.pitch, -6, 6);
    };

    const handleWindowPointerMove = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.seen = true;
      if (!parallaxRef.current) return;
      tiltTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
      tiltTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", handleWindowPointerMove, {
      passive: true,
    });
    const handlePointerLeave = () => {
      pointer.seen = false;
    };
    document.addEventListener("pointerleave", handlePointerLeave);

    nudgeRef.current = (yaw, pitch) => {
      markInteraction();
      targetRef.current = {
        yaw: view.yaw + yaw,
        pitch: clamp(view.pitch + pitch, PITCH_LIMITS.min, PITCH_LIMITS.max),
      };
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible) start();
    });
    visibilityObserver.observe(container);

    resize();
    start();
    swapRef.current(specRef.current);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frame);
      visible = false;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("pointermove", handleWindowPointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      nudgeRef.current = () => {};
      swapRef.current = () => {};
      drone.dispose();
      shadowGeometry.dispose();
      shadowMaterial.dispose();
      shadowTexture.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
    // playIntro reaches the render loop through playIntroRef; the useEffect
    // only rebuilds when `tone` changes (which affects the shadow texture).
  }, [tone]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      nudgeRef.current(...move);
    } else if (event.key === "Home") {
      event.preventDefault();
      targetRef.current = { ...DEFAULT_VIEW };
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.scene} ${tone === "dark" ? styles.dark : ""}`}
      role="group"
      tabIndex={0}
      aria-label="Modelo 3D ilustrativo de un dron de cuatro hélices. Arrástralo o usa las flechas para girarlo; Inicio lo restablece."
      onKeyDown={handleKeyDown}
    >
      {isUnavailable && (
        <p className={styles.fallback}>
          Tu navegador no puede mostrar la vista 3D. El equipo asignado se
          describe debajo.
        </p>
      )}
    </div>
  );
}
