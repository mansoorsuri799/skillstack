import {
  DataforseoLabsGoogleKeywordSuggestionsLiveRequestInfo,
  DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
  DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
  DataforseoLabsGoogleRelatedKeywordsLiveRequestInfo,
  DataforseoLabsGoogleKeywordIdeasLiveRequestInfo,
  DataforseoLabsGoogleRelevantPagesLiveRequestInfo,
  BacklinksSummaryLiveRequestInfo,
  BacklinksBacklinksLiveRequestInfo,
  BacklinksReferringDomainsLiveRequestInfo,
  SerpGoogleOrganicLiveAdvancedRequestInfo,
  OnPageLighthouseLiveJsonRequestInfo,
  AiOptimizationChatGptLlmScraperLiveAdvancedRequestInfo,
} from "dataforseo-client";
import {
  ALL_LOCATIONS_CODE,
  COST_EFFICIENT_MARKETS,
  resolveLabsLocationCode,
  resolveLanguageForLocation,
} from "@/lib/dashboard/locations";
import { resolveVolumeMetrics } from "@/lib/dataforseo/volume";
import {
  aiOptimizationApi,
  backlinksApi,
  labsApi,
  onPageApi,
  serpApi,
  taskItems,
  taskResultItems,
} from "@/lib/dataforseo/client";

export type KeywordResult = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  difficulty: number | null;
  competition: number | null;
  intent?: string | null;
};

type VolumeFields = {
  search_volume?: number | null;
  cpc?: number | null;
  competition?: number | null;
};

function mapKeywordItems(
  items: Array<{
    keyword?: string | null;
    keyword_info?: VolumeFields & { keyword_difficulty?: number | null } | null;
    keyword_info_normalized_with_clickstream?: VolumeFields | null;
    keyword_info_normalized_with_bing?: VolumeFields | null;
    keyword_properties?: { keyword_difficulty?: number | null } | null;
  }>,
  _useClickstream = true,
): KeywordResult[] {
  return items
    .map((item) => {
      const metrics = resolveVolumeMetrics(
        item.keyword_info,
        item.keyword_info_normalized_with_clickstream,
        item.keyword_info_normalized_with_bing,
      );
      return {
        keyword: item.keyword ?? "",
        searchVolume: metrics.searchVolume,
        cpc: metrics.cpc,
        difficulty:
          item.keyword_properties?.keyword_difficulty ??
          item.keyword_info?.keyword_difficulty ??
          null,
        competition: metrics.competition,
      };
    })
    .filter((k) => k.keyword);
}

/**
 * Prefer volumes already returned by suggestions/ideas/related.
 * Do NOT call Google Ads Search Volume or Labs Overview here — those are
 * billed per request and were the main driver of ~$0.5/search spend.
 * Seed-level Ads (1 request) still runs in fetchSeedKeywordInsights.
 */
async function enrichKeywordVolumes(
  rows: KeywordResult[],
  _locationCode: number,
  _languageCode: string,
): Promise<KeywordResult[]> {
  return rows;
}

export async function researchKeywords(
  seed: string,
  locationCode = 2586,
  languageCode = "en",
  limit = 50,
  mode: "auto" | "suggestions" | "related" | "ideas" = "auto",
  useClickstream = false,
): Promise<KeywordResult[]> {
  if (locationCode === ALL_LOCATIONS_CODE) {
    return researchKeywordsAllLocations(
      seed,
      languageCode,
      limit,
      mode,
      useClickstream,
    );
  }

  // Labs rejects invalid location+language pairs with 40501 Invalid Field.
  const labsLocation = resolveLabsLocationCode(locationCode);
  const labsLanguage = resolveLanguageForLocation(labsLocation, languageCode);

  const api = labsApi();
  const resolvedMode =
    mode === "auto" ? "suggestions" : mode;
  const includeClickstream = useClickstream;
  const safeLimit = Math.min(Math.max(Math.round(limit) || 50, 1), 75);

  let rows: KeywordResult[] = [];

  if (resolvedMode === "related") {
    const response = await api.googleRelatedKeywordsLive([
      {
        keyword: seed,
        location_code: labsLocation,
        language_code: labsLanguage,
        limit: safeLimit,
        include_clickstream_data: includeClickstream,
      } as DataforseoLabsGoogleRelatedKeywordsLiveRequestInfo,
    ]);
    const items = taskResultItems<{
      keyword_data?: {
        keyword?: string | null;
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
      } | null;
    }>(response);
    rows = mapKeywordItems(
      items.map((item) => ({
        keyword: item.keyword_data?.keyword,
        keyword_info: item.keyword_data?.keyword_info,
        keyword_info_normalized_with_clickstream:
          item.keyword_data?.keyword_info_normalized_with_clickstream,
        keyword_info_normalized_with_bing:
          item.keyword_data?.keyword_info_normalized_with_bing,
        keyword_properties: item.keyword_data?.keyword_properties,
      })),
      useClickstream,
    );
  } else if (resolvedMode === "ideas") {
    const response = await api.googleKeywordIdeasLive([
      {
        keywords: [seed],
        location_code: labsLocation,
        language_code: labsLanguage,
        limit: safeLimit,
        include_clickstream_data: includeClickstream,
      } as DataforseoLabsGoogleKeywordIdeasLiveRequestInfo,
    ]);
    const items = taskResultItems<{
      keyword?: string | null;
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
    }>(response);
    rows = mapKeywordItems(items, useClickstream);
  } else {
    const response = await api.googleKeywordSuggestionsLive([
      {
        keyword: seed,
        location_code: labsLocation,
        language_code: labsLanguage,
        include_seed_keyword: true,
        include_clickstream_data: includeClickstream,
        order_by: ["keyword_info.search_volume,desc"],
        limit: safeLimit,
      } as DataforseoLabsGoogleKeywordSuggestionsLiveRequestInfo,
    ]);

    const items = taskResultItems<{
      keyword?: string | null;
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
    }>(response);

    rows = mapKeywordItems(items, useClickstream);
  }

  // Overview enrichment → Google Ads volumes (closer to Keywords Everywhere)
  return enrichKeywordVolumes(rows, labsLocation, labsLanguage);
}

