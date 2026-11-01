// Builds entrega.pdf from entrega.md + the skill annex.
// Usage: node build-pdf.mjs [--final]   (--final refuses to build while any «PENDIENTE» remains)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const here = dirname(fileURLToPath(import.meta.url));
const final = process.argv.includes("--final");
const require = createRequire(process.env.PW_DIR ?? import.meta.url);
const { chromium } = require("playwright-core");

const skillPath = resolve(here, "../../../.claude/skills/otear-prototipo-s2/SKILL.md");
const skillRaw = readFileSync(skillPath, "utf8");
const front = skillRaw.match(/^---\n([\s\S]*?)\n---\n/)?.[0] ?? "";
const skillBodyRaw = skillRaw
  .slice(front.length)
  .replace(/^## /gm, "#### ")
  .replace(/^# /gm, "### ");
// APA: every table gets a numbered caption; the title comes from the heading above it.
let lastHeading = "";
let inTable = false;
const skillLines = [];
for (const line of skillBodyRaw.split("\n")) {
  const h = line.match(/^#{3,4} (.*)/);
  if (h) lastHeading = h[1].replace(/\*/g, "").trim();
  if (inTable && !line.startsWith("|")) {
    skillLines.push("", `Table: Reglas del bloque ${lastHeading}`);
    inTable = false;
  }
  if (line.startsWith("|")) inTable = true;
  skillLines.push(line);
}
const skillBody = skillLines.join("\n");
const annex = `## Anexo A. Skill completa (otear-prototipo-s2) {.skill-anexo}

Archivo: \`.claude/skills/otear-prototipo-s2/SKILL.md\`. Se reproduce completa, con su encabezado. Las referencias a la «Tabla 3», «Tabla 10» y similares dentro de la skill son tablas de S1 (Rojas Correa, 2026), no de este documento.

\`\`\`
${front.trim()}
\`\`\`

::: {.skill}
${skillBody}
:::
`;

const STATES = [
  ["Cargar el mapa del operador", "mapa"],
  ["Comparar", "comparar"],
  ["Enviar evidencia", "enviar"],
  ["Aceptar el cobro", "aceptar"],
];
const cell = (key, n, label) =>
  `<figure><img src="capturas/estados/${key}-${n}.png"><figcaption>${label}</figcaption></figure>`;
const statesHtml = STATES.map(
  ([title, key]) => `<div class="estado"><p class="figlabel"><i>Estados de «${title}»</i></p>
<div class="fila">${cell(key, "1-normal", "Normal")}${cell(key, "2-cargando", "Cargando")}${cell(key, "4-deshabilitado", "Deshabilitado")}</div>
<div class="fila">${cell(key, "3-error", "Error")}</div></div>`,
).join("\n");

let md = readFileSync(join(here, "entrega.md"), "utf8")
  .replace("<!--SKILL_ANNEX-->", () => annex)
  .replace("<!--STATES-->", () => statesHtml);

const pending = (md.match(/class="pendiente"/g) ?? []).length;
if (final && pending > 0) {
  console.error(`FINAL: quedan ${pending} marcadores PENDIENTE. No se genera.`);
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "entrega-"));
const mdPath = join(work, "all.md");
const htmlPath = join(work, "entrega.html");
writeFileSync(mdPath, md);
execFileSync("pandoc", [
  mdPath, "-f", "markdown+raw_html+pipe_tables-tex_math_dollars-tex_math_single_backslash", "-t", "html5", "--standalone",
  "--embed-resources", `--resource-path=${here}`, `--css=${join(here, "entrega.css")}`,
  "--metadata", "pagetitle=Otear prototipo S2", "-o", htmlPath,
], { cwd: here, stdio: "inherit" });

const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
const out = join(here, final ? "entrega.pdf" : "entrega-borrador.pdf");
await page.pdf({
  path: out,
  format: "Letter",
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate:
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:11pt;width:100%;text-align:right;padding-right:25.4mm;padding-top:8mm"><span class="pageNumber"></span></div>',
  footerTemplate: "<span></span>",
});
await browser.close();

// Attach the skill file itself so it travels with the PDF (Chromium cannot embed attachments).
const { PDFDocument } = require("pdf-lib");
const doc = await PDFDocument.load(readFileSync(out));
await doc.attach(readFileSync(skillPath), "SKILL.md", {
  mimeType: "text/markdown",
  description: "Skill otear-prototipo-s2, tal como está en .claude/skills/otear-prototipo-s2/SKILL.md",
});
writeFileSync(out, await doc.save());
console.log(`${out} (pendientes: ${pending})`);
