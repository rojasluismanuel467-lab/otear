// Optimizes a GLB made from a STEP file (cascadio: step_to_glb, tol_linear=0.4, merge_primitives=False).
// Not part of the app build; deps are installed ad hoc: @gltf-transform/{core,functions,extensions} meshoptimizer.
// Usage: DISC_MID=0.8 DISC_LEN=0.15 node optimize-drone-glb.mjs in.glb out.glb 0.2 0.05
import fs from "node:fs";
import { NodeIO } from "@gltf-transform/core";
import {
  weld,
  simplify,
  quantize,
  prune,
  dedup,
  flatten,
  join,
  getBounds,
  normals,
} from "@gltf-transform/functions";
import { MeshoptSimplifier, MeshoptEncoder } from "meshoptimizer";
import {
  EXTMeshoptCompression,
  KHRMeshQuantization,
} from "@gltf-transform/extensions";
const [, , input, output, ratio = "0.1", error = "0.02"] = process.argv;
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(input);
const count = () =>
  doc
    .getRoot()
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .reduce(
      (t, p) =>
        t +
        (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) /
          3,
      0,
    );
console.log(
  "materials",
  doc.getRoot().listMaterials().length,
  "tris before",
  count(),
);
// Flat, wide parts are propeller envelopes in the CAD: give them their own material so they can be drawn translucent.
const tagDiscs = () => (d) => {
  const root = d.getRoot();
  const whole = getBounds(root.listScenes()[0]);
  const overall = Math.max(
    whole.max[0] - whole.min[0],
    whole.max[2] - whole.min[2],
  );
  const disc = d.createMaterial("disc");
  let tagged = 0,
    total = 0;
  for (const mesh of root.listMeshes()) {
    for (const p of mesh.listPrimitives()) {
      total++;
      const a = p.getAttribute("POSITION");
      const min = a.getMin([]),
        max = a.getMax([]);
      const dims = [0, 1, 2].map((k) => max[k] - min[k]).sort((x, y) => x - y);
      if (
        dims[0] < 0.2 * dims[2] &&
        dims[1] > Number(process.env.DISC_MID ?? 0.8) * dims[2] &&
        dims[2] > Number(process.env.DISC_LEN ?? 0.15) * overall
      ) {
        p.setMaterial(disc);
        tagged++;
      }
    }
  }
  console.log("discs tagged", tagged, "of", total);
};
const dropNormals = () => (d) => {
  for (const m of d.getRoot().listMeshes())
    for (const p of m.listPrimitives()) p.setAttribute("NORMAL", null);
};
await doc.transform(
  flatten(),
  tagDiscs(),
  join({ keepNamed: false }),
  dropNormals(),
  weld({ tolerance: 0.00002 }),
  simplify({
    simplifier: MeshoptSimplifier,
    ratio: Number(ratio),
    error: Number(error),
  }),
  normals({ overwrite: true }),
  weld({ tolerance: 0.00002 }),
  dedup(),
  prune(),
);
console.log(
  "tris after",
  count(),
  "materials",
  doc.getRoot().listMaterials().length,
);
const b = getBounds(doc.getRoot().listScenes()[0]);
console.log("bounds", JSON.stringify(b));
await doc.transform(quantize({ quantizePosition: 14, quantizeNormal: 10 }));
doc
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await io.write(output, doc);
console.log("written", output, fs.statSync(output).size);
