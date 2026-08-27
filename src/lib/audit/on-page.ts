import { OnPageInstantPagesRequestInfo } from "dataforseo-client";
import { onPageApi, taskItems } from "@/lib/dataforseo/client";
import type { OnPagePageResult } from "@/lib/audit/types";

type InstantPageItem = {
  url?: string | null;
  status_code?: number | null;
  broken_links?: boolean | null;
  onpage_score?: number | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    htags?: Record<string, string[]> | null;
  } | null;
};

export async function analyzePageOnPage(url: string): Promise<OnPagePageResult> {
  const api = onPageApi();
  const response = await api.instantPages([
    { url, accept_language: "en" } as OnPageInstantPagesRequestInfo,
  ]);

  const item = taskItems<{ items?: InstantPageItem[] | null }>(response)[0];
  const page = item?.items?.[0];

  const h1Tags = page?.meta?.htags?.h1 ?? [];
  const hasH1 = h1Tags.length > 0;

  return {
    url: page?.url ?? url,
    statusCode: page?.status_code ?? null,
    hasH1,
    h1Tags,
    title: page?.meta?.title ?? null,
    metaDescription: page?.meta?.description ?? null,
    onpageScore: page?.onpage_score ?? null,
    brokenLinks: page?.broken_links ?? false,
  };
}

export async function analyzePagesOnPage(
  urls: string[],
): Promise<OnPagePageResult[]> {
  const results: OnPagePageResult[] = [];
  for (const url of urls) {
    try {
      results.push(await analyzePageOnPage(url));
    } catch {
      results.push({
        url,
        statusCode: null,
        hasH1: false,
        h1Tags: [],
        title: null,
        metaDescription: null,
        onpageScore: null,
        brokenLinks: false,
      });
    }
  }
  return results;
}
