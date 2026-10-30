import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  createDroneModel,
  loadFileDroneModel,
  specKey,
  type DroneModelSpec,
} from "./drone-model";

/** Pixel size of a thumbnail (3:2); cards show it at half of this on dense screens. */
const WIDTH = 420;
const HEIGHT = 280;
const FOV = 30;
const TAN_HALF_FOV = Math.tan((FOV / 2) * (Math.PI / 180));
/** The default view of the viewer: nose toward the lower left, seen slightly from above. */
const VIEW = { yaw: -0.65, pitch: 0.2 };

type Studio = {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
  key: DirectionalLight;
  rim: DirectionalLight;
};

let studio: Studio | "unavailable" | undefined;

/** One renderer for every thumbnail: a gallery of a dozen live canvases would exhaust the browser's WebGL contexts. */
function getStudio(): Studio | "unavailable" {
  if (studio) return studio;
  try {
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setSize(WIDTH, HEIGHT, false);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.addEventListener("webglcontextlost", () => {
      studio = undefined;
      cache.clear();
    });
    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    scene.environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    const key = new DirectionalLight(0xfff1e0, 0);
    key.position.set(-3.5, 6, 4.5);
    const rim = new DirectionalLight(0x9ed3ea, 0);
    rim.position.set(4, 2.5, -5);
    scene.add(key, rim);
    const camera = new PerspectiveCamera(FOV, WIDTH / HEIGHT, 0.1, 60);
    studio = { renderer, scene, camera, key, rim };
  } catch {
    studio = "unavailable";
  }
  return studio;
}

async function render(spec: DroneModelSpec): Promise<string | null> {
  const current = getStudio();
  if (current === "unavailable") return null;
  const { renderer, scene, camera, key, rim } = current;
  const model =
    "kind" in spec
      ? createDroneModel(spec.kind)
      : await loadFileDroneModel(spec.glbUrl, spec.yaw);
  try {
    const pivot = new Group();
    pivot.rotation.set(VIEW.pitch, VIEW.yaw, 0, "YXZ");
    pivot.add(model.group);
    scene.add(pivot);
    key.intensity = model.lit ? 1.25 : 0;
    rim.intensity = model.lit ? 1 : 0;
    // Fit the aircraft's reach across the frame with some air around it. A file model's reach is
    // only its half length, so its arms need more room when it is turned.
    const margin = "kind" in spec ? 1.12 : 1.3;
    const distance = (model.extent * margin) / (TAN_HALF_FOV * camera.aspect);
    camera.position.set(0, distance * 0.227, distance);
    camera.lookAt(0, -0.05, 0);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    // Read right after drawing, before the browser clears the buffer.
    const url = renderer.domElement.toDataURL("image/png");
    scene.remove(pivot);
    return url;
  } finally {
    model.dispose();
  }
}

const cache = new Map<string, Promise<string | null>>();
let queue: Promise<unknown> = Promise.resolve();

/**
 * A still image of an aircraft in the viewer's default view, as a data URL, or `null` when the
 * browser has no WebGL or the model cannot be loaded. Results are cached per model and drawn one
 * at a time.
 */
export function droneThumbnail(spec: DroneModelSpec): Promise<string | null> {
  const key = specKey(spec);
  const cached = cache.get(key);
  if (cached) return cached;
  // Let the page paint and answer input between two stills.
  const task = queue
    .then(() => new Promise((resolve) => setTimeout(resolve, 30)))
    .then(() => render(spec))
    .catch(() => null);
  queue = task;
  cache.set(key, task);
  return task;
}
