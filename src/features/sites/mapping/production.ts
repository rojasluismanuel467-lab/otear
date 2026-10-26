export interface ProductionRow {
  name: string;
  use: string;
  quantity: number;
}

export type ProductionParse = { rows: ProductionRow[] } | { error: string };

function parseNumber(value: string, decimalComma: boolean) {
  const text = value.trim().replace(/\s/g, "");
  return Number(decimalComma ? text.replace(",", ".") : text);
}

/**
 * Reads lines like "Lote 1; Caña; 38,5" (name; use; quantity). Accepts `;`,
 * tab or `,` as separators (decimal comma only when the separator is not a comma),
 * an optional header and two or three columns.
 */
export function parseProduction(text: string): ProductionParse {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length)
    return { error: "Pegue al menos una línea con nombre y cantidad." };
  const separator = text.includes(";") ? ";" : text.includes("\t") ? "\t" : ",";
  const decimalComma = separator !== ",";
  const rows: ProductionRow[] = [];
  for (const [index, line] of lines.entries()) {
    const cells = line.split(separator).map((cell) => cell.trim());
    if (cells.length < 2) {
      return {
        error: `La línea ${index + 1} necesita nombre y cantidad separados por «;».`,
      };
    }
    const quantity = parseNumber(cells[cells.length - 1], decimalComma);
    if (!Number.isFinite(quantity)) {
      if (index === 0) continue; // header
      return { error: `La cantidad de la línea ${index + 1} no es un número.` };
    }
    if (quantity <= 0) {
      return {
        error: `La cantidad de la línea ${index + 1} debe ser mayor que cero.`,
      };
    }
    rows.push({
      name: cells[0],
      use: cells.length > 2 ? cells[1] : "",
      quantity,
    });
  }
  if (rows.length < 2)
    return { error: "Se necesitan al menos dos filas para repartir." };
  if (rows.length > 40)
    return { error: "Son demasiadas filas; use máximo 40." };
  return { rows };
}
