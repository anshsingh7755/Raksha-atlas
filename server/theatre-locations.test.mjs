import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const register = JSON.parse(readFileSync(new URL("./theatre-locations.json", import.meta.url), "utf8"));

test("Theatre Atlas register has unique, source-linked records", () => {
  assert.ok(Array.isArray(register.records) && register.records.length > 0);
  const ids = register.records.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of register.records) {
    assert.ok(item.id && item.name && item.locationType && item.status);
    assert.ok(item.sourceName && item.sourceUrl);
    assert.match(item.sourceUrl, /^https:\/\//);
    assert.ok(item.evidenceStatus && item.lastReviewed);
  }
});

test("Theatre Atlas coordinates are bounded and explicitly approximate", () => {
  for (const item of register.records) {
    assert.ok(Number.isFinite(item.latitude) && item.latitude >= -90 && item.latitude <= 90);
    assert.ok(Number.isFinite(item.longitude) && item.longitude >= -180 && item.longitude <= 180);
    assert.match(item.coordinatePrecision, /approximate/);
  }
});

test("Theatre Atlas policy distinguishes public geography from operational detail", () => {
  assert.match(register.policy, /approximate/i);
  assert.match(register.policy, /not installation coordinates/i);
  assert.ok(register.records.some((item) => item.locationType === "excluded_external_reference"));
});
