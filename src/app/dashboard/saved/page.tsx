"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bookmark, Search, Trash2, TrendingUp } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { SearchPanel } from "@/components/dashboard/SearchToolbar";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  DataTable,
  DifficultyBadge,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";

type SavedRow = {
  id: string;
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  difficulty: number | null;
};

export default function SavedKeywordsPage() {
  const [keywords, setKeywords] = useState<SavedRow[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/keywords/saved");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setKeywords(data.keywords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(id: string) {
    const res = await fetch(`/api/dashboard/keywords/saved?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) setKeywords((prev) => prev.filter((k) => k.id !== id));
  }

  async function trackKeyword(keyword: string) {
    setTracking(keyword);
    setError("");
    try {
      const res = await fetch("/api/dashboard/rank-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Track failed");
    } finally {
      setTracking(null);
    }
  }

  const filtered = keywords.filter((k) =>
    k.keyword.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <DashboardShell
      title="Saved Keywords"
      description="Your keyword list — save from research and track over time"
      actions={
        <Link href="/dashboard/keywords" className={buttonPrimaryClass}>
          <Search className="h-4 w-4" /> Research more
        </Link>
      }
    >
      <PageStack>
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        {keywords.length > 0 ? (
          <SearchPanel title="Filter keywords" description="Search your saved list.">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                className={`${inputClass} pl-10`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter saved keywords..."
              />
            </div>
          </SearchPanel>
        ) : null}

        {loading ? <LoadingBlock label="Loading saved keywords..." /> : null}

        {!loading && keywords.length === 0 ? (
          <EmptyBlock
            icon={Bookmark}
            title="No saved keywords yet"
            description="Run keyword research and click Save on keywords you want to track."
          />
        ) : null}

        {filtered.length > 0 ? (
          <ResultsPanel
            title={`${filtered.length} saved keywords`}
            description="Track rankings or remove keywords you no longer need."
          >
            <DataTable
              rows={filtered}
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
                  key: "volume",
                  header: "Volume",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.searchVolume?.toLocaleString() ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "cpc",
                  header: "CPC",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.cpc != null ? `$${row.cpc.toFixed(2)}` : "—"}
                    </span>
                  ),
                },
                {
                  key: "difficulty",
                  header: "Difficulty",
                  cell: (row) => <DifficultyBadge value={row.difficulty} />,
                },
                {
                  key: "actions",
                  header: "",
                  className: "text-right",
                  cell: (row) => (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void trackKeyword(row.keyword)}
                        disabled={tracking === row.keyword}
                        className={buttonGhostClass}
                      >
                        <TrendingUp className="h-4 w-4" />{" "}
                        {tracking === row.keyword ? "Adding..." : "Track rank"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(row.id)}
                        className={buttonGhostClass}
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  ),
                },
              ]}
            />
          </ResultsPanel>
        ) : null}

        {!loading && keywords.length > 0 && filtered.length === 0 ? (
          <EmptyBlock title="No matches" description="Try a different filter term." />
        ) : null}
      </PageStack>
    </DashboardShell>
  );
}
