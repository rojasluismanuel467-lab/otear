import assert from "node:assert/strict";
import test from "node:test";
import {
  approximateOutline,
  centerlineFromRoutes,
  clusterCenters,
  convexHull,
  densify,
  distanceToLineM,
  pointInPolygon,
  lineLengthKm,
  parseGeometry,
  parseZones,
  parseLasHeader,
  polygonAreaHa,
  rectangleAround,
  splitByWeights,
  splitIntoStrips,
  splitLineByFractions,
  splitLineIntoParts,
  splitPolygon,
  voronoiCells,
} from "./geo.ts";

type P = [number, number];
// About 1 km x 1 km near Guacarí (1 degree of latitude ≈ 111.2 km).
const square: P[] = [
  [3.76, -76.34],
  [3.76, -76.3309],
  [3.769, -76.3309],
  [3.769, -76.34],
];

test("polygonAreaHa measures a square in hectares", () => {
  const area = polygonAreaHa(square);
  assert.ok(area > 95 && area < 105, `area was ${area}`);
});

test("splitIntoStrips keeps the total area", () => {
  const parts = splitIntoStrips(square, 4, "ew");
  assert.equal(parts.length, 4);
  const total = parts.reduce((sum, part) => sum + polygonAreaHa(part), 0);
  assert.ok(Math.abs(total - polygonAreaHa(square)) < 0.5);
  assert.ok(Math.abs(polygonAreaHa(parts[0]) - total / 4) < 0.5);
});

test("splitPolygon cuts a polygon in two with a line", () => {
  const parts = splitPolygon(square, [3.7645, -76.345], [3.7645, -76.325]);
  assert.equal(parts.length, 2);
  const total = parts.reduce((sum, part) => sum + polygonAreaHa(part), 0);
  assert.ok(Math.abs(total - polygonAreaHa(square)) < 0.5);
});

test("splitPolygon returns the whole polygon when the line misses it", () => {
  const parts = splitPolygon(square, [3.8, -76.345], [3.8, -76.325]);
  assert.equal(parts.length, 1);
});

test("splitLineIntoParts gives pieces of equal length", () => {
  const line: P[] = [
    [3.76, -76.34],
    [3.76, -76.33],
    [3.77, -76.33],
  ];
  const parts = splitLineIntoParts(line, 3);
  assert.equal(parts.length, 3);
  const lengths = parts.map(lineLengthKm);
  const total = lineLengthKm(line);
  for (const length of lengths) assert.ok(Math.abs(length - total / 3) < 0.02);
});

test("convexHull drops interior points", () => {
  const hull = convexHull([...square, [3.7645, -76.3355]]);
  assert.equal(hull.length, 4);
});

test("approximateOutline matches the requested area", () => {
  const outline = approximateOutline([3.764, -76.333], 120);
  assert.ok(Math.abs(polygonAreaHa(outline) - 120) < 3);
});

test("parseGeometry reads GeoJSON polygons (lng, lat order)", () => {
  const json = JSON.stringify({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-76.34, 3.76],
              [-76.33, 3.76],
              [-76.33, 3.77],
              [-76.34, 3.77],
              [-76.34, 3.76],
            ],
          ],
        },
      },
    ],
  });
  const result = parseGeometry(json, "predio.geojson");
  assert.ok("points" in result);
  if ("points" in result) {
    assert.equal(result.kind, "polygon");
    assert.equal(result.points.length, 4);
    assert.deepEqual(result.points[0], [3.76, -76.34]);
  }
});

test("parseGeometry reads KML polygons", () => {
  const kml = `<kml><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>
    -76.34,3.76,0 -76.33,3.76,0 -76.33,3.77,0 -76.34,3.77,0 -76.34,3.76,0
  </coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></kml>`;
  const result = parseGeometry(kml, "predio.kml");
  assert.ok("points" in result);
  if ("points" in result) assert.equal(result.points.length, 4);
});

test("parseGeometry reports readable errors", () => {
  assert.ok("error" in parseGeometry("no es json", "x.geojson"));
  assert.ok("error" in parseGeometry("{}", "x.geojson"));
  assert.ok("error" in parseGeometry("<kml/>", "x.kml"));
  assert.ok("error" in parseGeometry("", "x.shp"));
});

test("pointInPolygon tells inside from outside", () => {
  assert.equal(pointInPolygon([3.7645, -76.3355], square), true);
  assert.equal(pointInPolygon([3.78, -76.3355], square), false);
});

test("distanceToLineM measures meters to the nearest segment", () => {
  const line: P[] = [
    [3.76, -76.34],
    [3.76, -76.33],
  ];
  const distance = distanceToLineM([3.761, -76.335], line);
  assert.ok(distance > 105 && distance < 118, `distance was ${distance}`);
});

test("splitByWeights gives each strip its share of the area", () => {
  const parts = splitByWeights(square, [60, 30, 10], "ew");
  assert.equal(parts.length, 3);
  const total = polygonAreaHa(square);
  const shares = parts.map((part) => polygonAreaHa(part) / total);
  assert.ok(Math.abs(shares[0] - 0.6) < 0.01, `first share ${shares[0]}`);
  assert.ok(Math.abs(shares[1] - 0.3) < 0.01);
  assert.ok(Math.abs(shares[2] - 0.1) < 0.01);
});

