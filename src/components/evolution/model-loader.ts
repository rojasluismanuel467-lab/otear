import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Points,
  PointsMaterial,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import {
  deliverableFor,
  heightColors,
  readLas,
  readXyz,
} from "@/features/evolution/point-cloud";

/** Width the model is scaled to, the same as the schematic building, so the camera framing is shared. */
export const MODEL_WIDTH = 11;
export const MAX_FILE_MB = 200;

export interface LoadedModel {
  name: string;
  kind: "mesh" | "points";
  object: Object3D;
  /** Height of the model after scaling, in scene units. */
  height: number;
  /** Depth of the model after scaling, in scene units. */
  depth: number;
  /** Human readable summary: size and counts. */
  info: string;
  dispose: () => void;
}

export type Up = "z" | "y";

const number = (value: number) =>
  new Intl.NumberFormat("es-CO").format(Math.round(value));

/** Turns survey axes (z up) into scene axes (y up, north toward -z). */
function rotateSurvey(positions: Float32Array) {
  for (let i = 0; i < positions.length; i += 3) {
    const y = positions[i + 1];
    positions[i + 1] = positions[i + 2];
    positions[i + 2] = -y;
  }
}

/** Centres the object on x and z, puts its base on y = 0 and scales it to MODEL_WIDTH. */
function normalize(object: Object3D) {
  const box = new Box3().setFromObject(object);
  const size = box.getSize(new Vector3());
  const centre = box.getCenter(new Vector3());
  const scale = MODEL_WIDTH / Math.max(size.x, size.z, 1e-6);
  const holder = new Group();
  object.position.set(-centre.x, -box.min.y, -centre.z);
  holder.add(object);
  holder.scale.setScalar(scale);
  return { holder, height: size.y * scale, depth: size.z * scale, raw: size };
}

function disposeObject(object: Object3D) {
  object.traverse((child) => {
    if (child instanceof Mesh || child instanceof Points) {
      child.geometry.dispose();
      const materials: Material[] = Array.isArray(child.material)
        ? child.material
        : [child.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value && typeof value === "object" && "isTexture" in value) {
            (value as { dispose: () => void }).dispose();
          }
        });
        material.dispose();
      });
    }
  });
}

function pointsFrom(
  positions: Float32Array,
  colors: Float32Array | undefined,
  up: 0 | 1 | 2,
) {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute(
    "color",
    new BufferAttribute(colors ?? heightColors(positions, up), 3),
  );
  return new Points(
    geometry,
    new PointsMaterial({
      size: 0.065,
      vertexColors: true,
      sizeAttenuation: true,
    }),
  );
}

function clay() {
  return new MeshStandardMaterial({
    color: 0xc9d3d9,
    roughness: 0.85,
    metalness: 0.02,
    side: DoubleSide,
  });
}

function finish(
  name: string,
  kind: LoadedModel["kind"],
  object: Object3D,
  info: string,
): LoadedModel {
  const { holder, height, depth } = normalize(object);
  return {
    name,
    kind,
    object: holder,
    height,
    depth,
    info,
    dispose: () => disposeObject(holder),
  };
}

export type LoadResult =
  { ok: true; model: LoadedModel } | { ok: false; error: string };

/**
 * Reads a file the drone survey delivered. Point clouds and meshes in common formats work;
 * anything else gets an explanation of what it is and how to convert it.
 */
