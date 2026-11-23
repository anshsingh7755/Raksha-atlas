import { useEffect, useState } from "react";
import { ArrowUpRight, CircleHelp } from "lucide-react";
import { apiGet } from "../../services/api";

type PibRelease = {
  id: string;
  title: string;
  canonicalUrl: string;
  publishedAt: string | null;
  reviewState: string;
  verificationStatus: string;
};

export default function PibDefence() {
      const [items, setItems] = useState<
        Array<{
          id: string;
          title: string;
          canonicalUrl: string;
          publishedAt: string | null;
          reviewState: string;
          verificationStatus: string;
        }>
      >([]);
      const [year, setYear] = useState("2026");
      const [state, setState] = useState<"loading" | "ready" | "error">("loading");
      useEffect(() => {
        setState("loading");
        fetch(
          `/api/articles?sourceId=pib-defence-security${year ? `&from=${year}-01-01&to=${year}-12-31T23:59:59.999Z` : ""}`,
        )
          .then((r) => {
            if (!r.ok) throw new Error("Unable to load PIB releases");
            return r.json();
          })
          .then((data: { items: typeof items }) => {
            setItems(data.items);
            setState("ready");
          })
          .catch(() => setState("error"));
      }, [year]);
      return (
        <section className="page-section">
          <div className="page-hero">
            <span className="section-kicker">PIB / DEFENCE & SECURITY</span>
            <h1>
              Official releases, <em>indexed.</em>
            </h1>
            <p>
              Metadata from the official PIB Defence & Security release index. Open each
              release on PIB for the complete government text; Raksha Atlas does not copy
              article bodies.
            </p>
            <div className="source-callout">
              <a
                href="https://www.pib.gov.in/newsite/pmreleases.aspx?mincode=33&reg=48&lang=2"
                target="_blank"
                rel="noreferrer"
              >
                Open the exact PIB release index <ArrowUpRight size={14} />
              </a>
              <span>
                Release metadata is official; editorial review remains separate.
              </span>
            </div>
          </div>
          <div className="timeline-toolbar">
            <span className="section-kicker">
              {state === "ready"
                ? `${items.length} RELEASES INDEXED`
                : state === "error"
                  ? "UNAVAILABLE"
                  : "LOADING"}
            </span>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              aria-label="Filter PIB releases by year"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="">All years</option>
            </select>
          </div>
          {state === "error" && (
            <div className="watch-warning">
              <CircleHelp size={17} />
              <span>
                PIB release metadata could not be loaded. Retry after checking the API and
                source availability.
              </span>
            </div>
          )}
          <div className="watch-list">
            {items.map((item) => (
              <article className="watch-card" key={item.id}>
                <div>
                  <span className={`verification-chip ${item.verificationStatus}`}>
                    {item.verificationStatus}
                  </span>
                  <h2>{item.title}</h2>
                  <p>
                    Published{" "}
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("en-IN")
                      : "date not available"}{" "}
                    · Review {item.reviewState}
                  </p>
                </div>
                <div className="watch-meta">
                  <span>PIB release</span>
                  <a href={item.canonicalUrl} target="_blank" rel="noreferrer">
                    Read on PIB <ArrowUpRight size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
}
