import assert from "node:assert/strict";
import test from "node:test";
import { presets } from "../config/presets.ts";
import type { Evidence, Flight, Site } from "../demo/types";
import { findingWords } from "../flights/finding-words.ts";
import { buildItinerary } from "../flights/itinerary.ts";
import { signedRecordRows } from "../compliance/signed-rows.ts";
import { DEMO_PROFILE_LABEL } from "./demo-profile.ts";
import { checkDownload, documentText } from "./document-export.ts";
import {
  flightReportFields,
  reportPhrases,
  type FlightReportInput,
} from "./flight-report-document.ts";
import {
  eventAuthor,
  evidenceState,
  newEvidence,
  signingConflict,
  withFields,
  withSignature,
} from "./integrity.ts";
import {
  checkDocumentId,
  nitCheckDigit,
  sameName,
  signerProblem,
} from "./signers.ts";
import { autofill, templates } from "./templates.ts";

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
  siteId: "s",
  title: "Seguimiento de pavimento",
  date: "2026-10-24",
  time: "07:00",
  status: "completed",
  objective: "Ver el estado de la calzada",
  zoneIds: ["z1"],
  pilot: "Camilo Torres",
  manager: "Luis Rojas",
  operator: "AeroVisión",
  route: [
    [3.8, -76.3],
    [3.9, -76.2],
  ],
  checklist: [],
} as unknown as Flight;

const input: FlightReportInput = {
  brief: ["Tramo sur: 3 por verificar en campo."],
  logRows: [["Piloto", "Camilo Torres"]],
  findingsTitle: "No conformidades incluidas",
  findings: ["Drenaje obstruido"],
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
  documentId: "1111222333",
  method: "typed" as const,
};
const reviewer = {
  role: "Revisor o interventor",
  name: "Marcela Pineda",
  documentId: "31.222.333",
  method: "typed" as const,
};

test("names are compared without case, accents, double spaces or order", () => {
  assert.ok(sameName("Camilo Torres", "CAMILO TORRES"));
  assert.ok(sameName("Camilo   Torres", "camilo torres"));
  assert.ok(sameName("Torres Camilo", "Camilo Torres"));
  assert.ok(sameName("Camilo Andrés Torres Pérez", "camilo andres torres"));
  assert.ok(sameName("Torres, Camilo", "Camilo Torres"));
  assert.ok(sameName("C. Torres", "Camilo Torres"));
  assert.ok(sameName("José de la Torre", "Jose Torre"));
  assert.ok(!sameName("Carlos Torres", "Camilo Torres"));
  assert.ok(!sameName("Camilo", "Camilo Torres"));
  assert.ok(sameName("Camilo", "camilo"));
  assert.ok(!sameName("", ""));
});

test("a cédula or NIT is checked for characters, length and verification digit", () => {
  const ok = checkDocumentId("16.834.201");
  assert.ok(ok.ok && ok.kind === "cedula" && ok.key === "16834201");
  assert.deepEqual(checkDocumentId(" 16 834 201 "), ok);
  // The persona's loophole: four digits are not a cédula.
  const short = checkDocumentId("9999");
  assert.ok(!short.ok && /entre 6 y 10 dígitos/.test(short.message));
  const letters = checkDocumentId("CC 1234567");
  assert.ok(!letters.ok && /solo números/.test(letters.message));
  assert.ok(!checkDocumentId("").ok);
  assert.ok(!checkDocumentId("12345678901").ok);
  assert.ok(!checkDocumentId("1111111111").ok);
  assert.ok(!checkDocumentId("123456789").ok);
  assert.ok(!checkDocumentId("987654321").ok);
  // 1111222333 is not an obvious sequence.
  assert.ok(checkDocumentId("1111222333").ok);
  // The DIAN's own NIT: 800.197.268-4.
  assert.equal(nitCheckDigit("800197268"), 4);
  const nit = checkDocumentId("800.197.268-4");
  assert.ok(nit.ok && nit.kind === "nit" && nit.key === "800197268");
  const wrong = checkDocumentId("800197268-5");
  assert.ok(!wrong.ok && /debería ser 4/.test(wrong.message));
  assert.ok(!checkDocumentId("1234-5-6").ok);
});

test("the form asks for a valid name and number before anyone signs", () => {
  assert.equal(
    signerProblem({ name: "Camilo Torres", documentId: "1111222333" }),
    null,
  );
  assert.match(
    signerProblem({ name: "Camilo Torres", documentId: "9999" }) ?? "",
    /6 y 10 dígitos/,
  );
  assert.match(
    signerProblem({ name: "Ab", documentId: "1111222333" }) ?? "",
    /nombre completo/,
  );
});

