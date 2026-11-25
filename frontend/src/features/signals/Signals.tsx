import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

type SignalArticle = {
  id: string;
  title: string;
  summary?: string;
  canonicalUrl: string;
  verificationStatus: string;
  reviewState: string;
  sourceId: string;
  publishedAt?: string | null;
  category?: string;
  keywords?: string[];
  imageUrl?: string;
  imageReusePermitted?: boolean;
  relatedSources?: Array<{ sourceId: string; url: string; title?: string }>;
};
type SignalSource = {
  id: string;
  name: string;
  official: boolean;
};

function SignalFeed({
  articles,
  sources,
  onReview,
}: {
  articles: SignalArticle[];
  sources: SignalSource[];
  onReview: () => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => { const saved = sessionStorage.getItem("raksha-search-query"); if (saved) { setQuery(saved); sessionStorage.removeItem("raksha-search-query"); } }, []);
  const [category, setCategory] = useState("all");
  const [publisher, setPublisher] = useState("all");
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const publisherName = (sourceId: string) =>
    sourceById.get(sourceId)?.name ?? sourceId;
  const publishers = [...new Set(articles.map((article) => article.sourceId))]
    .map((sourceId) => ({ id: sourceId, name: publisherName(sourceId) }))
    .sort((left, right) => left.name.localeCompare(right.name));
  const categories = [
    ...new Set(
      articles
        .map((article) => article.category)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort();
  const visible = articles
    .filter(
      (article) =>
        article.reviewState !== "rejected" &&
        (publisher === "all" || article.sourceId === publisher) &&
        (category === "all" || article.category === category) &&
        (!query ||
          `${article.title} ${article.summary ?? ""} ${article.sourceId} ${(article.keywords ?? []).join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    )
    .slice(0, 100);
  return (
    <section className="page-section">
      <div className="page-hero">
        <span className="section-kicker">
          SIGNAL ROOM / HOURLY PUBLIC SOURCE MONITOR
        </span>
        <h1>
          New reports, <em>with provenance.</em>
        </h1>
        <p>
          Collected reports are published as leads with source and review labels.
          Automated classification and summaries organize coverage; they do not verify
          the underlying claims.
        </p>
      </div>
      <div className="article-toolbar">
        <select value={publisher} onChange={(event) => setPublisher(event.target.value)} aria-label="Filter reports by publisher">
          <option value="all">All publishers</option>
          {publishers.map((source) => (
            <option key={source.id} value={source.id}>{source.name}</option>
          ))}
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search headlines, sources, keywords…"
          aria-label="Search collected reports"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter collected reports by category"
        >
          <option value="all">All categories</option>
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <strong>{visible.length} leads</strong>
      </div>
      <div className="auto-discovery-list">
        {visible.length === 0 ? (
          <div className="data-state">
            No reports match these filters. ETDefence is currently provided as a publisher link until RSS republication permission is confirmed.
          </div>
        ) : (
          visible.map((article) => (
            <article className="article-item" key={article.id}>
              <div>
                {article.imageUrl && article.imageReusePermitted && (
                  <img
                    className="lead-image"
                    src={article.imageUrl}
                    alt="Publisher supplied article image"
                    loading="lazy"
                  />
                )}
                <span className={"verification-chip " + article.verificationStatus}>
                  {article.verificationStatus}
                </span>
                {sourceById.get(article.sourceId)?.official && (
                  <span className="verification-chip official">Official publisher</span>
                )}
                <span className="verification-chip">
                  {article.reviewState.replace(/_/g, " ")}
                </span>
                {article.category && (
                  <span className="verification-chip">{article.category}</span>
                )}
                <span className="publisher-source-chip">{publisherName(article.sourceId)}</span>
                <h3>{article.title}</h3>
                <p>{article.summary || "Open the linked source for details."}</p>
                <small>
                  {publisherName(article.sourceId)}
                  {article.publishedAt
                    ? ` · ${new Date(article.publishedAt).toLocaleString("en-IN")}`
                    : " · date not supplied"}
                  {article.relatedSources?.length
                    ? ` · ${article.relatedSources.length + 1} reporting sources grouped`
                    : ""}
                </small>
                {article.relatedSources?.map((source) => (
                  <a
                    className="read-link"
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    key={source.url}
                  >
                    Also reported by {publisherName(source.sourceId)} <ArrowUpRight size={12} />
                  </a>
                ))}
              </div>
              <div className="lead-actions">
                <a href={article.canonicalUrl} target="_blank" rel="noreferrer">
                  Open original source <ArrowUpRight size={14} />
                </a>
              </div>
            </article>
          ))
        )}
      </div>
      <div className="publisher-source-directory">
        <span>Publisher links</span>
        <a href="https://idrw.org/" target="_blank" rel="noreferrer">IDRW <ArrowUpRight size={11} /></a>
        <a href="https://defence.economictimes.indiatimes.com/" target="_blank" rel="noreferrer">ETDefence <ArrowUpRight size={11} /></a>
        <a href="https://www.indiandefensenews.in/" target="_blank" rel="noreferrer">Indian Defence News <ArrowUpRight size={11} /></a>
        <small>ETDefence is link-out only pending permission for RSS republication.</small>
      </div>
      <button className="quiet-btn" onClick={onReview}>
        Review and update candidate status <ArrowUpRight size={14} />
      </button>
    </section>
  );
}

export default function Signals({
  articles,
  sources,
  onReview,
}: {
  articles: SignalArticle[];
  sources: SignalSource[];
  onReview: () => void;
}) {
  return <SignalFeed articles={articles} sources={sources} onReview={onReview} />;
}
