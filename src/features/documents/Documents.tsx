import { useEffect, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import AccessibleDialog from "../../components/AccessibleDialog";
import { apiGet, apiPost } from "../../services/api";

export default function Documents({ adminToken = "" }: { adminToken?: string }) {
    type DocumentItem = {
      id: string; title: string; publisher: string; publishedAt: string | null;
      documentType: string; service: string; originalUrl: string; canonicalUrl: string;
      fileFormat: string; extractionStatus: string; evidenceStatus: string;
      summary: string; notes: string; pages: Array<{page:number;text:string}>;
      extractedText?: string; extractedTitle?: string | null; pageCount?: number | null; checksumSha256?: string | null;
      extractionEngine?: string | null; extractionWarnings?: string[]; ocrPages?: number[]; fileSizeBytes?: number | null;
    };
    const [items, setItems] = useState<DocumentItem[]>([]);
    const [query, setQuery] = useState("");
    const [type, setType] = useState("all");
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<DocumentItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [extractingId, setExtractingId] = useState("");
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");
    const [publisher, setPublisher] = useState("");
    const [url, setUrl] = useState("");
    const [documentType, setDocumentType] = useState("annual_report");
    const [service, setService] = useState("Joint / General");
    const [publishedAt, setPublishedAt] = useState("");
    const [summary, setSummary] = useState("");
    const loadDocuments = () => {
      setLoading(true);
      apiGet<{ items?: DocumentItem[] }>("/api/documents")
        .then((data) => setItems(data.items ?? []))
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load documents."))
        .finally(() => setLoading(false));
    };
    useEffect(() => {
      const saved = sessionStorage.getItem("raksha-search-query");
      const section = sessionStorage.getItem("raksha-search-section");
      if (saved && section === "Documents") {
        setQuery(saved);
        sessionStorage.removeItem("raksha-search-query");
        sessionStorage.removeItem("raksha-search-target");
        sessionStorage.removeItem("raksha-search-section");
      }
      loadDocuments();
    }, []);
    const visible = items.filter((item) =>
      (type === "all" || item.documentType === type) &&
      [item.title,item.extractedTitle,item.publisher,item.service,item.documentType,item.summary,item.notes,item.extractedText,(item.pages ?? []).map((page) => page.text).join(" ")].join(" ").toLowerCase().includes(query.toLowerCase())
    );
    const extractDocument = async (item: DocumentItem) => {
      setExtractingId(item.id); setError("");
      try {
        const data = await apiPost<{ item: DocumentItem }, { ocr: boolean }>(
          `/api/documents/${encodeURIComponent(item.id)}/extract`,
          { ocr: item.extractionStatus === "needs_ocr" },
          { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} },
        );
        setItems((previous) => previous.map((record) => record.id === item.id ? data.item : record));
        setSelected((previous) => previous?.id === item.id ? data.item : previous);
      } catch (extractError) {
        setError(extractError instanceof Error ? extractError.message : "Document extraction failed.");
      } finally { setExtractingId(""); }
    };
    const registerDocument = async () => {
      setSaving(true); setError("");
      try {
        await apiPost<
          unknown,
          { title: string; publisher: string; url: string; documentType: string; service: string; publishedAt: string | null; summary: string; evidenceStatus: string }
        >(
          "/api/documents",
          { title, publisher, url, documentType, service, publishedAt: publishedAt || null, summary, evidenceStatus: "unreviewed" },
          { headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {} },
        );
        setTitle(""); setPublisher(""); setUrl(""); setPublishedAt(""); setSummary(""); setShowForm(false);
        loadDocuments();
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Could not register document.");
      } finally { setSaving(false); }
    };
    return (
      <section className="page-section documents-page">
        <div className="page-hero">
          <span className="section-kicker">PUBLIC RECORDS / DOCUMENT REGISTER</span>
          <h1>Documents <em>library.</em></h1>
          <p>Publicly accessible defence and government publications with source provenance, publication dates, extraction state and evidence labels. Official publisher status does not independently verify every claim.</p>
        </div>
        <div className="documents-toolbar">
          <label className="command-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, publisher, service or topic"/></label>
          <select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter document type">
            <option value="all">All document types</option>
            {["annual_report","policy","doctrine","parliamentary_report","press_release","tender","technical_publication","other"].map((value) => <option key={value} value={value}>{value.replace(/_/g," ")}</option>)}
          </select>
          <button className="primary-btn" onClick={() => setShowForm((value) => !value)}>{showForm ? "Close form" : "Register public document"}</button>
        </div>
        {showForm && <article className="document-register-form">
          <h2>Register a public document</h2>
          <p>Provide a public HTTPS source. This form records metadata only; it does not download the file or bypass publisher access controls.</p>
          <div className="document-form-grid">
            <label>Document title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Annual report / policy title"/></label>
            <label>Publisher<input value={publisher} onChange={(event) => setPublisher(event.target.value)} placeholder="Ministry / institution"/></label>
            <label>Public source URL<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://"/></label>
            <label>Publication date<input type="date" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)}/></label>
            <label>Document type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>{["annual_report","policy","doctrine","parliamentary_report","press_release","tender","technical_publication","other"].map((value) => <option key={value} value={value}>{value.replace(/_/g," ")}</option>)}</select></label>
            <label>Service / domain<select value={service} onChange={(event) => setService(event.target.value)}>{["Joint / General","Army","Navy","Air Force","Defence Research","Ministry of Defence","Space","Cyber"].map((value) => <option key={value}>{value}</option>)}</select></label>
          </div>
          <label>Short context<textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Neutral description; do not treat this as verification."/></label>
          <button className="primary-btn" disabled={saving || !title.trim() || !publisher.trim() || !url.trim()} onClick={registerDocument}>{saving ? "Registering…" : "Save document metadata"}</button>
        </article>}
        {error && <div className="watch-warning">{error}</div>}
        <div className="documents-count"><strong>{visible.length}</strong> documents in current view <span>· public HTML/PDF extraction and optional PDF OCR</span></div>
        {loading ? <div className="data-state">Loading public documents…</div> : visible.length === 0 ? <div className="data-state">{items.length === 0 ? "No public documents have been registered yet. Add a public source URL to begin the library." : "No documents match these filters."}</div> :
          <div className="document-grid">{visible.map((item) => <article className="document-card" key={item.id}>
            <div className="document-card-meta"><span>{item.documentType.replace(/_/g," ")}</span><span>{item.fileFormat.toUpperCase()}</span></div>
            <h2>{item.title}</h2><p className="document-publisher">{item.publisher} · {item.service}</p>
            {item.publishedAt && <p className="document-date">Published {new Date(item.publishedAt).toLocaleDateString()}</p>}
            {item.summary && <p>{item.summary}</p>}
            <div className="document-status"><span>{item.evidenceStatus}</span><span>{item.extractionStatus.replace(/_/g," ")}</span></div>
            <div className="document-actions"><button disabled={extractingId === item.id || item.extractionStatus === "text_extracted"} onClick={() => extractDocument(item)}>{extractingId === item.id ? "Extracting…" : item.extractionStatus === "needs_ocr" && item.fileFormat === "pdf" ? "Run OCR" : item.extractionStatus === "text_extracted" ? "Extracted" : item.fileFormat === "pdf" ? "Extract PDF text" : "Extract document text"}</button><button onClick={() => setSelected(item)}>View record</button><a href={item.originalUrl} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={12}/></a></div>
          </article>)}</div>}
        {selected && <AccessibleDialog onClose={() => setSelected(null)} ariaLabel={`Document details: ${selected.title}`} contentClassName="document-detail-modal">
          <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close document details"><X size={17}/></button>
          <span className="section-kicker">DOCUMENT PROVENANCE</span><h2>{selected.title}</h2>
          <p>{selected.publisher} · {selected.service}</p>
          <dl><dt>Publication date</dt><dd>{selected.publishedAt ? new Date(selected.publishedAt).toLocaleDateString() : "Not supplied"}</dd><dt>Document type</dt><dd>{selected.documentType.replace(/_/g," ")}</dd><dt>Extraction</dt><dd>{selected.extractionStatus.replace(/_/g," ")}</dd><dt>Evidence status</dt><dd>{selected.evidenceStatus}</dd><dt>Format</dt><dd>{selected.fileFormat}</dd></dl>
          {selected.summary && <p>{selected.summary}</p>}
          {selected.extractedTitle && <p className="document-extraction-meta">Title found in source: {selected.extractedTitle}</p>}
          <p className="document-extraction-meta">{selected.pageCount ? `${selected.pageCount} pages` : selected.fileFormat === "html" ? "HTML text · no page references" : "Page count unavailable"}{selected.fileSizeBytes ? ` · ${(selected.fileSizeBytes / 1024 / 1024).toFixed(2)} MB` : ""}{selected.checksumSha256 ? ` · SHA-256 ${selected.checksumSha256.slice(0,16)}…` : ""}{selected.extractionEngine ? ` · ${selected.extractionEngine}` : ""}</p>
          {selected.extractionWarnings?.map((warning,index) => <p className="document-extraction-warning" key={index}>{warning}</p>)}
          {selected.extractedText && !selected.pages?.length && <article className="document-full-text"><h3>Extracted text</h3><pre>{selected.extractedText}</pre></article>}
          {selected.pages?.length > 0 && <div className="document-extracted-pages">{selected.pages.map((page) => <article key={page.page}><strong>Page {page.page}</strong><p>{page.text}</p></article>)}</div>}
          <a href={selected.originalUrl} target="_blank" rel="noreferrer">Open original public document <ArrowUpRight size={13}/></a>
        </AccessibleDialog>}
      </section>
    );
}
