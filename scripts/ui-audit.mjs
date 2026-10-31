#!/usr/bin/env node
// Auditoría repetible de la interfaz de Otear. Ver docs/planning/ui-audit/README.md.
//
//   npm run audit:ui -- --build --label base        (construye, sirve out/ y audita)
//   npm run audit:ui -- --url http://localhost:3470  (contra un servidor ya levantado)
//   npm run audit:ui -- --serve out --compare docs/planning/ui-audit/base.json
//
// Solo devDependencies: lighthouse, axe-core, playwright-core (no se descarga ningún navegador:
// usa el Chromium de ~/.cache/ms-playwright, CHROME_PATH o Google Chrome).
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import { extname, join, normalize, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright-core";
import lighthouse from "lighthouse";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

// ───────────────────────── argumentos ─────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
// Acepta «--nombre valor» y «--nombre=valor» (esta última sirve para valores que empiezan con «--»).
const opt = (name, fallback) => {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--")
    ? argv[i + 1]
    : fallback;
};
if (flag("help") || flag("h")) {
  console.log(`Uso: node scripts/ui-audit.mjs [opciones]
  --label <nombre>      etiqueta de la corrida (base, final, …). Por defecto «local».
  --out <carpeta>       carpeta de salida. Por defecto docs/planning/ui-audit.
  --url <url>           servidor ya levantado (no sirve out/).
  --serve <carpeta>     sirve esa carpeta estática (por defecto out/) en --port (3470).
  --build               corre «npm run build» antes de servir.
  --routes a,b,c        rutas a auditar (por defecto las de la configuración).
  --viewports desktop,mobile
  --lh-runs <n>         corridas de Lighthouse por ruta (mediana). Por defecto 1.
  --no-lighthouse | --no-axe | --no-screens
  --experiments         mide el costo de cada efecto (sin backdrop-filter, sin blur, …).
  --compare <base.json> compara con una corrida anterior y falla si hay regresiones.
  --report-only         nunca sale con código 1 (solo informa).
  --config <archivo>    configuración (por defecto scripts/ui-audit.config.json).
  --inject-css="<css>"  CSS que se inyecta en cada página (solo mediciones propias, no Lighthouse): para probar un cambio sin editarlo.
  --chrome-flags="<f>"  banderas extra de Chromium; use «=» (p. ej. --chrome-flags="--disable-3d-apis --disable-gpu" para medir sin WebGL).
  --chrome-port <n>     puerto de depuración de Chromium (9470).`);
  process.exit(0);
}

const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(
  readFileSync(
    resolve(root, opt("config", "scripts/ui-audit.config.json")),
    "utf8",
  ),
);
const label = opt("label", "local");
const outDir = resolve(root, opt("out", "docs/planning/ui-audit"));
const port = Number(opt("port", "3470"));
const chromePort = Number(opt("chrome-port", "9470"));
const lhRuns = Math.max(1, Number(opt("lh-runs", "1")));
const routes = opt("routes", "") ? opt("routes").split(",") : config.routes;
const vpNames = (
  opt("viewports", "")
    ? opt("viewports").split(",")
    : Object.keys(config.viewports)
).filter((v) => config.viewports[v]);
const doLighthouse = !flag("no-lighthouse");
const doAxe = !flag("no-axe");
const doScreens = !flag("no-screens");
const doExperiments = flag("experiments");
const comparePath = opt("compare", "");
const reportOnly = flag("report-only");

const log = (...a) => console.error("[ui-audit]", ...a);

// ───────────────────────── servidor estático ─────────────────────────
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ico": "image/x-icon",
  ".glb": "model/gltf-binary",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".map": "application/json",
};
const COMPRESSIBLE = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".svg",
  ".txt",
  ".xml",
  ".map",
]);

function startStaticServer(dir, listenPort) {
  const gzCache = new Map();
  const server = createServer((req, res) => {
    try {
      const url = new URL(req.url ?? "/", "http://x");
      let rel = normalize(decodeURIComponent(url.pathname)).replace(
        /^([/\\])+/,
        "",
      );
      let file = join(dir, rel);
      if (!file.startsWith(dir)) {
        res.writeHead(403).end();
        return;
      }
      if (existsSync(file) && statSync(file).isDirectory())
        file = join(file, "index.html");
      let status = 200;
      if (!existsSync(file)) {
        file = join(dir, "404.html");
        status = 404;
      }
      if (!existsSync(file)) {
        res.writeHead(404).end("no encontrado");
        return;
      }
      const ext = extname(file);
      const headers = {
        "content-type": MIME[ext] ?? "application/octet-stream",
        "cache-control": "public, max-age=0",
      };
      let body = readFileSync(file);
      // Como lo haría Cloudflare Pages: texto comprimido en tránsito.
      if (
        COMPRESSIBLE.has(ext) &&
        /gzip/.test(String(req.headers["accept-encoding"]))
      ) {
        if (!gzCache.has(file)) gzCache.set(file, gzipSync(body, { level: 6 }));
        body = gzCache.get(file);
        headers["content-encoding"] = "gzip";
      }
      headers["content-length"] = body.length;
      res.writeHead(status, headers).end(body);
    } catch (e) {
      res.writeHead(500).end(String(e));
    }
  });
  return new Promise((ok, fail) => {
    server.once("error", fail);
    server.listen(listenPort, "127.0.0.1", () => ok(server));
  });
}

