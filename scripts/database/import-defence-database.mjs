import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import process from "node:process";
import { createHash } from "node:crypto";

const { Pool } = pg;
const envText = await fs.readFile(".env", "utf8").catch(() => "");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined)
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
}

const url = process.env.DEFENCE_DATABASE_URL;
if (!url) throw new Error("Set DEFENCE_DATABASE_URL in .env");

const root = process.cwd();
const pool = new Pool({ connectionString: url });
const report = [];

const read = async file =>
  JSON.parse(await fs.readFile(path.join(root, file), "utf8"));

const text = value => value == null ? null : String(value);

const integer = value => {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
};

function extractRows(data, keys, file) {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  throw new Error(`Unrecognized JSON structure: ${file}`);
}

async function insert(table, row, conflict = "update") {
  const keys = Object.keys(row);
  const values = keys.map(k =>
    k === "record" ? JSON.stringify(row[k]) : row[k] ?? null
  );
  const placeholders = keys.map((k, i) =>
    `$${i + 1}${k === "record" ? "::jsonb" : ""}`
  );

  const updates = keys
    .filter(k => k !== "id")
    .map(k => `${k}=EXCLUDED.${k}`);

  const action = conflict === "nothing"
    ? "DO NOTHING"
    : `DO UPDATE SET ${updates.join(",")},updated_at=NOW()`;

  await pool.query(
    `INSERT INTO ${table} (${keys.join(",")})
     VALUES (${placeholders.join(",")})
     ON CONFLICT(id) ${action}`,
    values
  );
}

async function load(file, table, mapper, keys, conflict = "update") {
  const data = await read(file);
  const rows = extractRows(data, keys, file);
  const seen = new Set();
  const occurrences = new Map();
  let collisions = 0;

  for (const item of rows) {
    const row = mapper(item);
    if (!row.id) throw new Error(`Missing ID in ${file}`);

    if (seen.has(row.id)) {
      if (file !== "server/data.json")
        throw new Error(`Duplicate ID ${row.id} in ${file}`);
      const originalId = row.id;
      const occurrence = (occurrences.get(originalId) || 0) + 1;
      occurrences.set(originalId, occurrence);
      row.id = `${originalId}::duplicate:${hash(item)}:${occurrence}`;
      while (seen.has(row.id)) row.id += ":x";
      collisions++;
    }

    seen.add(row.id);
    await insert(table, row, conflict);
  }

  report.push({ file, table, records: rows.length, collisions });
}
const hash = value =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 32);

