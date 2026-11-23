import { createHash } from "node:crypto";

const DOCUMENT_TYPES = ["annual_report","policy","doctrine","parliamentary_report","press_release","tender","technical_publication","other"];
const EXTRACTION_STATUSES = ["not_extracted","metadata_only","text_extracted","needs_ocr","failed"];
const EVIDENCE_STATUSES = ["unreviewed","official","verified","reported","disputed","withdrawn"];

export function canonicalizeDocumentUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Only public HTTPS document URLs are accepted.");
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.href;
}

export function findDuplicateByChecksum(records, checksumSha256, excludeId = null) {
  if (!/^[a-f0-9]{64}$/i.test(checksumSha256 ?? "")) return null;
  return records.find((item) => item.id !== excludeId && item.checksumSha256 === checksumSha256.toLowerCase()) ?? null;
}

export function normalizeDocument(input, existing = []) {
  const title = String(input.title ?? "").trim();
  const publisher = String(input.publisher ?? "").trim();
  if (!title || !publisher) throw new Error("title and publisher are required.");
  if (title.length > 300 || publisher.length > 160) throw new Error("title or publisher exceeds the allowed length.");
  const originalUrl = String(input.originalUrl ?? input.url ?? "").trim();
  const canonicalUrl = canonicalizeDocumentUrl(originalUrl);
  const duplicate = existing.find((item) => item.canonicalUrl === canonicalUrl);
  if (duplicate) throw new Error("This document URL is already registered.");
  const documentType = DOCUMENT_TYPES.includes(input.documentType) ? input.documentType : "other";
  const publishedAt = input.publishedAt ? new Date(input.publishedAt).toISOString() : null;
  const extractedText = typeof input.extractedText === "string" ? input.extractedText.trim().slice(0, 200000) : "";
  const pages = Array.isArray(input.pages) ? input.pages.slice(0, 500).map((page) => ({
    page: Math.max(1, Math.floor(Number(page.page) || 1)),
    text: String(page.text ?? "").slice(0, 20000),
  })) : [];
  const extractionStatus = EXTRACTION_STATUSES.includes(input.extractionStatus)
    ? input.extractionStatus
    : extractedText || pages.length ? "text_extracted" : "metadata_only";
  const evidenceStatus = EVIDENCE_STATUSES.includes(input.evidenceStatus) ? input.evidenceStatus : "unreviewed";
  return {
    id: String(input.id || `document-${createHash("sha256").update(canonicalUrl).digest("hex").slice(0, 16)}`),
    title,
    publisher,
    publishedAt,
    documentType,
    service: String(input.service ?? "Joint / General").slice(0, 80),
    sourceId: String(input.sourceId ?? "").slice(0, 100) || null,
    originalUrl,
    canonicalUrl,
    fileFormat: String(input.fileFormat ?? (new URL(canonicalUrl).pathname.split(".").pop() || "web")).toLowerCase().slice(0, 12),
    fileSizeBytes: Number.isFinite(Number(input.fileSizeBytes)) && Number(input.fileSizeBytes) >= 0 ? Number(input.fileSizeBytes) : null,
    checksumSha256: /^[a-f0-9]{64}$/i.test(input.checksumSha256 ?? "") ? input.checksumSha256.toLowerCase() : null,
    retrievedAt: input.retrievedAt || new Date().toISOString(),
    extractionStatus,
    extractedText,
    pages,
    pageCount: input.pageCount === null || input.pageCount === undefined ? (pages.length || null) : Number.isFinite(Number(input.pageCount)) ? Number(input.pageCount) : null,
    extractedTitle: String(input.extractedTitle ?? "").slice(0, 300) || null,
    ocrPages: Array.isArray(input.ocrPages) ? input.ocrPages.slice(0, 300).map(Number).filter((value) => Number.isInteger(value) && value > 0) : [],
    extractionEngine: String(input.extractionEngine ?? "").slice(0, 100) || null,
    extractionWarnings: Array.isArray(input.extractionWarnings) ? input.extractionWarnings.slice(0, 30).map((value) => String(value).slice(0, 300)) : [],
    evidenceStatus,
    summary: String(input.summary ?? "").slice(0, 2000),
    notes: String(input.notes ?? "").slice(0, 1000),
  };
}

export const documentFilters = { documentTypes: DOCUMENT_TYPES, extractionStatuses: EXTRACTION_STATUSES, evidenceStatuses: EVIDENCE_STATUSES };