// ───────────────────────── Chromium ─────────────────────────
function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH))
    return process.env.CHROME_PATH;
  const base = join(homedir(), ".cache", "ms-playwright");
  if (existsSync(base)) {
    const dirs = readdirSync(base)
      .filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const d of dirs)
      for (const sub of [
        "chrome-linux64/chrome",
        "chrome-linux/chrome",
        "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
      ]) {
        const p = join(base, d, sub);
        if (existsSync(p)) return p;
      }
  }
  for (const p of [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ])
    if (existsSync(p)) return p;
  throw new Error("No se encontró Chromium. Defina CHROME_PATH.");
}

async function launchChrome() {
  const profile = mkdtempSync(join(tmpdir(), "otear-audit-"));
  const proc = spawn(
    findChrome(),
    [
      "--headless=new",
      "--no-sandbox",
      `--remote-debugging-port=${chromePort}`,
      `--user-data-dir=${profile}`,
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-component-update",
      "--mute-audio",
      ...(opt("chrome-flags", "")
        ? opt("chrome-flags").split(/\s+/).filter(Boolean)
        : []),
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  const stop = () => {
    try {
      proc.kill("SIGTERM");
    } catch {}
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {}
  };
  process.on("exit", stop);
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${chromePort}/json/version`);
      if (r.ok) return { stop, version: (await r.json()).Browser };
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  stop();
  throw new Error(
    `Chromium no respondió en el puerto ${chromePort} (¿ya hay otro proceso ahí?).`,
  );
}

// ───────────────────────── comprobaciones dentro de la página ─────────────────────────
const INIT_SCRIPT = `(() => {
  const a = (window.__audit = { cls: 0, longTasks: [], events: [], lcp: [] });
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) a.lcp.push({ t: Math.round(e.startTime), size: e.size, el: e.element ? e.element.tagName.toLowerCase() + (typeof e.element.className === "string" && e.element.className ? "." + e.element.className.split(" ")[0] : "") : "" }); }).observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) a.cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) a.longTasks.push(Math.round(e.duration)); }).observe({ type: "longtask", buffered: true }); } catch {}
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) a.events.push({ name: e.name, duration: e.duration }); }).observe({ type: "event", buffered: true, durationThreshold: 16 }); } catch {}
})();`;

function pageChecks(ignoreSmall) {
  const sel = (el) => {
    const id = el.id ? "#" + el.id : "";
    const cls =
      typeof el.className === "string"
        ? el.className
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((c) => "." + c.replace(/__[a-zA-Z0-9_-]{4,}$/, ""))
            .join("")
        : "";
    return el.tagName.toLowerCase() + id + cls;
  };
  const vw = document.documentElement.clientWidth;
  const out = {};
  // 1. Desborde horizontal.
  const scrollW = document.documentElement.scrollWidth;
  const offenders = [];
  if (scrollW > vw) {
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (
        r.width &&
        r.right > vw + 1 &&
        getComputedStyle(el).position !== "fixed"
      ) {
        // solo los más externos: ignora hijos cuyo padre ya desborda
        if (
          el.parentElement &&
          el.parentElement !== document.body &&
          el.parentElement.getBoundingClientRect().right > vw + 1
        )
          continue;
        offenders.push({
          el: sel(el),
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
        if (offenders.length >= 8) break;
      }
    }
  }
  out.overflow = { px: Math.max(0, scrollW - vw), offenders };
  // 2. Texto por debajo de 12 px y recuento de tamaños.
  const small = new Map();
  let smallCount = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const ignoreMatch = (el) =>
    ignoreSmall.some((s) => {
      try {
        return el.matches(s);
      } catch {
        return false;
      }
    });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue.trim();
    if (!text) continue;
    const el = n.parentElement;
    if (!el || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(el.tagName)) continue;
    if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))
      continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (ignoreMatch(el)) continue;
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (fs < 11.99) {
      smallCount++;
      const key = sel(el) + "|" + fs;
      if (!small.has(key))
        small.set(key, {
          el: sel(el),
          size: fs,
          sample: text.slice(0, 50),
          count: 0,
        });
      small.get(key).count++;
    }
  }
  out.smallText = {
    count: smallCount,
    groups: [...small.values()].sort((a, b) => b.count - a.count).slice(0, 10),
  };
  // 3. Peso visual: lo que cuesta pintar y componer.
  let backdrop = 0,
    filters = 0,
    willChange = 0,
    fixedEls = 0,
    fixedArea = 0,
    mixBlend = 0,
    bigShadow = 0;
  const vArea = innerWidth * innerHeight;
  const all = document.querySelectorAll("*");
  const probe = (el, pseudo) => {
    const cs = getComputedStyle(el, pseudo);
    if (pseudo && cs.content === "none") return;
    if (
      (cs.backdropFilter && cs.backdropFilter !== "none") ||
      (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== "none")
    )
      backdrop++;
    if (cs.filter && cs.filter !== "none") filters++;
    if (cs.willChange && cs.willChange !== "auto") willChange++;
    if (cs.mixBlendMode && cs.mixBlendMode !== "normal") mixBlend++;
    if (cs.position === "fixed") {
      const r = el.getBoundingClientRect();
      fixedEls++;
      if (!pseudo)
        fixedArea = Math.max(
          fixedArea,
          Math.min(
            1,
            (Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) *
              Math.max(
                0,
                Math.min(r.bottom, innerHeight) - Math.max(r.top, 0),
              )) /
              vArea,
          ),
        );
      else fixedArea = Math.max(fixedArea, 1);
    }
    const m = cs.boxShadow.match(/(\d+)px\s+\d+px\s+(\d+)px/g);
    if (m && cs.boxShadow.split("),").length >= 3) bigShadow++;
  };
  probe(document.documentElement);
  probe(document.documentElement, "::before");
  probe(document.documentElement, "::after");
  for (const el of all) {
    probe(el);
    probe(el, "::before");
    probe(el, "::after");
  }
  const canvases = [...document.querySelectorAll("canvas")];
  out.weight = {
    domNodes: all.length,
    pageHeight: Math.round(document.documentElement.scrollHeight),
    backdropFilters: backdrop,
    filters,
    willChange,
    mixBlend,
    manyShadows: bigShadow,
    fixedLayers: fixedEls,
    canvases: canvases.length,
    webglCanvases: canvases.filter((c) => {
      try {
        return !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        return false;
      }
    }).length,
    cssAnimationsRunning: document
      .getAnimations()
      .filter((a) => a.playState === "running").length,
    images: document.images.length,
    imagesNoDims: [...document.images].filter(
      (i) =>
        !i.getAttribute("width") &&
        !i.getAttribute("height") &&
        !i.style.width &&
        !i.style.height,
    ).length,
  };
  // 4. Estructura: encabezados.
  const heads = [...document.querySelectorAll("h1,h2,h3,h4")].filter((h) =>
    h.checkVisibility(),
  );
  out.headings = {
    h1: heads.filter((h) => h.tagName === "H1").length,
    total: heads.length,
  };
  out.title = document.title;
  return out;
}

function runFrames({ scroll, ms }) {
  return new Promise((done) => {
    const max = Math.max(
      0,
      Math.min(document.documentElement.scrollHeight - innerHeight, 7000),
    );
    const speed = 1400; // px/s
    const deltas = [];
    const t0 = performance.now();
    let last = t0;
    const tick = (t) => {
      deltas.push(t - last);
      last = t;
      if (scroll)
        scrollTo({
          top: Math.min(max, ((t - t0) / 1000) * speed),
          behavior: "instant",
        });
      if (
        t - t0 < ms &&
        !(scroll && ((t - t0) / 1000) * speed >= max + speed * 0.3)
      )
        requestAnimationFrame(tick);
      else {
        const d = deltas.slice(2).sort((a, b) => a - b);
        const pick = (p) =>
          d[Math.min(d.length - 1, Math.floor(d.length * p))] ?? 0;
        done({
          frames: d.length,
          fps: d.length / ((t - t0) / 1000),
          p50: pick(0.5),
          p95: pick(0.95),
          max: d[d.length - 1] ?? 0,
          jank: d.filter((x) => x > 33.4).length,
          scrolledPx: max,
        });
        scrollTo({ top: 0, behavior: "instant" });
      }
    };
    requestAnimationFrame(tick);
  });
}

// ───────────────────────── medición por ruta ─────────────────────────
const slug = (route) =>
  route === "/"
    ? "inicio"
    : route.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-");
const median = (xs) => {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : null;
};

async function runLighthouse(url, vpName, vp) {
  const runs = [];
  for (let i = 0; i < lhRuns; i++) {
    const flags = {
      port: chromePort,
      output: "json",
      logLevel: "silent",
      onlyCategories: ["performance", "accessibility", "best-practices"],
      screenEmulation: {
        mobile: vp.mobile,
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.mobile ? 2.625 : 1,
        disabled: false,
      },
      formFactor: vp.mobile ? "mobile" : "desktop",
    };
    let cfg;
    if (!vp.mobile)
      cfg = (await import("lighthouse/core/config/desktop-config.js")).default;
    const res = await lighthouse(url, flags, cfg);
    const l = res.lhr;
    const a = l.audits;
    const reqs = a["network-requests"]?.details?.items ?? [];
    const sum = (types) =>
      reqs
        .filter((r) => types.includes(r.resourceType))
        .reduce((s, r) => s + (r.transferSize ?? 0), 0);
    runs.push({
      performance: l.categories.performance?.score,
      accessibility: l.categories.accessibility?.score,
      bestPractices: l.categories["best-practices"]?.score,
      fcpMs: a["first-contentful-paint"]?.numericValue,
      lcpMs: a["largest-contentful-paint"]?.numericValue,
      cls: a["cumulative-layout-shift"]?.numericValue,
      tbtMs: a["total-blocking-time"]?.numericValue,
      siMs: a["speed-index"]?.numericValue,
      mainThreadMs: a["mainthread-work-breakdown"]?.numericValue,
      bootupMs: a["bootup-time"]?.numericValue,
      domSize: a["dom-size"]?.numericValue,
      jsKbTransfer: sum(["Script"]) / 1024,
      cssKbTransfer: sum(["Stylesheet"]) / 1024,
      imgKbTransfer: sum(["Image", "Media"]) / 1024,
      fontKbTransfer: sum(["Font"]) / 1024,
      totalKbTransfer:
        reqs.reduce((s, r) => s + (r.transferSize ?? 0), 0) / 1024,
      requests: reqs.length,
      unusedJsKb:
        (a["unused-javascript"]?.details?.overallSavingsBytes ?? 0) / 1024,
      lcpElement:
        a[
          "largest-contentful-paint-element"
        ]?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 120) ??
        null,
      a11yFailing: Object.values(l.audits)
        .filter(
          (x) =>
            l.categories.accessibility?.auditRefs.some((r) => r.id === x.id) &&
            x.score === 0,
        )
        .map((x) => x.id),
      perfOpportunities: Object.values(a)
        .filter(
          (x) =>
            x.details?.type === "opportunity" &&
            x.score != null &&
            x.score < 0.9,
        )
        .map((x) => ({
          id: x.id,
          ms: Math.round(x.details.overallSavingsMs ?? 0),
          kb: Math.round((x.details.overallSavingsBytes ?? 0) / 1024),
        }))
        .slice(0, 6),
    });
  }
  if (runs.length === 1) return runs[0];
  const out = { ...runs[0] };
  for (const k of Object.keys(out))
    if (typeof out[k] === "number" || out[k] == null)
      out[k] = median(runs.map((r) => r[k]));
  out.runs = runs.length;
  return out;
}

async function auditPage(browser, base, route, vpName, vp) {
  const result = { route, viewport: vpName };
  const url = base.replace(/\/$/, "") + route;
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: vp.mobile ? 2 : 1,
    userAgent: vp.mobile
      ? "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36"
      : undefined,
  });
  const page = await context.newPage();
  await page.addInitScript(INIT_SCRIPT);
  if (opt("inject-css", ""))
    await page.addInitScript((css) => {
      const add = () => {
        const st = document.createElement("style");
        st.textContent = css;
        document.head.appendChild(st);
      };
      if (document.head) add();
      else document.addEventListener("DOMContentLoaded", add);
    }, opt("inject-css"));
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().slice(0, 160));
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e).slice(0, 160)));
  const failedRequests = [];
  page.on("response", (r) => {
    if (r.status() >= 400)
      failedRequests.push(`${r.status()} ${r.url().slice(0, 110)}`);
  });
  page.on("requestfailed", (r) => {
    if (!/ABORTED/i.test(r.failure()?.errorText ?? ""))
      failedRequests.push(r.url().slice(0, 120));
  });
  try {
    await page.goto(url, { waitUntil: "load", timeout: 45000 });
    await page
      .waitForLoadState("networkidle", { timeout: 8000 })
      .catch(() => {});
    await page.waitForTimeout(route === "/" ? 4500 : 1500); // la llegada del avión dura ~3,4 s
    Object.assign(
      result,
      await page.evaluate(pageChecks, config.ignoreSmallTextSelectors ?? []),
    );
    result.frames = {
      idle: await page.evaluate(runFrames, { scroll: false, ms: 2000 }),
      scroll: await page.evaluate(runFrames, { scroll: true, ms: 6000 }),
    };
    if (doAxe) {
      // Sin animaciones: axe mediría el contraste de elementos a medio aparecer (revelado por desplazamiento).
      const noMotion = await page.addStyleTag({
        content:
          "*,*::before,*::after{animation:none!important;transition:none!important}",
      });
      await page.evaluate(axeSource);
      const ax = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
          },
          resultTypes: ["violations", "incomplete"],
        });
        const brief = (v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.length,
          samples: v.nodes.slice(0, 3).map((n) => ({
            target: n.target.join(" ").slice(0, 100),
            summary: (n.any[0]?.message ?? n.failureSummary ?? "").slice(
              0,
              140,
            ),
          })),
        });
        return {
          violations: r.violations.map(brief),
          incompleteContrast: r.incomplete
            .filter((v) => v.id === "color-contrast")
            .reduce((s, v) => s + v.nodes.length, 0),
        };
      });
      result.axe = ax;
      await noMotion.evaluate((el) => el.remove());
    }
    if (doScreens) {
      const dir = join(outDir, label, "capturas");
      mkdirSync(dir, { recursive: true });
      const file = `${slug(route)}-${vpName}.jpg`;
      await page.screenshot({
        path: join(dir, file),
        type: "jpeg",
        quality: 55,
        fullPage: false,
      });
      result.screenshot = `${label}/capturas/${file}`;
      if (flag("full-page")) {
        const full = `${slug(route)}-${vpName}-completa.jpg`;
        await page.screenshot({
          path: join(dir, full),
          type: "jpeg",
          quality: 45,
          fullPage: true,
        });
        result.screenshotFull = `${label}/capturas/${full}`;
      }
    }
    // La sonda va al final: un clic puede abrir un diálogo que falsearía axe y la captura.
    // Sonda de interacción (sustituto de INP): clic real en pestañas, resúmenes y botones desplegables.
    const targets = page.locator(
      '[role="tab"]:not([aria-selected="true"]), summary, button[aria-expanded]',
    );
    const n = Math.min(await targets.count(), 4);
    for (let i = 0; i < n; i++) {
      try {
        await targets.nth(i).click({ timeout: 1500 });
        await page.waitForTimeout(350);
      } catch {}
    }
    const probe = await page.evaluate(() => ({
      cls: window.__audit.cls,
      longTasks: window.__audit.longTasks,
      events: window.__audit.events,
      lcp: window.__audit.lcp,
    }));
    result.lcpCandidates = probe.lcp;
    result.lcpObserved = probe.lcp.length
      ? probe.lcp[probe.lcp.length - 1]
      : null; // LCP real de esta corrida, sin simulación de red ni CPU
    result.cls = probe.cls;
    result.longTasks = {
      count: probe.longTasks.length,
      totalMs: probe.longTasks.reduce((s, x) => s + x, 0),
      maxMs: Math.max(0, ...probe.longTasks),
    };
    result.inpProxyMs = probe.events.length
      ? Math.max(...probe.events.map((e) => e.duration))
      : 0;
    result.interactionsTried = n;
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(300);
  } catch (e) {
    result.error = String(e).slice(0, 300);
  }
  result.consoleErrors = [...new Set(consoleErrors)].slice(0, 5);
  result.failedRequests = [...new Set(failedRequests)].slice(0, 5);
  await context.close();
  if (doLighthouse) {
    try {
      result.lighthouse = await runLighthouse(url, vpName, vp);
    } catch (e) {
      result.lighthouseError = String(e).slice(0, 300);
    }
  }
  return result;
}

async function runExperiments(browser, base) {
  const rows = [];
  for (const vpName of vpNames) {
    const vp = config.viewports[vpName];
    for (const route of config.experiments.routes) {
      for (const variant of [
        { name: "base (sin cambios)", css: "" },
        ...config.experiments.variants,
      ]) {
        const samples = [];
        for (let rep = 0; rep < 2; rep++) {
          const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            isMobile: vp.mobile,
            hasTouch: vp.mobile,
          });
          const page = await context.newPage();
          if (variant.css)
            await page.addInitScript((css) => {
              const add = () => {
                const s = document.createElement("style");
                s.textContent = css;
                document.head.appendChild(s);
              };
              if (document.head) add();
              else document.addEventListener("DOMContentLoaded", add);
            }, variant.css);
          try {
            await page.goto(base.replace(/\/$/, "") + route, {
              waitUntil: "load",
              timeout: 45000,
            });
            await page.waitForTimeout(route === "/" ? 4500 : 1500);
            samples.push(
              await page.evaluate(runFrames, { scroll: true, ms: 6000 }),
            );
          } catch {
            /* se omite la muestra */
          }
          await context.close();
        }
        if (samples.length)
          rows.push({
            viewport: vpName,
            route,
            variant: variant.name,
            p50: median(samples.map((s) => s.p50)),
            p95: median(samples.map((s) => s.p95)),
            fps: median(samples.map((s) => s.fps)),
            jank: median(samples.map((s) => s.jank)),
          });
      }
      log(`experimentos ${vpName} ${route} listos`);
    }
  }
  return rows;
}

// ───────────────────────── evaluación de umbrales ─────────────────────────
function evaluate(results) {
  const t = config.thresholds;
  const fails = [];
  const add = (r, what, got, limit) =>
    fails.push({ route: r.route, viewport: r.viewport, what, got, limit });
  for (const r of results) {
    const v = r.viewport;
    if (r.error) {
      add(r, "la página no cargó", r.error, "—");
      continue;
    }
    const lh = r.lighthouse;
    if (lh) {
      if (lh.performance < t.lighthouse.performance[v])
        add(
          r,
          "Lighthouse rendimiento",
          Math.round(lh.performance * 100),
          `≥ ${t.lighthouse.performance[v] * 100}`,
        );
      if (lh.accessibility < t.lighthouse.accessibility[v])
        add(
          r,
          "Lighthouse accesibilidad",
          Math.round(lh.accessibility * 100),
          `≥ ${t.lighthouse.accessibility[v] * 100}`,
        );
      if (lh.bestPractices < t.lighthouse.bestPractices[v])
        add(
          r,
          "Lighthouse buenas prácticas",
          Math.round(lh.bestPractices * 100),
          `≥ ${t.lighthouse.bestPractices[v] * 100}`,
        );
      if (lh.lcpMs > t.lighthouse.lcpMs[v])
        add(r, "LCP (ms)", Math.round(lh.lcpMs), `≤ ${t.lighthouse.lcpMs[v]}`);
      if (lh.cls > t.lighthouse.cls[v])
        add(r, "CLS", lh.cls.toFixed(3), `≤ ${t.lighthouse.cls[v]}`);
      if (lh.tbtMs > t.lighthouse.tbtMs[v])
        add(r, "TBT (ms)", Math.round(lh.tbtMs), `≤ ${t.lighthouse.tbtMs[v]}`);
      if (lh.jsKbTransfer > t.lighthouse.jsKbTransfer[v])
        add(
          r,
          "JS transferido (KB)",
          Math.round(lh.jsKbTransfer),
          `≤ ${t.lighthouse.jsKbTransfer[v]}`,
        );
    }
    if (r.axe) {
      const n = r.axe.violations.length;
      if (n > t.axe.maxViolations)
        add(r, "axe: reglas incumplidas", n, `≤ ${t.axe.maxViolations}`);
      const c = r.axe.violations
        .filter((x) => x.id === "color-contrast")
        .reduce((s, x) => s + x.nodes, 0);
      if (c > t.axe.contrastMaxNodes)
        add(
          r,
          "axe: elementos con contraste < 4,5:1",
          c,
          `≤ ${t.axe.contrastMaxNodes}`,
        );
    }
    if (r.overflow && r.overflow.px > t.overflowPx)
      add(r, "desborde horizontal (px)", r.overflow.px, `≤ ${t.overflowPx}`);
    if (r.smallText && r.smallText.count > t.smallTextMaxCount)
      add(r, "textos < 12 px", r.smallText.count, `≤ ${t.smallTextMaxCount}`);
    if (r.inpProxyMs > t.inpProxyMs[v])
      add(
        r,
        "interacción más lenta (ms)",
        Math.round(r.inpProxyMs),
        `≤ ${t.inpProxyMs[v]}`,
      );
    if (r.frames && r.frames.scroll.p95 > t.scrollP95FrameMs[v])
      add(
        r,
        "cuadro p95 al desplazar (ms)",
        r.frames.scroll.p95.toFixed(1),
        `≤ ${t.scrollP95FrameMs[v]}`,
      );
    if (r.headings && r.headings.h1 !== 1)
      add(r, "encabezados h1 visibles", r.headings.h1, "= 1");
  }
  return fails;
}

function regressions(results, baseData) {
  const t = config.regression;
  const out = [];
  const byKey = new Map(
    baseData.results.map((r) => [`${r.route}|${r.viewport}`, r]),
  );
  for (const r of results) {
    const b = byKey.get(`${r.route}|${r.viewport}`);
    if (!b || r.error || b.error) continue;
    const add = (what, was, now) =>
      out.push({ route: r.route, viewport: r.viewport, what, was, now });
    if (r.lighthouse && b.lighthouse) {
      if (
        b.lighthouse.performance - r.lighthouse.performance >
        t.lighthousePerformanceDrop
      )
        add(
          "Lighthouse rendimiento",
          Math.round(b.lighthouse.performance * 100),
          Math.round(r.lighthouse.performance * 100),
        );
      if (
        b.lighthouse.accessibility - r.lighthouse.accessibility >
        t.lighthouseAccessibilityDrop
      )
        add(
          "Lighthouse accesibilidad",
          Math.round(b.lighthouse.accessibility * 100),
          Math.round(r.lighthouse.accessibility * 100),
        );
      if (
        r.lighthouse.lcpMs >
        b.lighthouse.lcpMs * (1 + t.lcpIncreasePct / 100)
      )
        add(
          "LCP (ms)",
          Math.round(b.lighthouse.lcpMs),
          Math.round(r.lighthouse.lcpMs),
        );
      if (
        r.lighthouse.jsKbTransfer >
        b.lighthouse.jsKbTransfer * (1 + t.jsTransferIncreasePct / 100)
      )
        add(
          "JS transferido (KB)",
          Math.round(b.lighthouse.jsKbTransfer),
          Math.round(r.lighthouse.jsKbTransfer),
        );
    }
    if (
      r.axe &&
      b.axe &&
      r.axe.violations.length - b.axe.violations.length > t.newAxeViolations
    )
      add(
        "axe: reglas incumplidas",
        b.axe.violations.length,
        r.axe.violations.length,
      );
    if (
      r.smallText &&
      b.smallText &&
      r.smallText.count - b.smallText.count > t.newSmallText
    )
      add("textos < 12 px", b.smallText.count, r.smallText.count);
    if (
      r.overflow &&
      b.overflow &&
      r.overflow.px - b.overflow.px > t.newOverflow
    )
      add("desborde horizontal (px)", b.overflow.px, r.overflow.px);
  }
  return out;
}

// ───────────────────────── informe Markdown ─────────────────────────
const f0 = (x) => (x == null ? "—" : Math.round(x).toLocaleString("es-CO"));
const f1 = (x) => (x == null ? "—" : x.toFixed(1));
const pct = (x) => (x == null ? "—" : Math.round(x * 100));

function renderReport({
  meta,
  results,
  fails,
  regress,
  experiments,
  baseData,
}) {
  const L = [];
  L.push(`# Auditoría de interfaz · ${meta.label}`);
  L.push("");
  L.push(
    `- Fecha: ${meta.date} · Compilación: \`${meta.commit}\` · Navegador: ${meta.browser}`,
  );
  L.push(
    `- Servida desde: ${meta.source} (sitio estático de producción, texto comprimido con gzip como en Cloudflare Pages)`,
  );
  L.push(
    `- Rutas: ${meta.routes.join(", ")} · Ventanas: ${meta.viewports.map((v) => `${v} ${config.viewports[v].width}×${config.viewports[v].height}`).join(", ")} · Corridas de Lighthouse por ruta: ${meta.lhRuns}`,
  );
  L.push(
    `- **Límites de la medición.** Es un laboratorio, no usuarios: Chromium sin GPU real (render por software con SwiftShader), CPU de la máquina de desarrollo y red local. Sirve para comparar una corrida con otra en esta misma máquina, no como cifra absoluta. El INP real exige usuarios; aquí se mide una *sonda de interacción* (clics reales en pestañas y desplegables). Lighthouse y axe no certifican conformidad WCAG.`,
  );
  L.push("");
  const verdict = fails.length
    ? `**${fails.length} valores fuera de umbral**`
    : "**Todos los valores dentro de umbral**";
  L.push(
    `## Resultado: ${verdict}${regress ? ` · ${regress.length} regresiones frente a «${baseData.meta.label}»` : ""}`,
  );
  L.push("");
  if (fails.length) {
    L.push(
      "| Ruta | Ventana | Qué | Valor | Umbral |",
      "| --- | --- | --- | --- | --- |",
    );
    for (const x of fails)
      L.push(
        `| \`${x.route}\` | ${x.viewport} | ${x.what} | ${x.got} | ${x.limit} |`,
      );
    L.push("");
  }
  if (regress) {
    L.push(
      `### Regresiones frente a «${baseData.meta.label}» (${baseData.meta.date})`,
    );
    L.push("");
    if (!regress.length) L.push("Ninguna.");
    else {
      L.push(
        "| Ruta | Ventana | Qué | Antes | Ahora |",
        "| --- | --- | --- | --- | --- |",
      );
      for (const x of regress)
        L.push(
          `| \`${x.route}\` | ${x.viewport} | ${x.what} | ${x.was} | ${x.now} |`,
        );
    }
    L.push("");
  }

  for (const vpName of meta.viewports) {
    L.push(
      `## Resumen · ${vpName} (${config.viewports[vpName].width}×${config.viewports[vpName].height})`,
    );
    L.push("");
    L.push(
      "| Ruta | Rend. | Acces. | B. prácticas | LCP ms | CLS | TBT ms | JS KB (transf.) | JS sin usar KB | Peso total KB | axe | Contraste | Desborde px | Texto <12px | Interacción ms | Cuadro p95 ms |",
    );
    L.push(
      "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    );
    for (const r of results.filter((x) => x.viewport === vpName)) {
      const lh = r.lighthouse ?? {};
      const contrast = r.axe
        ? r.axe.violations
            .filter((x) => x.id === "color-contrast")
            .reduce((s, x) => s + x.nodes, 0)
        : null;
      L.push(
        `| \`${r.route}\` | ${pct(lh.performance)} | ${pct(lh.accessibility)} | ${pct(lh.bestPractices)} | ${f0(lh.lcpMs)} | ${lh.cls == null ? "—" : lh.cls.toFixed(3)} | ${f0(lh.tbtMs)} | ${f0(lh.jsKbTransfer)} | ${f0(lh.unusedJsKb)} | ${f0(lh.totalKbTransfer)} | ${r.axe ? r.axe.violations.length : "—"} | ${contrast ?? "—"} | ${r.overflow ? r.overflow.px : "—"} | ${r.smallText ? r.smallText.count : "—"} | ${f0(r.inpProxyMs)} | ${r.frames ? f1(r.frames.scroll.p95) : "—"} |`,
      );
    }
    L.push("");
    L.push("**Peso visual** (cuánto hay que pintar y componer):", "");
    L.push(
      "| Ruta | Nodos DOM | Altura px | backdrop-filter | filter | Capas fijas | Canvas (WebGL) | Animaciones CSS activas | will-change | FPS en reposo | FPS al desplazar | Cuadro p50 / p95 / máx al desplazar (ms) | Tareas largas (n / ms) |",
    );
    L.push(
      "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    );
    for (const r of results.filter((x) => x.viewport === vpName && x.weight)) {
      const w = r.weight,
        fr = r.frames;
      L.push(
        `| \`${r.route}\` | ${f0(w.domNodes)} | ${f0(w.pageHeight)} | ${w.backdropFilters} | ${w.filters} | ${w.fixedLayers} | ${w.canvases} (${w.webglCanvases}) | ${w.cssAnimationsRunning} | ${w.willChange} | ${f0(fr.idle.fps)} | ${f0(fr.scroll.fps)} | ${f1(fr.scroll.p50)} / ${f1(fr.scroll.p95)} / ${f0(fr.scroll.max)} | ${r.longTasks.count} / ${f0(r.longTasks.totalMs)} |`,
      );
    }
    L.push("");
  }

  L.push("## Detalle por ruta");
  for (const r of results) {
    L.push("", `### \`${r.route}\` · ${r.viewport}`);
    if (r.error) {
      L.push(`- Error: ${r.error}`);
      continue;
    }
    if (r.screenshot)
      L.push(
        `- Captura: [${r.screenshot}](${r.screenshot})${r.screenshotFull ? ` · [completa](${r.screenshotFull})` : ""}`,
      );
    if (r.lighthouse) {
      const lh = r.lighthouse;
      L.push(
        `- Lighthouse: FCP ${f0(lh.fcpMs)} ms · Speed Index ${f0(lh.siMs)} ms · trabajo del hilo principal ${f0(lh.mainThreadMs)} ms · ejecución de JS ${f0(lh.bootupMs)} ms · ${f0(lh.requests)} peticiones (JS ${f0(lh.jsKbTransfer)} KB, CSS ${f0(lh.cssKbTransfer)} KB, imágenes ${f0(lh.imgKbTransfer)} KB, tipografías ${f0(lh.fontKbTransfer)} KB)`,
      );
      if (lh.lcpElement)
        L.push(`- Elemento LCP: \`${lh.lcpElement.replace(/`/g, "'")}\``);
      if (lh.a11yFailing?.length)
        L.push(
          `- Lighthouse accesibilidad, auditorías falladas: ${lh.a11yFailing.join(", ")}`,
        );
      if (lh.perfOpportunities?.length)
        L.push(
          `- Oportunidades de Lighthouse: ${lh.perfOpportunities.map((o) => `${o.id} (${o.ms ? o.ms + " ms" : ""}${o.kb ? " " + o.kb + " KB" : ""})`).join("; ")}`,
        );
    } else if (r.lighthouseError)
      L.push(`- Lighthouse falló: ${r.lighthouseError}`);
    if (r.axe) {
      if (!r.axe.violations.length)
        L.push(
          `- axe (WCAG 2.0–2.2 A/AA): sin violaciones${r.axe.incompleteContrast ? ` · ${r.axe.incompleteContrast} elementos de contraste que axe no puede decidir (fondo con imagen o desenfoque): revisar a ojo` : ""}.`,
        );
      else {
        L.push(
          `- axe (WCAG 2.0–2.2 A/AA): **${r.axe.violations.length} reglas incumplidas**${r.axe.incompleteContrast ? ` · ${r.axe.incompleteContrast} contrastes indecidibles` : ""}`,
        );
        for (const v of r.axe.violations)
          L.push(
            `  - \`${v.id}\` (${v.impact}, ${v.nodes} elementos): ${v.help} — p. ej. \`${v.samples[0]?.target}\` ${v.samples[0]?.summary ? "· " + v.samples[0].summary : ""}`,
          );
      }
    }
    if (r.overflow?.px)
      L.push(
        `- **Desborde horizontal ${r.overflow.px} px**: ${r.overflow.offenders.map((o) => `\`${o.el}\` (llega a ${o.right} px)`).join(", ")}`,
      );
    if (r.smallText?.count)
      L.push(
        `- **${r.smallText.count} textos por debajo de 12 px**: ${r.smallText.groups.map((g) => `\`${g.el}\` ${g.size}px ×${g.count} «${g.sample}»`).join("; ")}`,
      );
    if (r.lcpObserved)
      L.push(
        `- LCP observado (sin throttling): ${r.lcpObserved.t} ms en \`${r.lcpObserved.el}\``,
      );
    if (r.headings)
      L.push(
        `- Encabezados visibles: ${r.headings.total}, h1: ${r.headings.h1}`,
      );
    if (r.consoleErrors?.length)
      L.push(`- Errores de consola: ${r.consoleErrors.join(" | ")}`);
    if (r.failedRequests?.length)
      L.push(`- Peticiones fallidas: ${r.failedRequests.join(" | ")}`);
  }

  if (experiments?.length) {
    L.push("", "## Experimentos de costo (qué efecto pesa)", "");
    L.push(
      "Se recorre la página a 1.400 px/s durante 6 s, 2 repeticiones (mediana), quitando un efecto por vez con CSS inyectado. Bajar el cuadro p95 / subir los FPS al quitar un efecto indica cuánto cuesta ese efecto en *esta* máquina sin GPU; el orden relativo es útil, la cifra absoluta no.",
      "",
    );
    for (const vpName of meta.viewports) {
      for (const route of [
        ...new Set(
          experiments.filter((e) => e.viewport === vpName).map((e) => e.route),
        ),
      ]) {
        L.push(
          `**\`${route}\` · ${vpName}**`,
          "",
          "| Variante | FPS | Cuadro p50 ms | Cuadro p95 ms | Cuadros > 33 ms | Δ p95 vs. base |",
          "| --- | ---: | ---: | ---: | ---: | ---: |",
        );
        const rows = experiments.filter(
          (e) => e.viewport === vpName && e.route === route,
        );
        const base = rows[0];
        for (const e of rows)
          L.push(
            `| ${e.variant} | ${f0(e.fps)} | ${f1(e.p50)} | ${f1(e.p95)} | ${f0(e.jank)} | ${e === base ? "—" : (e.p95 - base.p95 >= 0 ? "+" : "") + f1(e.p95 - base.p95)} |`,
          );
        L.push("");
      }
    }
  }
  return L.join("\n") + "\n";
}

