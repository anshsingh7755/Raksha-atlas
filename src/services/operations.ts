import { apiGet } from "./api";

export type OperationsSummary = {
  generatedAt: string;
  storage: "postgresql" | "json-file";
  sources: {
    total: number;
    active: number;
    inactive: number;
    freshness: {
      checkedWithin24Hours: number;
      staleOver24Hours: number;
      staleOver7Days: number;
      neverChecked: number;
    };
  };
  feeds: { total: number; active: number; inactive: number };
  articles: {
    total: number;
    unreviewed: number;
    inReview: number;
    approved: number;
    rejected: number;
    verification: Record<string, number>;
  };
  pipeline: {
    lastRefresh: string | null;
    lastRefreshAttemptAt: string | null;
    lastRefreshSucceeded: boolean | null;
    lastRagSyncAt: string | null;
    lastRagSyncSucceeded: boolean | null;
    recentJobs: { total: number; completed: number; failed: number; latestAt: string | null };
  };
};

export function getOperationsSummary(signal?: AbortSignal) {
  return apiGet<OperationsSummary>("/api/operations/summary", { signal });
}
