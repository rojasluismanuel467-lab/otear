// Genera auditoria.pdf desde auditoria.html (máximo 4 páginas, pedido por la rúbrica).
// Uso: node docs/planning/prototipo-s3/build-pdf.mjs [--video URL] [--final]
//   --video URL  reemplaza {{VIDEO_URL}}
//   --final      se niega a construir si queda {{VIDEO_URL}} o si pasa de 4 páginas
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
import { homedir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const final = args.includes("--final");
const video = args.includes("--video") ? args[args.indexOf("--video") + 1] : "";
const require = createRequire(join(here, "../../../package.json"));
const { chromium } = require("playwright-core");

let html = readFileSync(join(here, "auditoria.html"), "utf8");
if (video) html = html.replace("{{VIDEO_URL}}", `<a href="${video}">${video}</a>`);
if (final && html.includes("{{VIDEO_URL}}")) {
  console.error("Falta el enlace del video: use --video URL.");
  process.exit(1);
}
html = html.replace("{{VIDEO_URL}}", "<i>(se añade al grabar el video)</i>");
const tmp = join(here, ".auditoria.build.html");
writeFileSync(tmp, html);

const base = join(homedir(), ".cache", "ms-playwright");
const dir = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
const executablePath = process.env.CHROME_PATH ?? join(base, dir, "chrome-linux64/chrome");
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
const out = join(here, "auditoria.pdf");
await page.pdf({ path: out, format: "Letter", printBackground: true, preferCSSPageSize: true });
await browser.close();

const pages = (readFileSync(out).toString("latin1").match(/\/Type\s*\/Page\b/g) ?? []).length;
console.log(`auditoria.pdf: ${pages} páginas`);
if (pages > 4) {
  console.error("Pasa de 4 páginas: recorte el texto o las imágenes.");
  if (final) process.exit(1);
}
