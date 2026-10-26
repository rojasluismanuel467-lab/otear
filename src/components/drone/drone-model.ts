import {
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Box3,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  SphereGeometry,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

export type DroneKind = "compact" | "enterprise" | "sprayer" | "fixed-wing";

/** Either a generic procedural aircraft or an optimized glTF file. */
export type DroneModelSpec =
  { kind: DroneKind } | { glbUrl: string; yaw?: number };

export function specKey(spec: DroneModelSpec) {
  return "kind" in spec ? `kind:${spec.kind}` : `glb:${spec.glbUrl}`;
}

export type DroneModel = {
  group: Group;
  /** Groups that spin around their local Y axis. */
  propellers: Group[];
  /** Half of the widest horizontal dimension; used to frame the camera. */
  extent: number;
  dispose: () => void;
};

const palette = {
  shell: 0xf1f3ee,
  shellShade: 0xd5dcd3,
  frame: 0x26332e,
  motor: 0x1b2420,
  prop: 0x35423c,
  glass: 0x0a100e,
  accent: 0x1c6f8d,
  front: 0x81bfdb,
  rear: 0xe6a95c,
  tank: 0xe9efe6,
  steel: 0x8a968f,
};

type Kit = ReturnType<typeof createKit>;
type Parts = Pick<DroneModel, "group" | "propellers" | "extent">;

function createKit() {
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];

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

  return {
    mesh,
    material,
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
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((item) => item.dispose());
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

const builders: Record<DroneKind, (kit: Kit) => Parts> = {
  compact: buildCompact,
  enterprise: buildEnterprise,
  sprayer: buildSprayer,
  "fixed-wing": buildFixedWing,
};

/** Procedural, illustrative aircraft. None of them depicts a real product. */
export function createDroneModel(kind: DroneKind): DroneModel {
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
    color: 0xd4dbd2,
    roughness: 0.4,
    metalness: 0.18,
  });
  // Propeller envelopes tagged "disc" by the conversion are drawn as a faint blur.
  const envelope = new MeshStandardMaterial({
    color: 0xbfe6cf,
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