test("the same name with another number, or the same number with another name, cannot sign two roles", () => {
  const evidence = withSignature(report(), operator, NOW);
  const sameNameOtherId = signingConflict(evidence, "Revisor o interventor", {
    name: "CAMILO TORRES",
    documentId: "9999",
  });
  assert.match(sameNameOtherId ?? "", /coincide con el de Camilo Torres/);
  assert.match(sameNameOtherId ?? "", /no hay verificación de identidad real/);
  const reordered = signingConflict(evidence, "Revisor o interventor", {
    name: "Torres  Camilo",
    documentId: "5.555.666",
  });
  assert.ok(reordered);
  const sameIdOtherName = signingConflict(evidence, "Revisor o interventor", {
    name: "Marcela Pineda",
    documentId: "1.111.222.333",
  });
  assert.match(sameIdOtherName ?? "", /El documento 1\.111\.222\.333 ya firmó/);
  assert.equal(
    signingConflict(evidence, "Revisor o interventor", reviewer),
    null,
  );
});

test("every edit, signature and request records who made it, and examples say none was kept", () => {
  let evidence = newEvidence(
    {
      siteId: "s",
      flightId: "f",
      kind: "drafted",
      templateId: "flight-report",
      title: templates["flight-report"].title,
      fields: flightReportFields(input),
    },
    NOW,
    DEMO_PROFILE_LABEL,
  );
  assert.equal(eventAuthor(evidence.events[0]), DEMO_PROFILE_LABEL);
  evidence = withSignature(evidence, operator, NOW, DEMO_PROFILE_LABEL);
  evidence = withSignature(evidence, reviewer, NOW, DEMO_PROFILE_LABEL);
  const edited = withFields(
    evidence,
    { ...evidence.fields, notes: "Otra nota" },
    NOW,
    DEMO_PROFILE_LABEL,
  );
  // Created, two signatures, the edit and «firmas sin validez»: all with an author.
  assert.equal(edited.events.length, 5);
  assert.ok(edited.events.every((event) => eventAuthor(event)));
  assert.equal(
    eventAuthor(edited.events[4]),
    "Luis Rojas · Administrador · ejemplo",
  );
  const text = documentText(edited);
  assert.ok(text.includes("perfil de la demostración: Luis Rojas"));
  assert.ok(text.includes("no tiene inicio de sesión"));
  // Written without an author (the seeded examples): says so instead of inventing one.
  const seeded = withSignature(report(), operator, NOW);
  assert.equal(eventAuthor(seeded.events[1]), undefined);
  assert.ok(documentText(seeded).includes("autor no registrado"));
});

test("the history keeps the field and the value, and a change voids the signatures", () => {
  let evidence = withSignature(report(), operator, NOW, DEMO_PROFILE_LABEL);
  evidence = withSignature(evidence, reviewer, NOW, DEMO_PROFILE_LABEL);
  assert.equal(evidenceState(evidence).status, "signed");
  const edited = withFields(
    evidence,
    { ...evidence.fields, notes: "Otra nota" },
    NOW,
    DEMO_PROFILE_LABEL,
  );
  assert.equal(evidenceState(edited).status, "altered");
  assert.ok(
    edited.events.some((event) =>
      event.text.includes(
        "Notas de revisión: «Revisar la alcantarilla.» → «Otra nota»",
      ),
    ),
  );
});

test("a downloaded copy is checked against the saved fingerprint", () => {
  let evidence = withSignature(report(), operator, NOW);
  evidence = withSignature(evidence, reviewer, NOW);
  const download = documentText(evidence);
  assert.equal(checkDownload(evidence, download).result, "match");
  // Windows line endings do not matter.
  assert.equal(
    checkDownload(evidence, download.replace(/\n/g, "\r\n")).result,
    "match",
  );
  // The fingerprint alone also works.
  assert.equal(
    checkDownload(evidence, evidenceState(evidence).hash).result,
    "match",
  );
  // One letter changed in the text, the fingerprint line left as it was.
  const altered = checkDownload(
    evidence,
    download.replace("Drenaje obstruido", "Drenaje obstruida"),
  );
  assert.equal(altered.result, "mismatch");
  assert.match(altered.message, /alguien lo cambió/);
  // The document changed after the download: the old file matches a version that was signed.
  const edited = withFields(
    evidence,
    { ...evidence.fields, notes: "Otra nota" },
    NOW,
  );
  const older = checkDownload(edited, download);
  assert.equal(older.result, "older");
  // Another document's text is not this one.
  assert.equal(checkDownload(evidence, "a".repeat(64)).result, "mismatch");
  assert.equal(checkDownload(evidence, "hola").result, "unreadable");
  assert.equal(checkDownload(evidence, "  ").result, "unreadable");
});

