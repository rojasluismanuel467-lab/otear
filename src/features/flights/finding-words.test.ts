import assert from "node:assert/strict";
import test from "node:test";
import { agree, countOf, findingWords, isFeminine } from "./finding-words.ts";

test("gender follows the noun that heads the term", () => {
  assert.equal(isFeminine("Hallazgo"), false);
  assert.equal(isFeminine("Hallazgo de campo"), false);
  assert.equal(isFeminine("Observación"), true);
  assert.equal(isFeminine("No conformidad"), true);
  assert.equal(isFeminine("Novedad de talud"), true);
  assert.equal(isFeminine("Punto por revisar"), false);
  assert.equal(isFeminine("Anomalía"), true);
  assert.equal(isFeminine("Problema"), false);
});

test("words agree with the company's term", () => {
  const masculine = findingWords("Hallazgo", "Hallazgos");
  const feminine = findingWords("No conformidad", "No conformidades");
  assert.equal(agree(masculine, "confirmado", "confirmada"), "confirmado");
  assert.equal(agree(feminine, "confirmado", "confirmada"), "confirmada");
  assert.equal(feminine.the, "la");
  assert.equal(feminine.Plural, "No conformidades");
  assert.equal(countOf(masculine, 1), "1 hallazgo");
  assert.equal(countOf(feminine, 3), "3 no conformidades");
});
