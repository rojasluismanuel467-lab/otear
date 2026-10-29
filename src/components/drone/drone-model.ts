import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  CanvasTexture,
  DoubleSide,
  Box3,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  LatheGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  type MeshPhysicalMaterialParameters,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  PlaneGeometry,
  Shape,
  SphereGeometry,
  SplineCurve,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export type DroneKind = "compact" | "enterprise" | "sprayer" | "fixed-wing";

/** The brand aircraft of the logo. It is not a fleet family: no catalog, parts or marks refer to it. */
export type BrandKind = "viper";

/** Either a generic procedural aircraft or an optimized glTF file. */
export type DroneModelSpec =
  { kind: DroneKind | BrandKind } | { glbUrl: string; yaw?: number };

export function specKey(spec: DroneModelSpec) {
  return "kind" in spec ? `kind:${spec.kind}` : `glb:${spec.glbUrl}`;
}

export type DroneModel = {
  group: Group;
  /** Groups that spin around their local Y axis. */
  propellers: Group[];
  /** Half of the widest horizontal dimension; used to frame the camera. */
  extent: number;
  /** Opacity multiplier for the ground shadow (default 1). */
  shadow?: number;
  /** Wants the scene's key and rim lights on top of the soft environment. */
  lit?: boolean;
  dispose: () => void;
};

const palette = {
  shell: 0xeef1f3,
  shellShade: 0xd3d8dc,
  frame: 0x262e33,
  motor: 0x1b2024,
  prop: 0x353d42,
  glass: 0x0a0d10,
  accent: 0x1c6f8d,
  front: 0x81bfdb,
  rear: 0xe6a95c,
  tank: 0xe6ebef,
  steel: 0x8a9196,
};

type Kit = ReturnType<typeof createKit>;
type Parts = Pick<
  DroneModel,
  "group" | "propellers" | "extent" | "shadow" | "lit"
>;

function createKit() {
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];
  const state = { disposed: false };

  const material = (
    color: number,
    options: MeshStandardMaterialParameters = {},
  ) => {
    const created = new MeshStandardMaterial({
      color,
      roughness: 0.42,
      metalness: 0.08,
      ...options,
    });
    materials.push(created);
    return created;
  };
  const mesh = (geometry: BufferGeometry, mat: Material) => {
    geometries.push(geometry);
    return new Mesh(geometry, mat);
  };

  const track = <T extends Material>(created: T) => {
    materials.push(created);
    return created;
  };
  const texture = <T extends Texture>(created: T) => {
    textures.push(created);
    return created;
  };

  return {
    mesh,
    material,
    texture,
    track,
    state,
    shell: material(palette.shell, { roughness: 0.36 }),
    shellShade: material(palette.shellShade, { roughness: 0.5 }),
    frame: material(palette.frame, { roughness: 0.55 }),
    motor: material(palette.motor, { roughness: 0.3, metalness: 0.5 }),
    prop: material(palette.prop, { roughness: 0.5 }),
    glass: material(palette.glass, { roughness: 0.08, metalness: 0.7 }),
    accent: material(palette.accent, { roughness: 0.4 }),
    tank: material(palette.tank, { roughness: 0.3 }),
    steel: material(palette.steel, { roughness: 0.35, metalness: 0.6 }),
    blur: material(palette.accent, {
      transparent: true,
      opacity: 0.07,
      side: DoubleSide,
      depthWrite: false,
    }),
    dispose: () => {
      state.disposed = true;
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((item) => item.dispose());
      textures.forEach((item) => item.dispose());
    },
  };
}

type RotorOptions = {
  x: number;
  y: number;
  z: number;
  radius: number;
  led?: number;
};

/** Motor housing, LED, spinning two-blade propeller and blur disc. */
function addRotor(kit: Kit, parent: Group, options: RotorOptions) {
  const { x, y, z, radius, led } = options;
  const housing = kit.mesh(
    new CylinderGeometry(radius * 0.27, radius * 0.32, 0.22, 24),
    kit.motor,
  );
  housing.position.set(x, y - 0.15, z);
  parent.add(housing);

  if (led !== undefined) {
    const light = kit.mesh(
      new SphereGeometry(0.035, 12, 12),
      kit.material(led, { emissive: led, emissiveIntensity: 1.4 }),
    );
    light.position.set(x, y - 0.2, z + Math.sign(z || 1) * radius * 0.33);
    parent.add(light);
  }

  const propeller = new Group();
  propeller.position.set(x, y, z);
  for (let blade = 0; blade < 2; blade += 1) {
    const wing = kit.mesh(
      new CapsuleGeometry(radius * 0.075, radius * 1.3, 4, 10),
      kit.prop,
    );
    wing.rotation.z = Math.PI / 2;
    wing.rotation.y = blade * Math.PI;
    wing.scale.set(1, 0.16, 1);
    propeller.add(wing);
  }
  propeller.add(
    kit.mesh(
      new CylinderGeometry(radius * 0.1, radius * 0.1, 0.05, 16),
      kit.motor,
    ),
  );
  const blur = kit.mesh(new CircleGeometry(radius, 40), kit.blur);
  blur.rotation.x = -Math.PI / 2;
  blur.position.y = 0.012;
  propeller.add(blur);
  parent.add(propeller);
  return propeller;
}

