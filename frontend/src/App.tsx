import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  ChevronRight,
  CircleHelp,
  Database,
  FileText,
  Globe2,
  LayoutDashboard,
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
  Command,
} from "lucide-react";
import { fetchPlatformRegister, type PlatformRegisterItem } from "./services/inventory";
import { apiGet, apiPatch, apiPost } from "./services/api";
import { backendApi } from "./services/backend-api";
import { getOperationsSummary } from "./services/operations";
import TheatreAtlas from "./components/TheatreAtlas";
import AtlasFooter from "./components/AtlasFooter";
import SectionTitle from "./components/SectionTitle";
import AtlasNavigation from "./components/AtlasNavigation";
import AtlasHeader from "./components/AtlasHeader";
import AccessibleDialog from "./components/AccessibleDialog";
import Programmes from "./features/programmes/Programmes";
import ArmedForcesHistory from "./features/history/ArmedForcesHistory";
import Briefs from "./features/briefs/Briefs";
import Watch from "./features/watch/Watch";
import PibDefence from "./features/pib/PibDefence";
import Timeline from "./features/timeline/Timeline";
import Documents from "./features/documents/Documents";
import Signals from "./features/signals/Signals";
import Sources from "./features/sources/Sources";
import type { RegistrySource, ReviewArticle } from "./features/sources/types";

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
  | "history"
  | "briefs"
  | "documents";
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
  pageNumber?: number;
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
  const [query, setQuery] = useState("");
  useEffect(() => { const saved = sessionStorage.getItem("raksha-search-query"); const section = sessionStorage.getItem("raksha-search-section"); if (saved && (section === "Platform classes" || section === "Reference equipment catalogue")) { setQuery(saved); sessionStorage.removeItem("raksha-search-query"); sessionStorage.removeItem("raksha-search-target"); sessionStorage.removeItem("raksha-search-section"); } }, []);
  const visibleItems = items.filter((item) => [item.className,item.platform,item.category,item.service,item.origin,item.status,item.role,item.futureOrders].join(" ").toLowerCase().includes(query.toLowerCase()));
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
        <label className="command-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search platform, class, service or role"/></label>
        <strong className="inventory-count">{visibleItems.length} class records</strong>
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
            {visibleItems.map((item) => (
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
    apiGet<{ pages?: typeof pages; generatedAt?: string | null }>("/api/reference/equipment")
      .then((data) => {
        setPages(data.pages ?? []);
        setSnapshotAt(data.generatedAt ?? null);
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
      apiGet<{ items?: typeof inventory }>("/api/equipment-catalog"),
      apiGet<{ items?: typeof procurement }>("/api/future-procurement"),
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
    <AccessibleDialog onClose={onClose} labelledBy="chat-dialog-title" contentClassName="chat-panel">
        <div className="chat-header">
          <div>
            <span className="section-kicker">ATLAS ASSIST / SOURCE-GROUNDED</span>
            <h2 id="chat-dialog-title">
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
            <div className="answer" aria-live="polite" aria-busy={loading}>
              {loading ? (
                <div className="answer-label">
                  <span className="live-dot" aria-hidden="true" /> RETRIEVING SOURCES AND GENERATING
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
                            {source.pageNumber ? ` · Page ${source.pageNumber}` : ""}
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
            aria-label="Ask the Raksha Atlas assistant"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onAsk()}
            placeholder="Ask about inventory, programmes, commands, documents or public geography…"
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
    </AccessibleDialog>
  );
}


function RagMonitorStatus() {
  const [operations, setOperations] = useState<Awaited<ReturnType<typeof getOperationsSummary>> | null>(null);
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
    apiGet<typeof status>("/api/rag/status")
      .then(setStatus)
      .catch(() => setStatus(null));
    getOperationsSummary()
      .then(setOperations)
      .catch(() => setOperations(null));
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
      <div>
        <span>SOURCE FRESHNESS</span>
        <strong>{operations ? operations.sources.freshness.checkedWithin24Hours + " checked ≤24h · " + operations.sources.freshness.staleOver7Days + " stale >7d · " + operations.sources.freshness.neverChecked + " never checked" : "Loading source checks…"}</strong>
      </div>
      <div>
        <span>REVIEW QUEUE</span>
        <strong>{operations ? operations.articles.unreviewed + " unreviewed · " + operations.articles.inReview + " in review · " + operations.articles.approved + " approved" : "Loading review counts…"}</strong>
      </div>
      <div>
        <span>FEED CONFIGURATION</span>
        <strong>{operations ? operations.feeds.active + " active / " + operations.feeds.total + " configured" : "Loading feed status…"}</strong>
      </div>
      <div>
        <span>LAST REFRESH RESULT</span>
        <strong>{operations?.pipeline.lastRefresh ? new Date(operations.pipeline.lastRefresh).toLocaleString("en-IN") + " · " + (operations.pipeline.lastRefreshSucceeded === false ? "Needs attention" : "Completed") : "No refresh recorded"}</strong>
      </div>
      <p>
        Discovery results are candidates. Search snippets and social posts never become
        verified facts automatically. Source freshness means a recorded check timestamp,
        not proof that a publisher is currently available or that its claims are true.
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
      const result = await apiPost<
        ReviewArticle,
        {
          reviewState: string;
          verificationStatus: string;
          reviewerNote: string;
          imageReusePermitted: boolean;
          imageLicense: string;
          imageAttribution: string;
        }
      >(
        `/api/articles/${encodeURIComponent(article.id)}/review`,
        { reviewState, verificationStatus, reviewerNote, imageReusePermitted, imageLicense, imageAttribution },
        { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} },
      );
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


function SourceRegistry({
  sources,
  adminToken,
  onUpdated,
  query = "",
}: {
  sources: RegistrySource[];
  adminToken: string;
  onUpdated: (source: RegistrySource) => void;
  query?: string;
}) {
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const toggle = async (source: RegistrySource) => {
    setBusyId(source.id);
    setError("");
    try {
      const result = await apiPatch<{ source: { active: boolean } }, { active: boolean }>(
        `/api/monitor-sources/${encodeURIComponent(source.id)}`,
        { active: source.active === false },
        { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} },
      );
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
        {sources.filter((source) => [source.name,source.id,source.sourceType,source.reliabilityNotes,source.url].join(" ").toLowerCase().includes(query.toLowerCase())).map((source) => {
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

function CommandDirectory({ records, compact = false, query = "" }: { records: CommandRecord[]; compact?: boolean; query?: string }) {
  const filteredRecords = records.filter((record) => [record.name,record.service,record.group,record.structureType,record.status,record.headquarters,record.description].filter(Boolean).join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const groups = ["Indian Army", "Indian Navy", "Indian Air Force", "Joint"];
  return (
    <div className={compact ? "command-grid command-grid-compact" : "command-grid"}>
      {groups.map((service) => {
        const items = filteredRecords.filter((record) => record.service === service && record.status === "established");
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
      {filteredRecords.some((record) => record.status !== "established") && (
        <article className="command-card">
          <span className="section-kicker">NOT ESTABLISHED</span>
          <h3>Proposed / under-study structures</h3>
          <div className="command-record-list">
            {filteredRecords.filter((record) => record.status !== "established").map((record) => (
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

function App({
  initialView = "overview",
  onNavigate,
}: {
  initialView?: string;
  onNavigate?: (view: string) => void;
}) {
  const validViews: View[] = [
    "overview", "forces", "atlas", "programmes", "pipeline", "signals",
    "sources", "inventory", "timeline", "watch", "pib", "register",
    "history", "briefs", "documents",
  ];
  const resolvedInitialView = validViews.includes(initialView as View)
    ? (initialView as View)
    : "overview";
  const [activeView, setActiveView] = useState<View>(resolvedInitialView);
  useEffect(() => {
    setActiveView(resolvedInitialView);
  }, [resolvedInitialView]);
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
  const [globalSearchSections, setGlobalSearchSections] = useState<string[]>([]);
  const [globalSearchSection, setGlobalSearchSection] = useState("all");
  const [globalSearchError, setGlobalSearchError] = useState("");
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
      apiGet<{ count?: number }>("/api/timelines"),
      backendApi.sources<RegistrySource>(),
      apiGet<{ items?: CommandRecord[] }>("/api/commands"),
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
    if (q.length < 2) {
      setGlobalSearchResults([]);
      setGlobalSearchSections([]);
      setGlobalSearchError("");
      setGlobalSearchLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setGlobalSearchLoading(true);
      setGlobalSearchError("");
      apiGet<{ results?: Array<{section:string;view:View;id:string;title:string;summary:string}>; sections?: string[] }>(
        `/api/search?q=${encodeURIComponent(q)}&section=${encodeURIComponent(globalSearchSection)}&limit=60`,
        { signal: controller.signal },
      )
        .then((data) => {
          setGlobalSearchResults(data.results ?? []);
          setGlobalSearchSections(data.sections ?? []);
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setGlobalSearchResults([]);
            setGlobalSearchError(error instanceof Error ? error.message : "Could not search Raksha Atlas.");
          }
        })
        .finally(() => { if (!controller.signal.aborted) setGlobalSearchLoading(false); });
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [globalSearch, globalSearchSection]);
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
      apiGet<{ items: ReviewArticle[] }>(`/api/articles${filter}`)
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
    apiGet<{ lastRefresh: string | null }>("/api/health")
      .then((health) => {
        setLastRefresh(health.lastRefresh);
        setApiState("online");
      })
      .catch(() => setApiState("offline"));
  }, []);
  const navigate = (view: View) => {
    setActiveView(view);
    setMenuOpen(false);
    if (onNavigate) onNavigate(view);
    else window.location.hash = view;
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
      const result = await backendApi.answer(prompt);
      setChatAnswer(result.answer ?? "No answer was returned.");
      setChatSources((result.sources ?? []).map((source) => ({
        title: source.title,
        url: source.url,
        sourceId: source.source_id,
        sourceName: source.publisher,
        verificationStatus: source.verification_status,
        pageNumber: source.page ?? undefined,
      })));
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
      const result = await apiPost<
        ReviewArticle,
        {
          title: string;
          canonicalUrl: string;
          summary: string;
          sourceId: string;
          topic: string;
          confidence: string;
          verificationStatus: string;
          reviewState: string;
        }
      >(
        "/api/articles",
        {
          title: composerTitle.trim(),
          canonicalUrl: composerUrl.trim(),
          summary: composerNotes.trim(),
          sourceId: "manual-editorial",
          topic: "Defence & Security",
          confidence: "editor-submitted; awaiting review",
          verificationStatus: "unverified",
          reviewState: "unreviewed",
        },
        { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} },
      );
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
    ["briefs", "Briefs"],
    ["documents", "Documents"],
    ["sources", "Sources"],
  ];
  const Header = () => (
    <AtlasHeader
      activeView={activeView}
      navigationItems={navigationItems}
      navigate={navigate}
      theme={theme}
      setTheme={setTheme}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      globalSearchOpen={globalSearchOpen}
      setGlobalSearchOpen={setGlobalSearchOpen}
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
      globalSearchSection={globalSearchSection}
      setGlobalSearchSection={setGlobalSearchSection}
      globalSearchError={globalSearchError}
      globalSearchResults={globalSearchResults}
      globalSearchSections={globalSearchSections}
      globalSearchLoading={globalSearchLoading}
      todayIst={todayIst}
    />
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
  const Forces = () => {
    const [commandQuery, setCommandQuery] = useState("");
    useEffect(() => { const saved = sessionStorage.getItem("raksha-search-query"); const section = sessionStorage.getItem("raksha-search-section"); if (saved && section === "Commands") { setCommandQuery(saved); sessionStorage.removeItem("raksha-search-query"); sessionStorage.removeItem("raksha-search-target"); sessionStorage.removeItem("raksha-search-section"); } }, []);
    return (
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
        <label className="command-search"><Search size={15}/><input value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Search commands, services and headquarters"/></label>
        {commandState === "ready" && <CommandDirectory records={commandRecords} query={commandQuery} />}
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
  };
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
    const [inventoryError, setInventoryError] = useState("");
    useEffect(() => {
      const controller = new AbortController();
      setLoading(true);
      setInventoryError("");
      backendApi.inventory<InventoryItem>({
        service: serviceFilter === "all" ? undefined : serviceFilter,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        quantityStatus: statusFilter === "all" ? undefined : statusFilter,
      }, controller.signal)
        .then((data) => {
          setItems(data.items ?? []);
          if (data.availableFilters) setFilterOptions(data.availableFilters);
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            setInventoryError(error instanceof Error ? error.message : "Inventory is temporarily unavailable.");
          }
        })
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
        {inventoryError && <div className="data-state" role="alert">{inventoryError} Check API connectivity and access permissions, then retry by changing a filter.</div>}
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
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        {activeView === "overview" && <Overview />}
        {activeView === "forces" && <Forces />}
        {activeView === "atlas" && <TheatreAtlas />}
        {activeView === "programmes" && <Programmes />}
        {activeView === "pipeline" && <Pipeline />}
        {activeView === "signals" && <Signals articles={articles} sources={sourceRegistry} onReview={() => navigate("sources")} />}
        {activeView === "briefs" && <Briefs />}
        {activeView === "documents" && <Documents adminToken={adminToken} />}
        {activeView === "inventory" && <Inventory />}
        {activeView === "register" && <PlatformRegister />}
        {activeView === "timeline" && <Timeline />}
        {activeView === "history" && <ArmedForcesHistory ReferenceTables={WikipediaEquipmentTables} />}
        {activeView === "watch" && <Watch />}
        {activeView === "pib" && <PibDefence />}
        {activeView === "sources" && (
          <Sources
            articles={articles}
            setArticles={setArticles}
            articleState={articleState}
            articleFilter={articleFilter}
            setArticleFilter={setArticleFilter}
            reviewStateFilter={reviewStateFilter}
            setReviewStateFilter={setReviewStateFilter}
            sourceRegistry={sourceRegistry}
            setSourceRegistry={setSourceRegistry}
            adminToken={adminToken}
            setAdminToken={setAdminToken}
            setComposerError={setComposerError}
            setShowComposer={setShowComposer}
            RagMonitorStatus={RagMonitorStatus}
            ReviewControls={ReviewControls}
            SourceRegistry={SourceRegistry}
          />
        )}
      </main>
      <AtlasFooter onNavigate={navigate} />
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
          <AccessibleDialog onClose={() => !composerSaving && setShowComposer(false)} ariaLabel="Add a public lead" contentClassName="composer-panel" dismissOnBackdrop={!composerSaving}>
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
          </AccessibleDialog>
      )}
    </div>
  );
}

export default App;
