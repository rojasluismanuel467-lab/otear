export interface EInvoice {
  number: string;
  issueDate: string;
  dueDate: string;
  supplierName: string;
  supplierNit: string;
  total: number;
  currency: string;
  description: string;
  cufe: string;
}

export type EInvoiceParse = { invoice: EInvoice } | { error: string };

function decode(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/** First element called `name` (any namespace prefix); returns its text and attributes. */
function pick(xml: string, name: string) {
  const match = new RegExp(
    `<(?:\\w+:)?${name}\\b([^>]*)>([\\s\\S]*?)</(?:\\w+:)?${name}>`,
  ).exec(xml);
  return match ? { attrs: match[1], text: decode(match[2]) } : undefined;
}

function between(xml: string, name: string) {
  return pick(xml, name)?.text ?? "";
}

/**
 * Reads the main fields of a Colombian electronic invoice (UBL 2.1 "Invoice"),
 * either the bare XML or the DIAN "AttachedDocument" that wraps it in a CDATA.
 * It does not validate the digital signature or the CUFE.
 */
export function parseEInvoice(source: string): EInvoiceParse {
  let xml = source;
  const wrapped =
    /<!\[CDATA\[([\s\S]*?<(?:\w+:)?Invoice\b[\s\S]*?<\/(?:\w+:)?Invoice>[\s\S]*?)\]\]>/.exec(
      source,
    );
  if (wrapped) xml = wrapped[1];
  if (!/<(?:\w+:)?Invoice\b/.test(xml)) {
    return {
      error:
        "No parece una factura electrónica: falta el elemento Invoice (UBL).",
    };
  }
  // The signature extension carries its own ids; the invoice fields come after it.
  xml = xml.replace(
    /<(?:\w+:)?UBLExtensions>[\s\S]*?<\/(?:\w+:)?UBLExtensions>/g,
    "",
  );

  const number = between(xml, "ID");
  const issueDate = between(xml, "IssueDate");
  const supplier = between(xml, "AccountingSupplierParty");
  const supplierName =
    between(supplier, "RegistrationName") || between(supplier, "Name");
  const supplierNit = between(supplier, "CompanyID");
  const payable = pick(xml, "PayableAmount");
  const total = payable ? Number(payable.text) : NaN;
  const currency =
    /currencyID="([A-Z]{3})"/.exec(payable?.attrs ?? "")?.[1] ?? "COP";
  const line = between(xml, "InvoiceLine");

  if (!number || !/^\d{4}-\d{2}-\d{2}$/.test(issueDate)) {
    return { error: "Falta el número o la fecha de emisión de la factura." };
  }
  if (!supplierName) return { error: "No encontré el nombre del emisor." };
  if (!Number.isFinite(total) || total <= 0) {
    return { error: "No encontré un valor a pagar válido (PayableAmount)." };
  }
  return {
    invoice: {
      number,
      issueDate,
      dueDate: between(xml, "DueDate") || between(xml, "PaymentDueDate"),
      supplierName,
      supplierNit,
      total,
      currency,
      description:
        between(line, "Description") ||
        between(xml, "Note") ||
        "Servicio de vuelo con dron",
      cufe: between(xml, "UUID"),
    },
  };
}

/** A small valid-looking invoice, to try the import without a real file. */
export function sampleEInvoice(values: {
  number: string;
  issueDate: string;
  dueDate: string;
  supplierName: string;
  supplierNit: string;
  total: number;
  description: string;
}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>UBL 2.1</cbc:UBLVersionID>
  <cbc:ID>${values.number}</cbc:ID>
  <cbc:UUID schemeName="CUFE-SHA384">8a1f0c4e2b77d3a95f6c01e8b4d2a7396e5f10c9d8b7a6e5f4d3c2b1a09f8e7d6c5b4a39281706f5e4d3c2b1a0918273</cbc:UUID>
  <cbc:IssueDate>${values.issueDate}</cbc:IssueDate>
  <cbc:DueDate>${values.dueDate}</cbc:DueDate>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyTaxScheme>
        <cbc:RegistrationName>${values.supplierName}</cbc:RegistrationName>
        <cbc:CompanyID schemeName="31">${values.supplierNit}</cbc:CompanyID>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:LegalMonetaryTotal>
    <cbc:PayableAmount currencyID="COP">${values.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cac:Item><cbc:Description>${values.description}</cbc:Description></cac:Item>
  </cac:InvoiceLine>
</Invoice>`;
}
