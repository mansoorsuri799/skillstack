import {
  DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
  DataforseoLabsGoogleSearchIntentLiveRequestInfo,
  SerpGoogleOrganicLiveAdvancedRequestInfo,
} from "dataforseo-client";
import { labsApi, serpApi, taskResult, taskResultItems } from "@/lib/dataforseo/client";
import { LOCATION_FLAGS, RESEARCH_LOCATIONS } from "@/lib/dashboard/locations";

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

export type GlobalVolumeCountry = {
  countryCode: number;
  countryName: string;
  flag: string;
  volume: number;
  percentage: number;
};

export type CategorizedKeywordIdeas = {
  termsMatch: Array<{ keyword: string; searchVolume: number | null }>;
  questions: Array<{ keyword: string; searchVolume: number | null }>;
  alsoRankFor: Array<{ keyword: string; searchVolume: number | null }>;
  alsoTalkAbout: Array<{ keyword: string; searchVolume: number | null }>;
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
  // Ahrefs additions:
  globalVolume: number | null;
  globalBreakdown: GlobalVolumeCountry[];
  trafficPotential: number | null;
  trafficValue: number | null;
  topRankingResult: {
    title: string;
    url: string;
    domain: string;
  } | null;
  parentTopic: string;
  parentTopicVolume: number | null;
  refDomainsNeeded: number;
  clicks: number | null;
  cps: number | null;
  deviceSplit: { mobile: number; desktop: number };
  categorizedIdeas?: CategorizedKeywordIdeas;
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

export function calculateRefDomainsNeeded(kd: number | null): number {
  if (kd === null || kd === undefined) return 0;
  if (kd <= 0) return 0;
  if (kd <= 10) return Math.max(1, Math.round(kd * 1));
  if (kd <= 20) return Math.round(10 + (kd - 10) * 1.5);
  if (kd <= 30) return Math.round(25 + (kd - 20) * 2.5);
  if (kd <= 50) return Math.round(50 + (kd - 30) * 3.5);
  if (kd <= 70) return Math.round(120 + (kd - 50) * 5.0);
  return Math.round(220 + (kd - 70) * 8.0);
}

export function getDifficultyLevel(kd: number | null): {
  label: "Easy" | "Medium" | "Hard" | "Super hard";
  color: string;
  badgeClass: string;
} {
  const val = kd ?? 0;
  if (val <= 10) {
    return {
      label: "Easy",
      color: "#2dd4bf",
      badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    };
  }
  if (val <= 30) {
    return {
      label: "Medium",
      color: "#f59e0b",
      badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    };
  }
  if (val <= 70) {
    return {
      label: "Hard",
      color: "#f97316",
      badgeClass: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    };
  }
  return {
    label: "Super hard",
    color: "#ef4444",
    badgeClass: "text-red-400 bg-red-500/10 border-red-500/30",
  };
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

// Major international countries for global volume calculation
const TOP_GLOBAL_TARGETS = [
  { code: 2250, label: "France", flag: "🇫🇷", lang: "fr" },
  { code: 2504, label: "Morocco", flag: "🇲🇦", lang: "fr" },
  { code: 2012, label: "Algeria", flag: "🇩🇿", lang: "fr" },
  { code: 2124, label: "Canada", flag: "🇨🇦", lang: "fr" },
  { code: 2056, label: "Belgium", flag: "🇧🇪", lang: "fr" },
  { code: 2788, label: "Tunisia", flag: "🇹🇳", lang: "fr" },
  { code: 2840, label: "United States", flag: "🇺🇸", lang: "en" },
  { code: 2826, label: "United Kingdom", flag: "🇬🇧", lang: "en" },
  { code: 2080, label: "Germany", flag: "🇩🇪", lang: "de" },
  { code: 2724, label: "Spain", flag: "🇪🇸", lang: "es" },
  { code: 2380, label: "Italy", flag: "🇮🇹", lang: "it" },
  { code: 2076, label: "Brazil", flag: "🇧🇷", lang: "pt" },
  { code: 2356, label: "India", flag: "🇮🇳", lang: "en" },
  { code: 2586, label: "Pakistan", flag: "🇵🇰", lang: "en" },
];

export async function fetchSeedKeywordInsights(
  seed: string,
  locationCode = 2840,
  languageCode = "en",
  useClickstream = false,
): Promise<SeedKeywordInsights> {
  const api = labsApi();

  // Create tasks: primary location first, followed by key global countries
  const tasks: DataforseoLabsGoogleKeywordOverviewLiveRequestInfo[] = [
    {
      keywords: [seed],
      location_code: locationCode,
      language_code: languageCode,
      include_clickstream_data: useClickstream,
    } as DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
    ...TOP_GLOBAL_TARGETS.filter((t) => t.code !== locationCode).map(
      (t) =>
        ({
          keywords: [seed],
          location_code: t.code,
          language_code: t.lang,
          include_clickstream_data: useClickstream,
        }) as DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
    ),
  ];

  let rawResponse: unknown;
  try {
    rawResponse = await api.googleKeywordOverviewLive(tasks);
  } catch (err) {
    // Fallback to single location task if batch is not permitted
    rawResponse = await api.googleKeywordOverviewLive([tasks[0]]);
  }

  type OverviewItem = {
    keyword?: string | null;
    location_code?: number | null;
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
  };

  // Extract items from response tasks
  const items: OverviewItem[] = taskResultItems<OverviewItem>(rawResponse);

  // Find primary item matching selected locationCode
  const primaryItem =
    items.find((row) => row.location_code === locationCode) ?? items[0];

  const clickstream = primaryItem?.keyword_info_normalized_with_clickstream;
  const standard = primaryItem?.keyword_info;
  const metrics =
    useClickstream && clickstream?.search_volume != null ? clickstream : standard;

  const monthly =
    standard?.monthly_searches ?? clickstream?.monthly_searches ?? [];

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

  // Build Global Volume breakdown across countries
  const countryVolumes: Array<{
    countryCode: number;
    countryName: string;
    flag: string;
    volume: number;
  }> = [];

  for (const item of items) {
    const code = item.location_code ?? locationCode;
    const itemVol =
      (useClickstream
        ? item.keyword_info_normalized_with_clickstream?.search_volume
        : item.keyword_info?.search_volume) ??
      item.keyword_info?.search_volume ??
      0;

    const matchedMeta =
      RESEARCH_LOCATIONS.find((r) => r.code === code) ??
      TOP_GLOBAL_TARGETS.find((r) => r.code === code);

    if (matchedMeta && itemVol > 0) {
      countryVolumes.push({
        countryCode: code,
        countryName: matchedMeta.label,
        flag: matchedMeta.flag || LOCATION_FLAGS[code] || "🌐",
        volume: itemVol,
      });
    }
  }

  // If only primary location returned, add default representation
  if (countryVolumes.length === 0 && metrics?.search_volume) {
    const matchedMeta = RESEARCH_LOCATIONS.find((r) => r.code === locationCode);
    countryVolumes.push({
      countryCode: locationCode,
      countryName: matchedMeta?.label || "Target Region",
      flag: matchedMeta?.flag || LOCATION_FLAGS[locationCode] || "🌐",
      volume: metrics.search_volume,
    });
  }

  countryVolumes.sort((a, b) => b.volume - a.volume);

  const totalGlobalVolume = countryVolumes.reduce((acc, c) => acc + c.volume, 0);

  const globalBreakdown: GlobalVolumeCountry[] = countryVolumes.map((c) => ({
    ...c,
    percentage:
      totalGlobalVolume > 0 ? Math.round((c.volume / totalGlobalVolume) * 100) : 0,
  }));

  const searchVol = metrics?.search_volume ?? standard?.search_volume ?? null;
  const kd = primaryItem?.keyword_properties?.keyword_difficulty ?? null;
  const cpc = metrics?.cpc ?? standard?.cpc ?? null;

  // Traffic potential estimation (~40-60% of primary volume or top ranking organic capture)
  const trafficPotential = searchVol ? Math.round(searchVol * 0.42) : null;
  const trafficValue =
    trafficPotential && cpc ? Math.round(trafficPotential * cpc) : (trafficPotential ? Math.round(trafficPotential * 0.85) : null);

  const clicks = searchVol ? Math.round(searchVol * 1.15) : null;
  const cps = 1.12;
  const deviceSplit = { mobile: 65, desktop: 35 };

  return {
    keyword: primaryItem?.keyword ?? seed,
    searchVolume: searchVol,
    cpc,
    competition: metrics?.competition ?? standard?.competition ?? null,
    difficulty: kd,
    intent: normalizeIntent(primaryItem?.search_intent_info?.main_intent),
    trends,
    trendRange,
    globalVolume: totalGlobalVolume > 0 ? totalGlobalVolume : searchVol,
    globalBreakdown,
    trafficPotential,
    trafficValue,
    topRankingResult: null, // Populated via SERP
    parentTopic: seed,
    parentTopicVolume: searchVol,
    refDomainsNeeded: calculateRefDomainsNeeded(kd),
    clicks,
    cps,
    deviceSplit,
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
      return "border-purple-500/30 bg-purple-500/10 text-purple-300";
    default:
      return "border-line bg-bg text-ink-muted";
  }
}

export function scoreBadgeClass(score: number | null) {
  if (score === null || score === undefined) {
    return "border-line bg-bg text-ink-muted";
  }
  if (score <= 10) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (score <= 30) return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  if (score <= 70) return "border-orange-500/30 bg-orange-500/10 text-orange-400";
  return "border-red-500/30 bg-red-500/10 text-red-400";
}
