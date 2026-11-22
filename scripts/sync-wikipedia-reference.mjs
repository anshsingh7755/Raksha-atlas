import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pages = [
  {
    id: "wiki-army-equipment",
    title: "List of equipment of the Indian Army",
    url: "https://en.wikipedia.org/wiki/List_of_equipment_of_the_Indian_Army",
  },
  {
    id: "wiki-active-aircraft",
    title: "List of active Indian military aircraft",
    url: "https://en.wikipedia.org/wiki/List_of_active_Indian_military_aircraft",
  },
  {
    id: "wiki-active-navy-ships",
    title: "List of active Indian Navy ships",
    url: "https://en.wikipedia.org/wiki/List_of_active_Indian_Navy_ships",
  },
  {
    id: "wiki-army-regiments",
    title: "List of regiments and corps of the Indian Army",
    url: "https://en.wikipedia.org/wiki/List_of_regiments_and_corps_of_the_Indian_Army",
  },
  {
    id: "wiki-future-air-force",
    title: "Future of the Indian Air Force",
    url: "https://en.wikipedia.org/wiki/Future_of_the_Indian_Air_Force",
  },
  {
    id: "wiki-future-navy",
    title: "Future of the Indian Navy",
    url: "https://en.wikipedia.org/wiki/Future_of_the_Indian_Navy",
  },
  {
    id: "wiki-integrated-rocket-force",
    title: "Integrated Rocket Force (India)",
    url: "https://en.wikipedia.org/wiki/Integrated_Rocket_Force_(India)",
  },
  {
    id: "drones-of-india",
    title: "Drones of India — open-source UAV catalogue",
    url: "https://duorope.github.io/Drones-of-India/",
  },
];
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
function clean(html) {
  return decode(
    html
      .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<br\s*\/?\s*>/gi, " / ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}
function extract(html) {
  const tables = [];
  const re = /<table\b([^>]*)>([\s\S]*?)<\/table>/gi;
  for (const m of html.matchAll(re)) {
    const before = html.slice(0, m.index);
    const hs = [...before.matchAll(/<h([2-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
    const section = hs.length ? clean(hs.at(-1)[2]) : "General";
    const rows = [];
    for (const tr of m[2].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...tr[1].matchAll(/<(th|td)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((c) =>
        clean(c[2]),
      );
      if (cells.some(Boolean)) rows.push(cells);
    }
    if (rows.length > 1) {
      const hi = rows.findIndex((row) =>
        /^(name|class|aircraft|ship|boat|weapon|system|model|type|no\.?|quantity|origin)/i.test(
          row[0] ?? "",
        ),
      );
      const headers = hi >= 0 ? rows[hi] : rows[0].map((_, i) => `Column ${i + 1}`);
      const body = hi >= 0 ? rows.slice(hi + 1) : rows.slice(1);
      tables.push({
        section,
        headers,
        rows: body.filter((row) => row.some(Boolean)),
      });
    }
  }
  return tables;
}
const out = join(root, "server", "wikipedia-equipment.json");
let previous = { pages: [] };
try {
  previous = JSON.parse(await (await import("node:fs/promises")).readFile(out, "utf8"));
} catch {}
const results = [];
for (const page of pages) {
  try {
    const response = await fetch(page.url, {
      signal: AbortSignal.timeout(20000),
      headers: {
        "User-Agent": "RakshaAtlas/0.1 (public research; contact: project owner)",
      },
    });
    if (!response.ok) throw Error(`HTTP ${response.status}`);
    const html = await response.text();
    results.push({
      ...page,
      fetchedAt: new Date().toISOString(),
      referenceOnly: true,
      stale: false,
      refreshError: null,
      tables: extract(html),
    });
  } catch (error) {
    const prior = previous.pages.find((x) => x.id === page.id);
    results.push(
      prior
        ? {
            ...prior,
            refreshError: String(error.message || error),
            stale: true,
          }
        : {
            ...page,
            fetchedAt: null,
            referenceOnly: true,
            tables: [],
            refreshError: String(error.message || error),
            stale: true,
          },
    );
  }
}
await mkdir(dirname(out), { recursive: true });
await writeFile(
  out,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      method:
        "Public source tables extracted as secondary reference; not official verification",
      pages: results,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);
console.log(
  JSON.stringify(
    results.map(({ id, tables, refreshError }) => ({
      id,
      tableCount: tables.length,
      rowCount: tables.reduce((s, t) => s + t.rows.length, 0),
      refreshError,
    })),
    null,
    2,
  ),
);
