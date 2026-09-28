import {
  BacklinksSummaryLiveRequestInfo,
  DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
  DataforseoLabsGoogleHistoricalRankOverviewLiveRequestInfo,
} from "dataforseo-client";
import {
  backlinksApi,
  labsApi,
  taskItems,
  taskResultItems,
} from "@/lib/dataforseo/client";
import {
  resolveDomainTarget,
  type DomainScope,
} from "@/lib/dashboard/domain-overview-config";
import { isAllLocations } from "@/lib/dashboard/locations";
import { getDomainOverview } from "@/lib/dataforseo/services";
import { cacheKey, getCached, setCached } from "@/lib/dataforseo/cache";

const DOMAIN_DASHBOARD_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Major markets used for All locations aggregation + country breakdown. */
const COUNTRY_MARKETS = [
  { code: "US", locationCode: 2840 },
  { code: "GB", locationCode: 2826 },
  { code: "CA", locationCode: 2124 },
  { code: "AU", locationCode: 2036 },
  { code: "DE", locationCode: 2080 },
  { code: "IN", locationCode: 2356 },
  { code: "PK", locationCode: 2586 },
  { code: "AE", locationCode: 2784 },
  { code: "FR", locationCode: 2250 },
  { code: "BR", locationCode: 2076 },
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
  traffic: number | null;
};

export type DomainTopKeyword = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  rank: number | null;
  url: string | null;
  etv: number | null;
  difficulty: number | null;
};

export type DomainDashboard = {
  domain: string;
  scopeLabel: string;
  marketLabel: string | null;
  health: {
    score: number | null;
    crawled: number | null;
    redirects: number | null;
    broken: number | null;
    blocked: number | null;
  };
  domainRating: DomainMetricSeries;
  backlinks: DomainMetricSeries & { allTime: number | null };
  referringDomains: DomainMetricSeries;
  googleVisitors: DomainMetricSeries & { connected: boolean };
  organicTraffic: DomainMetricSeries & {
    valueUsd: number | null;
    valueChange: number | null;
  };
  organicKeywords: DomainMetricSeries & {
    top3: number | null;
    byCountry: DomainCountryKeywords[];
  };
  topPositions: { pos1: number | null; pos2_3: number | null; pos4_10: number | null };
  topKeywords: DomainTopKeyword[];
  topPages: Awaited<ReturnType<typeof getDomainOverview>>["topPages"];
};

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
  // Domain Rank Overview: tasks[0].result[0].items[0].metrics.organic
  const item = taskResultItems<{
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
  }>(response)[0];
  return item?.metrics?.organic ?? null;
}

function organicSeriesFromHistorical(response: unknown) {
  const items = taskResultItems<{
    year?: number | null;
    month?: number | null;
    metrics?: {
      organic?: {
        etv?: number | null;
        count?: number | null;
        estimated_paid_traffic_cost?: number | null;
      } | null;
    } | null;
  }>(response);

  return items
    .slice()
    .sort(
      (a, b) =>
        (a.year ?? 0) * 100 + (a.month ?? 0) - ((b.year ?? 0) * 100 + (b.month ?? 0)),
    )
    .map((item) => item.metrics?.organic);
}

async function fetchDomainRankOverview(
  domain: string,
  locationCode: number,
  languageCode: string,
) {
  const api = labsApi();
  return api.googleDomainRankOverviewLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      ignore_synonyms: true,
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
      ignore_synonyms: true,
    } as DataforseoLabsGoogleHistoricalRankOverviewLiveRequestInfo,
  ]);
}

async function getBacklinksMetrics(domain: string, includeSubdomains: boolean) {
  const api = backlinksApi();
  const summaryRes = await api.summaryLive([
    {
      target: domain,
      include_subdomains: includeSubdomains,
      rank_scale: "one_hundred",
    } as BacklinksSummaryLiveRequestInfo,
  ]);

  const summary = taskItems<{
    rank?: number | null;
    backlinks?: number | null;
    referring_domains?: number | null;
  }>(summaryRes)[0];

  return {
    domainRating: summary?.rank ?? null,
    backlinks: summary?.backlinks ?? null,
    referringDomains: summary?.referring_domains ?? null,
  };
}

