import type {
  ActionPlanItem,
  AuditFinding,
  AuditSeverity,
  BacklinkSnapshot,
  CrawlIssue,
  DomainMetricsSnapshot,
  LighthouseScores,
  OnPagePageResult,
  SecurityHeadersResult,
  SiteAuditReport,
} from "@/lib/audit/types";
import { securityHeaderFixes } from "@/lib/audit/security-headers";

type BuildReportInput = {
  domain: string;
  url: string;
  brandName?: string;
  securityHeaders: SecurityHeadersResult;
  onPagePages: OnPagePageResult[];
  crawlIssues: CrawlIssue[];
  backlinks: BacklinkSnapshot;
  domainMetrics: DomainMetricsSnapshot;
  performance: { mobile: LighthouseScores; desktop: LighthouseScores };
  lighthouseIssues: Array<{ type: string; severity: string; message: string }>;
};

function pagesMissingH1(pages: OnPagePageResult[]) {
  return pages.filter((p) => !p.hasH1);
}

function buildFindings(input: BuildReportInput): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const { securityHeaders, onPagePages, crawlIssues, backlinks, performance } =
    input;
  const missingH1 = pagesMissingH1(onPagePages);

  if (securityHeaders.missing.length > 0) {
    findings.push({
      severity: securityHeaders.missing.length >= 4 ? "critical" : "high",
      area: "Security Headers",
      issue: `${securityHeaders.missing.length} critical HTTP security header${securityHeaders.missing.length === 1 ? "" : "s"} missing (${securityHeaders.grade} rating)`,
      impact:
        "Site exposed to clickjacking, MIME sniffing, XSS injection, and man-in-the-middle attacks.",
    });
  }

  if (missingH1.length > 0) {
    findings.push({
      severity: "high",
      area: "On Page SEO",
      issue: `H1 tag missing on ${missingH1.length} analyzed page${missingH1.length === 1 ? "" : "s"}`,
      impact:
        "Weakens topical relevance signals to Google and hurts rankings for target keywords.",
    });
  }

  for (const issue of crawlIssues) {
    findings.push({
      severity: "medium",
      area: "Technical / Crawlability",
      issue: `HTTP ${issue.statusCode} on ${issue.url.replace(/^https?:\/\/[^/]+/, "")}`,
      impact:
        "Wastes crawl budget and can appear as a broken link in audits and Search Console.",
    });
  }

  if (backlinks.domainRating != null && backlinks.domainRating < 20) {
    findings.push({
      severity: "medium",
      area: "Off Page SEO",
      issue: `Low Domain Rating (${backlinks.domainRating}) despite ${backlinks.referringDomains ?? 0} referring domains`,
      impact:
        "Limits ranking potential against stronger competitors even as content and links grow.",
    });
  }

  if (performance.mobile.agenticBrowsing.score < performance.mobile.agenticBrowsing.max) {
    findings.push({
      severity: "low",
      area: "Performance",
      issue: `Mobile Agentic Browsing readiness scored ${performance.mobile.agenticBrowsing.score} of ${performance.mobile.agenticBrowsing.max}`,
      impact:
        "Site is not fully optimized for AI browsing agents, an emerging discovery channel.",
    });
  }

  if (performance.mobile.performance < 50 || performance.desktop.performance < 50) {
    findings.push({
      severity: "high",
      area: "Performance",
      issue: `Low Lighthouse performance (mobile ${performance.mobile.performance}, desktop ${performance.desktop.performance})`,
      impact: "Slow pages hurt Core Web Vitals, rankings, and conversion rates.",
    });
  }

  const severityOrder: Record<AuditSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return findings.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );
}

