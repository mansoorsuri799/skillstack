import {
  BacklinksBacklinksLiveRequestInfo,
  BacklinksDomainPagesLiveRequestInfo,
  BacklinksHistoryLiveRequestInfo,
  BacklinksReferringDomainsLiveRequestInfo,
  BacklinksSummaryLiveRequestInfo,
  BacklinksTimeseriesNewLostSummaryLiveRequestInfo,
} from "dataforseo-client";
import {
  backlinksApi,
  normalizeDomain,
  taskResult,
  taskResultItems,
} from "@/lib/dataforseo/client";

export type BacklinksChartPoint = {
  label: string;
  shortLabel: string;
};

export type BacklinksGrowthPoint = BacklinksChartPoint & {
  backlinks: number;
  referringDomains: number;
};

export type BacklinksNewLostPoint = BacklinksChartPoint & {
  newBacklinks: number;
  lostBacklinks: number;
};

export type BacklinksOverview = {
  domain: string;
  scopeLabel: string;
  updatedAt: string;
  backlinks: number | null;
  referringPages: number | null;
  backlinksSpamScore: number | null;
  brokenPages: number | null;
  referringDomains: number | null;
  rank: number | null;
  brokenBacklinks: number | null;
  targetSpamScore: number | null;
  growth: BacklinksGrowthPoint[];
  newLost: BacklinksNewLostPoint[];
};

export type BacklinkTableRow = {
  id: string;
  domainFrom: string;
  urlFrom: string;
  urlTo: string;
  anchor: string | null;
  flags: string[];
  linksCount: number | null;
  domainAuthority: number | null;
  spam: number | null;
  firstSeen: string | null;
};

export type ReferringDomainRow = {
  domain: string;
  backlinks: number | null;
  referringPages: number | null;
  rank: number | null;
  spam: number | null;
  firstSeen: string | null;
  brokenBacklinks: number | null;
  brokenPages: number | null;
};

export type TopPageRow = {
  page: string;
  backlinks: number | null;
  referringDomains: number | null;
  rank: number | null;
  brokenBacklinks: number | null;
};

function backlinkDateRange(months: number) {
  const dateTo = new Date();
  const dateFrom = new Date(
    Date.UTC(dateTo.getUTCFullYear(), dateTo.getUTCMonth() - months, dateTo.getUTCDate()),
  );
  return {
    dateFrom: dateFrom.toISOString().slice(0, 10),
    dateTo: dateTo.toISOString().slice(0, 10),
  };
}

function chartLabel(dateStr: string): { label: string; shortLabel: string } {
  const date = new Date(`${dateStr.slice(0, 10)}T00:00:00Z`);
  return {
    label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    shortLabel: date.toLocaleDateString("en-US", { month: "short" }),
  };
}

export function formatBacklinkDate(value: string | null | undefined): string {
  if (!value) return "—";
  const normalized = value.includes("T") ? value : value.replace(" ", "T").replace(" +00:00", "Z");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function scopeLabel(includeSubdomains: boolean) {
  return includeSubdomains ? "Subdomains" : "Domain";
}

export async function fetchBacklinksOverview(
  domainInput: string,
  includeSubdomains: boolean,
): Promise<BacklinksOverview> {
  const domain = normalizeDomain(domainInput);
  const api = backlinksApi();
  const { dateFrom, dateTo } = backlinkDateRange(12);

  const [summaryRes, historyRes, newLostRes] = await Promise.all([
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
        date_from: dateFrom,
        date_to: dateTo,
        rank_scale: "one_hundred",
      } as BacklinksHistoryLiveRequestInfo,
    ]),
    api.timeseriesNewLostSummaryLive([
      {
        target: domain,
        date_from: dateFrom,
        date_to: dateTo,
        group_range: "month",
        include_subdomains: includeSubdomains,
      } as BacklinksTimeseriesNewLostSummaryLiveRequestInfo,
    ]),
  ]);

  const summary = taskResult<{
    target?: string | null;
    backlinks?: number | null;
    referring_pages?: number | null;
    backlinks_spam_score?: number | null;
    broken_pages?: number | null;
    referring_domains?: number | null;
    rank?: number | null;
    broken_backlinks?: number | null;
    info?: { target_spam_score?: number | null } | null;
  }>(summaryRes);

  const historyItems = taskResultItems<{
    date?: string | null;
    backlinks?: number | null;
    referring_domains?: number | null;
  }>(historyRes)
    .filter((item) => item.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const newLostItems = taskResultItems<{
    date?: string | null;
    new_backlinks?: number | null;
    lost_backlinks?: number | null;
  }>(newLostRes)
    .filter((item) => item.date)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const growth = historyItems.slice(-12).map((item) => {
    const { label, shortLabel } = chartLabel(String(item.date));
    return {
      label,
      shortLabel,
      backlinks: item.backlinks ?? 0,
      referringDomains: item.referring_domains ?? 0,
    };
  });

  const newLost = newLostItems.slice(-12).map((item) => {
    const { label, shortLabel } = chartLabel(String(item.date));
    return {
      label,
      shortLabel,
      newBacklinks: item.new_backlinks ?? 0,
      lostBacklinks: item.lost_backlinks ?? 0,
    };
  });

  return {
    domain,
    scopeLabel: scopeLabel(includeSubdomains),
    updatedAt: new Date().toISOString(),
    backlinks: summary?.backlinks ?? null,
    referringPages: summary?.referring_pages ?? null,
    backlinksSpamScore: summary?.backlinks_spam_score ?? null,
    brokenPages: summary?.broken_pages ?? null,
    referringDomains: summary?.referring_domains ?? null,
    rank: summary?.rank ?? null,
    brokenBacklinks: summary?.broken_backlinks ?? null,
    targetSpamScore: summary?.info?.target_spam_score ?? null,
    growth,
    newLost,
  };
}

