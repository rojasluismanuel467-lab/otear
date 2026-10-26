import type { PartAnchor } from "./parts-catalog";

/**
 * Approximate place of each part on the simplified 3D models, read from the shape of the
 * model itself (not from the manufacturer), in the model's own coordinates: y up, front
 * toward -z, the aircraft's right toward +x. Only parts that can be told apart on that
 * shape have an anchor; the rest are listed without a place.
 */
type P = [number, number, number];
const a = (point: P, where?: string): PartAnchor => ({ point, where });

const side = (x: number) => (x < 0 ? "izquierda" : "derecha");
const place = (x: number, z: number) =>
  `${z < 0 ? "delantera" : "trasera"} ${side(x)}`;
const at = (list: [number, number, number][]) =>
  list.map(([x, y, z]) => a([x, y, z], place(x, z)));

export const anchorTable: Record<string, Record<string, PartAnchor[]>> = {
  "mavic-3-enterprise": {
    motors: at([
      [-0.95, -0.17, -0.72],
      [0.95, -0.17, -0.72],
      [-0.75, -0.2, 0.73],
      [0.75, -0.2, 0.73],
    ]),
    propellers: at([
      [-0.95, -0.05, -0.72],
      [0.95, -0.05, -0.72],
      [-0.75, -0.08, 0.73],
      [0.75, -0.08, 0.73],
    ]),
    "frame-arms": at([
      [-0.6, -0.1, -0.58],
      [0.6, -0.1, -0.58],
      [-0.48, -0.1, 0.52],
      [0.48, -0.1, 0.52],
    ]),
    "landing-gears": at([
      [-0.95, -0.35, -0.72],
      [0.95, -0.35, -0.72],
    ]),
    "gimbal-camera": [a([0, -0.13, -0.78], "frente, bajo la nariz")],
  },
  "matrice-350-rtk": {
    motors: [
      a([1.13, 0.28, -0.94], "motor 1 · delantero derecho"),
      a([-1.12, 0.28, -0.95], "motor 2 · delantero izquierdo"),
      a([-1.02, 0.28, 0.86], "motor 3 · trasero izquierdo"),
      a([1.02, 0.28, 0.88], "motor 4 · trasero derecho"),
    ],
    propellers: [
      a([1.13, 0.05, -0.94], "hélice 1 · delantera derecha"),
      a([-1.12, 0.05, -0.95], "hélice 2 · delantera izquierda"),
      a([-1.02, 0.05, 0.86], "hélice 3 · trasera izquierda"),
      a([1.02, 0.05, 0.88], "hélice 4 · trasera derecha"),
    ],
    "frame-arms": at([
      [-0.68, 0.2, -0.65],
      [0.68, 0.2, -0.65],
      [-0.62, 0.2, 0.55],
      [0.62, 0.2, 0.55],
    ]),
    "landing-gears": [
      a([-0.6, -0.62, -0.05], "patín izquierdo"),
      a([0.6, -0.62, -0.05], "patín derecho"),
    ],
    dgc: [a([0, -0.1, -0.55], "bajo el frente")],
  },
  "matrice-4": {
    motors: at([
      [-0.94, -0.15, -0.73],
      [0.94, -0.15, -0.73],
      [-0.82, -0.15, 0.73],
      [0.82, -0.15, 0.73],
    ]),
    propellers: at([
      [-0.94, -0.03, -0.73],
      [0.94, -0.03, -0.73],
      [-0.82, -0.03, 0.73],
      [0.82, -0.03, 0.73],
    ]),
    "frame-arms": at([
      [-0.6, -0.08, -0.5],
      [0.6, -0.08, -0.5],
      [-0.51, -0.08, 0.5],
      [0.51, -0.08, 0.5],
    ]),
    "landing-gears": at([
      [-0.94, -0.35, -0.73],
      [0.94, -0.35, -0.73],
      [-0.82, -0.35, 0.73],
      [0.82, -0.35, 0.73],
    ]),
    "gimbal-camera": [a([0, -0.13, -0.78], "frente, bajo la nariz")],
  },
  "matrice-30": {
    motors: at([
      [-0.93, -0.1, -0.73],
      [0.93, -0.1, -0.73],
      [-0.84, 0.2, 0.73],
      [0.84, 0.2, 0.73],
    ]),
    propellers: at([
      [-0.93, 0, -0.73],
      [0.93, 0, -0.73],
      [-0.84, 0.05, 0.73],
      [0.84, 0.05, 0.73],
    ]),
    "frame-arms": at([
      [-0.6, -0.1, -0.5],
      [0.6, -0.1, -0.5],
      [-0.55, 0.15, 0.5],
      [0.55, 0.15, 0.5],
    ]),
    "landing-gears": at([
      [-0.93, -0.35, -0.73],
      [0.93, -0.35, -0.73],
    ]),
    "rear-landing-gear": [a([0, -0.3, 0.12], "cubierta inferior")],
    "gimbal-camera": [a([0, -0.16, -0.6], "frente, bajo la nariz")],
  },
};
