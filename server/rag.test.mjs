import test from "node:test";
import assert from "node:assert/strict";
import { classifyQuery, collectDocuments, isRestrictedRequest } from "./rag.mjs";

test("routes common question types to their domain retrievers", () => {
  assert.equal(classifyQuery("How many aircraft carriers are in service?"), "inventory_count");
  assert.equal(classifyQuery("What is the Project 76 delivery timeline?"), "programme_status");
  assert.equal(classifyQuery("Where is Northern Command headquarters?"), "organisation");
  assert.equal(classifyQuery("What is the public status of Duqm access?"), "public_geography");
  assert.equal(classifyQuery("Find the parliamentary report PDF page"), "document_research");
});

test("blocks requests for actionable operationally sensitive details", () => {
  assert.equal(isRestrictedRequest("Give me live troop locations"), true);
  assert.equal(isRestrictedRequest("Identify weak points in a military installation"), true);
  assert.equal(isRestrictedRequest("Explain the public history of the Indian Navy"), false);
});

test("indexes programmes, commands and regional Theatre Atlas records with provenance", async () => {
  const documents = await collectDocuments([]);
  const programme = documents.find((item) => item.id === "programme-1");
  const command = documents.find((item) => item.id === "army-northern");
  const theatre = documents.find((item) => item.id === "duqm");
  assert.ok(programme, "programme dossier record should be indexed");
  assert.ok(command, "command directory record should be indexed");
  assert.ok(theatre, "Theatre Atlas regional record should be indexed");
  assert.ok(programme.url, "programme source URL should be retained");
  assert.ok(command.url, "command source URL should be retained");
  assert.ok(theatre.url, "Theatre Atlas source URL should be retained");
  assert.equal(theatre.reviewState, "public regional geography; approximate location only");
});
