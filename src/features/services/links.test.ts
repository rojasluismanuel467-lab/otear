import assert from "node:assert/strict";
import test from "node:test";
import { aircraftForOperator, coveredHaFor } from "./links.ts";

test("hectares covered come from the flight log first, then from the delivery", () => {
  const requests = [{ flightId: "f2", delivery: { coveredHa: 80 } }];
  assert.equal(
    coveredHaFor(
      { id: "f1", log: { coveredHa: 50 } } as never,
      requests as never,
    ),
    50,
  );
  assert.equal(coveredHaFor({ id: "f2" } as never, requests as never), 80);
  assert.equal(
    coveredHaFor({ id: "f3" } as never, requests as never),
    undefined,
  );
  assert.equal(coveredHaFor(undefined, requests as never), undefined);
});

test("a scheduled service takes the aircraft its operator flies most, if it is in service", () => {
  const fleet = [
    { id: "a1", make: "DJI", model: "Mavic 3 Enterprise", status: "active" },
    { id: "a2", make: "DJI", model: "Matrice 350 RTK", status: "active" },
    { id: "a3", make: "DJI", model: "Mini", status: "grounded" },
  ] as never;
  const flights = [
    { operator: "Aero", aircraftId: "a1" },
    { operator: "Aero", aircraftId: "a2" },
    { operator: "Aero", aircraftId: "a2" },
    { operator: "Aero", aircraftId: "a3" },
    { operator: "Aero", aircraftId: "a3" },
    { operator: "Aero", aircraftId: "a3" },
    { operator: "Otro", aircraftId: "a1" },
    { operator: "Sin equipo" },
  ] as never;
  assert.deepEqual(aircraftForOperator("Aero", flights, fleet), {
    id: "a2",
    label: "DJI Matrice 350 RTK",
  });
  assert.equal(aircraftForOperator("Sin equipo", flights, fleet), undefined);
  assert.equal(aircraftForOperator("Nadie", flights, fleet), undefined);
  assert.equal(aircraftForOperator("Aero", flights, [] as never), undefined);
});
