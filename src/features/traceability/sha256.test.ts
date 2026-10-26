import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { sha256Hex } from "./sha256.ts";

test("sha256Hex matches known vectors", () => {
  assert.equal(
    sha256Hex(""),
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
  assert.equal(
    sha256Hex("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("sha256Hex agrees with node:crypto on longer and non-ASCII input", () => {
  for (const text of [
    "a".repeat(55),
    "a".repeat(56),
    "a".repeat(64),
    "Autorización del propietario · Guacarí ñandú ✓".repeat(30),
  ]) {
    assert.equal(
      sha256Hex(text),
      createHash("sha256").update(text).digest("hex"),
    );
  }
});
