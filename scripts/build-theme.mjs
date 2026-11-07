// Genera las variables CSS del prototipo a partir de theme.json (la única fuente de valores del UI Kit).
// Uso: node scripts/build-theme.mjs           escribe theme.css
//      node scripts/build-theme.mjs --check   falla si theme.css no coincide con theme.json
import { readFileSync, writeFileSync } from "node:fs";

const source = "theme.json";
const target = "src/features/prototype/verify-charge/theme.css";
const theme = JSON.parse(readFileSync(source, "utf8"));

const lines = [];
const add = (name, value) => lines.push(`  --ds-${name}: ${value};`);

for (const [group, tokens] of Object.entries(theme.color))
  for (const [name, token] of Object.entries(tokens))
    add(`color-${group}-${name}`, token.value);
add("font-sans", theme.typography.family.sans.value);
for (const role of ["heading", "body", "caption"])
  for (const [name, token] of Object.entries(theme.typography[role])) {
    add(`type-${role}-${name}-size`, token.size);
    add(`type-${role}-${name}-weight`, token.weight);
    add(`type-${role}-${name}-line`, token.lineHeight);
  }
for (const [name, token] of Object.entries(theme.spacing))
  add(`space-${name}`, token.value);
for (const [name, token] of Object.entries(theme.radius))
  add(`radius-${name}`, token.value);
add("size-target", theme.size.target.value);
for (const [name, token] of Object.entries(theme.border.width))
  add(`border-${name}`, token.value);
add("focus-ring", theme.focus.ring.value);
for (const [name, token] of Object.entries(theme.motion.duration))
  add(`motion-${name}`, token.value);
add("motion-easing-out", theme.motion.easing.out.value);
add("motion-spinner", theme.motion.spinner.value);

const css = `/* Generado desde theme.json con \`npm run theme\`. No editar a mano. */
[data-ds="otear"] {
${lines.join("\n")}
}
`;

if (process.argv.includes("--check")) {
  let current = "";
  try {
    current = readFileSync(target, "utf8");
  } catch {}
  if (current !== css) {
    console.error(
      `${target} no coincide con ${source}. Ejecute: npm run theme`,
    );
    process.exit(1);
  }
  console.log(`${target} está al día con ${source}.`);
} else {
  writeFileSync(target, css);
  console.log(`${target}: ${lines.length} variables.`);
}
