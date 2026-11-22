export async function collectX(accounts, bearerToken, now = new Date().toISOString()) {
  const configured = (accounts || []).filter(
    (account) => account.active && account.username,
  );
  if (!configured.length)
    return {
      source: null,
      items: [],
      skipped: "Exact public X usernames are not configured yet.",
    };
  if (!bearerToken)
    return {
      source: null,
      items: [],
      skipped: "Set X_BEARER_TOKEN to enable X API collection.",
    };
  const source = {
    id: "x-public-search",
    name: "X public posts (configured accounts)",
    url: "https://x.com/",
    sourceType: "X API v2 recent search",
    official: false,
    defaultStatus: "reported",
    language: "en",
    active: true,
    reliabilityNotes:
      "Public post text/metadata from configured usernames. It is a claim lead, not verification.",
    termsReviewedAt: null,
    lastCheckedAt: now,
  };
  const items = [];
  const errors = [];
  for (const account of configured) {
    const username = account.username.replace(/^@/, "");
    try {
      const url = new URL("https://api.x.com/2/tweets/search/recent");
      url.search = new URLSearchParams({
        query: `from:${username} -is:retweet`,
        max_results: "50",
        "tweet.fields": "created_at,lang,author_id",
      }).toString();
      const response = await fetchWithRetry(
        url,
        { headers: { Authorization: `Bearer ${bearerToken}` } },
        { attempts: 3, timeoutMs: 18_000 },
      );
      if (!response.ok) throw new Error(`X API HTTP ${response.status}`);
      const result = await response.json();
      for (const post of result.data || [])
        items.push({
          title: `@${username}: ${post.text.slice(0, 220)}`,
          summary: post.text.slice(0, 1400),
          url: `https://x.com/${username}/status/${post.id}`,
          publishedAt: post.created_at,
          author: account.displayName,
          mediaType: "X public post",
        });
    } catch (error) {
      errors.push({ username, error: error.message || "X query failed" });
    }
  }
  source.lastCheck = { ok: errors.length === 0, checkedAt: now, errors };
  return { source, items, errors };
}
import { fetchWithRetry } from "./fetch-with-retry.mjs";
