import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchText, searchRecords, scoreSearchRecord } from "./index.mjs";

const records = [
  { section: "Inventory", view: "inventory", id: "fighter-1", title: "Tejas Light Combat Aircraft", summary: "Indigenous fighter aircraft", searchFields: { title: "Tejas Light Combat Aircraft", category: "Aircraft", summary: "Indigenous fighter aircraft", body: "Indian Air Force LCA Mk1A" } },
  { section: "Commands", view: "forces", id: "command-1", title: "Western Air Command", summary: "Indian Air Force operational command", searchFields: { title: "Western Air Command", category: "Operational Command", summary: "Indian Air Force operational command", body: "IAF service command" } },
  { section: "Theatre Atlas", view: "atlas", id: "anc", title: "Andaman & Nicobar Command", summary: "Established tri-service command", searchFields: { title: "Andaman & Nicobar Command", category: "Established command", summary: "Established tri-service command", body: "Port Blair India Joint" } },
  { section: "News & articles", view: "signals", id: "news-1", title: "India signs new helicopter contract", summary: "Defence procurement update", searchFields: { title: "India signs new helicopter contract", category: "Defence news", summary: "Defence procurement update", body: "A new aviation programme" } },
];

test("normalization handles punctuation, ampersands and case", () => {
  assert.equal(normalizeSearchText("Andaman & Nicobar  COMMAND"), "andaman and nicobar command");
});

test("exact title and phrase matches rank above body-only matches", () => {
  const results = searchRecords(records, "Western Air Command");
  assert.equal(results[0].id, "command-1");
});

test("common service acronyms expand to their full names", () => {
  assert.ok(searchRecords(records, "IAF").some((item) => item.id === "command-1"));
  assert.ok(searchRecords(records, "ANC").some((item) => item.id === "anc"));
});

test("multi-term searches require every query concept to match", () => {
  assert.equal(searchRecords(records, "helicopter submarine").length, 0);
  assert.ok(searchRecords(records, "Indian Air Force").some((item) => item.id === "command-1"));
});

test("section filtering and result limits are applied", () => {
  const filtered = searchRecords(records, "command", { section: "Theatre Atlas", limit: 1 });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].section, "Theatre Atlas");
});

test("record scorer rejects unrelated records", () => {
  assert.equal(scoreSearchRecord(records[0], "nuclear submarine"), 0);
});
