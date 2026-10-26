"use client";

import { useEffect, useRef, useState } from "react";
import { Home, ZoomIn, ZoomOut } from "lucide-react";
import {
  ACESFilmicToneMapping,
  Box3,
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  Group,
  HemisphereLight,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Raycaster,
  Scene,
  Sphere,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import {
  createDroneModel,
  loadFileDroneModel,
  type DroneModel,
  type DroneModelSpec,
} from "./drone-model";
import styles from "./condition-scene.module.css";

export type ConditionSource =
  { kind: "spec"; spec: DroneModelSpec } | { kind: "scan"; url: string };

export interface SceneMark {
  id: string;
  /** Short text drawn on the pin, usually its number. */
  label: string;
  point: [number, number, number];
  /** Radius of the coloured area, as a fraction of the model's half-width. */
  radius: number;
  color: string;
}

/** A named part of the aircraft that has a known place on the model. */
export interface ScenePart {
  id: string;
  /** Number shown on the marker when the parts are displayed. */
  label: string;
  /** Text of the tooltip shown while the pointer is over the part. */
  text: string;
  point: [number, number, number];
}

export interface ScenePick {
  point: [number, number, number];
  /** Half-width of the model, to scale the point. */
  extent: number;
}

export type SceneStatus = "loading" | "ready" | "error" | "unavailable";

export type ViewName =
  "three-quarter" | "front" | "rear" | "left" | "right" | "top" | "bottom";

/** The front of every model is on its -z side, so "front" looks from -z. */
const VIEWS: Record<ViewName, { yaw: number; pitch: number }> = {
  "three-quarter": { yaw: -0.65, pitch: 0.3 },
  front: { yaw: Math.PI, pitch: 0.12 },
  rear: { yaw: 0, pitch: 0.12 },
  left: { yaw: -Math.PI / 2, pitch: 0.12 },
  right: { yaw: Math.PI / 2, pitch: 0.12 },
  top: { yaw: Math.PI, pitch: 1.5 },
  bottom: { yaw: Math.PI, pitch: -1.45 },
};

const MAX_MARKS = 40;
const SCAN_SIZE = 3.3;
const PITCH = { min: -1.5, max: 1.55 };
const KEY_STEP = 0.2;
/** How close to a part's anchor the pointer must be, as a fraction of the model's half-width. */
const PART_REACH = 0.3;
const START_ZOOM = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Loads a scan or downloaded model keeping its own materials and textures. */
async function loadScanModel(url: string): Promise<DroneModel> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url);
  const box = new Box3().setFromObject(gltf.scene);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const scale = SCAN_SIZE / Math.max(size.x, size.y, size.z, 1e-6);
  gltf.scene.scale.setScalar(scale);
  gltf.scene.position.copy(center).multiplyScalar(-scale);
  const group = new Group();
  group.add(gltf.scene);
  return {
    group,
    propellers: [],
    extent: SCAN_SIZE / 2,
    dispose: () => {
      gltf.scene.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        const materials: Material[] = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value && typeof value === "object" && "isTexture" in value) {
              (value as { dispose: () => void }).dispose();
            }
          });
          material.dispose();
        });
      });
    },
  };
}

function pinTexture(label: string, color: string, selected: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    if (selected) {
      context.beginPath();
      context.arc(64, 64, 60, 0, Math.PI * 2);
      context.strokeStyle = "#0f3447";
      context.lineWidth = 6;
      context.stroke();
    }
    context.beginPath();
    context.arc(64, 64, 46, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 8;
    context.strokeStyle = "#ffffff";
    context.stroke();
    context.fillStyle = "#ffffff";
    context.font = "700 54px system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, 64, 68);
  }
  return new CanvasTexture(canvas);
}

/** Smaller, outlined marker for the parts of the manual, so it reads apart from a condition pin. */
function partTexture(label: string, active: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 96;
  const context = canvas.getContext("2d");
  if (context) {
    context.beginPath();
    context.arc(48, 48, 40, 0, Math.PI * 2);
    context.fillStyle = active ? "#0f3447" : "rgba(255,255,255,0.94)";
    context.fill();
    context.lineWidth = 6;
    context.strokeStyle = active ? "#ffffff" : "#0f3447";
    context.stroke();
    context.fillStyle = active ? "#ffffff" : "#0f3447";
    context.font = "700 38px system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(label, 48, 51);
  }
  return new CanvasTexture(canvas);
}

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 64);
    gradient.addColorStop(0, "rgba(2, 14, 9, 0.55)");
    gradient.addColorStop(1, "rgba(2, 14, 9, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
}

