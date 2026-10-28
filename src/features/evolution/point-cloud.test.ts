import assert from "node:assert/strict";
import test from "node:test";
import {
  deliverableFor,
  heightColors,
  readLas,
  readXyz,
} from "./point-cloud.ts";

function makeLas(
  points: [number, number, number, number?, number?, number?][],
  format = 2,
): ArrayBuffer {
  const length = format === 2 ? 26 : 20;
  const offset = 227;
  const buffer = new ArrayBuffer(offset + points.length * length);
  const view = new DataView(buffer);
  "LASF".split("").forEach((char, i) => view.setUint8(i, char.charCodeAt(0)));
  view.setUint8(24, 1);
  view.setUint8(25, 2);
  view.setUint32(96, offset, true);
  view.setUint8(104, format);
  view.setUint16(105, length, true);
  view.setUint32(107, points.length, true);
  [0.01, 0.01, 0.01].forEach((s, i) => view.setFloat64(131 + i * 8, s, true));
  [500000, 4000000, 100].forEach((o, i) =>
    view.setFloat64(155 + i * 8, o, true),
  );
  points.forEach(([x, y, z, r = 0, g = 0, b = 0], n) => {
    const at = offset + n * length;
    view.setInt32(at, Math.round((x - 500000) / 0.01), true);
    view.setInt32(at + 4, Math.round((y - 4000000) / 0.01), true);
    view.setInt32(at + 8, Math.round((z - 100) / 0.01), true);
    if (format === 2) {
      view.setUint16(at + 20, r, true);
      view.setUint16(at + 22, g, true);
      view.setUint16(at + 24, b, true);
    }
  });
  return buffer;
}

test("a LAS is read with its scale and offset and recentred on its own extent", () => {
  const pts: [number, number, number][] = Array.from(
    { length: 200 },
    (_, i) => [500000 + (i % 20), 4000000 + Math.floor(i / 20), 100 + (i % 7)],
  );
  const result = readLas(makeLas(pts, 0));
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.equal(result.value.total, 200);
  assert.equal(result.value.positions.length, 600);
  assert.ok(Math.abs(result.value.extent[0] - 19) < 1.5);
  assert.ok(Math.abs(result.value.positions[2]) < 7.1);
  assert.equal(result.value.colors, undefined);
});

test("LAS colour is normalised whether it is 8 or 16 bit", () => {
  const eight = readLas(
    makeLas([
      [500000, 4000000, 100, 255, 0, 128],
      [500001, 4000001, 101, 0, 255, 0],
      [500002, 4000002, 102, 10, 10, 10],
    ]),
  );
  assert.ok(eight.ok && eight.value.colors);
  if (eight.ok && eight.value.colors)
    assert.ok(Math.abs(eight.value.colors[0] - 1) < 1e-6);
  const sixteen = readLas(
    makeLas([
      [500000, 4000000, 100, 65535, 0, 0],
      [500001, 4000001, 101, 0, 0, 0],
      [500002, 4000002, 102, 0, 0, 0],
    ]),
  );
  assert.ok(sixteen.ok && sixteen.value.colors);
  if (sixteen.ok && sixteen.value.colors)
    assert.ok(Math.abs(sixteen.value.colors[0] - 1) < 1e-6);
});

test("a big LAS is thinned to the limit and a LAZ is refused with advice", () => {
  const pts: [number, number, number][] = Array.from(
    { length: 1000 },
    (_, i) => [500000 + i, 4000000, 100],
  );
  const result = readLas(makeLas(pts, 0), 100);
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value.total, 1000);
    assert.ok(result.value.positions.length / 3 <= 100);
  }
  const laz = makeLas(pts.slice(0, 5), 0);
  new DataView(laz).setUint8(104, 0x80 | 0);
  const refused = readLas(laz);
  assert.equal(refused.ok, false);
  if (!refused.ok) assert.ok(refused.error.includes("LAZ"));
  assert.equal(readLas(new ArrayBuffer(10)).ok, false);
});

test("XYZ text accepts separators, headers and colour", () => {
  const text =
    "X,Y,Z,R,G,B\n10,20,30,255,0,0\n11 21 31 0 255 0\n12;22;32;0;0;255\nbad line\n";
  const result = readXyz(text);
  assert.ok(result.ok);
  if (result.ok) {
    assert.equal(result.value.total, 3);
    assert.ok(result.value.colors);
    assert.equal(result.value.colors?.[0], 1);
  }
  assert.equal(readXyz("hola\nmundo").ok, false);
});

test("height colours run from dark at the base to light at the top", () => {
  const colors = heightColors(new Float32Array([0, 0, 0, 0, 0, 10]), 2);
  assert.ok(colors[5] > colors[2]);
});

test("every delivery format is recognised and says whether it can be shown", () => {
  assert.equal(deliverableFor("sitio.LAS")?.supported, true);
  assert.equal(deliverableFor("modelo.glb")?.supported, true);
  assert.equal(deliverableFor("nube.laz")?.supported, false);
  assert.equal(deliverableFor("ortho.tif")?.supported, false);
  assert.equal(deliverableFor("torre.ifc")?.supported, false);
  assert.equal(deliverableFor("raro.abc"), undefined);
});
