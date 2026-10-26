import assert from "node:assert/strict";
import test from "node:test";
import { partHistory, type PartFlight } from "./parts-history.ts";
import { usageFor, type UsageInput } from "./parts-usage.ts";

const flight = (id: string, date: string, duration = 60): PartFlight => ({
  id,
  date,
  title: `Vuelo ${id}`,
  duration,
  pilot: "Ana",
});
const flights = [
  flight("a", "2026-02-10"),
  flight("b", "2026-03-10", 30),
  flight("c", "2026-04-10"),
];
const usageInput: UsageInput = {
  hours: 100,
  flights: flights.map(({ date }) => ({ date })),
  records: [
    {
      date: "2026-02-01",
      hoursAt: 97.5,
      taskId: "propellers",
      partId: undefined,
    },
  ],
  plan: [
    {
      id: "propellers",
      title: "Cambio de hélices",
      everyHours: 10,
      source: "",
    },
  ],
  batteries: [],
};
const part = { id: "propellers", group: "propulsion" as const, es: "Hélices" };

test("wear grows flight by flight since the last service", () => {
  const usage = usageFor([part], usageInput).propellers;
  assert.equal(usage.value, 2.5);
  const result = partHistory({
    part,
    usage,
    usageInput,
    flights,
    marks: [],
    today: "2026-05-01",
  });
  assert.deepEqual(
    result.series.map((point) => point.fraction),
    [0, 0.1, 0.15, 0.25, 0.25],
  );
  assert.equal(result.series[0].date, "2026-02-01");
  assert.equal(
    result.events.filter((event) => event.kind === "flight").length,
    3,
  );
  assert.equal(result.events[0].kind, "flight");
  assert.equal(result.events[result.events.length - 1].kind, "service");
});

test("marks of the part appear in its history and other parts' marks do not", () => {
  const usage = usageFor([part], usageInput).propellers;
  const result = partHistory({
    part,
    usage,
    usageInput,
    flights,
    marks: [
      {
        id: "1",
        part: "propellers",
        date: "2026-04-20",
        note: "Muesca",
        condition: "replace",
      },
      {
        id: "2",
        part: "motors",
        date: "2026-04-21",
        note: "x",
        condition: "ok",
      },
    ],
    today: "2026-05-01",
  });
  const marks = result.events.filter((event) => event.kind === "mark");
  assert.equal(marks.length, 1);
  assert.ok(marks[0].title.includes("cambiar"));
});
