const DEFAULT_API_URL = "https://api.firecrawl.dev";
const TIMEOUT_MS = 35_000;

export type FirecrawlWebResult = {
  url: string;
  title: string;
  description: string;
};

export function isFirecrawlConfigured() {
  return Boolean(process.env.FIRECRAWL_API_KEY?.trim());
}

function apiBase() {
  return (process.env.FIRECRAWL_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeHits(payload: unknown): FirecrawlWebResult[] {
  const root = payload as { data?: unknown };
  const data = root?.data;
  const web =
    data && typeof data === "object" && "web" in data
      ? (data as { web?: unknown }).web
      : null;
  const raw = Array.isArray(data) ? data : Array.isArray(web) ? web : [];

  return raw
    .map((item) => {
      const row = (item ?? {}) as {
        url?: unknown;
        title?: unknown;
        description?: unknown;
        snippet?: unknown;
        metadata?: { sourceURL?: unknown; title?: unknown; description?: unknown };
      };
      const url = asText(row.url) || asText(row.metadata?.sourceURL);
      const title = asText(row.title) || asText(row.metadata?.title) || url;
      const description =
        asText(row.description) || asText(row.snippet) || asText(row.metadata?.description);
      return { url, title, description };
    })
    .filter((row) => row.url.startsWith("http"));
}

export async function firecrawlSearch(
  query: string,
  options?: { limit?: number; location?: string; country?: string },
): Promise<FirecrawlWebResult[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "FIRECRAWL_API_KEY is not configured. Add your Firecrawl key to .env.local.",
    );
  }

  const response = await fetch(`${apiBase()}/v2/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit: options?.limit ?? 10,
      sources: ["web"],
      ...(options?.location ? { location: options.location } : {}),
      ...(options?.country ? { country: options.country } : {}),
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  const body = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message =
      typeof body === "object" && body && "error" in body
        ? String((body as { error?: unknown }).error)
        : `Firecrawl search failed (${response.status})`;
    throw new Error(message);
  }

  return normalizeHits(body);
}
