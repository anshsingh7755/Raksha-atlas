const youtubeSource = (now) => ({
  id: "youtube-public-search",
  name: "YouTube public video search",
  url: "https://www.youtube.com/",
  sourceType: "YouTube Data API v3",
  official: false,
  defaultStatus: "reported",
  language: "en",
  active: true,
  reliabilityNotes:
    "Public video metadata only; channel identity and claims require human review. Transcripts are not collected by this connector.",
  termsReviewedAt: null,
  lastCheckedAt: now,
});
export async function collectYouTube(config, apiKey, now = new Date().toISOString()) {
  if (!config?.active)
    return {
      source: null,
      items: [],
      skipped: "YouTube connector is disabled.",
    };
  if (!apiKey)
    return {
      source: null,
      items: [],
      skipped: "Set YOUTUBE_API_KEY to enable YouTube Data API collection.",
    };
  const source = youtubeSource(now);
  const items = [];
  const errors = [];
  const after = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const searchTerms = config.searchTerms || [];
  const cursor = Number(config.searchCursor || 0) % Math.max(1, searchTerms.length);
  const searchCount = Math.max(
    0,
    Math.min(3, Number(process.env.YOUTUBE_SEARCHES_PER_RUN || 1)),
  );
  const searches = searchTerms.length
    ? Array.from(
        { length: Math.min(searchCount, searchTerms.length) },
        (_, offset) => ({
          q: searchTerms[(cursor + offset) % searchTerms.length],
        }),
      )
    : [];
  for (const search of searches) {
    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.search = new URLSearchParams({
        part: "snippet",
        type: "video",
        order: "date",
        maxResults: String(config.maxResultsPerSearch || 10),
        publishedAfter: after,
        ...(search.q ? { q: search.q } : {}),
        ...(search.channelId ? { channelId: search.channelId } : {}),
        key: apiKey,
      }).toString();
      const response = await fetchWithRetry(
        url,
        {},
        { attempts: 3, timeoutMs: 18_000 },
      );
      if (!response.ok) throw new Error(`YouTube HTTP ${response.status}`);
      const result = await response.json();
      for (const row of result.items || []) {
        const videoId = row.id?.videoId;
        const snippet = row.snippet || {};
        if (!videoId) continue;
        items.push({
          title: snippet.title || "Untitled video",
          url: `https://www.youtube.com/watch?v=${videoId}`,
          summary:
            `${snippet.channelTitle || search.channelName || "YouTube channel"}. ${snippet.description || ""}`.slice(
              0,
              1400,
            ),
          publishedAt: snippet.publishedAt,
          author: snippet.channelTitle,
          channelName: snippet.channelTitle,
          mediaType: "YouTube video metadata",
        });
      }
    } catch (error) {
      errors.push({
        query: search.q || search.channelId,
        error: error.message || "YouTube query failed",
      });
    }
  }
  const channels = (config.channelsToConfirm || []).filter(
    (channel) => channel.active && channel.channelId,
  );
  if (channels.length) {
    try {
      const channelsUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
      channelsUrl.search = new URLSearchParams({
        part: "contentDetails",
        id: channels.map((channel) => channel.channelId).join(","),
        key: apiKey,
      }).toString();
      const channelResponse = await fetchWithRetry(
        channelsUrl,
        {},
        { attempts: 3, timeoutMs: 18_000 },
      );
      if (!channelResponse.ok)
        throw new Error(`YouTube channels HTTP ${channelResponse.status}`);
      const channelResult = await channelResponse.json();
      const uploads = new Map(
        (channelResult.items || []).map((row) => [
          row.id,
          row.contentDetails?.relatedPlaylists?.uploads,
        ]),
      );
      for (const channel of channels) {
        const playlistId = uploads.get(channel.channelId);
        if (!playlistId) continue;
        const playlistUrl = new URL(
          "https://www.googleapis.com/youtube/v3/playlistItems",
        );
        playlistUrl.search = new URLSearchParams({
          part: "snippet",
          playlistId,
          maxResults: String(config.maxResultsPerSearch || 10),
          key: apiKey,
        }).toString();
        const playlistResponse = await fetchWithRetry(
          playlistUrl,
          {},
          { attempts: 3, timeoutMs: 18_000 },
        );
        if (!playlistResponse.ok)
          throw new Error(`YouTube uploads playlist HTTP ${playlistResponse.status}`);
        const playlist = await playlistResponse.json();
        for (const row of playlist.items || []) {
          const snippet = row.snippet || {};
          const videoId = snippet.resourceId?.videoId;
          if (!videoId) continue;
          items.push({
            title: snippet.title || "Untitled video",
            url: `https://www.youtube.com/watch?v=${videoId}`,
            summary: `${channel.name}. ${snippet.description || ""}`.slice(0, 1400),
            publishedAt: snippet.publishedAt,
            author: channel.name,
            channelName: channel.name,
            mediaType: "YouTube channel video metadata",
          });
        }
      }
    } catch (error) {
      errors.push({
        query: "configured channels",
        error: error.message || "YouTube channel query failed",
      });
    }
  }
  source.lastCheck = {
    ok: errors.length === 0,
    checkedAt: now,
    searchesCompleted: searches.length,
    errors,
  };
  return {
    source,
    items,
    errors,
    nextSearchCursor: searchTerms.length
      ? (cursor + Math.max(1, searchCount)) % searchTerms.length
      : 0,
  };
}
import { fetchWithRetry } from "./fetch-with-retry.mjs";
