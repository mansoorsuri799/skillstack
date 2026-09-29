import {
  DataforseoLabsGoogleCompetitorsDomainLiveRequestInfo,
  DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
} from "dataforseo-client";
import { labsApi, normalizeDomain, taskItems, taskResultItems } from "@/lib/dataforseo/client";

export type OrganicKeywordRow = {
  keyword: string;
  rank: number | null;
  searchVolume: number | null;
  cpc: number | null;
  url: string | null;
  etv: number | null;
};

export type OrganicPositionsResult = {
  domain: string;
  keywords: OrganicKeywordRow[];
};

export type OrganicPageRow = {
  url: string;
  keyword: string;
  searchVolume: number | null;
  position: number | null;
  keywordCount: number;
};

export type OrganicCompetitorRow = {
  domain: string;
  intersections: number | null;
  avgPosition: number | null;
  organicKeywords: number | null;
  organicTraffic: number | null;
  title?: string | null;
  url?: string | null;
};

type OrganicMetrics = {
  count?: number | null;
  etv?: number | null;
};

export async function getOrganicKeywords(
  domain: string,
  locationCode = 2586,
  languageCode = "en",
  includeSubdomains = true,
  limit = 100,
): Promise<{ domain: string; keywords: OrganicKeywordRow[] }> {
  const api = labsApi();
  const response = await api.googleRankedKeywordsLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      include_subdomains: includeSubdomains,
      ignore_synonyms: true,
      order_by: ["ranked_serp_element.serp_item.rank_group,asc"],
    } as unknown as DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
  ]);

  const keywords = taskResultItems<{
    keyword_data?: {
      keyword?: string | null;
      keyword_info?: {
        search_volume?: number | null;
        cpc?: number | null;
      } | null;
    } | null;
    ranked_serp_element?: {
      serp_item?: {
        rank_absolute?: number | null;
        rank_group?: number | null;
        url?: string | null;
        etv?: number | null;
      } | null;
    } | null;
  }>(response)
    .map((item) => ({
      keyword: item.keyword_data?.keyword ?? "",
      searchVolume: item.keyword_data?.keyword_info?.search_volume ?? null,
      cpc: item.keyword_data?.keyword_info?.cpc ?? null,
      rank:
        item.ranked_serp_element?.serp_item?.rank_group ??
        item.ranked_serp_element?.serp_item?.rank_absolute ??
        null,
      url: item.ranked_serp_element?.serp_item?.url ?? null,
      etv: item.ranked_serp_element?.serp_item?.etv ?? null,
    }))
    .filter((row) => row.keyword);

  return { domain, keywords };
}

export async function getOrganicPositions(
  domain: string,
  locationCode = 2586,
  languageCode = "en",
  includeSubdomains = true,
): Promise<OrganicPositionsResult> {
  const { keywords } = await getOrganicKeywords(
    domain,
    locationCode,
    languageCode,
    includeSubdomains,
    100,
  );
  return { domain, keywords };
}

export async function getOrganicTopPages(
  domain: string,
  locationCode = 2586,
  languageCode = "en",
  includeSubdomains = true,
  limit = 100,
): Promise<{ domain: string; pages: OrganicPageRow[] }> {
  const { keywords } = await getOrganicKeywords(
    domain,
    locationCode,
    languageCode,
    includeSubdomains,
    Math.max(limit * 3, 100),
  );

  const byUrl = new Map<
    string,
    {
      url: string;
      keyword: string;
      searchVolume: number | null;
      position: number | null;
      keywordCount: number;
    }
  >();

  for (const row of keywords) {
    const url = row.url?.trim();
    if (!url) continue;

    const existing = byUrl.get(url);
    if (!existing) {
      byUrl.set(url, {
        url,
        keyword: row.keyword,
        searchVolume: row.searchVolume,
        position: row.rank,
        keywordCount: 1,
      });
      continue;
    }

    existing.keywordCount += 1;
    const nextPos = row.rank ?? Number.POSITIVE_INFINITY;
    const currentPos = existing.position ?? Number.POSITIVE_INFINITY;
    if (nextPos < currentPos) {
      existing.keyword = row.keyword;
      existing.searchVolume = row.searchVolume;
      existing.position = row.rank;
    } else if (
      nextPos === currentPos &&
      (row.searchVolume ?? 0) > (existing.searchVolume ?? 0)
    ) {
      existing.keyword = row.keyword;
      existing.searchVolume = row.searchVolume;
    }
  }

  const pages = [...byUrl.values()]
    .sort((a, b) => {
      const posA = a.position ?? Number.POSITIVE_INFINITY;
      const posB = b.position ?? Number.POSITIVE_INFINITY;
      if (posA !== posB) return posA - posB;
      return b.keywordCount - a.keywordCount;
    })
    .slice(0, limit);

  return { domain, pages };
}

export async function getOrganicCompetitors(
  domain: string,
  locationCode = 2586,
  languageCode = "en",
  limit = 50,
): Promise<{ domain: string; competitors: OrganicCompetitorRow[] }> {
  const api = labsApi();
  const response = await api.googleCompetitorsDomainLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      exclude_top_domains: true,
      item_types: ["organic"],
    } as DataforseoLabsGoogleCompetitorsDomainLiveRequestInfo,
  ]);

  const result = taskItems<{
    items?: Array<{
      domain?: string | null;
      avg_position?: number | null;
      intersections?: number | null;
      competitor_metrics?: { organic?: OrganicMetrics | null } | null;
    }> | null;
  }>(response)[0];

  const target = normalizeDomain(domain);
  const competitors = (result?.items ?? [])
    .map((item) => ({
      domain: normalizeDomain(item.domain ?? ""),
      intersections: item.intersections ?? null,
      avgPosition: item.avg_position ?? null,
      organicKeywords: item.competitor_metrics?.organic?.count ?? null,
      organicTraffic: item.competitor_metrics?.organic?.etv ?? null,
    }))
    .filter((row) => {
      if (!row.domain) return false;
      return (
        row.domain !== target &&
        !row.domain.endsWith(`.${target}`) &&
        !target.endsWith(`.${row.domain}`)
      );
    });

  return { domain: target, competitors };
}

export type OrganicReportType =
  | "keywords"
  | "positions"
  | "pages"
  | "competitors";

export async function getOrganicReport(
  type: OrganicReportType,
  domain: string,
  locationCode: number,
  languageCode: string,
  includeSubdomains: boolean,
) {
  switch (type) {
    case "keywords":
      return getOrganicKeywords(
        domain,
        locationCode,
        languageCode,
        includeSubdomains,
      );
    case "positions":
      return getOrganicPositions(
        domain,
        locationCode,
        languageCode,
        includeSubdomains,
      );
    case "pages":
      return getOrganicTopPages(
        domain,
        locationCode,
        languageCode,
        includeSubdomains,
      );
    case "competitors":
      return getOrganicCompetitors(domain, locationCode, languageCode);
  }
}
