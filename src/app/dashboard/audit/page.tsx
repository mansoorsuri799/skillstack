"use client";

import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Gauge,
  Shield,
  ShieldAlert,
  Trash2,
  Zap,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { SearchPanel, SearchToolbar } from "@/components/dashboard/SearchToolbar";
import {
  buttonGhostClass,
  DashboardAlert,
  DashboardCard,
  DataTable,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import { formatAuditUrlInput } from "@/lib/audit/parse-url";
import type { SiteAuditReport } from "@/lib/audit/types";

type AuditSummary = {
  id: string;
  status: string;
  score: number | null;
  seoScore: number | null;
  securityGrade: string | null;
  issueCount: number;
  findingCount: number | null;
  targetUrl: string | null;
  createdAt: string;
};

const severityStyles: Record<string, string> = {
  critical: "text-red-400 bg-red-400/10 border-red-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  low: "text-slate-400 bg-slate-400/10 border-slate-400/20",
};

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severityStyles[severity] ?? severityStyles.low}`}
    >
      {severity}
    </span>
  );
}

function ReportSections({ report }: { report: SiteAuditReport }) {
  return (
    <>
      <DashboardCard title="Executive Summary">
        <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
          {report.executiveSummary.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
      </DashboardCard>

      <ResultsPanel title="Findings Summary" description="Prioritized issues across all audit areas">
        <DataTable
          rows={report.findings}
          rowKey={(row) => `${row.area}-${row.issue}`}
          columns={[
            {
              key: "severity",
              header: "Severity",
              cell: (row) => <SeverityBadge severity={row.severity} />,
            },
            { key: "area", header: "Area", cell: (row) => row.area },
            {
              key: "issue",
              header: "Issue",
              cell: (row) => <span className="text-snow">{row.issue}</span>,
            },
            {
              key: "impact",
              header: "Impact",
              cell: (row) => (
                <span className="text-ink-muted">{row.impact}</span>
              ),
            },
          ]}
        />
      </ResultsPanel>

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard
          title={`Security Headers — ${report.overallSecurityGrade} Rating`}
          description={`Scanned ${new Date(report.securityHeaders.scannedAt).toLocaleString()}`}
        >
          {report.securityHeaders.missing.length > 0 ? (
            <>
              <p className="mb-3 text-sm text-ink-muted">
                {report.securityHeaders.missing.length} header
                {report.securityHeaders.missing.length === 1 ? "" : "s"} missing:
              </p>
              <ul className="space-y-1.5 text-sm text-snow">
                {report.securityHeaders.missing.map((h) => (
                  <li key={h} className="flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-red-400" />
                    {h}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-accent">All six recommended security headers are present.</p>
          )}
        </DashboardCard>

        <DashboardCard title="On-Page SEO — H1 Tags">
          {report.onPageSeo.pagesMissingH1.length === 0 ? (
            <p className="text-sm text-accent">
              All {report.onPageSeo.pagesAnalyzed.length} analyzed pages include an H1.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {report.onPageSeo.pagesMissingH1.map((page) => (
                <li key={page.url} className="truncate text-snow">
                  {page.url}
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard title="Backlink Profile">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ink-muted">Domain Rating</dt>
              <dd className="font-semibold text-snow">
                {report.backlinks.domainRating ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Referring domains</dt>
              <dd className="font-semibold text-snow">
                {report.backlinks.referringDomains?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Total backlinks</dt>
              <dd className="font-semibold text-snow">
                {report.backlinks.totalBacklinks?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Organic keywords</dt>
              <dd className="font-semibold text-snow">
                {report.domainMetrics.organicKeywords?.toLocaleString() ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Top 3 rankings</dt>
              <dd className="font-semibold text-snow">
                {report.domainMetrics.top3Rankings ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted">Organic traffic (est.)</dt>
              <dd className="font-semibold text-snow">
                {report.domainMetrics.organicTraffic?.toLocaleString() ?? "—"}
              </dd>
            </div>
          </dl>
        </DashboardCard>

        <DashboardCard title="Page Performance">
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-2 font-medium text-snow">Mobile</p>
              <p className="text-ink-muted">
                Performance {report.performance.mobile.performance} · Accessibility{" "}
                {report.performance.mobile.accessibility} · Best Practices{" "}
                {report.performance.mobile.bestPractices} · SEO{" "}
                {report.performance.mobile.seo} · Agentic{" "}
                {report.performance.mobile.agenticBrowsing.score}/
                {report.performance.mobile.agenticBrowsing.max}
              </p>
            </div>
            <div>
              <p className="mb-2 font-medium text-snow">Desktop</p>
              <p className="text-ink-muted">
                Performance {report.performance.desktop.performance} · Accessibility{" "}
                {report.performance.desktop.accessibility} · Best Practices{" "}
                {report.performance.desktop.bestPractices} · SEO{" "}
                {report.performance.desktop.seo} · Agentic{" "}
                {report.performance.desktop.agenticBrowsing.score}/
                {report.performance.desktop.agenticBrowsing.max}
              </p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {report.crawlability.issues.length > 0 ? (
        <DashboardCard title="Crawlability Issues">
          <ul className="space-y-3 text-sm">
            {report.crawlability.issues.map((issue) => (
              <li key={issue.url} className="rounded-xl border border-line bg-bg p-3">
                <p className="font-medium text-snow">{issue.url}</p>
                <p className="mt-1 text-ink-muted">
                  HTTP {issue.statusCode} — {issue.issue}
                </p>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}

      <ResultsPanel title="Prioritized Action Plan">
        <DataTable
          rows={report.actionPlan}
          rowKey={(row) => String(row.priority)}
          columns={[
            {
              key: "priority",
              header: "#",
              cell: (row) => (
                <span className="font-semibold text-accent">{row.priority}</span>
              ),
            },
            {
              key: "action",
              header: "Action",
              cell: (row) => <span className="text-snow">{row.action}</span>,
            },
            {
              key: "severity",
              header: "Severity",
              cell: (row) => <SeverityBadge severity={row.severity} />,
            },
          ]}
        />
      </ResultsPanel>
    </>
  );
}

export default function SiteAuditPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [siteUrl, setSiteUrl] = useState("");
  const [history, setHistory] = useState<AuditSummary[]>([]);
  const [report, setReport] = useState<SiteAuditReport | null>(null);
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project?.domain && project.domain !== "example.com") {
      setSiteUrl(formatAuditUrlInput(project.domain));
    }
  }, [project]);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/audit");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setHistory(data.audits);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  async function runAudit() {
    if (!siteUrl.trim()) {
      setError("Enter the site URL you want to audit.");
      return;
    }

    setRunning(true);
    setError("");
    setReport(null);
    setActiveAuditId(null);
    try {
      const res = await fetch("/api/dashboard/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReport(data.audit.report);
      setActiveAuditId(data.audit.id);
      if (data.audit.report?.domain) {
        setSiteUrl(formatAuditUrlInput(data.audit.report.domain));
      }
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setRunning(false);
    }
  }

  async function loadAuditReport(id: string) {
    setError("");
    try {
      const res = await fetch(`/api/dashboard/audit/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReport(data.audit.report);
      setActiveAuditId(id);
      if (data.audit.report?.domain) {
        setSiteUrl(formatAuditUrlInput(data.audit.report.domain));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load audit");
    }
  }

  function downloadPdf() {
    if (!activeAuditId) return;
    window.open(`/api/dashboard/audit/${activeAuditId}/pdf`, "_blank");
  }

  async function removeAudit(id: string) {
    const row = history.find((item) => item.id === id);
    const label = row?.targetUrl
      ? formatAuditUrlInput(row.targetUrl)
      : "this audit";
    if (!window.confirm(`Remove audit for ${label}?`)) return;

    setRemovingId(id);
    setError("");
    try {
      const res = await fetch(`/api/dashboard/audit/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (activeAuditId === id) {
        setActiveAuditId(null);
        setReport(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove audit");
    } finally {
      setRemovingId(null);
    }
  }

  if (projectLoading) {
    return (
      <DashboardShell title="Site Audit">
        <LoadingBlock />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Site Audit"
      description="Enter a site URL, then run a full SEO and technical audit with PDF export."
      actions={
        activeAuditId && report ? (
          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-bg px-4 py-2.5 text-sm font-medium text-snow transition hover:border-accent/30"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        ) : null
      }
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Site URL"
          description="Enter the domain or full URL to audit. Example: skillstack.com.pk or https://example.com"
        >
          <SearchToolbar
            value={siteUrl}
            onChange={setSiteUrl}
            onSubmit={() => void runAudit()}
            placeholder="example.com or https://example.com"
            loading={running}
            submitLabel={running ? "Running audit..." : "Run full audit"}
          />
        </SearchPanel>

        {running ? (
          <LoadingBlock label={`Auditing ${siteUrl || "site"} — security headers, on-page SEO, backlinks, Lighthouse mobile & desktop. This may take 2–3 minutes...`} />
        ) : null}

        {report && !running ? (
          <>
            <DashboardCard
              title={report.domain}
              description={`Audited ${new Date(report.preparedAt).toLocaleString()} · ${report.url}`}
            >
              <MetricGrid className="sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile
                label="Security grade"
                value={report.overallSecurityGrade}
                icon={Shield}
                featured
              />
              <MetricTile
                label="Mobile performance"
                value={report.performance.mobile.performance}
                hint="/ 100"
                icon={Zap}
                featured
              />
              <MetricTile
                label="Mobile SEO"
                value={report.performance.mobile.seo}
                hint="/ 100"
                icon={Gauge}
              />
              <MetricTile
                label="Findings"
                value={report.findings.length}
                hint="issues"
                icon={FileText}
              />
            </MetricGrid>
            </DashboardCard>
            <ReportSections report={report} />
          </>
        ) : null}

        {loading ? <LoadingBlock label="Loading audit history..." /> : null}

        {history.length > 0 ? (
          <ResultsPanel
            title="Recent audits"
            description="Open a past report, download PDF, or remove entries you no longer need."
          >
            <DataTable
              rows={history}
              rowKey={(row) => row.id}
              columns={[
                {
                  key: "site",
                  header: "Site",
                  cell: (row) => (
                    <span className="text-snow">
                      {row.targetUrl
                        ? formatAuditUrlInput(row.targetUrl)
                        : "—"}
                    </span>
                  ),
                },
                {
                  key: "date",
                  header: "Date",
                  cell: (row) => (
                    <button
                      type="button"
                      onClick={() => void loadAuditReport(row.id)}
                      className="text-left text-ink-muted hover:text-accent"
                    >
                      {new Date(row.createdAt).toLocaleString()}
                    </button>
                  ),
                },
                {
                  key: "status",
                  header: "Status",
                  cell: (row) => (
                    <span className="capitalize text-snow">{row.status}</span>
                  ),
                },
                {
                  key: "security",
                  header: "Security",
                  cell: (row) => (
                    <span className="font-semibold text-snow">
                      {row.securityGrade ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "score",
                  header: "Perf.",
                  cell: (row) => (
                    <span className="font-semibold text-accent">{row.score ?? "—"}</span>
                  ),
                },
                {
                  key: "findings",
                  header: "Findings",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.findingCount ?? row.issueCount}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  className: "text-right",
                  cell: (row) => (
                    <div className="flex justify-end gap-2">
                      {row.status === "completed" ? (
                        <a
                          href={`/api/dashboard/audit/${row.id}/pdf`}
                          className={`${buttonGhostClass} text-accent`}
                        >
                          <Download className="h-4 w-4" /> PDF
                        </a>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void removeAudit(row.id)}
                        disabled={removingId === row.id}
                        className={buttonGhostClass}
                      >
                        <Trash2 className="h-4 w-4" />{" "}
                        {removingId === row.id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </ResultsPanel>
        ) : null}
      </PageStack>
    </DashboardShell>
  );
}
