import test from "node:test";
import assert from "node:assert/strict";
import { canonicalizeDocumentUrl, normalizeDocument, findDuplicateByChecksum } from "./index.mjs";

test("canonical URL removes tracking parameters and fragments", () => {
  assert.equal(canonicalizeDocumentUrl("https://example.gov.in/report.pdf?utm_source=x&b=2#page=4"), "https://example.gov.in/report.pdf?b=2");
});
test("rejects non-HTTPS and credential-bearing URLs", () => {
  assert.throws(() => canonicalizeDocumentUrl("http://example.gov.in/a.pdf"));
  assert.throws(() => canonicalizeDocumentUrl("https://user:pass@example.gov.in/a.pdf"));
});
test("normalizes document metadata and defaults to metadata-only extraction", () => {
  const item = normalizeDocument({ title: "Annual Report", publisher: "Ministry", url: "https://example.gov.in/report.pdf" });
  assert.equal(item.extractionStatus, "metadata_only");
  assert.equal(item.evidenceStatus, "unreviewed");
  assert.equal(item.fileFormat, "pdf");
  assert.match(item.id, /^document-/);
});
test("rejects duplicate canonical URLs", () => {
  const item = normalizeDocument({ title: "A", publisher: "Ministry", url: "https://example.gov.in/a.pdf?utm_medium=x" });
  assert.throws(() => normalizeDocument({ title: "B", publisher: "Ministry", url: "https://example.gov.in/a.pdf" }, [item]), /already registered/);
});
test("preserves page-level extraction references", () => {
  const item = normalizeDocument({ title: "Report", publisher: "Ministry", url: "https://example.gov.in/r.pdf", pages: [{ page: 4, text: "Public text" }] });
  assert.equal(item.extractionStatus, "text_extracted");
  assert.deepEqual(item.pages, [{ page: 4, text: "Public text" }]);
});

test("persists extraction engine, OCR pages, warnings and page count", () => {
  const item = normalizeDocument({
    title: "Public report",
    publisher: "Ministry",
    url: "https://example.gov.in/report.pdf",
    extractionStatus: "text_extracted",
    pageCount: 2,
    ocrPages: [2],
    extractionEngine: "PyMuPDF 1.24",
    extractionWarnings: ["OCR used on page 2"],
    checksumSha256: "a".repeat(64),
    fileSizeBytes: 1024,
    pages: [{ page: 1, text: "First page" }, { page: 2, text: "Second page" }],
  });
  assert.equal(item.pageCount, 2);
  assert.deepEqual(item.ocrPages, [2]);
  assert.equal(item.extractionEngine, "PyMuPDF 1.24");
  assert.deepEqual(item.extractionWarnings, ["OCR used on page 2"]);
  assert.equal(item.checksumSha256, "a".repeat(64));
  assert.equal(item.fileSizeBytes, 1024);
});

test("detects duplicate downloaded PDF content by SHA-256", () => {
  const checksum = "b".repeat(64);
  const existing = [{ id: "document-existing", title: "Existing report", checksumSha256: checksum }];
  assert.equal(findDuplicateByChecksum(existing, checksum).id, "document-existing");
  assert.equal(findDuplicateByChecksum(existing, checksum, "document-existing"), null);
  assert.equal(findDuplicateByChecksum(existing, "not-a-checksum"), null);
});
