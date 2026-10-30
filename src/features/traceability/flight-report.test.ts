import assert from "node:assert/strict";
import test from "node:test";
import type { Flight, Site } from "../demo/types";
import { documentText } from "./document-export.ts";
import {
  flightReportChanges,
  flightReportFields,
  type FlightReportInput,
} from "./flight-report-document.ts";
import {
  displayTitle,
  evidenceState,
  newEvidence,
  roleLabelOf,
  signingConflict,
  withFields,
  withSignature,
} from "./integrity.ts";
import {
  autofill,
  missingFields,
  suggestedSigner,
  templateFor,
  templates,
} from "./templates.ts";

const NOW = "2026-10-30T10:00:00.000Z";

const site = {
  id: "s",
  name: "Troncal de Occidente",
  sector: "roads",
  sectorLabel: "Carreteras",
  zoneLabel: "Tramos",
  zones: [{ id: "z1", name: "Tramo sur" }],
} as unknown as Site;

const flight = {
  id: "f",
  title: "Seguimiento de pavimento",
  date: "2026-10-24",
  time: "07:00",
  status: "completed",
  objective: "Ver el estado de la calzada",
  zoneIds: ["z1"],
  pilot: "Camilo Torres",
  manager: "Luis Rojas",
  operator: "AeroVisión",
  route: [[3.8, -76.3]],
} as unknown as Flight;

const input: FlightReportInput = {
  brief: ["Tramo sur: 3 por verificar en campo."],
  logRows: [
    ["Piloto", "Camilo Torres"],
    ["Duración", "42 min"],
  ],
  debrief: "Viento fuerte al final.",
  findingsTitle: "No conformidades incluidas",
  findings: ["Drenaje obstruido\n   Tramo sur · prioridad alta"],
  notes: "Revisar la alcantarilla.",
  technical: ["Sensor: Cámara RGB"],
};

function report() {
  return newEvidence(
    {
      siteId: site.id,
      flightId: flight.id,
      kind: "drafted",
      templateId: "flight-report",
      title: templates["flight-report"].title,
      fields: {
        ...autofill("flight-report", { site, flight }),
        ...flightReportFields(input),
      },
    },
    NOW,
  );
}

const operator = {
  role: "Operador",
  name: "Camilo Torres",
  documentId: "16.834.201",
  method: "typed" as const,
};
const reviewer = {
  role: "Revisor o interventor",
  name: "Marcela Pineda",
  documentId: "31.222.333",
  method: "typed" as const,
};

test("the flight report carries the brief and the log, and says the signature has no legal value", () => {
  const text = documentText(report());
  assert.ok(text.includes("Tramo sur: 3 por verificar en campo."));
  assert.ok(text.includes("Duración: 42 min"));
  assert.ok(text.includes("Drenaje obstruido"));
  assert.ok(text.includes("no tiene valor legal"));
  assert.ok(text.includes("no prueba quién escribió el nombre"));
});

test("the flight report needs the operator and a reviewer, in that either order", () => {
  let evidence = report();
  assert.equal(evidenceState(evidence).status, "draft");
  evidence = withSignature(evidence, reviewer, NOW);
  assert.equal(evidenceState(evidence).status, "partial");
  assert.deepEqual(evidenceState(evidence).missingRoles, ["Operador"]);
  evidence = withSignature(evidence, operator, NOW);
  assert.equal(evidenceState(evidence).status, "signed");
});

test("a change to the signed report voids both signatures and the history names the part", () => {
  let evidence = report();
  evidence = withSignature(evidence, operator, NOW);
  evidence = withSignature(evidence, reviewer, NOW);
  const edited = withFields(
    evidence,
    {
      ...evidence.fields,
      ...flightReportFields({ ...input, notes: "Otra nota" }),
    },
    NOW,
  );
  const state = evidenceState(edited);
  assert.equal(state.status, "altered");
  assert.equal(state.staleSignatures.length, 2);
  const change = edited.events.find((event) =>
    event.text.includes("Notas de revisión"),
  );
  assert.ok(change?.text.includes("«Revisar la alcantarilla.» → «Otra nota»"));
});

test("the screen can tell which parts of a saved report fell behind the flight", () => {
  const saved = report();
  assert.deepEqual(flightReportChanges(saved, flightReportFields(input)), []);
  assert.deepEqual(
    flightReportChanges(
      saved,
      flightReportFields({
        ...input,
        brief: ["Sin diferencias que destacar."],
      }),
    ),
    ["En breve"],
  );
  assert.deepEqual(
    flightReportChanges(undefined, flightReportFields(input)),
    [],
  );
});

test("the operator cannot also review their own report, and nobody signs two roles", () => {
  let evidence = report();
  evidence = withSignature(evidence, operator, NOW);
  // Same document number, different spelling of the name.
  assert.match(
    signingConflict(evidence, "Revisor o interventor", {
      name: "C. Torres",
      documentId: "16834201",
    }) ?? "",
    /ya firmó como Operador/,
  );
  // No document number: the name is compared without accents or case.
  assert.ok(
    signingConflict(evidence, "Revisor o interventor", {
      name: "  camilo  TORRES ",
      documentId: "",
    }),
  );
  // A different person can review.
  assert.equal(
    signingConflict(evidence, "Revisor o interventor", reviewer),
    null,
  );
  // Signing again in the same role is not a conflict.
  assert.equal(signingConflict(evidence, "Operador", operator), null);
});

