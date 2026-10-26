import assert from "node:assert/strict";
import test from "node:test";
import {
  catalogForModelKey,
  markPartName,
  nearestPart,
  partLabel,
  sourcesOf,
} from "./parts-catalog.ts";

test("model keys resolve to the catalog of that aircraft", () => {
  assert.equal(
    catalogForModelKey("glb:/models/dji/matrice-350-rtk.glb").id,
    "matrice-350-rtk",
  );
  assert.equal(catalogForModelKey("kind:fixed-wing").id, "fixed-wing");
  assert.equal(catalogForModelKey("scan:mi-dron.glb:123").id, "scan");
});

test("manual names keep the manufacturer's number and Spanish text", () => {
  const m3e = catalogForModelKey("glb:/models/dji/mavic-3-enterprise.glb");
  const motors = m3e.parts.find((part) => part.id === "motors");
  assert.equal(motors?.en, "Motors");
  assert.equal(motors?.ref, "Aeronave, n.º 7");
  assert.equal(motors?.esOfficial, true);
  assert.equal(partLabel(motors!), "Motores (Motors)");
  const m350 = catalogForModelKey("glb:/models/dji/matrice-350-rtk.glb");
  assert.equal(m350.parts.find((part) => part.id === "dgc")?.esOfficial, false);
});

test("part ids are unique inside each catalog", () => {
  for (const key of [
    "glb:/models/dji/mavic-3-enterprise.glb",
    "glb:/models/dji/matrice-350-rtk.glb",
    "glb:/models/dji/matrice-4.glb",
    "glb:/models/dji/matrice-30.glb",
    "kind:compact",
    "kind:sprayer",
    "kind:fixed-wing",
  ]) {
    const ids = catalogForModelKey(key).parts.map((part) => part.id);
    assert.equal(new Set(ids).size, ids.length, key);
  }
});

test("the nearest anchor wins and nothing is returned beyond the reach", () => {
  const catalog = catalogForModelKey("glb:/models/dji/mavic-3-enterprise.glb");
  const near = nearestPart(catalog, [-0.9, -0.1, -0.7], 0.5);
  assert.equal(near?.part.id, "propellers");
  assert.equal(near?.anchor.where, "delantera izquierda");
  assert.equal(nearestPart(catalog, [3, 3, 3], 0.5), undefined);
});

test("only DJI manuals are marked as not free, and generic aircraft cite free sources", () => {
  const dji = sourcesOf(catalogForModelKey("glb:/models/dji/matrice-4.glb"));
  assert.ok(dji.length >= 2 && dji.every((source) => !source.free));
  const generic = sourcesOf(catalogForModelKey("kind:compact"));
  assert.ok(generic.every((source) => source.free));
});

test("a mark shows the Spanish name of its part, or its free text", () => {
  const modelKey = "glb:/models/dji/matrice-30.glb";
  assert.equal(
    markPartName({ modelKey, part: "battery" }),
    "Batería de vuelo inteligente TB30",
  );
  assert.equal(
    markPartName({ modelKey, part: "Tornillo suelto" }),
    "Tornillo suelto",
  );
});
