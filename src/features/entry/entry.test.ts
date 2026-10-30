import assert from "node:assert/strict";
import { test } from "node:test";
import {
  demoStart,
  entryLabel,
  launchEntry,
  MAX_OTHER,
  parseEntry,
  sectorChoices,
  sectorToRestore,
  serializeEntry,
  type Entry,
} from "./entry.ts";

test("an entry survives being stored and read back", () => {
  const entry: Entry = { choice: "other", other: "Minería", launch: true };
  assert.deepEqual(parseEntry(serializeEntry(entry)), entry);
});

test("values we did not write are ignored", () => {
  assert.equal(parseEntry(null), null);
  assert.equal(parseEntry("no es json"), null);
  assert.equal(parseEntry('{"choice":"hackeado"}'), null);
  assert.equal(parseEntry("[1]"), null);
});

test("free text is trimmed and capped", () => {
  const long = "x".repeat(200);
  const entry = parseEntry(
    JSON.stringify({ choice: "other", other: ` ${long} ` }),
  );
  assert.equal(entry?.other?.length, MAX_OTHER);
  assert.equal(
    parseEntry('{"choice":"roads","other":"   "}')?.other,
    undefined,
  );
});

test("the form's sector field uses the chip label or the typed text", () => {
  assert.equal(entryLabel(null), "");
  assert.equal(entryLabel({ choice: "roads" }), "Vía o carretera");
  assert.equal(entryLabel({ choice: "other", other: "Puertos" }), "Puertos");
  assert.equal(entryLabel({ choice: "other" }), "");
});

test("each sector opens on the screen that answers its main question", () => {
  const routes = Object.fromEntries(
    sectorChoices.map((item) => [
      item.id,
      demoStart({ choice: item.id }).route,
    ]),
  );
  assert.deepEqual(routes, {
    agriculture: "/evolucion",
    roads: "/vuelos",
    construction: "/evolucion",
    security: "/vuelos",
    mining: "/evolucion",
    other: "/evolucion",
  });
  for (const route of Object.values(routes)) {
    assert.notEqual(route, "/programacion");
  }
});

test("the welcome names the screens with the sector's own words", () => {
  const roads = demoStart({ choice: "roads" });
  assert.equal(roads.sector, "roads");
  assert.equal(roads.preset, "carreteras");
  assert.match(roads.notice, /^Bienvenido/);
  assert.match(roads.notice, /«Avance por tramos»/);
  assert.match(roads.notice, /Guía de la demo/);
  const mining = demoStart({ choice: "mining" });
  assert.match(mining.notice, /«Avance de la excavación»/);
});

test("opening the demo from a button chooses nothing and says it is an example", () => {
  const start = demoStart(launchEntry(null));
  assert.equal(start.route, "/evolucion");
  assert.equal(start.preset, null);
  assert.equal(start.sector, null);
  assert.match(start.notice, /^Bienvenido a la demo/);
  assert.match(start.notice, /datos de ejemplo/);
  assert.equal(entryLabel(launchEntry(null)), "");
});

test("a button keeps the sector the visitor already picked", () => {
  const picked: Entry = { choice: "construction" };
  assert.deepEqual(launchEntry(picked), {
    choice: "construction",
    launch: true,
  });
  const asOperator = launchEntry(picked, "operator");
  assert.equal(asOperator.viewAs, "operator");
  assert.equal(demoStart(asOperator).route, "/servicios");
  assert.equal(launchEntry(asOperator).viewAs, undefined);
});

test("after a reload only an opened sector is restored", () => {
  assert.equal(sectorToRestore(null), null);
  assert.equal(sectorToRestore({ choice: "roads" }), null);
  assert.equal(sectorToRestore({ choice: "roads", opened: true }), "roads");
  assert.equal(
    sectorToRestore({ choice: "roads", opened: true, launch: true }),
    null,
  );
  assert.equal(sectorToRestore({ choice: "other", opened: true }), null);
  assert.equal(
    sectorToRestore({ choice: "agriculture", opened: true, unchosen: true }),
    null,
  );
});

test("the new fields survive being stored and anything else is dropped", () => {
  const entry: Entry = { choice: "mining", opened: true, viewAs: "operator" };
  assert.deepEqual(parseEntry(serializeEntry(entry)), entry);
  assert.equal(
    parseEntry('{"choice":"mining","viewAs":"admin"}')?.viewAs,
    undefined,
  );
});
