import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  Bot,
  ChevronRight,
  CircleHelp,
  Database,
  FileText,
  Globe2,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  PenLine,
  Plus,
  Radio,
  Search,
  Shield,
  Ship,
  Sparkles,
  Target,
  X,
  Plane,
  Crosshair,
  Clock3,
  Sun,
  Moon,
  Command,
} from "lucide-react";
import { fetchPlatformRegister, type PlatformRegisterItem } from "./services/inventory";
import ProgrammeTimelinePanel, { type ProgrammeMilestone } from "./components/ProgrammeTimelinePanel";
import TheatreAtlas from "./components/TheatreAtlas";

type View =
  | "overview"
  | "forces"
  | "atlas"
  | "programmes"
  | "pipeline"
  | "signals"
  | "sources"
  | "inventory"
  | "timeline"
  | "watch"
  | "pib"
  | "register"
  | "history";
type Icon = typeof Shield;
type Force = {
  id: string;
  label: string;
  short: string;
  description: string;
  metric: string;
  accent: string;
  icon: Icon;
};
type CommandRecord = {
  id: string;
  name: string;
  service: string;
  group: string;
  structureType: string;
  status: string;
  headquarters: string | null;
  description: string;
  sourceUrl: string;
  sourceName: string;
  verificationStatus: string;
};
type ChatSource = {
  ref?: string;
  title: string;
  url?: string;
  sourceId?: string;
  sourceName?: string;
  verificationStatus?: string;
  reviewState?: string;
  publishedAt?: string | null;
  kind?: string;
};

const forces: Force[] = [
  {
    id: "navy",
    label: "Navy",
    short: "IN",
    description: "Fleet composition, shipbuilding and maritime capability.",
    metric: "Fleet catalogue",
    accent: "#48b6bf",
    icon: Ship,
  },
  {
    id: "air-force",
    label: "Air Force",
    short: "IAF",
    description: "Aircraft, air defence, modernisation and readiness.",
    metric: "Aircraft catalogue",
    accent: "#8aa8ff",
    icon: Plane,
  },
  {
    id: "army",
    label: "Army",
    short: "IA",
    description: "Land systems, formations and operational programmes.",
    metric: "Land systems catalogue",
    accent: "#d5a856",
    icon: Target,
  },
  {
    id: "space",
    label: "Space",
    short: "DS",
    description: "Space situational awareness and strategic access.",
    metric: "Tracking the horizon",
    accent: "#b38cff",
    icon: Globe2,
  },
  {
    id: "cyber",
    label: "Cyber",
    short: "DC",
    description: "Defensive cyber posture and information resilience.",
    metric: "Public sources only",
    accent: "#59c995",
    icon: Database,
  },
  {
    id: "intelligence",
    label: "Intelligence",
    short: "INT",
    description: "Open-source context, history and institutional records.",
    metric: "Source-led research",
    accent: "#e890a5",
    icon: Shield,
  },
];

const inventorySourceLinks: Record<string, string> = {
  "wikipedia-indian-armed-forces": "https://en.wikipedia.org/wiki/Indian_Armed_Forces",
  "wiki-army-equipment":
    "https://en.wikipedia.org/wiki/List_of_equipment_of_the_Indian_Army#Aircraft",
  "wiki-armed-forces-history":
    "https://en.wikipedia.org/wiki/Indian_Armed_Forces#History",
  "wiki-active-aircraft":
    "https://en.wikipedia.org/wiki/List_of_active_Indian_military_aircraft",
  "wiki-army-regiments":
    "https://en.wikipedia.org/wiki/List_of_regiments_and_corps_of_the_Indian_Army",
  "wiki-active-navy-ships":
    "https://en.wikipedia.org/wiki/List_of_active_Indian_Navy_ships",
  "pib-tejas-dac-2020":
    "https://www.pib.gov.in/PressReleasePage.aspx?PRID=1606941&lang=2&reg=48",
  "pib-tejas-contract-83":
    "https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1694844&lang=2&reg=48",
  "pib-tejas-contract-97":
    "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2171108&lang=2&reg=3",
  "pib-ins-vikrant-commission":
    "https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1856230&lang=2&reg=48",
  "pib-ins-vikramaditya":
    "https://www.pib.gov.in/newsite/PrintRelease.aspx?lang=2&reg=48&relid=101191",
  "pib-two-carrier-force":
    "https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=154353&lang=1&reg=3",
};

const acquisitionStages = [
  ["01", "Capability gap", "Service identifies a need and operational context."],
  ["02", "GSQR", "General Staff Qualitative Requirements define the capability."],
  ["03", "RFI", "Request for Information maps vendors and available solutions."],
  ["04", "AON", "Acceptance of Necessity authorises the acquisition to proceed."],
  ["05", "RFP + TSE", "Proposal, technical staff evaluation and user trials."],
  [
    "06",
    "TAC / CNC",
    "Technical appraisal, commercial negotiations and recommendation.",
  ],
  ["07", "CFA / CCS", "Competent Financial Authority or CCS approval, as applicable."],
  ["08", "Contract", "Contract signature, production, delivery and acceptance."],
  ["09", "Induction", "Commissioning, service entry, support and lifecycle review."],
];

const signal = {
  title: "Pralay test signal: NOTAM window observed",
  status: "REPORTED — NOT OFFICIALLY CONFIRMED",
  summary:
    "A public report links a 595 km NOTAM in the Odisha test corridor with a possible Pralay flight between 3–5 November. No primary DRDO or Ministry of Defence release has been located here, so this page does not present the launch as confirmed.",
  detail:
    "Treat this as an open-source lead, not operational intelligence. NOTAMs reserve airspace; they do not prove that a launch occurred. The current record should be updated if an official release, imagery, or a corroborated report becomes available.",
};

