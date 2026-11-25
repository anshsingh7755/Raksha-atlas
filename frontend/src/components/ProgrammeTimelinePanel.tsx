import { ArrowUpRight, CircleDot } from "lucide-react";

export type ProgrammeMilestone = {
  stage: string;
  date: string | null;
  label: string;
  verificationStatus?: string;
  sourceId?: string | null;
  sourceUrl?: string | null;
};

type Props = {
  programme: string;
  milestones: ProgrammeMilestone[];
};

function formatMilestoneDate(value: string | null) {
  if (!value) return "Date not announced";
  if (/^\d{4}-01-01$/.test(value)) return value.slice(0, 4) + " · year reported";
  if (/^\d{4}-12-31$/.test(value)) return value.slice(0, 4) + " · target window";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default function ProgrammeTimelinePanel({ programme, milestones }: Props) {
  if (!milestones.length) {
    return <aside className="programme-timeline-sidebar"><h3>Programme timeline</h3><p>No dated milestones have been verified for this record yet.</p></aside>;
  }
  return (
    <aside className="programme-timeline-sidebar" aria-label={programme + " milestone timeline"}>
      <div className="programme-timeline-heading">
        <span className="section-kicker">PROGRAMME LIFECYCLE</span>
        <h3>From proposal to service</h3>
        <p>Chronological public milestones. Targets and reported events remain labelled.</p>
      </div>
      <ol className="programme-milestone-list">
        {milestones.map((milestone, index) => (
          <li className="programme-milestone" key={milestone.stage + "-" + index}>
            <span className="programme-milestone-node"><CircleDot size={15}/></span>
            <div className="programme-milestone-content">
              <time>{formatMilestoneDate(milestone.date)}</time>
              <strong>{milestone.stage}</strong>
              <p>{milestone.label}</p>
              <span className={"programme-milestone-status " + (milestone.verificationStatus ?? "unverified")}>{(milestone.verificationStatus ?? "unverified").replace(/_/g, " ")}</span>
              {milestone.sourceUrl && <a href={milestone.sourceUrl} target="_blank" rel="noreferrer">Evidence <ArrowUpRight size={12}/></a>}
            </div>
          </li>
        ))}
      </ol>
    </aside>
  );
}
