import {
  DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
  DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
} from "dataforseo-client";
import { labsApi, normalizeDomain, taskResultItems } from "@/lib/dataforseo/client";
import { getBacklinksSummary } from "@/lib/dataforseo/services";

export type ContentGapRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  difficulty: number | null;
  competitorRank: number | null;
  competitorUrl: string | null;
  trafficValue: number | null;
};

/** @deprecated Prefer CompetitiveContentReport — kept for type imports. */
export type ContentGapResult = {
  yourDomain: string;
  competitorDomain: string;
  keywords: ContentGapRow[];
};

export type ContentPageGap = {
  url: string;
  /** Humanized path used as a topic / heading label (e.g. blog slug). */
  topic: string;
  traffic: number | null;
  keywords: number | null;
};

export type DomainContentSnapshot = {
  domain: string;
  organicTraffic: number | null;
  organicTrafficValue: number | null;
  organicKeywords: number | null;
  topPositions: {
    pos1: number | null;
    pos2_3: number | null;
    pos4_10: number | null;
  };
  topKeywords: Array<{
    keyword: string;
    searchVolume: number | null;
    rank: number | null;
    url: string | null;
    etv: number | null;
    difficulty: number | null;
  }>;
  topPages: Array<{
    url: string;
    traffic: number | null;
    keywords: number | null;
  }>;
  backlinks: number | null;
  referringDomains: number | null;
  domainRank: number | null;
  topReferringDomains: Array<{
    domain: string;
    backlinks: number | null;
    rank: number | null;
  }>;
};

export type ComparisonFact = {
  metric: string;
  yours: string;
  competitor: string;
  winner: "you" | "competitor" | "tie";
  note: string;
};

export type CompetitiveVerdict = {
  status: "leading" | "trailing" | "close";
  headline: string;
  summary: string;
  scoreYou: number;
  scoreCompetitor: number;
  facts: ComparisonFact[];
};

export type CompetitiveContentReport = {
  yourDomain: string;
  competitorDomain: string;
  locationCode: number;
  languageCode: string;
  generatedAt: string;
  includeLinks: boolean;
  apiCallsUsed: number;
  yours: DomainContentSnapshot;
  competitor: DomainContentSnapshot;
  verdict: CompetitiveVerdict;
  /** Keywords / topics competitor ranks for that you do not (from samples). */
  keywordGaps: ContentGapRow[];
  /** Competitor pages/blogs whose path you do not have. */
  pageGaps: ContentPageGap[];
  sharedKeywords: Array<{
    keyword: string;
    searchVolume: number | null;
    yourRank: number | null;
    competitorRank: number | null;
    yourUrl: string | null;
    competitorUrl: string | null;
  }>;
};

/** Prefer accuracy of head terms over traffic-sorted long-tails. */
const KEYWORD_SAMPLE = 15;

function formatCount(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString();
}

function compareHigher(
  yours: number | null,
  theirs: number | null,
): "you" | "competitor" | "tie" {
  if (yours == null && theirs == null) return "tie";
  if (yours == null) return "competitor";
  if (theirs == null) return "you";
  if (yours === theirs) return "tie";
  return yours > theirs ? "you" : "competitor";
}

function emptySnapshot(domain: string): DomainContentSnapshot {
  return {
    domain,
    organicTraffic: null,
    organicTrafficValue: null,
    organicKeywords: null,
    topPositions: { pos1: null, pos2_3: null, pos4_10: null },
    topKeywords: [],
    topPages: [],
    backlinks: null,
    referringDomains: null,
    domainRank: null,
    topReferringDomains: [],
  };
}

function pagesFromKeywords(
  keywords: DomainContentSnapshot["topKeywords"],
): DomainContentSnapshot["topPages"] {
  const byUrl = new Map<string, { traffic: number; keywords: number }>();
  for (const row of keywords) {
    const url = row.url?.trim();
    if (!url) continue;
    const current = byUrl.get(url) ?? { traffic: 0, keywords: 0 };
    current.keywords += 1;
    current.traffic += row.etv ?? 0;
    byUrl.set(url, current);
  }
  return [...byUrl.entries()]
    .map(([url, stats]) => ({
      url,
      traffic: stats.traffic || null,
      keywords: stats.keywords,
    }))
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0))
    .slice(0, 10);
}

