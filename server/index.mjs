import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { answerWithRag } from "./rag.mjs";
import { initializeStore } from "./db/store.mjs";
import { startScheduler } from "./scheduler/hourly-scheduler.mjs";
import { runNewsWorker } from "./workers/news-worker.mjs";
import { validatePublicHttps } from "./extractors/article-metadata.mjs";
import { enrichArticle } from "./processors/ai-article-enricher.mjs";

const root = dirname(fileURLToPath(import.meta.url));
for (const line of (existsSync(join(root, "..", ".env"))
  ? readFileSync(join(root, "..", ".env"), "utf8")
  : ""
).split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (match && process.env[match[1]] === undefined)
    process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
}
const execFileAsync = promisify(execFile);
const dataPath = join(root, "data.json");
const sourcesPath = join(root, "sources.json");
const revisionsPath = join(root, "revisions.json");
const inventoryPath = join(root, "inventory.json");
const timelinesPath = join(root, "timelines.json");
const procurementPath = join(root, "procurement-2026.json");
const frigatesPath = join(root, "frigates.json");
const platformRegisterPath = join(root, "platform-register.json");
const wikiEquipmentPath = join(root, "wikipedia-equipment.json");
const historyPath = join(root, "history.json");
const equipmentCatalogPath = join(root, "equipment-catalog.json");
const futureProcurementPath = join(root, "future-procurement.json");
const port = Number(process.env.PORT || 8787);
const verificationStatuses = [
  "official",
  "verified",
  "reported",
  "unverified",
  "disputed",
  "corrected",
  "withdrawn",
];
const reviewStates = ["unreviewed", "in_review", "approved", "rejected"];
const chatRequestWindows = new Map();

const initialData = {
  updatedAt: new Date().toISOString(),
  lastRefresh: null,
  nextRefresh: "Hourly news · full reference refresh 04:00 IST",
  briefs: [
    {
      id: "pralay-notam-2026-11-04",
      title: "Pralay test signal: NOTAM window observed",
      status: "reported",
      confidence: "low",
      summary:
        "A public report links a 595 km NOTAM in the Odisha test corridor with a possible Pralay flight between 3–5 November. No primary DRDO or Ministry of Defence release has been located here.",
      sourceUrls: [
        "https://idrw.org/india-pralay-missile-test-odisha-595km-notam/",
        "https://www.thedefensenews.com/India-Successfully-Tests-Pralay-Quasi-Ballistic-Missile-with-500-km-Range/",
        "https://www.pib.gov.in/",
      ],
      createdAt: new Date().toISOString(),
    },
  ],
  articles: [],
};

function readData() {
  if (!existsSync(dataPath)) {
    mkdirSync(root, { recursive: true });
    writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
  const data = JSON.parse(readFileSync(dataPath, "utf8"));
  data.briefs = Array.isArray(data.briefs) ? data.briefs : [];
  data.articles = Array.isArray(data.articles) ? data.articles : [];
  return data;
}

let store = null;
const monitorConfigPath = join(root, "monitor-sources.json");
const storeReady = initializeStore({
  seedData: readData(),
  sources: JSON.parse(readFileSync(sourcesPath, "utf8")),
  categories: JSON.parse(readFileSync(join(root, "categories.json"), "utf8")),
  feeds: JSON.parse(readFileSync(monitorConfigPath, "utf8")).rssFeeds,
}).then((instance) => {
  store = instance;
  return instance;
});

async function loadData() {
  await storeReady;
  const data = readData();
  data.nextRefresh = "Hourly news · full reference refresh 04:00 IST";
  if (store) data.articles = await store.loadArticles();
  return data;
}

async function saveData(data) {
  data.updatedAt = new Date().toISOString();
  writeFileSync(dataPath, JSON.stringify(data, null, 2));
  await storeReady;
  if (store) await store.saveArticles(data.articles);
}

function normalizeArticle(input, sourceIds) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const canonicalUrl =
    typeof input.canonicalUrl === "string" ? input.canonicalUrl.trim() : "";
  const sourceId = typeof input.sourceId === "string" ? input.sourceId : "";
  if (!title || !canonicalUrl || !sourceIds.has(sourceId))
    return {
      error: "title, canonicalUrl and a registered sourceId are required",
    };
  try {
    new URL(canonicalUrl);
  } catch {
    return { error: "canonicalUrl must be a valid URL" };
  }
  const verificationStatus = input.verificationStatus || "unverified";
  const reviewState = input.reviewState || "unreviewed";
  if (!verificationStatuses.includes(verificationStatus))
    return { error: "unsupported verificationStatus" };
  if (!reviewStates.includes(reviewState)) return { error: "unsupported reviewState" };
  return {
    id: typeof input.id === "string" && input.id ? input.id : `article-${Date.now()}`,
    title: title.slice(0, 300),
    summary:
      typeof input.summary === "string" ? input.summary.trim().slice(0, 4000) : "",
    contentExcerpt:
      typeof input.contentExcerpt === "string"
        ? input.contentExcerpt.trim().slice(0, 1400)
        : "",
    canonicalUrl,
    sourceId,
    sourceByline:
      typeof input.sourceByline === "string"
        ? input.sourceByline.trim().slice(0, 160)
        : null,
    mediaType:
      typeof input.mediaType === "string" ? input.mediaType.trim().slice(0, 80) : null,
    topic: typeof input.topic === "string" ? input.topic.trim().slice(0, 80) : null,
    service:
      typeof input.service === "string" ? input.service.trim().slice(0, 80) : null,
    publishedAt: input.publishedAt || null,
    eventAt: input.eventAt || null,
    ingestedAt: input.ingestedAt || new Date().toISOString(),
    verificationStatus,
    reviewState,
    confidence: typeof input.confidence === "string" ? input.confidence : "unknown",
    reviewedAt: input.reviewedAt || null,
    correctionOfId: input.correctionOfId || null,
  };
}

