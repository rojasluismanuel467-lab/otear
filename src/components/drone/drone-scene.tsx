"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
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

type DroneSceneProps = {
  /** Increment to animate the model back to its default orientation. */
  spec: DroneModelSpec;
  resetSignal: number;
  onInteract?: () => void;
  onUnavailable?: () => void;
  /** "dark" renders on a transparent stage meant to sit over a dark surface. */
  tone?: "light" | "dark";
  /** When true, play a scripted entry flight for ~6.5s before interactive mode. */
  playIntro?: boolean;
  /** Fired once when the scripted intro has finished. */
  onIntroEnd?: () => void;
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
}: DroneSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<{ yaw: number; pitch: number } | null>(null);
  const nudgeRef = useRef<(yaw: number, pitch: number) => void>(() => {});
  const specRef = useRef(spec);
  const swapRef = useRef<(next: DroneModelSpec) => void>(() => {});
  const onInteractRef = useRef(onInteract);
  const onUnavailableRef = useRef(onUnavailable);
  const onIntroEndRef = useRef(onIntroEnd);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    onInteractRef.current = onInteract;
    onUnavailableRef.current = onUnavailable;
    onIntroEndRef.current = onIntroEnd;
  }, [onInteract, onUnavailable, onIntroEnd]);

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
      renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => {
        setIsUnavailable(true);
        onUnavailableRef.current?.();
      });
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.className = styles.canvas;
    container.appendChild(renderer.domElement);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;

    const camera = new PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 1.5, 6.6);
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

    const shadowTexture = createShadowTexture(tone);
    const shadowGeometry = new PlaneGeometry(3.4, 3.4);
    const shadowMaterial = new MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
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

    // Scripted entry flight: when `playIntro` is on, the first ~6.5s of the
    // scene are driven by this timeline instead of the usual idle/orbit logic.
    const introActive = playIntro;
    const introStart = performance.now();
    let introDone = !playIntro;
    if (playIntro) {
      // Hold at opening pose so the first frame doesn't show the default view
      view.yaw = 0;
      view.pitch = 0.55;
    }

    const markInteraction = () => {
      lastInteraction = performance.now();
      targetRef.current = null;
      onInteractRef.current?.();
    };

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.position.z = Math.max(6, (4.1 * drone.extent) / camera.aspect);
      camera.updateProjectionMatrix();
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
      // Four phases: approach from above, hover, nod to greet, settle to
      // default pose. Overrides targets/velocity during the sequence.
      let introOverride = false;
      if (introActive && !introDone) {
        const elapsed = time - introStart;
        const total = reducedMotion ? 1200 : INTRO_DURATION_MS;
        const t = clamp(elapsed / total, 0, 1);
        introOverride = true;

        // Phase splits (fractions of total intro duration)
        const approachUntil = 0.18;
        const hoverUntil = 0.5;
        const greetUntil = 0.72;

        if (t <= approachUntil) {
          const k = easeOutCubic(t / approachUntil);
          drone.group.position.y = 4.2 - 4.2 * k;
          drone.group.rotation.y = -Math.PI * 2 * (1 - k);
          drone.group.rotation.x = 0;
          view.yaw = 0;
          view.pitch = 0.55 - 0.15 * k;
          const scale = 0.3 + 0.72 * k;
          drone.group.scale.setScalar(scale);
        } else if (t <= hoverUntil) {
          const k = easeInOutCubic(
            (t - approachUntil) / (hoverUntil - approachUntil),
          );
          const seconds = time / 1000;
          drone.group.position.y = Math.sin(seconds * 1.4) * 0.08;
          drone.group.rotation.y = -Math.PI * 0.6 * (1 - k);
          drone.group.rotation.x = 0;
          view.yaw = 0 + (-0.4 - 0) * k;
          view.pitch = 0.4 + (0.3 - 0.4) * k;
          drone.group.scale.setScalar(1.02);
        } else if (t <= greetUntil) {
          const k = (t - hoverUntil) / (greetUntil - hoverUntil);
          // Two-cycle nod — tilt forward and back twice
          drone.group.rotation.x = Math.sin(k * Math.PI * 2) * 0.3;
          drone.group.rotation.y = 0;
          const seconds = time / 1000;
          drone.group.position.y = Math.sin(seconds * 1.4) * 0.05;
          view.yaw = -0.4;
          view.pitch = 0.3;
          drone.group.scale.setScalar(1.02);
        } else {
          const k = easeInOutCubic((t - greetUntil) / (1 - greetUntil));
          drone.group.rotation.x = 0.3 * Math.sin(Math.PI * 2) * (1 - k); // settle
          drone.group.rotation.y = 0;
          const seconds = time / 1000;
          drone.group.position.y = Math.sin(seconds * 1.6) * 0.045;
          view.yaw = -0.4 + (DEFAULT_VIEW.yaw - -0.4) * k;
          view.pitch = 0.3 + (DEFAULT_VIEW.pitch - 0.3) * k;
          drone.group.scale.setScalar(1.02 + (1 - 1.02) * k);
        }

        if (t >= 1) {
          introDone = true;
          lastInteraction = time; // suppress idle spin for a moment
          velocity.yaw = velocity.pitch = 0;
          targetRef.current = null;
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

      const swap = reducedMotion ? 1 : clamp((time - swapStart) / 480, 0, 1);
      if (!introOverride) {
        drone.group.scale.setScalar(0.78 + 0.22 * (1 - Math.pow(1 - swap, 3)));
      }
      pivot.rotation.set(view.pitch, view.yaw, 0, "YXZ");
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
      renderer.render(scene, camera);
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
    // playIntro is intentionally captured at mount: it is a one-shot entry
    // flight, not something to re-trigger when the prop toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
