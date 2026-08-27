import {
  BacklinksHistoryLiveRequestInfo,
  BacklinksSummaryLiveRequestInfo,
  DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
  DataforseoLabsGoogleHistoricalRankOverviewLiveRequestInfo,
  OnPagePagesRequestInfo,
  OnPageTaskPostRequestInfo,
} from "dataforseo-client";
import {
  backlinksApi,
  labsApi,
  normalizeDomain,
  onPageApi,
  taskItems,
} from "@/lib/dataforseo/client";
import {
  resolveDomainTarget,
  type DomainScope,
} from "@/lib/dashboard/domain-overview-config";
import { getDomainOverview } from "@/lib/dataforseo/services";

const COUNTRY_MARKETS = [
  { code: "US", locationCode: 2840 },
  { code: "CA", locationCode: 2124 },
  { code: "IT", locationCode: 2380 },
  { code: "GB", locationCode: 2826 },
  { code: "ES", locationCode: 2724 },
] as const;

export type DomainMetricSeries = {
  value: number | null;
  change: number | null;
  trend: number[];
};

export type DomainCountryKeywords = {
  code: string;
  count: number | null;
  change: number | null;
};

export type DomainDashboard = {
  domain: string;
  scopeLabel: string;
  health: {
    score: number | null;
    crawled: number | null;
    redirects: number | null;
    broken: number | null;
    blocked: number | null;
  };
  domainRating: DomainMetricSeries;
  referringDomains: DomainMetricSeries;
  googleVisitors: DomainMetricSeries & { connected: boolean };
  organicTraffic: DomainMetricSeries & { valueUsd: number | null };
  organicKeywords: DomainMetricSeries & { byCountry: DomainCountryKeywords[] };
  topPositions: { pos1: number | null; pos2_3: number | null; pos4_10: number | null };
  topKeywords: Awaited<ReturnType<typeof getDomainOverview>>["topKeywords"];
  topPages: Awaited<ReturnType<typeof getDomainOverview>>["topPages"];
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onPageTaskResult<T>(response: unknown): T | null {
  const data = response as { tasks?: Array<{ result?: T[] | null }> | null };
  return data?.tasks?.[0]?.result?.[0] ?? null;
}

function deltaFromSeries(values: number[]): number | null {
  if (values.length < 2) return null;
  return values[values.length - 1] - values[values.length - 2];
}

function monthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

function organicMetricsFromOverview(response: unknown) {
  const item = taskItems<{
    metrics?: {
      organic?: {
        etv?: number | null;
        count?: number | null;
        estimated_paid_traffic_cost?: number | null;
      } | null;
    } | null;
  }>(response)[0];
  return item?.metrics?.organic ?? null;
}

function organicSeriesFromHistorical(response: unknown) {
  const items = taskItems<{
    year?: number | null;
    month?: number | null;
    metrics?: { organic?: {
      etv?: number | null;
      count?: number | null;
      estimated_paid_traffic_cost?: number | null;
    } | null } | null;
  }>(response);

  return items
    .slice()
    .sort((a, b) => (a.year ?? 0) * 100 + (a.month ?? 0) - ((b.year ?? 0) * 100 + (b.month ?? 0)))
    .map((item) => item.metrics?.organic);
}

async function fetchDomainRankOverview(domain: string, locationCode: number) {
  const api = labsApi();
  return api.googleDomainRankOverviewLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: "en",
    } as DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
  ]);
}

async function fetchHistoricalOverview(
  domain: string,
  locationCode: number,
  languageCode: string,
) {
  const api = labsApi();
  return api.googleHistoricalRankOverviewLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      date_from: monthsAgo(6),
      correlate: true,
    } as DataforseoLabsGoogleHistoricalRankOverviewLiveRequestInfo,
  ]);
}

