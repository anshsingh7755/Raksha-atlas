import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;
const root = process.cwd();
const apply = process.argv.includes("--apply");
const files = [
  { file: "server/inventory.json", table: "inventory_items", map: (r) => ({ id:r.id, service:r.service, category:r.category, platform:r.platform, variant:r.variant, quantity:r.quantity, quantity_status:r.quantityStatus, origin_country:r.originCountry, manufacturer:r.manufacturer, procurement_year:r.procurementYear, inducted_year:r.inductedYear, role:r.role, capability_summary:r.capabilitySummary, as_of_date:r.asOfDate, definition:r.definition, confidence:r.confidence, verification_status:r.verificationStatus, source_id:r.sourceId, source_url:r.sourceUrl, supporting_source_ids:r.supportingSourceIds ?? [], technical_profile:r.technicalProfile ?? null, acquisition:r.acquisition ?? null, data_limitations:r.dataLimitations ?? null, raw_record:r }) },
  { file: "server/sources.json", table: "sources", map: (r) => ({ id:r.id, name:r.name, url:r.url, source_type:r.sourceType, official:r.official ?? false, default_status:r.defaultStatus, language:r.language, active:r.active ?? true, reliability_notes:r.reliabilityNotes, terms_reviewed_at:r.termsReviewedAt, last_checked_at:r.lastCheckedAt, last_ingest_at:r.lastIngestAt, raw_record:r }) },
  { file: "server/programmes.json", table: "programmes", records: (d) => d.records, map: (r) => ({ id:r.id, name:r.name, service_domain:r.serviceDomain, category:r.category, variant:r.variant, developer:r.developer, manufacturers:r.manufacturers ?? [], status:r.status, stage_label:r.stageLabel, stage_classification:r.stageClassification, quantity:r.quantity, quantity_type:r.quantityType, quantity_confidence:r.quantityConfidence, announced_date:r.announcedDate, milestones:r.milestones ?? [], sources:r.sources ?? [], evidence_quality:r.evidenceQuality, summary:r.summary, dossier_text:r.dossierText, last_verified_at:r.lastVerifiedAt, review_notes:r.reviewNotes, raw_record:r }) },
  { file: "server/procurement-2026.json", table: "procurement_records", map: (r) => ({ id:r.id, title:r.title, reference:r.reference, source_id:r.sourceId, source_url:r.sourceUrl, published_at:r.publishedAt, closing_at:r.closingAt, status:r.status, scope:r.scope, verification_status:r.verificationStatus, dataset:"procurement-2026", raw_record:r }) },
  { file: "server/future-procurement.json", table: "procurement_records", records: (d) => d.records, map: (r) => ({ id:r.id, title:r.system, reference:null, service:r.service, system_name:r.system, source_url:r.sourceUrl, quantity:r.quantity, quantity_text:r.quantityText, stage:r.stage, stage_date:r.stageDate, delivery_window:r.deliveryWindow, verification_status:r.verificationStatus, notes:r.notes, dataset:"future-procurement", raw_record:r }) },
];
const jsonColumns = new Set(["supporting_source_ids","technical_profile","acquisition","data_limitations","raw_record","manufacturers","milestones","sources"]);
const report = [];
let pool;
try {
  if (apply) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required with --apply");
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined });
  }
  for (const spec of files) {
    const doc = JSON.parse(await fs.readFile(path.join(root, spec.file), "utf8"));
    const rows = spec.records ? spec.records(doc) : doc;
    const seen = new Set(); const duplicates = []; let imported = 0;
    for (const record of rows) {
      const row = spec.map(record);
      if (!row.id || seen.has(row.id)) { duplicates.push(row.id ?? "(missing id)"); continue; }
      seen.add(row.id);
      if (!apply) continue;
      const cols = Object.keys(row);
      const vals = cols.map((key) => row[key] === undefined ? null : (jsonColumns.has(key) && row[key] !== null ? JSON.stringify(row[key]) : row[key]));
      const slots = cols.map((key, i) => "$" + (i + 1) + (jsonColumns.has(key) ? "::jsonb" : ""));
      const updates = cols.filter((key) => key !== "id").map((key) => key + "=EXCLUDED." + key).join(", ");
      const sql = "INSERT INTO " + spec.table + " (" + cols.join(",") + ") VALUES (" + slots.join(",") + ") ON CONFLICT (id) DO UPDATE SET " + updates + ", updated_at=NOW()";
      await pool.query(sql, vals); imported++;
    }
    report.push({ file:spec.file, table:spec.table, input:rows.length, unique:seen.size, imported:apply?imported:0, duplicateIds:duplicates });
  }
  process.stdout.write(JSON.stringify({ mode:apply?"apply":"dry-run", report }, null, 2) + "\n");
} catch (error) {
  console.error(error.message); process.exitCode = 1;
} finally { await pool?.end(); }