/**
 * Lets the standard material paint coloured spots on any surface near the marks, and
 * darkens surfaces that face down so the shape reads without relying on the environment.
 */
function patchMaterial(
  material: MeshStandardMaterial,
  uniforms: {
    uMarks: { value: Vector4[] };
    uColors: { value: Vector3[] };
    uCount: { value: number };
  },
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMarks = uniforms.uMarks;
    shader.uniforms.uColors = uniforms.uColors;
    shader.uniforms.uCount = uniforms.uCount;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vSpot;\nvarying float vUp;",
      )
      .replace(
        "#include <beginnormal_vertex>",
        "#include <beginnormal_vertex>\nvUp = normalize(mat3(modelMatrix) * objectNormal).y;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvSpot = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vSpot;
varying float vUp;
uniform vec4 uMarks[${MAX_MARKS}];
uniform vec3 uColors[${MAX_MARKS}];
uniform float uCount;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
diffuseColor.rgb *= 0.6 + 0.4 * clamp(vUp * 0.5 + 0.5, 0.0, 1.0);
float spotA = 0.0;
vec3 spotC = vec3(0.0);
for (int i = 0; i < ${MAX_MARKS}; i++) {
  if (float(i) >= uCount) break;
  float k = 1.0 - smoothstep(uMarks[i].w * 0.78, uMarks[i].w, distance(vSpot, uMarks[i].xyz));
  if (k > spotA) { spotA = k; spotC = uColors[i]; }
}
diffuseColor.rgb = mix(diffuseColor.rgb, spotC * 0.6, spotA);`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.95, spotA);",
      )
      .replace(
        "#include <metalnessmap_fragment>",
        "#include <metalnessmap_fragment>\nmetalnessFactor *= 1.0 - spotA;",
      )
      .replace(
        "#include <opaque_fragment>",
        "outgoingLight = mix(outgoingLight, spotC * 0.85, spotA * 0.8);\n#include <opaque_fragment>",
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += spotC * spotA * 0.12;",
      );
  };
  material.customProgramCacheKey = () => "otear-condition-spots-v7";
  material.needsUpdate = true;
}

export function ConditionScene({
  source,
  marks,
  draft,
  highlights,
  label,
  callouts,
  parts,
  showParts,
  activePartId,
  selectedId,
  placing,
  focus,
  view,
  onPick,
  onSelect,
  onPickPart,
  onStatus,
}: {
  source: ConditionSource;
  marks: SceneMark[];
  /** Spot being placed, not saved yet. */
  draft?: Omit<SceneMark, "id" | "label"> | null;
  /** Coloured areas without a pin: the selected part, or a heat map. */
  highlights?: Omit<SceneMark, "id" | "label">[];
  /** Short tags that stay next to the parts that need attention. */
  callouts?: {
    id: string;
    point: [number, number, number];
    text: string;
    color: string;
  }[];
  /** Name shown next to a point, for the selected part. */
  label?: { point: [number, number, number]; text: string } | null;
  /** Parts of the manual with a known place on this model. */
  parts?: ScenePart[];
  /** Draws a numbered marker on each part. Tooltips work either way. */
  showParts?: boolean;
  activePartId?: string;
  selectedId?: string;
  /** Shows a crosshair; clicking on the model reports a pick either way. */
  placing?: boolean;
  /** Change `n` to turn the camera toward a mark or a part. */
  focus?: { point: [number, number, number]; n: number };
  /** Change `n` to move the camera to a standard view. */
  view?: { name: ViewName; n: number };
  onPick: (pick: ScenePick) => void;
  onSelect: (id: string) => void;
  onPickPart?: (id: string) => void;
  onStatus?: (status: SceneStatus) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const nameTag = useRef<HTMLDivElement>(null);
  const calloutEls = useRef(new Map<string, HTMLDivElement>());
  const calloutsRef = useRef(callouts);
  const sourceRef = useRef(source);
  const live = useRef({ onPick, onSelect, onPickPart, onStatus, parts });
  const api = useRef<{
    setMarks: (
      marks: SceneMark[],
      draft: SceneMark | null,
      selected: string | undefined,
      highlights: Omit<SceneMark, "id" | "label">[],
    ) => void;
    setLabel: (
      label: { point: [number, number, number]; text: string } | null,
    ) => void;
    setParts: (parts: ScenePart[], show: boolean, active?: string) => void;
    focusOn: (point: [number, number, number]) => void;
    setView: (name: ViewName) => void;
    zoom: (factor: number) => void;
    reset: () => void;
    nudge: (yaw: number, pitch: number) => void;
  } | null>(null);
  const [status, setStatus] = useState<SceneStatus>("loading");

  useEffect(() => {
    live.current = { onPick, onSelect, onPickPart, onStatus, parts };
    calloutsRef.current = callouts;
  });

  useEffect(() => {
    api.current?.setMarks(
      marks,
      draft ? { ...draft, id: "draft", label: "+" } : null,
      selectedId,
      highlights ?? [],
    );
  }, [marks, draft, selectedId, highlights, status]);

  useEffect(() => {
    api.current?.setLabel(label ?? null);
  }, [label, status]);

  useEffect(() => {
    api.current?.setParts(parts ?? [], Boolean(showParts), activePartId);
  }, [parts, showParts, activePartId, status]);

  useEffect(() => {
    if (focus) api.current?.focusOn(focus.point);
    // Only a new request should move the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.n]);

  useEffect(() => {
    if (view) api.current?.setView(view.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.n]);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => {
        setStatus("unavailable");
        live.current.onStatus?.("unavailable");
      });
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    renderer.domElement.className = styles.canvas;
    node.appendChild(renderer.domElement);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;
    scene.add(new HemisphereLight(0xe8f5ee, 0x0f2a21, 0.4));
    const key = new DirectionalLight(0xffffff, 1.7);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new DirectionalLight(0xa5d8ee, 0.9);
    rim.position.set(-4, 2, -3);
    scene.add(rim);
    const camera = new PerspectiveCamera(30, 1, 0.1, 80);

    const floorTexture = shadowTexture();
    const floorGeometry = new PlaneGeometry(1, 1);
    const floorMaterial = new MeshBasicMaterial({
      map: floorTexture,
      transparent: true,
      depthWrite: false,
    });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const uniforms = {
      uMarks: {
        value: Array.from({ length: MAX_MARKS }, () => new Vector4()),
      },
      uColors: {
        value: Array.from({ length: MAX_MARKS }, () => new Vector3()),
      },
      uCount: { value: 0 },
    };

    let model: DroneModel | null = null;
    let disposed = false;
    let extent = 1.7;
    const view = { ...VIEWS["three-quarter"] };
    let zoom = START_ZOOM;
    let target: { yaw: number; pitch: number } | null = null;
    let dragging = false;
    let moved = 0;
    let last = { x: 0, y: 0 };
    let visible = true;
    let frame = 0;
    let hover: { x: number; y: number; at: number } | null = null;
    let labelTarget: { point: [number, number, number]; text: string } | null =
      null;
    let pins: { id: string; sprite: Sprite; material: SpriteMaterial }[] = [];
    let partPins: { id: string; sprite: Sprite; material: SpriteMaterial }[] =
      [];
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const toward = new Vector3();

    let fitRadius = extent * 1.35;
    /** Distance that keeps the whole aircraft in view, whatever its size and the frame's shape. */
    const distance = () => {
      const aspect = Math.max(
        node.clientWidth / Math.max(node.clientHeight, 1),
        0.4,
      );
      const vertical = Math.PI / 12;
      const half = Math.min(vertical, Math.atan(Math.tan(vertical) * aspect));
      return ((fitRadius / Math.sin(half)) * 0.54) / zoom;
    };

    const resize = () => {
      const { clientWidth, clientHeight } = node;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const dispose = (list: typeof pins) => {
      list.forEach(({ sprite, material }) => {
        scene.remove(sprite);
        material.map?.dispose();
        material.dispose();
      });
    };

    const place = (
      text: string,
      point: [number, number, number],
      texture: CanvasTexture,
      size: number,
      id: string,
    ) => {
      const material = new SpriteMaterial({
        map: texture,
        transparent: true,
        toneMapped: false,
      });
      const sprite = new Sprite(material);
      sprite.scale.setScalar(extent * size);
      sprite.userData = { id, point, text };
      sprite.renderOrder = 5;
      scene.add(sprite);
      return { id, sprite, material };
    };

    const setStatusBoth = (next: SceneStatus) => {
      setStatus(next);
      live.current.onStatus?.(next);
    };

    api.current = {
      setMarks: (list, draftMark, selected, areas) => {
        const all = draftMark ? [...list, draftMark] : list;
        const painted = [
          ...all,
          ...areas.map((area) => ({ ...area, id: "", label: "" })),
        ];
        uniforms.uCount.value = Math.min(painted.length, MAX_MARKS);
        painted.slice(0, MAX_MARKS).forEach((mark, index) => {
          uniforms.uMarks.value[index].set(
            mark.point[0],
            mark.point[1],
            mark.point[2],
            mark.radius * extent,
          );
          const hex = parseInt(mark.color.slice(1), 16);
          uniforms.uColors.value[index].set(
            ((hex >> 16) & 255) / 255,
            ((hex >> 8) & 255) / 255,
            (hex & 255) / 255,
          );
        });
        dispose(pins);
        pins = all.map((mark) =>
          place(
            mark.label,
            mark.point,
            pinTexture(mark.label, mark.color, mark.id === selected),
            mark.id === selected ? 0.24 : 0.19,
            mark.id,
          ),
        );
      },
      setLabel: (next) => {
        labelTarget = next;
        const tag = nameTag.current;
        if (tag) {
          tag.textContent = next?.text ?? "";
          if (!next) tag.dataset.show = "false";
        }
      },
      setParts: (list, show, active) => {
        dispose(partPins);
        partPins = show
          ? list.map((part) =>
              place(
                part.label,
                part.point,
                partTexture(part.label, part.id === active),
                part.id === active ? 0.17 : 0.13,
                part.id,
              ),
            )
          : [];
      },
      focusOn: (point) => {
        const [x, y, z] = point;
        const yaw = Math.atan2(x, z);
        const pitch = clamp(Math.atan2(y, Math.hypot(x, z)) + 0.2, -0.3, 1.1);
        if (reduced) {
          view.yaw = yaw;
          view.pitch = pitch;
        } else target = { yaw, pitch };
      },
      setView: (name) => {
        if (reduced) Object.assign(view, VIEWS[name]);
        else target = { ...VIEWS[name] };
      },
      zoom: (factor) => {
        zoom = clamp(zoom * factor, 0.6, 3.2);
      },
      reset: () => {
        zoom = START_ZOOM;
        if (reduced) Object.assign(view, VIEWS["three-quarter"]);
        else target = { ...VIEWS["three-quarter"] };
      },
      nudge: (yaw, pitch) => {
        target = null;
        view.yaw += yaw;
        view.pitch = clamp(view.pitch + pitch, PITCH.min, PITCH.max);
      },
    };

    const attach = (loaded: DroneModel) => {
      if (disposed) {
        loaded.dispose();
        return;
      }
      model = loaded;
      extent = loaded.extent;
      floor.scale.setScalar(extent * 2.6);
      const done = new Set<Material>();
      loaded.group.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => {
          if (!(material instanceof MeshStandardMaterial) || done.has(material))
            return;
          done.add(material);
          if (material.transparent) {
            // Propeller envelopes: keep them as a faint hint so they don't hide the aircraft.
            material.opacity = Math.min(material.opacity, 0.045);
          } else {
            // The simplified meshes have open seams; drawing both faces closes them.
            material.side = DoubleSide;
            material.color.multiplyScalar(0.62);
            material.envMapIntensity = 0.7;
            material.metalness = Math.max(material.metalness, 0.2);
            material.roughness = Math.max(material.roughness, 0.5);
            patchMaterial(material, uniforms);
          }
        });
      });
      const bounds = new Box3().setFromObject(loaded.group);
      fitRadius = bounds.getBoundingSphere(new Sphere()).radius;
      floor.position.y = bounds.min.y - 0.12;
      scene.add(loaded.group);
      resize();
      setStatusBoth("ready");
    };
    const fail = () => {
      if (!disposed) setStatusBoth("error");
    };
    const from = sourceRef.current;
    live.current.onStatus?.("loading");
    if (from.kind === "scan") loadScanModel(from.url).then(attach, fail);
    else if ("kind" in from.spec) attach(createDroneModel(from.spec.kind));
    else loadFileDroneModel(from.spec.glbUrl, from.spec.yaw).then(attach, fail);

    const modelHit = () =>
      model
        ? raycaster
            .intersectObject(model.group, true)
            .find(
              (item) =>
                item.object instanceof Mesh &&
                !(
                  !Array.isArray(item.object.material) &&
                  item.object.material.transparent &&
                  item.object.material.opacity < 0.5
                ),
            )
        : undefined;

    const aim = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
    };

    /** Name of the part under the pointer, from the closest anchor to the surface point hit. */
    const updateTooltip = (clientX: number, clientY: number) => {
      const bubble = tooltip.current;
      if (!bubble) return;
      aim(clientX, clientY);
      const hit = modelHit();
      let text = "";
      if (hit) {
        let best = Infinity;
        for (const part of live.current.parts ?? []) {
          const d = toward.set(...part.point).distanceTo(hit.point);
          if (d < extent * PART_REACH && d < best) {
            best = d;
            text = part.text;
          }
        }
      }
      if (!text) {
        bubble.dataset.show = "false";
        return;
      }
      const rect = node.getBoundingClientRect();
      bubble.textContent = text;
      bubble.style.transform = `translate(${clientX - rect.left + 14}px, ${clientY - rect.top + 16}px)`;
      bubble.dataset.show = "true";
    };

    const render = (time: number) => {
      if (hover && time - hover.at > 70) {
        if (!dragging) updateTooltip(hover.x, hover.y);
        hover = null;
      }
      if (target) {
        const ease = reduced ? 1 : 0.14;
        let dyaw = target.yaw - view.yaw;
        dyaw = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
        view.yaw += dyaw * ease;
        view.pitch += (target.pitch - view.pitch) * ease;
        if (
          Math.abs(dyaw) < 0.003 &&
          Math.abs(target.pitch - view.pitch) < 0.003
        )
          target = null;
      }
      const d = distance();
      camera.position.set(
        Math.sin(view.yaw) * Math.cos(view.pitch) * d,
        Math.sin(view.pitch) * d + 0.05,
        Math.cos(view.yaw) * Math.cos(view.pitch) * d,
      );
      camera.lookAt(0, 0, 0);
      [...pins, ...partPins].forEach(({ sprite }) => {
        toward.set(...(sprite.userData.point as [number, number, number]));
        sprite.position
          .copy(toward)
          .addScaledVector(
            camera.position.clone().sub(toward).normalize(),
            extent * 0.07,
          );
      });
      calloutsRef.current?.forEach((callout) => {
        const el = calloutEls.current.get(callout.id);
        if (!el) return;
        toward.set(...callout.point).project(camera);
        const w = node.clientWidth;
        const h = node.clientHeight;
        const x = (toward.x * 0.5 + 0.5) * w;
        const y = (-toward.y * 0.5 + 0.5) * h;
        el.style.transform = `translate(${Math.min(Math.max(x + 12, 6), w - el.offsetWidth - 6)}px, ${Math.min(Math.max(y - 34, 6), h - 40)}px)`;
        el.dataset.show = toward.z < 1 ? "true" : "false";
      });
      const tag = nameTag.current;
      if (tag && labelTarget) {
        toward.set(...labelTarget.point).project(camera);
        const w = node.clientWidth;
        const h = node.clientHeight;
        const x = (toward.x * 0.5 + 0.5) * w;
        const y = (-toward.y * 0.5 + 0.5) * h;
        const left = Math.min(Math.max(x + 18, 8), w - tag.offsetWidth - 8);
        const top = Math.min(Math.max(y - 44, 8), h - 56);
        tag.style.transform = `translate(${left}px, ${top}px)`;
        tag.dataset.show = toward.z < 1 ? "true" : "false";
      }
      renderer.render(scene, camera);
      if (visible) frame = requestAnimationFrame(render);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };

    const canvas = renderer.domElement;
    const down = (event: PointerEvent) => {
      dragging = true;
      moved = 0;
      last = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      target = null;
      node.dataset.dragging = "true";
      if (tooltip.current) tooltip.current.dataset.show = "false";
    };
    const move = (event: PointerEvent) => {
      if (!dragging) {
        hover = { x: event.clientX, y: event.clientY, at: performance.now() };
        return;
      }
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      moved += Math.abs(dx) + Math.abs(dy);
      view.yaw -= dx * 0.009;
      view.pitch = clamp(view.pitch + dy * 0.008, PITCH.min, PITCH.max);
      last = { x: event.clientX, y: event.clientY };
    };
    const leave = () => {
      hover = null;
      if (tooltip.current) tooltip.current.dataset.show = "false";
    };
    const up = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete node.dataset.dragging;
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId);
      if (moved > 6 || !model) return;
      aim(event.clientX, event.clientY);
      const pinHit = raycaster.intersectObjects(
        pins.map((pin) => pin.sprite),
      )[0];
      const pinId = pinHit?.object.userData.id as string | undefined;
      if (pinId && pinId !== "draft") {
        live.current.onSelect(pinId);
        return;
      }
      const partHit = raycaster.intersectObjects(
        partPins.map((pin) => pin.sprite),
      )[0];
      if (partHit) {
        live.current.onPickPart?.(partHit.object.userData.id as string);
        return;
      }
      const hit = modelHit();
      if (hit) {
        live.current.onPick({
          point: [hit.point.x, hit.point.y, hit.point.z],
          extent,
        });
      }
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(node);
    const visibility = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) start();
    });
    visibility.observe(node);
    resize();
    start();

    return () => {
      disposed = true;
      api.current = null;
      cancelAnimationFrame(frame);
      visible = false;
      resizeObserver.disconnect();
      visibility.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      dispose(pins);
      dispose(partPins);
      model?.dispose();
      floorTexture.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  function handleKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    };
    const step = moves[event.key];
    if (step) {
      event.preventDefault();
      api.current?.nudge(...step);
    } else if (event.key === "+" || event.key === "=") api.current?.zoom(1.2);
    else if (event.key === "-") api.current?.zoom(1 / 1.2);
    else if (event.key === "Home") api.current?.reset();
  }

  return (
    <div
      ref={container}
      className={styles.scene}
      data-placing={placing ? "true" : undefined}
      role="group"
      tabIndex={0}
      aria-label="Modelo 3D de la aeronave. Arrástrelo para girarlo; toque una parte para marcarla. Flechas giran, más y menos acercan, Inicio restablece. La lista de partes tiene la misma información."
      onKeyDown={handleKey}
    >
      {callouts?.map((callout) => (
        <div
          key={callout.id}
          ref={(el) => {
            if (el) calloutEls.current.set(callout.id, el);
            else calloutEls.current.delete(callout.id);
          }}
          className={styles.callout}
          data-show="false"
          aria-hidden="true"
        >
          <i style={{ background: callout.color }} />
          {callout.text}
        </div>
      ))}
      <div
        ref={nameTag}
        className={styles.nameTag}
        data-show="false"
        aria-hidden="true"
      />
      <div
        ref={tooltip}
        className={styles.tooltip}
        data-show="false"
        aria-hidden="true"
      />
      {status === "loading" && (
        <p className={styles.message}>Preparando el modelo…</p>
      )}
      {status === "error" && (
        <p className={styles.message}>
          No se pudo leer el modelo. Si es un escaneo, expórtelo como .glb e
          inténtelo de nuevo.
        </p>
      )}
      {status === "unavailable" && (
        <p className={styles.message}>
          Este navegador no puede mostrar la vista 3D. Use la lista de partes
          para registrar el estado.
        </p>
      )}
      {status === "ready" && (
        <div className={styles.tools}>
          <button
            type="button"
            aria-label="Acercar"
            onClick={() => api.current?.zoom(1.25)}
          >
            <ZoomIn size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Alejar"
            onClick={() => api.current?.zoom(0.8)}
          >
            <ZoomOut size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Restablecer la vista"
            onClick={() => api.current?.reset()}
          >
            <Home size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
