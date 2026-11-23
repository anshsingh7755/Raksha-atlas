import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

async function getFreePort() {
  const probe = createServer();
  await new Promise((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", resolve);
  });
  const { port } = probe.address();
  await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
  return port;
}

async function waitForApi(baseUrl, child) {
  const deadline = Date.now() + 15_000;
  let lastError;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`API process exited early with code ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
      lastError = new Error(`Health endpoint returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw lastError || new Error("API did not become ready within 15 seconds");
}

test("read-only API smoke checks cover health and core public registers", { timeout: 30_000 }, async () => {
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const env = { ...process.env, PORT: String(port), HOST: "127.0.0.1", NODE_ENV: "test" };
  delete env.DATABASE_URL;
  delete env.RAKSHA_ADMIN_TOKEN;

  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: process.cwd(),
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stderr = "";
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (chunk) => { stderr += chunk; });

  try {
    await waitForApi(baseUrl, child);

    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const health = await healthResponse.json();
    assert.equal(healthResponse.status, 200);
    assert.equal(health.ok, true);
    assert.equal(health.service, "raksha-atlas-api");
    assert.ok(["json-file", "postgresql"].includes(health.storage));

    const routes = [
      ["/api/categories", (body) => Array.isArray(body.items)],
      ["/api/inventory", (body) => Array.isArray(body.items) && body.count === body.items.length],
      ["/api/programmes", (body) => Array.isArray(body.items) && body.count === body.items.length],
      ["/api/documents", (body) => Array.isArray(body.items) && body.total >= body.items.length],
      ["/api/sources", (body) => Array.isArray(body.items) && Array.isArray(body.verificationStatuses)],
      ["/api/search?q=aircraft", (body) => body.query === "aircraft" && Array.isArray(body.results)],
      ["/api/theatre-atlas", (body) => Array.isArray(body.items) && body.count === body.items.length],
    ];

    for (const [path, validate] of routes) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 200, `${path} should return HTTP 200`);
      const body = await response.json();
      assert.ok(validate(body), `${path} should return its documented response shape`);
    }

    const missing = await fetch(`${baseUrl}/api/this-route-does-not-exist`);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { error: "not found" });
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => {
      if (child.exitCode !== null || child.signalCode !== null) return resolve();
      const timeout = setTimeout(() => {
        child.kill("SIGKILL");
        resolve();
      }, 3_000);
      child.once("exit", () => {
        clearTimeout(timeout);
        resolve();
      });
    });
    if (child.exitCode !== 0 && child.exitCode !== null && stderr)
      assert.fail(`API smoke-test process failed: ${stderr}`);
  }
});
