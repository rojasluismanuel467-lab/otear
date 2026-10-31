import assert from "node:assert/strict";
import test from "node:test";
import {
  illustrationLabel,
  illustrationView,
  MINE_ILLUSTRATION_URL,
  PERIMETER_ILLUSTRATION_URL,
  ROAD_ILLUSTRATION_URL,
  WORKSITE_ILLUSTRATION_URL,
} from "./illustration.ts";

test("every own illustration carries a label, also when framed on a part of it", () => {
  for (const url of [
    ROAD_ILLUSTRATION_URL,
    WORKSITE_ILLUSTRATION_URL,
    MINE_ILLUSTRATION_URL,
    PERIMETER_ILLUSTRATION_URL,
  ]) {
    assert.match(illustrationLabel(url) ?? "", /^Ilustración, no es una foto/);
    assert.equal(
      illustrationLabel(illustrationView(url, 2)),
      illustrationLabel(url),
    );
  }
});

test("photos have no label and are never reframed", () => {
  assert.equal(illustrationLabel("/images/aerial-field.jpg"), null);
  assert.equal(
    illustrationView("/images/aerial-field.jpg", 3),
    "/images/aerial-field.jpg",
  );
});

test("the views of a sector differ from each other", () => {
  const seen = new Set(
    [0, 1, 2, 3, 4].map((i) => illustrationView(MINE_ILLUSTRATION_URL, i)),
  );
  assert.equal(seen.size, 5);
});
