export interface BankRow {
  date: string;
  description: string;
  /** Negative for money that left the account. */
  amount: number;
}

export type StatementParse = { rows: BankRow[] } | { error: string };

function parseAmount(raw: string): number {
  let text = raw.trim().replace(/[\s$]/g, "");
  let negative = false;
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1);
  }
  if (text.startsWith("-")) {
    negative = true;
    text = text.slice(1);
  }
  if (text.includes(",") && text.includes(".")) {
    // The last separator is the decimal one.
    text =
      text.lastIndexOf(",") > text.lastIndexOf(".")
        ? text.replace(/\./g, "").replace(",", ".")
        : text.replace(/,/g, "");
  } else if (text.includes(",")) {
    text = /,\d{1,2}$/.test(text)
      ? text.replace(",", ".")
      : text.replace(/,/g, "");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    text = text.replace(/\./g, "");
  }
  const value = Number(text);
  return negative ? -value : value;
}

function parseDate(raw: string): string | null {
  const text = raw.trim();
  let match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
  if (match)
    return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return null;
}

/** Reads "date; description; amount" lines exported from a bank. */
export function parseStatement(text: string): StatementParse {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length)
    return { error: "Pegue o cargue el extracto: fecha; descripción; valor." };
  const separator = text.includes(";") ? ";" : text.includes("\t") ? "\t" : ",";
  const rows: BankRow[] = [];
  for (const [index, line] of lines.entries()) {
    const cells = line.split(separator).map((cell) => cell.trim());
    if (cells.length < 3) {
      if (index === 0) continue;
      return {
        error: `La línea ${index + 1} necesita fecha, descripción y valor.`,
      };
    }
    const date = parseDate(cells[0]);
    const amount = parseAmount(cells[cells.length - 1]);
    if (!date || !Number.isFinite(amount)) {
      if (index === 0) continue; // header
      return {
        error: `No pude leer la fecha o el valor de la línea ${index + 1}.`,
      };
    }
    rows.push({ date, description: cells.slice(1, -1).join(" "), amount });
  }
  if (!rows.length)
    return { error: "No encontré movimientos con fecha y valor." };
  return { rows };
}

export interface InvoiceBalance {
  id: string;
  reference: string;
  operator: string;
  balance: number;
}

export interface PaymentMatch {
  rowIndex: number;
  row: BankRow;
  invoiceId: string;
  confidence: "alta" | "media" | "baja";
  reason: string;
  /** The movement is larger than what is still owed. */
  exceedsBalance: boolean;
}

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Proposes which invoice each outgoing bank movement pays. Nothing is applied:
 * the person confirms every match.
 */
export function matchPayments(
  rows: BankRow[],
  invoices: InvoiceBalance[],
): {
  matches: PaymentMatch[];
  unmatched: { rowIndex: number; row: BankRow }[];
} {
  const hasOutflows = rows.some((row) => row.amount < 0);
  const used = new Set<string>();
  const matches: PaymentMatch[] = [];
  const unmatched: { rowIndex: number; row: BankRow }[] = [];
  rows.forEach((row, rowIndex) => {
    if (hasOutflows && row.amount >= 0) return;
    const amount = Math.abs(row.amount);
    const text = normalize(row.description);
    const open = invoices.filter(
      (invoice) => invoice.balance > 0 && !used.has(invoice.id),
    );
    const byReference = open.find((invoice) =>
      text.includes(normalize(invoice.reference)),
    );
    const byBalance = open.find((invoice) => invoice.balance === amount);
    const byOperator = open.find((invoice) =>
      invoice.operator
        .split(/\s+/)
        .some((token) => token.length > 4 && text.includes(normalize(token))),
    );
    const pick = byReference ?? byBalance ?? byOperator;
    if (!pick) {
      unmatched.push({ rowIndex, row });
      return;
    }
    used.add(pick.id);
    matches.push({
      rowIndex,
      row,
      invoiceId: pick.id,
      confidence: byReference ? "alta" : byBalance ? "media" : "baja",
      reason: byReference
        ? `La descripción menciona ${pick.reference}`
        : byBalance
          ? "El valor es igual al saldo de la factura"
          : "La descripción menciona al operador",
      exceedsBalance: amount > pick.balance,
    });
  });
  return { matches, unmatched };
}

export function sampleStatement(invoices: InvoiceBalance[]): string {
  const first = invoices.find((invoice) => invoice.balance > 0);
  const lines = ["Fecha;Descripción;Valor"];
  if (first) {
    lines.push(
      `25/10/2026;TRANSF A AEROVISION DEL VALLE ${first.reference};-${first.balance}`,
    );
  }
  lines.push("24/10/2026;PAGO NOMINA OCTUBRE;-4.850.000,00");
  lines.push("23/10/2026;ABONO CLIENTE INGENIO;12.400.000,00");
  return lines.join("\n");
}