/** Capsule arm from the body centre to a motor at (x, z). */
function addArm(
  kit: Kit,
  parent: Group,
  x: number,
  z: number,
  y: number,
  thickness: number,
) {
  const length = Math.hypot(x, z) - 0.15;
  const arm = kit.mesh(
    new CapsuleGeometry(thickness, length, 4, 10),
    kit.frame,
  );
  arm.rotation.z = Math.PI / 2;
  const pivot = new Group();
  pivot.add(arm);
  pivot.position.set(x / 2, y, z / 2);
  pivot.rotation.y = -Math.atan2(z, x);
  parent.add(pivot);
}

function addGimbal(kit: Kit, parent: Group, z: number, y: number, scale = 1) {
  const base = kit.mesh(
    new RoundedBoxGeometry(0.34 * scale, 0.14 * scale, 0.24 * scale, 3, 0.05),
    kit.frame,
  );
  base.position.set(0, y + 0.1 * scale, z - 0.1 * scale);
  parent.add(base);
  const ball = kit.mesh(new SphereGeometry(0.17 * scale, 24, 24), kit.frame);
  ball.position.set(0, y, z);
  parent.add(ball);
  const lens = kit.mesh(
    new CylinderGeometry(0.085 * scale, 0.085 * scale, 0.07, 24),
    kit.glass,
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, y, z + 0.15 * scale);
  parent.add(lens);
}

function buildCompact(kit: Kit): Parts {
  const group = new Group();
  const propellers: Group[] = [];
  group.add(
    kit.mesh(new RoundedBoxGeometry(1.0, 0.34, 1.5, 5, 0.15), kit.shell),
  );
  const canopy = kit.mesh(
    new RoundedBoxGeometry(0.66, 0.22, 0.86, 5, 0.1),
    kit.shellShade,
  );
  canopy.position.set(0, 0.24, -0.12);
  group.add(canopy);
  const stripe = kit.mesh(new BoxGeometry(0.1, 0.012, 0.72), kit.accent);
  stripe.position.set(0, 0.356, -0.12);
  group.add(stripe);
  addGimbal(kit, group, 0.8, -0.3);

  for (const side of [-1, 1]) {
    const skid = kit.mesh(new CapsuleGeometry(0.035, 1.1, 4, 10), kit.frame);
    skid.rotation.x = Math.PI / 2;
    skid.position.set(side * 0.46, -0.52, -0.05);
    group.add(skid);
    for (const z of [-0.45, 0.4]) {
      const leg = kit.mesh(
        new CylinderGeometry(0.028, 0.028, 0.34, 8),
        kit.frame,
      );
      leg.position.set(side * 0.46, -0.35, z);
      group.add(leg);
    }
  }
  for (const [x, z, led] of [
    [-1.05, 0.95, palette.front],
    [1.05, 0.95, palette.front],
    [-1.05, -0.95, palette.rear],
    [1.05, -0.95, palette.rear],
  ] as const) {
    addArm(kit, group, x, z, 0.02, 0.07);
    propellers.push(addRotor(kit, group, { x, y: 0.25, z, radius: 0.6, led }));
  }
  return { group, propellers, extent: 1.7 };
}