function readSources() {
  return JSON.parse(readFileSync(sourcesPath, "utf8"));
}

function readInventory() {
  return JSON.parse(readFileSync(inventoryPath, "utf8"));
}

function readTimelines() {
  return JSON.parse(readFileSync(timelinesPath, "utf8"));
}

function readProgrammeDossier() {
  const file = join(root, "programmes.json");
  const register = JSON.parse(readFileSync(file, "utf8"));
  return (register.records ?? []).map((record) => ({
    id: record.id,
    title: record.name,
    service: record.serviceDomain,
    stage: record.stageLabel,
    summary: record.summary,
    details: record.dossierText,
    sourceUrls: (record.sources ?? []).map((source) => source.url),
    sourceCount: (record.sources ?? []).length,
    status: record.status,
    quantity: record.quantity,
    quantityType: record.quantityType,
    quantityConfidence: record.quantityConfidence,
    evidenceQuality: record.evidenceQuality,
    sourceRecords: record.sources ?? [],
    lastVerifiedAt: record.lastVerifiedAt,
  }));
}

function readProcurement() {
  return JSON.parse(readFileSync(procurementPath, "utf8"));
}

function readFrigates() {
  return JSON.parse(readFileSync(frigatesPath, "utf8"));
}

function readPlatformRegister() {
  return JSON.parse(readFileSync(platformRegisterPath, "utf8"));
}

function readWikipediaEquipment() {
  return JSON.parse(readFileSync(wikiEquipmentPath, "utf8"));
}
function readEquipmentCatalog() {
  return JSON.parse(readFileSync(equipmentCatalogPath, "utf8"));
}
function readFutureProcurement() {
  return JSON.parse(readFileSync(futureProcurementPath, "utf8"));
}
function readHistory() {
  return JSON.parse(readFileSync(historyPath, "utf8"));
}

async function saveSources(sources) {
  writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
  await storeReady;
  if (store) await store.saveSources(sources);
}

async function recordArticleRevision(revision) {
  await storeReady;
  if (store) return store.addArticleRevision(revision);
  let revisions = [];
  try {
    revisions = JSON.parse(readFileSync(revisionsPath, "utf8"));
  } catch {}
  revisions.unshift({ ...revision, createdAt: new Date().toISOString() });
  writeFileSync(revisionsPath, JSON.stringify(revisions.slice(0, 10000), null, 2));
}

async function checkRegisteredSource(sourceId) {
  const sources = store ? await store.loadSources() : readSources();
  const source = sources.find((item) => item.id === sourceId);
  if (!source) return { error: "registered source not found", status: 404 };
  const allowedSourceIds = new Set(["pib-mod", "pib-defence-security", "drdo", "idrw"]);
  if (!allowedSourceIds.has(sourceId))
    return {
      error: "source adapter is not enabled for this registry entry",
      status: 400,
    };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  const checkedAt = new Date().toISOString();
  try {
    const result = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RakshaAtlasSourceCheck/0.1 (public research prototype)",
      },
    });
    source.lastCheckedAt = checkedAt;
    source.lastCheck = { status: result.status, ok: result.ok, checkedAt };
    await saveSources(sources);
    return { source, status: 200 };
  } catch (error) {
    source.lastCheckedAt = checkedAt;
    source.lastCheck = {
      status: null,
      ok: false,
      checkedAt,
      error: error.name === "AbortError" ? "timeout" : "request_failed",
    };
    await saveSources(sources);
    return { source, status: 200 };
  } finally {
    clearTimeout(timeout);
  }
}

