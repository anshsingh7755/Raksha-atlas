export async function fetchWithRetry(
  resource,
  options = {},
  { attempts = 3, timeoutMs = 18_000 } = {},
) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(resource, {
        ...options,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if ((response.status === 429 || response.status >= 500) && attempt < attempts) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await response.body?.cancel().catch(() => {});
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.min(
              Number.isFinite(retryAfter) && retryAfter > 0
                ? retryAfter * 1000
                : 500 * 2 ** (attempt - 1),
              8_000,
            ),
          ),
        );
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** (attempt - 1)));
    }
  }
  throw lastError || new Error("Request failed after retries.");
}
