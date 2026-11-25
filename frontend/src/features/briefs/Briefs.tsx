import { useEffect, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { apiGet } from "../../services/api";

type BriefRecord = {
  id: string;
  title: string;
  summary: string;
  status: string;
  confidence: string;
  sourceUrls: string[];
  createdAt: string;
};

export default function Briefs() {
      const [items, setItems] = useState<BriefRecord[]>([]);
      const [query, setQuery] = useState("");
      const [loading, setLoading] = useState(true);
      useEffect(() => {
        const saved = sessionStorage.getItem("raksha-search-query");
        const section = sessionStorage.getItem("raksha-search-section");
        if (saved && section === "Intelligence briefs") {
          setQuery(saved);
          sessionStorage.removeItem("raksha-search-query");
          sessionStorage.removeItem("raksha-search-target");
          sessionStorage.removeItem("raksha-search-section");
        }
        apiGet<{ items?: BriefRecord[] }>("/api/briefs")
          .then((data) => setItems(data.items ?? []))
          .catch(() => setItems([]))
          .finally(() => setLoading(false));
      }, []);
      const visible = items.filter((item) => [item.title,item.summary,item.status,item.confidence].join(" ").toLowerCase().includes(query.toLowerCase()));
      return (
        <section className="page-section">
          <div className="page-hero">
            <span className="section-kicker">INTELLIGENCE / EDITORIAL BRIEFS</span>
            <h1>Intelligence <em>briefs.</em></h1>
            <p>Short public-information briefs with explicit status, confidence and source links. A brief is an editorial summary, not independent verification.</p>
          </div>
          <label className="command-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brief title, topic or status"/></label>
          {loading ? <div className="data-state">Loading briefs…</div> : visible.length === 0 ? <div className="data-state">No briefs match this search.</div> : <div className="brief-grid">
            {visible.map((item) => <article className="brief-card" key={item.id}>
              <div className="brief-meta"><span className="verification-chip">{item.status}</span><span className="verification-chip">{item.confidence} confidence</span></div>
              <h2>{item.title}</h2><p>{item.summary}</p>
              <div className="brief-sources">{item.sourceUrls.map((url,index) => <a key={url} href={url} target="_blank" rel="noreferrer">Source {index+1} <ArrowUpRight size={12}/></a>)}</div>
            </article>)}
          </div>}
        </section>
      );
}