export async function fetchBacklinkRows(
  domainInput: string,
  includeSubdomains: boolean,
  mode: "one_per_domain" | "as_is" = "one_per_domain",
  limit = 1000,
): Promise<BacklinkTableRow[]> {
  const domain = normalizeDomain(domainInput);
  const api = backlinksApi();
  const response = await api.backlinksLive([
    {
      target: domain,
      include_subdomains: includeSubdomains,
      mode,
      limit,
      rank_scale: "one_hundred",
      order_by: ["first_seen,desc"],
    } as BacklinksBacklinksLiveRequestInfo,
  ]);

  return taskResultItems<{
    domain_from?: string | null;
    url_from?: string | null;
    url_to?: string | null;
    anchor?: string | null;
    dofollow?: boolean | null;
    is_broken?: boolean | null;
    links_count?: number | null;
    domain_from_rank?: number | null;
    backlink_spam_score?: number | null;
    first_seen?: string | null;
  }>(response).map((row, index) => {
    const flags: string[] = [];
    if (row.is_broken) flags.push("Broken");
    if (row.dofollow === false) flags.push("Nofollow");
    return {
      id: `${row.url_from ?? index}-${row.url_to ?? index}`,
      domainFrom: row.domain_from ?? "",
      urlFrom: row.url_from ?? "",
      urlTo: row.url_to ?? "",
      anchor: row.anchor ?? null,
      flags,
      linksCount: row.links_count ?? null,
      domainAuthority: row.domain_from_rank ?? null,
      spam: row.backlink_spam_score ?? null,
      firstSeen: row.first_seen ?? null,
    };
  });
}

export async function fetchReferringDomainRows(
  domainInput: string,
  includeSubdomains: boolean,
  limit = 1000,
): Promise<ReferringDomainRow[]> {
  const domain = normalizeDomain(domainInput);
  const api = backlinksApi();
  const response = await api.referringDomainsLive([
    {
      target: domain,
      include_subdomains: includeSubdomains,
      limit,
      rank_scale: "one_hundred",
      order_by: ["backlinks,desc"],
    } as BacklinksReferringDomainsLiveRequestInfo,
  ]);

  return taskResultItems<{
    domain?: string | null;
    backlinks?: number | null;
    referring_pages?: number | null;
    rank?: number | null;
    backlinks_spam_score?: number | null;
    first_seen?: string | null;
    broken_backlinks?: number | null;
    broken_pages?: number | null;
  }>(response).map((row) => ({
    domain: row.domain ?? "",
    backlinks: row.backlinks ?? null,
    referringPages: row.referring_pages ?? null,
    rank: row.rank ?? null,
    spam: row.backlinks_spam_score ?? null,
    firstSeen: row.first_seen ?? null,
    brokenBacklinks: row.broken_backlinks ?? null,
    brokenPages: row.broken_pages ?? null,
  }));
}

export async function fetchTopPageRows(
  domainInput: string,
  includeSubdomains: boolean,
  limit = 100,
): Promise<TopPageRow[]> {
  const domain = normalizeDomain(domainInput);
  const api = backlinksApi();
  const response = await api.domainPagesLive([
    {
      target: domain,
      include_subdomains: includeSubdomains,
      limit,
      order_by: ["page_summary.backlinks,desc"],
      rank_scale: "one_hundred",
    } as BacklinksDomainPagesLiveRequestInfo,
  ]);

  return taskResultItems<{
    page?: string | null;
    page_summary?: {
      backlinks?: number | null;
      referring_domains?: number | null;
      rank?: number | null;
      broken_backlinks?: number | null;
    } | null;
  }>(response).map((row) => ({
    page: row.page ?? "",
    backlinks: row.page_summary?.backlinks ?? null,
    referringDomains: row.page_summary?.referring_domains ?? null,
    rank: row.page_summary?.rank ?? null,
    brokenBacklinks: row.page_summary?.broken_backlinks ?? null,
  }));
}
