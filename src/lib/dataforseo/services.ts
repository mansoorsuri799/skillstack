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
  aiOptimizationApi,
  backlinksApi,
  labsApi,
  onPageApi,
  serpApi,
  taskItems,
} from "@/lib/dataforseo/client";

export type KeywordResult = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  difficulty: number | null;
  competition: number | null;
};

function mapKeywordItems(
  items: Array<{
    keyword?: string | null;
    keyword_info?: {
      search_volume?: number | null;
      cpc?: number | null;
      competition?: number | null;
      keyword_difficulty?: number | null;
    } | null;
    keyword_properties?: { keyword_difficulty?: number | null } | null;
  }>,
): KeywordResult[] {
  return items
    .map((item) => ({
      keyword: item.keyword ?? "",
      searchVolume: item.keyword_info?.search_volume ?? null,
      cpc: item.keyword_info?.cpc ?? null,
      difficulty:
        item.keyword_properties?.keyword_difficulty ??
        item.keyword_info?.keyword_difficulty ??
        null,
      competition: item.keyword_info?.competition ?? null,
    }))
    .filter((k) => k.keyword);
}

export async function researchKeywords(
  seed: string,
  locationCode = 2840,
  languageCode = "en",
  limit = 50,
  mode: "auto" | "suggestions" | "related" | "ideas" = "auto",
): Promise<KeywordResult[]> {
  const api = labsApi();
  const resolvedMode =
    mode === "auto" ? "suggestions" : mode;

  if (resolvedMode === "related") {
    const response = await api.googleRelatedKeywordsLive([
      {
        keyword: seed,
        location_code: locationCode,
        language_code: languageCode,
        limit,
      } as DataforseoLabsGoogleRelatedKeywordsLiveRequestInfo,
    ]);
    const items = taskItems<{
      keyword_data?: {
        keyword?: string | null;
        keyword_info?: {
          search_volume?: number | null;
          cpc?: number | null;
          competition?: number | null;
          keyword_difficulty?: number | null;
        } | null;
        keyword_properties?: { keyword_difficulty?: number | null } | null;
      } | null;
    }>(response);
    return mapKeywordItems(
      items.map((item) => ({
        keyword: item.keyword_data?.keyword,
        keyword_info: item.keyword_data?.keyword_info,
        keyword_properties: item.keyword_data?.keyword_properties,
      })),
    );
  }

  if (resolvedMode === "ideas") {
    const response = await api.googleKeywordIdeasLive([
      {
        keywords: [seed],
        location_code: locationCode,
        language_code: languageCode,
        limit,
      } as DataforseoLabsGoogleKeywordIdeasLiveRequestInfo,
    ]);
    const items = taskItems<{
      keyword?: string | null;
      keyword_info?: {
        search_volume?: number | null;
        cpc?: number | null;
        competition?: number | null;
        keyword_difficulty?: number | null;
      } | null;
      keyword_properties?: { keyword_difficulty?: number | null } | null;
    }>(response);
    return mapKeywordItems(items);
  }

  const response = await api.googleKeywordSuggestionsLive([
    {
      keyword: seed,
      location_code: locationCode,
      language_code: languageCode,
      include_seed_keyword: true,
      limit,
    } as DataforseoLabsGoogleKeywordSuggestionsLiveRequestInfo,
  ]);

  const items = taskItems<{
    keyword?: string | null;
    keyword_info?: {
      search_volume?: number | null;
      cpc?: number | null;
      competition?: number | null;
      keyword_difficulty?: number | null;
    } | null;
    keyword_properties?: { keyword_difficulty?: number | null } | null;
  }>(response);

  return mapKeywordItems(items);
}

export async function getDomainOverview(
  domain: string,
  locationCode = 2840,
  languageCode = "en",
  includeSubdomains = true,
) {
  const api = labsApi();
  const [overviewRes, keywordsRes, pagesRes] = await Promise.all([
    api.googleDomainRankOverviewLive([
      {
        target: domain,
        location_code: locationCode,
        language_code: languageCode,
      } as DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
    ]),
    api.googleRankedKeywordsLive([
      {
        target: domain,
        location_code: locationCode,
        language_code: languageCode,
        limit: 25,
        include_subdomains: includeSubdomains,
      } as unknown as DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
    ]),
    api.googleRelevantPagesLive([
      {
        target: domain,
        location_code: locationCode,
        language_code: languageCode,
        limit: 25,
        include_subdomains: includeSubdomains,
      } as unknown as DataforseoLabsGoogleRelevantPagesLiveRequestInfo,
    ]),
  ]);

  const overview = taskItems<{
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

  const keywords = taskItems<{
    keyword_data?: {
      keyword?: string | null;
      keyword_info?: {
        search_volume?: number | null;
        cpc?: number | null;
      } | null;
    } | null;
    ranked_serp_element?: {
      serp_item?: { rank_absolute?: number | null; url?: string | null } | null;
    } | null;
  }>(keywordsRes).map((item) => ({
    keyword: item.keyword_data?.keyword ?? "",
    searchVolume: item.keyword_data?.keyword_info?.search_volume ?? null,
    cpc: item.keyword_data?.keyword_info?.cpc ?? null,
    rank: item.ranked_serp_element?.serp_item?.rank_absolute ?? null,
    url: item.ranked_serp_element?.serp_item?.url ?? null,
  }));

  const organic = overview?.metrics?.organic;

  const topPages = taskItems<{
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
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0));

  return {
    domain,
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

export async function checkKeywordRank(
  keyword: string,
  domain: string,
  locationCode = 2840,
  languageCode = "en",
) {
  const api = serpApi();
  const response = await api.googleOrganicLiveAdvanced([
    {
      keyword,
      location_code: locationCode,
      language_code: languageCode,
      depth: 100,
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
      location_code: 2840,
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
      location_code: 2840,
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
