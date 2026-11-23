import { validatePublicHttps } from "../extractors/article-metadata.mjs";
import { fetchWithRetry } from "./fetch-with-retry.mjs";

const decode = (text) =>
  String(text ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
function field(xml, name) {
  const match = xml.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"),
  );
  return match ? decode(match[1]) : "";
}
export function parseFeed(xml) {
  const blocks = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(
    (match) => match[2],
  );
  return blocks
    .map((item) => {
      const title = field(item, "title");
      const atomLinks = [...item.matchAll(/<link\b([^>]*)\/?>/gi)].map((match) => {
        const attributes = match[1];
        const href = attributes.match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "";
        const rel = attributes.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "alternate";
        const type = attributes.match(/\btype=["']([^"']+)["']/i)?.[1] ?? "";
        return { href, rel, type };
      });
      const preferredAtomLink = atomLinks.find(
        (candidate) => candidate.href && candidate.rel.toLowerCase() === "alternate" &&
          (!candidate.type || /html/i.test(candidate.type)),
      );
      let link = field(item, "link") || preferredAtomLink?.href || atomLinks.find((candidate) => candidate.href)?.href || field(item, "guid");
      const summary =
        field(item, "description") ||
        field(item, "summary") ||
        field(item, "content:encoded");
      const dateText =
        field(item, "pubDate") || field(item, "published") || field(item, "updated");
      const date = dateText ? new Date(dateText) : null;
      const imageUrl =
        item.match(/<enclosure\b[^>]*url=["']([^"']+)["']/i)?.[1] ||
        item.match(/<media:content\b[^>]*url=["']([^"']+)["']/i)?.[1] ||
        null;
      return {
        title,
        url: link,
        summary: summary.slice(0, 1400),
        publishedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
        author: field(item, "author") || field(item, "dc:creator"),
        imageUrl,
      };
    })
    .filter((item) => item.title && /^https?:\/\//i.test(item.url));
}

export async function fetchRssFeed(feed, now = new Date().toISOString()) {
  const source = {
    id: feed.id,
    name: feed.name,
    url: feed.url,
    sourceType: feed.kind === "rss" ? "publisher RSS feed" : "news discovery feed",
    official: Boolean(feed.official),
    defaultStatus: feed.defaultVerification || "unverified",
    language: "en",
    active: true,
    reliabilityNotes: feed.notes,
    termsReviewedAt: null,
    lastCheckedAt: now,
  };
  try {
    const requestUrl = new URL(feed.url);
    if (feed.kind === "discovery-rss")
      requestUrl.searchParams.set(
        "q",
        `${requestUrl.searchParams.get("q") ?? ""} when:7d`,
      );
    await validatePublicHttps(requestUrl);
    const response = await fetchWithRetry(
      requestUrl,
      {
        headers: {
          "User-Agent":
            "RakshaAtlas/1.0 (+public source monitor; contact site operator)",
          Accept: "application/rss+xml,application/atom+xml,application/xml,text/xml",
        },
      },
      { attempts: 3, timeoutMs: 18_000 },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const limitDays = feed.kind === "rss" ? 90 : 14;
    const cutoff = Date.now() - limitDays * 86_400_000;
    const items = parseFeed(await response.text())
      .filter((item) => !item.publishedAt || Date.parse(item.publishedAt) >= cutoff)
      .slice(0, 30);
    source.lastCheck = { status: response.status, ok: true, checkedAt: now };
    return { source, items, error: null };
  } catch (error) {
    source.lastCheck = {
      status: null,
      ok: false,
      checkedAt: now,
      error:
        error.name === "AbortError"
          ? "request timed out"
          : error.message || "feed failed",
    };
    return { source, items: [], error: error.message || "feed failed" };
  }
}
