"use client";

import { useEffect, useState } from "react";
import { Gauge, Play, ShieldAlert, Zap } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import {
  buttonPrimaryClass,
  DashboardAlert,
  DataTable,
  EmptyBlock,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

type AuditResult = {
  id: string;
  score: number;
  seoScore: number;
  issues: Array<{ type: string; severity: string; message: string; url?: string }>;
};

type AuditHistory = {
  id: string;
  status: string;
  score: number | null;
  issueCount: number;
  createdAt: string;
};

export default function SiteAuditPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [history, setHistory] = useState<AuditHistory[]>([]);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

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
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/dashboard/audit", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.audit);
      await loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setRunning(false);
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
      description={`Lighthouse-powered audit for ${project?.domain ?? "your site"}`}
      actions={
        <button
          type="button"
          onClick={() => void runAudit()}
          disabled={running}
          className={buttonPrimaryClass}
        >
          {running ? (
            "Running audit..."
          ) : (
            <>
              <Play className="h-4 w-4" /> Run audit
            </>
          )}
        </button>
      }
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
        {running ? (
          <LoadingBlock label="Running Lighthouse audit — this may take a minute..." />
        ) : null}

        {result ? (
          <>
            <MetricGrid className="sm:grid-cols-2">
              <MetricTile
                label="Performance score"
                value={result.score}
                hint="/ 100"
                icon={Zap}
                featured
              />
              <MetricTile
                label="SEO score"
                value={result.seoScore}
                hint="/ 100"
                icon={Gauge}
                featured
              />
            </MetricGrid>
            <ResultsPanel title={`${result.issues.length} issues found`}>
              <ul className="space-y-2">
                {result.issues.map((issue) => (
                  <li
                    key={issue.type}
                    className="flex items-start gap-3 rounded-xl border border-line bg-bg p-4 text-sm transition hover:border-accent/20"
                  >
                    <ShieldAlert
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        issue.severity === "critical"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-snow">{issue.message}</p>
                      <p className="mt-0.5 text-xs uppercase tracking-wide text-ink-muted">
                        {issue.severity}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </ResultsPanel>
          </>
        ) : null}

        {!running && !result ? (
          <EmptyBlock
            icon={Gauge}
            title="Audit your site"
            description="Run a Lighthouse audit to find performance, SEO, and accessibility issues."
          />
        ) : null}

        {loading ? <LoadingBlock label="Loading audit history..." /> : null}

        {history.length > 0 ? (
          <ResultsPanel title="Recent audits">
            <DataTable
              rows={history}
              rowKey={(row) => row.id}
              columns={[
                {
                  key: "date",
                  header: "Date",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {new Date(row.createdAt).toLocaleString()}
                    </span>
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
                  key: "score",
                  header: "Score",
                  cell: (row) => (
                    <span className="font-semibold text-accent">{row.score ?? "—"}</span>
                  ),
                },
                {
                  key: "issues",
                  header: "Issues",
                  cell: (row) => (
                    <span className="text-ink-muted">{row.issueCount}</span>
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