function buildExecutiveSummary(
  domain: string,
  findings: AuditFinding[],
  securityGrade: string,
  performance: { mobile: LighthouseScores; desktop: LighthouseScores },
): string[] {
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;

  const perfNote =
    performance.mobile.performance >= 80 && performance.desktop.performance >= 80
      ? "The site performs well on Core Web Vitals and PageSpeed scores on both mobile and desktop"
      : "Page performance needs improvement on one or more devices";

  const securityNote =
    securityGrade === "A" || securityGrade === "B"
      ? "Security headers are largely in place"
      : securityGrade === "F"
        ? "carries a critical security gap"
        : "has room to improve HTTP security headers";

  return [
    `This report audits ${domain} across four areas: HTTP security headers, on-page SEO, technical crawlability, and site performance. ${perfNote}, but ${securityNote}${findings.length > 1 ? ` and ${findings.length - 1} additional issue${findings.length - 1 === 1 ? "" : "s"}` : ""} that need attention.`,
    criticalCount > 0 || highCount > 0
      ? `The most urgent items are ${findings
          .filter((f) => f.severity === "critical" || f.severity === "high")
          .slice(0, 2)
          .map((f) => f.issue.toLowerCase())
          .join("; ")}. Address these first since they directly affect rankings, security, or crawlability.`
      : "No critical issues were detected. Focus on medium and low priority improvements to strengthen organic visibility.",
  ];
}

function buildActionPlan(findings: AuditFinding[]): ActionPlanItem[] {
  const plan: ActionPlanItem[] = [];
  let priority = 1;

  const security = findings.find((f) => f.area === "Security Headers");
  if (security) {
    plan.push({
      priority: priority++,
      action: "Add all missing security headers site wide",
      severity: security.severity,
    });
  }

  const h1 = findings.find((f) => f.area === "On Page SEO");
  if (h1) {
    plan.push({
      priority: priority++,
      action:
        "Add H1 tags to pages missing them, then audit remaining templates site wide",
      severity: h1.severity,
    });
  }

  for (const finding of findings.filter((f) => f.area.includes("Crawlability"))) {
    plan.push({
      priority: priority++,
      action: `Fix or disable the path causing the ${finding.issue}`,
      severity: finding.severity,
    });
  }

  const offPage = findings.find((f) => f.area === "Off Page SEO");
  if (offPage) {
    plan.push({
      priority: priority++,
      action: "Continue referring domain growth targeting higher-authority sites",
      severity: offPage.severity,
    });
  }

  const agentic = findings.find(
    (f) => f.issue.includes("Agentic Browsing"),
  );
  if (agentic) {
    plan.push({
      priority: priority++,
      action: "Resolve the mobile Agentic Browsing check",
      severity: agentic.severity,
    });
  }

  if (plan.length === 0) {
    plan.push({
      priority: 1,
      action: "Maintain current SEO hygiene and re-audit monthly",
      severity: "low",
    });
  }

  return plan;
}

export function buildSiteAuditReport(input: BuildReportInput): SiteAuditReport {
  const findings = buildFindings(input);
  const missingH1 = pagesMissingH1(input.onPagePages);

  return {
    domain: input.domain,
    url: input.url,
    preparedAt: new Date().toISOString(),
    brandName: input.brandName ?? "SkillStack",
    overallSecurityGrade: input.securityHeaders.grade,
    executiveSummary: buildExecutiveSummary(
      input.domain,
      findings,
      input.securityHeaders.grade,
      input.performance,
    ),
    findings,
    securityHeaders: input.securityHeaders,
    onPageSeo: {
      pagesMissingH1: missingH1,
      pagesAnalyzed: input.onPagePages,
    },
    crawlability: {
      issues: input.crawlIssues,
      pagesCrawled: input.onPagePages.length,
    },
    backlinks: input.backlinks,
    domainMetrics: input.domainMetrics,
    performance: input.performance,
    actionPlan: buildActionPlan(findings),
    lighthouseIssues: input.lighthouseIssues,
  };
}

export function sectionFixes(report: SiteAuditReport) {
  return {
    security: securityHeaderFixes(),
    h1: [
      "Add one, and only one, H1 to each page, placed above the main content.",
      "Mirror the primary keyword in the H1, keeping it close to the title tag without duplicating it exactly.",
      "Check remaining templates site wide — a missing H1 on one page type often points to a theme issue.",
    ],
    crawl404: [
      "Find pages displaying raw email addresses and confirm whether Cloudflare email obfuscation is intended.",
      "If obfuscation is needed, ensure the Cloudflare email-decode script loads on affected pages.",
      "Replace plain text emails with mailto links or a contact form for a more reliable long-term fix.",
    ],
  };
}