async function getBacklinksMetrics(domain: string, includeSubdomains: boolean) {
  const api = backlinksApi();
  const [summaryRes, historyRes] = await Promise.all([
    api.summaryLive([
      {
        target: domain,
        include_subdomains: includeSubdomains,
        rank_scale: "one_hundred",
      } as BacklinksSummaryLiveRequestInfo,
    ]),
    api.historyLive([
      {
        target: domain,
        date_from: monthsAgo(6),
        rank_scale: "one_hundred",
      } as BacklinksHistoryLiveRequestInfo,
    ]),
  ]);

  const summary = taskItems<{
    rank?: number | null;
    referring_domains?: number | null;
  }>(summaryRes)[0];

  const historyItems = taskItems<{
    date?: string | null;
    rank?: number | null;
    referring_domains?: number | null;
  }>(historyRes)
    .filter((item) => item.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const rankTrend = historyItems
    .map((item) => item.rank)
    .filter((value): value is number => typeof value === "number");
  const referringTrend = historyItems
    .map((item) => item.referring_domains)
    .filter((value): value is number => typeof value === "number");

  return {
    domainRating: summary?.rank ?? null,
    domainRatingChange: deltaFromSeries(rankTrend),
    domainRatingTrend: rankTrend.slice(-12),
    referringDomains: summary?.referring_domains ?? null,
    referringDomainsChange: deltaFromSeries(referringTrend),
    referringDomainsTrend: referringTrend.slice(-12),
  };
}

async function getCountryKeywordBreakdown(domain: string, languageCode: string) {
  const results = await Promise.all(
    COUNTRY_MARKETS.map(async ({ code, locationCode }) => {
      try {
        const [currentRes, historicalRes] = await Promise.all([
          fetchDomainRankOverview(domain, locationCode),
          fetchHistoricalOverview(domain, locationCode, languageCode),
        ]);

        const organic = organicMetricsFromOverview(currentRes);
        const history = organicSeriesFromHistorical(historicalRes);
        const counts = history
          .map((metrics) => metrics?.count)
          .filter((value): value is number => typeof value === "number");

        return {
          code,
          count: organic?.count ?? null,
          change: deltaFromSeries(counts),
        };
      } catch {
        return { code, count: null, change: null };
      }
    }),
  );

  return results;
}

async function getDomainHealth(domain: string) {
  try {
    const api = onPageApi();
    const postResponse = await api.taskPost([
      {
        target: normalizeDomain(domain),
        max_crawl_pages: 25,
        max_crawl_depth: 3,
      } as OnPageTaskPostRequestInfo,
    ]);

    const taskId = postResponse?.tasks?.[0]?.id;
    if (!taskId) {
      return {
        score: null,
        crawled: null,
        redirects: null,
        broken: null,
        blocked: null,
      };
    }

    for (let i = 0; i < 24; i += 1) {
      const summaryResponse = await api.summary(taskId);
      const summary = onPageTaskResult<{
        crawl_progress?: string | null;
        crawl_status?: { pages_crawled?: number | null } | null;
        page_metrics?: {
          onpage_score?: number | null;
          broken_links?: number | null;
          non_indexable?: number | null;
          checks?: Record<string, number> | null;
        } | null;
      }>(summaryResponse);

      if (summary?.crawl_progress === "finished") {
        const pagesResponse = await api.pages([
          {
            id: taskId,
            limit: 1000,
          } as OnPagePagesRequestInfo,
        ]);

        const pages = onPageTaskResult<{
          items?: Array<{ status_code?: number | null }> | null;
        }>(pagesResponse)?.items ?? [];

        let redirects = 0;
        let brokenPages = 0;
        for (const page of pages) {
          const code = page.status_code ?? 0;
          if (code >= 300 && code < 400) redirects += 1;
          if (code >= 400) brokenPages += 1;
        }

        const metrics = summary.page_metrics;
        return {
          score:
            metrics?.onpage_score != null
              ? Math.round(metrics.onpage_score)
              : null,
          crawled: summary.crawl_status?.pages_crawled ?? pages.length,
          redirects: redirects || metrics?.checks?.redirect || null,
          broken: brokenPages || metrics?.broken_links || null,
          blocked: metrics?.non_indexable ?? null,
        };
      }

      await sleep(2500);
    }
  } catch {
    // Health crawl is best-effort; other metrics still render.
  }

  return {
    score: null,
    crawled: null,
    redirects: null,
    broken: null,
    blocked: null,
  };
}

export async function getDomainDashboard(
  targetInput: string,
  locationCode = 2840,
  languageCode = "en",
  scope: DomainScope = "subdomains",
): Promise<DomainDashboard> {
  const resolved = resolveDomainTarget(targetInput, scope);
  const { target, hostDomain, includeSubdomains, scopeLabel } = resolved;

  const [
    overview,
    backlinks,
    historicalRes,
    health,
    countryBreakdown,
  ] = await Promise.all([
    getDomainOverview(target, locationCode, languageCode, includeSubdomains),
    getBacklinksMetrics(hostDomain, includeSubdomains),
    fetchHistoricalOverview(hostDomain, locationCode, languageCode),
    getDomainHealth(hostDomain),
    getCountryKeywordBreakdown(hostDomain, languageCode),
  ]);

  const historicalOrganic = organicSeriesFromHistorical(historicalRes);
  const trafficTrend = historicalOrganic
    .map((metrics) => metrics?.etv)
    .filter((value): value is number => typeof value === "number");
  const keywordTrend = historicalOrganic
    .map((metrics) => metrics?.count)
    .filter((value): value is number => typeof value === "number");

  const latestOrganic = historicalOrganic[historicalOrganic.length - 1];
  const trafficValue =
    overview.organicTrafficValue ?? latestOrganic?.estimated_paid_traffic_cost ?? null;

  return {
    domain: overview.domain,
    scopeLabel,
    health,
    domainRating: {
      value: backlinks.domainRating,
      change: backlinks.domainRatingChange,
      trend: backlinks.domainRatingTrend,
    },
    referringDomains: {
      value: backlinks.referringDomains,
      change: backlinks.referringDomainsChange,
      trend: backlinks.referringDomainsTrend,
    },
    googleVisitors: {
      value: null,
      change: null,
      trend: [],
      connected: false,
    },
    organicTraffic: {
      value: overview.organicTraffic,
      change: deltaFromSeries(trafficTrend),
      trend: trafficTrend.slice(-12),
      valueUsd: trafficValue,
    },
    organicKeywords: {
      value: overview.organicKeywords,
      change: deltaFromSeries(keywordTrend),
      trend: keywordTrend.slice(-12),
      byCountry: countryBreakdown,
    },
    topPositions: overview.topPositions,
    topKeywords: overview.topKeywords,
    topPages: overview.topPages,
  };
}

export async function attachGscVisitors(
  dashboard: DomainDashboard,
  totalClicks: number | null,
  connected: boolean,
) {
  return {
    ...dashboard,
    googleVisitors: {
      value: totalClicks,
      change: null,
      trend: totalClicks != null ? [totalClicks] : [],
      connected,
    },
  };
}