test("roles of a document that does not ask for different people are not restricted", () => {
  const briefing = newEvidence(
    {
      siteId: "s",
      flightId: "f",
      kind: "drafted",
      templateId: "briefing",
      title: templates.briefing.title,
      fields: {},
    },
    NOW,
  );
  const signed = withSignature(
    briefing,
    { role: "Piloto", name: "Ana Gómez", documentId: "1234", method: "typed" },
    NOW,
  );
  assert.equal(
    signingConflict(signed, "Responsable de la operación", {
      name: "Ana Gómez",
      documentId: "1234",
    }),
    null,
  );
  // The delivery record does ask for it.
  assert.equal(templates["delivery-acceptance"].separateRoles, true);
});

test("the signing form suggests the pilot as operator and leaves the reviewer empty", () => {
  assert.deepEqual(suggestedSigner("Operador", {}, flight), {
    name: "Camilo Torres",
    documentId: "",
  });
  assert.deepEqual(suggestedSigner("Revisor o interventor", {}, flight), {
    name: "",
    documentId: "",
  });
  assert.deepEqual(
    suggestedSigner(
      "Propietario o administrador",
      { ownerName: "Gustavo", ownerId: "16.702.115" },
      flight,
    ),
    { name: "Gustavo", documentId: "16.702.115" },
  );
  assert.equal(
    suggestedSigner("Cliente o responsable", {}, flight).name,
    "Luis Rojas",
  );
});

const authorizationFields = (sector: string) => ({
  sector,
  ownerName: "Gustavo Restrepo",
  ownerId: "16.702.115",
  ownerRole: "Representante",
  propertyName: "Zona de prueba",
  operatorName: "AeroVisión",
  purpose: "Seguimiento",
  flightDate: "2026-10-24",
  takeoffPoint: "Punto A",
  maxAltitude: "120",
  thirdParties: "No",
  validUntil: "2026-10-24",
});

test("the authorization speaks of each sector's own place, not always of a «predio»", () => {
  const expected = {
    agriculture: ["predio", "Propietario o administrador"],
    roads: ["vía", "Titular o administrador de la vía"],
    construction: ["obra", "Titular o administrador de la obra"],
    security: ["parque", "Propietario o administrador del parque"],
    mining: ["mina", "Titular o administrador de la mina"],
  } as const;
  for (const [sector, [place, role]] of Object.entries(expected)) {
    const template = templateFor(
      "landowner-authorization",
      sector as Site["sector"],
    );
    const body = template.render(authorizationFields(sector));
    assert.ok(template.title.includes(place), template.title);
    assert.ok(body.includes(`${place}`), sector);
    assert.equal(template.roleLabels?.["Propietario o administrador"], role);
    if (sector !== "agriculture") {
      assert.ok(!/predio/i.test(template.title), template.title);
      assert.ok(!template.note.includes("predio"), template.note);
      assert.ok(!/del predio|el predio/.test(body), `${sector}: ${body}`);
    }
    // The note is written to the person and does not claim an unverified rule.
    assert.ok(!template.note.includes("no encontré"));
    assert.ok(template.note.includes("usted"));
  }
});

test("the stored role keeps counting while it reads in the sector's words", () => {
  let evidence = newEvidence(
    {
      siteId: "s",
      flightId: "f",
      kind: "drafted",
      templateId: "landowner-authorization",
      title: templates["landowner-authorization"].title,
      fields: authorizationFields("roads"),
    },
    NOW,
  );
  assert.equal(
    displayTitle(evidence),
    "Autorización del titular o administrador de la vía",
  );
  evidence = withSignature(
    evidence,
    {
      role: "Propietario o administrador",
      name: "Gustavo",
      documentId: "1",
      method: "typed",
    },
    NOW,
  );
  evidence = withSignature(
    evidence,
    { role: "Operador", name: "Camilo", documentId: "2", method: "typed" },
    NOW,
  );
  const state = evidenceState(evidence);
  assert.equal(state.status, "signed");
  assert.deepEqual(state.validRoleLabels, [
    "Titular o administrador de la vía",
    "Operador",
  ]);
  assert.equal(
    roleLabelOf(evidence, "Propietario o administrador"),
    "Titular o administrador de la vía",
  );
  assert.ok(
    documentText(evidence).includes(
      "Titular o administrador de la vía: Gustavo",
    ),
  );
});

test("a document from before the sector was stored still reads as a farm document", () => {
  const { sector: _sector, ...legacy } = authorizationFields("roads");
  void _sector;
  const evidence = newEvidence(
    {
      siteId: "s",
      flightId: "f",
      kind: "drafted",
      templateId: "landowner-authorization",
      title: templates["landowner-authorization"].title,
      fields: legacy,
    },
    NOW,
  );
  assert.ok(displayTitle(evidence).includes("predio"));
  assert.ok(missingFields("landowner-authorization", {}).includes("Predio"));
  assert.ok(
    missingFields("landowner-authorization", { sector: "roads" }).includes(
      "Vía o tramo",
    ),
  );
});
