import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { fetchWithRetry } from "../collectors/fetch-with-retry.mjs";

const robotsCache = new Map();

function isPrivateIp(address) {
  if (isIP(address) === 4) {
    const octets = address.split(".").map(Number);
    return (
      octets[0] === 0 ||
      octets[0] === 10 ||
      octets[0] === 127 ||
      (octets[0] === 169 && octets[1] === 254) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      octets[0] >= 224
    );
  }
  return (
    isIP(address) === 6 &&
    (address === "::1" ||
      address === "::" ||
      /^f[cd]/i.test(address) ||
      /^fe[89ab]/i.test(address) ||
      address.toLowerCase().startsWith("::ffff:127."))
  );
}
export async function validatePublicHttps(url) {
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password)
    throw new Error(
      "Only public HTTPS article URLs are eligible for metadata extraction.",
    );
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  )
    throw new Error("Private host blocked.");
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((entry) => isPrivateIp(entry.address)))
    throw new Error("Private or unresolved host blocked.");
}
async function allowedByRobots(url) {
  const origin = url.origin;
  if (robotsCache.has(origin))
    return robotsCache.get(origin)(url.pathname + url.search);
  let rules = [];
  try {
    const robotsUrl = new URL("/robots.txt", origin);
    await validatePublicHttps(robotsUrl);
    const response = await fetchWithRetry(
      robotsUrl,
      {
        redirect: "manual",
        headers: { "User-Agent": "RakshaAtlas/1.0 (+public metadata only)" },
      },
      { attempts: 2, timeoutMs: 5_000 },
    );
    if (response.status === 404) rules = [];
    else if (!response.ok || response.status >= 300) return false;
    else {
      const lines = (await response.text()).split(/\r?\n/);
      let active = false;
      for (const rawLine of lines) {
        const line = rawLine.split("#")[0].trim();
        const [key, ...parts] = line.split(":");
        if (!key) continue;
        const value = parts.join(":").trim();
        if (/^user-agent$/i.test(key)) {
          active = value === "*" || /rakshaatlas/i.test(value);
          continue;
        }
        if (active && /^(disallow|allow)$/i.test(key) && value)
          rules.push({ allow: /^allow$/i.test(key), path: value });
      }
    }
  } catch {
    return false;
  }
  const evaluator = (path) => {
    const matches = rules
      .filter((rule) => path.startsWith(rule.path))
      .sort((a, b) => b.path.length - a.path.length);
    return !matches.length || matches[0].allow;
  };
  robotsCache.set(origin, evaluator);
  return evaluator(url.pathname + url.search);
}
function readMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match =
    html.match(
      new RegExp(
        `<meta\\b(?=[^>]*(?:property|name)=["']${escaped}["'])[^>]*content=["']([^"']*)["'][^>]*>`,
        "i",
      ),
    ) ||
    html.match(
      new RegExp(
        `<meta\\b(?=[^>]*content=["']([^"']*)["'])[^>]*(?:property|name)=["']${escaped}["'][^>]*>`,
        "i",
      ),
    );
  return (match?.[1] || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();
}
export async function extractArticleMetadata(rawUrl) {
  let url = new URL(rawUrl);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    await validatePublicHttps(url);
    if (!(await allowedByRobots(url)))
      throw new Error(
        "Publisher robots.txt does not permit metadata extraction or robots status could not be checked.",
      );
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent":
          "RakshaAtlas/1.0 (+public metadata; contact configured by operator)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("Redirect limit exceeded.");
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new Error(`Article page returned HTTP ${response.status}`);
    const type = response.headers.get("content-type") || "";
    if (!/text\/html|application\/xhtml\+xml/i.test(type))
      throw new Error("Publisher did not return an HTML page.");
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Empty response body.");
    const chunks = [];
    let size = 0;
    while (size < 1_000_000) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = value.subarray(0, 1_000_000 - size);
      chunks.push(chunk);
      size += chunk.length;
      if (chunk.length !== value.length) break;
    }
    const html = Buffer.concat(chunks).toString("utf8");
    let imageUrl = readMeta(html, "og:image");
    if (imageUrl)
      try {
        const image = new URL(imageUrl, url);
        await validatePublicHttps(image);
        imageUrl = image.href;
      } catch {
        imageUrl = null;
      }
    return {
      canonicalUrl: url.href,
      title: readMeta(html, "og:title"),
      description: readMeta(html, "og:description") || readMeta(html, "description"),
      imageUrl,
      author: readMeta(html, "author"),
      publishedAt: readMeta(html, "article:published_time"),
      imageLicense: "unknown",
      imageReusePermitted: false,
      extractionNote: "Open Graph metadata only; full publisher text was not copied.",
    };
  }
  throw new Error("Metadata extraction failed.");
}
