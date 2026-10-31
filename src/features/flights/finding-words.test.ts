import assert from "node:assert/strict";
import test from "node:test";
import {
  agree,
  countOf,
  findingWords,
  isFeminine,
  zoneGrammar,
} from "./finding-words.ts";

test("plural articles follow the term, never the sentence", () => {
  const notice = findingWords("Novedad de campo", "Novedades de campo");
  assert.equal(
    `${notice.thePlural} ${notice.plural}`,
    "las novedades de campo",
  );
  assert.equal(notice.allPlural, "todas");
  assert.equal(notice.ofThe, "de la");
  const finding = findingWords("Hallazgo", "Hallazgos");
  assert.equal(`${finding.thePlural} ${finding.plural}`, "los hallazgos");
  assert.equal(`${finding.this} ${finding.singular}`, "este hallazgo");
});

test("the word a site uses for its zones brings its own gender", () => {
  assert.equal(zoneGrammar("Suertes").thePlural, "las");
  assert.equal(zoneGrammar("Suertes").singular, "suerte");
  assert.equal(zoneGrammar("Lotes").ofThe, "del");
  assert.equal(zoneGrammar("Sectores").singular, "sector");
  assert.equal(zoneGrammar("Niveles").singular, "nivel");
  assert.equal(zoneGrammar("Zonas").a, "una");
});

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

test("gender is decided by the word for every term of the sector presets", () => {
  const terms: [string, boolean][] = [
    ["Hallazgo de campo", false],
    ["Novedad de campo", true],
    ["No conformidad", true],
    ["Observación", true],
    ["Novedad", true],
    ["Novedad de talud", true],
    ["Desviación", true],
    ["Incidencia", true],
    ["Defecto", false],
    ["Incidente", false],
    ["Alerta", true],
    ["Reporte de obra", false],
    ["Foto por revisar", true],
    ["Imagen", true],
    ["Síntoma", false],
    ["Avión", false],
    ["Hallazgos", false],
  ];
  for (const [term, feminine] of terms) {
    assert.equal(isFeminine(term), feminine, term);
  }
});

test("the article agrees with the term, as the sentences of Evolución use it", () => {
  const observation = findingWords("Observación", "Observaciones");
  assert.equal(`${observation.a} ${observation.singular}`, "una observación");
  assert.equal(agree(observation, "nuevos", "nuevas"), "nuevas");
  const finding = findingWords("Hallazgo de campo", "Hallazgos de campo");
  assert.equal(`${finding.a} ${finding.singular}`, "un hallazgo de campo");
});
