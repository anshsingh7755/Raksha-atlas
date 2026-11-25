import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import process from "node:process";
import { createHash } from "node:crypto";
const { Pool } = pg;
const envText = await fs.readFile(".env", "utf8").catch(() => "");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
}
const url = process.env.DEFENCE_DATABASE_URL;
if (!url) throw new Error("Set DEFENCE_DATABASE_URL in .env");
const root = process.cwd();
const pool = new Pool({ connectionString: url });
const read = async file => JSON.parse(await fs.readFile(path.join(root, file), "utf8"));
const report = [];
async function insert(table, row) {
  const keys = Object.keys(row);
  const values = keys.map(k => row[k] === undefined ? null : (k === "record" ? JSON.stringify(row[k]) : row[k]));
  const placeholders = keys.map((k,i) => "$" + (i+1) + (k === "record" ? "::jsonb" : ""));
  const updates = keys.filter(k => k !== "id").map(k => k + "=EXCLUDED." + k).join(",");
  await pool.query("INSERT INTO " + table + " (" + keys.join(",") + ") VALUES (" + placeholders.join(",") + ") ON CONFLICT(id) DO UPDATE SET " + updates + ",updated_at=NOW()", values);
}
async function load(file, table, mapper, rowsFn = d => d) {
  const data = await read(file); const rows = rowsFn(data); let count = 0;
  for (const item of rows) { await insert(table, mapper(item)); count++; }
  report.push({ file, table, records: count });
}
try {
  await load("server/sources.json","defence_sources",r=>({id:r.id,name:r.name,url:r.url,source_type:r.sourceType,official:!!r.official,reliability_notes:r.reliabilityNotes,record:r}));
  await load("server/inventory.json","defence_inventory",r=>({id:r.id,service:r.service,category:r.category,platform:r.platform,variant:r.variant,quantity:r.quantity,quantity_status:r.quantityStatus,verification_status:r.verificationStatus,as_of_date:r.asOfDate||null,source_id:r.sourceId,source_url:r.sourceUrl,record:r}));
  await load("server/programmes.json","defence_programmes",r=>({id:r.id,name:r.name,service_domain:r.serviceDomain,category:r.category,status:r.status,stage_label:r.stageLabel,stage_classification:r.stageClassification,quantity:r.quantity,quantity_type:r.quantityType,quantity_confidence:r.quantityConfidence,announced_date:r.announcedDate||null,evidence_quality:r.evidenceQuality,record:r}),d=>d.records||[]);
  await load("server/future-procurement.json","defence_procurement",r=>({id:r.id,dataset:"future-procurement",title:r.system,service:r.service,system_name:r.system,quantity:r.quantity,quantity_text:r.quantityText,stage:r.stage,status:r.stage,verification_status:r.verificationStatus,source_url:r.sourceUrl,event_date:r.stageDate||null,record:r}),d=>d.records||[]);
  await load("server/procurement-2026.json","defence_procurement",r=>({id:r.id,dataset:"procurement-2026",title:r.title,service:null,system_name:null,quantity:null,quantity_text:null,stage:r.status,status:r.status,verification_status:r.verificationStatus,source_url:r.sourceUrl,event_date:r.publishedAt||null,record:r}));
  await load("server/timelines.json","defence_timelines",r=>({id:r.id,programme:r.programme,service:r.service,verification_status:r.verificationStatus,record:r}));
  await load("server/history.json","defence_history",r=>({id:r.id,event_date:r.date,title:r.title,verification_status:r.verificationStatus,record:r}),d=>d.items||[]);
  for (const file of ["server/equipment-catalog.json","server/platform-register.json","server/wikipedia-equipment.json","server/frigates.json","server/official-assets.json","server/theatre-locations.json","server/categories.json","server/documents.json"]) {
    try {
      const value=await read(file); const rows=Array.isArray(value)?value:(value.records||value.items||value.categories||[]);
      let count=0;
      for (const r of rows) { const id=r.id||r.slug||file+"-"+count; await insert("defence_reference_data",{id,dataset:path.basename(file),category:r.category||r.type||null,service:r.service||r.serviceDomain||null,name:r.name||r.platform||r.title||r.label||null,record:r}); count++; }
      report.push({file,table:"defence_reference_data",records:count});
    } catch (e) { if (e.code!=="ENOENT") throw e; }
  }
  const legacyUrl = process.env.LEGACY_DATABASE_URL || process.env.DATABASE_URL;
  if (legacyUrl) {
    const legacy = new Pool({connectionString:legacyUrl});
    try {
      const exists = await legacy.query("SELECT to_regclass('public.news_articles') AS articles, to_regclass('public.news_sources') AS sources");
      if (exists.rows[0].articles) {
        const oldArticles = await legacy.query("SELECT id,record FROM news_articles");
        let count=0;
        for (const row of oldArticles.rows) { const r=row.record||{}; await insert("defence_articles",{id:row.id,title:r.title||row.id,canonical_url:r.canonicalUrl||null,source_id:r.sourceId||null,service:r.service||null,category:r.topic||null,published_at:r.publishedAt||null,verification_status:r.verificationStatus||"unverified",review_state:r.reviewState||"unreviewed",record:r}); count++; }
        report.push({file:"legacy PostgreSQL news_articles",table:"defence_articles",records:count});
      }
      if (exists.rows[0].sources) {
        const oldSources=await legacy.query("SELECT id,record FROM news_sources");
        let count=0;
        for(const row of oldSources.rows){const r=row.record||{};await insert("defence_sources",{id:row.id,name:r.name||row.id,url:r.url||null,source_type:r.sourceType||"unknown",official:!!r.official,reliability_notes:r.reliabilityNotes||null,record:r});count++;}
        report.push({file:"legacy PostgreSQL news_sources",table:"defence_sources",records:count});
      }
    } finally { await legacy.end(); }
  }
  await load("server/data.json","defence_articles",r=>({id:"article-"+createHash("sha256").update(String(r.canonicalUrl||r.url||r.id)+"|"+String(r.title||"")+"|"+String(r.publishedAt||"")).digest("hex").slice(0,40),title:r.title||r.id,canonical_url:r.canonicalUrl||null,source_id:r.sourceId||null,service:r.service||null,category:r.topic||r.category||null,published_at:r.publishedAt||null,verification_status:r.verificationStatus||"unverified",review_state:r.reviewState||"unreviewed",record:r}),d=>d.articles||[]);
  process.stdout.write(JSON.stringify({database:"defence_db",report},null,2)+"\n");
} finally { await pool.end(); }