/** Markets used for All locations keyword ideas (valid Labs location+language pairs). */
const KEYWORD_ALL_MARKETS = COST_EFFICIENT_MARKETS;

/**
 * All locations keyword ideas: fetch from the primary market only, then stop.
 * Multi-market fan-out for idea discovery is extremely expensive; volume across
 * countries is handled separately in seed insights (4 markets × 1 seed keyword).
 */
export async function researchKeywordsAllLocations(
  seed: string,
  _languageCode = "en",
  limit = 50,
  mode: "auto" | "suggestions" | "related" | "ideas" = "auto",
  useClickstream = false,
): Promise<KeywordResult[]> {
  const primary = KEYWORD_ALL_MARKETS[0];
  const safeLimit = Math.min(Math.max(Math.round(limit) || 50, 1), 75);
  return researchKeywords(
    seed,
    primary.code,
    primary.lang,
    safeLimit,
    mode,
    useClickstream,
  ).catch(() => [] as KeywordResult[]);
}

export async function getDomainOverview(
  target: string,
  locationCode = 2586,
  languageCode = "en",
  includeSubdomains = true,
) {
  return getDomainOverviewInternal(target, locationCode, languageCode, includeSubdomains, true);
}

/** Faster Suri path — keywords + rank overview only (skips relevant pages). */
export async function getDomainOverviewLight(
  target: string,
  locationCode = 2586,
  languageCode = "en",
  includeSubdomains = true,
) {
  return getDomainOverviewInternal(target, locationCode, languageCode, includeSubdomains, false);
}

