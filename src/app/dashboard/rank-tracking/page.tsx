"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Plus, RefreshCw, TrendingUp } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { SearchPanel } from "@/components/dashboard/SearchToolbar";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  DataTable,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

type TrackedKeyword = {
  id: string;
  keyword: string;
  lastPosition: number | null;
  snapshots: Array<{ date: string; position: number | null; url: string }>;
};

export default function RankTrackingPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/rank-tracking");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setKeywords(data.config.keywords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function addKeyword(e: FormEvent) {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/rank-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNewKeyword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setChecking(false);
    }
  }

  async function refreshKeyword(keyword: string) {
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/rank-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setChecking(false);
    }
  }

  async function refreshAll() {
    setRefreshingAll(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/rank-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refreshAll" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setRefreshingAll(false);
    }
  }

  if (projectLoading) {
    return (
      <DashboardShell title="Rank Tracking">
        <LoadingBlock />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Rank Tracking"
      description={`Track Google positions for ${project?.domain ?? "your site"}`}
      actions={
        keywords.length > 0 ? (
          <button
            type="button"
            onClick={() => void refreshAll()}
            disabled={refreshingAll || checking}
            className={buttonGhostClass}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshingAll ? "animate-spin" : ""}`}
            />{" "}
            Refresh all
          </button>
        ) : null
      }
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Add keyword to track"
          description={`Check Google SERP positions for ${project?.domain ?? "your site"}.`}
        >
          <form onSubmit={addKeyword} className="flex flex-col gap-3 sm:flex-row">
            <input
              className={inputClass}
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Target keyword"
              required
            />
            <button type="submit" disabled={checking} className={buttonPrimaryClass}>
              {checking ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Checking...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Track & check rank
                </>
              )}
            </button>
          </form>
          <p className="mt-3 text-xs text-ink-muted">
            Or save keywords from{" "}
            <Link href="/dashboard/saved" className="text-accent hover:underline">
              Saved Keywords
            </Link>{" "}
            and track them here.
          </p>
        </SearchPanel>

        {loading ? <LoadingBlock label="Loading tracked keywords..." /> : null}

        {!loading && keywords.length === 0 ? (
          <EmptyBlock
            icon={TrendingUp}
            title="No tracked keywords"
            description="Add keywords to check their current Google ranking for your domain."
          />
        ) : null}

        {keywords.length > 0 ? (
          <ResultsPanel
            title="Tracked keywords"
            description="Refresh individual keywords or use Refresh all in the header."
          >
            <DataTable
              minWidth="720px"
              rows={keywords}
              rowKey={(row) => row.id}
              columns={[
                {
                  key: "keyword",
                  header: "Keyword",
                  cell: (row) => (
                    <span className="font-medium text-snow">{row.keyword}</span>
                  ),
                },
                {
                  key: "position",
                  header: "Position",
                  cell: (row) => (
                    <span className="text-lg font-semibold text-accent">
                      {row.lastPosition ?? "100+"}
                    </span>
                  ),
                },
                {
                  key: "date",
                  header: "Last checked",
                  cell: (row) => {
                    const latest = row.snapshots[row.snapshots.length - 1];
                    return (
                      <span className="text-ink-muted">
                        {latest?.date
                          ? new Date(latest.date).toLocaleDateString()
                          : "—"}
                      </span>
                    );
                  },
                },
                {
                  key: "url",
                  header: "Ranking URL",
                  cell: (row) => {
                    const latest = row.snapshots[row.snapshots.length - 1];
                    return (
                      <span className="block max-w-xs truncate text-xs text-ink-muted">
                        {latest?.url || "—"}
                      </span>
                    );
                  },
                },
                {
                  key: "action",
                  header: "",
                  className: "text-right",
                  cell: (row) => (
                    <button
                      type="button"
                      onClick={() => void refreshKeyword(row.keyword)}
                      disabled={checking || refreshingAll}
                      className={buttonGhostClass}
                    >
                      <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
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
