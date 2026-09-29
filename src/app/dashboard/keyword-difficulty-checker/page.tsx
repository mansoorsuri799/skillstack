"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Gauge,
  Search,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { SearchPanel, ToolbarSelect } from "@/components/dashboard/SearchToolbar";
import { ToolbarMenu } from "@/components/dashboard/ToolbarMenu";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  DifficultyBadge,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import {
  DEFAULT_LOCATION_CODE,
  KEYWORD_RESEARCH_LOCATIONS,
} from "@/lib/dashboard/locations";
import {
  MAX_KEYWORDS,
  parseKeywordList,
  type KeywordDifficultyRow,
} from "@/lib/dataforseo/keyword-difficulty";

type SortField = "keyword" | "difficulty" | "searchVolume" | "cpc";
type SortOrder = "asc" | "desc";

type DifficultyResult = {
  keywords: KeywordDifficultyRow[];
  locationCode: number;
};

const CACHE_KEY = "ss_kd_checker_v1";

const SORT_OPTIONS = [
  { value: "difficulty:asc", label: "KD: Easy to Hard" },
  { value: "difficulty:desc", label: "KD: Hard to Easy" },
  { value: "searchVolume:desc", label: "Volume: High to Low" },
  { value: "searchVolume:asc", label: "Volume: Low to High" },
  { value: "cpc:desc", label: "CPC: High to Low" },
  { value: "keyword:asc", label: "Keyword: A to Z" },
] as const;

function SortableHeader({
  label,
  field,
  activeField,
  sortOrder,
  onSort,
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}) {
  const isActive = activeField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`group inline-flex h-5 items-center gap-1.5 text-[11px] font-semibold uppercase leading-none tracking-[0.1em] transition-colors ${
        isActive ? "text-accent" : "text-ink-muted hover:text-snow"
      }`}
    >
      <span className="leading-none">{label}</span>
      {isActive ? (
        sortOrder === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5 shrink-0 text-accent" />
        ) : (
          <ArrowUp className="h-3.5 w-3.5 shrink-0 text-accent" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-100" />
      )}
    </button>
  );
}

function readCached(): {
  keywordsText: string;
  locationCode: number;
  data: DifficultyResult;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      keywordsText: string;
      locationCode: number;
      data: DifficultyResult;
    };
  } catch {
    return null;
  }
}

function writeCached(payload: {
  keywordsText: string;
  locationCode: number;
  data: DifficultyResult;
}) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota
  }
}

