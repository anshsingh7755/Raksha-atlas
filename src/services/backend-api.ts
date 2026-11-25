import { apiGet, apiPost } from "./api";

export type SpringCollection<T> = {
  items: T[];
  count?: number;
  asOf?: string | null;
  filters?: Record<string, string>;
};

export type InventoryFilters = {
  serviceDomains: string[];
  categories: string[];
  quantityStatuses: string[];
  originCountries?: string[];
};

export type InventoryCollection<T> = SpringCollection<T> & {
  availableFilters?: InventoryFilters;
  latestRecordAsOf?: string | null;
};

export type ProgrammeFilters = {
  service?: string;
  status?: string;
  stageClassification?: string;
  evidenceQuality?: string;
  q?: string;
};

export type ProcurementFilters = { scope?: string; status?: string };

export type AiCitation = {
  source_id: string;
  url: string;
  publisher: string;
  title: string;
  page?: number | null;
  verification_status?: string;
};

export type AssistantAnswer = {
  answer: string;
  sources: AiCitation[];
  needsModelKey: boolean;
  model?: string | null;
  evidence_count?: number;
};

/** These methods target only the Spring endpoints implemented in Phase 2/3. */
export const backendApi = {
  inventory<T>(filters: { service?: string; category?: string; quantityStatus?: string; originCountry?: string } = {}, signal?: AbortSignal) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
    return apiGet<InventoryCollection<T>>(`/api/inventory${query.size ? `?${query}` : ""}`, { signal });
  },
  sources<T>(signal?: AbortSignal) {
    return apiGet<SpringCollection<T> & { verificationStatuses?: string[] }>("/api/sources", { signal });
  },
  programmes<T>(filters: ProgrammeFilters = {}, signal?: AbortSignal) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
    return apiGet<SpringCollection<T>>(`/api/programmes${query.size ? `?${query}` : ""}`, { signal });
  },
  procurement<T>(filters: ProcurementFilters = {}, signal?: AbortSignal) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
    return apiGet<SpringCollection<T>>(`/api/procurement-2026${query.size ? `?${query}` : ""}`, { signal });
  },
  answer(question: string, signal?: AbortSignal) {
    return apiPost<AssistantAnswer, { question: string }>("/api/chat", { question }, { signal });
  },
};
