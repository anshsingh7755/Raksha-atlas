export function canonicalArticleKey(article) {
  try {
    const url = new URL(article.canonicalUrl);
    const releaseId = url.searchParams.get("PRID") || url.searchParams.get("relid");
    if (releaseId) return `release:${releaseId}`;
    url.hash = "";
    for (const key of [...url.searchParams.keys()])
      if (/^(utm_|fbclid|gclid)/i.test(key)) url.searchParams.delete(key);
    return url.toString().replace(/\/$/, "");
  } catch {
    return article.canonicalUrl;
  }
}
const normalizeHeadline = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(
      (token) =>
        token.length > 2 &&
        ![
          "india",
          "indian",
          "defence",
          "defense",
          "says",
          "will",
          "could",
          "from",
          "with",
          "after",
          "over",
        ].includes(token),
    );
export function headlineSimilarity(left, right) {
  const a = new Set(normalizeHeadline(left));
  const b = new Set(normalizeHeadline(right));
  if (Math.min(a.size, b.size) < 4) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common += 1;
  return common / (a.size + b.size - common);
}
export function contentSimilarity(left, right) {
  const a = new Set(normalizeHeadline(left));
  const b = new Set(normalizeHeadline(right));
  if (Math.min(a.size, b.size) < 18) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common += 1;
  return common / (a.size + b.size - common);
}
export function findStoryMatch(candidate, existing, threshold = 0.84) {
  return (
    existing.find(
      (article) =>
        headlineSimilarity(candidate.title, article.title) >= threshold ||
        contentSimilarity(
          `${candidate.summary || ""} ${candidate.contentExcerpt || ""}`,
          `${article.summary || ""} ${article.contentExcerpt || ""}`,
        ) >= 0.9,
    ) || null
  );
}