function normalizePath(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    let path = parsed.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    // Drop common index suffixes
    path = path.replace(/\/(index|home)\.(html?|php)$/i, "") || "/";
    return path;
  } catch {
    return url.toLowerCase();
  }
}

function topicFromUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "Homepage";
    const slug = decodeURIComponent(parts[parts.length - 1] ?? "")
      .replace(/\.(html?|php)$/i, "")
      .replace(/[-_]+/g, " ")
      .trim();
    if (!slug) return "Homepage";
    return slug.replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return url;
  }
}

function buildPageGaps(
  yours: DomainContentSnapshot["topPages"],
  competitor: DomainContentSnapshot["topPages"],
): ContentPageGap[] {
  const yourPaths = new Set(yours.map((p) => normalizePath(p.url)));
  return competitor
    .filter((page) => {
      const path = normalizePath(page.url);
      // Homepage vs homepage is not a content gap
      if (path === "/") return false;
      return !yourPaths.has(path);
    })
    .map((page) => ({
      url: page.url,
      topic: topicFromUrl(page.url),
      traffic: page.traffic,
      keywords: page.keywords,
    }))
    .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0));
}

function buildKeywordGaps(
  yours: DomainContentSnapshot["topKeywords"],
  competitor: DomainContentSnapshot["topKeywords"],
): ContentGapRow[] {
  const yourSet = new Set(yours.map((k) => k.keyword.toLowerCase().trim()));
  return competitor
    .filter((row) => !yourSet.has(row.keyword.toLowerCase().trim()))
    .map((row) => ({
      keyword: row.keyword,
      searchVolume: row.searchVolume,
      cpc: null,
      difficulty: row.difficulty,
      competitorRank: row.rank,
      competitorUrl: row.url,
      trafficValue: row.etv,
    }))
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
}

