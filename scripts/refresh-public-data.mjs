import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const run = async (script, timeout = 180_000) => {
  const { stdout } = await execFileAsync(
    process.execPath,
    [join(root, "scripts", script)],
    { cwd: root, timeout, maxBuffer: 4 * 1024 * 1024 },
  );
  return stdout.trim();
};
let refreshRows = [];
let syncError = null;
try {
  refreshRows = JSON.parse(await run("sync-wikipedia-reference.mjs"));
} catch (error) {
  syncError = error.message || "reference refresh failed";
}
const catalogSummary = JSON.parse(await run("build-equipment-catalog.mjs", 60_000));
console.log(
  JSON.stringify(
    {
      ok: !syncError && refreshRows.every((page) => !page.refreshError),
      syncError,
      pages: refreshRows.length,
      failedSourceIds: refreshRows
        .filter((page) => page.refreshError)
        .map((page) => page.id),
      rowCount: refreshRows.reduce((sum, page) => sum + (page.rowCount || 0), 0),
      catalog: catalogSummary,
    },
    null,
    2,
  ),
);