function buildEnterprise(kit: Kit): Parts {
  const group = new Group();
  const propellers: Group[] = [];
  const body = kit.mesh(
    new RoundedBoxGeometry(1.1, 0.46, 1.5, 5, 0.12),
    kit.frame,
  );
  group.add(body);
  const shell = kit.mesh(
    new RoundedBoxGeometry(0.9, 0.2, 1.2, 5, 0.09),
    kit.shell,
  );
  shell.position.y = 0.3;
  group.add(shell);
  const bar = kit.mesh(new BoxGeometry(0.72, 0.012, 0.08), kit.accent);
  bar.position.set(0, 0.405, 0.35);
  group.add(bar);
  for (const side of [-1, 1]) {
    const antenna = kit.mesh(
      new CylinderGeometry(0.025, 0.03, 0.62, 10),
      kit.frame,
    );
    antenna.position.set(side * 0.34, 0.62, -0.56);
    antenna.rotation.z = side * -0.12;
    group.add(antenna);
  }

  // Payload bay with a larger stabilized camera
  const bay = kit.mesh(
    new RoundedBoxGeometry(0.62, 0.2, 0.5, 4, 0.06),
    kit.frame,
  );
  bay.position.set(0, -0.34, 0.28);
  group.add(bay);
  addGimbal(kit, group, 0.62, -0.52, 1.5);

  // Tall landing gear, two inverted U legs
  for (const z of [-0.45, 0.45]) {
    const bridge = kit.mesh(new CapsuleGeometry(0.04, 1.5, 4, 10), kit.frame);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, -0.98, z);
    group.add(bridge);
    for (const side of [-1, 1]) {
      const leg = kit.mesh(
        new CylinderGeometry(0.035, 0.04, 0.72, 8),
        kit.frame,
      );
      leg.position.set(side * 0.75, -0.62, z);
      leg.rotation.z = side * 0.12;
      group.add(leg);
    }
  }
  for (const [x, z, led] of [
    [-1.35, 1.05, palette.front],
    [1.35, 1.05, palette.front],
    [-1.35, -1.05, palette.rear],
    [1.35, -1.05, palette.rear],
  ] as const) {
    addArm(kit, group, x, z, 0.1, 0.1);
    propellers.push(addRotor(kit, group, { x, y: 0.36, z, radius: 0.72, led }));
  }
  return { group, propellers, extent: 2.05 };
}

function buildSprayer(kit: Kit): Parts {
  const group = new Group();
  const propellers: Group[] = [];
  const frame = kit.mesh(
    new RoundedBoxGeometry(0.9, 0.3, 1.5, 4, 0.1),
    kit.frame,
  );
  group.add(frame);
  const tank = kit.mesh(
    new RoundedBoxGeometry(1.15, 0.62, 1.1, 5, 0.18),
    kit.tank,
  );
  tank.position.y = 0.46;
  group.add(tank);
  const band = kit.mesh(new BoxGeometry(1.17, 0.07, 0.4), kit.accent);
  band.position.set(0, 0.5, 0.02);
  group.add(band);
  const cap = kit.mesh(new CylinderGeometry(0.15, 0.15, 0.06, 20), kit.frame);
  cap.position.set(0, 0.8, -0.2);
  group.add(cap);

  // Radar discs front and rear
  for (const z of [0.82, -0.82]) {
    const radar = kit.mesh(new CylinderGeometry(0.2, 0.2, 0.05, 24), kit.motor);
    radar.rotation.x = Math.PI / 2;
    radar.position.set(0, 0.0, z);
    group.add(radar);
  }

  // Long skids
  for (const side of [-1, 1]) {
    const skid = kit.mesh(new CapsuleGeometry(0.04, 1.7, 4, 10), kit.frame);
    skid.rotation.x = Math.PI / 2;
    skid.position.set(side * 0.55, -0.78, 0);
    group.add(skid);
    for (const z of [-0.55, 0.55]) {
      const leg = kit.mesh(
        new CylinderGeometry(0.035, 0.035, 0.6, 8),
        kit.frame,
      );
      leg.position.set(side * 0.55, -0.48, z);
      group.add(leg);
    }
  }

  for (const [x, z, led] of [
    [-1.6, 1.15, palette.front],
    [1.6, 1.15, palette.front],
    [-1.6, -1.15, palette.rear],
    [1.6, -1.15, palette.rear],
  ] as const) {
    addArm(kit, group, x, z, 0.0, 0.11);
    propellers.push(addRotor(kit, group, { x, y: 0.3, z, radius: 0.85, led }));
    // Nozzle under each rotor
    const stem = kit.mesh(new CylinderGeometry(0.03, 0.03, 0.34, 8), kit.steel);
    stem.position.set(x, -0.28, z);
    group.add(stem);
    const nozzle = kit.mesh(new ConeGeometry(0.1, 0.14, 16), kit.steel);
    nozzle.position.set(x, -0.5, z);
    nozzle.rotation.x = Math.PI;
    group.add(nozzle);
  }
  return { group, propellers, extent: 2.5 };
}

