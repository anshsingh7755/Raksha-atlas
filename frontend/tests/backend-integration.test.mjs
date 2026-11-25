import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = async (path) =>
  (await readFile(new URL(path, import.meta.url), "utf8")).replace(/\r\n/g, "\n");

test("Spring routing is opt-in and unsupported APIs retain the Node fallback", async () => {
  const config = await read("../next.config.mjs");
  assert.match(config, /RAKSHA_SPRING_API_ENABLED === "true"/);
  assert.match(config, /RAKSHA_SPRING_API_PROXY_TARGET/);
  assert.match(config, /\/api\/inventory/);
  assert.match(config, /\/api\/sources/);
  assert.match(config, /\/api\/programmes/);
  assert.match(config, /\/api\/procurement-2026/);
  assert.match(config, /\/api\/chat/);
  assert.match(config, /\/api\/:path\*/);
  assert.match(config, /nodeApiTarget/);
});

test("API transport accepts an in-memory identity token provider without persisting credentials", async () => {
  const api = await read("../../src/services/api.ts");
  assert.match(api, /setApiAccessTokenProvider/);
  assert.match(api, /Authorization/);
  assert.match(api, /credentials: init\.credentials \?\? "same-origin"/);
  assert.doesNotMatch(api, /localStorage|sessionStorage|document\.cookie/);
});

test("typed backend clients cover only implemented Spring domain contracts", async () => {
  const client = await read("../../src/services/backend-api.ts");
  for (const endpoint of ["/api/inventory", "/api/sources", "/api/programmes", "/api/procurement-2026", "/api/chat"]) {
    assert.ok(client.includes(endpoint), `missing typed client for ${endpoint}`);
  }
});

test("existing assistant UI uses the typed backend adapter and preserves citation metadata", async () => {
  const app = await read("../../src/App.tsx");
  assert.match(app, /backendApi\.answer\(prompt\)/);
  assert.match(app, /source_id/);
  assert.match(app, /verification_status/);
});

test("Next.js container installs shared dependencies at repository root", async () => {
  const dockerfile = await read("../Dockerfile");
  assert.match(dockerfile, /WORKDIR \/app\nCOPY frontend\/package\.json frontend\/package-lock\.json \.\/\nRUN npm ci/);
  assert.match(dockerfile, /COPY src\/ \/app\/src\//);
});

test("inventory API errors are visible instead of being silently logged", async () => {
  const app = await read("../../src/App.tsx");
  assert.match(app, /inventoryError/);
  assert.match(app, /role="alert"/);
});

test("operations summary has a typed, cancellation-aware frontend client", async () => {
  const client = await read("../../src/services/operations.ts");
  assert.match(client, /OperationsSummary/);
  assert.match(client, /getOperationsSummary/);
  assert.match(client, /apiGet<OperationsSummary>/);
  assert.match(client, /\/api\/operations\/summary/);
});

test("operations UI distinguishes source freshness from claim verification", async () => {
  const app = await read("../../src/App.tsx");
  assert.match(app, /SOURCE FRESHNESS/);
  assert.match(app, /never checked/);
  assert.match(app, /not proof that a publisher is currently available/);
  assert.match(app, /getOperationsSummary\(\)/);
});

test("Vercel API adapter exports the existing API handler without starting a persistent server", async () => {
  const server = await read("../../server/index.mjs");
  const adapter = await read("../../api/[...path].mjs");
  const vercelConfig = await read("../../vercel.json");
  assert.match(server, /export async function handleRequest\(request, response\)/);
  assert.match(server, /if \(process\.env\.VERCEL !== "1"\)/);
  assert.match(server, /Write and AI endpoints are temporarily disabled in the Vercel read-only deployment/);
  assert.match(adapter, /export default async function handler/);
  assert.match(vercelConfig, /"outputDirectory": "dist"/);
});
