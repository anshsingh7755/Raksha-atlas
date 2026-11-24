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

function readErrorMessage(payload: unknown, status: number): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }
  if (typeof payload === "string" && payload.trim()) return payload;
  return `Request failed with status ${status}`;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  let payload: unknown;
  try {
    payload = await parseApiResponse(response);
  } catch {
    throw new ApiError(
      "The server returned invalid JSON.",
      response.status,
    );
  }

  if (!response.ok) {
    throw new ApiError(readErrorMessage(payload, response.status), response.status, payload);
  }

  return payload as T;
}

export function apiGet<T>(
  path: string,
  init: Omit<RequestInit, "method"> = {},
): Promise<T> {
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
