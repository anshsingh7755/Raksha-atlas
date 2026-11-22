import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeStore, seedStoreFromFiles } from "../server/db/store.mjs";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
try {
  const env = await readFile(join(root, ".env"), "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined)
      process.env[match[1]] = match[2].replace(/^("|')(.*)\1$/, "$2");
  }
} catch {}
const store = await seedStoreFromFiles();
if (!store) {
  console.error("DATABASE_URL is not set.");
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, storage: await store.status() }, null, 2));
  await store.close();
}