async function getCountryKeywordBreakdown(domain: string, languageCode: string) {
  const results = await Promise.all(
    COUNTRY_MARKETS.map(async ({ code, locationCode }) => {
      try {
        const currentRes = await fetchDomainRankOverview(domain, locationCode, languageCode);
        const organic = organicMetricsFromOverview(currentRes);
        return {
          code,
          count: organic?.count ?? null,
          change: null as number | null,
          traffic: organic?.etv ?? null,
        };
      } catch {
        return { code, count: null, change: null, traffic: null };
      }
    }),
  );

  return results
    .slice()
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0) || (b.count ?? 0) - (a.count ?? 0));
}

/** Health crawl is slow (OnPage poll). Skip on domain overview for fast first paint. */
async function getDomainHealth(_domain: string) {
  return {
    score: null,
    crawled: null,
    redirects: null,
    broken: null,
    blocked: null,
  };
}

function marketLabelFor(locationCode: number): string | null {
  if (isAllLocations(locationCode)) return "ALL";
  const match = COUNTRY_MARKETS.find((m) => m.locationCode === locationCode);
  return match?.code ?? null;
}

type OrganicSlice = {
  etv: number | null;
  count: number | null;
  valueUsd: number | null;
  pos1: number | null;
  pos2_3: number | null;
  pos4_10: number | null;
};

function emptyOrganicSlice(): OrganicSlice {
  return {
    etv: null,
    count: null,
    valueUsd: null,
    pos1: null,
    pos2_3: null,
    pos4_10: null,
  };
}

function sumNullable(a: number | null, b: number | null): number | null {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}

/** Aggregate Labs metrics across country markets for All locations. */
async function getAllLocationsOrganic(
  domain: string,
  languageCode: string,
): Promise<{
  totals: OrganicSlice;
  byCountry: DomainCountryKeywords[];
  primaryLocationCode: number;
}> {
  const rows = await Promise.all(
    COUNTRY_MARKETS.map(async ({ code, locationCode }) => {
      try {
        const res = await fetchDomainRankOverview(domain, locationCode, languageCode);
        const organic = organicMetricsFromOverview(res);
        return {
          code,
          locationCode,
          count: organic?.count ?? null,
          change: null as number | null,
          traffic: organic?.etv ?? null,
          valueUsd: organic?.estimated_paid_traffic_cost ?? null,
          pos1: organic?.pos_1 ?? null,
          pos2_3: organic?.pos_2_3 ?? null,
          pos4_10: organic?.pos_4_10 ?? null,
        };
      } catch {
        return {
          code,
          locationCode,
          count: null,
          change: null,
          traffic: null,
          valueUsd: null,
          pos1: null,
          pos2_3: null,
          pos4_10: null,
        };
      }
    }),
  );

  const byCountry: DomainCountryKeywords[] = rows
    .map(({ code, count, change, traffic }) => ({ code, count, change, traffic }))
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0) || (b.count ?? 0) - (a.count ?? 0));

  const totals = rows.reduce<OrganicSlice>((acc, row) => {
    return {
      etv: sumNullable(acc.etv, row.traffic),
      count: sumNullable(acc.count, row.count),
      valueUsd: sumNullable(acc.valueUsd, row.valueUsd),
      pos1: sumNullable(acc.pos1, row.pos1),
      pos2_3: sumNullable(acc.pos2_3, row.pos2_3),
      pos4_10: sumNullable(acc.pos4_10, row.pos4_10),
    };
  }, emptyOrganicSlice());

  const primary =
    rows
      .slice()
      .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0))
      .find((row) => (row.traffic ?? 0) > 0 || (row.count ?? 0) > 0) ?? rows[0];

  return {
    totals,
    byCountry,
    primaryLocationCode: primary?.locationCode ?? 2840,
  };
}

