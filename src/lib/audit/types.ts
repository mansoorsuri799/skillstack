export type AuditSeverity = "critical" | "high" | "medium" | "low";

export type AuditFinding = {
  severity: AuditSeverity;
  area: string;
  issue: string;
  impact: string;
};

export type SecurityHeaderCheck = {
  name: string;
  present: boolean;
  value?: string;
};

export type SecurityHeadersResult = {
  grade: string;
  scannedAt: string;
  scannedUrl: string;
  headers: SecurityHeaderCheck[];
  missing: string[];
  present: string[];
};

export type OnPagePageResult = {
  url: string;
  statusCode: number | null;
  hasH1: boolean;
  h1Tags: string[];
  title: string | null;
  metaDescription: string | null;
  onpageScore: number | null;
  brokenLinks: boolean;
};

export type CrawlIssue = {
  url: string;
  statusCode: number;
  issue: string;
};

export type LighthouseScores = {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  agenticBrowsing: { score: number; max: number };
};

export type BacklinkSnapshot = {
  domainRating: number | null;
  totalBacklinks: number | null;
  referringDomains: number | null;
  dofollow: number | null;
};

export type DomainMetricsSnapshot = {
  organicKeywords: number | null;
  organicTraffic: number | null;
  top3Rankings: number | null;
  trafficValue: number | null;
};

export type ActionPlanItem = {
  priority: number;
  action: string;
  severity: AuditSeverity;
};

export type SiteAuditReport = {
  domain: string;
  url: string;
  preparedAt: string;
  brandName: string;
  overallSecurityGrade: string;
  executiveSummary: string[];
  findings: AuditFinding[];
  securityHeaders: SecurityHeadersResult;
  onPageSeo: {
    pagesMissingH1: OnPagePageResult[];
    pagesAnalyzed: OnPagePageResult[];
  };
  crawlability: {
    issues: CrawlIssue[];
    pagesCrawled: number;
  };
  backlinks: BacklinkSnapshot;
  domainMetrics: DomainMetricsSnapshot;
  performance: {
    mobile: LighthouseScores;
    desktop: LighthouseScores;
  };
  actionPlan: ActionPlanItem[];
  lighthouseIssues: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
};
