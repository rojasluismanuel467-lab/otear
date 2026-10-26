"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Material,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import styles from "./building-scene.module.css";

const WIDTH = 11;
const DEPTH = 7;
const CONCRETE = 0xdde3dc;
const NEW_WORK = 0x2f9a6e;

export interface BuildingSceneProps {
  /** Floors built, with decimals for the one under construction. */
  levels: number;
  /** Floors in the design. */
  planned: number;
  /** Floors at the date being compared with, if any. */
  reference?: number | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * A schematic building that grows floor by floor. Built floors are solid, the one in
 * progress shows its columns, planned floors are outlines, and work done since the
 * reference date is highlighted. It is not a reconstruction from images.
 */
export function BuildingScene({
  levels,
  planned,
  reference,
}: BuildingSceneProps) {
  const container = useRef<HTMLDivElement>(null);
  const target = useRef({ levels, reference: reference ?? null });
  const [unavailable, setUnavailable] = useState(false);

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
    renderer.domElement.className = styles.canvas;
    element.appendChild(renderer.domElement);
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;
    const camera = new PerspectiveCamera(32, 1, 0.1, 200);

    const geometries: BufferGeometry[] = [];
    const materials: Material[] = [];
    const track = <T extends BufferGeometry>(geometry: T) => {
      geometries.push(geometry);
      return geometry;
    };

    const ground = new Mesh(
      track(new CircleGeometry(16, 64)),
      new MeshStandardMaterial({ color: 0xe9eee6, roughness: 1 }),
    );
    materials.push(ground.material as Material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    const building = new Group();
    scene.add(building);
    const ghostMaterial = new LineBasicMaterial({
      color: 0x8aa896,
      transparent: true,
      opacity: 0.7,
    });
    const columnMaterial = new MeshStandardMaterial({
      color: 0x7c8a82,
      roughness: 0.6,
    });
    const referenceMaterial = new LineBasicMaterial({ color: 0x3f7f9c });
    materials.push(ghostMaterial, columnMaterial, referenceMaterial);

    const slabGeometry = track(new BoxGeometry(WIDTH, 1, DEPTH));
    slabGeometry.translate(0, 0.5, 0);
    const edgeGeometry = track(new EdgesGeometry(slabGeometry));
    const columnGeometry = track(new BoxGeometry(0.22, 1, 0.22));
    columnGeometry.translate(0, 0.5, 0);
    const corners = [
      [-WIDTH / 2 + 0.2, -DEPTH / 2 + 0.2],
      [WIDTH / 2 - 0.2, -DEPTH / 2 + 0.2],
      [-WIDTH / 2 + 0.2, DEPTH / 2 - 0.2],
      [WIDTH / 2 - 0.2, DEPTH / 2 - 0.2],
      [0, -DEPTH / 2 + 0.2],
      [0, DEPTH / 2 - 0.2],
    ];

    const floors = Array.from(
      { length: Math.max(1, Math.round(planned)) },
      (_, index) => {
        const material = new MeshStandardMaterial({
          color: CONCRETE,
          roughness: 0.7,
          metalness: 0.05,
        });
        materials.push(material);
        const solid = new Mesh(slabGeometry, material);
        solid.position.y = index;
        const ghost = new LineSegments(edgeGeometry, ghostMaterial);
        ghost.position.y = index;
        const columns = new Group();
        for (const [x, z] of corners) {
          const column = new Mesh(columnGeometry, columnMaterial);
          column.position.set(x, 0, z);
          columns.add(column);
        }
        columns.position.y = index;
        building.add(solid, ghost, columns);
        return { solid, ghost, columns, material };
      },
    );

    // Tower crane over the highest floor under construction.
    const crane = new Group();
    const craneMaterial = new MeshStandardMaterial({
      color: 0xc28b2c,
      roughness: 0.5,
    });
    materials.push(craneMaterial);
    const mast = new Mesh(track(new BoxGeometry(0.28, 1, 0.28)), craneMaterial);
    mast.geometry.translate(0, 0.5, 0);
    const jib = new Mesh(track(new BoxGeometry(7, 0.2, 0.2)), craneMaterial);
    jib.position.set(1.8, 0, 0);
    crane.add(mast, jib);
    crane.position.set(WIDTH / 2 + 1.2, 0, 0);
    building.add(crane);

    const referenceLine = new LineLoop(
      track(
        new BufferGeometry().setFromPoints([
          new Vector3(-WIDTH / 2 - 0.4, 0, -DEPTH / 2 - 0.4),
          new Vector3(WIDTH / 2 + 0.4, 0, -DEPTH / 2 - 0.4),
          new Vector3(WIDTH / 2 + 0.4, 0, DEPTH / 2 + 0.4),
          new Vector3(-WIDTH / 2 - 0.4, 0, DEPTH / 2 + 0.4),
        ]),
      ),
      referenceMaterial,
    );
    building.add(referenceLine);

    const view = { yaw: -0.7, pitch: 0.42 };
    const velocity = { yaw: 0, pitch: 0 };
    let shown = target.current.levels;
    let dragging = false;
    let last = { x: 0, y: 0 };
    let lastInteraction = -Infinity;
    let visible = true;
    let frame = 0;
    let previous = performance.now();
    const distance = Math.max(planned, 4) * 1.8 + 16;

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
        floor.solid.visible = fraction > 0.002;
        floor.solid.scale.y = Math.max(fraction, 0.001);
        floor.ghost.visible = fraction < 0.999;
        floor.columns.visible = fraction > 0.002 && fraction < 0.999;
        const top = index + fraction;
        const isNew = ref !== null && top > ref + 0.01;
        floor.material.color.setHex(isNew ? NEW_WORK : CONCRETE);
      });
      const craneTop = Math.min(Math.ceil(shown), planned) + 1.8;
      mast.scale.y = craneTop;
      jib.position.y = craneTop;
      crane.visible = shown < planned - 0.01;
      referenceLine.visible = ref !== null;
      referenceLine.position.y = ref ?? 0;

      if (!dragging) {
        view.yaw += velocity.yaw * delta;
        view.pitch = clamp(view.pitch + velocity.pitch * delta, 0.08, 1.2);
        const damping = Math.exp(-delta * 3);
        velocity.yaw *= damping;
        velocity.pitch *= damping;
        if (!reduced && time - lastInteraction > 3000) view.yaw += delta * 0.18;
      }
      const height = Math.max(planned, 4) * 0.5;
      camera.position.set(
        Math.sin(view.yaw) * Math.cos(view.pitch) * distance,
        height + Math.sin(view.pitch) * distance * 0.7,
        Math.cos(view.yaw) * Math.cos(view.pitch) * distance,
      );
      camera.lookAt(0, height * 0.9, 0);
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
      view.pitch = clamp(view.pitch + dy * 0.008, 0.08, 1.2);
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
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      floors.forEach((floor) => floor.material.dispose());
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, [planned]);

  return (
    <div
      ref={container}
      className={styles.scene}
      role="img"
      aria-label={`Modelo esquemático del edificio: ${levels.toLocaleString("es-CO", { maximumFractionDigits: 1 })} de ${planned} niveles construidos. Arrástrelo para girarlo.`}
    >
      {unavailable && (
        <p className={styles.fallback}>
          Tu navegador no puede mostrar el modelo 3D. El avance por niveles se
          detalla debajo.
        </p>
      )}
    </div>
  );
}
