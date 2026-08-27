import { DataforseoLabsGoogleDomainIntersectionLiveRequestInfo } from "dataforseo-client";
import { labsApi, normalizeDomain, taskItems } from "@/lib/dataforseo/client";

export type ContentGapRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  difficulty: number | null;
  competitorRank: number | null;
  competitorUrl: string | null;
  trafficValue: number | null;
};

export type ContentGapResult = {
  yourDomain: string;
  competitorDomain: string;
  keywords: ContentGapRow[];
};

export async function getContentGap(
  yourDomain: string,
  competitorDomain: string,
  locationCode = 2840,
  languageCode = "en",
  limit = 100,
): Promise<ContentGapResult> {
  const target1 = normalizeDomain(competitorDomain);
  const target2 = normalizeDomain(yourDomain);

  if (target1 === target2) {
    throw new Error("Enter a competitor domain different from your site.");
  }

  const api = labsApi();
  const response = await api.googleDomainIntersectionLive([
    {
      target_1: target1,
      target_2: target2,
      intersections: false,
      location_code: locationCode,
      language_code: languageCode,
      item_types: ["organic"],
      limit,
      order_by: ["keyword_data.keyword_info.search_volume,desc"],
    } as DataforseoLabsGoogleDomainIntersectionLiveRequestInfo,
  ]);

  const result = taskItems<{
    items?: Array<{
      keyword_data?: {
        keyword?: string | null;
        keyword_info?: {
          search_volume?: number | null;
          cpc?: number | null;
        } | null;
        keyword_properties?: { keyword_difficulty?: number | null } | null;
      } | null;
      first_domain_serp_element?: {
        rank_absolute?: number | null;
        url?: string | null;
        etv?: number | null;
      } | null;
    }> | null;
  }>(response)[0];

  const keywords = (result?.items ?? [])
    .map((item) => ({
      keyword: item.keyword_data?.keyword ?? "",
      searchVolume: item.keyword_data?.keyword_info?.search_volume ?? null,
      cpc: item.keyword_data?.keyword_info?.cpc ?? null,
      difficulty: item.keyword_data?.keyword_properties?.keyword_difficulty ?? null,
      competitorRank: item.first_domain_serp_element?.rank_absolute ?? null,
      competitorUrl: item.first_domain_serp_element?.url ?? null,
      trafficValue: item.first_domain_serp_element?.etv ?? null,
    }))
    .filter((row) => row.keyword);

  return {
    yourDomain: target2,
    competitorDomain: target1,
    keywords,
  };
}
