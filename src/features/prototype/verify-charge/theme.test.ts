import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

// Corre desde la raíz del repositorio (npm test): theme.json es la fuente única del UI Kit.
const theme = JSON.parse(readFileSync("theme.json", "utf8"));
const color = (group: string, name: string): string =>
  theme.color[group][name].value;

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("theme.json (UI Kit de Otear)", () => {
  it("todo texto sobre su fondo cumple 4,5:1 (WCAG 1.4.3)", () => {
    const pairs: [string, string][] = [
      [color("text", "ink"), color("surface", "background")],
      [color("text", "ink"), color("surface", "default")],
      [color("text", "ink"), color("primary", "soft")],
      [color("text", "muted"), color("surface", "default")],
      [color("text", "muted"), color("surface", "background")],
      [color("text", "muted"), color("surface", "disabled")],
      [color("surface", "default"), color("primary", "default")],
      [color("surface", "default"), color("primary", "hover")],
      [color("primary", "default"), color("surface", "default")],
      [color("secondary", "default"), color("surface", "default")],
      [color("error", "ink"), color("error", "wash")],
      [color("error", "default"), color("surface", "default")],
      [color("success", "ink"), color("success", "wash")],
      [color("success", "default"), color("surface", "default")],
      [color("warning", "ink"), color("warning", "wash")],
    ];
    for (const [fg, bg] of pairs)
      assert.ok(
        contrast(fg, bg) >= 4.5,
        `${fg} sobre ${bg}: ${contrast(fg, bg).toFixed(2)}`,
      );
  });

  it("bordes e íconos de controles cumplen 3:1 (WCAG 1.4.11)", () => {
    const surface = color("surface", "default");
    for (const edge of [
      color("border", "control"),
      color("primary", "default"),
      color("error", "default"),
      color("success", "default"),
      color("warning", "default"),
    ])
      assert.ok(
        contrast(edge, surface) >= 3,
        `${edge}: ${contrast(edge, surface).toFixed(2)}`,
      );
  });

  it("el espaciado es la escala 4, 8, 12, 16, 24, 32 y lo pulsable mide 44 px o más", () => {
    assert.deepEqual(
      Object.values<{ value: string }>(theme.spacing).map((t) =>
        parseInt(t.value),
      ),
      [4, 8, 12, 16, 24, 32],
    );
    assert.ok(parseInt(theme.size.target.value) >= 44);
  });

  it("ningún texto baja de 14 px y hay tres niveles de radio", () => {
    for (const role of ["heading", "body", "caption"])
      for (const token of Object.values<{ size: string }>(
        theme.typography[role],
      ))
        assert.ok(parseInt(token.size) >= 14, `${role}: ${token.size}`);
    assert.deepEqual(Object.keys(theme.radius), ["small", "medium", "large"]);
  });

  it("las variables CSS generadas coinciden con theme.json", () => {
    const run = spawnSync("node", ["scripts/build-theme.mjs", "--check"], {
      encoding: "utf8",
    });
    assert.equal(run.status, 0, run.stderr);
  });

  it("el CSS del prototipo no escribe colores, tamaños de letra ni duraciones sueltos", () => {
    const css = readFileSync(
      "src/features/prototype/verify-charge/prototype.module.css",
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");
    assert.deepEqual(
      css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g) ?? [],
      [],
    );
    assert.deepEqual(css.match(/font-size:\s*\d/g) ?? [], []);
    assert.deepEqual(css.match(/\b\d+(\.\d+)?m?s\b/g) ?? [], []);
  });
});