export async function getDomainDashboard(
  targetInput: string,
  locationCode = 2586,
  languageCode = "en",
  scope: DomainScope = "subdomains",
): Promise<DomainDashboard> {
  const resolved = resolveDomainTarget(targetInput, scope);
  const { target, hostDomain, includeSubdomains, scopeLabel } = resolved;
  const worldwide = isAllLocations(locationCode);

  const key = cacheKey([
    "domain-dashboard-v5",
    target,
    hostDomain,
    locationCode,
    languageCode,
    includeSubdomains,
    scopeLabel,
  ]);
  const cached = getCached<DomainDashboard>(key);
  if (cached) return cached;

  if (worldwide) {
    const [allMarkets, backlinks, health] = await Promise.all([
      getAllLocationsOrganic(hostDomain, languageCode),
      getBacklinksMetrics(hostDomain, includeSubdomains),
      getDomainHealth(hostDomain),
    ]);

    // Keywords / pages from the strongest single market (Labs is location-scoped).
    const overview = await getDomainOverview(
      target,
      allMarkets.primaryLocationCode,
      languageCode,
      includeSubdomains,
    );

    const historicalRes = await fetchHistoricalOverview(
      hostDomain,
      allMarkets.primaryLocationCode,
      languageCode,
    ).catch(() => null);

    const historicalOrganic = historicalRes
      ? organicSeriesFromHistorical(historicalRes)
      : [];
    const trafficTrend = historicalOrganic
      .map((metrics) => metrics?.etv)
      .filter((value): value is number => typeof value === "number");
    const keywordTrend = historicalOrganic
      .map((metrics) => metrics?.count)
      .filter((value): value is number => typeof value === "number");
    const valueTrend = historicalOrganic
      .map((metrics) => metrics?.estimated_paid_traffic_cost)
      .filter((value): value is number => typeof value === "number");

    const topKeywords = overview.topKeywords
      .map((k) => ({
        keyword: k.keyword,
        searchVolume: k.searchVolume,
        cpc: k.cpc,
        rank: k.rank,
        url: k.url,
        etv: k.etv ?? null,
        difficulty: k.difficulty ?? null,
      }))
      .sort(
        (a, b) =>
          (b.etv ?? 0) - (a.etv ?? 0) || (b.searchVolume ?? 0) - (a.searchVolume ?? 0),
      );

    const top3Count =
      (allMarkets.totals.pos1 ?? 0) + (allMarkets.totals.pos2_3 ?? 0);

    const dashboard: DomainDashboard = {
      domain: overview.domain,
      scopeLabel,
      marketLabel: "ALL",
      health,
      domainRating: {
        value: backlinks.domainRating,
        change: null,
        trend: [],
      },
      backlinks: {
        value: backlinks.backlinks,
        change: null,
        trend: [],
        allTime: backlinks.backlinks,
      },
      referringDomains: {
        value: backlinks.referringDomains,
        change: null,
        trend: [],
      },
      googleVisitors: {
        value: null,
        change: null,
        trend: [],
        connected: false,
      },
      organicTraffic: {
        value: allMarkets.totals.etv,
        change: deltaFromSeries(trafficTrend),
        trend: trafficTrend.slice(-12),
        valueUsd: allMarkets.totals.valueUsd,
        valueChange: deltaFromSeries(valueTrend),
      },
      organicKeywords: {
        value: allMarkets.totals.count,
        change: deltaFromSeries(keywordTrend),
        trend: keywordTrend.slice(-12),
        top3: top3Count > 0 ? top3Count : null,
        byCountry: allMarkets.byCountry,
      },
      topPositions: {
        pos1: allMarkets.totals.pos1,
        pos2_3: allMarkets.totals.pos2_3,
        pos4_10: allMarkets.totals.pos4_10,
      },
      topKeywords,
      topPages: overview.topPages,
    };

    setCached(key, dashboard, DOMAIN_DASHBOARD_TTL_MS);
    return dashboard;
  }

  const [overview, backlinks, historicalRes, health, countryBreakdown] =
    await Promise.all([
      getDomainOverview(target, locationCode, languageCode, includeSubdomains),
      getBacklinksMetrics(hostDomain, includeSubdomains),
      fetchHistoricalOverview(hostDomain, locationCode, languageCode).catch(() => null),
      getDomainHealth(hostDomain),
      getCountryKeywordBreakdown(hostDomain, languageCode),
    ]);

  const historicalOrganic = historicalRes
    ? organicSeriesFromHistorical(historicalRes)
    : [];
  const trafficTrend = historicalOrganic
    .map((metrics) => metrics?.etv)
    .filter((value): value is number => typeof value === "number");
  const keywordTrend = historicalOrganic
    .map((metrics) => metrics?.count)
    .filter((value): value is number => typeof value === "number");
  const valueTrend = historicalOrganic
    .map((metrics) => metrics?.estimated_paid_traffic_cost)
    .filter((value): value is number => typeof value === "number");

  const latestOrganic = historicalOrganic[historicalOrganic.length - 1];

  // If selected location has no Labs rankings, fall back to the strongest market
  // so the overview still shows Ahrefs-style traffic (common for PK-only projects).
  let organicTraffic = overview.organicTraffic;
  let organicKeywords = overview.organicKeywords;
  let trafficValue =
    overview.organicTrafficValue ??
    latestOrganic?.estimated_paid_traffic_cost ??
    null;
  let topPositions = overview.topPositions;
  let topKeywords = overview.topKeywords.map((k) => ({
    keyword: k.keyword,
    searchVolume: k.searchVolume,
    cpc: k.cpc,
    rank: k.rank,
    url: k.url,
    etv: k.etv ?? null,
    difficulty: k.difficulty ?? null,
  }));
  let marketLabel = marketLabelFor(locationCode);
  let topPages = overview.topPages;

  const primaryEmpty =
    (organicTraffic == null || organicTraffic === 0) &&
    (organicKeywords == null || organicKeywords === 0);

  if (primaryEmpty) {
    const best = countryBreakdown.find(
      (row) => (row.traffic != null && row.traffic > 0) || (row.count != null && row.count > 0),
    );
    if (best) {
      const fallbackMarket = COUNTRY_MARKETS.find((m) => m.code === best.code);
      if (fallbackMarket && fallbackMarket.locationCode !== locationCode) {
        const fallback = await getDomainOverview(
          target,
          fallbackMarket.locationCode,
          languageCode,
          includeSubdomains,
        );
        organicTraffic = fallback.organicTraffic ?? best.traffic;
        organicKeywords = fallback.organicKeywords ?? best.count;
        trafficValue = fallback.organicTrafficValue ?? trafficValue;
        topPositions = fallback.topPositions;
        topKeywords = fallback.topKeywords.map((k) => ({
          keyword: k.keyword,
          searchVolume: k.searchVolume,
          cpc: k.cpc,
          rank: k.rank,
          url: k.url,
          etv: k.etv ?? null,
          difficulty: k.difficulty ?? null,
        }));
        topPages = fallback.topPages;
        marketLabel = best.code;
      } else {
        organicTraffic = best.traffic;
        organicKeywords = best.count;
        marketLabel = best.code;
      }
    }
  }

  // Prefer keywords ordered by estimated traffic (Ahrefs-style).
  topKeywords = topKeywords
    .slice()
    .sort((a, b) => (b.etv ?? 0) - (a.etv ?? 0) || (b.searchVolume ?? 0) - (a.searchVolume ?? 0));

  const top3Count = (topPositions.pos1 ?? 0) + (topPositions.pos2_3 ?? 0);

  const dashboard: DomainDashboard = {
    domain: overview.domain,
    scopeLabel,
    marketLabel,
    health,
    domainRating: {
      value: backlinks.domainRating,
      change: null,
      trend: [],
    },
    backlinks: {
      value: backlinks.backlinks,
      change: null,
      trend: [],
      allTime: backlinks.backlinks,
    },
    referringDomains: {
      value: backlinks.referringDomains,
      change: null,
      trend: [],
    },
    googleVisitors: {
      value: null,
      change: null,
      trend: [],
      connected: false,
    },
    organicTraffic: {
      value: organicTraffic,
      change: deltaFromSeries(trafficTrend),
      trend: trafficTrend.slice(-12),
      valueUsd: trafficValue,
      valueChange: deltaFromSeries(valueTrend),
    },
    organicKeywords: {
      value: organicKeywords,
      change: deltaFromSeries(keywordTrend),
      trend: keywordTrend.slice(-12),
      top3: top3Count > 0 ? top3Count : null,
      byCountry: countryBreakdown,
    },
    topPositions,
    topKeywords,
    topPages,
  };

  setCached(key, dashboard, DOMAIN_DASHBOARD_TTL_MS);
  return dashboard;
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
