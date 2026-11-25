import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const schemaUrl = new URL("./schema.sql", import.meta.url);

function dateValue(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function initializeStore({
  seedData,
  sources = [],
  categories = [],
  feeds = [],
}) {
  const defenceUrl = process.env.DEFENCE_DATABASE_URL || process.env.DATABASE_URL;
  const applicationUrl = process.env.APPLICATION_DATABASE_URL;
  if (!defenceUrl) return null;
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString: defenceUrl,
    max: Number(process.env.DB_POOL_SIZE || 8),
    ssl:
      process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  const applicationPool = applicationUrl ? new Pool({ connectionString: applicationUrl, max: Number(process.env.APPLICATION_DB_POOL_SIZE || 3), ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined }) : null;
  if (applicationPool) {
    const applicationSchemaUrl = new URL("../../database/application/schema/schema.sql", import.meta.url);
    await applicationPool.query(await readFile(fileURLToPath(applicationSchemaUrl), "utf8"));
  }
  await pool.query(await readFile(fileURLToPath(schemaUrl), "utf8"));
  const store = {
    applicationDb: applicationPool,
    async applicationStatus() { if (!applicationPool) return { enabled: false }; const result = await applicationPool.query("SELECT current_database() AS database"); return { enabled: true, ...result.rows[0] }; },
    async seedSources(rows) {
      for (const item of rows)
        await pool.query(
          `INSERT INTO news_sources(id,name,url,source_type,official,active,record) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING`,
          [
            item.id,
            item.name,
            item.url || "",
            item.sourceType || "unknown",
            Boolean(item.official),
            item.active !== false,
            item,
          ],
        );
    },
    async saveSources(rows) {
      for (const item of rows)
        await pool.query(
          `INSERT INTO news_sources(id,name,url,source_type,official,active,record,updated_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,NOW()) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,url=EXCLUDED.url,source_type=EXCLUDED.source_type,official=EXCLUDED.official,active=EXCLUDED.active,record=EXCLUDED.record,updated_at=NOW()`,
          [
            item.id,
            item.name,
            item.url || "",
            item.sourceType || "unknown",
            Boolean(item.official),
            item.active !== false,
            item,
          ],
        );
    },
    async saveCategories(rows) {
      for (const item of rows)
        await pool.query(
          `INSERT INTO news_categories(id,name,parent_id,keywords,active,record,updated_at)
        VALUES($1,$2,$3,$4,$5,$6,NOW()) ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,keywords=EXCLUDED.keywords,active=EXCLUDED.active,record=EXCLUDED.record,updated_at=NOW()`,
          [
            item.id,
            item.name,
            item.parentId || null,
            item.keywords || [],
            item.active !== false,
            item,
          ],
        );
    },
    async saveMonitorFeeds(rows) {
      for (const item of rows)
        await pool.query(
          `INSERT INTO monitor_feeds(id,url,active,record,updated_at) VALUES($1,$2,$3,$4,NOW()) ON CONFLICT(id) DO UPDATE SET url=EXCLUDED.url,active=EXCLUDED.active,record=EXCLUDED.record,updated_at=NOW()`,
          [item.id, item.url, item.active !== false, item],
        );
    },
    async seedMonitorFeeds(rows) {
      for (const item of rows)
        await pool.query(
          `INSERT INTO monitor_feeds(id,url,active,record) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
          [item.id, item.url, item.active !== false, item],
        );
    },
    async loadMonitorFeeds() {
      const result = await pool.query("SELECT record FROM monitor_feeds ORDER BY id");
      return result.rows.map((row) => row.record);
    },
    async saveArticles(rows) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const item of rows) {
          await client.query(
            `INSERT INTO news_articles(id,canonical_url,title,summary,content_excerpt,category_id,country,keywords,published_at,ingested_at,verification_status,review_state,record,updated_at)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
            ON CONFLICT(id) DO UPDATE SET canonical_url=EXCLUDED.canonical_url,title=EXCLUDED.title,summary=EXCLUDED.summary,content_excerpt=EXCLUDED.content_excerpt,category_id=EXCLUDED.category_id,country=EXCLUDED.country,keywords=EXCLUDED.keywords,published_at=EXCLUDED.published_at,verification_status=EXCLUDED.verification_status,review_state=EXCLUDED.review_state,record=EXCLUDED.record,updated_at=NOW()`,
            [
              item.id,
              item.canonicalUrl,
              item.title,
              item.summary || "",
              item.contentExcerpt || "",
              item.categoryId || null,
              item.country || null,
              item.keywords || [],
              dateValue(item.publishedAt),
              dateValue(item.ingestedAt) || new Date(),
              item.verificationStatus || "unverified",
              item.reviewState || "unreviewed",
              item,
            ],
          );
          const sourceId = item.sourceId;
          if (sourceId)
            await client.query(
              `INSERT INTO article_sources(article_id,source_id,source_url,source_title) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
              [item.id, sourceId, item.canonicalUrl, item.title],
            );
          for (const source of item.relatedSources || [])
            if (source.sourceId && source.url)
              await client.query(
                `INSERT INTO article_sources(article_id,source_id,source_url,source_title) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
                [item.id, source.sourceId, source.url, source.title || null],
              );
          if (item.imageUrl)
            await client.query(
              `INSERT INTO article_images(article_id,image_url,attribution,license,reuse_permitted) VALUES($1,$2,$3,$4,$5) ON CONFLICT(article_id,image_url) DO UPDATE SET attribution=EXCLUDED.attribution,license=EXCLUDED.license,reuse_permitted=EXCLUDED.reuse_permitted`,
              [
                item.id,
                item.imageUrl,
                item.imageAttribution || null,
                item.imageLicense || "unknown",
                item.imageReusePermitted === true,
              ],
            );
        }
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    async loadArticles() {
      const result = await pool.query(
        `SELECT record FROM news_articles ORDER BY published_at DESC NULLS LAST, ingested_at DESC`,
      );
      return result.rows.map((row) => row.record);
    },
    async loadSources() {
      const result = await pool.query(`SELECT record FROM news_sources ORDER BY name`);
      return result.rows.map((row) => row.record);
    },
    async logPipeline({
      jobId,
      jobType,
      status,
      startedAt,
      completedAt = null,
      metrics = {},
      error = null,
      sourceId = null,
    }) {
      await pool.query(
        `INSERT INTO pipeline_logs(job_id,job_type,status,started_at,completed_at,metrics,error) VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [jobId, jobType, status, startedAt, completedAt, metrics, error],
      );
      const failures = Array.isArray(metrics.failures)
        ? metrics.failures
        : status === "failed"
          ? [{ sourceId, error: error || "unknown error" }]
          : [];
      for (const failure of failures)
        await pool.query(
          `INSERT INTO failed_jobs(job_id,source_id,job_type,payload,error,next_retry_at) VALUES($1,$2,$3,$4,$5,NOW() + INTERVAL '15 minutes')`,
          [
            jobId,
            failure.sourceId || sourceId,
            jobType,
            failure,
            failure.error || "source collection failed",
          ],
        );
      const succeededIds = Array.isArray(metrics.succeededSourceIds)
        ? metrics.succeededSourceIds
        : [];
      if (succeededIds.length)
        await pool.query(
          `UPDATE failed_jobs SET resolved_at=NOW() WHERE source_id = ANY($1::text[]) AND resolved_at IS NULL`,
          [succeededIds],
        );
    },
    async status() {
      const result = await pool.query(
        `SELECT (SELECT count(*) FROM news_articles)::int AS articles,(SELECT count(*) FROM news_sources WHERE active)::int AS sources,(SELECT count(*) FROM failed_jobs WHERE resolved_at IS NULL)::int AS failed_jobs`,
      );
      return { enabled: true, ...result.rows[0] };
    },
    async listPipelineLogs(limit = 30) {
      const result = await pool.query(
        "SELECT job_id,job_type,status,started_at,completed_at,metrics,error FROM pipeline_logs ORDER BY started_at DESC LIMIT $1",
        [Math.max(1, Math.min(100, Number(limit) || 30))],
      );
      return result.rows;
    },
    async addArticleRevision({
      articleId,
      revisionType,
      previousRecord,
      updatedRecord,
      reviewerNote,
      actor = "editor",
    }) {
      await pool.query(
        `INSERT INTO article_revisions(article_id,revision_type,previous_record,updated_record,reviewer_note,actor) VALUES($1,$2,$3,$4,$5,$6)`,
        [
          articleId,
          revisionType,
          previousRecord,
          updatedRecord,
          reviewerNote || null,
          actor,
        ],
      );
    },
    async close() {
      await pool.end();
    },
  };
  await store.seedSources(sources);
  await store.saveCategories(categories);
  await store.seedMonitorFeeds(feeds);
  if (
    (await pool.query("SELECT count(*)::int AS n FROM news_articles")).rows[0].n === 0
  )
    await store.saveArticles(seedData.articles || []);
  return store;
}

export async function seedStoreFromFiles() {
  const base = new URL("../", import.meta.url);
  const get = async (name, fallback) => {
    try {
      return JSON.parse(await readFile(new URL(name, base), "utf8"));
    } catch {
      return fallback;
    }
  };
  const [data, sources, categories, monitorConfig] = await Promise.all([
    get("data.json", { articles: [], briefs: [] }),
    get("sources.json", []),
    get("categories.json", []),
    get("monitor-sources.json", { rssFeeds: [] }),
  ]);
  return initializeStore({
    seedData: data,
    sources,
    categories,
    feeds: monitorConfig.rssFeeds || [],
  });
}


