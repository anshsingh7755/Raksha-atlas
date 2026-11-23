import test from "node:test";
import assert from "node:assert/strict";
import { parseFeed } from "./rss-collector.mjs";

test("parses RSS title, publisher link, summary and publication date", () => {
  const xml = `<?xml version="1.0"?>
    <rss><channel><item>
      <title>Defence contract announced</title>
      <link>https://publisher.example/story?id=10</link>
      <description><![CDATA[<p>Official release summary.</p>]]></description>
      <pubDate>Mon, 23 Nov 2026 10:00:00 GMT</pubDate>
    </item></channel></rss>`;
  const [item] = parseFeed(xml);
  assert.equal(item.title, "Defence contract announced");
  assert.equal(item.url, "https://publisher.example/story?id=10");
  assert.equal(item.summary, "Official release summary.");
  assert.equal(item.publishedAt, "2026-11-23T10:00:00.000Z");
});

test("prefers Atom alternate HTML link over self link", () => {
  const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><entry>
    <title>Naval platform update</title>
    <link rel="self" href="https://publisher.example/feed/item/1" type="application/atom+xml" />
    <link rel="alternate" href="https://publisher.example/news/naval-platform" type="text/html" />
    <summary>Public update.</summary>
    <published>2026-11-23T10:00:00Z</published>
  </entry></feed>`;
  const [item] = parseFeed(xml);
  assert.equal(item.url, "https://publisher.example/news/naval-platform");
  assert.equal(item.title, "Naval platform update");
  assert.equal(item.summary, "Public update.");
});

test("ignores malformed entries without a valid HTTP(S) URL", () => {
  const xml = `<rss><channel>
    <item><title>No link</title><description>Missing URL</description></item>
    <item><title>Valid link</title><link>https://publisher.example/story</link></item>
  </channel></rss>`;
  assert.equal(parseFeed(xml).length, 1);
});
