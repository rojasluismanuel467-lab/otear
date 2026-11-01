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
const skill = readFileSync(skillPath, "utf8").replace(/^---[\s\S]*?---\n/, "");
let md = readFileSync(join(here, "entrega.md"), "utf8");
md += `\n\n# Anexo A · Skill completa (otear-prototipo-s2)\n\n*Archivo: \`.claude/skills/otear-prototipo-s2/SKILL.md\`. Se reproduce sin cambios.*\n\n${skill.replace(/^# /gm, "## ").replace(/^## /gm, "### ").replace(/^### Skill del proyecto/m, "### Skill del proyecto")}\n`;

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
await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`${out} (pendientes: ${pending})`);