function buildFixedWing(kit: Kit): Parts {
  const group = new Group();
  const propellers: Group[] = [];
  const fuselage = kit.mesh(new CapsuleGeometry(0.2, 1.7, 8, 20), kit.shell);
  fuselage.rotation.x = Math.PI / 2;
  group.add(fuselage);
  const canopy = kit.mesh(new SphereGeometry(0.2, 20, 14), kit.accent);
  canopy.scale.set(1, 0.7, 1.9);
  canopy.position.set(0, 0.13, 0.15);
  group.add(canopy);

  // Wing with slight sweep and upturned tips
  const wing = kit.mesh(
    new RoundedBoxGeometry(3.7, 0.07, 0.62, 3, 0.03),
    kit.shell,
  );
  wing.position.set(0, 0.0, 0.1);
  group.add(wing);
  const stripe = kit.mesh(new BoxGeometry(3.7, 0.074, 0.1), kit.accent);
  stripe.position.set(0, 0.0, 0.3);
  group.add(stripe);
  for (const side of [-1, 1]) {
    const tip = kit.mesh(
      new RoundedBoxGeometry(0.05, 0.3, 0.32, 3, 0.02),
      kit.shell,
    );
    tip.position.set(side * 1.85, 0.12, 0.04);
    group.add(tip);
  }

  // Tail
  const stabilizer = kit.mesh(
    new RoundedBoxGeometry(1.2, 0.045, 0.3, 3, 0.02),
    kit.shell,
  );
  stabilizer.position.set(0, 0.0, -1.05);
  group.add(stabilizer);
  const fin = kit.mesh(
    new RoundedBoxGeometry(0.05, 0.4, 0.34, 3, 0.02),
    kit.shell,
  );
  fin.position.set(0, 0.2, -1.05);
  group.add(fin);

  // Belly camera
  const camera = kit.mesh(new SphereGeometry(0.1, 16, 16), kit.frame);
  camera.position.set(0, -0.2, 0.45);
  group.add(camera);
  const lens = kit.mesh(new CylinderGeometry(0.05, 0.05, 0.04, 16), kit.glass);
  lens.position.set(0, -0.29, 0.45);
  group.add(lens);

  // Pusher propeller: spins around the fuselage axis
  const holder = new Group();
  holder.position.set(0, 0, -1.2);
  holder.rotation.x = Math.PI / 2;
  const spinner = kit.mesh(new ConeGeometry(0.09, 0.2, 16), kit.motor);
  spinner.rotation.x = -Math.PI / 2;
  spinner.position.set(0, 0, -1.3);
  group.add(spinner);
  const propeller = new Group();
  for (let blade = 0; blade < 2; blade += 1) {
    const arm = kit.mesh(new CapsuleGeometry(0.03, 0.62, 4, 10), kit.prop);
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = blade * Math.PI;
    arm.scale.set(1, 0.16, 1);
    propeller.add(arm);
  }
  const blur = kit.mesh(new CircleGeometry(0.36, 32), kit.blur);
  blur.rotation.x = -Math.PI / 2;
  propeller.add(blur);
  holder.add(propeller);
  group.add(holder);
  propellers.push(propeller);
  return { group, propellers, extent: 1.95 };
}

/**
 * "Viper", the glider of the Otear logo: slender pod, very long wing with upturned
 * tips, V-tail on a thin boom, rear pusher propeller and a camera ball under the belly.
 * Nose toward +z, like the other procedural aircraft. Illustrative, not a real product.
 */
/** The company logo (glider over the name), 960×384. */
const LOGO_URL = "/brand/otear-logo.webp";

/** A flat, transparent marking laid just above a wing's upper skin. */
function createDecal(
  kit: Kit,
  texture: Texture | null,
  width: number,
  height: number,
  rows = 1,
) {
  // Unlit and untonemapped: under the studio lighting the ink washes out, and
  // a brand mark should keep its real colour.
  const material = kit.track(
    new MeshBasicMaterial({
      map: texture,
      transparent: true,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      depthWrite: false,
    }),
  );
  const decal = kit.mesh(new PlaneGeometry(width, height, 1, rows), material);
  // Lies flat with its top edge toward the tail, so it reads from the nose side.
  decal.rotation.x = -Math.PI / 2;
  return { decal, material };
}

/** The aircraft's name in the livery: navy letters over a thin brand-teal bar. */
function createNameTexture(kit: Kit, name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const texture = kit.texture(new CanvasTexture(canvas));
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const paint = () => {
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    context.font = `800 168px ${family}`;
    context.textBaseline = "alphabetic";
    context.fillStyle = "#0b1820";
    context.strokeStyle = "#0b1820";
    context.lineWidth = 7;
    context.lineJoin = "round";
    // Manual tracking: ctx.letterSpacing is not available everywhere.
    const tracking = 22;
    const widths = [...name].map((char) => context.measureText(char).width);
    const total =
      widths.reduce((sum, width) => sum + width, 0) +
      tracking * (name.length - 1);
    let x = (canvas.width - total) / 2;
    [...name].forEach((char, index) => {
      context.strokeText(char, x, 178);
      context.fillText(char, x, 178);
      x += widths[index] + tracking;
    });
    context.fillStyle = "#0d6286";
    context.fillRect((canvas.width - total) / 2, 204, total, 14);
    texture.needsUpdate = true;
  };
  paint();
  // The first paint may use a fallback face; repaint once fonts are in.
  document.fonts?.ready.then(() => {
    if (!kit.state.disposed) paint();
  });
  return texture;
}

