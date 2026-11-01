import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  EXAMPLE_MAP_NAME,
  EXAMPLE_MAP_TEXT,
  OWN_FLIGHTS,
  TRACKED_LABOR_ID,
  laborsFor,
} from "./data.ts";
import {
  checkFlight,
  checkMapFile,
  deliveryOutcome,
  evidenceMessage,
  normalizePhone,
  readOperatorMap,
  flightProblemText,
  linkExpiry,
  sendBlockers,
  supportsFor,
  verifyCharge,
} from "./verification.ts";

const labor = laborsFor("normal").find((item) => item.id === TRACKED_LABOR_ID)!;

function example() {
  const map = readOperatorMap(EXAMPLE_MAP_TEXT, EXAMPLE_MAP_NAME);
  assert.ok(map.ok);
  const flight = checkFlight(OWN_FLIGHTS[0], labor);
  assert.ok(flight.ok);
  return { map, flight };
}

describe("figures of S1 add up across screens", () => {
  it("reads 17,1 ha from the operator's example map", () => {
    const { map } = example();
    assert.equal(map.reading.appliedHa, 17.1);
  });

  it("measures lots 5 and 6 at 20,8 ha on the own flight after the labor", () => {
    assert.equal(example().flight.measuredHa, 20.8);
  });

  it("finds 1,3 ha billed above applied, worth $117.000 at $90.000 per hectare", () => {
    const { map, flight } = example();
    const result = verifyCharge({
      labor,
      appliedHa: map.reading.appliedHa,
      measuredHa: flight.measuredHa,
      flightDate: "2026-10-24",
    });
    assert.equal(result.check.state, "over");
    assert.equal(result.value?.differenceCop, 117_000);
    assert.equal(result.billedTotal, 1_656_000);
    assert.equal(result.appliedTotal, 1_539_000);
    assert.equal(result.primary, "send");
  });

  it("leads with accepting when what was billed matches what was applied", () => {
    const result = verifyCharge({
      labor: { ...labor, billedHa: 17.1 },
      appliedHa: 17.1,
      measuredHa: 20.8,
      flightDate: "2026-10-24",
    });
    assert.equal(result.check.state, "match");
    assert.equal(result.primary, "accept");
  });
});

describe("operator's map", () => {
  it("refuses shapefiles, archives and unknown types before reading them", () => {
    assert.equal(checkMapFile("aplicacion.shp", 1000), "format");
    assert.equal(checkMapFile("aplicacion.zip", 1000), "format");
    assert.equal(checkMapFile("notas.txt", 10), "format");
    assert.equal(checkMapFile("aplicacion.kml", 3_000_000), "too-large");
    assert.equal(checkMapFile("aplicacion.KML", 1000), undefined);
  });

  it("tells an empty file from an unreadable one", () => {
    assert.deepEqual(readOperatorMap("  ", "a.kml"), {
      ok: false,
      problem: "empty",
    });
    assert.deepEqual(readOperatorMap("<kml>sin zonas</kml>", "a.kml"), {
      ok: false,
      problem: "unreadable",
    });
  });

  it("rejects a map that lies on another property", () => {
    const elsewhere = EXAMPLE_MAP_TEXT.replace(
      /(-76\.\d+),/g,
      (_, lng: string) => `${Number(lng) + 0.5},`,
    );
    assert.deepEqual(readOperatorMap(elsewhere, "otra-finca.kml"), {
      ok: false,
      problem: "elsewhere",
    });
  });
});

describe("own flight", () => {
  it("rejects a flight made before the labor", () => {
    assert.deepEqual(checkFlight(OWN_FLIGHTS[2], labor), {
      ok: false,
      problem: "before-labor",
    });
  });

  it("words the flight error with the lots and date of the labor at hand", () => {
    const other = { ...labor, lotIds: [1], date: "2026-10-03" };
    assert.match(flightProblemText("before-labor", other).todo, /3 de octubre/);
    assert.match(
      flightProblemText("not-covering", other).why,
      /no incluye lote 1,/,
    );
    assert.match(
      supportsFor(other, "2026-10-24")[1],
      /lote 1 de su vuelo del 24 de octubre/,
    );
  });

  it("dates the end of the evidence link 15 days after the demo's today", () => {
    assert.match(linkExpiry(), /9 nov 2026/);
  });

  it("rejects a later flight over other lots", () => {
    assert.deepEqual(checkFlight(OWN_FLIGHTS[1], labor), {
      ok: false,
      problem: "not-covering",
    });
  });
});

describe("a labor billed at $0", () => {
  it("has no charge to accept and no difference to claim", () => {
    const result = verifyCharge({
      labor: { ...labor, billedHa: 0 },
      appliedHa: 17.1,
      measuredHa: 20.8,
      flightDate: "2026-10-24",
    });
    assert.equal(result.noCharge, true);
    assert.equal(result.primary, "none");
    assert.match(result.headline, /factura está en \$0/);
  });
});

describe("evidence", () => {
  it("writes the message from the real figures", () => {
    const { map, flight } = example();
    const text = evidenceMessage(
      labor,
      verifyCharge({
        labor,
        appliedHa: map.reading.appliedHa,
        measuredHa: flight.measuredHa,
        flightDate: "2026-10-24",
      }),
    );
    assert.match(text, /17,1 ha/);
    assert.match(text, /18,4 ha/);
    assert.match(text, /1,3 ha \(\$117\.000\)/);
  });

  it("accepts Colombian mobile numbers with or without +57", () => {
    assert.equal(normalizePhone("315 642 1189"), "+573156421189");
    assert.equal(normalizePhone("+57 315 642 1189"), "+573156421189");
    assert.equal(normalizePhone("6012345678"), undefined);
    assert.equal(normalizePhone(""), undefined);
  });

  it("says what still blocks sending and clears when everything is there", () => {
    assert.equal(
      sendBlockers({
        destination: "315 642 1189",
        message: "Hola",
        supports: 3,
      }).length,
      0,
    );
    assert.equal(
      sendBlockers({ destination: "", message: "", supports: 0 }).length,
      3,
    );
    assert.equal(
      sendBlockers({
        destination: "315 642 1189",
        message: "a".repeat(501),
        supports: 1,
      }).length,
      1,
    );
  });

  it("reports the test number as not delivered", () => {
    assert.equal(deliveryOutcome("300 000 0000"), "failed");
    assert.equal(deliveryOutcome("315 642 1189"), "delivered");
  });
});
