import assert from "node:assert/strict";
import test from "node:test";
import { coveredHaFor } from "./links.ts";

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
