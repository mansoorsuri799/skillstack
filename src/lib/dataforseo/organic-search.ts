import {
  DataforseoLabsGoogleCompetitorsDomainLiveRequestInfo,
  DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
  DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
  DataforseoLabsGoogleRelevantPagesLiveRequestInfo,
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

export type OrganicPositionBucket = {
  label: string;
  count: number | null;
};

export type OrganicPositionsResult = {
  domain: string;
  totalKeywords: number | null;
  organicTraffic: number | null;
  trafficValue: number | null;
  movement: {
    new: number | null;
    up: number | null;
    down: number | null;
    lost: number | null;
  };
  buckets: OrganicPositionBucket[];
};

export type OrganicPageRow = {
  url: string;
  traffic: number | null;
  keywords: number | null;
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
  pos_1?: number | null;
  pos_2_3?: number | null;
  pos_4_10?: number | null;
  pos_11_20?: number | null;
  pos_21_30?: number | null;
  pos_31_40?: number | null;
  pos_41_50?: number | null;
  pos_51_60?: number | null;
  pos_61_70?: number | null;
  pos_71_80?: number | null;
  pos_81_90?: number | null;
  pos_91_100?: number | null;
  count?: number | null;
  etv?: number | null;
  estimated_paid_traffic_cost?: number | null;
  is_new?: number | null;
  is_up?: number | null;
  is_down?: number | null;
  is_lost?: number | null;
};

function mapPositionBuckets(organic: OrganicMetrics | null | undefined) {
  return [
    { label: "Position 1", count: organic?.pos_1 ?? null },
    { label: "Positions 2–3", count: organic?.pos_2_3 ?? null },
    { label: "Positions 4–10", count: organic?.pos_4_10 ?? null },
    { label: "Positions 11–20", count: organic?.pos_11_20 ?? null },
    { label: "Positions 21–30", count: organic?.pos_21_30 ?? null },
    { label: "Positions 31–40", count: organic?.pos_31_40 ?? null },
    { label: "Positions 41–50", count: organic?.pos_41_50 ?? null },
    { label: "Positions 51–60", count: organic?.pos_51_60 ?? null },
    { label: "Positions 61–70", count: organic?.pos_61_70 ?? null },
    { label: "Positions 71–80", count: organic?.pos_71_80 ?? null },
    { label: "Positions 81–90", count: organic?.pos_81_90 ?? null },
    { label: "Positions 91–100", count: organic?.pos_91_100 ?? null },
  ];
}

export async function getOrganicKeywords(
  domain: string,
  locationCode = 2840,
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
        url?: string | null;
        etv?: number | null;
      } | null;
    } | null;
  }>(response)
    .map((item) => ({
      keyword: item.keyword_data?.keyword ?? "",
      searchVolume: item.keyword_data?.keyword_info?.search_volume ?? null,
      cpc: item.keyword_data?.keyword_info?.cpc ?? null,
      rank: item.ranked_serp_element?.serp_item?.rank_absolute ?? null,
      url: item.ranked_serp_element?.serp_item?.url ?? null,
      etv: item.ranked_serp_element?.serp_item?.etv ?? null,
    }))
    .filter((row) => row.keyword);

  return { domain, keywords };
}

export async function getOrganicPositions(
  domain: string,
  locationCode = 2840,
  languageCode = "en",
): Promise<OrganicPositionsResult> {
  const api = labsApi();
  const response = await api.googleDomainRankOverviewLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
    } as DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
  ]);

  const overview = taskItems<{
    metrics?: { organic?: OrganicMetrics | null } | null;
  }>(response)[0];

  const organic = overview?.metrics?.organic;

  return {
    domain,
    totalKeywords: organic?.count ?? null,
    organicTraffic: organic?.etv ?? null,
    trafficValue: organic?.estimated_paid_traffic_cost ?? null,
    movement: {
      new: organic?.is_new ?? null,
      up: organic?.is_up ?? null,
      down: organic?.is_down ?? null,
      lost: organic?.is_lost ?? null,
    },
    buckets: mapPositionBuckets(organic),
  };
}

export async function getOrganicTopPages(
  domain: string,
  locationCode = 2840,
  languageCode = "en",
  includeSubdomains = true,
  limit = 100,
): Promise<{ domain: string; pages: OrganicPageRow[] }> {
  const api = labsApi();
  const response = await api.googleRelevantPagesLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      include_subdomains: includeSubdomains,
    } as unknown as DataforseoLabsGoogleRelevantPagesLiveRequestInfo,
  ]);

  const pages = taskResultItems<{
    page_address?: string | null;
    metrics?: {
      organic?: { etv?: number | null; count?: number | null } | null;
    } | null;
  }>(response)
    .map((page) => ({
      url: page.page_address ?? "",
      traffic: page.metrics?.organic?.etv ?? null,
      keywords: page.metrics?.organic?.count ?? null,
    }))
    .filter((page) => page.url)
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0));

  return { domain, pages };
}

export async function getOrganicCompetitors(
  domain: string,
  locationCode = 2840,
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
      return getOrganicPositions(domain, locationCode, languageCode);
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