function buildSharedKeywords(
  yours: DomainContentSnapshot["topKeywords"],
  competitor: DomainContentSnapshot["topKeywords"],
) {
  const competitorByKeyword = new Map(
    competitor.map((row) => [row.keyword.toLowerCase().trim(), row]),
  );
  return yours
    .map((row) => {
      const other = competitorByKeyword.get(row.keyword.toLowerCase().trim());
      if (!other) return null;
      return {
        keyword: row.keyword,
        searchVolume: row.searchVolume ?? other.searchVolume,
        yourRank: row.rank,
        competitorRank: other.rank,
        yourUrl: row.url,
        competitorUrl: other.url,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
    .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
}

function buildVerdict(
  yours: DomainContentSnapshot,
  competitor: DomainContentSnapshot,
  includeLinks: boolean,
): CompetitiveVerdict {
  const yourTop10 =
    (yours.topPositions.pos1 ?? 0) +
    (yours.topPositions.pos2_3 ?? 0) +
    (yours.topPositions.pos4_10 ?? 0);
  const competitorTop10 =
    (competitor.topPositions.pos1 ?? 0) +
    (competitor.topPositions.pos2_3 ?? 0) +
    (competitor.topPositions.pos4_10 ?? 0);

  const facts: ComparisonFact[] = [
    {
      metric: "Organic keywords",
      yours: formatCount(yours.organicKeywords),
      competitor: formatCount(competitor.organicKeywords),
      winner: compareHigher(yours.organicKeywords, competitor.organicKeywords),
      note: "Total keywords ranking in the selected market.",
    },
    {
      metric: "Est. organic traffic",
      yours: formatCount(
        yours.organicTraffic != null ? Math.round(yours.organicTraffic) : null,
      ),
      competitor: formatCount(
        competitor.organicTraffic != null
          ? Math.round(competitor.organicTraffic)
          : null,
      ),
      winner: compareHigher(yours.organicTraffic, competitor.organicTraffic),
      note: "Estimated monthly organic visits from Labs.",
    },
    {
      metric: "Top-10 positions",
      yours: formatCount(yourTop10 > 0 ? yourTop10 : null),
      competitor: formatCount(competitorTop10 > 0 ? competitorTop10 : null),
      winner: compareHigher(yourTop10, competitorTop10),
      note: "Keywords ranking in positions 1–10.",
    },
  ];

  if (includeLinks) {
    facts.push(
      {
        metric: "Backlinks",
        yours: formatCount(yours.backlinks),
        competitor: formatCount(competitor.backlinks),
        winner: compareHigher(yours.backlinks, competitor.backlinks),
        note: "Total known backlinks to the domain.",
      },
      {
        metric: "Referring domains",
        yours: formatCount(yours.referringDomains),
        competitor: formatCount(competitor.referringDomains),
        winner: compareHigher(yours.referringDomains, competitor.referringDomains),
        note: "Unique domains linking to the site.",
      },
    );
  }

  let scoreYou = 0;
  let scoreCompetitor = 0;
  for (const fact of facts) {
    if (fact.winner === "you") scoreYou += 1;
    else if (fact.winner === "competitor") scoreCompetitor += 1;
  }

  const margin = scoreYou - scoreCompetitor;
  let status: CompetitiveVerdict["status"] = "close";
  let headline: string;
  let summary: string;

  if (margin >= 2) {
    status = "leading";
    headline = `You are ahead of ${competitor.domain}`;
    summary = `Across ${facts.length} measured signals, your site wins ${scoreYou} and the competitor wins ${scoreCompetitor}. Close remaining topic and page gaps while protecting your lead.`;
  } else if (margin <= -2) {
    status = "trailing";
    headline = `${competitor.domain} is currently stronger`;
    summary = `They win ${scoreCompetitor} of ${facts.length} comparison signals versus your ${scoreYou}. Cover their missing topics and pages listed below.`;
  } else {
    status = "close";
    headline = "Competitive race is close";
    summary = `Score is ${scoreYou}–${scoreCompetitor}. Focus on the topic and page gaps below to pull ahead.`;
  }

  return {
    status,
    headline,
    summary,
    scoreYou,
    scoreCompetitor,
    facts,
  };
}

/** 1 Labs call — aggregate organic metrics only. */
async function fetchDomainMetrics(domain: string, locationCode: number, languageCode: string) {
  const api = labsApi();
  const response = await api.googleDomainRankOverviewLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      ignore_synonyms: true,
    } as DataforseoLabsGoogleDomainRankOverviewLiveRequestInfo,
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
  }>(response)[0];

  const organic = overview?.metrics?.organic;
  return {
    organicTraffic: organic?.etv ?? null,
    organicTrafficValue: organic?.estimated_paid_traffic_cost ?? null,
    organicKeywords: organic?.count ?? null,
    topPositions: {
      pos1: organic?.pos_1 ?? null,
      pos2_3: organic?.pos_2_3 ?? null,
      pos4_10: organic?.pos_4_10 ?? null,
    },
  };
}

/**
 * 1 Labs call — head terms first (search volume), not ETV.
 * ignore_synonyms false so near-duplicates like "card rummy" stay visible.
 */
async function fetchTopKeywords(
  domain: string,
  locationCode: number,
  languageCode: string,
  limit = KEYWORD_SAMPLE,
): Promise<DomainContentSnapshot["topKeywords"]> {
  const api = labsApi();
  const response = await api.googleRankedKeywordsLive([
    {
      target: domain,
      location_code: locationCode,
      language_code: languageCode,
      limit,
      include_subdomains: true,
      ignore_synonyms: false,
      order_by: ["keyword_data.keyword_info.search_volume,desc"],
    } as unknown as DataforseoLabsGoogleRankedKeywordsLiveRequestInfo,
  ]);

  return taskResultItems<{
    keyword_data?: {
      keyword?: string | null;
      keyword_info?: { search_volume?: number | null } | null;
      keyword_properties?: { keyword_difficulty?: number | null } | null;
    } | null;
    ranked_serp_element?: {
      serp_item?: {
        rank_absolute?: number | null;
        url?: string | null;
        etv?: number | null;
      } | null;
    } | null;
  }>(response)
    .map((item) => ({
      keyword: item.keyword_data?.keyword ?? "",
      searchVolume: item.keyword_data?.keyword_info?.search_volume ?? null,
      rank: item.ranked_serp_element?.serp_item?.rank_absolute ?? null,
      url: item.ranked_serp_element?.serp_item?.url ?? null,
      etv: item.ranked_serp_element?.serp_item?.etv ?? null,
      difficulty: item.keyword_data?.keyword_properties?.keyword_difficulty ?? null,
    }))
    .filter((row) => row.keyword);
}

/** Legacy helper — still one intersection call if something else imports it. */
export async function getContentGap(
  yourDomain: string,
  competitorDomain: string,
  locationCode = 2586,
  languageCode = "en",
  _limit = 50,
): Promise<ContentGapResult> {
  const target1 = normalizeDomain(competitorDomain);
  const target2 = normalizeDomain(yourDomain);
  if (target1 === target2) {
    throw new Error("Enter a competitor domain different from your site.");
  }
  const [yours, competitor] = await Promise.all([
    fetchTopKeywords(target2, locationCode, languageCode),
    fetchTopKeywords(target1, locationCode, languageCode),
  ]);
  return {
    yourDomain: target2,
    competitorDomain: target1,
    keywords: buildKeywordGaps(yours, competitor),
  };
}

/**
 * Credit-efficient competitive content report.
 *
 * Default = **4 Labs calls** (no intersection bill):
 * 1–2) Domain rank overview (you + competitor)
 * 3–4) Ranked keywords by monthly search volume (you + competitor)
 *
 * Keyword gaps + page/topic gaps + shared keywords are computed locally.
 * Optional `includeLinks` adds **2** Backlinks Summary calls.
 */
export async function getCompetitiveContentReport(
  yourDomainInput: string,
  competitorDomainInput: string,
  locationCode = 2586,
  languageCode = "en",
  includeLinks = false,
): Promise<CompetitiveContentReport> {
  const yourDomain = normalizeDomain(yourDomainInput);
  const competitorDomain = normalizeDomain(competitorDomainInput);

  if (!yourDomain || !yourDomain.includes(".")) {
    throw new Error("Enter your site domain.");
  }
  if (!competitorDomain || !competitorDomain.includes(".")) {
    throw new Error("Enter a competitor domain.");
  }
  if (yourDomain === competitorDomain) {
    throw new Error("Enter a competitor domain different from your site.");
  }

  const [yourMetrics, competitorMetrics, yourKeywords, competitorKeywords] =
    await Promise.all([
      fetchDomainMetrics(yourDomain, locationCode, languageCode).catch(() => null),
      fetchDomainMetrics(competitorDomain, locationCode, languageCode).catch(
        () => null,
      ),
      fetchTopKeywords(yourDomain, locationCode, languageCode).catch(() => []),
      fetchTopKeywords(competitorDomain, locationCode, languageCode).catch(() => []),
    ]);

  let apiCallsUsed = 4;

  const yours: DomainContentSnapshot = {
    ...emptySnapshot(yourDomain),
    ...(yourMetrics ?? {}),
    topKeywords: yourKeywords,
    topPages: pagesFromKeywords(yourKeywords),
  };

  const competitor: DomainContentSnapshot = {
    ...emptySnapshot(competitorDomain),
    ...(competitorMetrics ?? {}),
    topKeywords: competitorKeywords,
    topPages: pagesFromKeywords(competitorKeywords),
  };

  if (includeLinks) {
    const [yourLinks, competitorLinks] = await Promise.all([
      getBacklinksSummary(yourDomain, true).catch(() => null),
      getBacklinksSummary(competitorDomain, true).catch(() => null),
    ]);
    apiCallsUsed += 2;
    yours.backlinks = yourLinks?.totalBacklinks ?? null;
    yours.referringDomains = yourLinks?.referringDomains ?? null;
    yours.domainRank = yourLinks?.domainRank ?? null;
    competitor.backlinks = competitorLinks?.totalBacklinks ?? null;
    competitor.referringDomains = competitorLinks?.referringDomains ?? null;
    competitor.domainRank = competitorLinks?.domainRank ?? null;
  }

  const keywordGaps = buildKeywordGaps(yourKeywords, competitorKeywords);
  const pageGaps = buildPageGaps(yours.topPages, competitor.topPages);
  const sharedKeywords = buildSharedKeywords(yourKeywords, competitorKeywords);

  return {
    yourDomain,
    competitorDomain,
    locationCode,
    languageCode,
    generatedAt: new Date().toISOString(),
    includeLinks,
    apiCallsUsed,
    yours,
    competitor,
    verdict: buildVerdict(yours, competitor, includeLinks),
    keywordGaps,
    pageGaps,
    sharedKeywords,
  };
}
