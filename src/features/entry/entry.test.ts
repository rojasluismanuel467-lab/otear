import assert from "node:assert/strict";
import { test } from "node:test";
import {
  entryLabel,
  MAX_OTHER,
  parseEntry,
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
