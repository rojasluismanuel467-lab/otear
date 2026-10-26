import assert from "node:assert/strict";
import test from "node:test";
import {
  matchPayments,
  parseStatement,
  sampleStatement,
} from "./bank-statement.ts";
import { parseEInvoice, sampleEInvoice } from "./einvoice.ts";
import { payReadiness } from "./readiness.ts";
import { newEvidence, withSignature } from "../traceability/integrity.ts";
import type { Flight, Invoice } from "../demo/types";

const values = {
  number: "SETP990001234",
  issueDate: "2026-10-24",
  dueDate: "2026-11-23",
  supplierName: "AeroVisión del Valle S.A.S.",
  supplierNit: "900123456",
  total: 1120000,
  description: "Inspección aérea & entrega de evidencia",
};

test("parseEInvoice reads a UBL invoice", () => {
  const result = parseEInvoice(
    sampleEInvoice({
      ...values,
      description: "Inspección aérea &amp; entrega",
    }),
  );
  assert.ok("invoice" in result);
  if ("invoice" in result) {
    assert.equal(result.invoice.number, "SETP990001234");
    assert.equal(result.invoice.supplierName, "AeroVisión del Valle S.A.S.");
    assert.equal(result.invoice.supplierNit, "900123456");
    assert.equal(result.invoice.total, 1120000);
    assert.equal(result.invoice.dueDate, "2026-11-23");
    assert.equal(result.invoice.currency, "COP");
    assert.equal(result.invoice.description, "Inspección aérea & entrega");
  }
});

test("parseEInvoice finds the invoice inside an AttachedDocument CDATA", () => {
  const inner = sampleEInvoice(values);
  const attached = `<AttachedDocument><cac:Attachment><cac:ExternalReference><cbc:Description><![CDATA[${inner}]]></cbc:Description></cac:ExternalReference></cac:Attachment></AttachedDocument>`;
  const result = parseEInvoice(attached);
  assert.ok("invoice" in result);
});

test("parseEInvoice explains what is wrong", () => {
  assert.ok("error" in parseEInvoice("<hola/>"));
  assert.ok("error" in parseEInvoice(sampleEInvoice({ ...values, total: 0 })));
});

test("parseStatement reads es-CO amounts and dates", () => {
  const result = parseStatement(
    "Fecha;Descripción;Valor\n25/10/2026;TRANSF AEROVISION FV-2026-034;-450.000,00\n2026-10-23;ABONO;12.400.000",
  );
  assert.ok("rows" in result);
  if ("rows" in result) {
    assert.equal(result.rows.length, 2);
    assert.equal(result.rows[0].date, "2026-10-25");
    assert.equal(result.rows[0].amount, -450000);
    assert.equal(result.rows[1].amount, 12400000);
  }
  assert.ok("error" in parseStatement(""));
});

test("matchPayments pairs outflows with invoices and leaves the rest alone", () => {
  const invoices = [
    {
      id: "a",
      reference: "FV-2026-034",
      operator: "AeroVisión del Valle",
      balance: 450000,
    },
    {
      id: "b",
      reference: "FV-2026-021",
      operator: "Otro Operador",
      balance: 90000,
    },
  ];
  const parsed = parseStatement(sampleStatement(invoices));
  assert.ok("rows" in parsed);
  if ("rows" in parsed) {
    const { matches, unmatched } = matchPayments(parsed.rows, invoices);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].invoiceId, "a");
    assert.equal(matches[0].confidence, "alta");
    assert.equal(unmatched.length, 1); // the payroll outflow; the incoming transfer is ignored
  }
  const byAmount = matchPayments(
    [{ date: "2026-10-25", description: "PAGO", amount: -90000 }],
    invoices,
  );
  assert.equal(byAmount.matches[0].invoiceId, "b");
  assert.equal(byAmount.matches[0].confidence, "media");
});

test("payReadiness needs the signed delivery note, acknowledgement and acceptance", () => {
  const flight = { id: "f", title: "Vuelo", status: "completed" } as Flight;
  const invoice: Invoice = {
    id: "i",
    siteId: "s",
    flightId: "f",
    reference: "FV",
    description: "",
    operator: "",
    total: 10,
    paid: 0,
    dueDate: "",
  };
  const empty = { invoice, flight, findings: [], documents: [], evidences: [] };
  assert.equal(payReadiness(empty).ready, false);
  let act = newEvidence(
    {
      siteId: "s",
      flightId: "f",
      kind: "drafted",
      templateId: "delivery-acceptance",
      title: "Acta",
      fields: {
        deliverables: "x",
        date: "2026-10-24",
        result: "A satisfacción",
      },
    },
    "2026-10-24T10:00:00Z",
  );
  act = withSignature(
    act,
    { role: "Operador", name: "A", documentId: "1", method: "typed" },
    "2026-10-24T10:01:00Z",
  );
  act = withSignature(
    act,
    {
      role: "Cliente o responsable",
      name: "B",
      documentId: "2",
      method: "typed",
    },
    "2026-10-24T10:02:00Z",
  );
  const ready = payReadiness({
    ...empty,
    evidences: [act],
    invoice: { ...invoice, acknowledged: true, accepted: true },
  });
  assert.equal(ready.ready, true);
  const partial = payReadiness({
    ...empty,
    evidences: [act],
    invoice: { ...invoice, acknowledged: true },
  });
  assert.equal(partial.ready, false);
  assert.equal(partial.items.find((item) => item.id === "accepted")?.ok, false);
});
