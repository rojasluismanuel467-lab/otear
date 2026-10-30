import assert from "node:assert/strict";
import test from "node:test";
import {
  droneCategories,
  droneOptionFor,
  droneOptions,
  optionsByCategory,
} from "./drone-catalog.ts";

test("the name a card writes in the flight form leads back to the same card", () => {
  for (const option of droneOptions) {
    assert.equal(droneOptionFor(option.equipmentName).id, option.id, option.id);
  }
});

test("the real names listed under a family resolve to that family", () => {
  for (const option of droneOptions.filter(
    (item) => item.group === "generic",
  )) {
    for (const example of option.examples) {
      assert.equal(droneOptionFor(example).id, option.id, example);
    }
  }
});

test("every option belongs to a category and ids are unique", () => {
  const ids = droneOptions.map((option) => option.id);
  assert.equal(new Set(ids).size, ids.length);
  const categories = new Set(droneCategories.map((category) => category.id));
  assert.ok(droneOptions.every((option) => categories.has(option.category)));
});

test("each sector has aircraft to choose from and the filter keeps only its own", () => {
  for (const sector of [
    "agriculture",
    "roads",
    "construction",
    "security",
    "mining",
  ] as const) {
    const groups = optionsByCategory(sector);
    assert.ok(groups.length > 0, sector);
    for (const group of groups)
      for (const option of group.options)
        assert.ok(option.sectorIds.includes(sector), option.id);
  }
  const all = optionsByCategory().flatMap((group) => group.options);
  assert.equal(all.length, droneOptions.length);
});

test("unknown equipment falls back to the compact family", () => {
  assert.equal(droneOptionFor("Equipo sin nombre conocido").id, "compact");
});
