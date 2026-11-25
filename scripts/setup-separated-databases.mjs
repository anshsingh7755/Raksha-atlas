import fs from "node:fs/promises";
import pg from "pg";
import process from "node:process";
const { Client, Pool } = pg;
const envText = await fs.readFile(".env", "utf8").catch(() => "");
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
}
const adminUrl = process.env.PG_ADMIN_URL;
const defenceUrl = process.env.DEFENCE_DATABASE_URL;
const applicationUrl = process.env.APPLICATION_DATABASE_URL;
if (!adminUrl || !defenceUrl || !applicationUrl) throw new Error("Set PG_ADMIN_URL, DEFENCE_DATABASE_URL and APPLICATION_DATABASE_URL in .env");
function dbName(url) { return new URL(url).pathname.slice(1); }
const admin = new Client({ connectionString: adminUrl });
await admin.connect();
try {
  for (const name of [dbName(defenceUrl), dbName(applicationUrl)]) {
    if (!/^[a-zA-Z0-9_]+$/.test(name)) throw new Error("Unsafe database name: " + name);
    const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname=$1", [name]);
    if (!exists.rowCount) await admin.query('CREATE DATABASE "' + name + '"');
  }
} finally { await admin.end(); }
for (const [url, file] of [[defenceUrl, "database/defence/schema.sql"], [applicationUrl, "database/application/schema.sql"]]) {
  const pool = new Pool({ connectionString: url });
  try { await pool.query(await fs.readFile(file, "utf8")); }
  finally { await pool.end(); }
}
process.stdout.write("Created defence_db and application_db; schemas applied.\n");