export async function loadDeliverable(file: File, up: Up): Promise<LoadResult> {
  const kindInfo = deliverableFor(file.name);
  if (!kindInfo) {
    return {
      ok: false,
      error:
        "No reconozco este tipo de archivo. Use un modelo (.glb, .obj, .ply) o una nube de puntos (.las, .xyz).",
    };
  }
  if (!kindInfo.supported) {
    return {
      ok: false,
      error: `${kindInfo.name}: ${kindInfo.note ?? "no se puede mostrar todavía."}`,
    };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return {
      ok: false,
      error: `El archivo pesa más de ${MAX_FILE_MB} MB. Reduzca la malla o la nube y vuelva a cargarla.`,
    };
  }
  const lower = file.name.toLowerCase();
  const mb =
    file.size < 1024 * 1024
      ? `${Math.max(1, Math.round(file.size / 1024))} KB`
      : `${(file.size / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
  try {
    if (lower.endsWith(".las")) {
      const result = readLas(await file.arrayBuffer());
      if (!result.ok) return { ok: false, error: result.error };
      const cloud = result.value;
      rotateSurvey(cloud.positions);
      const object = pointsFrom(cloud.positions, cloud.colors, 1);
      return {
        ok: true,
        model: finish(
          file.name,
          "points",
          object,
          `${mb} · ${number(cloud.total)} puntos (se muestran ${number(cloud.positions.length / 3)}) · ${number(cloud.extent[0])} × ${number(cloud.extent[1])} × ${number(cloud.extent[2])} unidades del archivo`,
        ),
      };
    }
    if (/\.(xyz|txt|csv)$/.test(lower)) {
      const result = readXyz(await file.text());
      if (!result.ok) return { ok: false, error: result.error };
      const cloud = result.value;
      if (up === "z") rotateSurvey(cloud.positions);
      const object = pointsFrom(cloud.positions, cloud.colors, 1);
      return {
        ok: true,
        model: finish(
          file.name,
          "points",
          object,
          `${mb} · ${number(cloud.total)} puntos (se muestran ${number(cloud.positions.length / 3)})`,
        ),
      };
    }
    if (lower.endsWith(".glb")) {
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const url = URL.createObjectURL(file);
      try {
        const gltf = await loader.loadAsync(url);
        let triangles = 0;
        gltf.scene.traverse((child) => {
          if (child instanceof Mesh) {
            triangles +=
              (child.geometry.index?.count ??
                child.geometry.attributes.position.count) / 3;
            const materials: Material[] = Array.isArray(child.material)
              ? child.material
              : [child.material];
            materials.forEach((material) => {
              material.side = DoubleSide;
            });
          }
        });
        return {
          ok: true,
          model: finish(
            file.name,
            "mesh",
            gltf.scene,
            `${mb} · ${number(triangles)} triángulos`,
          ),
        };
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (lower.endsWith(".obj")) {
      const group = new OBJLoader().parse(await file.text());
      let triangles = 0;
      group.traverse((child) => {
        if (child instanceof Mesh) {
          child.material = clay();
          triangles += child.geometry.attributes.position.count / 3;
          if (up === "z") {
            const position = child.geometry.attributes
              .position as BufferAttribute;
            rotateSurvey(position.array as Float32Array);
            position.needsUpdate = true;
            child.geometry.computeVertexNormals();
          }
        }
      });
      if (!triangles)
        return { ok: false, error: "El OBJ no trae caras (solo vértices)." };
      return {
        ok: true,
        model: finish(
          file.name,
          "mesh",
          group,
          `${mb} · ${number(triangles)} triángulos · sin textura`,
        ),
      };
    }
    if (lower.endsWith(".ply")) {
      const geometry = new PLYLoader().parse(await file.arrayBuffer());
      const position = geometry.attributes.position as BufferAttribute;
      if (up === "z") rotateSurvey(position.array as Float32Array);
      if (geometry.index) {
        geometry.computeVertexNormals();
        const hasColor = Boolean(geometry.attributes.color);
        const material = clay();
        material.vertexColors = hasColor;
        const mesh = new Mesh(geometry, material);
        return {
          ok: true,
          model: finish(
            file.name,
            "mesh",
            mesh,
            `${mb} · ${number(geometry.index.count / 3)} triángulos`,
          ),
        };
      }
      const colors = geometry.attributes.color
        ? (geometry.attributes.color.array as Float32Array)
        : undefined;
      const object = pointsFrom(position.array as Float32Array, colors, 1);
      return {
        ok: true,
        model: finish(
          file.name,
          "points",
          object,
          `${mb} · ${number(position.count)} puntos`,
        ),
      };
    }
  } catch {
    return {
      ok: false,
      error:
        "No se pudo leer el archivo. Compruebe que no esté dañado y que el eje vertical elegido sea el correcto.",
    };
  }
  return { ok: false, error: "Formato no compatible." };
}
