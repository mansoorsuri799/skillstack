"use client";

import { useState } from "react";
import { BookmarkPlus, Search } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import {
  SearchPanel,
  SearchToolbar,
  ToolbarSelect,
} from "@/components/dashboard/SearchToolbar";
import {
  buttonGhostClass,
  DashboardAlert,
  DataTable,
  DifficultyBadge,
  EmptyBlock,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import {
  KEYWORD_LIMITS,
  KEYWORD_MODES,
  RESEARCH_LOCATIONS,
  type KeywordMode,
} from "@/lib/dashboard/locations";

type KeywordRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  difficulty: number | null;
  competition: number | null;
};

export default function KeywordsPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [seed, setSeed] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [limit, setLimit] = useState<number>(50);
  const [mode, setMode] = useState<KeywordMode>("auto");
  const [results, setResults] = useState<KeywordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function onResearch() {
    if (!seed.trim()) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/dashboard/keywords/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed, locationCode, limit, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveKeyword(row: KeywordRow) {
    setMessage("");
    const res = await fetch("/api/dashboard/keywords/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: [row] }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Save failed");
      return;
    }
    setMessage(`Saved "${row.keyword}"`);
  }

  if (projectLoading) {
    return (
      <DashboardShell title="Keyword Research">
        <LoadingBlock />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Keyword Research"
      description="Discover keyword ideas with search volume, CPC, and difficulty"
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
        {message ? <DashboardAlert variant="success">{message}</DashboardAlert> : null}

        <SearchPanel
          title="Keyword research"
          description="Discover ideas with search volume, CPC, and difficulty scores."
        >
          <SearchToolbar
            value={seed}
            onChange={setSeed}
            onSubmit={() => void onResearch()}
            placeholder="Enter a seed keyword (e.g. seo agency pakistan)"
            loading={loading}
            submitLabel="Research"
          >
            <ToolbarSelect
              label="Location"
              value={locationCode}
              onChange={(v) => setLocationCode(Number(v))}
              options={RESEARCH_LOCATIONS.map((l) => ({
                value: l.code,
                label: l.label,
              }))}
            />
            <ToolbarSelect
              label="Limit"
              value={limit}
              onChange={(v) => setLimit(Number(v))}
              options={KEYWORD_LIMITS.map((n) => ({ value: n, label: String(n) }))}
            />
            <ToolbarSelect
              label="Mode"
              value={mode}
              onChange={(v) => setMode(v as KeywordMode)}
              options={KEYWORD_MODES.map((m) => ({
                value: m.value,
                label: m.label,
              }))}
            />
          </SearchToolbar>
          {project ? (
            <p className="mt-4 text-xs text-ink-muted">
              Project language: {project.languageCode}
            </p>
          ) : null}
        </SearchPanel>

        {loading ? <LoadingBlock label="Fetching keywords from DataForSEO..." /> : null}

        {!loading && results.length === 0 ? (
          <EmptyBlock
            icon={Search}
            title="Start with a seed keyword"
            description="Pick a location, mode, and limit — we'll pull related keywords with volume, CPC, and difficulty."
          />
        ) : null}

        {results.length > 0 ? (
          <ResultsPanel
            title={`${results.length} keyword ideas`}
            description="Save keywords to your list or track them in rank monitoring."
          >
            <DataTable
              rows={results}
              rowKey={(row) => row.keyword}
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
                  key: "action",
                  header: "",
                  className: "text-right",
                  cell: (row) => (
                    <button
                      type="button"
                      onClick={() => void saveKeyword(row)}
                      className={buttonGhostClass}
                    >
                      <BookmarkPlus className="h-4 w-4" /> Save
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
