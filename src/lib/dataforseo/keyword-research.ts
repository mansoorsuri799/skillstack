import {
  DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
  DataforseoLabsGoogleSearchIntentLiveRequestInfo,
  SerpGoogleOrganicLiveAdvancedRequestInfo,
} from "dataforseo-client";
import { labsApi, serpApi, taskResult, taskResultItems } from "@/lib/dataforseo/client";

export type KeywordIntent =
  | "informational"
  | "navigational"
  | "commercial"
  | "transactional"
  | null;

export type KeywordTrendPoint = {
  label: string;
  shortLabel?: string;
  volume: number;
};

export type SeedKeywordInsights = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  competition: number | null;
  difficulty: number | null;
  intent: KeywordIntent;
  trends: KeywordTrendPoint[];
  trendRange: string;
};

export type SerpResultRow = {
  rank: number;
  title: string;
  url: string;
  domain: string;
};

function normalizeIntent(value?: string | null): KeywordIntent {
  if (!value) return null;
  const intent = value.toLowerCase();
  if (
    intent === "informational" ||
    intent === "navigational" ||
    intent === "commercial" ||
    intent === "transactional"
  ) {
    return intent;
  }
  return null;
}

function formatTrendLabel(year?: number, month?: number) {
  if (!year || !month) return "";
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export async function fetchKeywordIntents(
  keywords: string[],
  languageCode = "en",
): Promise<Map<string, KeywordIntent>> {
  const map = new Map<string, KeywordIntent>();
  if (keywords.length === 0) return map;

  const api = labsApi();
  const response = await api.googleSearchIntentLive([
    {
      keywords: keywords.slice(0, 1000),
      language_code: languageCode,
    } as DataforseoLabsGoogleSearchIntentLiveRequestInfo,
  ]);

  const items = taskResultItems<{
    keyword?: string | null;
    keyword_intent?: { label?: string | null; probability?: number | null } | null;
  }>(response);

  for (const item of items) {
    const keyword = item.keyword?.toLowerCase();
    if (!keyword) continue;
    map.set(keyword, normalizeIntent(item.keyword_intent?.label));
  }

  return map;
}

export async function fetchSeedKeywordInsights(
  seed: string,
  locationCode = 2840,
  languageCode = "en",
  useClickstream = false,
): Promise<SeedKeywordInsights> {
  const api = labsApi();
  const response = await api.googleKeywordOverviewLive([
    {
      keywords: [seed],
      location_code: locationCode,
      language_code: languageCode,
      include_clickstream_data: useClickstream,
    } as DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
  ]);

  const items = taskResultItems<{
    keyword?: string | null;
    keyword_info?: {
      search_volume?: number | null;
      cpc?: number | null;
      competition?: number | null;
      monthly_searches?: Array<{
        year?: number | null;
        month?: number | null;
        search_volume?: number | null;
      }> | null;
    } | null;
    keyword_info_normalized_with_clickstream?: {
      search_volume?: number | null;
      cpc?: number | null;
      competition?: number | null;
      monthly_searches?: Array<{
        year?: number | null;
        month?: number | null;
        search_volume?: number | null;
      }> | null;
    } | null;
    keyword_properties?: { keyword_difficulty?: number | null } | null;
    search_intent_info?: { main_intent?: string | null } | null;
  }>(response);

  const item =
    items.find((row) => row.keyword?.toLowerCase() === seed.toLowerCase()) ??
    items[0];

  const clickstream = item?.keyword_info_normalized_with_clickstream;
  const standard = item?.keyword_info;
  const metrics =
    useClickstream && clickstream?.search_volume != null ? clickstream : standard;
  const monthly =
    standard?.monthly_searches ??
    clickstream?.monthly_searches ??
    [];
  const trends = [...monthly]
    .filter((point) => point.search_volume != null)
    .sort((a, b) => {
      const ay = (a.year ?? 0) * 100 + (a.month ?? 0);
      const by = (b.year ?? 0) * 100 + (b.month ?? 0);
      return ay - by;
    })
    .slice(-12)
    .map((point) => ({
      label: formatTrendLabel(point.year ?? undefined, point.month ?? undefined),
      shortLabel: point.month
        ? new Date(point.year ?? 2000, point.month - 1, 1).toLocaleDateString(
            "en-US",
            { month: "short" },
          )
        : "",
      volume: point.search_volume ?? 0,
    }));

  const trendRange =
    trends.length >= 2
      ? `${trends[0]?.label} – ${trends[trends.length - 1]?.label}`
      : "Last 12 months";

  return {
    keyword: item?.keyword ?? seed,
    searchVolume: metrics?.search_volume ?? standard?.search_volume ?? null,
    cpc: metrics?.cpc ?? standard?.cpc ?? null,
    competition: metrics?.competition ?? standard?.competition ?? null,
    difficulty: item?.keyword_properties?.keyword_difficulty ?? null,
    intent: normalizeIntent(item?.search_intent_info?.main_intent),
    trends,
    trendRange,
  };
}

export async function fetchSerpResults(
  keyword: string,
  locationCode = 2840,
  languageCode = "en",
  limit = 40,
): Promise<SerpResultRow[]> {
  const api = serpApi();
  const response = await api.googleOrganicLiveAdvanced([
    {
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      depth: Math.min(limit * 2, 100),
      device: "desktop",
    } as SerpGoogleOrganicLiveAdvancedRequestInfo,
  ]);

  const page = taskResult<{
    items?: Array<{
      type?: string | null;
      rank_absolute?: number | null;
      title?: string | null;
      url?: string | null;
      domain?: string | null;
    }> | null;
  }>(response);

  return (page?.items ?? [])
    .filter((item) => item.type === "organic" && item.url)
    .slice(0, limit)
    .map((item) => ({
      rank: item.rank_absolute ?? 0,
      title: item.title ?? item.url ?? "",
      url: item.url ?? "",
      domain: item.domain?.replace(/^www\./i, "") ?? "",
    }));
}

export function intentShortLabel(intent: KeywordIntent) {
  switch (intent) {
    case "navigational":
      return "Nav";
    case "transactional":
      return "Trans";
    case "commercial":
      return "Comm";
    case "informational":
      return "Info";
    default:
      return "—";
  }
}

export function intentBadgeClass(intent: KeywordIntent) {
  switch (intent) {
    case "navigational":
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
    case "transactional":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    case "commercial":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    case "informational":
      return "border-violet-500/30 bg-violet-500/10 text-violet-300";
    default:
      return "border-line bg-white/5 text-ink-muted";
  }
}

export function scoreBadgeClass(score: number | null) {
  if (score === null) return "border-line bg-white/5 text-ink-muted";
  if (score <= 20) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  if (score <= 40) return "border-lime-500/30 bg-lime-500/10 text-lime-300";
  if (score <= 60) return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return "border-orange-500/30 bg-orange-500/10 text-orange-300";
}
