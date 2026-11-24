import assert from "node:assert/strict";
import test from "node:test";
import { parseApiResponse } from "./api-response.mjs";

test("204 and 205 responses resolve without a body", async () => {
  assert.equal(await parseApiResponse(new Response(null, { status: 204 })), undefined);
  assert.equal(await parseApiResponse(new Response(null, { status: 205 })), undefined);
});

test("empty success responses resolve as undefined", async () => {
  assert.equal(await parseApiResponse(new Response("")), undefined);
});

test("JSON responses are parsed", async () => {
  const response = new Response(JSON.stringify({ items: [1, 2] }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
  assert.deepEqual(await parseApiResponse(response), { items: [1, 2] });
});

test("non-JSON responses remain text", async () => {
  assert.equal(await parseApiResponse(new Response("accepted")), "accepted");
});

test("malformed JSON rejects so the API layer can expose a structured error", async () => {
  const response = new Response("{broken", {
    headers: { "content-type": "application/json" },
  });
  await assert.rejects(parseApiResponse(response), SyntaxError);
});
