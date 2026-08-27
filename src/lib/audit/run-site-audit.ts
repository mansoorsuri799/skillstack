import { normalizeDomain } from "@/lib/dataforseo/client";
import {
  getBacklinksSummary,
  getDomainOverview,
} from "@/lib/dataforseo/services";
import { probeCrawlability } from "@/lib/audit/crawlability";
import { runLighthouseScores } from "@/lib/audit/lighthouse";
import { analyzePagesOnPage } from "@/lib/audit/on-page";
import { buildSiteAuditReport } from "@/lib/audit/report-builder";
import { scanSecurityHeaders } from "@/lib/audit/security-headers";
import type { SiteAuditReport } from "@/lib/audit/types";

function normalizeAuditUrl(domain: string): string {
  const trimmed = domain.trim();
  if (trimmed.startsWith("http")) return trimmed.replace(/\/$/, "");
  return `https://${trimmed.replace(/^www\./i, "")}`;
}

export async function runFullSiteAudit(
  domainInput: string,
  brandName = "SkillStack",
): Promise<SiteAuditReport> {
  const domain = normalizeDomain(domainInput);
  const url = normalizeAuditUrl(domainInput);

  const securityHeaders = await scanSecurityHeaders(url);

  let domainOverview;
  try {
    domainOverview = await getDomainOverview(domain);
  } catch {
    domainOverview = {
      domain,
      organicTraffic: null,
      organicKeywords: null,
      topPositions: { pos1: null, pos2_3: null, pos4_10: null },
      topKeywords: [],
      topPages: [],
    };
  }

  const pageUrls = [
    url,
    ...domainOverview.topPages
      .slice(0, 4)
      .map((p) => p.url)
      .filter((u) => u && u !== url),
  ].slice(0, 5);

  const [onPagePages, crawlIssues, mobileLighthouse, desktopLighthouse, backlinks] =
    await Promise.all([
      analyzePagesOnPage(pageUrls),
      probeCrawlability(url, domain),
      runLighthouseScores(url, true),
      runLighthouseScores(url, false),
      getBacklinksSummary(domain).catch(() => ({
        domain,
        totalBacklinks: null,
        referringDomains: null,
        referringIps: null,
        dofollow: null,
        domainRank: null,
      })),
    ]);

  const top3 =
    (domainOverview.topPositions.pos1 ?? 0) +
    (domainOverview.topPositions.pos2_3 ?? 0);

  const trafficValue = domainOverview.topKeywords.reduce(
    (sum, kw) =>
      sum +
      (kw.searchVolume ?? 0) * (kw.cpc ?? 0) * (kw.rank && kw.rank <= 10 ? 0.03 : 0),
    0,
  );

  return buildSiteAuditReport({
    domain,
    url,
    brandName,
    securityHeaders,
    onPagePages,
    crawlIssues,
    backlinks: {
      domainRating: backlinks.domainRank,
      totalBacklinks: backlinks.totalBacklinks,
      referringDomains: backlinks.referringDomains,
      dofollow: backlinks.dofollow,
    },
    domainMetrics: {
      organicKeywords: domainOverview.organicKeywords,
      organicTraffic: domainOverview.organicTraffic,
      top3Rankings: top3 || null,
      trafficValue: trafficValue > 0 ? Math.round(trafficValue) : null,
    },
    performance: {
      mobile: mobileLighthouse.scores,
      desktop: desktopLighthouse.scores,
    },
    lighthouseIssues: [
      ...mobileLighthouse.issues.slice(0, 10),
      ...desktopLighthouse.issues.slice(0, 5),
    ],
  });
}