async function getDomainOverviewInternal(
  target: string,
  locationCode: number,
  languageCode: string,
  includeSubdomains: boolean,
  includePages: boolean,
) {
  const api = labsApi();
  const overviewReq = api.googleDomainRankOverviewLive([
    {
      target,
      location_code: locationCode,
      language_code: languageCode,
      // Dedupe near-duplicate keywords so ETV is closer to Ahrefs-style estimates.
      ignore_synonyms: true,
    } as DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
  ]);
  const keywordsReq = api.googleRankedKeywordsLive([
    {
      target,
      location_code: locationCode,
      language_code: languageCode,
      limit: 25,
      include_subdomains: includeSubdomains,
      ignore_synonyms: true,
      order_by: ["ranked_serp_element.serp_item.etv,desc"],
    } as unknown as DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
  ]);
  const pagesReq = includePages
    ? api.googleRelevantPagesLive([
        {
          target,
          location_code: locationCode,
          language_code: languageCode,
          limit: 25,
          include_subdomains: includeSubdomains,
          ignore_synonyms: true,
        } as unknown as DataforseoLabsGoogleRelevantPagesLiveRequestInfo,
      ])
    : Promise.resolve(null);

  const [overviewRes, keywordsRes, pagesRes] = await Promise.all([
    overviewReq,
    keywordsReq,
    pagesReq,
  ]);

  const overview = taskResultItems<{
    metrics?: {
      organic?: {
        etv?: number | null;
        count?: number | null;
        pos_1?: number | null;
        pos_2_3?: number | null;
        pos_4_10?: number | null;
        estimated_paid_traffic_cost?: number | null;
      } | null;
    } | null;
  }>(overviewRes)[0];

  const keywords = taskResultItems<{
    keyword_data?: {
      keyword?: string | null;
      keyword_info?: {
        search_volume?: number | null;
        cpc?: number | null;
      } | null;
      keyword_properties?: { keyword_difficulty?: number | null } | null;
    } | null;
    ranked_serp_element?: {
      serp_item?: {
        rank_absolute?: number | null;
        url?: string | null;
        etv?: number | null;
      } | null;
    } | null;
  }>(keywordsRes).map((item) => ({
    keyword: item.keyword_data?.keyword ?? "",
    searchVolume: item.keyword_data?.keyword_info?.search_volume ?? null,
    cpc: item.keyword_data?.keyword_info?.cpc ?? null,
    rank: item.ranked_serp_element?.serp_item?.rank_absolute ?? null,
    url: item.ranked_serp_element?.serp_item?.url ?? null,
    etv: item.ranked_serp_element?.serp_item?.etv ?? null,
    difficulty: item.keyword_data?.keyword_properties?.keyword_difficulty ?? null,
  }));

  const organic = overview?.metrics?.organic;

  const topPages = pagesRes
    ? taskResultItems<{
        page_address?: string | null;
        metrics?: {
          organic?: { etv?: number | null; count?: number | null } | null;
        } | null;
      }>(pagesRes)
        .map((page) => ({
          url: page.page_address ?? "",
          traffic: page.metrics?.organic?.etv ?? null,
          keywords: page.metrics?.organic?.count ?? null,
        }))
        .filter((p) => p.url)
        .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0))
    : [];

  return {
    domain: target.replace(/^https?:\/\//i, "").split("/")[0] ?? target,
    organicTraffic: organic?.etv ?? null,
    organicTrafficValue: organic?.estimated_paid_traffic_cost ?? null,
    organicKeywords: organic?.count ?? null,
    topPositions: {
      pos1: organic?.pos_1 ?? null,
      pos2_3: organic?.pos_2_3 ?? null,
      pos4_10: organic?.pos_4_10 ?? null,
    },
    topKeywords: keywords.filter((k) => k.keyword),
    topPages,
  };
}

export async function getBacklinksSummary(
  domain: string,
  includeSubdomains = true,
) {
  const api = backlinksApi();
  const response = await api.summaryLive([
    {
      target: domain,
      include_subdomains: includeSubdomains,
    } as BacklinksSummaryLiveRequestInfo,
  ]);

  const item = taskItems<{
    backlinks?: number | null;
    total_backlinks?: number | null;
    referring_domains?: number | null;
    referring_ips?: number | null;
    dofollow?: number | null;
    rank?: number | null;
    referring_links_attributes?: { nofollow?: number | null } | null;
  }>(response)[0];

  const totalBacklinks = item?.backlinks ?? item?.total_backlinks ?? null;
  const nofollow = item?.referring_links_attributes?.nofollow ?? null;
  const dofollow =
    item?.dofollow ??
    (totalBacklinks != null && nofollow != null
      ? Math.max(totalBacklinks - nofollow, 0)
      : null);

  return {
    domain,
    totalBacklinks,
    referringDomains: item?.referring_domains ?? null,
    referringIps: item?.referring_ips ?? null,
    dofollow,
    domainRank: item?.rank ?? null,
  };
}

export async function getBacklinksList(
  domain: string,
  includeSubdomains = true,
  limit = 25,
) {
  const api = backlinksApi();
  const response = await api.backlinksLive([
    {
      target: domain,
      include_subdomains: includeSubdomains,
      limit,
    } as BacklinksBacklinksLiveRequestInfo,
  ]);

  return taskItems<{
    domain_from?: string | null;
    url_from?: string | null;
    url_to?: string | null;
    dofollow?: boolean | null;
    rank?: number | null;
  }>(response).map((row) => ({
    domainFrom: row.domain_from ?? "",
    urlFrom: row.url_from ?? "",
    urlTo: row.url_to ?? "",
    dofollow: row.dofollow ?? false,
    rank: row.rank ?? null,
  }));
}

export async function getReferringDomains(
  domain: string,
  includeSubdomains = true,
  limit = 25,
) {
  const api = backlinksApi();
  const response = await api.referringDomainsLive([
    {
      target: domain,
      include_subdomains: includeSubdomains,
      limit,
    } as BacklinksReferringDomainsLiveRequestInfo,
  ]);

  return taskItems<{
    domain?: string | null;
    backlinks?: number | null;
    rank?: number | null;
  }>(response).map((row) => ({
    domain: row.domain ?? "",
    backlinks: row.backlinks ?? null,
    rank: row.rank ?? null,
  }));
}

type RankCheckOptions = {
  depth?: number;
  device?: "mobile" | "desktop";
};

