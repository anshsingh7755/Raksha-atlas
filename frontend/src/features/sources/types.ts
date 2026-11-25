import type { ComponentType, Dispatch, SetStateAction } from "react";

export type ReviewArticle = {
  id: string;
  title: string;
  summary?: string;
  canonicalUrl: string;
  verificationStatus: string;
  reviewState: string;
  sourceId: string;
  publisherOfficial?: boolean;
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

export type RegistrySource = {
  id: string;
  name: string;
  url: string;
  sourceType: string;
  official: boolean;
  defaultStatus: string;
  reliabilityNotes: string;
  active?: boolean;
};

export type ReviewControlsProps = {
  article: ReviewArticle;
  adminToken: string;
  onSaved: (item: ReviewArticle) => void;
};
export type SourceRegistryProps = {
  sources: RegistrySource[];
  adminToken: string;
  onUpdated: (source: RegistrySource) => void;
  query?: string;
};

export type SourcesProps = {
  articles: ReviewArticle[];
  setArticles: Dispatch<SetStateAction<ReviewArticle[]>>;
  articleState: "loading" | "ready" | "error";
  articleFilter: string;
  setArticleFilter: Dispatch<SetStateAction<string>>;
  reviewStateFilter: string;
  setReviewStateFilter: Dispatch<SetStateAction<string>>;
  sourceRegistry: RegistrySource[];
  setSourceRegistry: Dispatch<SetStateAction<RegistrySource[]>>;
  adminToken: string;
  setAdminToken: Dispatch<SetStateAction<string>>;
  setComposerError: Dispatch<SetStateAction<string>>;
  setShowComposer: Dispatch<SetStateAction<boolean>>;
  RagMonitorStatus: ComponentType;
  ReviewControls: ComponentType<ReviewControlsProps>;
  SourceRegistry: ComponentType<SourceRegistryProps>;
};