function send(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin":
      process.env.CORS_ORIGIN || process.env.PUBLIC_SITE_URL || "*",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

async function refresh({ includeMonitor = true } = {}) {
  const attemptedAt = new Date().toISOString();
  const [result, referenceSync] = await Promise.all([
    ingestPibDefenceMetadata(),
    (async () => {
      try {
        const { stdout } = await execFileAsync(
          process.execPath,
          [join(root, "scripts", "refresh-public-data.mjs")],
          { cwd: root, timeout: 240_000, maxBuffer: 4 * 1024 * 1024 },
        );
        return JSON.parse(stdout);
      } catch (error) {
        return {
          ok: false,
          pages: 0,
          failedSourceIds: [],
          error: error.message || "reference sync failed",
        };
      }
    })(),
  ]);
  const ok = result.status === 200;
  let monitoredSync = {
    ok: true,
    skipped: true,
    note: "Hourly news monitor runs as a separate scheduled task.",
  };
  if (includeMonitor)
    try {
      const { stdout } = await execFileAsync(
        process.execPath,
        [join(root, "scripts", "ingest-monitored-sources.mjs")],
        { cwd: root, timeout: 240_000, maxBuffer: 4 * 1024 * 1024 },
      );
      monitoredSync = JSON.parse(stdout);
    } catch (error) {
      monitoredSync = {
        ok: false,
        error: error.message || "monitored source sync failed",
      };
    }
  const data = await loadData();
  data.lastRefreshAttemptAt = attemptedAt;
  data.lastRefreshResult = {
    ok: ok && referenceSync.ok && monitoredSync.ok,
    sourceId: "pib-defence-security",
    discovered: result.discovered ?? 0,
    created: result.created ?? 0,
    error: result.error ?? null,
    referenceSync,
    monitoredSync,
  };
  if (includeMonitor) {
    data.lastRagSyncAt = monitoredSync.completedAt ?? new Date().toISOString();
    data.lastRagSyncResult = monitoredSync;
  }
  if (ok) data.lastRefresh = attemptedAt;
  await saveData(data);
  if (store)
    await store.logPipeline({
      jobId: `daily-${Date.now()}`,
      jobType: "daily-reference-refresh",
      status: data.lastRefreshResult.ok ? "succeeded" : "partial",
      startedAt: attemptedAt,
      completedAt: new Date().toISOString(),
      metrics: data.lastRefreshResult,
      error: data.lastRefreshResult.ok
        ? null
        : JSON.stringify(data.lastRefreshResult).slice(0, 2000),
    });
  return {
    ...data.lastRefreshResult,
    attemptedAt,
    lastRefresh: data.lastRefresh,
  };
}

function extractPibReleases(html) {
  const releases = [];
  const seen = new Set();
  const linkPattern =
    /<a\b[^>]*href=["']([^"']*(?:PressReleaseDetail\.aspx\?PRID=|PressNoteDetails\.aspx\?)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(linkPattern)) {
    const url = new URL(match[1], "https://pib.gov.in/").toString();
    const title = match[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!title || seen.has(url)) continue;
    seen.add(url);
    releases.push({ url, title: title.slice(0, 300) });
  }
  return releases.slice(0, 50);
}

function parsePibDate(value) {
  const match = value.match(/(\d{2})-([A-Za-z]+)\s+(\d{4})/);
  if (!match) return null;
  const date = new Date(`${match[2]} ${match[1]}, ${match[3]} 12:00:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function extractPibDefenceReleases(html) {
  const releases = [];
  const seen = new Set();
  const itemPattern =
    /<li\b[^>]*class=['"][^'"]*rel-list[^'"]*['"][^>]*id=['"](\d+)['"][^>]*onclick=['"]Getrelease\(\1\)['"][^>]*>([\s\S]*?)<\/li>/gi;
  for (const match of html.matchAll(itemPattern)) {
    const text = match[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const dateMatch = text.match(/\((\d{2}-[A-Za-z]+\s+\d{4})\)/);
    const title = text.replace(/\s*\(\d{2}-[A-Za-z]+\s+\d{4}\)/, "").trim();
    const releaseId = match[1];
    if (!title || seen.has(releaseId)) continue;
    seen.add(releaseId);
    releases.push({
      releaseId,
      title: title.slice(0, 300),
      publishedAt: dateMatch ? parsePibDate(dateMatch[1]) : null,
      url: `https://www.pib.gov.in/newsite/erelcontent.aspx?relid=${releaseId}&reg=48&lang=2`,
    });
  }
  return releases;
}

