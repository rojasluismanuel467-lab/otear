import test from "node:test";
import assert from "node:assert/strict";
import {
  flightTabs,
  paramForTab,
  reportTabs,
  tabFromParam,
  withTab,
} from "./tab-param.ts";

test("the address opens the tab it names, by word or by id, and ignores the rest", () => {
  assert.equal(tabFromParam("hallazgos", flightTabs), "findings");
  assert.equal(tabFromParam(" Hallazgos ", flightTabs), "findings");
  assert.equal(tabFromParam("findings", flightTabs), "findings");
  assert.equal(tabFromParam("informe", reportTabs), "report");
  assert.equal(tabFromParam("evolucion", reportTabs), "timeline");
  assert.equal(tabFromParam("no-existe", flightTabs), null);
  assert.equal(tabFromParam("", flightTabs), null);
  assert.equal(tabFromParam(null, flightTabs), null);
});

test("the same word can mean different tabs on different screens", () => {
  assert.equal(tabFromParam("informe", flightTabs), "report");
  assert.equal(paramForTab("report", reportTabs), "informe");
  assert.equal(paramForTab("findings", flightTabs), "hallazgos");
});

test("writing the tab keeps the other parameters", () => {
  assert.equal(withTab("", "findings", flightTabs), "?tab=hallazgos");
  assert.equal(
    withTab("?hallazgo=finding-1&tab=resumen", "report", flightTabs),
    "?hallazgo=finding-1&tab=informe",
  );
});
