const DEFAULT_API_URL = "https://api.firecrawl.dev";
const TIMEOUT_MS = 25_000;

export type FirecrawlScrapeResult = {
  url: string;
  title: string;
  description: string;
  markdown: string;
};

function apiBase() {
  return (process.env.FIRECRAWL_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function firecrawlScrape(url: string): Promise<FirecrawlScrapeResult | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const response = await fetch(`${apiBase()}/v2/scrape`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown"],
        onlyMainContent: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const body = (await response.json()) as {
      data?: {
        markdown?: string;
        metadata?: { title?: string; description?: string; sourceURL?: string; ogTitle?: string };
      };
    };
    const data = body.data;
    if (!data) return null;

    return {
      url: asText(data.metadata?.sourceURL) || url,
      title: asText(data.metadata?.title) || asText(data.metadata?.ogTitle),
      description: asText(data.metadata?.description),
      markdown: asText(data.markdown),
    };
  } catch {
    return null;
  }
}
