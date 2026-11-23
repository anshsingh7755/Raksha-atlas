import test from "node:test";
import assert from "node:assert/strict";
import {
  canonicalArticleKey,
  headlineSimilarity,
  findStoryMatch,
} from "./deduplicator.mjs";

test("canonical URL removes tracking parameters and fragments", () => {
  assert.equal(
    canonicalArticleKey({ canonicalUrl: "https://example.com/story/?utm_source=feed&fbclid=abc#top" }),
    "https://example.com/story",
  );
});

test("canonical URL sorts query parameters but preserves meaningful parameters", () => {
  const left = canonicalArticleKey({ canonicalUrl: "https://example.com/story?b=2&a=1" });
  const right = canonicalArticleKey({ canonicalUrl: "https://example.com/story?a=1&b=2" });
  assert.equal(left, right);
});

test("PIB release identity is case-insensitive for PRID and relid", () => {
  assert.equal(
    canonicalArticleKey({ canonicalUrl: "https://pib.gov.in/release?prid=123&lang=2" }),
    "release:123",
  );
  assert.equal(
    canonicalArticleKey({ canonicalUrl: "https://pib.gov.in/release?RELID=123" }),
    "release:123",
  );
});

test("headline similarity finds the same story despite publisher wording", () => {
  assert.ok(
    headlineSimilarity(
      "India signs contract for new naval helicopters",
      "New naval helicopters contract for India signs",
    ) > 0.5,
  );
});

test("story matcher returns a likely duplicate and leaves unrelated stories separate", () => {
  const existing = [{ title: "India signs contract for new naval helicopters" }];
  assert.equal(
    findStoryMatch({ title: "New naval helicopters contract for India signs" }, existing),
    existing[0],
  );
  assert.equal(
    findStoryMatch({ title: "Monsoon rainfall forecast released for northern states" }, existing),
    null,
  );
});
