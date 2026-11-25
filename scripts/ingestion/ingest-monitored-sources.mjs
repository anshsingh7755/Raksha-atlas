import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { enrichArticle } from "../server/processors/ai-article-enricher.mjs";
import { extractArticleMetadata } from "../server/extractors/article-metadata.mjs";
import { initializeStore } from "../server/db/store.mjs";
import { fetchRssFeed } from "../server/collectors/rss-collector.mjs";
import {
  canonicalArticleKey,
  findStoryMatch,
} from "../server/processors/deduplicator.mjs";
import { collectYouTube } from "../server/collectors/youtube-collector.mjs";
import { collectX } from "../server/collectors/x-collector.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = (name) => join(root, "server", name);
try {
  const envText = await readFile(join(root, ".env"), "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined)
      process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
} catch {}
const readJson = async (name, fallback) => {
  try {
    return JSON.parse(await readFile(path(name), "utf8"));
  } catch {
    return fallback;
  }
};
const writeJson = (name, value) =>
  writeFile(path(name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const config = await readJson("monitor-sources.json", {
  rssFeeds: [],
  youtube: { active: false },
  xAccounts: [],
});
const state = await readJson("data.json", { articles: [], briefs: [] });
state.articles ??= [];
const sources = await readJson("sources.json", []);
const now = new Date().toISOString();
const runId = `hourly-${Date.now()}`;
const store = await initializeStore({
  seedData: state,
  sources,
  categories: await readJson("categories.json", []),
  feeds: config.rssFeeds,
});
if (store) {
  config.rssFeeds = await store.loadMonitorFeeds();
  const savedArticles = await store.loadArticles();
  if (savedArticles.length) state.articles = savedArticles;
}
function upsertSource(source) {
  const existing = sources.find((item) => item.id === source.id);
  if (existing) {
    existing.lastCheckedAt = now;
    existing.lastCheck = source.lastCheck;
    return;
  }
  sources.push(source);
}
function toCandidate(item, source) {
  return {
    id: `auto-${Buffer.from(`${source.id}|${item.url}`).toString("base64url").slice(0, 48)}`,
    title: item.title.slice(0, 300),
    summary: item.summary.slice(0, 4000),
    contentExcerpt: item.summary.slice(0, 1400),
    canonicalUrl: item.url,
    imageUrl: item.imageUrl || null,
    imageReusePermitted: false,
    imageLicense: "unknown",
    imageAttribution: item.author || source.name || source.id,
    sourceId: source.id,
    sourceByline: item.author || item.channelName || null,
    mediaType: item.mediaType || source.kind,
    topic: "Defence & Security",
    service: null,
    publishedAt: item.publishedAt || null,
    eventAt: null,
    ingestedAt: now,
    // Publisher provenance and claim verification are separate dimensions.
    publisherOfficial: Boolean(source.official),
    verificationStatus: source.official
      ? "unverified"
      : source.defaultVerification ?? source.defaultStatus ?? "unverified",
    reviewState: "unreviewed",
    confidence: source.official
      ? "official publisher provenance; claim remains unreviewed"
      : "unreviewed discovery lead",
    reviewedAt: null,
    correctionOfId: null,
  };
}
const outcomes = await Promise.all(
  config.rssFeeds.filter((item) => item.active).map((feed) => fetchRssFeed(feed, now)),
);
for (const item of outcomes) upsertSource(item.source);
const candidates = outcomes.flatMap(({ source, items }) =>
  items.map((item) => toCandidate(item, source)),
);

const youtube = await collectYouTube(config.youtube, process.env.YOUTUBE_API_KEY, now);
if (youtube.source) {
  upsertSource(youtube.source);
  candidates.push(...youtube.items.map((item) => toCandidate(item, youtube.source)));
} else
  outcomes.push({
    sourceId: "youtube-public-search",
    skipped: youtube.skipped,
  });
if (process.env.YOUTUBE_API_KEY && config.youtube?.searchTerms?.length)
  config.youtube.searchCursor = youtube.nextSearchCursor;
for (const error of youtube.errors || [])
  outcomes.push({ sourceId: "youtube-public-search", ...error });
const x = await collectX(config.xAccounts, process.env.X_BEARER_TOKEN, now);
if (x.source) {
  upsertSource(x.source);
  candidates.push(...x.items.map((item) => toCandidate(item, x.source)));
} else outcomes.push({ sourceId: "x-public-search", skipped: x.skipped });
for (const error of x.errors || [])
  outcomes.push({ sourceId: "x-public-search", ...error });

const seen = new Set(
  state.articles.flatMap((article) => [
    canonicalArticleKey(article),
    ...(article.relatedSources || []).map((source) =>
      canonicalArticleKey({ canonicalUrl: source.url }),
    ),
  ]),
);
const configuredSources = new Map([
  ...config.rssFeeds.map((feed) => [feed.id, feed.defaultVerification]),
  ["youtube-public-search", "reported"],
  ["x-public-search", "reported"],
]);
const officialSourceIds = new Set(
  sources.filter((source) => source.official === true).map((source) => source.id),
);
for (const article of state.articles) {
  article.reviewState ??= "unreviewed";
  if (officialSourceIds.has(article.sourceId)) {
    article.publisherOfficial = true;
    // Older collector records used "official" as a publisher label. Keep claim
    // verification unverified unless an editor has reviewed the record.
    if (article.reviewState === "unreviewed" && article.verificationStatus === "official")
      article.verificationStatus = "unverified";
  }
  if (configuredSources.has(article.sourceId)) {
    article.verificationStatus ??=
      configuredSources.get(article.sourceId) ?? "unverified";
    article.confidence ??=
      article.publisherOfficial
        ? "official publisher provenance; claim remains unreviewed"
        : "unreviewed discovery lead";
  }
}
const freshCandidates = candidates
  .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
  .filter((candidate) => !seen.has(canonicalArticleKey(candidate)));
const enrichmentLimit = Math.max(0, Number(process.env.AI_ENRICH_LIMIT || 30));
const metadataLimit = Math.max(0, Number(process.env.METADATA_EXTRACT_LIMIT || 12));
let metadataExtracted = 0;
let enriched = 0;
let added = 0;
let clustered = 0;
for (const candidate of freshCandidates.slice(0, metadataLimit)) {
  try {
    const metadata = await extractArticleMetadata(candidate.canonicalUrl);
    if (!candidate.title && metadata.title) candidate.title = metadata.title;
    candidate.contentExcerpt ||= metadata.description || "";
    candidate.summary ||= metadata.description || "";
    candidate.sourceByline ||= metadata.author || null;
    candidate.publishedAt ||= metadata.publishedAt || null;
    if (metadata.imageUrl) {
      candidate.imageUrl = metadata.imageUrl;
      candidate.imageAttribution = candidate.sourceByline || candidate.sourceId;
      candidate.imageLicense = "unknown";
      candidate.imageReusePermitted = false;
    }
    candidate.extractionNote = metadata.extractionNote;
    metadataExtracted += 1;
  } catch (error) {
    candidate.metadataExtractionError =
      error.message || "metadata extraction unavailable";
  }
}
for (let index = 0; index < freshCandidates.length; index += 1) {
  const candidate = freshCandidates[index];
  const enrichedRecord = await enrichArticle(candidate, {
    useAI: index < enrichmentLimit,
  });
  Object.assign(candidate, enrichedRecord);
  enriched += candidate.summaryMethod?.startsWith("AI") ? 1 : 0;
}
for (const candidate of freshCandidates) {
  const key = canonicalArticleKey(candidate);
  if (seen.has(key)) continue;
  const possibleMatch = findStoryMatch(candidate, state.articles.slice(0, 1500));
  if (possibleMatch) {
    possibleMatch.relatedSources ??= [];
    if (
      candidate.sourceId &&
      candidate.canonicalUrl &&
      !possibleMatch.relatedSources.some((item) => item.url === candidate.canonicalUrl)
    )
      possibleMatch.relatedSources.push({
        sourceId: candidate.sourceId,
        url: candidate.canonicalUrl,
        title: candidate.title,
        verificationStatus: candidate.verificationStatus,
        publishedAt: candidate.publishedAt,
      });
    possibleMatch.clusteredReportCount = (possibleMatch.clusteredReportCount || 1) + 1;
    seen.add(key);
    clustered += 1;
    continue;
  }
  seen.add(key);
  state.articles.unshift(candidate);
  added += 1;
}
state.articles = state.articles.slice(0, 6000);
await writeJson("sources.json", sources);
await writeJson("monitor-sources.json", config);
await writeJson("data.json", state);
if (store) {
  await store.saveMonitorFeeds(config.rssFeeds);
  await store.saveSources(sources);
  await store.saveArticles(state.articles);
  const failures = outcomes
    .filter((item) => item.error)
    .map((item) => ({
      sourceId: item.source?.id || item.sourceId,
      error: item.error,
    }));
  const succeededSourceIds = outcomes
    .filter((item) => item.source && !item.error)
    .map((item) => item.source.id);
  await store.logPipeline({
    jobId: runId,
    jobType: "hourly-source-ingestion",
    status: failures.length ? "partial" : "succeeded",
    startedAt: now,
    completedAt: new Date().toISOString(),
    metrics: {
      discovered: candidates.length,
      added,
      clustered,
      metadataExtracted,
      aiEnriched: enriched,
      feeds: outcomes.length,
      failures,
      succeededSourceIds,
    },
  });
  await store.close();
}
console.log(
  JSON.stringify(
    {
      ok: outcomes.every((item) => !item.error),
      runId,
      feedCount: config.rssFeeds.filter((item) => item.active).length,
      feeds: outcomes.map((item) => ({
        sourceId: item.source?.id ?? item.sourceId,
        name: item.source?.name,
        status: item.error ? "error" : item.skipped ? "not-configured" : "ok",
        items: item.items?.length ?? 0,
        error: item.error ?? null,
        note: item.skipped ?? null,
      })),
      discovered: candidates.length,
      added,
      clustered,
      metadataExtracted,
      aiEnriched: enriched,
      skippedDuplicates: candidates.length - added - clustered,
      youtubeConfigured: Boolean(process.env.YOUTUBE_API_KEY),
      xAccountsConfigured: config.xAccounts.filter(
        (account) => account.active && account.username,
      ).length,
      xTokenConfigured: Boolean(process.env.X_BEARER_TOKEN),
      databaseEnabled: Boolean(store),
      completedAt: now,
    },
    null,
    2,
  ),
);