// ───────────────────────── principal ─────────────────────────
async function main() {
  let server = null;
  let chrome = null;
  let base = opt("url", "");
  try {
    if (flag("build")) {
      log("compilando (npm run build)…");
      execFileSync("npm", ["run", "build"], {
        cwd: root,
        stdio: ["ignore", "ignore", "inherit"],
      });
    }
    if (!base) {
      const dir = resolve(root, opt("serve", "out"));
      if (!existsSync(join(dir, "index.html")))
        throw new Error(`No hay ${dir}/index.html. Use --build o --url.`);
      server = await startStaticServer(dir, port);
      base = `http://127.0.0.1:${port}`;
      log(`sirviendo ${dir} en ${base}`);
    }
    const ping = await fetch(base + "/").catch(() => null);
    if (!ping || !ping.ok) throw new Error(`${base} no responde.`);
    chrome = await launchChrome();
    log(`navegador: ${chrome.version}`);
    const browser = await chromium.connectOverCDP(
      `http://127.0.0.1:${chromePort}`,
    );
    mkdirSync(outDir, { recursive: true });

    const results = [];
    for (const vpName of vpNames)
      for (const route of routes) {
        log(`${vpName} ${route}`);
        results.push(
          await auditPage(
            browser,
            base,
            route,
            vpName,
            config.viewports[vpName],
          ),
        );
      }
    const experiments = doExperiments
      ? await runExperiments(browser, base)
      : null;
    await browser.close().catch(() => {});

    let commit = "desconocido";
    try {
      commit =
        execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root })
          .toString()
          .trim() +
        (execFileSync("git", ["status", "--porcelain"], { cwd: root })
          .toString()
          .trim()
          ? " (+cambios sin confirmar)"
          : "");
    } catch {}
    const meta = {
      label,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      commit,
      browser: chrome.version,
      source: opt("url", "") || `${opt("serve", "out")}/ (local)`,
      routes,
      viewports: vpNames,
      lhRuns,
    };
    const baseData = comparePath
      ? JSON.parse(readFileSync(resolve(root, comparePath), "utf8"))
      : null;
    const fails = evaluate(results);
    const regress = baseData ? regressions(results, baseData) : null;
    writeFileSync(
      join(outDir, `${label}.json`),
      JSON.stringify(
        { meta, results, fails, regressions: regress, experiments },
        null,
        1,
      ),
    );
    writeFileSync(
      join(outDir, `${label}.md`),
      renderReport({ meta, results, fails, regress, experiments, baseData }),
    );
    log(`informe: ${join(outDir, label + ".md")}`);
    console.log(
      `${fails.length} valores fuera de umbral${regress ? `, ${regress.length} regresiones` : ""}.`,
    );
    for (const x of fails.slice(0, 25))
      console.log(
        `  ✗ ${x.viewport} ${x.route}: ${x.what} = ${x.got} (umbral ${x.limit})`,
      );
    if (fails.length > 25)
      console.log(`  … y ${fails.length - 25} más en el informe`);
    if (regress)
      for (const x of regress)
        console.log(
          `  ↓ ${x.viewport} ${x.route}: ${x.what} ${x.was} → ${x.now}`,
        );
    process.exitCode =
      !reportOnly && (fails.length || (regress && regress.length)) ? 1 : 0;
  } finally {
    chrome?.stop();
    server?.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
