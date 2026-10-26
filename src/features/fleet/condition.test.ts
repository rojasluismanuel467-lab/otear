import assert from "node:assert/strict";
import test from "node:test";
import {
  openProblems,
  problemAlerts,
  summarize,
  worstCondition,
} from "./condition.ts";
import type { PartCondition, PartMark } from "../demo/types";

const mark = (
  id: string,
  condition: PartCondition,
  extra: Partial<PartMark> = {},
): PartMark => ({
  id,
  aircraftId: "a",
  modelKey: "glb:/models/dji/mavic-3-enterprise.glb",
  size: "m",
  part: "propellers",
  condition,
  note: "",
  date: "2026-10-01",
  by: "Ana",
  ...extra,
});

test("resolved marks stop counting as open problems", () => {
  const marks = [
    mark("1", "replace"),
    mark("2", "replace", { resolvedOn: "2026-10-05" }),
    mark("3", "watch"),
    mark("4", "ok"),
  ];
  assert.deepEqual(summarize(marks), {
    ok: 1,
    watch: 1,
    replace: 1,
    resolved: 1,
  });
  assert.deepEqual(
    openProblems(marks).map((item) => item.id),
    ["1", "3"],
  );
  assert.equal(worstCondition(marks), "replace");
  assert.equal(worstCondition([]), undefined);
});

test("alerts are danger for replace and one grouped info for watch", () => {
  const alerts = problemAlerts([
    mark("1", "replace", { part: "motors", note: "ruido" }),
    mark("2", "watch", { part: "propellers" }),
    mark("3", "watch", { part: "propellers" }),
  ]);
  assert.equal(alerts.length, 2);
  assert.equal(alerts[0].tone, "danger");
  assert.ok(alerts[0].text.includes("Motores"));
  assert.ok(alerts[1].text.startsWith("2 partes por vigilar"));
});
