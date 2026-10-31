import assert from "node:assert/strict";
import test from "node:test";
import { FOLLOW_UP_TODAY } from "../flights/follow-up.ts";
import { DEMO_DAY_TEXT, dayWords, demoNow } from "./demo-clock.ts";
import { withSignature, newEvidence } from "./integrity.ts";

test("a day is written in words and other text is left alone", () => {
  assert.match(dayWords("2026-10-24"), /^24 de oct\.? de 2026$/);
  assert.equal(dayWords("hoy"), "hoy");
  assert.equal(dayWords(""), "");
  assert.match(DEMO_DAY_TEXT, /^25 de oct\.? de 2026$/);
});

test("a record made in the demo is dated on the demo's day, with the device's time", () => {
  // The visitor's computer says 31 October 2026, 8:51:30 (their local time).
  const at = new Date(demoNow(new Date(2026, 9, 31, 8, 51, 30, 120)));
  assert.equal(at.getFullYear(), 2026);
  assert.equal(at.getMonth(), 9);
  assert.equal(at.getDate(), 25);
  assert.equal(at.getHours(), 8);
  assert.equal(at.getMinutes(), 51);
  assert.equal(at.getSeconds(), 30);
  // Whatever the real day is, the demo's day is the same single «today».
  const later = new Date(demoNow(new Date(2027, 0, 3, 23, 59, 59)));
  assert.equal(later.getDate(), 25);
  assert.equal(later.getMonth(), 9);
  const [year, month, day] = FOLLOW_UP_TODAY.split("-").map(Number);
  assert.deepEqual(
    [later.getFullYear(), later.getMonth() + 1, later.getDate()],
    [year, month, day],
  );
});

test("a signature made with the demo clock carries the demo's day", () => {
  const now = demoNow(new Date(2026, 9, 31, 9, 0, 0));
  const evidence = withSignature(
    newEvidence(
      {
        siteId: "s",
        flightId: "f",
        kind: "drafted",
        templateId: "briefing",
        title: "Acta de briefing previo al vuelo",
      },
      now,
    ),
    {
      role: "Piloto",
      name: "Camilo Torres",
      documentId: "16834201",
      method: "typed",
    },
    now,
  );
  assert.equal(new Date(evidence.signatures[0].signedAt).getDate(), 25);
  assert.ok(
    evidence.events.every((event) => new Date(event.at).getDate() === 25),
  );
});