async function checkKeywordRankForDevice(
  keyword: string,
  domain: string,
  locationCode: number,
  languageCode: string,
  options: RankCheckOptions,
) {
  const api = serpApi();
  const response = await api.googleOrganicLiveAdvanced([
    {
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      depth: options.depth ?? 100,
      device: options.device ?? "mobile",
    } as SerpGoogleOrganicLiveAdvancedRequestInfo,
  ]);

  const items = taskItems<{
    type?: string | null;
    rank_absolute?: number | null;
    domain?: string | null;
    url?: string | null;
  }>(response);

  const normalizedDomain = domain.replace(/^www\./i, "").toLowerCase();
  const match = items.find(
    (item) =>
      item.type === "organic" &&
      item.domain?.replace(/^www\./i, "").toLowerCase().includes(normalizedDomain),
  );

  return {
    keyword,
    position: match?.rank_absolute ?? null,
    url: match?.url ?? null,
  };
}

export async function checkKeywordRank(
  keyword: string,
  domain: string,
  locationCode = 2586,
  languageCode = "en",
  options: { depth?: number; device?: "mobile" | "desktop" | "both" } = {},
) {
  const depth = options.depth ?? 100;
  const device = options.device ?? "mobile";

  if (device === "both") {
    const [mobile, desktop] = await Promise.all([
      checkKeywordRankForDevice(keyword, domain, locationCode, languageCode, {
        depth,
        device: "mobile",
      }),
      checkKeywordRankForDevice(keyword, domain, locationCode, languageCode, {
        depth,
        device: "desktop",
      }),
    ]);

    const mobilePos = mobile.position ?? Number.POSITIVE_INFINITY;
    const desktopPos = desktop.position ?? Number.POSITIVE_INFINITY;

    if (mobilePos <= desktopPos) {
      return mobile;
    }
    return desktop;
  }

  return checkKeywordRankForDevice(keyword, domain, locationCode, languageCode, {
    depth,
    device,
  });
}

export async function runLighthouseAudit(url: string) {
  const api = onPageApi();
  const response = await api.lighthouseLiveJson([
    {
      url,
      for_mobile: true,
    } as OnPageLighthouseLiveJsonRequestInfo,
  ]);

  const item = taskItems<{
    categories?: {
      performance?: { score?: number | null } | null;
      seo?: { score?: number | null } | null;
      accessibility?: { score?: number | null } | null;
      "best-practices"?: { score?: number | null } | null;
    } | null;
    audits?: Record<
      string,
      { title?: string; score?: number | null; description?: string }
    > | null;
  }>(response)[0];

  const score = Math.round((item?.categories?.performance?.score ?? 0) * 100);
  const seoScore = Math.round((item?.categories?.seo?.score ?? 0) * 100);

  const issues: Array<{ type: string; severity: string; message: string }> =
    [];
  const audits = item?.audits ?? {};
  for (const [id, audit] of Object.entries(audits)) {
    if (audit.score === 1 || audit.score === null || audit.score === undefined) {
      continue;
    }
    issues.push({
      type: id,
      severity: audit.score < 0.5 ? "critical" : "warning",
      message: audit.title ?? id,
    });
    if (issues.length >= 15) break;
  }

  return { score, seoScore, issues };
}

export async function exploreBrandMentions(brand: string, domain?: string) {
  const api = aiOptimizationApi();
  const response = await api.chatGptLlmScraperLiveAdvanced([
    {
      keyword: brand,
      language_code: "en",
      location_code: 2586,
    } as AiOptimizationChatGptLlmScraperLiveAdvancedRequestInfo,
  ]);

  const item = taskItems<{
    markdown?: string | null;
    sources?: Array<{ url?: string | null; title?: string | null }> | null;
  }>(response)[0];

  const sources = item?.sources ?? [];
  const domainMentioned = domain
    ? sources.some((s) => s.url?.includes(domain.replace(/^www\./, "")))
    : false;

  return {
    brand,
    answer: item?.markdown ?? "",
    citations: sources.slice(0, 10).map((s) => ({
      title: s.title ?? "",
      url: s.url ?? "",
    })),
    domainMentioned,
    mentionCount: sources.length,
  };
}

export async function runPromptExplorer(prompt: string) {
  const api = aiOptimizationApi();
  const response = await api.chatGptLlmScraperLiveAdvanced([
    {
      keyword: prompt,
      language_code: "en",
      location_code: 2586,
    } as AiOptimizationChatGptLlmScraperLiveAdvancedRequestInfo,
  ]);

  const item = taskItems<{
    markdown?: string | null;
    sources?: Array<{ url?: string | null; title?: string | null }> | null;
  }>(response)[0];

  return {
    prompt,
    answer: item?.markdown ?? "No response returned.",
    sources: (item?.sources ?? []).slice(0, 12).map((s) => ({
      title: s.title ?? "",
      url: s.url ?? "",
    })),
  };
}
