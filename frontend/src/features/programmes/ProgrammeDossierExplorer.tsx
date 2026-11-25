"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import AccessibleDialog from "../../components/AccessibleDialog";
import ProgrammeHistoryNotes from "./ProgrammeHistoryNotes";
import ProgrammeTimelinePanel, { type ProgrammeMilestone } from "../../components/ProgrammeTimelinePanel";
import { apiGet } from "../../services/api";
import { backendApi } from "../../services/backend-api";

type ProgrammeSourceRecord = { url: string; sourceId: string | null; sourceName: string | null; sourceType: string; official: boolean | null };
type ProgrammeDossierItem = {
  id: string; title: string; service: string; stage: string; reportedStage?: string;
  stageClassification?: string; category?: string | null; variant?: string | null;
  developer?: string | null; manufacturers?: string[]; announcedDate?: string | null;
  milestones?: ProgrammeMilestone[]; reviewNotes?: string | null;
  summary: string; details: string; sourceUrls: string[]; sourceCount: number;
  status?: string; quantity?: number | null; quantityType?: string;
  quantityConfidence?: string; evidenceQuality?: string;
  sourceRecords?: ProgrammeSourceRecord[]; lastVerifiedAt?: string | null;
};

function ProgrammeDossierExplorer() {
  const [items, setItems] = useState<ProgrammeDossierItem[]>([]);
  const [programmeTimelines, setProgrammeTimelines] = useState<Array<{id:string;programme:string;service:string;dossierRecordIds?:string[];milestones:ProgrammeMilestone[]}>>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { const saved = sessionStorage.getItem("raksha-search-query"); if (saved) { setQuery(saved); sessionStorage.removeItem("raksha-search-query"); } }, []);
  const [service, setService] = useState("all");
  const [stage, setStage] = useState("all");
  const [status, setStatus] = useState("all");
  const [evidence, setEvidence] = useState("all");
  const [registerSummary, setRegisterSummary] = useState({ total: 0, needsVerification: 0, structuredStageRecords: 0, recordsWithMilestones: 0, officialSourceRecords: 0 });
  const [selected, setSelected] = useState<ProgrammeDossierItem | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiGet<{ items?: Array<{id:string;programme:string;service:string;dossierRecordIds?:string[];milestones:ProgrammeMilestone[]}> }>("/api/timelines")
      .then((data) => setProgrammeTimelines(data.items ?? []))
      .catch((error) => console.error("Could not load programme milestones.", error));
  }, []);
  useEffect(() => {
    backendApi.programmes<ProgrammeDossierItem>()
      .then((data) => {
        setItems(data.items ?? []);
        if (data.summary) setRegisterSummary(data.summary);
      })
      .catch((error) => { console.error("Could not load programme dossier.", error); setItems([]); })
      .finally(() => setLoading(false));
  }, []);
  const services = [...new Set(items.map((item) => item.service))].sort();
  const stageClassifications = [...new Set(items.map((item) => item.stageClassification ?? "unclassified"))].sort();
  const statuses = [...new Set(items.map((item) => item.status ?? "needs_verification"))].sort();
  const evidenceQualities = [...new Set(items.map((item) => item.evidenceQuality ?? "not_normalized"))].sort();
  const filtered = items.filter((item) =>
    (service === "all" || item.service === service) &&
    (stage === "all" || (item.stageClassification ?? "unclassified") === stage) &&
    (status === "all" || (item.status ?? "needs_verification") === status) &&
    (evidence === "all" || (item.evidenceQuality ?? "not_normalized") === evidence) &&
    (!query || `${item.title} ${item.summary} ${item.details}`.toLowerCase().includes(query.toLowerCase())),
  );
  return (
    <section className="class-table-section catalog-explorer">
      <div className="section-heading">
        <div><span className="section-kicker">RESEARCH DOSSIER / SOURCE-LED PROGRAMME REGISTER</span><h2>Every programme, <em>with its evidence.</em></h2></div>
        <strong>{loading ? "Loading…" : `${filtered.length} / ${items.length} records`}</strong>
      </div>
      <p className="equipment-note">This view is generated from the Future Programmes & Acquisition Intelligence dossier. Reported plans, official approvals, development, contracts and deliveries are not interchangeable. Text-derived stage guesses remain marked as needing verification and are never presented as confirmed acquisition milestones.</p>
      <div className="programme-register-summary">
        <div><strong>{registerSummary.total || items.length}</strong><span>Register entries</span></div>
        <div><strong>{registerSummary.needsVerification}</strong><span>Need verification</span></div>
        <div><strong>{registerSummary.structuredStageRecords}</strong><span>Structured stage records</span></div>
        <div><strong>{registerSummary.recordsWithMilestones}</strong><span>With dated milestones</span></div>
      </div>
      <div className="catalog-controls programme-catalog-controls">
        <label>Search <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tejas, S-400, Kaveri, ATAGS…" /></label>
        <label>Service / domain <select value={service} onChange={(event) => setService(event.target.value)}><option value="all">All services</option>{services.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>Stage classification <select value={stage} onChange={(event) => setStage(event.target.value)}><option value="all">All classification methods</option>{stageClassifications.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}</select></label>
        <label>Record status <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}</select></label>
        <label>Evidence quality <select value={evidence} onChange={(event) => setEvidence(event.target.value)}><option value="all">All evidence classes</option>{evidenceQualities.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}</select></label>
      </div>
      <div className="inventory-grid programme-grid">
        {filtered.map((item) => (
          <article className="inventory-card programme-card" key={item.id}>
            <div className="inventory-card-top"><span className="verification-chip">{item.service}</span><span>{item.sourceCount} source links</span></div>
            <h3>{item.title}</h3><button className="programme-open-detail" onClick={() => setSelected(item)}>Open programme record <ArrowUpRight size={13} /></button><p className="programme-summary">{item.summary || "Open the record for its research notes and source references."}</p>
            <div className="programme-meta"><strong>{item.stage}</strong><span className="verification-chip">{(item.status ?? "needs_verification").replace(/_/g, " ")}</span></div>
            {item.reportedStage && item.reportedStage !== item.stage && <p className="programme-stage-caveat">Dossier text label: {item.reportedStage} · unverified text classification</p>}
            <details className="programme-details"><summary>Programme history and evidence</summary><div className="programme-detail-text">{item.details}</div>
              {item.sourceUrls.length > 0 && <div className="programme-source-links"><strong>Source references</strong>{item.sourceUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{new URL(url).hostname} <ArrowUpRight size={12} /></a>)}</div>}
            </details>
          </article>
        ))}
      </div>
      {!loading && filtered.length === 0 && <div className="empty-state">No programme records match these filters.</div>}
      <div className="equipment-note"><a href="https://github.com/anshsingh7755/Raksha-atlas/blob/work/step-1-foundation/docs/intelligence/FUTURE-PROGRAMMES-ACQUISITION-DOSSIER.md" target="_blank" rel="noreferrer">Open the full research dossier <ArrowUpRight size={12} /></a></div>
      {selected && <AccessibleDialog onClose={() => setSelected(null)} labelledBy="programme-modal-title" contentClassName="programme-modal" backdropClassName="modal-backdrop programme-modal-backdrop">
          <header className="programme-modal-header"><div><span className="section-kicker">PROGRAMME INTELLIGENCE RECORD · {selected.id}</span><h2 id="programme-modal-title">{selected.title}</h2></div><button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close programme record"><X size={18} /></button></header>
          <div className="programme-modal-grid">
            <div><span>Service / domain</span><strong>{selected.service}</strong></div>
            <div><span>Stage classification</span><strong>{selected.stage}</strong></div>
            <div><span>Source dossier stage text</span><strong>{selected.reportedStage ?? "Not stated"}</strong></div>
            <div><span>Classification method</span><strong>{selected.stageClassification ?? "Not classified"}</strong></div>
            <div><span>Record status</span><strong>{(selected.status ?? "needs_verification").replace(/_/g, " ")}</strong></div>
            <div><span>Quantity</span><strong>{selected.quantity ?? "Not established in structured data"}</strong></div>
            <div><span>Quantity confidence</span><strong>{selected.quantityConfidence ?? "Not assessed"}</strong></div>
            <div><span>Evidence quality</span><strong>{selected.evidenceQuality ?? "Not normalized"}</strong></div>
          </div>
          <p className="programme-modal-caveat">Discovery register only. A stage derived from dossier wording is marked as needing verification and is not an independently confirmed milestone. Absence of a structured quantity does not mean zero. An AoN, proposal, test or report is not evidence of a signed contract or induction.</p>
          <div className="programme-modal-body-layout">
            <ProgrammeTimelinePanel programme={selected.title} milestones={programmeTimelines.find((timeline) => timeline.dossierRecordIds?.includes(selected.id))?.milestones ?? []} />
            <div className="programme-modal-main-notes">
              <div className="programme-modal-section"><h3>Programme history and notes</h3><ProgrammeHistoryNotes text={selected.details} /></div>
              <div className="programme-modal-section"><h3>Evidence references ({selected.sourceRecords?.length ?? selected.sourceUrls.length})</h3>
            {(selected.sourceRecords?.length ? selected.sourceRecords : selected.sourceUrls.map((url) => ({url,sourceId:null,sourceName:null,sourceType:"unregistered",official:null}))).map((source) => <a className="programme-modal-source" key={source.url} href={source.url} target="_blank" rel="noreferrer"><span><strong>{source.sourceName ?? new URL(source.url).hostname}</strong><small>{source.sourceId ?? "Source not mapped to registry"} · {source.sourceType}{source.official === true ? " · Official" : source.official === false ? " · Secondary / unofficial" : ""}</small></span><ArrowUpRight size={14} /></a>)}
              </div>
            </div>
          </div>
          <footer className="programme-modal-footer">Last verified: {selected.lastVerifiedAt ?? "Not yet verified"} · Record ID: {selected.id}</footer>
    </AccessibleDialog>}
    </section>
  );
}

export default ProgrammeDossierExplorer;
