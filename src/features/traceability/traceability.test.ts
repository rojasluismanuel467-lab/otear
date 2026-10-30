import assert from "node:assert/strict";
import test from "node:test";
import {
  evidenceState,
  newEvidence,
  withFields,
  withSignature,
} from "./integrity.ts";
import { autofill, missingFields, templates } from "./templates.ts";
import type { Flight, Site } from "../demo/types";

const NOW = "2026-10-26T10:00:00.000Z";

function sample() {
  return newEvidence(
    {
      siteId: "s",
      flightId: "f",
      kind: "drafted",
      templateId: "briefing",
      title: templates.briefing.title,
      fields: {
        attendees: "A · piloto",
        time: "07:00",
        comms: "Radio",
        contingency: "RTH",
        contacts: "123",
      },
    },
    NOW,
  );
}

test("a document is signed only when every required role has signed the current content", () => {
  let evidence = sample();
  assert.equal(evidenceState(evidence).status, "draft");
  evidence = withSignature(
    evidence,
    { role: "Piloto", name: "Ana", documentId: "1", method: "typed" },
    NOW,
  );
  assert.equal(evidenceState(evidence).status, "partial");
  assert.deepEqual(evidenceState(evidence).missingRoles, [
    "Responsable de la operación",
  ]);
  evidence = withSignature(
    evidence,
    {
      role: "Responsable de la operación",
      name: "Beto",
      documentId: "2",
      method: "typed",
    },
    NOW,
  );
  assert.equal(evidenceState(evidence).status, "signed");
});

test("changing the content after signing invalidates the signatures and leaves a trace", () => {
  let evidence = sample();
  evidence = withSignature(
    evidence,
    { role: "Piloto", name: "Ana", documentId: "1", method: "typed" },
    NOW,
  );
  evidence = withSignature(
    evidence,
    {
      role: "Responsable de la operación",
      name: "Beto",
      documentId: "2",
      method: "typed",
    },
    NOW,
  );
  const edited = withFields(
    evidence,
    { ...evidence.fields, time: "08:30" },
    NOW,
  );
  const state = evidenceState(edited);
  assert.equal(state.status, "altered");
  assert.equal(state.staleSignatures.length, 2);
  assert.ok(edited.events.some((event) => event.text.includes("sin validez")));
  // Restoring the original text makes the old signatures valid again.
  const restored = withFields(edited, evidence.fields, NOW);
  assert.equal(evidenceState(restored).status, "signed");
});

test("signing again replaces the previous signature of the same role", () => {
  let evidence = sample();
  evidence = withSignature(
    evidence,
    { role: "Piloto", name: "Ana", documentId: "1", method: "typed" },
    NOW,
  );
  evidence = withSignature(
    evidence,
    { role: "Piloto", name: "Ana Maria", documentId: "1", method: "drawn" },
    NOW,
  );
  assert.equal(evidence.signatures.length, 1);
  assert.equal(evidence.signatures[0].name, "Ana Maria");
});

test("an attachment is complete once its file hash is stored", () => {
  const pending = newEvidence(
    { siteId: "s", flightId: "f", kind: "attachment", title: "Permiso" },
    NOW,
  );
  assert.equal(evidenceState(pending).status, "requested");
  const done = {
    ...pending,
    attachment: { name: "permiso.pdf", size: 10, hash: "abc" },
  };
  assert.equal(evidenceState(done).status, "attached");
});

test("autofill uses flight and site data and missingFields lists what is left", () => {
  const site = { name: "Hacienda Santa Rita" } as Site;
  const flight = {
    operator: "AeroVisión",
    objective: "Inspección",
    date: "2026-10-29",
    route: [[3.76, -76.33]],
    pilot: "Camilo",
    manager: "Luis",
    time: "07:00",
  } as unknown as Flight;
  const fields = autofill("landowner-authorization", { site, flight });
  assert.equal(fields.propertyName, "Hacienda Santa Rita");
  assert.ok(fields.takeoffPoint.includes("3.76000"));
  const missing = missingFields("landowner-authorization", fields);
  assert.ok(missing.includes("Nombre del propietario o administrador"));
  assert.ok(!missing.includes("Predio"));
});

import { documentHtml, documentText, escapeHtml } from "./document-export.ts";

test("exports escape HTML and flag signatures that lost their validity", () => {
  let evidence = sample();
  evidence = withSignature(
    evidence,
    { role: "Piloto", name: "<b>Ana</b>", documentId: "1", method: "typed" },
    NOW,
  );
  const html = documentHtml(evidence);
  assert.ok(!html.includes("<b>Ana</b>"));
  assert.ok(html.includes("&lt;b&gt;Ana&lt;/b&gt;"));
  assert.equal(escapeHtml('"&<>'), "&quot;&amp;&lt;&gt;");
  const edited = withFields(
    evidence,
    { ...evidence.fields, time: "09:00" },
    NOW,
  );
  assert.ok(documentText(edited).includes("SIN VALIDEZ"));
});

test("the history says which field changed and from what to what", () => {
  const evidence = sample();
  const key = Object.keys(evidence.fields)[0];
  const edited = withFields(
    evidence,
    { ...evidence.fields, [key]: "valor nuevo" },
    NOW,
  );
  const event = edited.events[edited.events.length - 1];
  assert.ok(event.text.includes("→"), event.text);
  assert.ok(event.text.includes("«valor nuevo»"), event.text);
});
