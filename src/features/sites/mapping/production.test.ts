import assert from "node:assert/strict";
import test from "node:test";
import { parseProduction } from "./production.ts";

test("parseProduction reads semicolon rows with decimal commas", () => {
  const result = parseProduction("Lote 1; Caña; 38,5\nLote 2; Aguacate; 26");
  assert.ok("rows" in result);
  if ("rows" in result) {
    assert.deepEqual(result.rows[0], {
      name: "Lote 1",
      use: "Caña",
      quantity: 38.5,
    });
    assert.equal(result.rows[1].quantity, 26);
  }
});

test("parseProduction skips a header and accepts two columns", () => {
  const result = parseProduction("nombre,hectareas\nNorte,12.5\nSur,7.5");
  assert.ok("rows" in result);
  if ("rows" in result) {
    assert.equal(result.rows.length, 2);
    assert.equal(result.rows[0].use, "");
    assert.equal(result.rows[0].quantity, 12.5);
  }
});

test("parseProduction explains what is wrong", () => {
  assert.ok("error" in parseProduction(""));
  assert.ok("error" in parseProduction("Lote 1; Caña; mucho\nLote 2; Caña; 3"));
  assert.ok("error" in parseProduction("Lote 1; Caña; 0\nLote 2; Caña; 3"));
  assert.ok("error" in parseProduction("Lote 1; Caña; 5"));
});
