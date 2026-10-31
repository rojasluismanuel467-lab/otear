import assert from "node:assert/strict";
import test from "node:test";
import type { Finding } from "../demo/types.ts";
import { countPoints, pointsText } from "./finding-count.ts";
import { findingWords } from "./finding-words.ts";

const words = findingWords("Hallazgo", "Hallazgos");
const feminine = findingWords("Observación", "Observaciones");

function finding(
  id: string,
  status: Finding["status"],
  suggested = false,
): Finding {
  return {
    id,
    siteId: "s",
    flightId: "f",
    zoneId: "z",
    title: "t",
    description: "d",
    priority: "medium",
    status,
    position: [0, 0],
    imageUrl: "",
    ...(suggested
      ? {
          suggestion: {
            confidence: "medium",
            evidence: [],
            cannotTell: "",
            photoSpan: [0, 1],
          },
        }
      : {}),
  } as unknown as Finding;
}

const flight = [
  finding("a", "pending"),
  finding("b", "confirmed"),
  finding("c", "pending"),
  finding("s1", "pending", true),
  finding("s2", "pending", true),
  finding("x", "dismissed"),
];

test("one count tells operator findings, unreviewed suggestions and calculated alerts apart", () => {
  const count = countPoints(flight, 1);
  assert.equal(count.operator, 3);
  assert.equal(count.suggested, 2);
  assert.equal(count.dismissed, 1);
  assert.equal(count.findings, 5);
  assert.equal(count.points, 6);
  assert.equal(count.listed, 6);
});

test("a confirmed suggestion counts as the person's finding, a dismissed one as nothing", () => {
  const count = countPoints([
    finding("s1", "confirmed", true),
    finding("s2", "dismissed", true),
    finding("s3", "pending", true),
  ]);
  assert.equal(count.operator, 1);
  assert.equal(count.suggested, 1);
  assert.equal(count.findings, 2);
});

test("the text shows the breakdown only when the number could be read two ways", () => {
  assert.equal(
    pointsText(countPoints(flight, 1), words),
    "5 hallazgos (3 del operador y 2 sugerencias sin revisar) y 1 alerta calculada",
  );
  assert.equal(
    pointsText(countPoints(flight.slice(0, 3)), words),
    "3 hallazgos",
  );
  assert.equal(
    pointsText(countPoints(flight.slice(0, 3), 2), feminine),
    "3 observaciones y 2 alertas calculadas",
  );
  assert.equal(pointsText(countPoints([], 1), words), "1 alerta calculada");
  assert.equal(pointsText(countPoints([]), words), "Sin hallazgos");
  assert.equal(
    pointsText(countPoints([finding("s", "pending", true)]), words),
    "1 hallazgo (1 sugerencia sin revisar)",
  );
  assert.equal(
    pointsText(countPoints(flight, 1), words, { withCalculated: false }),
    "5 hallazgos (3 del operador y 2 sugerencias sin revisar)",
  );
});
