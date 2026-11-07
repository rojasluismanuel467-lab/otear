// Captura las pantallas y estados del prototipo «Verificar el cobro» para la auditoría (antes / después).
// Uso: node scripts/capture-prototype.mjs --label antes --url https://otear.pages.dev/prototipo/verificar-cobro/
//      node scripts/capture-prototype.mjs --label despues            (usa http://localhost:3000/...)
// Solo necesita playwright-core (devDependency) y el Chromium de ~/.cache/ms-playwright o CHROME_PATH.
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const label = opt("label", "despues");
const url = opt("url", "http://localhost:3000/prototipo/verificar-cobro/");
const out = join("docs", "planning", "prototipo-s3", "capturas", label);
mkdirSync(out, { recursive: true });

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH))
    return process.env.CHROME_PATH;
  const base = join(homedir(), ".cache", "ms-playwright");
  if (existsSync(base)) {
    const dirs = readdirSync(base)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const d of dirs) {
      const p = join(base, d, "chrome-linux64/chrome");
      if (existsSync(p)) return p;
    }
  }
  throw new Error("No se encontró Chromium. Defina CHROME_PATH.");
}

const browser = await chromium.launch({
  executablePath: findChrome(),
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 1000 },
  reducedMotion: "no-preference",
});
const page = await context.newPage();
const done = [];
const failed = [];

async function shot(name) {
  await page.screenshot({ path: join(out, `${name}.png`) });
  done.push(name);
}
async function step(name, fn) {
  try {
    await fn();
  } catch (error) {
    failed.push(`${name}: ${String(error.message).split("\n")[0]}`);
  }
}
async function fresh(scenario = "normal", failAccept = false) {
  await page.goto(url, { waitUntil: "networkidle" });
  // Oculta la insignia de desarrollo de Next.js para que no ensucie las capturas.
  await page.addStyleTag({
    content: "nextjs-portal,[data-nextjs-toast]{display:none!important}",
  });
  if (scenario !== "normal" || failAccept) {
    await page.locator("summary", { hasText: "Datos de prueba" }).click();
    if (scenario !== "normal") await page.selectOption("select", scenario);
    if (failAccept)
      await page.getByLabel("Simular una falla al registrar").check();
  }
}
const open = () =>
  page
    .getByRole("button", { name: /Verificar cobro/ })
    .first()
    .click();
const readMap = async () => {
  await page.getByRole("button", { name: "Usar el mapa de ejemplo" }).click();
  await page.getByRole("button", { name: "Cambiar el mapa" }).waitFor();
};
const pickFlight = () => page.locator('input[type="radio"]').first().check();
const compare = async () => {
  await page.getByRole("button", { name: "Comparar", exact: true }).click();
  await page.waitForTimeout(250);
};

// 1. Recorrido principal, con los estados de cada momento crítico.
await step("lista", async () => {
  await fresh();
  await shot("01-lista-labores");
});
await step("verificar", async () => {
  await open();
  await shot("02-verificar-inicial");
  await page.getByRole("button", { name: "Usar el mapa de ejemplo" }).click();
  await page.waitForTimeout(250);
  await shot("03-mapa-cargando");
  await page.getByRole("button", { name: "Cambiar el mapa" }).waitFor();
  await pickFlight();
  await shot("04-listo-para-comparar");
  await compare();
  await shot("05-comparando");
  await page
    .getByRole("heading", { name: /Resultado|coincide|diferencia/i })
    .first()
    .waitFor({ timeout: 4000 })
    .catch(() => {});
  await page.waitForTimeout(1200);
  await shot("06-resultado");
  await page.getByRole("button", { name: "Aceptar el cobro" }).click();
  await shot("07-dialogo-aceptar");
  await page.getByRole("button", { name: "Sí, aceptar el cobro" }).click();
  await page.waitForTimeout(250);
  await shot("08-aceptar-cargando");
  await page.waitForTimeout(1200);
  await shot("09-cobro-aceptado");
});
await step("error-aceptar", async () => {
  await fresh("normal", true);
  await open();
  await readMap();
  await pickFlight();
  await compare();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Aceptar el cobro" }).click();
  await page.getByRole("button", { name: "Sí, aceptar el cobro" }).click();
  await page.waitForTimeout(1300);
  await shot("10-aceptar-error");
});

// 2. Prueba de esfuerzo: contenido extremo.
for (const [scenario, withFlow] of [
  ["long-operator", true],
  ["long-note", true],
  ["zero-charge", true],
  ["huge-charge", false],
]) {
  await step(`esfuerzo-${scenario}`, async () => {
    await fresh(scenario);
    await shot(`20-${scenario}-lista`);
    if (!withFlow) return;
    await open();
    await readMap();
    await pickFlight();
    await compare();
    await page.waitForTimeout(1200);
    await shot(`21-${scenario}-resultado`);
  });
}

// 3. Métricas medibles: tiempo hasta el estado de carga, desborde horizontal y texto menor de 14 px.
const metrics = { loadingResponseMs: [], stress: {} };
const measure = () =>
  page.evaluate(() => {
    // La versión de S2 no tiene data-ds: la raíz es el padre de <main>.
    const root =
      document.querySelector('[data-ds="otear"]') ??
      document.querySelector("main").parentElement;
    const scrollsSideways = root.scrollWidth > root.clientWidth + 1;
    const small = [...root.querySelectorAll("*")].filter((el) => {
      const own = [...el.childNodes].some(
        (n) => n.nodeType === 3 && n.textContent.trim(),
      );
      return own && parseFloat(getComputedStyle(el).fontSize) < 14;
    }).length;
    const wide = [...root.querySelectorAll("main *")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.right > root.clientWidth + 1;
    }).length;
    return {
      scrollsSideways,
      textBelow14px: small,
      elementsPastRightEdge: wide,
    };
  });
await step("metricas-respuesta", async () => {
  for (const [what, name] of [
    ["Comparar", "Comparar"],
    ["Aceptar el cobro", "Sí, aceptar el cobro"],
  ]) {
    await fresh();
    await open();
    await readMap();
    await pickFlight();
    if (what === "Aceptar el cobro") {
      await compare();
      await page.waitForTimeout(1200);
      await page.getByRole("button", { name: "Aceptar el cobro" }).click();
    }
    const button =
      what === "Comparar"
        ? page.getByRole("button", { name: "Comparar", exact: true })
        : page.getByRole("button", { name });
    const ms = await button.evaluate(
      (el) =>
        new Promise((resolve) => {
          const t0 = performance.now();
          const seen = () =>
            document.querySelector('main [aria-busy="true"]')
              ? resolve(Math.round(performance.now() - t0))
              : requestAnimationFrame(seen);
          el.click();
          seen();
          setTimeout(() => resolve(-1), 2000);
        }),
    );
    metrics.loadingResponseMs.push({ action: what, ms });
  }
});
for (const scenario of [
  "normal",
  "long-operator",
  "long-note",
  "zero-charge",
  "huge-charge",
]) {
  await step(`metricas-${scenario}`, async () => {
    await fresh(scenario);
    const list = await measure();
    await open();
    await readMap();
    await pickFlight();
    await compare();
    await page.waitForTimeout(1200);
    metrics.stress[scenario] = { list, result: await measure() };
  });
}

await browser.close();
const { writeFileSync } = await import("node:fs");
writeFileSync(join(out, "metricas.json"), JSON.stringify(metrics, null, 2));
console.log(
  JSON.stringify({ label, url, out, done, failed, metrics }, null, 2),
);
