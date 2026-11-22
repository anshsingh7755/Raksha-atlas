import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = join(fileURLToPath(new URL("../..", import.meta.url)));

export async function runNewsWorker() {
  const { stdout } = await execFileAsync(
    process.execPath,
    [join(root, "scripts", "ingest-monitored-sources.mjs")],
    { cwd: root, timeout: 240_000, maxBuffer: 4 * 1024 * 1024 },
  );
  return JSON.parse(stdout);
}