export default function KeywordDifficultyCheckerPage() {
  const { dataForSeoConfigured, loading: projectLoading } = useDashboardProject();
  const cached = useMemo(() => readCached(), []);
  const [keywordsText, setKeywordsText] = useState(cached?.keywordsText ?? "");
  const [locationCode, setLocationCode] = useState(
    cached?.locationCode ?? DEFAULT_LOCATION_CODE,
  );
  const [data, setData] = useState<DifficultyResult | null>(cached?.data ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<SortField>("difficulty");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = readCached();
    if (!saved) return;
    setKeywordsText(saved.keywordsText);
    setLocationCode(saved.locationCode);
    setData(saved.data);
  }, []);

  const parsedCount = parseKeywordList(keywordsText).length;

  async function analyze() {
    const keywords = parseKeywordList(keywordsText);
    if (keywords.length === 0) {
      setError("Enter at least one keyword.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/keywords/difficulty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywords.join("\n"),
          locationCode,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      const next = json.data as DifficultyResult;
      setData(next);
      writeCached({ keywordsText, locationCode, data: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "keyword" || field === "difficulty" ? "asc" : "desc");
    }
  }

  const rows = useMemo(() => {
    if (!data?.keywords) return [];
    let list = [...data.keywords];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((row) => row.keyword.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortField === "keyword") {
        return sortOrder === "asc"
          ? a.keyword.localeCompare(b.keyword)
          : b.keyword.localeCompare(a.keyword);
      }
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      return sortOrder === "asc"
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });
    return list;
  }, [data?.keywords, searchQuery, sortField, sortOrder]);

  const avgKd =
    data?.keywords.filter((k) => k.difficulty != null).length
      ? Math.round(
          data.keywords.reduce((sum, k) => sum + (k.difficulty ?? 0), 0) /
            data.keywords.filter((k) => k.difficulty != null).length,
        )
      : null;
  const easyCount =
    data?.keywords.filter((k) => k.difficulty != null && k.difficulty < 30).length ??
    null;
  const hardCount =
    data?.keywords.filter((k) => (k.difficulty ?? 0) >= 60).length ?? null;

  function exportCsv() {
    if (!rows.length) return;
    const header = ["Keyword", "KD", "Volume", "CPC"];
    const csvRows = rows.map((row) => [
      `"${row.keyword.replace(/"/g, '""')}"`,
      row.difficulty ?? "",
      row.searchVolume ?? "",
      row.cpc ?? "",
    ]);
    const csv = [header.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "keyword-difficulty.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell
      title="Keyword Difficulty Checker"
      description="Score KD, volume, and CPC for one keyword or a bulk list"
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Keywords"
          description={`Paste up to ${MAX_KEYWORDS} keywords (one per line or comma-separated).`}
        >
          <div className="space-y-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-muted">
              <span>Keyword list</span>
              <textarea
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                rows={6}
                placeholder="Enter one keyword per line"
                className={`${inputClass} min-h-[140px] resize-y font-mono text-sm`}
                disabled={loading || projectLoading}
              />
              <span className="text-[11px] text-ink-muted">
                {parsedCount} unique keyword{parsedCount === 1 ? "" : "s"} ready
                {parsedCount >= MAX_KEYWORDS ? ` (max ${MAX_KEYWORDS})` : ""}
              </span>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <ToolbarSelect
                label="Location"
                value={locationCode}
                onChange={(v) => setLocationCode(Number(v))}
                options={KEYWORD_RESEARCH_LOCATIONS.map((l) => ({
                  value: l.code,
                  label: l.label,
                }))}
                className="sm:w-56"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => void analyze()}
                disabled={loading || parsedCount === 0}
                className={`${buttonPrimaryClass} w-full sm:w-auto`}
              >
                {loading ? "Checking..." : "Check KD"}
              </button>
            </div>
          </div>
        </SearchPanel>

        {loading && !data ? (
          <LoadingBlock label="Loading keyword difficulty..." />
        ) : null}

        {data ? (
          <>
            <MetricGrid className="sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile
                label="Keywords checked"
                value={data.keywords.length}
                icon={Search}
                featured
              />
              <MetricTile label="Average KD" value={avgKd} icon={Gauge} featured />
              <MetricTile label="Easy (KD under 30)" value={easyCount} icon={Gauge} />
              <MetricTile label="Hard (KD 60+)" value={hardCount} icon={Gauge} />
            </MetricGrid>

            <ResultsPanel
              title="Keyword difficulty results"
              description="KD score with search volume and CPC for each keyword."
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                  <div className="relative w-full sm:w-auto sm:min-w-[180px] flex-1 max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="Filter keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${inputClass} !py-1.5 !pl-8 !pr-3 text-xs`}
                    />
                  </div>
                  <ToolbarMenu
                    size="sm"
                    minWidth="11rem"
                    menuMinWidth="13rem"
                    value={`${sortField}:${sortOrder}`}
                    options={[...SORT_OPTIONS]}
                    onChange={(value) => {
                      const [field, order] = value.split(":") as [
                        SortField,
                        SortOrder,
                      ];
                      setSortField(field);
                      setSortOrder(order);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-ink-muted tabular-nums">
                    Showing <strong className="text-snow">{rows.length}</strong> of{" "}
                    {data.keywords.length}
                  </span>
                  <button
                    type="button"
                    onClick={exportCsv}
                    disabled={rows.length === 0}
                    className={`${buttonGhostClass} !py-1.5 !px-2.5 text-xs disabled:opacity-40`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-bg/80">
                      <th className="px-4 py-3">
                        <SortableHeader
                          label="Keyword"
                          field="keyword"
                          activeField={sortField}
                          sortOrder={sortOrder}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 w-36">
                        <SortableHeader
                          label="KD"
                          field="difficulty"
                          activeField={sortField}
                          sortOrder={sortOrder}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 w-28">
                        <SortableHeader
                          label="Volume"
                          field="searchVolume"
                          activeField={sortField}
                          sortOrder={sortOrder}
                          onSort={handleSort}
                        />
                      </th>
                      <th className="px-4 py-3 w-24">
                        <SortableHeader
                          label="CPC"
                          field="cpc"
                          activeField={sortField}
                          sortOrder={sortOrder}
                          onSort={handleSort}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-sm text-ink-muted"
                        >
                          No keywords match the filter.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr
                          key={row.keyword}
                          className="border-b border-line/50 transition hover:bg-white/[0.02] last:border-0"
                        >
                          <td className="px-4 py-3.5 font-medium text-snow">
                            {row.keyword}
                          </td>
                          <td className="px-4 py-3.5">
                            <DifficultyBadge value={row.difficulty} />
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-ink-muted">
                            {row.searchVolume?.toLocaleString() ?? "—"}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-ink-muted">
                            {row.cpc != null ? `$${row.cpc.toFixed(2)}` : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ResultsPanel>
          </>
        ) : (
          !loading && (
            <EmptyBlock
              icon={Gauge}
              title="Check keyword difficulty"
              description="Paste keywords and click Check KD to see difficulty, volume, and CPC."
            />
          )
        )}
      </PageStack>
    </DashboardShell>
  );
}
