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

/** Radial gradient for the blur of a spinning rotor: clear at the hub, a soft haze toward the tips. */
function createBlurTexture(kit: Kit) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.1,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(205,216,223,0)");
    gradient.addColorStop(0.35, "rgba(205,216,223,0.07)");
    gradient.addColorStop(0.82, "rgba(205,216,223,0.2)");
    gradient.addColorStop(0.95, "rgba(225,233,238,0.26)");
    gradient.addColorStop(1, "rgba(225,233,238,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = kit.texture(new CanvasTexture(canvas));
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A propeller blade with pale tips, so the eye follows its motion. */
function createTippedBladeGeometry() {
  const geometry = createBladeGeometry();
  const position = geometry.getAttribute("position");
  const colors: number[] = [];
  const body = new Color(0x2b3236);
  const tip = new Color(0xe9edf0);
  for (let index = 0; index < position.count; index += 1) {
    const along = clamp01((position.getX(index) - 0.3) / 0.1);
    const color = body.clone().lerp(tip, along);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Materials of the four generic families: painted shell, graphite plastic, rubber, glass, metal. */
function createPaints(kit: Kit) {
  const paint = (color: number, options: MeshPhysicalMaterialParameters = {}) =>
    kit.track(
      new MeshPhysicalMaterial({
        color,
        roughness: 0.32,
        metalness: 0.04,
        clearcoat: 0.4,
        clearcoatRoughness: 0.28,
        ...options,
      }),
    );
  return {
    shell: paint(0xf1f3f4),
    shade: paint(0xd7dce0, { roughness: 0.4 }),
    graphite: paint(0x2a3237, { roughness: 0.5, clearcoat: 0.15 }),
    black: paint(0x151a1d, { roughness: 0.45, clearcoat: 0.1 }),
    accent: paint(palette.accent),
    glass: paint(0x080c10, {
      roughness: 0.04,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
    }),
    rubber: kit.material(0x14181a, { roughness: 0.92, metalness: 0 }),
    // A spinning rotor reads as a soft disc that is densest toward the tips.
    blurDisc: kit.track(
      new MeshBasicMaterial({
        map: createBlurTexture(kit),
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    ),
    blade: kit.material(0xffffff, { roughness: 0.42, vertexColors: true }),
    metal: kit.material(0x9aa3a9, { roughness: 0.3, metalness: 0.8 }),
    led: (color: number) =>
      kit.material(color, { emissive: color, emissiveIntensity: 1.5 }),
  };
}
type Paints = ReturnType<typeof createPaints>;

const UP = new Vector3(0, 1, 0);

/** A tapered tube from `from` (thicker) to `to`, with a rounded cap at each end. */
function addTube(
  kit: Kit,
  parent: Group,
  from: [number, number, number],
  to: [number, number, number],
  rFrom: number,
  rTo: number,
  material: Material,
) {
  const a = new Vector3(...from);
  const b = new Vector3(...to);
  const direction = b.clone().sub(a);
  const tube = kit.mesh(
    new CylinderGeometry(rTo, rFrom, direction.length(), 16),
    material,
  );
  tube.position.copy(a.clone().add(b).multiplyScalar(0.5));
  tube.quaternion.setFromUnitVectors(UP, direction.normalize());
  parent.add(tube);
  for (const [point, radius] of [
    [a, rFrom],
    [b, rTo],
  ] as const) {
    const cap = kit.mesh(new SphereGeometry(radius, 14, 10), material);
    cap.position.copy(point);
    parent.add(cap);
  }
}

type UnitOptions = {
  x: number;
  y: number;
  z: number;
  radius: number;
  led: number;
  /** Counter-rotating pairs have mirrored blades. */
  mirror?: boolean;
};

/** Motor stack, status ring and LED, and a twisted two-blade propeller with its blur. */
function addRotorUnit(
  kit: Kit,
  paints: Paints,
  parent: Group,
  { x, y, z, radius, led, mirror }: UnitOptions,
) {
  const base = kit.mesh(
    new CylinderGeometry(radius * 0.2, radius * 0.25, 0.16, 20),
    paints.graphite,
  );
  base.position.set(x, y - 0.17, z);
  parent.add(base);
  const bell = kit.mesh(
    new CylinderGeometry(radius * 0.25, radius * 0.27, 0.12, 28),
    paints.black,
  );
  bell.position.set(x, y - 0.06, z);
  parent.add(bell);
  const ring = kit.mesh(
    new TorusGeometry(radius * 0.265, 0.012, 8, 32),
    paints.led(led),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(x, y - 0.115, z);
  parent.add(ring);

  const propeller = new Group();
  propeller.position.set(x, y + 0.012, z);
  if (mirror) propeller.scale.z = -1;
  const blade = createTippedBladeGeometry();
  const scale = radius / 0.4;
  for (let index = 0; index < 2; index += 1) {
    const holder = new Group();
    holder.rotation.y = index * Math.PI;
    const mesh = kit.mesh(blade, paints.blade);
    mesh.scale.setScalar(scale);
    holder.add(mesh);
    propeller.add(holder);
  }
  const hub = kit.mesh(
    new CylinderGeometry(radius * 0.1, radius * 0.12, 0.05, 20),
    paints.black,
  );
  propeller.add(hub);
  const cone = kit.mesh(
    new ConeGeometry(radius * 0.09, 0.05, 18),
    paints.metal,
  );
  cone.position.y = 0.045;
  propeller.add(cone);
  const blur = kit.mesh(new CircleGeometry(radius, 56), paints.blurDisc);
  blur.rotation.x = -Math.PI / 2;
  blur.position.y = 0.006;
  propeller.add(blur);
  parent.add(propeller);
  return propeller;
}

/** Stabilised camera: a yoke, a camera body and lenses. `lenses` adds a zoom and a thermal one. */
function addPayload(
  kit: Kit,
  paints: Paints,
  parent: Group,
  z: number,
  y: number,
  scale = 1,
  lenses = false,
) {
  const mount = kit.mesh(
    new RoundedBoxGeometry(0.3 * scale, 0.07 * scale, 0.22 * scale, 3, 0.03),
    paints.graphite,
  );
  mount.position.set(0, y + 0.2 * scale, z - 0.06 * scale);
  parent.add(mount);
  for (const side of [-1, 1]) {
    const arm = kit.mesh(
      new CapsuleGeometry(0.018 * scale, 0.2 * scale, 3, 8),
      paints.graphite,
    );
    arm.position.set(side * 0.13 * scale, y + 0.07 * scale, z - 0.02 * scale);
    parent.add(arm);
  }
  const body = kit.mesh(
    new RoundedBoxGeometry(0.22 * scale, 0.2 * scale, 0.26 * scale, 4, 0.06),
    paints.black,
  );
  body.position.set(0, y, z);
  parent.add(body);
  const lensAt = (dx: number, dy: number, radius: number) => {
    const barrel = kit.mesh(
      new CylinderGeometry(
        radius * scale,
        radius * 1.1 * scale,
        0.05 * scale,
        24,
      ),
      paints.metal,
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(dx * scale, y + dy * scale, z + 0.15 * scale);
    parent.add(barrel);
    const glass = kit.mesh(
      new CircleGeometry(radius * 0.82 * scale, 24),
      paints.glass,
    );
    glass.position.set(dx * scale, y + dy * scale, z + 0.178 * scale);
    parent.add(glass);
  };
  if (lenses) {
    lensAt(-0.05, 0.03, 0.062);
    lensAt(0.058, 0.045, 0.034);
    lensAt(0.058, -0.045, 0.034);
  } else lensAt(0, 0, 0.07);
}

/** Landing foot: a rubber cap on a short stub. */
function addFoot(
  kit: Kit,
  paints: Paints,
  parent: Group,
  x: number,
  y: number,
  z: number,
) {
  const foot = kit.mesh(new SphereGeometry(0.05, 14, 10), paints.rubber);
  foot.scale.y = 0.7;
  foot.position.set(x, y, z);
  parent.add(foot);
}

function buildCompact(kit: Kit): Parts {
  const paints = createPaints(kit);
  const group = new Group();
  const propellers: Group[] = [];

  // Body: a smooth pod, light shell over a graphite belly, like a folding survey drone.
  const pod: [number, number][] = [
    [-0.8, 0],
    [-0.74, 0.14],
    [-0.62, 0.3],
    [-0.4, 0.43],
    [-0.15, 0.49],
    [0.1, 0.5],
    [0.34, 0.47],
    [0.55, 0.39],
    [0.7, 0.24],
    [0.78, 0.09],
    [0.8, 0],
  ];
  const bellyHalf = 1.25;
  group.add(
    kit.mesh(
      fuselageSkin(-bellyHalf, bellyHalf * 2, 28, pod, 0.46),
      paints.graphite,
    ),
    kit.mesh(
      fuselageSkin(bellyHalf, Math.PI * 2 - bellyHalf * 2, 40, pod, 0.46),
      paints.shell,
    ),
  );
  // Raised deck with the battery cover, its seams and the brand stripe
  const deck = kit.mesh(new SphereGeometry(1, 28, 14), paints.shade);
  deck.scale.set(0.3, 0.08, 0.52);
  deck.position.set(0, 0.18, -0.08);
  group.add(deck);
  const stripe = kit.mesh(new BoxGeometry(0.07, 0.012, 0.74), paints.accent);
  stripe.position.set(0, 0.255, -0.08);
  group.add(stripe);
  for (const side of [-1, 1]) {
    const seam = kit.mesh(new BoxGeometry(0.006, 0.014, 0.84), paints.black);
    seam.position.set(side * 0.2, 0.2, -0.08);
    seam.rotation.z = side * 0.28;
    group.add(seam);
  }
  // Rear vents and the GPS dome
  for (let slit = 0; slit < 3; slit += 1) {
    const vent = kit.mesh(new BoxGeometry(0.3, 0.012, 0.026), paints.black);
    vent.position.set(0, 0.17 - slit * 0.012, -0.5 - slit * 0.06);
    vent.rotation.x = 0.35 + slit * 0.12;
    group.add(vent);
  }
  const dome = kit.mesh(new SphereGeometry(0.1, 20, 12), paints.shell);
  dome.scale.set(1, 0.5, 1);
  dome.position.set(0, 0.215, 0.28);
  group.add(dome);
  // Nose: two vision lenses in a dark band, and a forward light
  const band = kit.mesh(new SphereGeometry(1, 24, 12), paints.black);
  band.scale.set(0.34, 0.07, 0.14);
  band.position.set(0, 0.05, 0.63);
  group.add(band);
  for (const side of [-1, 1]) {
    const eye = kit.mesh(new SphereGeometry(0.046, 16, 12), paints.glass);
    eye.scale.z = 0.5;
    eye.position.set(side * 0.19, 0.05, 0.725);
    group.add(eye);
    const rim = kit.mesh(new TorusGeometry(0.05, 0.007, 8, 24), paints.metal);
    rim.position.set(side * 0.19, 0.05, 0.725);
    group.add(rim);
  }
  // Belly: downward vision sensors and the rear status strip
  for (const side of [-1, 1]) {
    const sensor = kit.mesh(new CircleGeometry(0.035, 16), paints.glass);
    sensor.rotation.x = Math.PI / 2;
    sensor.position.set(side * 0.16, -0.2, 0.3);
    group.add(sensor);
  }
  const strip = kit.mesh(
    new BoxGeometry(0.2, 0.016, 0.012),
    paints.led(0xb7f0c8),
  );
  strip.position.set(0, 0.04, -0.7);
  group.add(strip);
  for (const side of [-1, 1]) {
    const latch = kit.mesh(new BoxGeometry(0.014, 0.07, 0.2), paints.graphite);
    latch.position.set(side * 0.485, 0.03, -0.1);
    group.add(latch);
  }
  addPayload(kit, paints, group, 0.66, -0.3);

  // Landing skids on splayed legs, with rubber feet and an upturned nose
  for (const side of [-1, 1]) {
    const skid = kit.mesh(
      new CapsuleGeometry(0.03, 1.0, 4, 10),
      paints.graphite,
    );
    skid.rotation.x = Math.PI / 2;
    skid.position.set(side * 0.5, -0.52, -0.05);
    group.add(skid);
    const tip = kit.mesh(
      new CapsuleGeometry(0.03, 0.12, 4, 8),
      paints.graphite,
    );
    tip.rotation.x = Math.PI / 2 - 0.55;
    tip.position.set(side * 0.5, -0.49, 0.54);
    group.add(tip);
    for (const z of [-0.45, 0.4]) {
      addTube(
        kit,
        group,
        [side * 0.4, -0.12, z],
        [side * 0.5, -0.5, z],
        0.03,
        0.026,
        paints.graphite,
      );
      addFoot(kit, paints, group, side * 0.5, -0.53, z);
    }
  }

  // Arms fold out of the shoulders; the front pair carry blue lights, the rear pair amber
  for (const [x, z, led] of [
    [-1.05, 0.95, palette.front],
    [1.05, 0.95, palette.front],
    [-1.05, -0.95, palette.rear],
    [1.05, -0.95, palette.rear],
  ] as const) {
    const side = Math.sign(x);
    addTube(
      kit,
      group,
      [side * 0.42, 0.08, Math.sign(z) * 0.5],
      [x, 0.1, z],
      0.085,
      0.062,
      paints.graphite,
    );
    const hinge = kit.mesh(
      new CylinderGeometry(0.09, 0.09, 0.12, 16),
      paints.black,
    );
    hinge.position.set(side * 0.42, 0.08, Math.sign(z) * 0.5);
    group.add(hinge);
    propellers.push(
      addRotorUnit(kit, paints, group, {
        x,
        y: 0.27,
        z,
        radius: 0.6,
        led,
        mirror: x * z < 0,
      }),
    );
  }
  return { group, propellers, extent: 1.7, lit: true };
}

function buildEnterprise(kit: Kit): Parts {
  const paints = createPaints(kit);
  const group = new Group();
  const propellers: Group[] = [];

  group.add(
    kit.mesh(new RoundedBoxGeometry(1.1, 0.4, 1.5, 6, 0.12), paints.graphite),
  );
  const shell = kit.mesh(
    new RoundedBoxGeometry(0.86, 0.22, 1.16, 6, 0.1),
    paints.shell,
  );
  shell.position.y = 0.28;
  group.add(shell);
  // Sloped nose with two vision windows, and a rear service panel
  const nose = kit.mesh(
    new RoundedBoxGeometry(0.82, 0.2, 0.3, 4, 0.07),
    paints.black,
  );
  nose.position.set(0, 0.2, 0.7);
  nose.rotation.x = -0.35;
  group.add(nose);
  for (const side of [-1, 1]) {
    const window = kit.mesh(new BoxGeometry(0.2, 0.07, 0.012), paints.glass);
    window.position.set(side * 0.26, 0.2, 0.84);
    window.rotation.x = -0.35;
    group.add(window);
  }
  const bar = kit.mesh(new BoxGeometry(0.64, 0.012, 0.07), paints.accent);
  bar.position.set(0, 0.396, 0.34);
  group.add(bar);
  const panel = kit.mesh(
    new RoundedBoxGeometry(0.5, 0.02, 0.4, 3, 0.008),
    paints.graphite,
  );
  panel.position.set(0, 0.392, -0.34);
  group.add(panel);
  for (let slot = 0; slot < 7; slot += 1) {
    const vent = kit.mesh(new BoxGeometry(0.36, 0.004, 0.014), paints.black);
    vent.position.set(0, 0.403, -0.5 + slot * 0.052);
    group.add(vent);
  }
  // Batteries on the flanks, each with a handle
  for (const side of [-1, 1]) {
    const pack = kit.mesh(
      new RoundedBoxGeometry(0.14, 0.3, 0.8, 4, 0.05),
      paints.shade,
    );
    pack.position.set(side * 0.6, 0.04, -0.12);
    group.add(pack);
    const handle = kit.mesh(
      new CapsuleGeometry(0.015, 0.22, 3, 8),
      paints.metal,
    );
    handle.rotation.x = Math.PI / 2;
    handle.position.set(side * 0.69, 0.04, -0.12);
    group.add(handle);
  }
  // GPS pucks on mast, a beacon, and two radio antennas
  for (const side of [-1, 1]) {
    const mast = kit.mesh(
      new CylinderGeometry(0.02, 0.026, 0.4, 10),
      paints.graphite,
    );
    mast.position.set(side * 0.34, 0.58, -0.58);
    mast.rotation.z = side * -0.12;
    group.add(mast);
    const puck = kit.mesh(new SphereGeometry(0.075, 20, 10), paints.shell);
    puck.scale.y = 0.45;
    puck.position.set(side * 0.37, 0.8, -0.58);
    group.add(puck);
  }
  const beacon = kit.mesh(
    new SphereGeometry(0.045, 14, 10),
    paints.led(0xffb04a),
  );
  beacon.position.set(0, 0.42, -0.62);
  group.add(beacon);

  // Payload bay with a multi-lens camera
  const bay = kit.mesh(
    new RoundedBoxGeometry(0.62, 0.18, 0.5, 4, 0.06),
    paints.black,
  );
  bay.position.set(0, -0.3, 0.28);
  group.add(bay);
  addPayload(kit, paints, group, 0.62, -0.52, 1.5, true);

  // Tall landing gear: two inverted U frames on rubber feet, braced to the body
  for (const z of [-0.45, 0.45]) {
    const bridge = kit.mesh(
      new CapsuleGeometry(0.04, 1.5, 4, 10),
      paints.graphite,
    );
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, -0.98, z);
    group.add(bridge);
    for (const side of [-1, 1]) {
      addTube(
        kit,
        group,
        [side * 0.6, -0.12, z],
        [side * 0.78, -0.96, z],
        0.045,
        0.04,
        paints.graphite,
      );
      addFoot(kit, paints, group, side * 0.78, -1.0, z);
    }
  }
  for (const [x, z, led] of [
    [-1.35, 1.05, palette.front],
    [1.35, 1.05, palette.front],
    [-1.35, -1.05, palette.rear],
    [1.35, -1.05, palette.rear],
  ] as const) {
    const side = Math.sign(x);
    const shoulder: [number, number, number] = [
      side * 0.52,
      0.1,
      Math.sign(z) * 0.52,
    ];
    addTube(kit, group, shoulder, [x, 0.14, z], 0.12, 0.085, paints.graphite);
    // Fold joint a third of the way out
    const joint = kit.mesh(
      new CylinderGeometry(0.115, 0.115, 0.16, 18),
      paints.black,
    );
    joint.position.set(
      shoulder[0] + (x - shoulder[0]) * 0.34,
      0.12,
      shoulder[2] + (z - shoulder[2]) * 0.34,
    );
    group.add(joint);
    propellers.push(
      addRotorUnit(kit, paints, group, {
        x,
        y: 0.37,
        z,
        radius: 0.72,
        led,
        mirror: x * z < 0,
      }),
    );
  }
  return { group, propellers, extent: 2.05, lit: true };
}

function buildSprayer(kit: Kit): Parts {
  const paints = createPaints(kit);
  const group = new Group();
  const propellers: Group[] = [];

  group.add(
    kit.mesh(new RoundedBoxGeometry(0.9, 0.3, 1.5, 5, 0.1), paints.graphite),
  );
  // Tank: clear shell, the liquid inside, a filler cap and level marks
  const tank = kit.mesh(
    new RoundedBoxGeometry(1.15, 0.62, 1.1, 6, 0.18),
    kit.track(
      new MeshPhysicalMaterial({
        color: 0xe4eef2,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        depthWrite: false,
      }),
    ),
  );
  tank.position.y = 0.46;
  tank.renderOrder = 2;
  group.add(tank);
  const liquid = kit.mesh(
    new RoundedBoxGeometry(1.06, 0.42, 1.0, 5, 0.14),
    kit.material(0x3fae9a, { roughness: 0.25 }),
  );
  liquid.position.y = 0.4;
  group.add(liquid);
  for (let mark = 0; mark < 4; mark += 1) {
    const tick = kit.mesh(new BoxGeometry(0.012, 0.012, 0.3), paints.graphite);
    tick.position.set(0.578, 0.3 + mark * 0.1, 0.1);
    group.add(tick);
    const other = tick.clone();
    other.position.x = -0.578;
    group.add(other);
  }
  const cap = kit.mesh(
    new CylinderGeometry(0.15, 0.17, 0.08, 24),
    paints.black,
  );
  cap.position.set(0, 0.8, -0.2);
  group.add(cap);
  const collar = kit.mesh(new TorusGeometry(0.15, 0.018, 8, 28), paints.accent);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.84, -0.2);
  group.add(collar);

  // Front and rear radar panels, a pump housing, and a forward camera
  for (const z of [0.82, -0.82]) {
    const housing = kit.mesh(
      new RoundedBoxGeometry(0.44, 0.15, 0.07, 3, 0.03),
      paints.black,
    );
    housing.position.set(0, 0.02, z);
    group.add(housing);
    const face = kit.mesh(
      new RoundedBoxGeometry(0.34, 0.09, 0.012, 2, 0.005),
      paints.glass,
    );
    face.position.set(0, 0.02, z + Math.sign(z) * 0.038);
    group.add(face);
  }
  const pump = kit.mesh(
    new RoundedBoxGeometry(0.5, 0.16, 0.42, 4, 0.06),
    paints.graphite,
  );
  pump.position.set(0, -0.22, 0.05);
  group.add(pump);
  const pumpBand = kit.mesh(new BoxGeometry(0.502, 0.03, 0.1), paints.accent);
  pumpBand.position.set(0, -0.22, 0.05);
  group.add(pumpBand);
  const eye = kit.mesh(new SphereGeometry(0.06, 14, 10), paints.glass);
  eye.position.set(0, 0.2, 0.78);
  group.add(eye);

  // Long skids with legs and rubber feet
  for (const side of [-1, 1]) {
    const skid = kit.mesh(
      new CapsuleGeometry(0.04, 1.7, 4, 10),
      paints.graphite,
    );
    skid.rotation.x = Math.PI / 2;
    skid.position.set(side * 0.55, -0.78, 0);
    group.add(skid);
    for (const z of [-0.55, 0.55]) {
      addTube(
        kit,
        group,
        [side * 0.45, -0.14, z],
        [side * 0.55, -0.76, z],
        0.04,
        0.035,
        paints.graphite,
      );
      addFoot(kit, paints, group, side * 0.55, -0.82, z);
    }
  }

  for (const [x, z, led] of [
    [-1.6, 1.15, palette.front],
    [1.6, 1.15, palette.front],
    [-1.6, -1.15, palette.rear],
    [1.6, -1.15, palette.rear],
  ] as const) {
    const side = Math.sign(x);
    const shoulder: [number, number, number] = [
      side * 0.46,
      0.06,
      Math.sign(z) * 0.5,
    ];
    addTube(kit, group, shoulder, [x, 0.08, z], 0.11, 0.08, paints.graphite);
    const joint = kit.mesh(
      new CylinderGeometry(0.12, 0.12, 0.17, 18),
      paints.black,
    );
    joint.position.set(
      shoulder[0] + (x - shoulder[0]) * 0.3,
      0.07,
      shoulder[2] + (z - shoulder[2]) * 0.3,
    );
    group.add(joint);
    propellers.push(
      addRotorUnit(kit, paints, group, {
        x,
        y: 0.32,
        z,
        radius: 0.85,
        led,
        mirror: x * z < 0,
      }),
    );
    // Hose from the tank to the atomiser under each rotor
    const hose = new CatmullRomCurve3([
      new Vector3(side * 0.3, 0.2, Math.sign(z) * 0.2),
      new Vector3(x * 0.6, 0.02, z * 0.55),
      new Vector3(x, -0.12, z),
    ]);
    group.add(
      kit.mesh(new TubeGeometry(hose, 20, 0.026, 8, false), paints.rubber),
    );
    const stem = kit.mesh(
      new CylinderGeometry(0.03, 0.03, 0.3, 10),
      paints.metal,
    );
    stem.position.set(x, -0.27, z);
    group.add(stem);
    const atomiser = kit.mesh(
      new CylinderGeometry(0.1, 0.07, 0.07, 22),
      paints.metal,
    );
    atomiser.position.set(x, -0.46, z);
    group.add(atomiser);
    const disc = kit.mesh(
      new CylinderGeometry(0.115, 0.115, 0.012, 24),
      paints.black,
    );
    disc.position.set(x, -0.5, z);
    group.add(disc);
  }
  return { group, propellers, extent: 2.5, lit: true };
}

/** Wing of the fixed-wing family: swept back, tapered, with a slight dihedral. */
const FW_HALF_SPAN = 1.85;
const FW_CAMBER = 0.02;
function flyingWingStation(x: number): Station {
  const u = clamp01(x / FW_HALF_SPAN);
  return {
    x,
    y: 0.01 + 0.07 * u ** 1.6,
    zLE: 0.24 - 0.6 * u ** 1.15,
    chord: 0.68 * (1 - 0.62 * u),
    t: 0.13 - 0.05 * u,
    bank: Math.atan((0.07 * 1.6 * u ** 0.6) / FW_HALF_SPAN),
  };
}
const FW_STATIONS = [0.04, 0.2, 0.4, 0.65, 0.9, 1.15, 1.4, 1.62, 1.76, 1.85];

/** A winglet standing at the wing tip. `s` is the height above the tip. */
function wingletStation(s: number): Station {
  const tip = flyingWingStation(FW_HALF_SPAN);
  return {
    x: FW_HALF_SPAN + 0.05 * s,
    y: tip.y + s,
    zLE: tip.zLE - 0.5 * s,
    chord: 0.25 - 0.4 * s,
    t: 0.07,
    bank: Math.PI / 2 - 0.08,
  };
}
const WINGLET_STATIONS = [0.01, 0.06, 0.12, 0.18, 0.24, 0.28];

const FW_PROFILE: [number, number][] = [
  [-0.62, 0.03],
  [-0.5, 0.06],
  [-0.3, 0.1],
  [-0.05, 0.128],
  [0.2, 0.13],
  [0.42, 0.11],
  [0.58, 0.075],
  [0.68, 0.035],
  [0.72, 0],
];

function buildFixedWing(kit: Kit): Parts {
  const paints = createPaints(kit);
  const root = new Group();
  const body = new Group();
  // Centre the aircraft (propeller at -z, nose at +z) on the origin.
  body.position.z = -0.04;
  root.add(body);
  const propellers: Group[] = [];
  const top = new Color(0xf2f4f5);
  const accent = new Color(palette.accent);
  const under = new Color(0x2a3237);
  const skin = kit.track(
    new MeshPhysicalMaterial({
      vertexColors: true,
      roughness: 0.32,
      metalness: 0.04,
      clearcoat: 0.35,
      clearcoatRoughness: 0.3,
    }),
  );
  const groove = kit.material(0x0f1a20, { roughness: 0.8 });

  // Fuselage pod: white upper skin over a graphite belly
  const bellyHalf = 1.1;
  body.add(
    kit.mesh(
      fuselageSkin(-bellyHalf, bellyHalf * 2, 28, FW_PROFILE, 0.86),
      paints.graphite,
    ),
    kit.mesh(
      fuselageSkin(
        bellyHalf,
        Math.PI * 2 - bellyHalf * 2,
        40,
        FW_PROFILE,
        0.86,
      ),
      paints.shell,
    ),
  );
  // Top hatch, GPS fin, pitot tube
  const hatch = kit.mesh(
    new RoundedBoxGeometry(0.15, 0.03, 0.34, 3, 0.012),
    paints.accent,
  );
  hatch.position.set(0, 0.123, 0.2);
  body.add(hatch);
  const gps = kit.mesh(
    new RoundedBoxGeometry(0.014, 0.07, 0.13, 2, 0.006),
    paints.shell,
  );
  gps.position.set(0, 0.15, -0.22);
  body.add(gps);
  const pitot = kit.mesh(
    new CylinderGeometry(0.007, 0.007, 0.22, 10),
    kit.steel,
  );
  pitot.rotation.x = Math.PI / 2;
  pitot.position.set(0, 0, 0.82);
  body.add(pitot);

  // Wing and winglets: one lofted surface per half, with hinge lines for the elevons
  const wingHalf = new Group();
  wingHalf.add(
    kit.mesh(
      loftSurface(
        FW_STATIONS.map(flyingWingStation),
        FW_CAMBER,
        top,
        accent,
        under,
      ),
      skin,
    ),
    kit.mesh(
      loftSurface(
        WINGLET_STATIONS.map(wingletStation),
        0.01,
        accent,
        accent,
        accent,
      ),
      skin,
    ),
  );
  const onWing = (x: number) =>
    surfacePoint(flyingWingStation(x), 0.74, true, FW_CAMBER, 0.0012);
  wingHalf.add(
    skinLine(kit, groove, [0.2, 0.5, 0.8, 1.1, 1.4, 1.7].map(onWing)),
    skinLine(kit, groove, [
      onWing(0.2),
      surfacePoint(flyingWingStation(0.2), 0.97, true, FW_CAMBER, 0.0012),
    ]),
    skinLine(kit, groove, [
      onWing(1.7),
      surfacePoint(flyingWingStation(1.7), 0.97, true, FW_CAMBER, 0.0012),
    ]),
  );
  // Brand-coloured trim along the trailing edge of the elevons
  wingHalf.add(
    skinLine(
      kit,
      paints.accent,
      [0.2, 0.6, 1.0, 1.4, 1.7].map((x) =>
        surfacePoint(flyingWingStation(x), 0.985, true, FW_CAMBER, 0.0015),
      ),
      0.0065,
    ),
  );
  const wingLeft = wingHalf.clone();
  wingLeft.scale.x = -1;
  body.add(wingHalf, wingLeft);

  // A belly skid with two struts, for hand landings
  const skid = kit.mesh(
    new CapsuleGeometry(0.014, 0.62, 3, 8),
    paints.graphite,
  );
  skid.rotation.x = Math.PI / 2;
  skid.position.set(0, -0.155, 0.05);
  body.add(skid);
  for (const z of [-0.18, 0.28]) {
    const strut = kit.mesh(
      new CylinderGeometry(0.01, 0.01, 0.05, 8),
      paints.graphite,
    );
    strut.position.set(0, -0.13, z);
    body.add(strut);
  }

  // Belly camera hatch and lens
  const hatchBelly = kit.mesh(
    new RoundedBoxGeometry(0.16, 0.05, 0.26, 3, 0.02),
    paints.black,
  );
  hatchBelly.position.set(0, -0.125, 0.2);
  body.add(hatchBelly);
  const lens = kit.mesh(new CircleGeometry(0.036, 20), paints.glass);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, -0.152, 0.2);
  body.add(lens);

  // Pusher motor, spinner and a twisted two-blade propeller
  const motor = kit.mesh(
    new CylinderGeometry(0.05, 0.044, 0.1, 20),
    paints.black,
  );
  motor.rotation.x = Math.PI / 2;
  motor.position.set(0, 0, -0.67);
  body.add(motor);
  const spinnerProfile = [0, 0.012, 0.04, 0.085, 0.14].map(
    (y) => new Vector2(0.05 * Math.sqrt(Math.max(0, 1 - (y / 0.14) ** 2.2)), y),
  );
  const spinnerGeometry = new LatheGeometry(spinnerProfile, 24);
  spinnerGeometry.rotateX(-Math.PI / 2);
  const spinner = kit.mesh(spinnerGeometry, paints.metal);
  spinner.position.set(0, 0, -0.72);
  body.add(spinner);
  const holder = new Group();
  holder.position.set(0, 0, -0.735);
  holder.rotation.x = Math.PI / 2;
  const propeller = new Group();
  const blade = createTippedBladeGeometry();
  for (let index = 0; index < 2; index += 1) {
    const pivot = new Group();
    pivot.rotation.y = index * Math.PI;
    const mesh = kit.mesh(blade, paints.blade);
    mesh.scale.setScalar(0.95);
    pivot.add(mesh);
    propeller.add(pivot);
  }
  const blur = kit.mesh(new CircleGeometry(0.4, 48), paints.blurDisc);
  blur.rotation.x = -Math.PI / 2;
  propeller.add(blur);
  holder.add(propeller);
  body.add(holder);
  propellers.push(propeller);

  return { group: root, propellers, extent: 1.95, lit: true };
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
function fuselageSkin(
  phiStart: number,
  phiLength: number,
  segments: number,
  profile: [number, number][] = FUSELAGE_PROFILE,
  flatten = 0.84,
) {
  const curve = new SplineCurve(profile.map(([z, r]) => new Vector2(r, z)));
  const points = curve
    .getPoints(90)
    .map((point) => new Vector2(Math.max(0, point.x), point.y));
  const geometry = new LatheGeometry(points, segments, phiStart, phiLength);
  geometry.rotateX(Math.PI / 2);
  geometry.scale(1, flatten, 1);
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