async function ingestPibMetadata() {
  const sources = store ? await store.loadSources() : readSources();
  const source = sources.find((item) => item.id === "pib-mod");
  if (!source) return { error: "registered PIB source not found", status: 404 };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const result = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RakshaAtlasSourceAdapter/0.1 (public research prototype)",
      },
    });
    if (!result.ok) return { error: `PIB returned HTTP ${result.status}`, status: 502 };
    const releases = extractPibReleases(await result.text());
    const data = await loadData();
    const existing = new Set(data.articles.map((article) => article.canonicalUrl));
    const created = releases
      .filter((release) => !existing.has(release.url))
      .map((release) => ({
        id: `pib-${createHash("sha256").update(release.url).digest("hex").slice(0, 24)}`,
        title: release.title,
        canonicalUrl: release.url,
        sourceId: "pib-mod",
        verificationStatus: "unverified",
        reviewState: "unreviewed",
        publishedAt: null,
        ingestedAt: new Date().toISOString(),
      }));
    data.articles.unshift(...created);
    await saveData(data);
    source.lastIngestAt = new Date().toISOString();
    source.lastIngest = {
      ok: true,
      discovered: releases.length,
      created: created.length,
    };
    await saveSources(sources);
    return {
      status: 200,
      discovered: releases.length,
      created: created.length,
      items: created,
    };
  } catch (error) {
    return {
      error:
        error.name === "AbortError" ? "PIB request timed out" : "PIB request failed",
      status: 502,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function ingestPibDefenceMetadata() {
  const sources = store ? await store.loadSources() : readSources();
  const source = sources.find((item) => item.id === "pib-defence-security");
  if (!source) return { error: "registered PIB Defence source not found", status: 404 };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const result = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RakshaAtlasSourceAdapter/0.1 (public research prototype)",
      },
    });
    if (!result.ok)
      return {
        error: `PIB Defence index returned HTTP ${result.status}`,
        status: 502,
      };
    const releases = extractPibDefenceReleases(await result.text());
    const data = await loadData();
    const existing = new Set(data.articles.map((article) => article.canonicalUrl));
    const created = releases
      .filter((release) => !existing.has(release.url))
      .map((release) => ({
        id: `pib-defence-${release.releaseId}`,
        title: release.title,
        canonicalUrl: release.url,
        sourceId: "pib-defence-security",
        topic: "Defence & Security",
        service: null,
        verificationStatus: "official",
        reviewState: "unreviewed",
        confidence: "high",
        publishedAt: release.publishedAt,
        eventAt: release.publishedAt,
        ingestedAt: new Date().toISOString(),
      }));
    for (const release of releases) {
      const existingArticle = data.articles.find(
        (article) => article.canonicalUrl === release.url,
      );
      if (existingArticle) {
        existingArticle.title = release.title;
        existingArticle.publishedAt = release.publishedAt;
        existingArticle.eventAt = release.publishedAt;
      }
    }
    data.articles.unshift(...created);
    await saveData(data);
    source.lastIngestAt = new Date().toISOString();
    source.lastIngest = {
      ok: true,
      discovered: releases.length,
      created: created.length,
    };
    source.lastCheckedAt = source.lastIngestAt;
    source.lastCheck = {
      status: result.status,
      ok: true,
      checkedAt: source.lastCheckedAt,
    };
    await saveSources(sources);
    return {
      status: 200,
      discovered: releases.length,
      created: created.length,
      items: created,
    };
  } catch (error) {
    source.lastCheckedAt = new Date().toISOString();
    source.lastCheck = {
      status: null,
      ok: false,
      checkedAt: source.lastCheckedAt,
      error: error.name === "AbortError" ? "timeout" : "request_failed",
    };
    await saveSources(sources);
    return {
      error:
        error.name === "AbortError"
          ? "PIB Defence request timed out"
          : "PIB Defence request failed",
      status: 502,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runScheduledHourly() {
  const startedAt = new Date().toISOString();
  try {
    const result = await runNewsWorker();
    const data = await loadData();
    data.lastRagSyncAt = result.completedAt;
    data.lastRagSyncResult = result;
    data.nextRefresh = "Hourly · IST";
    await saveData(data);
    return result;
  } catch (error) {
    if (store)
      await store.logPipeline({
        jobId: `hourly-failed-${Date.now()}`,
        jobType: "hourly-source-ingestion",
        status: "failed",
        startedAt,
        completedAt: new Date().toISOString(),
        metrics: {},
        error: error.message || "hourly worker failed",
      });
    throw error;
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin":
        process.env.CORS_ORIGIN || process.env.PUBLIC_SITE_URL || "*",
      Vary: "Origin",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    });
    response.end();
    return;
  }

  const url = new URL(
    request.url || "/",
    `http://${request.headers.host || "localhost"}`,
  );
  if (
    ["POST", "PATCH", "DELETE"].includes(request.method) &&
    url.pathname !== "/api/chat" &&
    process.env.NODE_ENV === "production"
  ) {
    const expectedToken = process.env.RAKSHA_ADMIN_TOKEN;
    if (!expectedToken) {
      send(response, 503, {
        error: "write endpoints are disabled until RAKSHA_ADMIN_TOKEN is configured",
      });
      return;
    }
    if (request.headers.authorization !== "Bearer " + expectedToken) {
      send(response, 401, { error: "authorization required" });
      return;
    }
  }

  const data = await loadData();

  if (request.method === "GET" && url.pathname === "/") {
    send(response, 200, {
      service: "raksha-atlas-api",
      status: "online",
      website: "http://127.0.0.1:5173/#overview",
      health: "http://127.0.0.1:8787/api/health",
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/health") {
    send(response, 200, {
      ok: true,
      service: "raksha-atlas-api",
      storage: store ? "postgresql" : "json-file",
      updatedAt: data.updatedAt,
      lastRefresh: data.lastRefresh,
      lastRefreshAttemptAt: data.lastRefreshAttemptAt ?? null,
      lastRefreshResult: data.lastRefreshResult ?? null,
      lastRagSyncAt: data.lastRagSyncAt ?? null,
      lastRagSyncResult: data.lastRagSyncResult ?? null,
      nextRefresh: data.nextRefresh,
      refreshScope:
        "Hourly configured public RSS/news discovery and optional YouTube/X APIs; 04:00 IST PIB metadata and public reference refresh; all collected leads retain source and review labels",
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/rag/status") {
    const config = JSON.parse(readFileSync(join(root, "monitor-sources.json"), "utf8"));
    const activeFeeds = store ? await store.loadMonitorFeeds() : config.rssFeeds;
    send(response, 200, {
      modelConfigured: Boolean(process.env.OPENAI_API_KEY),
      webSearchEnabled: process.env.RAG_WEB_SEARCH !== "false",
      model: process.env.OPENAI_MODEL || "gpt-6-astra",
      summaryModel: process.env.OPENAI_SUMMARY_MODEL || "gpt-6-luna",
      aiEnrichLimit: Number(process.env.AI_ENRICH_LIMIT || 10),
      metadataExtractLimit: Number(process.env.METADATA_EXTRACT_LIMIT || 12),
      youtubeSearchesPerRun: Number(process.env.YOUTUBE_SEARCHES_PER_RUN || 1),
      youtubeConfigured: Boolean(process.env.YOUTUBE_API_KEY),
      xConfigured: Boolean(process.env.X_BEARER_TOKEN),
      rssFeeds: activeFeeds.filter((item) => item.active).length,
      xAccountsConfigured: config.xAccounts.filter(
        (item) => item.active && item.username,
      ).length,
      database: store ? await store.status() : { enabled: false, mode: "json-file" },
      categories: JSON.parse(readFileSync(join(root, "categories.json"), "utf8"))
        .length,
      lastSyncAt: data.lastRagSyncAt ?? null,
      lastSyncResult: data.lastRagSyncResult ?? null,
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/categories") {
    const items = JSON.parse(
      readFileSync(join(root, "categories.json"), "utf8"),
    ).filter((item) => item.active !== false);
    send(response, 200, { items, count: items.length });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/pipeline/logs") {
    send(response, 200, {
      items: store
        ? await store.listPipelineLogs(url.searchParams.get("limit"))
        : data.lastRagSyncResult
          ? [data.lastRagSyncResult]
          : [],
      storage: store ? "postgresql" : "json-file",
    });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/chat") {
    const clientKey =
      process.env.TRUST_PROXY === "true"
        ? String(
            request.headers["x-forwarded-for"] ||
              request.socket.remoteAddress ||
              "unknown",
          )
            .split(",")[0]
            .trim()
        : request.socket.remoteAddress || "unknown";
    const nowMs = Date.now();
    const windowState = chatRequestWindows.get(clientKey);
    if (!windowState || nowMs - windowState.startedAt >= 60_000)
      chatRequestWindows.set(clientKey, { startedAt: nowMs, count: 1 });
    else if (windowState.count >= 12) {
      send(response, 429, {
        error: "Chat request limit reached. Please wait a minute and try again.",
      });
      return;
    } else windowState.count += 1;
    if (chatRequestWindows.size > 1000)
      for (const [key, value] of chatRequestWindows)
        if (nowMs - value.startedAt >= 60_000) chatRequestWindows.delete(key);
    let raw = "";
    for await (const chunk of request) {
      raw += chunk;
      if (raw.length > 6000) break;
    }
    try {
      if (raw.length > 6000) {
        send(response, 413, { error: "question too long" });
        return;
      }
      const input = JSON.parse(raw);
      const question =
        typeof input.question === "string" ? input.question.trim().slice(0, 1500) : "";
      if (!question) {
        send(response, 400, { error: "question is required" });
        return;
      }
      const articles = store ? await store.loadArticles() : undefined;
      const answer = await answerWithRag(question, { articles });
      send(response, 200, answer);
    } catch (error) {
      send(response, 502, {
        error: error.message || "Unable to generate a sourced answer",
      });
    }
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/briefs") {
    send(response, 200, { items: data.briefs, updatedAt: data.updatedAt });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/articles") {
    const service = url.searchParams.get("service");
    const topic = url.searchParams.get("topic");
    const categoryId = url.searchParams.get("categoryId");
    const searchQuery = url.searchParams.get("q")?.trim().toLowerCase();
    const sourceId = url.searchParams.get("sourceId");
    const verificationStatus = url.searchParams.get("verificationStatus");
    const reviewState = url.searchParams.get("reviewState");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const items = data.articles.filter((article) => {
      if (!reviewState && article.reviewState === "rejected") return false;
      if (service && article.service !== service) return false;
      if (topic && article.topic !== topic) return false;
      if (categoryId && article.categoryId !== categoryId) return false;
      if (
        searchQuery &&
        !`${article.title} ${article.summary || ""} ${article.sourceId} ${(article.keywords || []).join(" ")}`
          .toLowerCase()
          .includes(searchQuery)
      )
        return false;
      if (sourceId && article.sourceId !== sourceId) return false;
      if (verificationStatus && article.verificationStatus !== verificationStatus)
        return false;
      if (reviewState && article.reviewState !== reviewState) return false;
      if (from && (!article.publishedAt || article.publishedAt < from)) return false;
      if (to && (!article.publishedAt || article.publishedAt > to)) return false;
      return true;
    });
    send(response, 200, {
      items,
      count: items.length,
      filters: {
        service,
        topic,
        categoryId,
        q: searchQuery,
        sourceId,
        verificationStatus,
        reviewState,
        from,
        to,
      },
      updatedAt: data.updatedAt,
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/contracts") {
    send(response, 200, { verificationStatuses, reviewStates });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/reference/equipment") {
    const data = readWikipediaEquipment();
    const sourceId = url.searchParams.get("sourceId");
    const pages = sourceId
      ? data.pages.filter((page) => page.id === sourceId)
      : data.pages;
    send(response, 200, {
      generatedAt: data.generatedAt,
      method: data.method,
      pages,
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/equipment-catalog") {
    const catalog = readEquipmentCatalog();
    const service = url.searchParams.get("service");
    const status = url.searchParams.get("status");
    const domain = url.searchParams.get("domain");
    const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const items = catalog.records.filter(
      (item) =>
        (!service || item.service.toLowerCase().includes(service.toLowerCase())) &&
        (!status || item.lifecycleStatus === status) &&
        (!domain || item.domain === domain) &&
        (!query ||
          `${item.name} ${item.variant ?? ""} ${item.section} ${item.subgroup ?? ""} ${item.role ?? ""} ${item.quantityText ?? ""}`
            .toLowerCase()
            .includes(query)),
    );
    send(response, 200, {
      asOf: catalog.asOf,
      generatedAt: catalog.generatedAt,
      limitations: catalog.limitations,
      summary: catalog.summary,
      items,
      count: items.length,
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/future-procurement") {
    const data = readFutureProcurement();
    const service = url.searchParams.get("service");
    const stage = url.searchParams.get("stage");
    const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const items = data.records.filter(
      (item) =>
        (!service || item.service.toLowerCase().includes(service.toLowerCase())) &&
        (!stage || item.stage.toLowerCase().includes(stage.toLowerCase())) &&
        (!query ||
          `${item.system} ${item.service} ${item.notes}`.toLowerCase().includes(query)),
    );
    send(response, 200, {
      asOf: data.asOf,
      description: data.description,
      items,
      count: items.length,
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/history") {
    const data = readHistory();
    const status = url.searchParams.get("verificationStatus");
    const items = status
      ? data.items.filter((item) => item.verificationStatus === status)
      : data.items;
    send(response, 200, {
      asOf: data.asOf,
      scope: data.scope,
      count: items.length,
      items,
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/search") {
    const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    if (query.length < 2) {
      send(response, 200, { query, count: 0, results: [] });
      return;
    }
    const terms = query.split(/\\s+/).filter(Boolean);
    const results = [];
    const add = (section, view, id, title, summary, haystack) => {
      const textValue = String(haystack ?? "").toLowerCase();
      if (!terms.every((term) => textValue.includes(term))) return;
      const titleValue = String(title ?? "").toLowerCase();
      const score = (titleValue === query ? 100 : titleValue.startsWith(query) ? 60 : titleValue.includes(query) ? 35 : 0) + terms.length * 3;
      results.push({ section, view, id: String(id ?? title), title: String(title ?? "Untitled"), summary: String(summary ?? "").slice(0, 220), score });
    };
    for (const item of readInventory()) add("Inventory", "inventory", item.id, item.platform, item.definition || item.role, [item.platform,item.service,item.category,item.role,item.variant,item.manufacturer,item.originCountry,item.definition,item.capabilitySummary,Object.values(item.technicalProfile ?? {}).join(" ")].join(" "));
    for (const item of readProgrammeDossier()) add("Programmes", "programmes", item.id, item.title, item.summary, [item.title,item.service,item.stage,item.summary,item.details].join(" "));
    for (const item of data.articles ?? []) if (item.reviewState !== "rejected") add("News & articles", "signals", item.id, item.title, item.summary, [item.title,item.summary,item.sourceId,item.topic,(item.keywords ?? []).join(" ")].join(" "));
    for (const item of readTimelines()) add("Programme timelines", "timeline", item.id, item.programme, item.summary || item.description, [item.programme,item.service,item.stage,item.summary,item.description].join(" "));
    for (const item of readProcurement()) add("Procurement", "pipeline", item.id, item.title || item.programme || item.name, item.summary || item.notes, JSON.stringify(item));
    for (const item of readPlatformRegister()) add("Platform classes", "register", item.className, item.className, item.role || item.platform, [item.className,item.platform,item.category,item.role,item.origin,item.futureOrders].join(" "));
    for (const item of readSources()) add("Sources", "sources", item.id, item.name || item.title || item.id, item.description || item.publisher || item.url, [item.id,item.name,item.title,item.description,item.publisher,item.url].join(" "));
    results.sort((a,b) => b.score-a.score || a.title.localeCompare(b.title));
    const limited = results.slice(0, 40).map(({score,...item}) => item);
    send(response, 200, { query, count: limited.length, results: limited });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/inventory") {
    const service = url.searchParams.get("service");
    const category = url.searchParams.get("category");
    const quantityStatus = url.searchParams.get("quantityStatus");
    const originCountry = url.searchParams.get("originCountry");
    const classImages = readPlatformRegister();
    const items = readInventory().filter(
      (item) =>
        (!service || item.service === service) &&
        (!category || item.category === category) &&
        (!quantityStatus || item.quantityStatus === quantityStatus) &&
        (!originCountry || item.originCountry === originCountry),
    ).map((item) => {
      if (item.imageUrl) return item;
      const normalize = (value) => String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
      const platform = normalize(item.platform);
      const match = classImages.find((entry) => {
        const className = normalize(entry.className);
        const platformName = normalize(entry.platform);
        return (className && (platform.includes(className) || className.includes(platform))) ||
          (platformName && (platform.includes(platformName) || platformName.includes(platform)));
      });
      return match?.imageUrl ? { ...item, imageUrl: match.imageUrl } : item;
    });
    send(response, 200, {
      items,
      count: items.length,
      filters: { service, category, quantityStatus, originCountry },
      asOf: "2026-11-04",
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/inventory/frigates") {
    const items = readFrigates();
    send(response, 200, {
      items,
      count: items.reduce((total, item) => total + item.ships.length, 0),
      classCount: items.length,
      source: "wiki-active-navy-ships",
      asOf: "2026-11-04",
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/inventory/register") {
    const category = url.searchParams.get("category");
    const service = url.searchParams.get("service");
    const items = readPlatformRegister().filter(
      (item) =>
        (!category || item.category === category) &&
        (!service || item.service === service),
    );
    send(response, 200, {
      items,
      count: items.length,
      filters: { category, service },
      asOf: "2026-11-04",
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/programmes") {
    const service = url.searchParams.get("service");
    const query = (url.searchParams.get("q") ?? "").toLowerCase();
    const items = readProgrammeDossier().filter((item) =>
      (!service || service === "all" || item.service === service) &&
      (!query || (item.title + " " + item.summary + " " + item.details).toLowerCase().includes(query)),
    );
    send(response, 200, { items, count: items.length, asOf: "2026-11-23", sourceDocument: "/docs/intelligence/FUTURE-PROGRAMMES-ACQUISITION-DOSSIER.md" });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/timelines") {
    const service = url.searchParams.get("service");
    const items = readTimelines().filter(
      (item) => !service || item.service === service,
    );
    send(response, 200, { items, count: items.length, filters: { service } });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/procurement-2026") {
    const scope = url.searchParams.get("scope");
    const status = url.searchParams.get("status");
    const items = readProcurement().filter(
      (item) => (!scope || item.scope === scope) && (!status || item.status === status),
    );
    send(response, 200, {
      items,
      count: items.length,
      asOf: "2026-11-04",
      filters: { scope, status },
    });
    return;
  }
  if (request.method === "GET" && url.pathname === "/api/sources") {
    send(response, 200, {
      items: store ? await store.loadSources() : readSources(),
      verificationStatuses: [
        "official",
        "verified",
        "reported",
        "unverified",
        "disputed",
        "corrected",
        "withdrawn",
      ],
    });
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/monitor-sources") {
    let raw = "";
    for await (const chunk of request) {
      raw += chunk;
      if (raw.length > 12000) break;
    }
    try {
      if (raw.length > 12000) {
        send(response, 413, { error: "request too large" });
        return;
      }
      const input = JSON.parse(raw);
      const name =
        typeof input.name === "string" ? input.name.trim().slice(0, 120) : "";
      const feedUrl = typeof input.url === "string" ? input.url.trim() : "";
      if (!name || !feedUrl) {
        send(response, 400, { error: "name and RSS URL are required" });
        return;
      }
      const parsedUrl = new URL(feedUrl);
      await validatePublicHttps(parsedUrl);
      const configPath = monitorConfigPath;
      const config = JSON.parse(readFileSync(configPath, "utf8"));
      if (store) config.rssFeeds = await store.loadMonitorFeeds();
      if (
        config.rssFeeds.some(
          (feed) => feed.url === parsedUrl.href || feed.url === feedUrl,
        )
      ) {
        send(response, 409, { error: "this feed URL is already configured" });
        return;
      }
      const idBase =
        name
          .toLowerCase()
          .normalize("NFKD")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 50) || "public-feed";
      let id = `user-${idBase}`;
      let suffix = 2;
      while (config.rssFeeds.some((feed) => feed.id === id))
        id = `user-${idBase}-${suffix++}`;
      const feed = {
        id,
        name,
        url: parsedUrl.href,
        official: false,
        defaultVerification: "unverified",
        kind: input.discovery === true ? "discovery-rss" : "rss",
        active: true,
        notes:
          "Operator-added public RSS feed. Items are unverified discovery leads until reviewed.",
      };
      config.rssFeeds.push(feed);
      writeFileSync(configPath, JSON.stringify(config, null, 2));
      if (store) await store.saveMonitorFeeds(config.rssFeeds);
      const sources = store ? await store.loadSources() : readSources();
      sources.push({
        id,
        name,
        url: parsedUrl.href,
        sourceType: "operator-added RSS",
        official: false,
        defaultStatus: "unverified",
        language: "en",
        active: true,
        reliabilityNotes: feed.notes,
        termsReviewedAt: null,
        lastCheckedAt: null,
      });
      writeFileSync(sourcesPath, JSON.stringify(sources, null, 2));
      if (store) await store.saveSources(sources);
      send(response, 201, {
        source: feed,
        note: "The collector will check this feed on its next hourly run.",
      });
    } catch (error) {
      send(response, 400, {
        error: error.message || "invalid source configuration",
      });
    }
    return;
  }
  const monitorSourceMatch = url.pathname.match(/^\/api\/monitor-sources\/([^/]+)$/);
  if (request.method === "PATCH" && monitorSourceMatch) {
    let raw = "";
    for await (const chunk of request) {
      raw += chunk;
      if (raw.length > 4000) break;
    }
    try {
      if (raw.length > 4000) {
        send(response, 413, { error: "request too large" });
        return;
      }
      const input = JSON.parse(raw);
      if (typeof input.active !== "boolean") {
        send(response, 400, { error: "active must be a boolean" });
        return;
      }
      const feeds = store
        ? await store.loadMonitorFeeds()
        : JSON.parse(readFileSync(monitorConfigPath, "utf8")).rssFeeds;
      const feed = feeds.find((item) => item.id === monitorSourceMatch[1]);
      if (!feed) {
        send(response, 404, { error: "monitor feed not found" });
        return;
      }
      feed.active = input.active;
      const config = JSON.parse(readFileSync(monitorConfigPath, "utf8"));
      config.rssFeeds = feeds;
      writeFileSync(monitorConfigPath, JSON.stringify(config, null, 2));
      const sourceRows = store ? await store.loadSources() : readSources();
      const source = sourceRows.find((item) => item.id === feed.id);
      if (source) {
        source.active = feed.active;
        writeFileSync(sourcesPath, JSON.stringify(sourceRows, null, 2));
        if (store) await store.saveSources(sourceRows);
      }
      if (store) await store.saveMonitorFeeds(feeds);
      send(response, 200, { source: feed });
    } catch (error) {
      send(response, 400, { error: error.message || "invalid source update" });
    }
    return;
  }
  const sourceCheckMatch = url.pathname.match(/^\/api\/sources\/([^/]+)\/check$/);
  if (request.method === "POST" && sourceCheckMatch) {
    const result = await checkRegisteredSource(sourceCheckMatch[1]);
    send(
      response,
      result.status,
      result.error ? { error: result.error } : result.source,
    );
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/sources/pib-mod/ingest") {
    const result = await ingestPibMetadata();
    send(response, result.status, result.error ? { error: result.error } : result);
    return;
  }
  if (
    request.method === "POST" &&
    url.pathname === "/api/sources/pib-defence-security/ingest"
  ) {
    const result = await ingestPibDefenceMetadata();
    send(response, result.status, result.error ? { error: result.error } : result);
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/articles") {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    try {
      const input = JSON.parse(raw);
      const article = normalizeArticle(
        input,
        new Set(
          (store ? await store.loadSources() : readSources()).map(
            (source) => source.id,
          ),
        ),
      );
      if (article.error) {
        send(response, 400, { error: article.error });
        return;
      }
      if (data.articles.some((item) => item.canonicalUrl === article.canonicalUrl)) {
        send(response, 409, {
          error: "article with this canonicalUrl already exists",
        });
        return;
      }
      const enrichedArticle = await enrichArticle(article);
      data.articles.unshift(enrichedArticle);
      await saveData(data);
      send(response, 201, enrichedArticle);
    } catch {
      send(response, 400, { error: "request body must be valid JSON" });
    }
    return;
  }
  const articleReviewMatch = url.pathname.match(/^\/api\/articles\/([^/]+)\/review$/);
  if (request.method === "POST" && articleReviewMatch) {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    try {
      const input = JSON.parse(raw);
      const article = data.articles.find((item) => item.id === articleReviewMatch[1]);
      if (!article) {
        send(response, 404, { error: "article not found" });
        return;
      }
      if (
        !reviewStates.includes(input.reviewState) ||
        !verificationStatuses.includes(input.verificationStatus)
      ) {
        send(response, 400, {
          error:
            "reviewState and verificationStatus must use the published contract values",
        });
        return;
      }
      if (input.reviewState === "approved" && !input.reviewerNote) {
        send(response, 400, {
          error: "reviewerNote is required before approval",
        });
        return;
      }
      if (
        input.imageReusePermitted === true &&
        (!article.imageUrl ||
          !input.reviewerNote ||
          typeof input.imageLicense !== "string" ||
          !input.imageLicense.trim() ||
          typeof input.imageAttribution !== "string" ||
          !input.imageAttribution.trim())
      ) {
        send(response, 400, {
          error:
            "Confirm an image source, reviewer note, licence/permission and attribution before enabling image reuse.",
        });
        return;
      }
      if (input.imageReusePermitted === true)
        await validatePublicHttps(new URL(article.imageUrl));
      const previousRecord = structuredClone(article);
      article.reviewState = input.reviewState;
      article.verificationStatus = input.verificationStatus;
      article.reviewerNote =
        typeof input.reviewerNote === "string"
          ? input.reviewerNote.trim().slice(0, 2000)
          : null;
      article.imageReusePermitted = input.imageReusePermitted === true;
      article.imageLicense = article.imageReusePermitted
        ? input.imageLicense.trim().slice(0, 300)
        : article.imageUrl
          ? "unknown"
          : null;
      article.imageAttribution = article.imageReusePermitted
        ? input.imageAttribution.trim().slice(0, 300)
        : article.imageAttribution || null;
      article.reviewedAt = new Date().toISOString();
      await recordArticleRevision({
        articleId: article.id,
        revisionType: "editorial-review",
        previousRecord,
        updatedRecord: structuredClone(article),
        reviewerNote: article.reviewerNote,
        actor:
          process.env.NODE_ENV === "production"
            ? "authenticated-admin"
            : "local-editor",
      });
      await saveData(data);
      send(response, 200, article);
    } catch {
      send(response, 400, { error: "request body must be valid JSON" });
    }
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/refresh") {
    const result = await refresh();
    send(response, result.ok ? 200 : 502, result);
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/briefs") {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    try {
      const input = JSON.parse(raw);
      if (!input.title || !input.summary) {
        send(response, 400, { error: "title and summary are required" });
        return;
      }
      const next = {
        id: `brief-${Date.now()}`,
        title: String(input.title).slice(0, 200),
        summary: String(input.summary).slice(0, 4000),
        status: input.status || "draft",
        confidence: input.confidence || "unreviewed",
        sourceUrls: Array.isArray(input.sourceUrls)
          ? input.sourceUrls.slice(0, 10)
          : [],
        createdAt: new Date().toISOString(),
      };
      data.briefs.unshift(next);
      await saveData(data);
      send(response, 201, next);
    } catch {
      send(response, 400, { error: "request body must be valid JSON" });
    }
    return;
  }
  send(response, 404, { error: "not found" });
});

const apiHost =
  process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
await storeReady;
server.listen(port, apiHost, () => {
  console.log(
    "Raksha Atlas API listening on http://" +
      apiHost +
      ":" +
      port +
      (store ? " · PostgreSQL storage" : " · JSON development storage"),
  );
});
startScheduler({
  runHourly: runScheduledHourly,
  runDaily: () => refresh({ includeMonitor: false }),
  onError: (error) => console.error("Scheduled job failed:", error.message || error),
});