/** One cross-section of a lifting surface, with its leading edge at (x, y, zLE). */
type Station = {
  x: number;
  y: number;
  zLE: number;
  chord: number;
  /** Maximum thickness as a fraction of the chord. */
  t: number;
  /** Rotation about the z axis, so the section stays square to the surface's path. */
  bank: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** NACA-style cambered section: thickness and mean line at chord fraction `xc`. */
function airfoilAt(xc: number, t: number, camber: number) {
  const thickness =
    5 *
    t *
    (0.2969 * Math.sqrt(xc) -
      0.126 * xc -
      0.3516 * xc ** 2 +
      0.2843 * xc ** 3 -
      0.1036 * xc ** 4);
  const p = 0.42;
  const mean =
    xc < p
      ? (camber / p ** 2) * (2 * p * xc - xc * xc)
      : (camber / (1 - p) ** 2) * (1 - 2 * p + 2 * p * xc - xc * xc);
  return { mean, thickness };
}

/** A point on a section's upper or lower skin. `lift` moves it along the skin's normal. */
function surfacePoint(
  station: Station,
  xc: number,
  upper: boolean,
  camber: number,
  lift = 0,
) {
  const { mean, thickness } = airfoilAt(xc, station.t, camber);
  const height =
    (mean + (upper ? thickness : -thickness)) * station.chord +
    (upper ? lift : -lift);
  return new Vector3(
    station.x - Math.sin(station.bank) * height,
    station.y + Math.cos(station.bank) * height,
    station.zLE - xc * station.chord,
  );
}

const LOFT_STEPS = 18;

/**
 * Skins a row of sections into one smooth surface (the +x half). The loop runs from
 * the upper trailing edge over the nose and back along the underside, so the leading
 * edge shares its vertices and shades without a seam. Colour is per vertex: a dark
 * leading edge, a light top and a dark underside.
 */
function loftSurface(
  stations: Station[],
  camber: number,
  top: Color,
  edge: Color,
  under: Color,
) {
  const loop = 2 * LOFT_STEPS + 1;
  const positions: number[] = [];
  const colors: number[] = [];
  for (const station of stations) {
    for (let k = 0; k < loop; k += 1) {
      const upper = k <= LOFT_STEPS;
      const xc = upper
        ? (1 + Math.cos((Math.PI * k) / LOFT_STEPS)) / 2
        : (1 - Math.cos((Math.PI * (k - LOFT_STEPS)) / LOFT_STEPS)) / 2;
      const point = surfacePoint(station, xc, upper, camber);
      positions.push(point.x, point.y, point.z);
      const color = !upper ? under : xc > 0.05 ? top : edge;
      colors.push(color.r, color.g, color.b);
    }
  }
  const indices: number[] = [];
  for (let row = 0; row < stations.length - 1; row += 1) {
    for (let k = 0; k < loop - 1; k += 1) {
      const a = row * loop + k;
      const b = a + 1;
      const c = a + loop;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** A thin dark groove along a line on the upper skin: hinge lines and panel gaps. */
function skinLine(
  kit: Kit,
  material: Material,
  points: Vector3[],
  radius = 0.0026,
) {
  const curve = new CatmullRomCurve3(points, false, "centripetal");
  return kit.mesh(
    new TubeGeometry(curve, Math.max(2, points.length * 4), radius, 5, false),
    material,
  );
}

/** Wing planform: a flat inboard panel, then taper, sweep and a gradual upturn. */
const WING_HALF_SPAN = 2.7;
const WING_FLAT = 1.1;
const WING_Y = 0.1;
const WING_CAMBER = 0.028;

function wingStation(x: number): Station {
  const u = clamp01((x - WING_FLAT) / (WING_HALF_SPAN - WING_FLAT));
  const slope =
    x > WING_FLAT ? (0.62 * 2.2 * u ** 1.2) / (WING_HALF_SPAN - WING_FLAT) : 0;
  return {
    x,
    y: WING_Y + 0.62 * u ** 2.2,
    zLE: 0.48 - 0.42 * u ** 1.3,
    chord: 0.58 * (1 - 0.6 * u - 0.33 * u ** 4),
    t: 0.1 - 0.025 * u,
    bank: Math.atan(slope),
  };
}

const WING_STATIONS = [
  0.06, 0.3, 0.6, 0.9, 1.1, 1.25, 1.4, 1.55, 1.7, 1.85, 2.0, 2.15, 2.3, 2.42,
  2.52, 2.6, 2.66, 2.7,
];

/** V-tail: two surfaces canted up and out from the boom. */
const TAIL_ANGLE = 0.74;
const TAIL_SPAN = 0.74;
const TAIL_CAMBER = 0.012;

function tailStation(s: number): Station {
  const v = s / TAIL_SPAN;
  return {
    x: s * Math.cos(TAIL_ANGLE),
    y: 0.01 + s * Math.sin(TAIL_ANGLE),
    zLE: -1.36 - 0.2 * v,
    chord: 0.3 * (1 - 0.55 * v - 0.2 * v ** 4),
    t: 0.09,
    bank: TAIL_ANGLE,
  };
}

const TAIL_STATIONS = [0.02, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.67, 0.72, 0.74];

/** Fuselage radius by z, tail to nose: boom, tapered tail cone, pod and rounded nose. */
const FUSELAGE_PROFILE: [number, number][] = [
  [-1.78, 0.032],
  [-1.4, 0.034],
  [-1.0, 0.04],
  [-0.8, 0.05],
  [-0.6, 0.075],
  [-0.4, 0.11],
  [-0.2, 0.145],
  [0.0, 0.165],
  [0.25, 0.172],
  [0.5, 0.166],
  [0.7, 0.145],
  [0.85, 0.115],
  [0.95, 0.08],
  [1.02, 0.04],
  [1.05, 0],
];

/** A lathe turned about z (nose at +z) over an angular range, then flattened a little. */
function fuselageSkin(phiStart: number, phiLength: number, segments: number) {
  const curve = new SplineCurve(
    FUSELAGE_PROFILE.map(([z, r]) => new Vector2(r, z)),
  );
  const points = curve
    .getPoints(90)
    .map((point) => new Vector2(Math.max(0, point.x), point.y));
  const geometry = new LatheGeometry(points, segments, phiStart, phiLength);
  geometry.rotateX(Math.PI / 2);
  geometry.scale(1, 0.84, 1);
  geometry.computeVertexNormals();
  return geometry;
}

/** Propeller blade: tapered planform extruded thin, with twist from root to tip. */
function createBladeGeometry() {
  const outline = new Shape();
  outline.moveTo(0.03, -0.016);
  outline.lineTo(0.03, 0.02);
  outline.lineTo(0.09, 0.036);
  outline.lineTo(0.17, 0.042);
  outline.lineTo(0.26, 0.038);
  outline.lineTo(0.34, 0.028);
  outline.lineTo(0.385, 0.012);
  outline.lineTo(0.4, -0.004);
  outline.lineTo(0.385, -0.014);
  outline.lineTo(0.3, -0.02);
  outline.lineTo(0.17, -0.022);
  outline.lineTo(0.09, -0.02);
  outline.closePath();
  const geometry = new ExtrudeGeometry(outline, {
    depth: 0.006,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 1,
  });
  geometry.rotateX(Math.PI / 2);
  const position = geometry.getAttribute("position");
  for (let index = 0; index < position.count; index += 1) {
    const along = clamp01((position.getX(index) - 0.03) / 0.37);
    const pitch = 0.75 - 0.5 * along;
    const y = position.getY(index);
    const z = position.getZ(index);
    position.setY(index, y * Math.cos(pitch) - z * Math.sin(pitch));
    position.setZ(index, y * Math.sin(pitch) + z * Math.cos(pitch));
  }
  geometry.computeVertexNormals();
  return geometry;
}

function buildViper(kit: Kit): Parts {
  const root = new Group();
  const body = new Group();
  // Centre the long aircraft (propeller at -z, nose at +z) on the origin.
  body.position.z = 0.5;
  root.add(body);
  const propellers: Group[] = [];

  const topColor = new Color(0xc4cbd0);
  const navyColor = new Color(0x15262f);
  const paint = (options: MeshPhysicalMaterialParameters) =>
    kit.track(
      new MeshPhysicalMaterial({
        roughness: 0.3,
        metalness: 0.04,
        clearcoat: 0.35,
        clearcoatRoughness: 0.3,
        ...options,
      }),
    );
  const light = paint({ color: topColor });
  const navy = paint({ color: navyColor, roughness: 0.45, clearcoat: 0.3 });
  const skin = paint({ vertexColors: true });
  const groove = kit.material(0x0f1a20, { roughness: 0.8 });
  const glass = paint({
    color: 0x0a1218,
    roughness: 0.05,
    metalness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
  });

  // Fuselage: light upper skin over a dark belly, split a little below the waterline.
  const bellyHalf = 1.14;
  const belly = kit.mesh(fuselageSkin(-bellyHalf, bellyHalf * 2, 28), navy);
  const upper = kit.mesh(
    fuselageSkin(bellyHalf, Math.PI * 2 - bellyHalf * 2, 44),
    light,
  );
  body.add(belly, upper);

  // Smoked sensor canopy, pitot tube and GPS fin.
  const canopy = kit.mesh(new SphereGeometry(1, 28, 18), glass);
  canopy.scale.set(0.105, 0.062, 0.3);
  canopy.position.set(0, 0.098, 0.56);
  body.add(canopy);
  const pitot = kit.mesh(
    new CylinderGeometry(0.007, 0.007, 0.24, 10),
    kit.steel,
  );
  pitot.rotation.x = Math.PI / 2;
  pitot.position.set(0, -0.004, 1.12);
  body.add(pitot);
  const gps = kit.mesh(
    new RoundedBoxGeometry(0.014, 0.07, 0.12, 2, 0.006),
    light,
  );
  gps.position.set(0, 0.125, -0.38);
  body.add(gps);

  // Wing: one lofted surface per half, with hinge lines for flaps and ailerons.
  const wingSurface = kit.mesh(
    loftSurface(
      WING_STATIONS.map(wingStation),
      WING_CAMBER,
      topColor,
      navyColor,
      navyColor,
    ),
    skin,
  );
  const wingRight = new Group();
  wingRight.add(wingSurface);
  const onWing = (x: number, xc: number) =>
    surfacePoint(wingStation(x), xc, true, WING_CAMBER, 0.0012);
  const span = (from: number, to: number, count: number) =>
    Array.from(
      { length: count },
      (_, i) => from + ((to - from) * i) / (count - 1),
    );
  // Behind the logo's footprint on the inner wing (it spans up to ~66% of the chord).
  const hinge = 0.76;
  wingRight.add(
    skinLine(
      kit,
      groove,
      span(1.3, 2.3, 7).map((x) => onWing(x, hinge)),
    ),
    skinLine(
      kit,
      groove,
      span(0.3, 1.2, 5).map((x) => onWing(x, hinge)),
    ),
    skinLine(kit, groove, [onWing(1.3, hinge), onWing(1.3, 0.97)]),
    skinLine(kit, groove, [onWing(2.3, hinge), onWing(2.3, 0.97)]),
    skinLine(kit, groove, [onWing(1.2, hinge), onWing(1.2, 0.97)]),
    skinLine(kit, groove, [onWing(0.3, hinge), onWing(0.3, 0.97)]),
  );
  const wingLeft = wingRight.clone();
  wingLeft.scale.x = -1;
  body.add(wingRight, wingLeft);

  // Livery, as on a real airframe: the Otear mark on the left wing and the aircraft's
  // name on the right one. Both read from the nose side and follow the wing's camber.
  const inner = wingStation(0.6);
  const topAt = (z: number) => {
    const { mean, thickness } = airfoilAt(
      (inner.zLE - z) / inner.chord,
      inner.t,
      WING_CAMBER,
    );
    return inner.y + (mean + thickness) * inner.chord + 0.003;
  };
  /** Lays a flat decal over the wing's camber (its local z becomes world height). */
  const drape = (decal: Mesh, zCenter: number) => {
    const position = decal.geometry.getAttribute("position");
    for (let index = 0; index < position.count; index += 1) {
      position.setZ(index, topAt(zCenter - position.getY(index)));
    }
    decal.position.z = zCenter;
  };
  const nameCenter = 0.18;
  const markCenter = 0.25;
  const { decal: mark, material: markMaterial } = createDecal(
    kit,
    null,
    0.76,
    0.304,
    14,
  );
  mark.position.x = -0.62;
  drape(mark, markCenter);
  mark.visible = false;
  body.add(mark);
  new TextureLoader().load(LOGO_URL, (loaded) => {
    loaded.colorSpace = SRGBColorSpace;
    loaded.anisotropy = 4;
    if (kit.state.disposed) {
      loaded.dispose();
      return;
    }
    kit.texture(loaded);
    markMaterial.map = loaded;
    markMaterial.needsUpdate = true;
    mark.visible = true;
  });
  const { decal: name } = createDecal(
    kit,
    createNameTexture(kit, "VIPER"),
    0.74,
    0.185,
    8,
  );
  name.position.x = 0.64;
  drape(name, nameCenter);
  body.add(name);

  // V-tail with hinged ruddervators
  const tailRight = new Group();
  tailRight.add(
    kit.mesh(
      loftSurface(
        TAIL_STATIONS.map(tailStation),
        TAIL_CAMBER,
        topColor,
        navyColor,
        navyColor,
      ),
      skin,
    ),
    skinLine(
      kit,
      groove,
      span(0.06, 0.7, 6).map((s) =>
        surfacePoint(tailStation(s), 0.64, true, TAIL_CAMBER, 0.0012),
      ),
    ),
  );
  const tailLeft = tailRight.clone();
  tailLeft.scale.x = -1;
  body.add(tailRight, tailLeft);

  // Camera under the belly: faired mount, graphite ball and a ringed lens
  const fairing = kit.mesh(
    new RoundedBoxGeometry(0.1, 0.08, 0.26, 3, 0.035),
    navy,
  );
  fairing.position.set(0, -0.125, 0.3);
  body.add(fairing);
  const ball = kit.mesh(
    new SphereGeometry(0.075, 28, 20),
    kit.material(0x10181d, { roughness: 0.32, metalness: 0.3 }),
  );
  ball.position.set(0, -0.2, 0.3);
  body.add(ball);
  const lens = new Group();
  const aim = 0.5;
  lens.position.set(0, -0.2 - Math.sin(aim) * 0.07, 0.3 + Math.cos(aim) * 0.07);
  lens.rotation.x = aim;
  const ring = kit.mesh(new TorusGeometry(0.034, 0.008, 10, 28), kit.steel);
  const disc = kit.mesh(new CircleGeometry(0.03, 24), glass);
  disc.position.z = 0.002;
  lens.add(ring, disc);
  body.add(lens);

  // Pusher motor, ogive spinner and a twisted two-blade propeller
  const motor = kit.mesh(
    new CylinderGeometry(0.046, 0.04, 0.12, 20),
    kit.motor,
  );
  motor.rotation.x = Math.PI / 2;
  motor.position.set(0, 0.002, -1.84);
  body.add(motor);
  const spinnerProfile = [0, 0.012, 0.04, 0.09, 0.16].map(
    (y) =>
      new Vector2(0.046 * Math.sqrt(Math.max(0, 1 - (y / 0.16) ** 2.2)), y),
  );
  const spinnerGeometry = new LatheGeometry(spinnerProfile, 24);
  spinnerGeometry.rotateX(-Math.PI / 2);
  const spinner = kit.mesh(spinnerGeometry, kit.motor);
  spinner.position.set(0, 0.002, -1.9);
  body.add(spinner);

  const holder = new Group();
  holder.position.set(0, 0.002, -1.915);
  holder.rotation.x = Math.PI / 2;
  const propeller = new Group();
  const bladeGeometry = createBladeGeometry();
  const bladeMaterial = kit.material(0x1c2328, { roughness: 0.42 });
  for (let blade = 0; blade < 2; blade += 1) {
    const holderOfBlade = new Group();
    holderOfBlade.rotation.y = blade * Math.PI;
    holderOfBlade.add(kit.mesh(bladeGeometry, bladeMaterial));
    propeller.add(holderOfBlade);
  }
  const blur = kit.mesh(new CircleGeometry(0.4, 40), kit.blur);
  blur.rotation.x = -Math.PI / 2;
  propeller.add(blur);
  holder.add(propeller);
  body.add(holder);
  propellers.push(propeller);

  // extent = widest reach from the vertical axis (wing tip), so it fits at any yaw.
  return { group: root, propellers, extent: 2.75, shadow: 0.35, lit: true };
}

const builders: Record<DroneKind | BrandKind, (kit: Kit) => Parts> = {
  compact: buildCompact,
  enterprise: buildEnterprise,
  sprayer: buildSprayer,
  "fixed-wing": buildFixedWing,
  viper: buildViper,
};

/** Procedural, illustrative aircraft. None of them depicts a real product. */
export function createDroneModel(kind: DroneKind | BrandKind): DroneModel {
  const kit = createKit();
  const parts = builders[kind](kit);
  return { ...parts, dispose: kit.dispose };
}

const FILE_MODEL_SIZE = 3.3;

/** Loads a meshopt-compressed GLB, centres it and scales it to the viewer. */
export async function loadFileDroneModel(
  glbUrl: string,
  yaw = 0,
): Promise<DroneModel> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(glbUrl);
  const plastic = new MeshStandardMaterial({
    color: 0xd2d7db,
    roughness: 0.4,
    metalness: 0.18,
  });
  // Propeller envelopes tagged "disc" by the conversion are drawn as a faint blur.
  const envelope = new MeshStandardMaterial({
    color: 0xcbd4da,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: DoubleSide,
  });
  const geometries: BufferGeometry[] = [];
  gltf.scene.traverse((object) => {
    if (object instanceof Mesh) {
      const isEnvelope =
        !Array.isArray(object.material) && object.material.name === "disc";
      object.material = isEnvelope ? envelope : plastic;
      geometries.push(object.geometry);
    }
  });

  const box = new Box3().setFromObject(gltf.scene);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const scale = FILE_MODEL_SIZE / Math.max(size.x, size.z);
  gltf.scene.scale.setScalar(scale);
  gltf.scene.position.copy(center).multiplyScalar(-scale);

  const group = new Group();
  group.rotation.y = yaw;
  group.add(gltf.scene);
  return {
    group,
    propellers: [],
    extent: FILE_MODEL_SIZE / 2 + 0.05,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      plastic.dispose();
      envelope.dispose();
    },
  };
}
