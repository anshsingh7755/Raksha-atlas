import assert from "node:assert/strict";
import test from "node:test";
import { pathToView, viewToPath, resolvePath, resolveView } from "../lib/routes.mjs";

const expectedViews = [
  "overview", "forces", "atlas", "inventory", "programmes", "signals",
  "briefs", "documents", "sources", "pipeline", "timeline", "watch",
  "pib", "register", "history",
];

test("every supported application view has a direct route", () => {
  for (const view of expectedViews) {
    assert.equal(typeof viewToPath[view], "string", `missing route for ${view}`);
    assert.equal(resolveView(viewToPath[view]), view);
  }
});

test("route mapping is one-to-one and reversible", () => {
  const paths = Object.keys(pathToView);
  const views = Object.values(pathToView);
  assert.equal(new Set(paths).size, paths.length);
  assert.equal(new Set(views).size, views.length);
  for (const [path, view] of Object.entries(pathToView)) {
    assert.equal(resolvePath(view), path);
  }
});

test("unknown routes are not silently mapped to the overview", () => {
  assert.equal(resolveView("/this-route-does-not-exist"), null);
});
