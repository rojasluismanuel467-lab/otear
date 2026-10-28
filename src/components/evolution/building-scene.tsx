"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  EdgesGeometry,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Material,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { LoadedModel } from "./model-loader";
import styles from "./building-scene.module.css";

const WIDTH = 11;
const DEPTH = 7;
const FLOOR_HEIGHT = 1.4;
const SLAB = 0.14;
const CONCRETE = 0xe4e8ea;
const NEW_WORK = 0x2b8fb3;
const GLASS = 0x3f6277;

export interface BuildingMarker {
  id: string;
  /** Position along the width of the building, from -1 (left) to 1 (right). */
  x: number;
  /** Height in floors. */
  level: number;
  tone: "danger" | "warning" | "info";
  label: string;
}

export interface BuildingSceneProps {
  /** Floors built, with decimals for the one under construction. */
  levels: number;
  /** Floors in the design. */
  planned: number;
  /** Floors at the date being compared with, if any. */
  reference?: number | null;
  /** A model loaded from a survey deliverable; replaces the schematic when present. */
  model?: LoadedModel | null;
  /** Issues pinned on the building; each is a button over the model. */
  markers?: BuildingMarker[];
  selectedMarkerId?: string;
  onMarkerSelect?: (id: string) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Pale site ground with a fine survey grid, so scale reads without labels. */
function groundTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#eef2f4";
    context.fillRect(0, 0, size, size);
    context.strokeStyle = "rgba(28, 111, 141, 0.16)";
    context.lineWidth = 1;
    for (let i = 0; i <= size; i += size / 8) {
      context.beginPath();
      context.moveTo(i + 0.5, 0);
      context.lineTo(i + 0.5, size);
      context.moveTo(0, i + 0.5);
      context.lineTo(size, i + 0.5);
      context.stroke();
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = 1000;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * The building as a schematic that grows floor by floor, or the model loaded from a survey
 * deliverable. In the schematic, built floors are solid with a glazed band, the one in
 * progress shows its columns, planned floors are outlines, and work done since the reference
 * date is tinted. It is not a reconstruction from images.
 */
export function BuildingScene({
  levels,
  planned,
  reference,
  model,
  markers,
  selectedMarkerId,
  onMarkerSelect,
}: BuildingSceneProps) {
  const container = useRef<HTMLDivElement>(null);
  const target = useRef({ levels, reference: reference ?? null });
  const [unavailable, setUnavailable] = useState(false);
  const markerEls = useRef(new Map<string, HTMLButtonElement>());
  const markersRef = useRef(markers);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    target.current = { levels, reference: reference ?? null };
  }, [levels, reference]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      queueMicrotask(() => setUnavailable(true));
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.domElement.className = styles.canvas;
    element.appendChild(renderer.domElement);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;
    scene.add(
      new HemisphereLight(0xf2f8fb, 0xc9d3d9, 0.55),
      new AmbientLight(0xffffff, 0.15),
    );
    const sun = new DirectionalLight(0xfff6e8, 2.4);
    sun.position.set(9, 16, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -16;
    sun.shadow.camera.right = 16;
    sun.shadow.camera.top = 16;
    sun.shadow.camera.bottom = -16;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 60;
    sun.shadow.bias = -0.0004;
    scene.add(sun);
    const camera = new PerspectiveCamera(32, 1, 0.1, 300);

    const geometries: BufferGeometry[] = [];
    const materials: Material[] = [];
    const textures: CanvasTexture[] = [];
    const track = <T extends BufferGeometry>(geometry: T) => {
      geometries.push(geometry);
      return geometry;
    };

    // Site ground with grid, plus a catcher that draws only the shadows.
    const ground = new Mesh(
      track(new CircleGeometry(20, 72)),
      new MeshStandardMaterial({ map: groundTexture(), roughness: 1 }),
    );
    const groundMaterial = ground.material as MeshStandardMaterial;
    textures.push(groundMaterial.map as CanvasTexture);
    materials.push(groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    const building = new Group();
    scene.add(building);
    const modelBox = {
      height: Math.max(planned, 4) * FLOOR_HEIGHT,
      depth: DEPTH,
      real: false,
    };

    const ghostMaterial = new LineBasicMaterial({
      color: 0x7d93a1,
      transparent: true,
      opacity: 0.75,
    });
    const referenceMaterial = new LineBasicMaterial({ color: 0x2b8fb3 });
    const columnMaterial = new MeshStandardMaterial({
      color: 0x8a98a1,
      roughness: 0.6,
    });
    const glassMaterial = new MeshStandardMaterial({
      color: GLASS,
      roughness: 0.18,
      metalness: 0.55,
    });
    const coreMaterial = new MeshStandardMaterial({
      color: 0xbfc9cf,
      roughness: 0.8,
    });
    const craneMaterial = new MeshStandardMaterial({
      color: 0xd9a526,
      roughness: 0.5,
    });
    materials.push(
      ghostMaterial,
      referenceMaterial,
      columnMaterial,
      glassMaterial,
      coreMaterial,
      craneMaterial,
    );

    type Floor = {
      group: Group;
      ghost: LineSegments;
      columns: Group;
      wall: MeshStandardMaterial;
      slab: MeshStandardMaterial;
    };
    let floors: Floor[] = [];
    let mast: Mesh | null = null;
    let jib: Group | null = null;
    let crane: Group | null = null;
    let referenceLine: LineLoop | null = null;
    let sceneryBottom = 0;

    if (model) {
      model.object.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      building.add(model.object);
      modelBox.height = model.height;
      modelBox.depth = model.depth;
      modelBox.real = true;
      sceneryBottom = 0;
    } else {
      const count = Math.max(1, Math.round(planned));
      const slabGeometry = track(new BoxGeometry(WIDTH, SLAB, DEPTH));
      slabGeometry.translate(0, SLAB / 2, 0);
      const wallGeometry = track(
        new BoxGeometry(WIDTH - 0.5, FLOOR_HEIGHT - SLAB, DEPTH - 0.5),
      );
      wallGeometry.translate(0, SLAB + (FLOOR_HEIGHT - SLAB) / 2, 0);
      const edgeGeometry = track(
        new EdgesGeometry(
          new BoxGeometry(WIDTH, FLOOR_HEIGHT, DEPTH).translate(
            0,
            FLOOR_HEIGHT / 2,
            0,
          ),
        ),
      );
      const columnGeometry = track(
        new BoxGeometry(0.22, FLOOR_HEIGHT, 0.22).translate(
          0,
          FLOOR_HEIGHT / 2,
          0,
        ),
      );
      // Glazed ribbon on the four faces, slightly proud of the wall.
      const bandHeight = (FLOOR_HEIGHT - SLAB) * 0.5;
      const bandY = SLAB + (FLOOR_HEIGHT - SLAB) * 0.5;
      const longBand = track(
        new BoxGeometry(WIDTH - 1.1, bandHeight, 0.06).translate(0, bandY, 0),
      );
      const shortBand = track(
        new BoxGeometry(0.06, bandHeight, DEPTH - 1.1).translate(0, bandY, 0),
      );
      const corners = [
        [-WIDTH / 2 + 0.2, -DEPTH / 2 + 0.2],
        [WIDTH / 2 - 0.2, -DEPTH / 2 + 0.2],
        [-WIDTH / 2 + 0.2, DEPTH / 2 - 0.2],
        [WIDTH / 2 - 0.2, DEPTH / 2 - 0.2],
        [0, -DEPTH / 2 + 0.2],
        [0, DEPTH / 2 - 0.2],
      ];
      floors = Array.from({ length: count }, (_, index) => {
        const slab = new MeshStandardMaterial({
          color: CONCRETE,
          roughness: 0.75,
          metalness: 0.03,
        });
        const wall = new MeshStandardMaterial({
          color: CONCRETE,
          roughness: 0.85,
          metalness: 0.02,
        });
        materials.push(slab, wall);
        const group = new Group();
        const slabMesh = new Mesh(slabGeometry, slab);
        const wallMesh = new Mesh(wallGeometry, wall);
        for (const mesh of [slabMesh, wallMesh]) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
        group.add(slabMesh, wallMesh);
        const front = new Mesh(longBand, glassMaterial);
        front.position.z = DEPTH / 2 - 0.22;
        const back = new Mesh(longBand, glassMaterial);
        back.position.z = -(DEPTH / 2 - 0.22);
        const left = new Mesh(shortBand, glassMaterial);
        left.position.x = -(WIDTH / 2 - 0.22);
        const right = new Mesh(shortBand, glassMaterial);
        right.position.x = WIDTH / 2 - 0.22;
        group.add(front, back, left, right);
        group.position.y = index * FLOOR_HEIGHT;
        const ghost = new LineSegments(edgeGeometry, ghostMaterial);
        ghost.position.y = index * FLOOR_HEIGHT;
        const columns = new Group();
        for (const [x, z] of corners) {
          const column = new Mesh(columnGeometry, columnMaterial);
          column.position.set(x, 0, z);
          column.castShadow = true;
          columns.add(column);
        }
        columns.position.y = index * FLOOR_HEIGHT;
        building.add(group, ghost, columns);
        return { group, ghost, columns, wall, slab };
      });

      // Lift core rising a little above the highest floor under construction.
      const core = new Mesh(
        track(new BoxGeometry(2, 1, 2).translate(0, 0.5, 0)),
        coreMaterial,
      );
      core.position.set(WIDTH / 2 - 2.2, 0, 0);
      core.castShadow = true;
      building.add(core);
      (building.userData as { core?: Mesh }).core = core;

      // Tower crane with counter-jib, counterweight and a hook line.
      crane = new Group();
      mast = new Mesh(
        track(new BoxGeometry(0.3, 1, 0.3).translate(0, 0.5, 0)),
        craneMaterial,
      );
      jib = new Group();
      const arm = new Mesh(
        track(new BoxGeometry(8, 0.18, 0.18)),
        craneMaterial,
      );
      arm.position.x = 2.2;
      const counter = new Mesh(
        track(new BoxGeometry(2.2, 0.18, 0.18)),
        craneMaterial,
      );
      counter.position.x = -2.9;
      const weight = new Mesh(
        track(new BoxGeometry(0.7, 0.5, 0.5)),
        craneMaterial,
      );
      weight.position.set(-3.5, -0.2, 0);
      const cabin = new Mesh(
        track(new BoxGeometry(0.5, 0.5, 0.5)),
        craneMaterial,
      );
      cabin.position.set(0.4, 0.3, 0);
      const line = new Mesh(
        track(new CylinderGeometry(0.018, 0.018, 1.6)),
        new MeshStandardMaterial({ color: 0x3d4f5c }),
      );
      materials.push(line.material as Material);
      line.position.set(5.3, -0.9, 0);
      jib.add(arm, counter, weight, cabin, line);
      crane.add(mast, jib);
      crane.position.set(WIDTH / 2 + 1.6, 0, DEPTH / 2 + 0.6);
      crane.traverse((child) => {
        if (child instanceof Mesh) child.castShadow = true;
      });
      building.add(crane);

      referenceLine = new LineLoop(
        track(
          new BufferGeometry().setFromPoints([
            new Vector3(-WIDTH / 2 - 0.5, 0, -DEPTH / 2 - 0.5),
            new Vector3(WIDTH / 2 + 0.5, 0, -DEPTH / 2 - 0.5),
            new Vector3(WIDTH / 2 + 0.5, 0, DEPTH / 2 + 0.5),
            new Vector3(-WIDTH / 2 - 0.5, 0, DEPTH / 2 + 0.5),
          ]),
        ),
        referenceMaterial,
      );
      building.add(referenceLine);
    }
    const shadowCatcher = new Mesh(
      track(new PlaneGeometry(60, 60)),
      new ShadowMaterial({ opacity: 0.18 }),
    );
    materials.push(shadowCatcher.material as Material);
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.position.y = sceneryBottom + 0.001;
    shadowCatcher.receiveShadow = true;
    scene.add(shadowCatcher);

    const pinPoint = new Vector3();
    const view = { yaw: -0.7, pitch: 0.42 };
    const velocity = { yaw: 0, pitch: 0 };
    let shown = target.current.levels;
    let dragging = false;
    let last = { x: 0, y: 0 };
    let lastInteraction = -Infinity;
    let visible = true;
    let frame = 0;
    let previous = performance.now();
    const tall = modelBox.real
      ? modelBox.height
      : Math.max(planned, 4) * FLOOR_HEIGHT;
    const framed = Math.max(tall, WIDTH * 0.85);
    const distance = framed * 2 + 12;
    const tint = new Color();

    const resize = () => {
      const { clientWidth, clientHeight } = element;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    const render = (time: number) => {
      const delta = Math.min((time - previous) / 1000, 0.05);
      previous = time;
      const goal = clamp(target.current.levels, 0, planned);
      shown += (goal - shown) * (reduced ? 1 : 1 - Math.exp(-delta * 4));
      const ref = target.current.reference;
      floors.forEach((floor, index) => {
        const fraction = clamp(shown - index, 0, 1);
        floor.group.visible = fraction > 0.002;
        floor.group.scale.y = Math.max(fraction, 0.001);
        floor.ghost.visible = fraction < 0.999;
        floor.columns.visible = fraction > 0.002 && fraction < 0.999;
        const top = index + fraction;
        const isNew = ref !== null && top > ref + 0.01;
        tint.set(isNew ? NEW_WORK : CONCRETE);
        floor.wall.color.copy(tint);
        floor.slab.color.copy(tint);
      });
      const core = (building.userData as { core?: Mesh }).core;
      if (core)
        core.scale.y = Math.max(
          0.01,
          Math.min(Math.ceil(shown) + 0.6, planned + 0.6) * FLOOR_HEIGHT,
        );
      if (mast && jib && crane) {
        const craneTop =
          Math.min(Math.ceil(shown), planned) * FLOOR_HEIGHT + 2.2;
        mast.scale.y = craneTop;
        jib.position.y = craneTop;
        jib.rotation.y = reduced ? 0.4 : 0.4 + Math.sin(time / 4000) * 0.35;
        crane.visible = shown < planned - 0.01;
      }
      if (referenceLine) {
        referenceLine.visible = ref !== null;
        referenceLine.position.y = (ref ?? 0) * FLOOR_HEIGHT;
      }

      if (!dragging) {
        view.yaw += velocity.yaw * delta;
        view.pitch = clamp(view.pitch + velocity.pitch * delta, 0.08, 1.35);
        const damping = Math.exp(-delta * 3);
        velocity.yaw *= damping;
        velocity.pitch *= damping;
        if (!reduced && time - lastInteraction > 3000) view.yaw += delta * 0.15;
      }
      const height = tall * 0.5;
      camera.position.set(
        Math.sin(view.yaw) * Math.cos(view.pitch) * distance,
        height + Math.sin(view.pitch) * distance * 0.7,
        Math.cos(view.yaw) * Math.cos(view.pitch) * distance,
      );
      camera.lookAt(0, height * 0.85, 0);
      markersRef.current?.forEach((marker) => {
        const el = markerEls.current.get(marker.id);
        if (!el) return;
        const y = modelBox.real
          ? (marker.level / Math.max(planned, 1)) * modelBox.height
          : marker.level * FLOOR_HEIGHT;
        pinPoint.set(marker.x * WIDTH * 0.38, y, modelBox.depth / 2 + 0.3);
        pinPoint.project(camera);
        const x = (pinPoint.x * 0.5 + 0.5) * element.clientWidth;
        const py = (-pinPoint.y * 0.5 + 0.5) * element.clientHeight;
        el.style.transform = `translate(${x - 18}px, ${py - 44}px)`;
        el.style.visibility = pinPoint.z < 1 ? "visible" : "hidden";
      });
      renderer.render(scene, camera);
      if (visible) frame = requestAnimationFrame(render);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      previous = performance.now();
      frame = requestAnimationFrame(render);
    };

    const canvas = renderer.domElement;
    const down = (event: PointerEvent) => {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
      last = { x: event.clientX, y: event.clientY };
      velocity.yaw = velocity.pitch = 0;
      lastInteraction = performance.now();
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      view.yaw -= dx * 0.01;
      view.pitch = clamp(view.pitch + dy * 0.008, 0.08, 1.35);
      velocity.yaw = reduced ? 0 : -dx * 0.6;
      last = { x: event.clientX, y: event.clientY };
      lastInteraction = performance.now();
    };
    const up = (event: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(event.pointerId))
        canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    const visibility = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) start();
    });
    visibility.observe(element);
    resize();
    start();

    return () => {
      cancelAnimationFrame(frame);
      visible = false;
      resizeObserver.disconnect();
      visibility.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      // The loaded model belongs to whoever loaded it; the scene only lets go of it.
      if (model) building.remove(model.object);
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [planned, model]);

  return (
    <div
      ref={container}
      className={styles.scene}
      role="group"
      aria-label={`${model ? `Modelo cargado: ${model.name}` : "Modelo esquemático del edificio"}: ${levels.toLocaleString("es-CO", { maximumFractionDigits: 1 })} de ${planned} niveles construidos. Arrástrelo para girarlo.`}
    >
      {markers?.map((marker) => (
        <button
          key={marker.id}
          ref={(el) => {
            if (el) markerEls.current.set(marker.id, el);
            else markerEls.current.delete(marker.id);
          }}
          type="button"
          className={styles.pin}
          data-tone={marker.tone}
          aria-label={marker.label}
          aria-pressed={marker.id === selectedMarkerId}
          onClick={() => onMarkerSelect?.(marker.id)}
          onPointerDown={(event) => event.stopPropagation()}
        >
          !
        </button>
      ))}
      {unavailable && (
        <p className={styles.fallback}>
          Tu navegador no puede mostrar el modelo 3D. El avance por niveles se
          detalla debajo.
        </p>
      )}
    </div>
  );
}
