import { useEffect, useState } from "react";
import { ArrowUpRight, CircleHelp, Search } from "lucide-react";
import { apiGet } from "../../services/api";

type ProcurementRecord = {
  id: string;
  title: string;
  reference: string;
  sourceId: string;
  sourceUrl: string;
  closingAt: string;
  status: string;
  scope: string;
  verificationStatus: string;
};

export default function Watch() {
      const [query, setQuery] = useState("");
      const [items, setItems] = useState<ProcurementRecord[]>([]);
      useEffect(() => {
        const saved = sessionStorage.getItem("raksha-search-query");
        const section = sessionStorage.getItem("raksha-search-section");
        if (saved && section === "Procurement") {
          setQuery(saved);
          sessionStorage.removeItem("raksha-search-query");
          sessionStorage.removeItem("raksha-search-target");
          sessionStorage.removeItem("raksha-search-section");
        }
        apiGet<{ items?: ProcurementRecord[] }>("/api/procurement-2026")
          .then((data) => setItems(data.items ?? []))
          .catch((error: unknown) => {
            console.error("Could not load procurement watchlist.", error);
            setItems([]);
          });
      }, []);
      const visibleItems = items.filter((item) => [item.title,item.reference,item.sourceId,item.scope,item.status,item.verificationStatus].join(" ").toLowerCase().includes(query.toLowerCase()));
      return (
        <section className="page-section">
          <div className="page-hero">
            <span className="section-kicker">2026 WATCH / OFFICIAL PORTALS</span>
            <h1>
              What is <em>open.</em>
            </h1>
            <p>
              This is a live watchlist of public tender metadata from the supplied
              portals. A tender is not the same as an acquisition approval, contract,
              delivery, or induction.
            </p>
          </div>
          <div className="watch-warning">
            <CircleHelp size={17} />
            <span>
              Coverage is source-limited. MoD returned HTTP 403 during this check; the
              portal records below are not a complete list of all 2026 defence activity.
            </span>
          </div>
          <label className="command-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tender title, portal or scope"/></label>
          <div className="watch-list">
            {visibleItems.map((item) => (
              <article className="watch-card" key={item.id}>
                <div>
                  <span className={`verification-chip ${item.verificationStatus}`}>
                    {item.verificationStatus}
                  </span>
                  <h2>{item.title}</h2>
                  <p>
                    {item.scope} · {item.reference}
                  </p>
                </div>
                <div className="watch-meta">
                  <span>Closing</span>
                  <strong>{new Date(item.closingAt).toLocaleDateString("en-IN")}</strong>
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    Open source <ArrowUpRight size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
}
