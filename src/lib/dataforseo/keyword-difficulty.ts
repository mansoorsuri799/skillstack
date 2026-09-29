import {
  DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
} from "dataforseo-client";
import {
  labsApi,
  allTasksResultItems,
} from "@/lib/dataforseo/client";
import {
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

const MAX_KEYWORDS = 200;
const CHUNK_SIZE = 100;

/** Markets used when Location = All locations (keep small for API cost). */
const KD_ALL_MARKETS = [
  { code: 2586, lang: "en" }, // Pakistan
  { code: 2840, lang: "en" }, // United States
  { code: 2826, lang: "en" }, // United Kingdom
  { code: 2356, lang: "en" }, // India
  { code: 2036, lang: "en" }, // Australia
] as const;

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
      include_clickstream_data: true,
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

function mergeRows(
  current: KeywordDifficultyRow | undefined,
  next: KeywordDifficultyRow,
): KeywordDifficultyRow {
  if (!current) return next;
  return {
    keyword: current.keyword || next.keyword,
    difficulty:
      current.difficulty == null
        ? next.difficulty
        : next.difficulty == null
          ? current.difficulty
          : Math.round((current.difficulty + next.difficulty) / 2),
    searchVolume: Math.max(current.searchVolume ?? 0, next.searchVolume ?? 0) || null,
    cpc:
      current.cpc == null
        ? next.cpc
        : next.cpc == null
          ? current.cpc
          : Number(((current.cpc + next.cpc) / 2).toFixed(2)),
    competition:
      current.competition == null
        ? next.competition
        : next.competition == null
          ? current.competition
          : Number(((current.competition + next.competition) / 2).toFixed(2)),
  };
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
    // Average KD across major markets; keep strongest volume signal.
    const markets = KD_ALL_MARKETS;
    await Promise.all(
      markets.flatMap((market) =>
        chunks.map(async (chunk) => {
          try {
            const batch = await fetchOverviewChunk(chunk, market.code, market.lang);
            for (const [key, row] of batch) {
              byKeyword.set(key, mergeRows(byKeyword.get(key), row));
            }
          } catch {
            // Skip failed market/chunk
          }
        }),
      ),
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