function PlatformRegister() {
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState<PlatformRegisterItem[]>([]);
  useEffect(() => {
    fetchPlatformRegister(category)
      .then(setItems)
      .catch((error: unknown) => {
        console.error("Could not load platform register.", error);
        setItems([]);
      });
  }, [category]);
  return (
    <section className="page-section">
      <div className="page-hero">
        <span className="section-kicker">PLATFORM REGISTER / TABULAR PUBLIC DATA</span>
        <h1>
          Classes, counts, <em>context.</em>
        </h1>
        <p>
          Original Raksha Atlas tables for major public equipment families. Unknown
          counts remain unknown; future orders are not added to current inventory.
        </p>
      </div>
      <div className="inventory-toolbar">
        <label>
          <span className="section-kicker">EQUIPMENT FAMILY</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter platform register by equipment family"
          >
            <option value="all">All families</option>
            <option value="Corvettes">Corvettes</option>
            <option value="Destroyers">Destroyers</option>
            <option value="Fighter aircraft">Fighter aircraft</option>
            <option value="Trainer aircraft">Trainer aircraft</option>
            <option value="Tanks">Tanks</option>
            <option value="Artillery">Artillery</option>
          </select>
        </label>
        <strong className="inventory-count">{items.length} class records</strong>
      </div>
      <div className="class-table-wrap">
        <table className="class-table platform-register-table">
          <thead>
            <tr>
              <th>Class / image</th>
              <th>Platform</th>
              <th>Count</th>
              <th>Origin</th>
              <th>Procured</th>
              <th>Inducted</th>
              <th>Status</th>
              <th>Role</th>
              <th>Future orders / notes</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.category}-${item.className}`}>
                <td>
                  <img src={item.imageUrl} alt={`${item.className} representative`} />
                  <strong>{item.className}</strong>
                </td>
                <td>{item.platform}</td>
                <td>{item.count ?? "—"}</td>
                <td>{item.origin}</td>
                <td>{item.procurementYear ?? "—"}</td>
                <td>{item.inductedYear ?? "—"}</td>
                <td>{item.status.replace("_", " ")}</td>
                <td>{item.role}</td>
                <td>{item.futureOrders}</td>
                <td>
                  <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                    Source <ArrowUpRight size={13} />
                  </a>
                  {(item.supportingSourceUrls ?? []).map((url, index) => (
                    <span key={url}>
                      {" "}
                      ·{" "}
                      <a href={url} target="_blank" rel="noreferrer">
                        Source {index + 2}
                      </a>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function WikipediaEquipmentTables({
  allowedSourceIds = [
    "wiki-army-equipment",
    "wiki-active-aircraft",
    "wiki-active-navy-ships",
    "wiki-future-air-force",
    "wiki-future-navy",
    "wiki-integrated-rocket-force",
    "drones-of-india",
  ],
}: {
  allowedSourceIds?: string[];
}) {
  const [pages, setPages] = useState<
    Array<{
      id: string;
      title: string;
      url: string;
      fetchedAt: string | null;
      coverage?: string;
      refreshError?: string;
      stale?: boolean;
      tables: Array<{ section: string; headers: string[]; rows: string[][] }>;
    }>
  >([]);
  const [snapshotAt, setSnapshotAt] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState("all");
  const [query, setQuery] = useState("");
  useEffect(() => {
    fetch("/api/reference/equipment")
      .then((r) => r.json())
      .then((d) => {
        setPages(d.pages ?? []);
        setSnapshotAt(d.generatedAt ?? null);
      })
      .catch(() => setPages([]));
  }, []);
  const relevantPages = pages.filter((p) => allowedSourceIds.includes(p.id));
  const shown = relevantPages.filter((p) => sourceId === "all" || p.id === sourceId);
  return (
    <section className="class-table-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker">SOURCE TABLE EXTRACT / OPEN REFERENCES</span>
          <h2>
            Source tables, <em>with provenance.</em>
          </h2>
        </div>
        <div className="inventory-filters">
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            aria-label="Filter reference tables by source"
          >
            <option value="all">All reference tables</option>
            {relevantPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find equipment or class"
            aria-label="Search reference tables"
          />
        </div>
      </div>
      <p className="equipment-note">
        Reference tables are secondary sources, not official verified inventory. Counts
        may be estimates, stale or mix active, ordered, planned and prototype systems.
        The catalogue keeps those source rows separate and does not sum incompatible
        quantities into a single force total. Verify important figures against primary
        releases. Wikipedia-derived material is attributed under{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-SA
        </a>
        . Snapshot generated{" "}
        {snapshotAt ? new Date(snapshotAt).toLocaleString("en-IN") : "—"}.
      </p>
      {shown.map((page) => (
        <details className="reference-page" key={page.id}>
          <summary>
            {page.title} · {page.tables.reduce((n, t) => n + t.rows.length, 0)} rows
            {page.coverage === "partial" ? " · partial excerpt" : ""}
            {page.stale ? " · stale snapshot" : ""}
          </summary>
          <p>
            <a href={page.url} target="_blank" rel="noreferrer">
              Open source article <ArrowUpRight size={13} />
            </a>{" "}
            {page.fetchedAt
              ? `· Retrieved ${new Date(page.fetchedAt).toLocaleDateString("en-IN")}`
              : "· No live extraction available; showing stored excerpt when present."}
          </p>
          {page.refreshError && (
            <p className="watch-warning">
              Latest refresh failed: {page.refreshError}. The stored copy is retained.
            </p>
          )}
          {page.tables.length === 0 && (
            <div className="data-state">
              No table snapshot is stored yet. Run <code>npm run sync:reference</code>{" "}
              when network access is available.
            </div>
          )}
          {page.tables.map((table, ti) => {
            const rows = query
              ? table.rows.filter((r) =>
                  r.join(" ").toLowerCase().includes(query.toLowerCase()),
                )
              : table.rows;
            return (
              <details key={`${page.id}-${ti}`}>
                <summary>
                  {table.section} · {rows.length} rows
                </summary>
                <div className="class-table-wrap">
                  <table className="class-table">
                    <thead>
                      <tr>
                        {table.headers.map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, ri) => (
                        <tr key={ri}>
                          {table.headers.map((_, ci) => (
                            <td key={ci}>{row[ci] ?? ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
        </details>
      ))}
    </section>
  );
}

type EquipmentRow = {
  id: string;
  service: string;
  domain: string;
  section: string;
  subgroup: string | null;
  name: string;
  variant: string | null;
  role: string | null;
  origin: string | null;
  quantityText: string | null;
  quantityNumeric: number | null;
  lifecycleStatus: string;
  verificationStatus: string;
  confidence: string;
  sourceId: string;
  sourceUrl: string;
  sourceAsOf: string;
  sourceRefreshStatus: string;
  sourceNote: string | null;
  sourceFields: Record<string, string>;
};
type ProcurementRow = {
  id: string;
  service: string;
  system: string;
  quantityText: string;
  quantity: number | null;
  stage: string;
  stageDate: string;
  deliveryWindow: string;
  verificationStatus: string;
  sourceUrl: string;
  notes: string;
};

function EquipmentDataExplorer() {
  const [mode, setMode] = useState<"inventory" | "pipeline">("inventory");
  useEffect(() => { const saved = sessionStorage.getItem("raksha-search-mode"); if (saved === "pipeline") setMode("pipeline"); if (saved) sessionStorage.removeItem("raksha-search-mode"); }, []);
  const [inventory, setInventory] = useState<EquipmentRow[]>([]);
  const [procurement, setProcurement] = useState<ProcurementRow[]>([]);
  const [service, setService] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  useEffect(() => { const saved = sessionStorage.getItem("raksha-search-query"); if (saved) { setQuery(saved); sessionStorage.removeItem("raksha-search-query"); } }, []);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch("/api/equipment-catalog").then((r) => r.json()),
      fetch("/api/future-procurement").then((r) => r.json()),
    ])
      .then(([catalog, pipeline]) => {
        setInventory(catalog.items ?? []);
        setProcurement(pipeline.items ?? []);
      })
      .catch(() => {
        setInventory([]);
        setProcurement([]);
      })
      .finally(() => setLoading(false));
  }, []);
  const services = [...new Set(inventory.map((item) => item.service))].sort();
  const statuses = [...new Set(inventory.map((item) => item.lifecycleStatus))].sort();
  const filteredInventory = inventory.filter(
    (item) =>
      (service === "all" || item.service === service) &&
      (status === "all" || item.lifecycleStatus === status) &&
      (!query ||
        `${item.name} ${item.variant ?? ""} ${item.section} ${item.subgroup ?? ""} ${item.origin ?? ""} ${item.quantityText ?? ""} ${item.role ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const filteredPipeline = procurement.filter(
    (item) =>
      (service === "all" ||
        item.service.toLowerCase().includes(service.toLowerCase())) &&
      (!query ||
        `${item.system} ${item.service} ${item.stage} ${item.notes}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  useEffect(() => {
    setLimit(100);
  }, [mode, service, status, query]);
  return (
    <section className="class-table-section catalog-explorer">
      <div className="section-heading">
        <div>
          <span className="section-kicker">
            SOURCE-LED DATASET / UPDATED FROM PUBLIC REFERENCES
          </span>
          <h2>
            Inventory, <em>and what comes next.</em>
          </h2>
        </div>
        <div className="catalog-tabs">
          <button
            className={mode === "inventory" ? "active" : ""}
            onClick={() => setMode("inventory")}
          >
            Current & reference inventory
          </button>
          <button
            className={mode === "pipeline" ? "active" : ""}
            onClick={() => setMode("pipeline")}
          >
            Future procurement
          </button>
        </div>
      </div>
      <p className="equipment-note">
        Rows preserve each source’s wording, quantity, lifecycle claim, date and
        provenance. A row count is not a force equipment total. Do not add duplicate
        platform rows or mix active, ordered, planned and development quantities.
        Estimates and missing quantities stay explicit.
      </p>
      <div className="catalog-controls">
        <label>
          Search{" "}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="System, type, role, quantity…"
          />
        </label>
        <label>
          Service / operator{" "}
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="all">All services</option>
            {services.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        {mode === "inventory" && (
          <label>
            Lifecycle claim{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All states</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        )}
        <strong>
          {loading
            ? "Loading…"
            : `${mode === "inventory" ? filteredInventory.length : filteredPipeline.length} records`}
        </strong>
      </div>
      {mode === "inventory" ? (
        <>
          <div className="catalog-service-strip" aria-label="Inventory source rows by service">
            <span className="catalog-service-strip-label">SOURCE ROWS BY SERVICE</span>
            {services.map((name) => (
              <button key={name} className={service === name ? "active" : ""} onClick={() => setService(service === name ? "all" : name)}>
                <span>{name}</span><strong>{inventory.filter((item) => item.service === name).length}</strong>
              </button>
            ))}
          </div>
          <div className="class-table-wrap">
            <table className="class-table catalog-table">
              <thead>
                <tr>
                  <th>Service / section</th>
                  <th>Equipment / variant</th>
                  <th>Qty as source states</th>
                  <th>Lifecycle</th>
                  <th>Origin / role</th>
                  <th>Source & confidence</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.slice(0, limit).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.service}</strong>
                      <small>
                        {item.section}
                        {item.subgroup ? ` · ${item.subgroup}` : ""}
                      </small>
                    </td>
                    <td>
                      <strong>{item.name}</strong>
                      {item.variant && <small>{item.variant}</small>}
                      {item.sourceNote && (
                        <details>
                          <summary>Source note</summary>
                          <span>{item.sourceNote}</span>
                        </details>
                      )}
                    </td>
                    <td>
                      {item.quantityText ?? "Not stated"}
                      {item.quantityNumeric !== null && (
                        <small>Parsed exact value: {item.quantityNumeric}</small>
                      )}
                    </td>
                    <td>
                      <span className={`verification-chip ${item.verificationStatus}`}>
                        {item.lifecycleStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      {item.origin ?? "Not stated"}
                      {item.role && <small>{item.role}</small>}
                    </td>
                    <td>
                      <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                        {item.sourceId} <ArrowUpRight size={12} />
                      </a>
                      <small>
                        {item.confidence} · {item.sourceAsOf} ·{" "}
                        {item.sourceRefreshStatus}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {limit < filteredInventory.length && (
            <button className="catalog-more" onClick={() => setLimit((n) => n + 100)}>
              Load 100 more records
            </button>
          )}
        </>
      ) : (
        <div className="class-table-wrap">
          <table className="class-table catalog-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>System / quantity</th>
                <th>Procurement stage</th>
                <th>Date / delivery</th>
                <th>Notes</th>
                <th>Official source</th>
              </tr>
            </thead>
            <tbody>
              {filteredPipeline.map((item) => (
                <tr key={item.id}>
                  <td>{item.service}</td>
                  <td>
                    <strong>{item.system}</strong>
                    <small>{item.quantityText}</small>
                  </td>
                  <td>
                    <span className="verification-chip official">{item.stage}</span>
                  </td>
                  <td>
                    {item.stageDate}
                    <small>{item.deliveryWindow}</small>
                  </td>
                  <td>{item.notes}</td>
                  <td>
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer">
                      PIB / official <ArrowUpRight size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}


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

function ProgrammeHistoryNotes({ text }: { text: string }) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return <div className="programme-history-notes">{lines.map((raw, index) => {
    const line = raw.replace(/^-\s*/, "").replace(/\*\*/g, "");
    const splitAt = line.indexOf(":");
    const label = splitAt > 0 ? line.slice(0, splitAt).trim() : "";
    const value = splitAt > 0 ? line.slice(splitAt + 1).trim() : line;
    if (label.toLowerCase() === "primary discovery/source link") return null;
    return <div className="programme-history-note" key={index}>
      {label && <strong>{label}</strong>}
      <p>{value}</p>
    </div>;
  })}</div>;
}

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
    fetch("/api/timelines")
      .then((response) => { if (!response.ok) throw new Error("Timeline API unavailable"); return response.json(); })
      .then((data: { items?: Array<{id:string;programme:string;service:string;dossierRecordIds?:string[];milestones:ProgrammeMilestone[]}> }) => setProgrammeTimelines(data.items ?? []))
      .catch((error) => console.error("Could not load programme milestones.", error));
  }, []);
  useEffect(() => {
    fetch("/api/programmes")
      .then((response) => { if (!response.ok) throw new Error("Programme dossier API unavailable"); return response.json(); })
      .then((data: { items?: ProgrammeDossierItem[]; summary?: typeof registerSummary }) => {
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
      {selected && <div className="modal-backdrop programme-modal-backdrop" onClick={() => setSelected(null)}>
        <section className="programme-modal" role="dialog" aria-modal="true" aria-labelledby="programme-modal-title" onClick={(event) => event.stopPropagation()}>
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
        </section>
      </div>}
    </section>
  );
}

function ArmedForcesHistory() {
  const [items, setItems] = useState<
    Array<{
      id: string;
      date: string;
      title: string;
      summary: string;
      sourceUrl: string;
      verificationStatus: string;
      confidence: string;
    }>
  >([]);
  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
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
            <a
              className="read-link"
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Source / reference <ArrowUpRight size={13} />
            </a>
          </article>
        ))}
      </div>
      <WikipediaEquipmentTables allowedSourceIds={["wiki-army-regiments"]} />
    </section>
  );
}

function ChatDialog({
  question,
  setQuestion,
  answer,
  sources,
  loading,
  error,
  onAsk,
  onClose,
  needsModelKey,
}: {
  question: string;
  setQuestion: (value: string) => void;
  answer: string;
  sources: ChatSource[];
  loading: boolean;
  error: string;
  onAsk: () => void;
  onClose: () => void;
  needsModelKey: boolean;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="chat-panel" onClick={(event) => event.stopPropagation()}>
        <div className="chat-header">
          <div>
            <span className="section-kicker">ATLAS ASSIST / SOURCE-GROUNDED</span>
            <h2>
              Ask the <em>open-source</em> analyst
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close chat">
            <X size={18} />
          </button>
        </div>
        <div className="chat-body">
          {!answer && !loading && !error ? (
            <div className="chat-empty">
              <Bot size={28} />
              <p>
                Answers retrieve project records and may search the live web. Sources
                keep their verification and review labels.
              </p>
              <div className="suggestions">
                <button
                  onClick={() =>
                    setQuestion(
                      "How many aircraft carriers does the Indian Navy operate?",
                    )
                  }
                >
                  Carrier inventory
                </button>
                <button
                  onClick={() =>
                    setQuestion(
                      "Show the publicly documented Project 76 timeline and mark unknown stages",
                    )
                  }
                >
                  Project 76 timeline
                </button>
              </div>
            </div>
          ) : (
            <div className="answer">
              {loading ? (
                <div className="answer-label">
                  <span className="live-dot" /> RETRIEVING SOURCES AND GENERATING
                  ANSWER…
                </div>
              ) : error ? (
                <div className="watch-warning">{error}</div>
              ) : (
                <>
                  <div className="answer-label">
                    <Sparkles size={14} />{" "}
                    {needsModelKey ? "LOCAL RETRIEVAL" : "RAG RESPONSE"}
                  </div>
                  <p className="answer-copy">{answer}</p>
                  {needsModelKey && (
                    <div className="chat-setup-note">
                      Local retrieval is working. To generate conversational answers and
                      use live web search, set <code>OPENAI_API_KEY</code> in the
                      project-root <code>.env</code>, then restart the backend.
                    </div>
                  )}
                  {sources.length > 0 && (
                    <div className="chat-citations">
                      <strong>SOURCES / CONFIDENCE</strong>
                      {sources.map((source, index) => (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          key={`${source.url}-${index}`}
                        >
                          <span>
                            {source.ref ?? `W${index + 1}`} ·{" "}
                            {source.verificationStatus ?? "unverified"} ·{" "}
                            {source.reviewState ?? "not reviewed"}
                          </span>
                          <b>{source.title}</b>
                          <small>
                            {source.sourceName ??
                              source.sourceId ??
                              source.kind ??
                              "Public source"}
                            {source.publishedAt ? ` · ${source.publishedAt}` : ""}
                          </small>
                        </a>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="chat-input">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onAsk()}
            placeholder="Ask about a programme, inventory, or scenario…"
            disabled={loading}
          />
          <button
            onClick={onAsk}
            aria-label="Send question"
            disabled={loading || !question.trim()}
          >
            {loading ? "…" : <ArrowUpRight size={17} />}
          </button>
        </div>
      </div>
    </div>
  );
}

type ReviewArticle = {
  id: string;
  title: string;
  summary?: string;
  canonicalUrl: string;
  verificationStatus: string;
  reviewState: string;
  sourceId: string;
  publishedAt?: string | null;
  category?: string;
  subcategory?: string | null;
  keywords?: string[];
  imageUrl?: string;
  imageReusePermitted?: boolean;
  imageLicense?: string;
  imageAttribution?: string;
  relatedSources?: Array<{ sourceId: string; url: string; title?: string }>;
};
function SignalFeed({
  articles,
  onReview,
}: {
  articles: ReviewArticle[];
  onReview: () => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => { const saved = sessionStorage.getItem("raksha-search-query"); if (saved) { setQuery(saved); sessionStorage.removeItem("raksha-search-query"); } }, []);
  const [category, setCategory] = useState("all");
  const [publisher, setPublisher] = useState("all");
  const publisherName = (sourceId: string) =>
    sourceId.includes("idrw") ? "IDRW" :
    sourceId === "indian-defence-news" || sourceId === "indian-defence-news-rss" ? "Indian Defence News" :
    sourceId === "et-defence" ? "ETDefence" : sourceId;
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
        (publisher === "all" || publisherName(article.sourceId) === publisher) &&
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
          <option value="IDRW">IDRW</option>
          <option value="ETDefence">ETDefence</option>
          <option value="Indian Defence News">Indian Defence News</option>
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
                    Also reported by {source.sourceId} <ArrowUpRight size={12} />
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
function RagMonitorStatus() {
  const [status, setStatus] = useState<{
    modelConfigured: boolean;
    webSearchEnabled: boolean;
    youtubeConfigured: boolean;
    xConfigured: boolean;
    rssFeeds: number;
    xAccountsConfigured: number;
    lastSyncAt: string | null;
    database?: {
      enabled: boolean;
      articles?: number;
      sources?: number;
      failed_jobs?: number;
      mode?: string;
    };
  } | null>(null);
  useEffect(() => {
    fetch("/api/rag/status")
      .then((response) => response.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);
  return (
    <div className="rag-status-grid">
      <div>
        <span>RAG MODEL</span>
        <strong>{status?.modelConfigured ? "Ready" : "API key needed"}</strong>
      </div>
      <div>
        <span>LIVE WEB SEARCH</span>
        <strong>
          {status?.modelConfigured && status.webSearchEnabled
            ? "Enabled"
            : "Waiting for model key"}
        </strong>
      </div>
      <div>
        <span>RSS DISCOVERY FEEDS</span>
        <strong>{status?.rssFeeds ?? "—"}</strong>
      </div>
      <div>
        <span>YOUTUBE / X APIs</span>
        <strong>
          {status?.youtubeConfigured ? "YouTube ready" : "YouTube key needed"} ·{" "}
          {status?.xConfigured ? "X ready" : "X key/handles needed"}
        </strong>
      </div>
      <div>
        <span>STORAGE / PIPELINE</span>
        <strong>
          {status?.database?.enabled
            ? `PostgreSQL · ${status.database.articles ?? 0} records`
            : "Local JSON store"}
          {status?.database?.failed_jobs
            ? ` · ${status.database.failed_jobs} recent failures`
            : ""}
        </strong>
      </div>
      <div>
        <span>LAST DISCOVERY SYNC</span>
        <strong>
          {status?.lastSyncAt
            ? new Date(status.lastSyncAt).toLocaleString("en-IN")
            : "Not run"}
        </strong>
      </div>
      <p>
        Discovery results are candidates. Search snippets and social posts never become
        verified facts automatically.
      </p>
    </div>
  );
}

function ReviewControls({
  article,
  adminToken,
  onSaved,
}: {
  article: ReviewArticle;
  adminToken: string;
  onSaved: (item: ReviewArticle) => void;
}) {
  const [reviewState, setReviewState] = useState(article.reviewState);
  const [verificationStatus, setVerificationStatus] = useState(
    article.verificationStatus,
  );
  const [reviewerNote, setReviewerNote] = useState("");
  const [imageReusePermitted, setImageReusePermitted] = useState(
    article.imageReusePermitted === true,
  );
  const [imageLicense, setImageLicense] = useState(article.imageLicense ?? "");
  const [imageAttribution, setImageAttribution] = useState(
    article.imageAttribution ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async () => {
    if (reviewState === "approved" && !reviewerNote.trim()) {
      setError("Add a short review note before approval.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/articles/${encodeURIComponent(article.id)}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({
            reviewState,
            verificationStatus,
            reviewerNote,
            imageReusePermitted,
            imageLicense,
            imageAttribution,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Review could not be saved.");
      onSaved(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Review could not be saved.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="review-controls">
      <select
        value={reviewState}
        onChange={(event) => setReviewState(event.target.value)}
        aria-label={`Review state for ${article.title}`}
      >
        <option value="unreviewed">Needs review</option>
        <option value="in_review">In review</option>
        <option value="approved">Approve</option>
        <option value="rejected">Remove from active feed</option>
      </select>
      <select
        value={verificationStatus}
        onChange={(event) => setVerificationStatus(event.target.value)}
        aria-label={`Verification status for ${article.title}`}
      >
        <option value="official">Official</option>
        <option value="verified">Verified</option>
        <option value="reported">Reported</option>
        <option value="unverified">Unverified</option>
        <option value="disputed">Disputed</option>
        <option value="corrected">Corrected</option>
        <option value="withdrawn">Withdrawn</option>
      </select>
      {(reviewState === "approved" || imageReusePermitted) && (
        <input
          value={reviewerNote}
          onChange={(event) => setReviewerNote(event.target.value)}
          placeholder="Review note required for approval/rights"
          aria-label="Reviewer note"
        />
      )}
      {article.imageUrl && (
        <>
          <label className="image-rights-control">
            <input
              type="checkbox"
              checked={imageReusePermitted}
              onChange={(event) => setImageReusePermitted(event.target.checked)}
            />{" "}
            Confirm image reuse rights
          </label>
          {imageReusePermitted && (
            <>
              <input
                value={imageLicense}
                onChange={(event) => setImageLicense(event.target.value)}
                placeholder="Image licence / permission"
                aria-label="Image licence"
              />
              <input
                value={imageAttribution}
                onChange={(event) => setImageAttribution(event.target.value)}
                placeholder="Required image attribution"
                aria-label="Image attribution"
              />
            </>
          )}
        </>
      )}
      <button className="catalog-more" onClick={save} disabled={busy}>
        {busy ? "Saving…" : "Save review"}
      </button>
      {error && <small className="review-error">{error}</small>}
    </div>
  );
}

type RegistrySource = {
  id: string;
  name: string;
  url: string;
  sourceType: string;
  official: boolean;
  defaultStatus: string;
  reliabilityNotes: string;
  active?: boolean;
};
function SourceRegistry({
  sources,
  adminToken,
  onUpdated,
}: {
  sources: RegistrySource[];
  adminToken: string;
  onUpdated: (source: RegistrySource) => void;
}) {
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const toggle = async (source: RegistrySource) => {
    setBusyId(source.id);
    setError("");
    try {
      const response = await fetch(
        `/api/monitor-sources/${encodeURIComponent(source.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({ active: source.active === false }),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update source.");
      onUpdated({ ...source, active: result.source.active });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update source.");
    } finally {
      setBusyId("");
    }
  };
  return (
    <>
      <div className="source-table">
        {sources.map((source) => {
          const monitorable = /rss|discovery feed/i.test(source.sourceType);
          return (
            <div className="source-entry" key={source.id}>
              <a href={source.url} target="_blank" rel="noreferrer">
                <div>
                  <span className={"verification-chip " + source.defaultStatus}>
                    {source.official
                      ? "OFFICIAL SOURCE"
                      : source.defaultStatus.toUpperCase()}{" "}
                    · {source.sourceType}
                    {source.active === false ? " · PAUSED" : ""}
                  </span>
                  <h3>{source.name}</h3>
                  <p>{source.reliabilityNotes}</p>
                </div>
                <ArrowUpRight size={16} />
              </a>
              {monitorable && (
                <button
                  className="catalog-more"
                  disabled={busyId === source.id}
                  onClick={() => toggle(source)}
                >
                  {busyId === source.id
                    ? "Saving…"
                    : source.active === false
                      ? "Resume feed"
                      : "Pause feed"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {error && <small className="review-error">{error}</small>}
    </>
  );
}

function CommandDirectory({ records, compact = false }: { records: CommandRecord[]; compact?: boolean }) {
  const groups = ["Indian Army", "Indian Navy", "Indian Air Force", "Joint"];
  return (
    <div className={compact ? "command-grid command-grid-compact" : "command-grid"}>
      {groups.map((service) => {
        const items = records.filter((record) => record.service === service && record.status === "established");
        if (!items.length) return null;
        return (
          <article className="command-card" key={service}>
            <span className="section-kicker">{items.length} REGISTERED STRUCTURES</span>
            <h3>{service === "Joint" ? "Joint structures" : service}</h3>
            <div className="command-record-list">
              {items.map((record) => (
                <div className="command-record" key={record.id}>
                  <strong>{record.name}</strong>
                  <small>{record.structureType} · {record.status.replace(/_/g, " ")}</small>
                  {record.headquarters && <small>HQ: {record.headquarters}</small>}
                  <a href={record.sourceUrl} target="_blank" rel="noreferrer">
                    {record.sourceName} <ArrowUpRight size={11} />
                  </a>
                </div>
              ))}
            </div>
          </article>
        );
      })}
      {records.some((record) => record.status !== "established") && (
        <article className="command-card">
          <span className="section-kicker">NOT ESTABLISHED</span>
          <h3>Proposed / under-study structures</h3>
          <div className="command-record-list">
            {records.filter((record) => record.status !== "established").map((record) => (
              <div className="command-record" key={record.id}>
                <strong>{record.name}</strong>
                <small>{record.structureType} · {record.status.replace(/_/g, " ")}</small>
                <p>{record.description}</p>
                <a href={record.sourceUrl} target="_blank" rel="noreferrer">
                  {record.sourceName} <ArrowUpRight size={11} />
                </a>
              </div>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState<View>(() => {
    const hash = window.location.hash.slice(1) as View;
    return [
      "overview",
      "forces",
      "atlas",
      "programmes",
      "pipeline",
      "signals",
      "sources",
      "inventory",
      "timeline",
      "watch",
      "pib",
      "register",
      "history",
    ].includes(hash)
      ? hash
      : "overview";
  });
  const [activeForce, setActiveForce] = useState("all");
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatSources, setChatSources] = useState<ChatSource[]>([]);
  const [chatNeedsModelKey, setChatNeedsModelKey] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [composerTitle, setComposerTitle] = useState("");
  const [composerUrl, setComposerUrl] = useState("");
  const [composerNotes, setComposerNotes] = useState("");
  const [composerError, setComposerError] = useState("");
  const [composerSaving, setComposerSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("raksha-theme");
    return saved === "light" ? "light" : "dark";
  });
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState<Array<{section:string;view:View;id:string;title:string;summary:string}>>([]);
  const [globalSearchLoading, setGlobalSearchLoading] = useState(false);
  const [apiState, setApiState] = useState<"checking" | "online" | "offline">(
    "checking",
  );
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [articles, setArticles] = useState<ReviewArticle[]>([]);
  const [articleState, setArticleState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [articleFilter, setArticleFilter] = useState("all");
  const [reviewStateFilter, setReviewStateFilter] = useState("all");
  const [adminToken, setAdminToken] = useState(
    () => sessionStorage.getItem("raksha-admin-token") ?? "",
  );
  const [ledgerCounts, setLedgerCounts] = useState({
    programmes: 0,
    sources: 0,
  });
  const [sourceRegistry, setSourceRegistry] = useState<RegistrySource[]>([]);
  const [commandRecords, setCommandRecords] = useState<CommandRecord[]>([]);
  const [commandState, setCommandState] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    Promise.all([
      fetch("/api/timelines").then((r) => r.json()),
      fetch("/api/sources").then((r) => r.json()),
      fetch("/api/commands").then((response) => {
        if (!response.ok) throw new Error("Command directory unavailable");
        return response.json();
      }),
    ])
      .then(([programmesData, sourcesData, commandsData]) => {
        setLedgerCounts({
          programmes: programmesData.count ?? 0,
          sources: sourcesData.items?.length ?? 0,
        });
        setSourceRegistry(sourcesData.items ?? []);
        setCommandRecords(commandsData.items ?? []);
        setCommandState("ready");
      })
      .catch(() => {
        setLedgerCounts({ programmes: 0, sources: 0 });
        setCommandState("error");
      });
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("raksha-theme", theme);
  }, [theme]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setGlobalSearchOpen((open) => !open);
      }
      if (event.key === "Escape") setGlobalSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const q = globalSearch.trim();
    if (q.length < 2) { setGlobalSearchResults([]); setGlobalSearchLoading(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setGlobalSearchLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((response) => { if (!response.ok) throw new Error("Search unavailable"); return response.json(); })
        .then((data: { results?: Array<{section:string;view:View;id:string;title:string;summary:string}> }) => setGlobalSearchResults(data.results ?? []))
        .catch((error) => { if (error.name !== "AbortError") setGlobalSearchResults([]); })
        .finally(() => { if (!controller.signal.aborted) setGlobalSearchLoading(false); });
    }, 160);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [globalSearch]);
  const selectedForce = useMemo(
    () =>
      activeForce === "all"
        ? {
            ...forces[0],
            id: "all",
            label: "All service domains",
            short: "ALL",
            description:
              "Explore public, source-linked records across every available service domain.",
            metric: "Unified public catalogue",
          }
        : forces.find((force) => force.id === activeForce) ?? forces[0],
    [activeForce],
  );
  const todayIst = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase();
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1) as View;
      if (
        [
          "overview",
          "forces",
          "programmes",
          "pipeline",
          "signals",
          "sources",
          "inventory",
          "timeline",
          "watch",
          "pib",
          "register",
          "history",
        ].includes(hash)
      )
        setActiveView(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (articleFilter !== "all") params.set("verificationStatus", articleFilter);
    if (reviewStateFilter !== "all") params.set("reviewState", reviewStateFilter);
    const filter = params.size ? `?${params.toString()}` : "";
    let active = true;
    const loadArticles = () =>
      fetch(`/api/articles${filter}`)
        .then(async (response) => {
          if (!response.ok) throw new Error("Unable to load articles");
          return response.json() as Promise<{ items: typeof articles }>;
        })
        .then((result) => {
          if (active) {
            setArticles(result.items);
            setArticleState("ready");
          }
        })
        .catch(() => {
          if (active) setArticleState("error");
        });
    setArticleState((previous) => (previous === "ready" ? "ready" : "loading"));
    void loadArticles();
    const timer = window.setInterval(() => {
      void loadArticles();
    }, 5 * 60_000);
    window.addEventListener("focus", loadArticles);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", loadArticles);
    };
  }, [articleFilter, reviewStateFilter]);
  useEffect(() => {
    fetch("/api/health")
      .then(async (response) => {
        if (!response.ok) throw new Error("API unavailable");
        const health = (await response.json()) as {
          lastRefresh: string | null;
        };
        setLastRefresh(health.lastRefresh);
        setApiState("online");
      })
      .catch(() => setApiState("offline"));
  }, []);
  const navigate = (view: View) => {
    setActiveView(view);
    setMenuOpen(false);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const ask = async () => {
    const prompt = question.trim();
    if (!prompt || chatLoading) return;
    setChatLoading(true);
    setChatError("");
    setChatAnswer("");
    setChatSources([]);
    setChatNeedsModelKey(false);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not retrieve a sourced answer.");
      setChatAnswer(result.answer ?? "No answer was returned.");
      setChatSources(result.sources ?? []);
      setChatNeedsModelKey(Boolean(result.needsModelKey));
      setQuestion("");
    } catch (error) {
      setChatError(
        error instanceof Error ? error.message : "Chat service is unavailable.",
      );
    } finally {
      setChatLoading(false);
    }
  };
  const saveManualCandidate = async () => {
    setComposerError("");
    if (!composerTitle.trim() || !composerUrl.trim() || !composerNotes.trim()) {
      setComposerError("Add a headline, source URL and notes.");
      return;
    }
    try {
      new URL(composerUrl);
    } catch {
      setComposerError("Enter a valid public source URL.");
      return;
    }
    setComposerSaving(true);
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          title: composerTitle.trim(),
          canonicalUrl: composerUrl.trim(),
          summary: composerNotes.trim(),
          sourceId: "manual-editorial",
          topic: "Defence & Security",
          confidence: "editor-submitted; awaiting review",
          verificationStatus: "unverified",
          reviewState: "unreviewed",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save candidate.");
      setArticles((previous) => [result, ...previous]);
      setComposerTitle("");
      setComposerUrl("");
      setComposerNotes("");
      setShowComposer(false);
    } catch (error) {
      setComposerError(
        error instanceof Error ? error.message : "Could not save candidate.",
      );
    } finally {
      setComposerSaving(false);
    }
  };

  const navigationItems: Array<[View, string]> = [
    ["overview", "Overview"],
    ["forces", "Commands"],
    ["atlas", "Theatre Atlas"],
    ["inventory", "Inventory"],
    ["programmes", "Programmes"],
    ["signals", "Articles"],
    ["sources", "Sources"],
  ];
  const Nav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav
      className={mobile ? "mobile-nav" : "topnav"}
      aria-label={mobile ? "Mobile navigation" : "Primary navigation"}
    >
      {navigationItems.map(([item, label]) => (
        <button
          className={activeView === item ? "nav-link active" : "nav-link"}
          key={item}
          onClick={() => navigate(item)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
  const Header = () => (
    <>
      <header className="topbar">
        <button className="brand brand-button" onClick={() => navigate("overview")}>
          <div className="brand-mark">
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <div>
            <strong>RAKSHA</strong>
            <span>ATLAS / 01</span>
          </div>
        </button>
        <Nav />
        <div className="top-actions">
          <button className="global-search-trigger" onClick={() => { setGlobalSearchOpen(true); setGlobalSearch(""); }} aria-label="Search Raksha Atlas">
            <Search size={16} /><span>Search Atlas</span><kbd>⌘ K</kbd>
          </button>
          <button className="icon-btn theme-toggle" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="icon-btn" aria-label="Open PIB releases" onClick={() => navigate("pib")}><Bell size={17} /></button>
          <button
            className="menu-btn"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={18} />
          </button>
        </div>
        {menuOpen && <Nav mobile />}
      </header>
      {globalSearchOpen && <div className="atlas-search-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setGlobalSearchOpen(false); }}>
        <section className="atlas-search-dialog" role="dialog" aria-modal="true" aria-label="Search Raksha Atlas">
          <div className="atlas-search-input"><Search size={19}/><input autoFocus value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} placeholder="Search AMCA, Apache, destroyer, Tejas…" onKeyDown={(event) => { if (event.key === "Enter" && globalSearchResults[0]) { navigate(globalSearchResults[0].view); setGlobalSearchOpen(false); } }}/><kbd>ESC</kbd></div>
          <div className="atlas-search-hint">{globalSearch.trim().length < 2 ? "Search inventory, programmes, articles, procurement, timelines and sources" : globalSearchLoading ? "Searching across Raksha Atlas…" : `${globalSearchResults.length} matching records across the Atlas`}</div>
          {globalSearch.trim().length < 2 ? <div className="atlas-search-links">{navigationItems.map(([view,label]) => <button key={view} onClick={() => {navigate(view);setGlobalSearchOpen(false);}}><span>{label}</span><small>{view}</small><ArrowUpRight size={14}/></button>)}</div> :
            <div className="atlas-search-results">{globalSearchResults.map((result,index) => <button key={result.view+"-"+result.id+"-"+index} onClick={() => { sessionStorage.setItem("raksha-search-query", globalSearch.trim()); if (result.view === "pipeline") sessionStorage.setItem("raksha-search-mode", "pipeline"); navigate(result.view); setGlobalSearchOpen(false); }}><span className="atlas-result-section">{result.section}</span><strong>{result.title}</strong><small>{result.summary || "Open this record"}</small><ArrowUpRight size={14}/></button>)}
              {!globalSearchLoading && globalSearchResults.length === 0 && <div className="atlas-search-empty">No exact matches found. Try a shorter platform name, acronym or variant.</div>}
            </div>}
          <div className="atlas-search-footer">Results are grouped by the section that owns each record · Enter opens the first result</div>
        </section>
      </div>}
      <div className="command-strip">
        <span>
          <i className="strip-status" /> SYSTEM ONLINE
        </span>
        <span>PUBLIC DATA NETWORK</span>
        <span>OPEN-SOURCE / INDIA</span>
        <strong>{todayIst} · IST</strong>
      </div>
    </>
  );
  const SectionTitle = ({
    kicker,
    title,
    action,
  }: {
    kicker: string;
    title: React.ReactNode;
    action?: React.ReactNode;
  }) => (
    <div className="section-heading">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
  const ForceCards = () => (
    <div className="force-grid">
      {forces.map((force) => {
        const Icon = force.icon;
        return (
          <button
            className={activeForce === force.id ? "force-card selected" : "force-card"}
            style={{ "--accent": force.accent } as React.CSSProperties}
            key={force.id}
            onClick={() => {
              setActiveForce(force.id);
              navigate("forces");
            }}
          >
            <div className="force-icon">
              <Icon size={20} />
            </div>
            <div>
              <span className="force-code">{force.short}</span>
              <h3>{force.label}</h3>
              <p>{force.description}</p>
            </div>
            <ArrowUpRight className="force-arrow" size={16} />
          </button>
        );
      })}
    </div>
  );

  const Overview = () => (
    <>
      <section className="hero overview-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> INDIAN DEFENCE FORCES / OPEN-SOURCE ATLAS
          </div>
          <h1>
            A clear view of
            <br />
            <em>India's forces.</em>
          </h1>
          <p>
            Explore the services, their commands, public inventory, procurement
            programmes and the reporting behind each record. Every claim carries a
            source and a confidence label.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate("forces")}>
              Explore commands <ArrowUpRight size={16} />
            </button>
            <button className="text-btn" onClick={() => setChatOpen(true)}>
              <Bot size={16} /> Ask Atlas
            </button>
          </div>
        </div>
        <div className="overview-side">
          <div className="overview-status">
            <span
              className={apiState === "online" ? "status-pip" : "status-pip offline"}
            />{" "}
            API{" "}
            <strong>
              {apiState === "online" ? "CONNECTED" : apiState.toUpperCase()}
            </strong>
            <small>
              {lastRefresh
                ? `Last refresh ${new Date(lastRefresh).toLocaleString("en-IN")}`
                : "No refresh recorded yet"}
            </small>
          </div>
          <div className="overview-quote">
            <Shield size={22} />
            <span>
              PUBLIC SOURCES
              <br />
              TRACEABLE CLAIMS
            </span>
            <small>Official releases and attributed reporting stay distinct.</small>
          </div>
        </div>
      </section>
      <section className="overview-metrics">
        <div>
          <span>PROGRAMMES TRACKED</span>
          <strong>{ledgerCounts.programmes}</strong>
        </div>
        <div>
          <span>SOURCES REGISTERED</span>
          <strong>{ledgerCounts.sources}</strong>
        </div>
        <div>
          <span>NEWS DISCOVERY</span>
          <strong>HOURLY</strong>
        </div>
        <div>
          <span>REFERENCE SYNC</span>
          <strong>04:00 IST</strong>
        </div>
      </section>
      <section className="content-section">
        <SectionTitle
          kicker="01 / SERVICE COMMANDS"
          title={
            <>
              The force <em>map</em>
            </>
          }
          action={
            <button className="quiet-btn" onClick={() => navigate("forces")}>
              Open command directory <ChevronRight size={15} />
            </button>
          }
        />
        <ForceCards />
        {commandState === "loading" ? (
          <p className="equipment-note">Loading public command records…</p>
        ) : commandState === "error" ? (
          <p className="equipment-note">Command directory is temporarily unavailable.</p>
        ) : (
          <CommandDirectory records={commandRecords} compact />
        )}
      </section>
      <section className="content-section">
        <SectionTitle
          kicker="02 / ATLAS FEATURES"
          title={
            <>
              Research by <em>topic</em>
            </>
          }
        />
      </section>
      <div className="feature-grid">
        {[
          [
            "inventory",
            "Inventory",
            "Equipment records, counts, status and source notes.",
          ],
          [
            "programmes",
            "Active & future programmes",
            "Procurement stages and prospective acquisitions.",
          ],
          [
            "timeline",
            "Procurement timelines",
            "Milestones from approval through delivery and induction.",
          ],
          ["history", "Armed forces history", "A source-linked historical index."],
          [
            "signals",
            "Articles & reports",
            "Recent reporting with verification and review labels.",
          ],
          [
            "pib",
            "Official releases",
            "Defence releases from the Press Information Bureau.",
          ],
          ["watch", "Tender watch", "Public tender metadata and closing dates."],
          [
            "pipeline",
            "Acquisition process",
            "A guide to the typical acquisition stages.",
          ],
        ].map(([view, title, detail]) => (
          <button
            className="feature-card"
            key={view}
            onClick={() => navigate(view as View)}
          >
            <span className="feature-mark">
              <ArrowUpRight size={15} />
            </span>
            <strong>{title}</strong>
            <small>{detail}</small>
          </button>
        ))}
      </div>
      <SignalCard onOpen={() => navigate("signals")} />
    </>
  );
  const Forces = () => (
    <section className="page-section">
      <div className="page-hero">
        <span className="section-kicker">FORCE MAP / PUBLIC RECORD</span>
        <h1>
          Services and <em>commands.</em>
        </h1>
        <p>
          Choose a service domain. Inventory and programmes use public records and
          reporting; they do not represent a classified order of battle.
        </p>
      </div>
      <ForceCards />
      <section className="content-section">
        <SectionTitle
          kicker="COMMAND DIRECTORY / PUBLIC RECORD"
          title={<>Established and <em>joint structures.</em></>}
        />
        <p className="equipment-note">
          Service commands, joint operational commands, headquarters and agencies are kept in separate classifications.
          Proposed theatre-command structures are labelled as under study, not established.
        </p>
        {commandState === "ready" && <CommandDirectory records={commandRecords} />}
        {commandState === "error" && <p className="equipment-note">Command directory is temporarily unavailable.</p>}
      </section>
      <article className="force-detail-panel">
        <div className="timeline-card-heading">
          <div>
            <span className="section-kicker">SELECTED DOMAIN</span>
            <h2>{selectedForce.label}</h2>
          </div>
          <span>{selectedForce.metric}</span>
        </div>
        <p>{selectedForce.description}</p>
        <div className="force-actions">
          <button className="glass-btn" onClick={() => navigate("inventory")}>
            View inventory <ArrowUpRight size={14} />
          </button>
          <button className="glass-btn" onClick={() => navigate("programmes")}>
            View programmes <ArrowUpRight size={14} />
          </button>
          <button className="glass-btn" onClick={() => navigate("timeline")}>
            Procurement timeline <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="force-modernization">
          <div className="section-heading">
            <div>
              <span className="section-kicker">SELECTED DOMAIN / MODERNIZATION</span>
              <h2>Source-backed programme records</h2>
            </div>
            <button className="quiet-btn" onClick={() => navigate("programmes")}>
              Open programme ledger <ChevronRight size={14} />
            </button>
          </div>
          <p className="equipment-note">
            The programme ledger uses source records and stated stages. It does not
            display unsourced progress percentages.
          </p>
        </div>
      </article>
    </section>
  );
  const Programmes = () => (
    <section className="page-section">
      <div className="page-hero">
        <span className="section-kicker">MODERNISATION / PROGRAMME LEDGER</span>
        <h1>
          Programmes in <em>motion.</em>
        </h1>
        <p>
          Browse official programmes, acquisition approvals, contracts and reported plans. Each record keeps its evidence trail; a proposal or AoN is not a contract, delivery or induction.
        </p>
      </div>
      <ProgrammeDossierExplorer />
    </section>
  );
  const Pipeline = () => (
    <section className="page-section">
      <div className="page-hero">
        <span className="section-kicker">ACQUISITION / PROCESS MAP</span>
        <h1>
          From need to <em>induction.</em>
        </h1>
        <p>
          Typical public procurement sequence. The applicable route varies by
          acquisition category; each programme timeline should cite the actual milestone
          and date.
        </p>
      </div>
      <div className="timeline-track">
        {acquisitionStages.map(([number, title, detail]) => (
          <article className="timeline-step" key={number}>
            <span className="timeline-dot" />
            <strong>
              {number} · {title}
            </strong>
            <p>{detail}</p>
          </article>
        ))}
      </div>
      <EquipmentDataExplorer />
    </section>
  );
  const Signals = () => (
    <SignalFeed articles={articles} onReview={() => navigate("sources")} />
  );
  const Inventory = () => {
    type InventoryItem = {
      id: string; service: string; category: string; platform: string;
      quantity: number | null; quantityStatus: string; definition: string;
      confidence: string; verificationStatus: string; sourceId: string;
      sourceUrl?: string; supportingSourceIds?: string[]; originCountry: string;
      procurementYear: number | null; inductedYear: number | null; role: string;
      variant?: string; manufacturer?: string; capabilitySummary?: string;
      dataLimitations?: string; imageUrl?: string; technicalProfile?: Record<string, string>;
      acquisition?: { stage: string; stageDate?: string | null; quantity?: number | null;
        quantityUnit?: string; deliveryStart?: string | null; deliveryEnd?: string | null;
        stageMeaning?: string; timeline?: Array<{ date: string; event: string; stage: string }> };
    };
    type InventoryFilterOptions = {
      serviceDomains: string[];
      categories: string[];
      quantityStatuses: string[];
    };
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filterOptions, setFilterOptions] = useState<InventoryFilterOptions>({
      serviceDomains: [],
      categories: [],
      quantityStatuses: [],
    });
    const [serviceFilter, setServiceFilter] = useState(
      () => ({ navy: "Navy", "air-force": "Air Force", army: "Army", space: "Space", cyber: "Cyber", intelligence: "Intelligence" })[activeForce] ?? "all",
    );
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [query, setQuery] = useState("");
    useEffect(() => { const saved = sessionStorage.getItem("raksha-search-query"); if (saved) { setQuery(saved); sessionStorage.removeItem("raksha-search-query"); } }, []);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const controller = new AbortController();
      const params = new URLSearchParams();
      if (serviceFilter !== "all") params.set("service", serviceFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (statusFilter !== "all") params.set("quantityStatus", statusFilter);
      setLoading(true);
      fetch(`/api/inventory?${params}`, { signal: controller.signal })
        .then((r) => { if (!r.ok) throw new Error("Inventory unavailable"); return r.json(); })
        .then((data: { items: InventoryItem[]; availableFilters?: InventoryFilterOptions }) => {
          setItems(data.items ?? []);
          if (data.availableFilters) setFilterOptions(data.availableFilters);
        })
        .catch((error) => { if (error.name !== "AbortError") console.error(error); })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
      return () => controller.abort();
    }, [serviceFilter, categoryFilter, statusFilter]);
    const visibleItems = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return items;
      return items.filter((item) => [
        item.platform, item.service, item.category, item.role, item.variant ?? "",
        item.manufacturer ?? "", item.originCountry, item.definition,
        item.capabilitySummary ?? "", item.technicalProfile?.platformType ?? "",
        ...Object.values(item.technicalProfile ?? {}),
      ].join(" ").toLowerCase().includes(q));
    }, [items, query]);
    const subcategory = (item: InventoryItem) => item.technicalProfile?.class || item.variant || item.technicalProfile?.platformType || item.role || item.category;
    const iconFor = (item: InventoryItem) => /ship|submarine|corvette|destroyer|frigate|carrier/i.test(item.category) ? Ship : /aircraft|helicopter|fighter|trainer|aviation|drone|uav|missile|air defence/i.test(item.category) ? Plane : Shield;
    return (
      <section className="page-section">
        <div className="page-hero">
          <span className="section-kicker">INVENTORY / SERVICE-OWNED PUBLIC REFERENCE</span>
          <h1>Equipment, <em>properly classified.</em></h1>
          <p>Browse public inventory by the service or capability domain recorded for each item. The operator, platform domain, class, variant and lifecycle status remain distinct; source estimates are not silently combined.</p>
        </div>
        <div className="inventory-toolbar inventory-toolbar-v2">
          <div className="inventory-filters">
            <label><span className="section-kicker">SERVICE / DOMAIN</span>
              <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} aria-label="Filter by operating service">
                <option value="all">All service domains</option>
                {filterOptions.serviceDomains.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label><span className="section-kicker">EQUIPMENT TYPE</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by equipment type">
                <option value="all">All equipment types</option>
                {filterOptions.categories.map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label><span className="section-kicker">LIFECYCLE</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by lifecycle status">
                <option value="all">All statuses</option>
                {filterOptions.quantityStatuses.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}
              </select>
            </label>
          </div>
          <strong className="inventory-count">{loading ? "Loading…" : `${visibleItems.length} / ${items.length} records`}</strong>
        </div>
        <div className="inventory-search-row">
          <Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a platform, class, variant, role or manufacturer…" aria-label="Search inventory records"/>
          {query && <button className="quiet-btn" onClick={() => setQuery("")}>Clear</button>}
        </div>
        <div className="inventory-profile-grid">
          {visibleItems.map((item) => {
            const PlatformIcon = iconFor(item);
            return <article className="equipment-profile" key={item.id}>
              <div className="equipment-profile-visual">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.platform} loading="lazy" /> : <div className="equipment-visual-placeholder"><PlatformIcon size={42}/><span>{item.category}</span></div>}
                <span className="equipment-service-tag">{item.service}</span>
              </div>
              <div className="equipment-profile-body">
                <div className="equipment-profile-kicker">{item.category} · {subcategory(item)}</div>
                <h3>{item.platform}</h3>
                {item.variant && <p className="equipment-variant">{item.variant}</p>}
                <p className="equipment-description">{item.capabilitySummary || item.definition}</p>
                <div className="equipment-profile-facts">
                  <div><span>Quantity / claim</span><strong>{item.quantity == null ? "Not stated" : item.quantity.toLocaleString()}</strong></div>
                  <div><span>Lifecycle</span><strong>{item.quantityStatus.replace(/_/g, " ")}</strong></div>
                  <div><span>Origin</span><strong>{item.originCountry || "Not stated"}</strong></div>
                  <div><span>Manufacturer</span><strong>{item.manufacturer || item.technicalProfile?.manufacturer || "Not stated"}</strong></div>
                  <div><span>Procurement</span><strong>{item.procurementYear ?? "—"}</strong></div>
                  <div><span>Inducted</span><strong>{item.inductedYear ?? "—"}</strong></div>
                </div>
                <div className="equipment-profile-role"><b>Role</b><span>{item.role}</span></div>
                <div className="equipment-profile-footer">
                  <span className={`verification-chip ${item.verificationStatus}`}>{item.verificationStatus.replace(/_/g, " ")}</span>
                  <span>Confidence: {item.confidence}</span>
                  {item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer">Evidence <ArrowUpRight size={12}/></a> : <span>Source: {item.sourceId}</span>}
                </div>
                {(item.technicalProfile || item.acquisition || item.dataLimitations) && <details className="inventory-detail">
                  <summary>Technical profile &amp; acquisition notes</summary>
                  <div className="inventory-detail-grid">
                    {Object.entries(item.technicalProfile ?? {}).map(([label, value]) => <span key={label}><b>{label.replace(/([A-Z])/g, " $1")}</b>{value}</span>)}
                  </div>
                  {item.acquisition && <div className="inventory-acquisition"><b>Acquisition stage</b><span>{item.acquisition.stage}{item.acquisition.stageDate ? ` · ${item.acquisition.stageDate}` : ""}</span>{item.acquisition.stageMeaning && <p>{item.acquisition.stageMeaning}</p>}{item.acquisition.timeline?.map((event,index) => <span key={index}>{event.date} — {event.event}</span>)}</div>}
                  {item.dataLimitations && <p className="inventory-data-note">{item.dataLimitations}</p>}
                </details>}
              </div>
            </article>;
          })}
        </div>
        {!loading && visibleItems.length === 0 && <div className="data-state">No equipment matches “{query}”. Try a platform name, service or equipment type.</div>}
        <EquipmentDataExplorer />
        <WikipediaEquipmentTables />
      </section>
    );
  };
  const Timeline = () => {
    const [service, setService] = useState("all");
    const [items, setItems] = useState<
      Array<{
        id: string;
        programme: string;
        service: string;
        confidence: string;
        verificationStatus: string;
        sourceId: string;
        milestones: Array<{
          stage: string;
          date: string | null;
          label: string;
          verificationStatus?: string;
          sourceId?: string;
          sourceUrl?: string;
        }>;
      }>
    >([]);
    useEffect(() => {
      fetch(
        `/api/timelines${service === "all" ? "" : `?service=${encodeURIComponent(service)}`}`,
      )
        .then((r) => r.json())
        .then((data: { items: typeof items }) => setItems(data.items));
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
  };
  const Watch = () => {
    const [items, setItems] = useState<
      Array<{
        id: string;
        title: string;
        reference: string;
        sourceId: string;
        sourceUrl: string;
        closingAt: string;
        status: string;
        scope: string;
        verificationStatus: string;
      }>
    >([]);
    useEffect(() => {
      fetch("/api/procurement-2026")
        .then((r) => r.json())
        .then((data: { items: typeof items }) => setItems(data.items));
    }, []);
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
        <div className="watch-list">
          {items.map((item) => (
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
  };
  const PibDefence = () => {
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
  };
  const Sources = () => {
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
        const response = await fetch("/api/refresh", {
          method: "POST",
          headers: adminToken ? { Authorization: "Bearer " + adminToken } : {},
        });
        if (!response.ok)
          throw new Error("Refresh failed. Check the API status and admin token.");
        setSyncState("complete");
        const refreshed = await fetch("/api/articles").then((r) => r.json());
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
        const response = await fetch("/api/monitor-sources", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
          },
          body: JSON.stringify({
            name: feedName.trim(),
            url: feedUrl.trim(),
            discovery: feedDiscovery,
          }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not add source.");
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
        <RagMonitorStatus />
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
                <ReviewControls
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
        <SourceRegistry
          sources={sourceRegistry}
          adminToken={adminToken}
          onUpdated={(updated) =>
            setSourceRegistry((previous) =>
              previous.map((source) => (source.id === updated.id ? updated : source)),
            )
          }
        />
      </section>
    );
  };
  const SignalCard = ({ onOpen }: { onOpen: () => void }) => (
    <section className="content-section newsroom-section">
      <SectionTitle
        kicker="03 / SIGNAL ROOM"
        title={
          <>
            Latest <em>public leads</em>
          </>
        }
        action={
          <button className="quiet-btn" onClick={onOpen}>
            View all leads <ChevronRight size={15} />
          </button>
        }
      />
      <div className="updates-grid">
        {articles
          .filter((article) => article.reviewState !== "rejected")
          .slice(0, 3)
          .map((article) => (
            <article className="update-card" key={article.id}>
              <div className="update-top">
                <span className={"verification-chip " + article.verificationStatus}>
                  {article.verificationStatus}
                </span>
                <span>{article.reviewState.replace(/_/g, " ")}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary || "Open the original source for details."}</p>
              <button className="read-link" onClick={onOpen}>
                Open lead <ArrowUpRight size={14} />
              </button>
            </article>
          ))}
      </div>
      {articles.length === 0 && (
        <div className="data-state">No public leads have been collected yet.</div>
      )}
    </section>
  );

  return (
    <div className="app-shell">
      <Header />
      <main>
        {activeView === "overview" && <Overview />}
        {activeView === "forces" && <Forces />}
        {activeView === "atlas" && <TheatreAtlas />}
        {activeView === "programmes" && <Programmes />}
        {activeView === "pipeline" && <Pipeline />}
        {activeView === "signals" && <Signals />}
        {activeView === "inventory" && <Inventory />}
        {activeView === "register" && <PlatformRegister />}
        {activeView === "timeline" && <Timeline />}
        {activeView === "history" && <ArmedForcesHistory />}
        {activeView === "watch" && <Watch />}
        {activeView === "pib" && <PibDefence />}
        {activeView === "sources" && <Sources />}
      </main>
      <footer className="footer">
        <button className="brand brand-button" onClick={() => navigate("overview")}>
          <div className="brand-mark">
            <Shield size={16} />
          </div>
          <div>
            <strong>RAKSHA</strong>
            <span>ATLAS / 01</span>
          </div>
        </button>
        <p>Public information. Clear context. No classified material.</p>
        <span>
          <Clock3 size={12} /> PIB metadata sync target: 04:00 IST
        </span>
      </footer>
      {chatOpen && (
        <ChatDialog
          question={question}
          setQuestion={setQuestion}
          answer={chatAnswer}
          sources={chatSources}
          loading={chatLoading}
          error={chatError}
          onAsk={ask}
          onClose={() => setChatOpen(false)}
          needsModelKey={chatNeedsModelKey}
        />
      )}
      {showComposer && (
        <div
          className="modal-backdrop"
          onClick={() => !composerSaving && setShowComposer(false)}
        >
          <div className="composer-panel" onClick={(event) => event.stopPropagation()}>
            <div className="chat-header">
              <div>
                <span className="section-kicker">SOURCE REVIEW / MANUAL CANDIDATE</span>
                <h2>
                  Add a <em>public lead</em>
                </h2>
              </div>
              <button
                className="icon-btn"
                onClick={() => setShowComposer(false)}
                aria-label="Close composer"
              >
                <X size={18} />
              </button>
            </div>
            <p>
              Submissions enter as unverified and unreviewed. Add a public link; do not
              upload restricted material.
            </p>
            <label>
              Headline
              <input
                value={composerTitle}
                onChange={(event) => setComposerTitle(event.target.value)}
                placeholder="Give the update a clear headline"
              />
            </label>
            <label>
              Source URL
              <input
                type="url"
                value={composerUrl}
                onChange={(event) => setComposerUrl(event.target.value)}
                placeholder="https://"
              />
            </label>
            <label>
              Notes
              <textarea
                value={composerNotes}
                onChange={(event) => setComposerNotes(event.target.value)}
                placeholder="Summarize the public context and date; distinguish reporting from confirmed facts."
              />
            </label>
            {composerError && <div className="watch-warning">{composerError}</div>}
            <button
              className="primary-btn"
              onClick={saveManualCandidate}
              disabled={composerSaving}
            >
              {composerSaving ? (
                "Saving…"
              ) : (
                <>
                  <PenLine size={15} /> Save unreviewed candidate
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
