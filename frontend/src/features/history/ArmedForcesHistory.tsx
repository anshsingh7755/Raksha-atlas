import { useEffect, useState, type ComponentType } from "react";
import { ArrowUpRight } from "lucide-react";
import { apiGet } from "../../services/api";

type HistoryItem = {
  id: string;
  date: string;
  title: string;
  summary: string;
  sourceUrl: string;
  verificationStatus: string;
  confidence: string;
};

type ReferenceTablesProps = { allowedSourceIds?: string[] };

export default function ArmedForcesHistory({
  ReferenceTables,
}: {
  ReferenceTables: ComponentType<ReferenceTablesProps>;
}) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    apiGet<{ items?: HistoryItem[] }>("/api/history")
      .then((data) => setItems(data.items ?? []))
      .catch((error: unknown) => {
        console.error("Could not load armed forces history.", error);
        setItems([]);
      });
  }, []);

  return (
    <section className="page-section">
      <div className="page-hero">
        <span className="section-kicker">HISTORY / PUBLIC REFERENCE</span>
        <h1>
          Institutions, conflicts, <em>change.</em>
        </h1>
        <p>
          A selected chronology of the armed forces from independence to the present. It
          is a research index, not a complete history; secondary references require
          primary-source corroboration.
        </p>
      </div>
      <div className="timeline-list">
        {items.map((item) => (
          <article className="timeline-card" key={item.id}>
            <div className="timeline-card-heading">
              <div>
                <span className={`verification-chip ${item.verificationStatus}`}>
                  {item.verificationStatus}
                </span>
                <h2>
                  {item.date} · {item.title}
                </h2>
              </div>
              <span>Confidence: {item.confidence}</span>
            </div>
            <p>{item.summary}</p>
            <a className="read-link" href={item.sourceUrl} target="_blank" rel="noreferrer">
              Source / reference <ArrowUpRight size={13} />
            </a>
          </article>
        ))}
      </div>
      <ReferenceTables allowedSourceIds={["wiki-army-regiments"]} />
    </section>
  );
}
