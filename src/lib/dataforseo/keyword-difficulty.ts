import {
  DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
} from "dataforseo-client";
import {
  labsApi,
  allTasksResultItems,
} from "@/lib/dataforseo/client";
import {
  COST_EFFICIENT_MARKETS,
  isAllLocations,
  resolveLabsLocationCode,
} from "@/lib/dashboard/locations";
import { resolveVolumeMetrics } from "@/lib/dataforseo/volume";

export type KeywordDifficultyRow = {
  keyword: string;
  difficulty: number | null;
  searchVolume: number | null;
  cpc: number | null;
  competition: number | null;
};

const MAX_KEYWORDS = 100;
const CHUNK_SIZE = 100;

/** All locations KD: use primary market only (KD is location-scoped; multi-market averages burn credits). */
const KD_PRIMARY_MARKET = COST_EFFICIENT_MARKETS[0];

export function parseKeywordList(input: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const part of input.split(/[\n,;]+/)) {
    const keyword = part.trim().replace(/\s+/g, " ");
    if (!keyword) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(keyword);
    if (out.length >= MAX_KEYWORDS) break;
  }

  return out;
}

async function fetchOverviewChunk(
  keywords: string[],
  locationCode: number,
  languageCode: string,
): Promise<Map<string, KeywordDifficultyRow>> {
  const api = labsApi();
  const response = await api.googleKeywordOverviewLive([
    {
      keywords,
      location_code: locationCode,
      language_code: languageCode,
      include_clickstream_data: false,
    } as DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
  ]);

  type OverviewItem = {
    keyword?: string | null;
    location_code?: number | null;
    keyword_info?: {
      search_volume?: number | null;
      cpc?: number | null;
      competition?: number | null;
      keyword_difficulty?: number | null;
    } | null;
    keyword_info_normalized_with_clickstream?: {
      search_volume?: number | null;
      cpc?: number | null;
      competition?: number | null;
    } | null;
    keyword_info_normalized_with_bing?: {
      search_volume?: number | null;
      cpc?: number | null;
      competition?: number | null;
    } | null;
    keyword_properties?: { keyword_difficulty?: number | null } | null;
  };

  const map = new Map<string, KeywordDifficultyRow>();
  for (const item of allTasksResultItems<OverviewItem>(response)) {
    const keyword = item.keyword?.trim();
    if (!keyword) continue;
    const metrics = resolveVolumeMetrics(
      item.keyword_info,
      item.keyword_info_normalized_with_clickstream,
      item.keyword_info_normalized_with_bing,
    );
    map.set(keyword.toLowerCase(), {
      keyword,
      difficulty:
        item.keyword_properties?.keyword_difficulty ??
        item.keyword_info?.keyword_difficulty ??
        null,
      searchVolume: metrics.searchVolume,
      cpc: metrics.cpc,
      competition: metrics.competition,
    });
  }
  return map;
}

export async function getKeywordDifficulty(
  keywordsInput: string[] | string,
  locationCode = 2586,
  languageCode = "en",
): Promise<{ keywords: KeywordDifficultyRow[]; locationCode: number }> {
  const keywords = Array.isArray(keywordsInput)
    ? parseKeywordList(keywordsInput.join("\n"))
    : parseKeywordList(keywordsInput);

  if (keywords.length === 0) {
    return { keywords: [], locationCode };
  }

  const chunks: string[][] = [];
  for (let i = 0; i < keywords.length; i += CHUNK_SIZE) {
    chunks.push(keywords.slice(i, i + CHUNK_SIZE));
  }

  const byKeyword = new Map<string, KeywordDifficultyRow>();

  if (isAllLocations(locationCode)) {
    // Single primary market — multi-market KD averages multiply Labs cost.
    await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const batch = await fetchOverviewChunk(
            chunk,
            KD_PRIMARY_MARKET.code,
            KD_PRIMARY_MARKET.lang,
          );
          for (const [key, row] of batch) {
            byKeyword.set(key, row);
          }
        } catch {
          // Skip failed chunk
        }
      }),
    );
  } else {
    const labsLocation = resolveLabsLocationCode(locationCode);
    await Promise.all(
      chunks.map(async (chunk) => {
        const batch = await fetchOverviewChunk(chunk, labsLocation, languageCode);
        for (const [key, row] of batch) {
          byKeyword.set(key, row);
        }
      }),
    );
  }

  const rows = keywords.map((keyword) => {
    const found = byKeyword.get(keyword.toLowerCase());
    return (
      found ?? {
        keyword,
        difficulty: null,
        searchVolume: null,
        cpc: null,
        competition: null,
      }
    );
  });

  return {
    keywords: rows,
    locationCode: isAllLocations(locationCode)
      ? locationCode
      : resolveLabsLocationCode(locationCode),
  };
}

export { MAX_KEYWORDS };
