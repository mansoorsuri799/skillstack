import {
  DataforseoLabsGoogleCompetitorsDomainLiveRequestInfo,
  DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
} from "dataforseo-client";
import { labsApi, normalizeDomain, taskItems, taskResultItems } from "@/lib/dataforseo/client";
import {
  COST_EFFICIENT_MARKETS,
  isAllLocations,
  resolveLanguageForLocation,
} from "@/lib/dashboard/locations";

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

/** All locations organic: few markets only (each = paid ranked_keywords call). */
const ORGANIC_ALL_MARKETS = COST_EFFICIENT_MARKETS;
const ORGANIC_DEFAULT_LIMIT = 50;
const ORGANIC_ALL_LOCATIONS_LIMIT = 40;

function preferKeywordRow(
  current: OrganicKeywordRow,
  next: OrganicKeywordRow,
): OrganicKeywordRow {
  const currentRank = current.rank ?? Number.POSITIVE_INFINITY;
  const nextRank = next.rank ?? Number.POSITIVE_INFINITY;
  if (nextRank < currentRank) return next;
  if (nextRank > currentRank) return current;
  if ((next.searchVolume ?? 0) > (current.searchVolume ?? 0)) return next;
  return current;
}

async function getOrganicKeywordsForLocation(
  domain: string,
  locationCode: number,
  languageCode: string,
  includeSubdomains: boolean,
  limit: number,
): Promise<OrganicKeywordRow[]> {
  const api = labsApi();
  // ignore_synonyms must stay false — true collapses head terms like
  // "card rummy" into near-duplicates ("rummy card game") and drops them.
  const response = await api.googleRankedKeywordsLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      include_subdomains: includeSubdomains,
      ignore_synonyms: false,
      // Prefer high-volume / high-traffic keywords so head terms aren't buried.
      order_by: [
        "keyword_data.keyword_info.search_volume,desc",
        "ranked_serp_element.serp_item.etv,desc",
      ],
    } as unknown as DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
  ]);

  return taskResultItems<{
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
}

async function getOrganicKeywordsAllLocations(
  domain: string,
  includeSubdomains: boolean,
  limit: number,
): Promise<OrganicKeywordRow[]> {
  const perMarketLimit = Math.min(limit, ORGANIC_ALL_LOCATIONS_LIMIT);
  const batches = await Promise.all(
    ORGANIC_ALL_MARKETS.map((market) =>
      getOrganicKeywordsForLocation(
        domain,
        market.code,
        market.lang,
        includeSubdomains,
        perMarketLimit,
      ).catch(() => [] as OrganicKeywordRow[]),
    ),
  );

  const merged = new Map<string, OrganicKeywordRow>();
  for (const batch of batches) {
    for (const row of batch) {
      const key = row.keyword.toLowerCase();
      const existing = merged.get(key);
      merged.set(key, existing ? preferKeywordRow(existing, row) : row);
    }
  }

  return [...merged.values()]
    .sort((a, b) => {
      const rankA = a.rank ?? Number.POSITIVE_INFINITY;
      const rankB = b.rank ?? Number.POSITIVE_INFINITY;
      if (rankA !== rankB) return rankA - rankB;
      return (b.searchVolume ?? 0) - (a.searchVolume ?? 0);
    })
    .slice(0, limit);
}

export async function getOrganicKeywords(
  domain: string,
  locationCode = 2586,
  languageCode = "en",
  includeSubdomains = true,
  limit = ORGANIC_DEFAULT_LIMIT,
): Promise<{ domain: string; keywords: OrganicKeywordRow[] }> {
  const safeLimit = Math.min(
    Math.max(Math.round(limit) || ORGANIC_DEFAULT_LIMIT, 1),
    isAllLocations(locationCode) ? ORGANIC_ALL_LOCATIONS_LIMIT : ORGANIC_DEFAULT_LIMIT,
  );
  const keywords = isAllLocations(locationCode)
    ? await getOrganicKeywordsAllLocations(domain, includeSubdomains, safeLimit)
    : await getOrganicKeywordsForLocation(
        domain,
        locationCode,
        resolveLanguageForLocation(locationCode, languageCode),
        includeSubdomains,
        safeLimit,
      );

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
    isAllLocations(locationCode) ? ORGANIC_ALL_LOCATIONS_LIMIT : ORGANIC_DEFAULT_LIMIT,
  );
  return { domain, keywords };
}

export async function getOrganicTopPages(
  domain: string,
  locationCode = 2586,
  languageCode = "en",
  includeSubdomains = true,
  limit = ORGANIC_DEFAULT_LIMIT,
): Promise<{ domain: string; pages: OrganicPageRow[] }> {
  const fetchLimit = isAllLocations(locationCode)
    ? ORGANIC_ALL_LOCATIONS_LIMIT
    : Math.min(Math.max(limit, 1), ORGANIC_DEFAULT_LIMIT);
  const { keywords } = await getOrganicKeywords(
    domain,
    locationCode,
    languageCode,
    includeSubdomains,
    fetchLimit,
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

async function getOrganicCompetitorsForLocation(
  domain: string,
  locationCode: number,
  languageCode: string,
  limit: number,
): Promise<OrganicCompetitorRow[]> {
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
  return (result?.items ?? [])
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
}

function preferCompetitorRow(
  current: OrganicCompetitorRow,
  next: OrganicCompetitorRow,
): OrganicCompetitorRow {
  const currentIntersections = current.intersections ?? 0;
  const nextIntersections = next.intersections ?? 0;
  if (nextIntersections > currentIntersections) return next;
  if (nextIntersections < currentIntersections) return current;

  const currentPos = current.avgPosition ?? Number.POSITIVE_INFINITY;
  const nextPos = next.avgPosition ?? Number.POSITIVE_INFINITY;
  if (nextPos < currentPos) return next;
  return current;
}

async function getOrganicCompetitorsAllLocations(
  domain: string,
  limit: number,
): Promise<OrganicCompetitorRow[]> {
  const batches = await Promise.all(
    ORGANIC_ALL_MARKETS.map((market) =>
      getOrganicCompetitorsForLocation(
        domain,
        market.code,
        market.lang,
        limit,
      ).catch(() => [] as OrganicCompetitorRow[]),
    ),
  );

  const merged = new Map<string, OrganicCompetitorRow>();
  for (const batch of batches) {
    for (const row of batch) {
      const key = row.domain.toLowerCase();
      const existing = merged.get(key);
      merged.set(key, existing ? preferCompetitorRow(existing, row) : row);
    }
  }

  return [...merged.values()]
    .sort((a, b) => (b.intersections ?? 0) - (a.intersections ?? 0))
    .slice(0, limit);
}

export async function getOrganicCompetitors(
  domain: string,
  locationCode = 2586,
  languageCode = "en",
  limit = 50,
): Promise<{ domain: string; competitors: OrganicCompetitorRow[] }> {
  const target = normalizeDomain(domain);
  const competitors = isAllLocations(locationCode)
    ? await getOrganicCompetitorsAllLocations(target, limit)
    : await getOrganicCompetitorsForLocation(
        target,
        locationCode,
        languageCode,
        limit,
      );

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
