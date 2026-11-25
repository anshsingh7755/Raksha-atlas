import { parseApiResponse } from "./api-response.mjs";

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/**
 * Identity-provider integration point. The provider should return a short-lived
 * access token from its in-memory/session SDK; this module never persists tokens.
 */
export type ApiAccessTokenProvider = () => string | null | Promise<string | null>;
let accessTokenProvider: ApiAccessTokenProvider | null = null;

export function setApiAccessTokenProvider(provider: ApiAccessTokenProvider | null): void {
  accessTokenProvider = provider;
}

function readErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "object" && payload !== null) {
    if ("detail" in payload && typeof payload.detail === "string") return payload.detail;
    if ("error" in payload && typeof payload.error === "string") return payload.error;
    if ("title" in payload && typeof payload.title === "string") return payload.title;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return `Request failed with status ${status}`;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = accessTokenProvider ? await accessTokenProvider() : null;
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, {
    ...init,
    credentials: init.credentials ?? "same-origin",
    headers,
  });

  let payload: unknown;
  try {
    payload = await parseApiResponse(response);
  } catch {
    throw new ApiError("The server returned invalid JSON.", response.status);
  }

  if (!response.ok) {
    throw new ApiError(readErrorMessage(payload, response.status), response.status, payload);
  }
  return payload as T;
}

export function apiGet<T>(path: string, init: Omit<RequestInit, "method"> = {}): Promise<T> {
  return apiRequest<T>(path, { ...init, method: "GET" });
}

export function apiPost<T, TBody>(
  path: string,
  body: TBody,
  init: Omit<RequestInit, "method" | "body"> = {},
): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...init.headers },
    body: JSON.stringify(body),
  });
}

export function apiPatch<T, TBody>(
  path: string,
  body: TBody,
  init: Omit<RequestInit, "method" | "body"> = {},
): Promise<T> {
  return apiRequest<T>(path, {
    ...init,
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...init.headers },
    body: JSON.stringify(body),
  });
}
