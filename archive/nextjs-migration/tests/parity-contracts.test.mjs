import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Next.js shell mounts the shared application and exposes explicit route handling", async () => {
  const atlas = await read("../app/AtlasApp.tsx");
  assert.match(atlas, /resolveView\(pathname\)/);
  assert.match(atlas, /resolvePath\(view\)/);
  assert.match(atlas, /if \(!initialView\)/);
  assert.match(atlas, /dynamic\(\(\) => import\("\.\.\/\.\.\/src\/App"\)/);
});

test("Next.js loading, error and not-found boundaries exist", async () => {
  const loading = await read("../app/loading.tsx");
  const error = await read("../app/error.tsx");
  const notFound = await read("../app/not-found.tsx");
  assert.match(loading, /role="status"/);
  assert.match(error, /role="alert"/);
  assert.match(error, /onClick=\{reset\}/);
  assert.match(notFound, /Return to overview/);
});

test("shared stylesheet retains responsive and accessibility foundations", async () => {
  const css = await read("../../src/styles.css");
  assert.match(css, /@media \(max-width:/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.skip-link/);
});

test("Signals and Sources are mounted as feature boundaries", async () => {
  const app = await read("../../src/App.tsx");
  assert.match(app, /features\/signals\/Signals/);
  assert.match(app, /features\/sources\/Sources/);
  assert.match(app, /<Signals articles=\{articles\} sources=\{sourceRegistry\}/);
  assert.match(app, /<Sources[\s\S]*?adminToken=\{adminToken\}/);
});
