export async function parseApiResponse(response) {
  if (response.status === 204 || response.status === 205) return undefined;

  const raw = await response.text();
  if (!raw) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return JSON.parse(raw);
  return raw;
}