test("the heading agrees with the sector's word in every preset", () => {
  const expected: Record<string, [string, string]> = {
    agricultura: [
      "Hallazgos de campo incluidos",
      "Sin hallazgos de campo incluidos.",
    ],
    cana: ["Novedades de campo incluidas", "Sin novedades de campo incluidas."],
    carreteras: [
      "No conformidades incluidas",
      "Sin no conformidades incluidas.",
    ],
    construccion: ["Observaciones incluidas", "Sin observaciones incluidas."],
    vigilancia: ["Novedades incluidas", "Sin novedades incluidas."],
    mineria: [
      "Novedades de talud incluidas",
      "Sin novedades de talud incluidas.",
    ],
  };
  for (const preset of presets) {
    const forms = preset.terms?.finding;
    if (!forms) continue;
    const phrases = reportPhrases(findingWords(forms.singular, forms.plural));
    const [heading, none] = expected[preset.id] ?? [];
    assert.equal(phrases.heading, heading, preset.id);
    assert.equal(phrases.none, none, preset.id);
    assert.ok(!/incluidos/.test(heading ?? "") || preset.id === "agricultura");
  }
  const words = findingWords("No conformidad", "No conformidades");
  assert.equal(
    reportPhrases(words).pick,
    "Marque las no conformidades que quiere incluir.",
  );
  assert.equal(
    reportPhrases(findingWords("Hallazgo", "Hallazgos")).pick,
    "Marque los hallazgos que quiere incluir.",
  );
  // The signed heading is stored in capitals.
  assert.equal(
    flightReportFields({
      ...input,
      findingsTitle: reportPhrases(words).heading,
    }).findingsTitle,
    "NO CONFORMIDADES INCLUIDAS",
  );
});

test("signed reports and delivery records are listed with their state, and the itinerary counts both", () => {
  let signed = withSignature(report(), operator, NOW);
  signed = withSignature(signed, reviewer, NOW);
  const act = withSignature(
    newEvidence(
      {
        siteId: "s",
        flightId: "f",
        kind: "drafted",
        templateId: "delivery-acceptance",
        title: templates["delivery-acceptance"].title,
        fields: { deliverables: "x", date: "2026-10-24" },
      },
      NOW,
    ),
    operator,
    NOW,
  );
  const rows = signedRecordRows([act, signed], [flight]);
  assert.equal(rows.length, 2);
  const reportRow = rows.find((row) => row.templateId === "flight-report");
  assert.equal(reportRow?.status, "signed");
  assert.equal(reportRow?.hash.length, 16);
  const actRow = rows.find((row) => row.templateId === "delivery-acceptance");
  assert.equal(actRow?.status, "partial");
  assert.deepEqual(actRow?.missing, ["Cliente o responsable"]);

  const base = {
    flight,
    findings: [],
    invoices: [],
    documents: [],
    checklistTotal: 16,
  };
  const delivery = (evidences: Evidence[]) =>
    buildItinerary({ ...base, evidences })[5];
  const both = delivery([signed, act]);
  assert.equal(both.state, "partial");
  assert.ok(both.detail.includes("Informe del vuelo: firmado"));
  assert.ok(
    both.detail.includes("Acta de entrega: falta Cliente o responsable"),
  );
  const reportOnly = delivery([signed]);
  assert.equal(reportOnly.state, "partial");
  assert.ok(reportOnly.detail.includes("Acta de entrega: sin hacer"));
  assert.equal(delivery([]).state, "todo");
  assert.equal(delivery([]).detail, "Sin informe firmado ni acta de entrega");
  const actDone = withSignature(
    act,
    {
      role: "Cliente o responsable",
      name: "Marcela Pineda",
      documentId: "31.222.333",
      method: "typed",
    },
    NOW,
  );
  assert.equal(delivery([actDone]).state, "done");
  assert.equal(delivery([actDone, signed]).state, "done");
  // A report started but not signed keeps the stage open.
  const half = withSignature(report(), operator, NOW);
  assert.equal(delivery([actDone, half]).state, "partial");
});
