import { useEffect, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { apiGet, apiPost, apiRequest } from "../../services/api";
import type { ReviewArticle, SourcesProps } from "./types";

export default function Sources({
  articles, setArticles, articleState, articleFilter, setArticleFilter,
  reviewStateFilter, setReviewStateFilter, sourceRegistry, setSourceRegistry,
  adminToken, setAdminToken, setComposerError, setShowComposer,
  RagMonitorStatus: Status, ReviewControls: Controls, SourceRegistry: Registry,
}: SourcesProps) {
    const [sourceQuery, setSourceQuery] = useState("");
    useEffect(() => { const saved = sessionStorage.getItem("raksha-search-query"); const section = sessionStorage.getItem("raksha-search-section"); if (saved && section === "Sources") { setSourceQuery(saved); sessionStorage.removeItem("raksha-search-query"); sessionStorage.removeItem("raksha-search-target"); sessionStorage.removeItem("raksha-search-section"); } }, []);
    const [syncState, setSyncState] = useState("ready");
    const [showFeedForm, setShowFeedForm] = useState(false);
    const [feedName, setFeedName] = useState("");
    const [feedUrl, setFeedUrl] = useState("");
    const [feedDiscovery, setFeedDiscovery] = useState(false);
    const [feedSaving, setFeedSaving] = useState(false);
    const [feedError, setFeedError] = useState("");
    const runSync = async () => {
      setSyncState("running");
      try {
        await apiRequest<unknown>("/api/refresh", {
          method: "POST",
          headers: adminToken ? { Authorization: "Bearer " + adminToken } : {},
        });
        setSyncState("complete");
        const refreshed = await apiGet<{ items?: ReviewArticle[] }>("/api/articles");
        setArticles(refreshed.items ?? []);
      } catch {
        setSyncState("failed");
      }
    };
    const saveToken = (value: string) => {
      setAdminToken(value);
      if (value) sessionStorage.setItem("raksha-admin-token", value);
      else sessionStorage.removeItem("raksha-admin-token");
    };
    const addFeed = async () => {
      setFeedError("");
      if (!feedName.trim() || !feedUrl.trim()) {
        setFeedError("Enter a source name and public HTTPS RSS URL.");
        return;
      }
      setFeedSaving(true);
      try {
        const result = await apiPost<{ source: { id: string; name: string; url: string; notes: string } }, { name: string; url: string; discovery: boolean }>(
          "/api/monitor-sources",
          { name: feedName.trim(), url: feedUrl.trim(), discovery: feedDiscovery },
          { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} },
        );
        setSourceRegistry((previous) => [
          ...previous,
          {
            id: result.source.id,
            name: result.source.name,
            url: result.source.url,
            sourceType: "operator-added RSS",
            official: false,
            defaultStatus: "unverified",
            reliabilityNotes: result.source.notes,
            active: true,
          },
        ]);
        setFeedName("");
        setFeedUrl("");
        setShowFeedForm(false);
      } catch (error) {
        setFeedError(error instanceof Error ? error.message : "Could not add source.");
      } finally {
        setFeedSaving(false);
      }
    };
    return (
      <section className="page-section">
        <div className="page-hero">
          <span className="section-kicker">PROVENANCE / REVIEW DESK</span>
          <h1>
            Show your <em>work.</em>
          </h1>
          <p>
            Automatic collection adds public headlines and short excerpts as unreviewed
            candidates. Review each item before upgrading a claim; the original source
            is always linked.
          </p>
        </div>
        <Status />
        <div className="setup-card">
          <span className="section-kicker">CHATBOT & SCHEDULE / OPERATOR SETUP</span>
          <h2>What must be configured</h2>
          <p>
            The chatbot and collectors run on the backend. Add secrets to a local{" "}
            <code>.env</code> file (never to frontend code or chat), then restart the
            API.
          </p>
          <div className="setup-grid">
            <div>
              <strong>Chat answers</strong>
              <code>OPENAI_API_KEY=…</code>
              <small>
                Enables sourced RAG answers; optional live search uses{" "}
                <code>RAG_WEB_SEARCH=true</code>.
              </small>
            </div>
            <div>
              <strong>Automatic refresh</strong>
              <small>
                Run the backend continuously on your host. Its scheduler requests hourly
                news discovery and a 04:00 Asia/Kolkata reference sync. Check the source
                monitor after the first cycle.
              </small>
            </div>
            <div>
              <strong>Optional source APIs</strong>
              <code>YOUTUBE_API_KEY=…</code>
              <code>X_BEARER_TOKEN=…</code>
              <small>
                Optional. Use RSS feeds where available; keep source handles/feed URLs
                in the server source configuration.
              </small>
            </div>
            <div>
              <strong>Persistent hosted storage</strong>
              <code>DATABASE_URL=…</code>
              <small>
                Optional PostgreSQL. Without it, local JSON storage can be lost when a
                host replaces its filesystem.
              </small>
            </div>
          </div>
          <p className="setup-footnote">
            Never commit <code>.env</code>. Chat answers quote and link retrieved public
            records; model configuration does not make a claim verified. The scheduled
            refresh begins only after the API process is running on an always-on host.
          </p>
        </div>
        <div className="review-key-row">
          <label>
            Admin token for hosted review actions{" "}
            <input
              type="password"
              value={adminToken}
              onChange={(event) => saveToken(event.target.value)}
              placeholder="Only needed when deployed with RAKSHA_ADMIN_TOKEN"
            />
          </label>
          <button
            className="catalog-more"
            onClick={runSync}
            disabled={syncState === "running"}
          >
            {syncState === "running" ? "Refreshing sources…" : "Run refresh now"}
          </button>
          <button
            className="catalog-more"
            onClick={() => {
              setComposerError("");
              setShowComposer(true);
            }}
          >
            Add source note
          </button>
          <button
            className="catalog-more"
            onClick={() => {
              setFeedError("");
              setShowFeedForm((value) => !value);
            }}
          >
            Add RSS feed
          </button>
          <span>
            {syncState === "complete"
              ? "Refresh complete"
              : syncState === "failed"
                ? "Refresh failed / check token or API"
                : "News discovery hourly · full references 04:00 IST"}
          </span>
        </div>
        {showFeedForm && (
          <div className="review-key-row">
            <label>
              Publisher or feed name
              <input
                value={feedName}
                onChange={(event) => setFeedName(event.target.value)}
                placeholder="Publisher name"
              />
            </label>
            <label>
              Public HTTPS RSS URL
              <input
                type="url"
                value={feedUrl}
                onChange={(event) => setFeedUrl(event.target.value)}
                placeholder="https://publisher.example/rss.xml"
              />
            </label>
            <label className="feed-kind-check">
              <input
                type="checkbox"
                checked={feedDiscovery}
                onChange={(event) => setFeedDiscovery(event.target.checked)}
              />{" "}
              This is a search/discovery feed
            </label>
            <button className="catalog-more" onClick={addFeed} disabled={feedSaving}>
              {feedSaving ? "Adding…" : "Save feed"}
            </button>
            {feedError && <small className="review-error">{feedError}</small>}
            <small>
              New feeds are treated as unverified. The hourly worker fetches RSS/Atom;
              it does not scrape full article text.
            </small>
          </div>
        )}
        <div className="article-toolbar">
          <div>
            <span className="section-kicker">COLLECTED ITEMS / REVIEW QUEUE</span>
            <strong>{articleState === "ready" ? articles.length : "—"}</strong>
          </div>
          <select
            value={articleFilter}
            onChange={(event) => setArticleFilter(event.target.value)}
            aria-label="Filter article verification status"
          >
            <option value="all">All verification labels</option>
            <option value="unverified">Unverified</option>
            <option value="reported">Reported</option>
            <option value="verified">Verified</option>
            <option value="official">Official</option>
            <option value="disputed">Disputed</option>
            <option value="corrected">Corrected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <select
            value={reviewStateFilter}
            onChange={(event) => setReviewStateFilter(event.target.value)}
            aria-label="Filter article review state"
          >
            <option value="all">All review states</option>
            <option value="unreviewed">Needs review</option>
            <option value="in_review">In review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Removed from active feed</option>
          </select>
        </div>
        {articleState === "loading" && (
          <div className="data-state">Loading source records…</div>
        )}
        {articleState === "error" && (
          <div className="data-state error-state">
            Unable to load source records. Check that the API is running.
          </div>
        )}
        {articleState === "ready" && articles.length === 0 && (
          <div className="data-state">No records match these filters.</div>
        )}
        {articleState === "ready" && (
          <div className="article-list">
            {articles.map((article) => (
              <article className="article-item review-article" key={article.id}>
                <div className="review-article-copy">
                  <span className={"verification-chip " + article.verificationStatus}>
                    {article.verificationStatus}
                  </span>
                  <span className="verification-chip">
                    {article.reviewState.replace(/_/g, " ")}
                  </span>
                  <h3>{article.title}</h3>
                  <p>
                    {article.sourceId} ·{" "}
                    {article.summary ??
                      "Open the linked publisher item for full context."}
                  </p>
                  <a
                    className="read-link"
                    href={article.canonicalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open original source <ArrowUpRight size={13} />
                  </a>
                </div>
                <Controls
                  article={article}
                  adminToken={adminToken}
                  onSaved={(saved) =>
                    setArticles((previous) =>
                      previous
                        .map((item) => (item.id === saved.id ? saved : item))
                        .filter(
                          (item) =>
                            reviewStateFilter !== "all" ||
                            item.reviewState !== "rejected",
                        ),
                    )
                  }
                />
              </article>
            ))}
          </div>
        )}
        <label className="command-search"><Search size={15}/><input value={sourceQuery} onChange={(event) => setSourceQuery(event.target.value)} placeholder="Search source, publisher or URL"/></label>
        <Registry
          sources={sourceRegistry}
          adminToken={adminToken}
          query={sourceQuery}
          onUpdated={(updated) =>
            setSourceRegistry((previous) =>
              previous.map((source) => (source.id === updated.id ? updated : source)),
            )
          }
        />
      </section>
    );
}