test("splitLineByFractions follows the requested proportions", () => {
  const line: P[] = [
    [3.76, -76.34],
    [3.76, -76.33],
    [3.77, -76.33],
  ];
  const parts = splitLineByFractions(line, [2.4, 2.7, 0.9]);
  assert.equal(parts.length, 3);
  const total = lineLengthKm(line);
  const shares = parts.map((part) => lineLengthKm(part) / total);
  assert.ok(Math.abs(shares[0] - 2.4 / 6) < 0.01);
  assert.ok(Math.abs(shares[2] - 0.9 / 6) < 0.01);
});

test("clusterCenters + voronoiCells split an outline by where flights went", () => {
  const west: P[] = [
    [3.762, -76.338],
    [3.766, -76.338],
  ];
  const east: P[] = [
    [3.762, -76.332],
    [3.766, -76.332],
  ];
  const centers = clusterCenters(densify([west, east], 30), 2);
  assert.equal(centers.length, 2);
  const cells = voronoiCells(square, centers);
  assert.equal(cells.length, 2);
  const total = cells.reduce((sum, cell) => sum + polygonAreaHa(cell), 0);
  assert.ok(Math.abs(total - polygonAreaHa(square)) < 0.5);
});

test("centerlineFromRoutes straightens a zig-zag pass over a corridor", () => {
  const zigzag: P[] = [
    [3.76, -76.34],
    [3.7606, -76.3],
    [3.7612, -76.34],
    [3.7618, -76.3],
  ];
  const line = centerlineFromRoutes([zigzag], 6);
  assert.ok(line.length >= 4);
  const spread =
    Math.max(...line.map((p) => p[0])) - Math.min(...line.map((p) => p[0]));
  assert.ok(spread < 0.0012, `spread ${spread}`);
});

test("rectangleAround makes a box of the requested size", () => {
  const box = rectangleAround([3.764, -76.333], 40, 25);
  assert.equal(box.length, 4);
  const area = polygonAreaHa(box) * 10_000;
  assert.ok(Math.abs(area - 1000) < 15, `area ${area}`);
});

test("parseLasHeader reads bounds and version", () => {
  const buffer = new ArrayBuffer(375);
  const view = new DataView(buffer);
  "LASF".split("").forEach((char, i) => view.setUint8(i, char.charCodeAt(0)));
  view.setUint8(24, 1);
  view.setUint8(25, 2);
  view.setUint32(107, 3_200_000, true);
  [100.5, 60.5, 228.2, 200.2, 41.0, 20.0].forEach((value, i) =>
    view.setFloat64(179 + i * 8, value, true),
  );
  const header = parseLasHeader(buffer);
  assert.ok("min" in header);
  if ("min" in header) {
    assert.equal(header.version, "1.2");
    assert.equal(header.pointCount, 3_200_000);
    assert.deepEqual(header.max, [100.5, 228.2, 41]);
    assert.deepEqual(header.min, [60.5, 200.2, 20]);
  }
  assert.ok("error" in parseLasHeader(new ArrayBuffer(400)));
});

test("parseZones reads every polygon with its name, from GeoJSON and KML", () => {
  const ring = (x: number) => [
    [x, 3],
    [x + 0.01, 3],
    [x + 0.01, 3.01],
    [x, 3.01],
    [x, 3],
  ];
  const json = JSON.stringify({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { SUERTE: "S-101" },
        geometry: { type: "Polygon", coordinates: [ring(-76)] },
      },
      {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [ring(-75.9)] },
      },
      {
        type: "Feature",
        properties: { nombre: "Doble" },
        geometry: {
          type: "MultiPolygon",
          coordinates: [[ring(-75.8)], [ring(-75.7)]],
        },
      },
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [
            [-76, 3],
            [-75.9, 3],
          ],
        },
      },
    ],
  });
  const result = parseZones(json, "suertes.geojson");
  assert.ok("zones" in result);
  if ("zones" in result) {
    assert.deepEqual(
      result.zones.map((zone) => zone.name),
      ["S-101", undefined, "Doble 1", "Doble 2"],
    );
    assert.equal(result.zones[0].points.length, 4);
  }
  const kml = `<kml><Document>
    <Placemark><name><![CDATA[Suerte 7]]></name><Polygon><outerBoundaryIs><LinearRing><coordinates>-76,3,0 -75.99,3,0 -75.99,3.01,0 -76,3.01,0 -76,3,0</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
    <Placemark><name>Camino</name><LineString><coordinates>-76,3 -75,3</coordinates></LineString></Placemark>
  </Document></kml>`;
  const fromKml = parseZones(kml, "x.kml");
  assert.ok("zones" in fromKml);
  if ("zones" in fromKml)
    assert.deepEqual(
      fromKml.zones.map((zone) => zone.name),
      ["Suerte 7"],
    );
  assert.ok("error" in parseZones("{}", "x.geojson"));
  assert.ok("error" in parseZones("no", "x.geojson"));
  assert.ok("error" in parseZones("x", "x.shp"));
});
