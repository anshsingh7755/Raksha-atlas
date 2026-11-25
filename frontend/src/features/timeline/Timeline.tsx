import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { apiGet } from "../../services/api";

type TimelineMilestone = {
  stage: string;
  date: string | null;
  label: string;
  verificationStatus?: string;
  sourceId?: string;
  sourceUrl?: string;
};

type ProgrammeTimelineRecord = {
  id: string;
  programme: string;
  service: string;
  confidence: string;
  verificationStatus: string;
  sourceId: string;
  milestones: TimelineMilestone[];
};

export default function Timeline() {
      const [service, setService] = useState("all");
      const [items, setItems] = useState<ProgrammeTimelineRecord[]>([]);
      useEffect(() => {
        apiGet<{ items?: ProgrammeTimelineRecord[] }>(
          `/api/timelines${service === "all" ? "" : `?service=${encodeURIComponent(service)}`}`,
        ).then((data) => setItems(data.items ?? []));
      }, [service]);
      return (
        <section className="page-section">
          <div className="page-hero">
            <span className="section-kicker">MODERNISATION TIMELINE / SOURCE-LINKED</span>
            <h1>
              From approval to <em>service.</em>
            </h1>
            <p>
              Milestones are shown separately. A proposal, AON, contract, delivery and
              induction are not interchangeable events. Current coverage is a curated set
              of sourced programmes, not yet a complete procurement history for 2000–2047.
              Delay duration is left unstated unless a source gives a comparable planned
              date and actual milestone.
            </p>
          </div>
          <div className="timeline-toolbar">
            <span className="section-kicker">FILTER SERVICE</span>
            <select
              value={service}
              onChange={(event) => setService(event.target.value)}
              aria-label="Filter timelines by service"
            >
              <option value="all">All services</option>
              {[...new Set(items.map((item) => item.service))].sort().map((serviceName) => (
                <option key={serviceName} value={serviceName}>{serviceName}</option>
              ))}
            </select>
          </div>
          <div className="timeline-list">
            {items.map((item) => (
              <article className="timeline-card" key={item.id}>
                <div className="timeline-card-heading">
                  <div>
                    <span className={`verification-chip ${item.verificationStatus}`}>
                      {item.verificationStatus}
                    </span>
                    <h2>{item.programme}</h2>
                  </div>
                  <span>
                    {item.service} · confidence {item.confidence} · {item.sourceId}
                  </span>
                </div>
                <div className="timeline-track">
                  {item.milestones.map((milestone, index) => (
                    <div className="timeline-step" key={`${item.id}-${index}`}>
                      <span className="timeline-dot" />
                      <strong>{milestone.stage}</strong>
                      <time>{milestone.date ?? "Date not confirmed"}</time>
                      <p>{milestone.label}</p>
                      {milestone.verificationStatus && (
                        <span className="verification-chip">
                          {milestone.verificationStatus}
                        </span>
                      )}
                      {milestone.sourceUrl && (
                        <a
                          className="read-link"
                          href={milestone.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Source <ArrowUpRight size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      );
}
