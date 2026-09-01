"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  LineChart,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { SearchPanel, SearchToolbar, TabBar, TabPanel } from "@/components/dashboard/SearchToolbar";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  DashboardCard,
  EmptyBlock,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import type {
  AiSiteAuditDiagnosticReport,
  RankingRootCause,
} from "@/lib/audit/ai-diagnostic-types";

type AuditTab = "verdict" | "serp" | "aeo" | "technical" | "gsc" | "action-plan";

const severityColors: Record<string, string> = {
  critical: "text-red-400 bg-red-400/10 border-red-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  low: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        severityColors[severity.toLowerCase()] ?? severityColors.low
      }`}
    >
      {severity}
    </span>
  );
}

function CopyCodeBlock({ code, title, description }: { code: string; title: string; description: string }) {
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-line bg-bg-soft/80 p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-snow flex items-center gap-2">
            <Code2 className="h-4 w-4 text-accent" />
            {title}
          </p>
          <p className="text-xs text-ink-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className={`${buttonGhostClass} !py-1 !px-2.5 text-xs text-snow`}
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-bg p-3 text-xs font-mono text-[#58a6ff] leading-relaxed border border-line/60 max-h-64">
        {code}
      </pre>
    </div>
  );
}

export default function SiteAuditPage() {
  const { project, loading: projectLoading, dataForSeoConfigured } = useDashboardProject();
  const [domainInput, setDomainInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<AiSiteAuditDiagnosticReport | null>(null);
  const [activeTab, setActiveTab] = useState<AuditTab>("verdict");

  useEffect(() => {
    if (project?.domain && project.domain !== "example.com" && !domainInput) {
      setDomainInput(project.domain);
    }
  }, [project?.domain, domainInput]);

  async function runAudit() {
    const target = domainInput.trim() || project?.domain || "";
    if (!target || target === "example.com") {
      setError("Please enter a domain to run the AI site audit.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/audit/ai-diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Audit failed");
      setReport(data.report);
      setActiveTab("verdict");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed to run.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell
      title="AI Site Audit & Diagnosis"
      description="Deep technical SEO, AEO/GEO knowledge schemas, Core Web Vitals, and AI analysis of why your site is not ranking."
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Audit Target Domain"
          description="Enter your website domain to execute a full AI diagnostic crawl, AEO schema verification, and SERP root-cause analysis."
        >
          <SearchToolbar
            value={domainInput}
            onChange={setDomainInput}
            onSubmit={() => void runAudit()}
            placeholder="example.com"
            loading={loading}
            submitLabel={loading ? "Analyzing..." : "Run AI Deep Audit"}
          />
        </SearchPanel>

        {loading ? (
          <LoadingBlock label="Executing multi-layer AI crawl — analyzing robots.txt, JSON-LD Schemas, HTTP security, Core Web Vitals, and SERP ranking signals..." />
        ) : null}

        {!loading && !report ? (
          <EmptyBlock
            icon={BrainCircuit}
            title="Start an AI Site Diagnostic"
            description="Our AI system analyzes your technical infrastructure, schema markup, Google search performance, and reasons behind missing #1 Google rankings."
            action={
              <button
                type="button"
                onClick={() => void runAudit()}
                className={buttonPrimaryClass}
              >
                <Search className="h-4 w-4" /> Run Deep Audit for {domainInput || "your domain"}
              </button>
            }
          />
        ) : null}

        {report && !loading ? (
          <>
            {/* Top Score Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/[0.12] to-transparent p-3.5 sm:p-5">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                  Overall Health Score
                </p>
                <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 sm:gap-2">
                  <span className="font-display text-2xl sm:text-4xl font-bold text-snow">
                    {report.overallScore}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-ink-muted">/ 100</span>
                </div>
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-ink-muted truncate">
                  {report.overallScore >= 75 ? "Healthy foundation" : "High-priority fixes"}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-bg-elevated p-3.5 sm:p-5">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  AEO & GEO Readiness
                </p>
                <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-snow">
                    {report.aeoGeoScore}%
                  </span>
                </div>
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-ink-muted truncate">AI search visibility</p>
              </div>

              <div className="rounded-2xl border border-line bg-bg-elevated p-3.5 sm:p-5">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  SEO & Crawl Health
                </p>
                <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-snow">
                    {report.seoHealthScore}%
                  </span>
                </div>
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-ink-muted truncate">Indexation & signals</p>
              </div>

              <div className="rounded-2xl border border-line bg-bg-elevated p-3.5 sm:p-5">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                  Security Grade
                </p>
                <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-bold text-snow">
                    {report.technicalSecurityScore >= 90 ? "A+" : report.technicalSecurityScore >= 75 ? "B" : "C-"}
                  </span>
                </div>
                <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-ink-muted truncate">HTTP headers & SSL</p>
              </div>
            </div>

            {/* Executive Summary Banner */}
            <div className="rounded-2xl border border-line bg-bg-elevated p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2 text-accent font-mono text-xs uppercase tracking-wider">
                <BrainCircuit className="h-4 w-4" />
                Diagnostic Summary & Root Causes for {report.domain}
              </div>
              <h3 className="font-display text-lg font-semibold text-snow">
                {report.executiveSummary.headline}
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                {report.executiveSummary.verdict}
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs">
                <div className="rounded-lg border border-line bg-bg px-3 py-1.5">
                  <span className="text-ink-muted">Top Blocker: </span>
                  <span className="font-medium text-red-400">{report.executiveSummary.topRankingBlocker}</span>
                </div>
                <div className="rounded-lg border border-line bg-bg px-3 py-1.5">
                  <span className="text-ink-muted">Potential Gain: </span>
                  <span className="font-medium text-accent">{report.executiveSummary.estimatedGrowthPotential}</span>
                </div>
              </div>
            </div>

            {/* Tabbed Report Details */}
            <ResultsPanel title="Detailed Diagnostic Analysis" description="Explore deep findings across 6 comprehensive SEO & AEO categories.">
              <TabBar
                tabs={[
                  { id: "verdict", label: "🧠 Why Not Ranking & Root Causes" },
                  { id: "serp", label: "🔍 SERP & Striking Keywords" },
                  { id: "aeo", label: "🤖 AEO, GEO & Schemas" },
                  { id: "technical", label: "🛠️ Robots.txt & Security" },
                  { id: "gsc", label: "📈 GSC & Google Updates" },
                  { id: "action-plan", label: "🚀 30-Day Plan & Code Fixes" },
                ]}
                active={activeTab}
                onChange={(t) => setActiveTab(t as AuditTab)}
              />

              <TabPanel>
                {/* 1. WHY NOT RANKING & ROOT CAUSES */}
                {activeTab === "verdict" ? (
                  <div className="space-y-4">
                    <p className="text-xs text-ink-muted">
                      Detailed root causes identified by SkillStack AI explaining why this domain is losing rankings or failing to reach position #1 on Google.
                    </p>
                    <div className="space-y-3">
                      {report.rootCauses.map((rc, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-line bg-bg-soft/60 p-4 space-y-2 hover:border-line transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <SeverityBadge severity={rc.severity} />
                              <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                                {rc.category}
                              </span>
                            </div>
                            <span className="text-xs text-ink-muted">Affects: {rc.affectedAspect}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-snow">{rc.headline}</h4>
                          <p className="text-xs text-ink-muted leading-relaxed">
                            <strong className="text-slate-300">Why Google suppresses this: </strong>
                            {rc.whyGooglePenalizes}
                          </p>
                          <div className="rounded-lg border border-accent/20 bg-accent/[0.04] p-3 text-xs text-snow flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-accent">Actionable Fix: </strong>
                              {rc.actionableFix}
                              <div className="mt-1 text-ink-muted font-medium">Expected Impact: {rc.impactOnRankings}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* 2. SERP & STRIKING DISTANCE KEYWORDS */}
                {activeTab === "serp" ? (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-line bg-bg-soft/60 p-4 space-y-1">
                      <h4 className="text-sm font-semibold text-snow flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        Striking Distance Keywords (Position #4–#20)
                      </h4>
                      <p className="text-xs text-ink-muted">
                        These keywords already have ranking traction on Google. Applying targeted AEO and FAQ additions can push them into high-traffic Top-3 positions.
                      </p>
                    </div>

                    {report.strikingDistanceKeywords.length === 0 ? (
                      <div className="py-8 text-center text-xs text-ink-muted">
                        No immediate striking distance keywords detected. Focus on initial content clustering and schema deployment.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[650px]">
                          <thead>
                            <tr className="border-b border-line text-ink-muted">
                              <th className="py-2.5 px-3">Keyword</th>
                              <th className="py-2.5 px-3 text-center">Current Rank</th>
                              <th className="py-2.5 px-3 text-center">Search Volume</th>
                              <th className="py-2.5 px-3 text-center">CPC</th>
                              <th className="py-2.5 px-3 text-center">Est. Traffic Gain</th>
                              <th className="py-2.5 px-3">Missing Ranking Factor</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line/60">
                            {report.strikingDistanceKeywords.map((k, i) => (
                              <tr key={i} className="hover:bg-white/[0.01]">
                                <td className="py-3 px-3 font-medium text-snow">{k.keyword}</td>
                                <td className="py-3 px-3 text-center font-bold text-accent">#{k.currentRank}</td>
                                <td className="py-3 px-3 text-center tabular-nums text-ink-muted">{k.searchVolume.toLocaleString()}</td>
                                <td className="py-3 px-3 text-center tabular-nums text-ink-muted">${k.cpc.toFixed(2)}</td>
                                <td className="py-3 px-3 text-center tabular-nums text-emerald-400 font-medium">+{k.potentialTrafficGain}/mo</td>
                                <td className="py-3 px-3 text-ink-muted">{k.missingSignal}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* 3. AEO, GEO & SCHEMAS */}
                {activeTab === "aeo" ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-snow flex items-center gap-2">
                        <Bot className="h-4 w-4 text-accent" />
                        AEO & Generative Engine Factors
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {report.aeoGeoFactors.map((f, i) => (
                          <div key={i} className="rounded-xl border border-line bg-bg-soft/60 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-snow text-xs">{f.name}</span>
                              <span
                                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  f.status === "pass"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : f.status === "warning"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {f.status} ({f.score}%)
                              </span>
                            </div>
                            <p className="text-xs text-ink-muted">{f.details}</p>
                            <p className="text-xs text-accent font-medium">💡 Fix: {f.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm font-semibold text-snow">Schema.org Structured Data Audit</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[600px]">
                          <thead>
                            <tr className="border-b border-line text-ink-muted">
                              <th className="py-2.5 px-3">Schema Type</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3">Purpose & Search Benefit</th>
                              <th className="py-2.5 px-3 text-center">Impact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line/60">
                            {report.schemaAudit.schemaList.map((s, idx) => (
                              <tr key={idx}>
                                <td className="py-3 px-3 font-mono font-medium text-snow">{s.type}</td>
                                <td className="py-3 px-3 text-center">
                                  {s.status === "present" ? (
                                    <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                                      DETECTED
                                    </span>
                                  ) : (
                                    <span className="rounded bg-red-500/20 text-red-400 px-2 py-0.5 text-[10px] font-bold">
                                      MISSING
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-ink-muted">{s.description}</td>
                                <td className="py-3 px-3 text-center">
                                  <SeverityBadge severity={s.impact} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 4. TECHNICAL & ROBOTS.TXT */}
                {activeTab === "technical" ? (
                  <div className="space-y-6">
                    <div className="rounded-xl border border-line bg-bg-soft/60 p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-snow flex items-center gap-2">
                          <Globe className="h-4 w-4 text-accent" />
                          robots.txt Health & AI Crawler Directives
                        </h4>
                        <span className="text-xs text-ink-muted font-mono">{report.robotsTxt.url}</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-4 pt-1">
                        <div className="rounded-lg border border-line bg-bg p-3 text-center">
                          <p className="text-[10px] uppercase text-ink-muted">GPTBot</p>
                          <p className={`mt-1 font-bold text-xs ${report.robotsTxt.aiBotDirectives.gptBot === "allowed" ? "text-emerald-400" : "text-amber-400"}`}>
                            {report.robotsTxt.aiBotDirectives.gptBot.toUpperCase()}
                          </p>
                        </div>
                        <div className="rounded-lg border border-line bg-bg p-3 text-center">
                          <p className="text-[10px] uppercase text-ink-muted">Google-Extended</p>
                          <p className={`mt-1 font-bold text-xs ${report.robotsTxt.aiBotDirectives.googleOther === "allowed" ? "text-emerald-400" : "text-amber-400"}`}>
                            {report.robotsTxt.aiBotDirectives.googleOther.toUpperCase()}
                          </p>
                        </div>
                        <div className="rounded-lg border border-line bg-bg p-3 text-center">
                          <p className="text-[10px] uppercase text-ink-muted">ClaudeBot</p>
                          <p className={`mt-1 font-bold text-xs ${report.robotsTxt.aiBotDirectives.claudeBot === "allowed" ? "text-emerald-400" : "text-amber-400"}`}>
                            {report.robotsTxt.aiBotDirectives.claudeBot.toUpperCase()}
                          </p>
                        </div>
                        <div className="rounded-lg border border-line bg-bg p-3 text-center">
                          <p className="text-[10px] uppercase text-ink-muted">Sitemap Reference</p>
                          <p className={`mt-1 font-bold text-xs ${report.robotsTxt.hasSitemap ? "text-emerald-400" : "text-red-400"}`}>
                            {report.robotsTxt.hasSitemap ? "DECLARED" : "MISSING"}
                          </p>
                        </div>
                      </div>
                      {report.robotsTxt.issues.length > 0 ? (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200 space-y-1">
                          {report.robotsTxt.issues.map((iss, i) => (
                            <p key={i}>⚠️ {iss}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-line bg-bg-soft/60 p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-snow flex items-center gap-2">
                        <Lock className="h-4 w-4 text-accent" />
                        HTTP Security Headers & SSL Grade
                      </h4>
                      <p className="text-xs text-ink-muted">
                        Search engines require secure transport to trust website properties for top tier search positions.
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-muted">Security Score:</span>
                        <span className="font-bold text-snow">{report.technicalSecurityScore}/100</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 5. GSC & GOOGLE UPDATES */}
                {activeTab === "gsc" ? (
                  <div className="space-y-6">
                    {report.gscData.connected ? (
                      <div className="rounded-xl border border-accent/20 bg-accent/[0.04] p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-snow flex items-center gap-2">
                            <LineChart className="h-4 w-4 text-accent" />
                            Google Search Console Insights Connected ({report.gscData.siteUrl})
                          </h4>
                          <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 font-bold">LIVE SYNC</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-4">
                          <div className="rounded-lg border border-line bg-bg p-3">
                            <p className="text-[10px] text-ink-muted">Clicks (Last 28 Days)</p>
                            <p className="mt-1 text-lg font-bold text-snow">{(report.gscData.clicksLast28Days ?? 0).toLocaleString()}</p>
                          </div>
                          <div className="rounded-lg border border-line bg-bg p-3">
                            <p className="text-[10px] text-ink-muted">Impressions</p>
                            <p className="mt-1 text-lg font-bold text-snow">{(report.gscData.impressionsLast28Days ?? 0).toLocaleString()}</p>
                          </div>
                          <div className="rounded-lg border border-line bg-bg p-3">
                            <p className="text-[10px] text-ink-muted">Average CTR</p>
                            <p className="mt-1 text-lg font-bold text-accent">{report.gscData.averageCtr ?? 0}%</p>
                          </div>
                          <div className="rounded-lg border border-line bg-bg p-3">
                            <p className="text-[10px] text-ink-muted">Average Position</p>
                            <p className="mt-1 text-lg font-bold text-snow">#{report.gscData.averagePosition ?? 0}</p>
                          </div>
                        </div>

                        {report.gscData.highImpressionLowCtrQueries && report.gscData.highImpressionLowCtrQueries.length > 0 ? (
                          <div className="space-y-2 pt-2">
                            <p className="text-xs font-semibold text-snow">High Impression / Low CTR Anomaly Opportunities:</p>
                            <div className="space-y-2">
                              {report.gscData.highImpressionLowCtrQueries.map((q, i) => (
                                <div key={i} className="rounded-lg border border-line bg-bg p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <span className="font-semibold text-snow">"{q.query}"</span>
                                    <span className="text-ink-muted ml-2">({q.impressions.toLocaleString()} impr, {q.ctr}% CTR, Pos #{q.position})</span>
                                  </div>
                                  <span className="text-accent text-[11px] font-medium">{q.opportunity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-line bg-bg-soft/60 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-snow">Google Search Console Not Connected</h4>
                            <p className="text-xs text-ink-muted mt-1">
                              Link your Search Console account to unlock automated click-loss analysis and real search query CTR opportunities.
                            </p>
                          </div>
                          <Link href="/dashboard/gsc" className={buttonPrimaryClass}>
                            Connect GSC <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Google Algorithm Updates Timeline */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-snow flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-400" />
                        Google Algorithm & Core Update Chronology
                      </h4>
                      <div className="space-y-3">
                        {report.googleUpdateImpacts.map((up, i) => (
                          <div key={i} className="rounded-xl border border-line bg-bg-soft/60 p-4 space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-snow text-xs">{up.updateName}</span>
                              <span className="text-xs text-ink-muted font-mono">{up.date}</span>
                            </div>
                            <p className="text-xs text-ink-muted leading-relaxed">{up.explanation}</p>
                            <div className="rounded-lg border border-line bg-bg p-2.5 text-xs text-snow">
                              <span className="text-accent font-medium">🛡️ Recommended Protection: </span>
                              {up.remedy}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* 6. 30-DAY RECOVERY PLAN & CODE SNIPPETS */}
                {activeTab === "action-plan" ? (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-snow flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-accent" />
                        30-Day Step-by-Step Recovery & Growth Roadmap
                      </h4>
                      <div className="space-y-3">
                        {report.recoveryPlan.map((step, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-line bg-bg-soft/60 p-4 space-y-2"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="rounded bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-xs font-semibold text-accent">
                                {step.phase}
                              </span>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-ink-muted">Effort: {step.effort}</span>
                                <span className="text-ink-muted">|</span>
                                <span className="text-emerald-400 font-medium">Impact: {step.impact}</span>
                              </div>
                            </div>
                            <h5 className="text-sm font-semibold text-snow">{step.title}</h5>
                            <p className="text-xs text-ink-muted leading-relaxed">{step.task}</p>
                            <div className="text-xs text-accent font-medium">
                              🎯 Goal: {step.expectedOutcome}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <h4 className="text-sm font-semibold text-snow flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-accent" />
                        Ready-to-Paste Code Snippets for {report.domain}
                      </h4>
                      {report.generatedSnippets.map((snip, idx) => (
                        <CopyCodeBlock
                          key={idx}
                          title={snip.title}
                          description={snip.description}
                          code={snip.code}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </TabPanel>
            </ResultsPanel>
          </>
        ) : null}
      </PageStack>
    </DashboardShell>
  );
}