try {
  // Source registry: JSON registry is authoritative.
  await load(
    "server/sources.json", "defence_sources",
    r => ({
      id: text(r.id), name: r.name || r.id, url: r.url || null,
      source_type: r.sourceType || "unknown",
      official: !!r.official,
      reliability_notes: r.reliabilityNotes || null,
      record: r
    }),
    []
  );

  await load(
    "server/inventory.json", "defence_inventory",
    r => ({
      id: text(r.id), service: r.service || "Unknown",
      category: r.category || "Unclassified",
      platform: r.platform || "Unspecified",
      variant: r.variant || null, quantity: integer(r.quantity),
      quantity_status: r.quantityStatus || null,
      verification_status: r.verificationStatus || null,
      as_of_date: text(r.asOfDate), source_id: text(r.sourceId),
      source_url: r.sourceUrl || null, record: r
    }),
    []
  );

  await load(
    "server/programmes.json", "defence_programmes",
    r => ({
      id: text(r.id), name: r.name || r.title || r.id,
      service_domain: r.serviceDomain || null,
      category: r.category || null, status: r.status || null,
      stage_label: r.stageLabel || null,
      stage_classification: r.stageClassification || null,
      quantity: integer(r.quantity),
      quantity_type: r.quantityType || null,
      quantity_confidence: r.quantityConfidence || null,
      announced_date: text(r.announcedDate),
      evidence_quality: r.evidenceQuality || null, record: r
    }),
    ["records"]
  );

  await load(
    "server/future-procurement.json", "defence_procurement",
    r => ({
      id: `future-procurement:${r.id}`,
      dataset: "future-procurement",
      title: r.system || r.id, service: r.service || null,
      system_name: r.system || null, quantity: integer(r.quantity),
      quantity_text: r.quantityText || null,
      stage: r.stage || null, status: r.stage || null,
      verification_status: r.verificationStatus || null,
      source_url: r.sourceUrl || null,
      event_date: text(r.stageDate), record: r
    }),
    ["records"]
  );

  await load(
    "server/procurement-2026.json", "defence_procurement",
    r => ({
      id: `procurement-2026:${r.id}`,
      dataset: "procurement-2026",
      title: r.title || r.id, service: null, system_name: null,
      quantity: null, quantity_text: null,
      stage: r.status || null, status: r.status || null,
      verification_status: r.verificationStatus || null,
      source_url: r.sourceUrl || null,
      event_date: text(r.publishedAt), record: r
    }),
    []
  );

  await load(
    "server/timelines.json", "defence_timelines",
    r => ({
      id: text(r.id), programme: r.programme || null,
      service: r.service || null,
      verification_status: r.verificationStatus || null, record: r
    }),
    []
  );

  await load(
    "server/history.json", "defence_history",
    r => ({
      id: text(r.id), event_date: text(r.date),
      title: r.title || r.id,
      verification_status: r.verificationStatus || null, record: r
    }),
    ["items"]
  );

  // Import legacy PostgreSQL records without overwriting richer sources.
  const legacyUrl = process.env.LEGACY_DATABASE_URL || process.env.DATABASE_URL;
  if (legacyUrl) {
    const legacy = new Pool({ connectionString: legacyUrl });
    try {
      const db = await legacy.query("SELECT current_database() AS name");
      const target = await pool.query("SELECT current_database() AS name");

      if (db.rows[0].name !== target.rows[0].name) {
        const exists = await legacy.query(
          "SELECT to_regclass('public.news_articles') AS articles, to_regclass('public.news_sources') AS sources"
        );

        if (exists.rows[0].sources) {
          const rows = await legacy.query("SELECT id,record FROM news_sources");
          for (const row of rows.rows) {
            const r = row.record || {};
            await insert("defence_sources", {
              id: text(row.id), name: r.name || row.id,
              url: r.url || null, source_type: r.sourceType || "unknown",
              official: !!r.official,
              reliability_notes: r.reliabilityNotes || null, record: r
            }, "nothing");
          }
          report.push({
            file: "legacy PostgreSQL news_sources",
            records: rows.rowCount
          });
        }

        if (exists.rows[0].articles) {
          const rows = await legacy.query("SELECT id,record FROM news_articles");
          for (const row of rows.rows) {
            const r = row.record || {};
            await insert("defence_articles", {
              id: text(row.id), title: r.title || row.id,
              canonical_url: r.canonicalUrl || null,
              source_id: text(r.sourceId), service: r.service || null,
              category: r.category || r.topic || null,
              published_at: text(r.publishedAt),
              verification_status: r.verificationStatus || "unverified",
              review_state: r.reviewState || "unreviewed",
              record: r
            }, "nothing");
          }
          report.push({
            file: "legacy PostgreSQL news_articles",
            records: rows.rowCount
          });
        }
      }
    } finally {
      await legacy.end();
    }
  }

  // Preserve all original article IDs and complete raw records.
  await load(
    "server/data.json", "defence_articles",
    r => {
      if (!r.id) throw new Error("Article without original ID detected");
      return {
        id: text(r.id), title: r.title || r.id,
        canonical_url: r.canonicalUrl || null,
        source_id: text(r.sourceId),
        service: r.service || null,
        category: r.category || r.topic || null,
        published_at: text(r.publishedAt),
        verification_status: r.verificationStatus || "unverified",
        review_state: r.reviewState || "unreviewed",
        record: r
      };
    },
    ["articles"]
  );

  // Reference datasets: namespace IDs by filename.
  const referenceFiles = [
    "server/equipment-catalog.json",
    "server/platform-register.json",
    "server/wikipedia-equipment.json",
    "server/frigates.json",
    "server/official-assets.json",
    "server/theatre-locations.json",
    "server/categories.json",
    "server/documents.json"
  ];

  for (const file of referenceFiles) {
    const data = await read(file);
    let rows = file.endsWith("wikipedia-equipment.json") ? (Array.isArray(data.pages) ? data.pages : Object.entries(data.pages || {}).map(([id, value]) => typeof value === "object" && value !== null ? { ...value, id: value.id || id } : { id, value })) : extractRows(data, ["records", "items", "categories"], file);



    const dataset = path.basename(file);
    const seen = new Set();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const originalId = r.id || r.slug || hash(r);
      const id = `${dataset}:${originalId}`;
      if (seen.has(id)) throw new Error(`Duplicate reference ID: ${id}`);
      seen.add(id);

      await insert("defence_reference_data", {
        id, dataset,
        category: r.category || r.type || r.domain || null,
        service: r.service || r.serviceDomain || null,
        name: r.name || r.platform || r.title || r.label || null,
        record: r
      });
    }

    report.push({
      file, table: "defence_reference_data", records: rows.length
    });
  }

  process.stdout.write(
    JSON.stringify({ database: "defence_db", report }, null, 2) + "\n"
  );
} finally {
  await pool.end();
}
