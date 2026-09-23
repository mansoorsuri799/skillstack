import {
  DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
  DataforseoLabsGoogleSearchIntentLiveRequestInfo,
  SerpGoogleOrganicLiveAdvancedRequestInfo,
} from "dataforseo-client";
import { labsApi, serpApi, taskResult, taskResultItems, allTasksResultItems } from "@/lib/dataforseo/client";
import {
  ALL_LOCATIONS_CODE,
  LOCATION_FLAGS,
  RESEARCH_LOCATIONS,
} from "@/lib/dashboard/locations";
import { resolveVolumeMetrics, fetchGoogleAdsSearchVolumes } from "@/lib/dataforseo/volume";

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
  locationCode = 2586,
  languageCode = "en",
  _useClickstream = false,
): Promise<SeedKeywordInsights> {
  const api = labsApi();
  const isGlobal = locationCode === ALL_LOCATIONS_CODE;

  // Always pull clickstream/Bing fields for fallback; display prefers Google Ads
  const includeClickstream = true;

  // All locations → query major markets only. Single market → primary + other globals.
  const tasks: DataforseoLabsGoogleKeywordOverviewLiveRequestInfo[] = isGlobal
    ? TOP_GLOBAL_TARGETS.map(
        (t) =>
          ({
            keywords: [seed],
            location_code: t.code,
            language_code: t.lang,
            include_clickstream_data: includeClickstream,
          }) as DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
      )
    : [
        {
          keywords: [seed],
          location_code: locationCode,
          language_code: languageCode,
          include_clickstream_data: includeClickstream,
        } as DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
        ...TOP_GLOBAL_TARGETS.filter((t) => t.code !== locationCode).map(
          (t) =>
            ({
              keywords: [seed],
              location_code: t.code,
              language_code: t.lang,
              include_clickstream_data: includeClickstream,
            }) as DataforseoLabsGoogleKeywordOverviewLiveRequestInfo,
        ),
      ];

  let rawResponse: unknown;
  try {
    rawResponse = await api.googleKeywordOverviewLive(tasks);
  } catch {
    // Fallback: run markets in parallel if the batch call fails
    const settled = await Promise.all(
      tasks.map((task) =>
        api.googleKeywordOverviewLive([task]).catch(() => null),
      ),
    );
    rawResponse = {
      tasks: settled.flatMap((res) => {
        const data = res as { tasks?: unknown[] } | null;
        return data?.tasks ?? [];
      }),
    };
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
    keyword_info_normalized_with_bing?: {
      search_volume?: number | null;
      cpc?: number | null;
      competition?: number | null;
    } | null;
    keyword_properties?: { keyword_difficulty?: number | null } | null;
    search_intent_info?: { main_intent?: string | null } | null;
  };

  // Aggregate every location task — not just tasks[0]
  let items: OverviewItem[] = allTasksResultItems<OverviewItem>(rawResponse);
  if (items.length === 0) {
    items = taskResultItems<OverviewItem>(rawResponse);
  }

  // Prefer Google Ads volume (Keywords Everywhere–style), then Bing/clickstream
  const volumeOf = (item: OverviewItem) =>
    resolveVolumeMetrics(
      item.keyword_info,
      item.keyword_info_normalized_with_clickstream,
      item.keyword_info_normalized_with_bing,
    ).searchVolume ?? 0;

  const primaryItem = isGlobal
    ? [...items].sort((a, b) => volumeOf(b) - volumeOf(a))[0]
    : (items.find((row) => row.location_code === locationCode) ?? items[0]);

  const metrics = resolveVolumeMetrics(
    primaryItem?.keyword_info,
    primaryItem?.keyword_info_normalized_with_clickstream,
    primaryItem?.keyword_info_normalized_with_bing,
  );
  const standard = primaryItem?.keyword_info;
  const clickstream = primaryItem?.keyword_info_normalized_with_clickstream;

  // Overlay live Google Ads Keyword Planner volumes (Keywords Everywhere source)
  const adsPrimary = await fetchGoogleAdsSearchVolumes(
    [seed],
    isGlobal ? null : locationCode,
    languageCode,
  );
  const adsRow = adsPrimary.get(seed.trim().toLowerCase());

  const searchVolumeAds = adsRow?.searchVolume;
  const cpcAds = adsRow?.cpc;
  const competitionAds = adsRow?.competition;

  const monthly =
    (adsRow?.monthlySearches?.length
      ? adsRow.monthlySearches
      : null) ??
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

  // Build Global Volume breakdown across countries (Labs Google Ads per market)
  const countryVolumes: Array<{
    countryCode: number;
    countryName: string;
    flag: string;
    volume: number;
  }> = [];

  for (const item of items) {
    const code = item.location_code ?? (isGlobal ? null : locationCode);
    if (code == null) continue;
    const itemVol = volumeOf(item);

    const matchedMeta =
      RESEARCH_LOCATIONS.find((r) => r.code === code) ??
      TOP_GLOBAL_TARGETS.find((r) => r.code === code);

    if (matchedMeta && itemVol > 0) {
      const existing = countryVolumes.find((c) => c.countryCode === code);
      if (existing) {
        if (itemVol > existing.volume) existing.volume = itemVol;
      } else {
        countryVolumes.push({
          countryCode: code,
          countryName: matchedMeta.label,
          flag: matchedMeta.flag || LOCATION_FLAGS[code] || "🌐",
          volume: itemVol,
        });
      }
    }
  }

  // Prefer live Ads volume for the selected market in the breakdown
  if (!isGlobal && searchVolumeAds != null && searchVolumeAds > 0) {
    const existing = countryVolumes.find((c) => c.countryCode === locationCode);
    if (existing) {
      existing.volume = searchVolumeAds;
    } else {
      const matchedMeta = RESEARCH_LOCATIONS.find((r) => r.code === locationCode);
      countryVolumes.push({
        countryCode: locationCode,
        countryName: matchedMeta?.label || "Target Region",
        flag: matchedMeta?.flag || LOCATION_FLAGS[locationCode] || "🌐",
        volume: searchVolumeAds,
      });
    }
  }

  // If only primary location returned, add default representation
  const primaryVol = searchVolumeAds ?? metrics.searchVolume;
  if (countryVolumes.length === 0 && primaryVol && !isGlobal) {
    const matchedMeta = RESEARCH_LOCATIONS.find((r) => r.code === locationCode);
    countryVolumes.push({
      countryCode: locationCode,
      countryName: matchedMeta?.label || "Target Region",
      flag: matchedMeta?.flag || LOCATION_FLAGS[locationCode] || "🌐",
      volume: primaryVol,
    });
  }

  countryVolumes.sort((a, b) => b.volume - a.volume);

  const totalGlobalVolume = countryVolumes.reduce((acc, c) => acc + c.volume, 0);

  const globalBreakdown: GlobalVolumeCountry[] = countryVolumes.map((c) => ({
    ...c,
    percentage:
      totalGlobalVolume > 0 ? Math.round((c.volume / totalGlobalVolume) * 100) : 0,
  }));

  // All locations: worldwide Ads volume when available, else sum of markets
  const searchVol = isGlobal
    ? (searchVolumeAds ?? (totalGlobalVolume || metrics.searchVolume || null))
    : (searchVolumeAds ?? metrics.searchVolume);
  const kd = primaryItem?.keyword_properties?.keyword_difficulty ?? null;
  const cpc = cpcAds ?? metrics.cpc;
  const competition = competitionAds ?? metrics.competition;

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
    competition,
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
  locationCode = 2586,
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
