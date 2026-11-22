import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = dirname(fileURLToPath(import.meta.url));
const children = [
  spawn(process.execPath, [join(root, "server", "index.mjs")], {
    cwd: root,
    stdio: "inherit",
  }),
  spawn(
    process.execPath,
    [join(root, "node_modules", "vite", "bin", "vite.js"), "--host", "127.0.0.1"],
    { cwd: root, stdio: "inherit" },
  ),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill();
  process.exitCode = code;
}
for (const child of children) {
  child.on("error", (error) => {
    console.error(error);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code ?? 1);
  });
}
process.on("SIGINT", () => stop(130));
process.on("SIGTERM", () => stop(143));
