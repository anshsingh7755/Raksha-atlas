import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;
const root = process.cwd();
const specs = [
  { file:"server/inventory.json", table:"inventory_items", rows:d=>d },
  { file:"server/sources.json", table:"sources", rows:d=>d },
  { file:"server/programmes.json", table:"programmes", rows:d=>d.records },
  { file:"server/procurement-2026.json", table:"procurement_records", rows:d=>d },
  { file:"server/future-procurement.json", table:"procurement_records", rows:d=>d.records },
];

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(
    Object.keys(value).sort().map(key => [key, canonical(value[key])])
  );
  return value;
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized:false } : undefined,
});
let failed = false;
const report = [];
try {
  for (const spec of specs) {
    const parsed = JSON.parse(await fs.readFile(path.join(root, spec.file), "utf8"));
    const sourceRows = spec.rows(parsed);
    const dbRows = await pool.query(
      "SELECT id, raw_record FROM " + spec.table + " WHERE dataset = $1 OR $1 IS NULL",
      [spec.table === "procurement_records" ? (spec.file.includes("future-") ? "future-procurement" : "procurement-2026") : null]
    );
    const byId = new Map(dbRows.rows.map(row => [row.id, row.raw_record]));
    const missing = [];
    const changed = [];
    for (const row of sourceRows) {
      if (!byId.has(row.id)) missing.push(row.id);
      else if (JSON.stringify(canonical(byId.get(row.id))) !== JSON.stringify(canonical(row))) changed.push(row.id);
    }
    const extra = [...byId.keys()].filter(id => !sourceRows.some(row => row.id === id));
    const result = {
      file:spec.file, table:spec.table, sourceCount:sourceRows.length,
      databaseCount:dbRows.rows.length, missingIds:missing, changedRecords:changed, extraIds:extra,
      passed:missing.length===0 && changed.length===0 && extra.length===0 && sourceRows.length===dbRows.rows.length
    };
    if (!result.passed) failed = true;
    report.push(result);
  }
  process.stdout.write(JSON.stringify({ passed:!failed, report }, null, 2) + "\n");
  if (failed) process.exitCode = 2;
} finally {
  await pool.end();
}
