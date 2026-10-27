import assert from "node:assert/strict";
import test from "node:test";
import {
  accentTokens,
  contrast,
  defaultConfig,
  moduleLabel,
  moduleTitle,
  moveModule,
  term,
  validateConfig,
  visibleModules,
  type CompanyConfig,
} from "./config.ts";
import { can, planFor } from "./licence.ts";
import { applyPreset } from "./presets.ts";

const pro = (extra: Partial<CompanyConfig> = {}): CompanyConfig => ({
  ...defaultConfig,
  planId: "pro",
  ...extra,
});

test("a term falls back to the product word when the company sets none or the plan does not allow it", () => {
  const config = pro({
    terms: { finding: { singular: "Novedad", plural: "Novedades" } },
  });
  assert.equal(term(config, "finding"), "Novedad");
  assert.equal(term(config, "finding", "plural"), "Novedades");
  assert.equal(term(config, "pilot"), "Piloto");
  assert.equal(term({ ...config, planId: "base" }, "finding"), "Hallazgo");
  assert.equal(
    term(
      pro({ terms: { finding: { singular: "  ", plural: "" } } }),
      "finding",
    ),
    "Hallazgo",
  );
});

test("module names fill in the zone word and a custom name wins over the default", () => {
  assert.equal(moduleLabel(pro(), "mapa", "Frentes"), "Mapa y frentes");
  const config = pro({ modules: { evolucion: { label: "Avance de obra" } } });
  assert.equal(moduleLabel(config, "evolucion"), "Avance de obra");
  assert.equal(moduleTitle(config, "evolucion"), "Avance de obra");
  assert.equal(moduleTitle(pro(), "vuelos"), "Archivo de vuelos");
  assert.equal(
    moduleLabel({ ...config, planId: "base" }, "evolucion"),
    "Evolución",
  );
});

test("hidden modules leave the menu and the order is the company's, but only when the plan allows it", () => {
  const config = pro({
    modules: { pagos: { hidden: true } },
    order: [
      "documentos",
      "programacion",
      "vuelos",
      "mapa",
      "evolucion",
      "equipos",
      "informes",
      "pagos",
    ],
  });
  const ids = visibleModules(config).map((item) => item.id);
  assert.equal(ids[0], "documentos");
  assert.ok(!ids.includes("pagos"));
  assert.equal(visibleModules({ ...config, planId: "base" }).length, 8);
  assert.deepEqual(moveModule(["a", "b", "c"] as never, "b" as never, -1), [
    "b",
    "a",
    "c",
  ]);
  assert.deepEqual(moveModule(["a", "b"] as never, "a" as never, -1), [
    "a",
    "b",
  ]);
});

test("presets replace vocabulary and module names but keep brand, plan and hidden modules", () => {
  const base = pro({
    company: { name: "Constructora Sur", accent: "#1c6f8d" },
    modules: { pagos: { hidden: true } },
  });
  const result = applyPreset(base, "construccion");
  assert.equal(result.company.name, "Constructora Sur");
  assert.equal(result.planId, "pro");
  assert.equal(term(result, "finding"), "Observación");
  assert.equal(moduleLabel(result, "evolucion"), "Avance de obra");
  assert.equal(result.modules.pagos?.hidden, true);
  assert.equal(applyPreset(result, "general").terms.finding, undefined);
});

test("a brand colour must carry white text with enough contrast", () => {
  assert.ok(contrast("#000000", "#ffffff") > 20);
  assert.equal(accentTokens("#81bfdb"), null);
  assert.equal(accentTokens("zzz"), null);
  const tokens = accentTokens("#1c6f8d");
  assert.equal(tokens?.accent, "#1c6f8d");
  assert.notEqual(tokens?.hover, tokens?.accent);
  assert.ok(tokens && contrast(tokens.hover, "#ffffff") > 4.5);
});

test("an imported file is cleaned: unknown plans, long texts and foreign images are dropped", () => {
  const bad = validateConfig({ version: 2 });
  assert.equal(bad.ok, false);
  const good = validateConfig({
    version: 1,
    company: {
      name: "x".repeat(200),
      logo: "http://evil/x.png",
      accent: "red",
    },
    planId: "gold",
    terms: {
      finding: { singular: "Novedad", plural: "Novedades" },
      bogus: { singular: "a", plural: "b" },
    },
    modules: { pagos: { hidden: true }, nope: { hidden: true } },
    order: ["pagos", "nope"],
  });
  assert.ok(good.ok);
  if (good.ok) {
    assert.equal(good.config.company.name.length, 80);
    assert.equal(good.config.company.logo, undefined);
    assert.equal(good.config.company.accent, undefined);
    assert.equal(good.config.planId, "base");
    assert.deepEqual(Object.keys(good.config.terms), ["finding"]);
    assert.deepEqual(Object.keys(good.config.modules), ["pagos"]);
    assert.equal(good.config.order[0], "pagos");
    assert.equal(good.config.order.length, 8);
  }
});

test("licence plans gate the layers and tell which plan unlocks a feature", () => {
  assert.equal(can("base", "vocabulary"), false);
  assert.equal(can("pro", "vocabulary"), true);
  assert.equal(can("pro", "whiteLabel"), false);
  assert.equal(can("enterprise", "addons"), true);
  assert.equal(planFor("whiteLabel")?.id, "enterprise");
  assert.equal(planFor("vocabulary")?.id, "pro");
});
