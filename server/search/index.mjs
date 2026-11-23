const SEARCH_ALIASES = new Map([
  ["iaf", ["indian air force", "air force"]],
  ["mod", ["ministry of defence", "defence ministry"]],
  ["pib", ["press information bureau"]],
  ["anc", ["andaman and nicobar command"]],
  ["amca", ["advanced medium combat aircraft"]],
  ["lca", ["light combat aircraft", "tejas"]],
  ["mrca", ["multi role combat aircraft"]],
  ["mrfa", ["multi role fighter aircraft"]],
  ["ssn", ["nuclear powered attack submarine"]],
  ["ssbn", ["nuclear powered ballistic missile submarine"]],
  ["s-400", ["s400", "triumpf"]],
  ["drdo", ["defence research and development organisation"]],
  ["hal", ["hindustan aeronautics limited"]],
  ["bel", ["bharat electronics limited"]],
  ["lch", ["light combat helicopter", "prachand"]],
  ["alh", ["advanced light helicopter", "dhruv"]],
  ["uav", ["unmanned aerial vehicle", "drone"]],
  ["ucav", ["unmanned combat aerial vehicle"]],
  ["bmd", ["ballistic missile defence"]],
  ["qrsam", ["quick reaction surface to air missile"]],
  ["mrsam", ["medium range surface to air missile"]],
]);

export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function tokenizeSearch(value) {
  return normalizeSearchText(value).split(" ").filter((term) => term.length > 0);
}

function expandedTerms(query) {
  const tokens = tokenizeSearch(query);
  const alternatives = tokens.map((token) => [
    [token],
    ...(SEARCH_ALIASES.get(token) ?? []).map(tokenizeSearch),
  ]);
  return { tokens, alternatives };
}

function fieldScore(value, terms, query) {
  const normalized = normalizeSearchText(value);
  if (!normalized) return 0;
  if (normalized === query) return 100;
  if (normalized.startsWith(query)) return 65;
  if (normalized.includes(query)) return 48;
  const words = new Set(tokenizeSearch(normalized));
  const matched = terms.filter((term) => words.has(term));
  if (!matched.length) return 0;
  return Math.round((matched.length / terms.length) * 28);
}

export function scoreSearchRecord(record, query) {
  const normalizedQuery = normalizeSearchText(query);
  const { tokens, alternatives } = expandedTerms(query);
  if (!normalizedQuery || !tokens.length) return 0;

  const fields = record.searchFields ?? {
    title: record.title,
    section: record.section,
    summary: record.summary,
    body: record.body,
  };
  const normalizedValues = Object.values(fields).map(normalizeSearchText);
  const wordSets = normalizedValues.map((value) => new Set(value.split(" ")));
  const allTermsMatch = alternatives.every((options) =>
    options.some((option) =>
      wordSets.some((words) => option.every((term) => words.has(term))),
    ),
  );
  const expanded = [...new Set(alternatives.flatMap((options) => options.flat()))];
  const phraseMatch = normalizedValues.some((value) => value.includes(normalizedQuery));
  if (!allTermsMatch && !phraseMatch) return 0;

  const titleScore = fieldScore(fields.title, expanded, normalizedQuery);
  const nameScore = fieldScore(fields.name, expanded, normalizedQuery);
  const categoryScore = fieldScore(fields.category, expanded, normalizedQuery);
  const summaryScore = fieldScore(fields.summary, expanded, normalizedQuery);
  const bodyScore = fieldScore(fields.body, expanded, normalizedQuery);
  const tokenCoverage = alternatives.filter((options) =>
    options.some((option) => wordSets.some((words) => option.every((term) => words.has(term)))),
  ).length / tokens.length;

  return (
    titleScore * 4 +
    nameScore * 2 +
    categoryScore * 1.5 +
    summaryScore +
    bodyScore * 0.35 +
    tokenCoverage * 20 +
    (phraseMatch ? 35 : 0) +
    (allTermsMatch ? 25 : 0)
  );
}

export function searchRecords(records, query, { section = "all", limit = 40 } = {}) {
  const normalizedQuery = normalizeSearchText(query);
  if (tokenizeSearch(normalizedQuery).length === 0) return [];
  return records
    .filter((record) => section === "all" || record.section === section)
    .map((record) => ({ ...record, score: scoreSearchRecord(record, normalizedQuery) }))
    .filter((record) => record.score > 0)
    .sort((left, right) =>
      right.score - left.score ||
      left.title.localeCompare(right.title) ||
      left.id.localeCompare(right.id),
    )
    .slice(0, Math.max(1, Math.min(100, limit)))
    .map(({ score, searchFields, body, ...record }) => record);
}
