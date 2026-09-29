import { KeywordsDataGoogleAdsSearchVolumeLiveRequestInfo } from "dataforseo-client";
import { keywordsDataApi, taskItems } from "@/lib/dataforseo/client";
import {
  cacheKey,
  DATAFORSEO_CACHE_TTL_MS,
  getCached,
  setCached,
} from "@/lib/dataforseo/cache";

type VolumeFields = {
  search_volume?: number | null;
  cpc?: number | null;
  competition?: number | null;
};

export type GoogleAdsVolumeRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  /** 0–1 scale (competition_index / 100) for UI consistency with Labs */
  competition: number | null;
  monthlySearches: Array<{
    year?: number | null;
    month?: number | null;
    search_volume?: number | null;
  }>;
};

/**
 * Pick search metrics for display.
 * Prefer Google Ads (`keyword_info`) to align with tools like Keywords Everywhere,
 * then DataForSEO Bing/clickstream refinements when Ads volume is missing.
 */
export function resolveVolumeMetrics(
  google?: VolumeFields | null,
  clickstream?: VolumeFields | null,
  bing?: VolumeFields | null,
) {
  const source =
    (google?.search_volume != null ? google : null) ??
    (bing?.search_volume != null ? bing : null) ??
    (clickstream?.search_volume != null ? clickstream : null) ??
    google ??
    bing ??
    clickstream ??
    null;

  return {
    searchVolume: source?.search_volume ?? null,
    cpc: source?.cpc ?? google?.cpc ?? bing?.cpc ?? clickstream?.cpc ?? null,
    competition:
      source?.competition ??
      google?.competition ??
      bing?.competition ??
      clickstream?.competition ??
      null,
  };
}

/**
 * Live Google Ads Keyword Planner volumes — same source Keywords Everywhere uses.
 * Omit location_code for worldwide; otherwise pass a country location code.
 * Results are cached to avoid repeat paid Ads calls for the same seed/market.
 */
export async function fetchGoogleAdsSearchVolumes(
  keywords: string[],
  locationCode: number | null,
  languageCode = "en",
): Promise<Map<string, GoogleAdsVolumeRow>> {
  const out = new Map<string, GoogleAdsVolumeRow>();
  const unique = [
    ...new Set(
      keywords
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length > 0 && k.length <= 80),
    ),
  ].slice(0, 1000);

  if (unique.length === 0) return out;

  const sortedKey = [...unique].sort().join(",");
  const key = cacheKey([
    "ads-volume-v1",
    locationCode ?? "ww",
    languageCode,
    sortedKey,
  ]);
  const cached = getCached<Array<[string, GoogleAdsVolumeRow]>>(key);
  if (cached) {
    return new Map(cached);
  }

  const api = keywordsDataApi();
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 700) {
    chunks.push(unique.slice(i, i + 700));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const body = {
          keywords: chunk,
          language_code: languageCode,
          search_partners: false,
          include_adult_keywords: false,
          sort_by: "search_volume",
          ...(locationCode != null && locationCode > 0
            ? { location_code: locationCode }
            : {}),
        } as KeywordsDataGoogleAdsSearchVolumeLiveRequestInfo;

        const response = await api.googleAdsSearchVolumeLive([body]);
        const items = taskItems<{
          keyword?: string | null;
          search_volume?: number | null;
          cpc?: number | null;
          competition_index?: number | null;
          monthly_searches?: Array<{
            year?: number | null;
            month?: number | null;
            search_volume?: number | null;
          }> | null;
        }>(response);

        for (const item of items) {
          const kw = item.keyword?.trim().toLowerCase();
          if (!kw) continue;
          out.set(kw, {
            keyword: kw,
            searchVolume: item.search_volume ?? null,
            cpc: item.cpc ?? null,
            competition:
              item.competition_index != null
                ? item.competition_index / 100
                : null,
            monthlySearches: item.monthly_searches ?? [],
          });
        }
      } catch {
        // Caller keeps Labs / suggestion volumes if Ads fails
      }
    }),
  );

  if (out.size > 0) {
    setCached(key, [...out.entries()], DATAFORSEO_CACHE_TTL_MS);
  }

  return out;
}
