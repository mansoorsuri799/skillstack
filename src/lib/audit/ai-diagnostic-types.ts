import type { AuditSeverity } from "@/lib/audit/types";

export type AeoGeoFactor = {
  name: string;
  score: number; // 0 - 100
  status: "pass" | "warning" | "fail";
  details: string;
  recommendation: string;
};

export type SchemaItem = {
  type: string;
  status: "present" | "missing" | "incomplete";
  valid: boolean;
  description: string;
  impact: "critical" | "high" | "medium";
};

export type RobotsTxtAnalysis = {
  exists: boolean;
  url: string;
  content: string | null;
  hasSitemap: boolean;
  sitemapUrl?: string;
  blocksAiBots: boolean;
  aiBotDirectives: {
    gptBot: "allowed" | "blocked" | "default";
    googleOther: "allowed" | "blocked" | "default";
    claudeBot: "allowed" | "blocked" | "default";
    perplexityBot: "allowed" | "blocked" | "default";
  };
  issues: string[];
};

export type GoogleAlgorithmImpact = {
  updateName: string;
  date: string;
  impactLevel: "high_risk" | "moderate" | "unaffected" | "positive";
  explanation: string;
  symptoms: string[];
  remedy: string;
};

export type RankingRootCause = {
  category: "Technical" | "Content & Topical Authority" | "AEO & Schema" | "Backlink & Authority" | "User Experience & Core Web Vitals";
  severity: AuditSeverity;
  headline: string;
  whyGooglePenalizes: string;
  affectedAspect: string;
  actionableFix: string;
  impactOnRankings: string;
};

export type StrikingDistanceKeyword = {
  keyword: string;
  currentRank: number;
  searchVolume: number;
  cpc: number;
  potentialTrafficGain: number;
  missingSignal: string;
};

export type GeneratedCodeSnippet = {
  title: string;
  type: "json-ld" | "robots-txt" | "htaccess" | "meta-tags";
  description: string;
  code: string;
};

export type RecoveryStep = {
  phase: "P0 (Days 1-3: Immediate Triage)" | "P1 (Days 4-14: Structural & AEO Fixes)" | "P2 (Days 15-30: Authority & Growth)";
  title: string;
  task: string;
  expectedOutcome: string;
  effort: "Low" | "Medium" | "High";
  impact: "High" | "Critical" | "Growth";
};

export type GscDiagnostics = {
  connected: boolean;
  siteUrl?: string | null;
  clicksLast28Days?: number;
  impressionsLast28Days?: number;
  averageCtr?: number;
  averagePosition?: number;
  highImpressionLowCtrQueries?: Array<{
    query: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
    opportunity: string;
  }>;
  algorithmCorrelationNotes?: string[];
};

export type AiSiteAuditDiagnosticReport = {
  id: string;
  domain: string;
  url: string;
  analyzedAt: string;
  overallScore: number; // 0 - 100
  seoHealthScore: number;
  aeoGeoScore: number;
  technicalSecurityScore: number;
  rankabilityScore: number;
  
  executiveSummary: {
    headline: string;
    verdict: string;
    topRankingBlocker: string;
    estimatedGrowthPotential: string;
  };

  rootCauses: RankingRootCause[];
  aeoGeoFactors: AeoGeoFactor[];
  schemaAudit: {
    detectedSchemas: string[];
    missingCrucialSchemas: string[];
    schemaList: SchemaItem[];
  };
  robotsTxt: RobotsTxtAnalysis;
  googleUpdateImpacts: GoogleAlgorithmImpact[];
  strikingDistanceKeywords: StrikingDistanceKeyword[];
  gscData: GscDiagnostics;
  generatedSnippets: GeneratedCodeSnippet[];
  recoveryPlan: RecoveryStep[];
};
