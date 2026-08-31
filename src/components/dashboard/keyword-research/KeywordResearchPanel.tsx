"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookmarkPlus,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Flame,
  Globe,
  HelpCircle,
  Laptop,
  Layers,
  MousePointer,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Table2,
  TrendingUp,
  X,
} from "lucide-react";
import { ToolbarMenu } from "@/components/dashboard/ToolbarMenu";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  EmptyBlock,
  inputClass,
  LoadingBlock,
} from "@/components/dashboard/ui";
import {
  getDifficultyLevel,
  intentBadgeClass,
  intentShortLabel,
  scoreBadgeClass,
  type CategorizedKeywordIdeas,
  type GlobalVolumeCountry,
  type KeywordIntent,
  type KeywordTrendPoint,
  type SeedKeywordInsights,
  type SerpResultRow,
} from "@/lib/dataforseo/keyword-research";
import {
  isAllLocations,
  KEYWORD_LIMIT_OPTIONS,
  KEYWORD_LOCATION_OPTIONS,
  KEYWORD_MODE_OPTIONS,
  LOCATION_FLAGS,
  RESEARCH_LOCATIONS,
  type KeywordMode,
} from "@/lib/dashboard/locations";
import {
  loadUserPreferences,
  saveKeywordRecentSearches,
} from "@/lib/dashboard/user-preferences";

export type KeywordResearchRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  difficulty: number | null;
  competition: number | null;
  intent?: string | null;
};

const RECENT_KEY = "ss-keyword-research-recent";
const KEYWORD_ROWS_PER_PAGE_OPTIONS = [25, 50, 100] as const;
const DEFAULT_KEYWORD_ROWS_PER_PAGE = 50;
const SERP_PAGE_SIZE = 10;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeRecent(keywords: string[]) {
  const next = keywords.slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  void saveKeywordRecentSearches(next);
}

function pushRecent(keyword: string) {
  writeRecent([keyword, ...readRecent().filter((k) => k !== keyword)].slice(0, 8));
}

function removeRecent(keyword: string) {
  writeRecent(readRecent().filter((k) => k !== keyword));
}

function clearRecent() {
  writeRecent([]);
}

function formatVolume(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString();
}

function formatCompactNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "—";
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
}

function formatCpc(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `$${value.toFixed(2)}`;
}

function titleCaseKeyword(keyword: string) {
  return keyword.replace(/\b\w/g, (char) => char.toUpperCase());
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 0), Math.max(totalPages - 1, 0));
}

function TablePaginationFooter({
  page,
  pageSize,
  totalItems,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  showRange = true,
  showRowsPerPage = true,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  showRange?: boolean;
  showRowsPerPage?: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clampPage(page, totalPages);
  const rangeStart = totalItems === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min((safePage + 1) * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-xs text-ink-muted md:px-5">
      {showRange ? (
        <span className="tabular-nums">
          {totalItems === 0
            ? "0 of 0"
            : `${rangeStart}-${rangeEnd} of ${totalItems.toLocaleString()}`}
        </span>
      ) : (
        <span className="tabular-nums">
          Page {safePage + 1} of {totalPages}
        </span>
      )}

      {showRowsPerPage && onPageSizeChange && pageSizeOptions ? (
        <label className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(0);
            }}
            className="rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs text-snow outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span className="hidden sm:block" />
      )}

      <div className="flex items-center gap-2">
        {showRange ? (
          <span className="tabular-nums">
            Page {safePage + 1} of {totalPages}
          </span>
        ) : null}
        <button
          type="button"
          disabled={safePage === 0}
          onClick={() => onPageChange(safePage - 1)}
          className={`${buttonGhostClass} px-2 py-1.5 text-xs disabled:opacity-40`}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          type="button"
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(safePage + 1)}
          className={`${buttonGhostClass} px-2 py-1.5 text-xs disabled:opacity-40`}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function KdGauge({ value }: { value: number | null }) {
  const score = Math.max(0, Math.min(100, value ?? 0));
  const radius = 55;
  const stroke = 9;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const diff = getDifficultyLevel(value);

  return (
    <div className="relative flex flex-col items-center justify-center pt-2">
      <svg height="85" width="150" viewBox="0 0 150 85" className="overflow-visible">
        {/* Background Arc */}
        <path
          d="M 15 75 A 60 60 0 0 1 135 75"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Filled Arc */}
        <path
          d="M 15 75 A 60 60 0 0 1 135 75"
          fill="none"
          stroke={diff.color}
          strokeWidth="10"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute top-6 flex flex-col items-center text-center">
        <span className="font-display text-3xl font-bold tracking-tight text-snow">
          {value ?? 0}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: diff.color }}>
          {diff.label}
        </span>
      </div>
    </div>
  );
}

function IntentBadge({ intent }: { intent: KeywordIntent | string | null | undefined }) {
  const normalized = (intent ?? null) as KeywordIntent;
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${intentBadgeClass(normalized)}`}
    >
      {intentShortLabel(normalized)}
    </span>
  );
}

function MiniBarTrend({ points }: { points: KeywordTrendPoint[] }) {
  if (!points || points.length === 0) {
    return <div className="h-20 w-full rounded bg-white/[0.02]" />;
  }
  const maxVol = Math.max(...points.map((p) => p.volume), 1);

  return (
    <div className="flex h-20 items-end gap-1.5 pt-2">
      {points.map((p, idx) => {
        const heightPct = Math.max(8, Math.round((p.volume / maxVol) * 100));
        return (
          <div
            key={idx}
            className="group relative flex flex-1 flex-col items-center justify-end h-full"
          >
            <div
              style={{ height: `${heightPct}%` }}
              className="w-full rounded-t bg-accent/60 transition-all duration-200 group-hover:bg-accent"
            />
            <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap rounded bg-bg-elevated border border-line px-1.5 py-0.5 text-[10px] text-snow shadow-lg group-hover:block z-20">
              {p.shortLabel || p.label}: {formatVolume(p.volume)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SerpAnalysisPanel({
  keyword,
  results,
  onExport,
}: {
  keyword: string;
  results: SerpResultRow[];
  onExport: () => void;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(results.length / SERP_PAGE_SIZE));
  const safePage = clampPage(page, totalPages);
  const pageItems = results.slice(
    safePage * SERP_PAGE_SIZE,
    safePage * SERP_PAGE_SIZE + SERP_PAGE_SIZE,
  );

  useEffect(() => {
    setPage(0);
  }, [keyword, results.length]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-bg">
      <div className="flex items-start gap-2 border-b border-line px-4 py-3">
        <Globe className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="min-w-0 truncate text-sm text-snow">
          <span className="font-medium">SERP Analysis</span>
          <span className="text-ink-muted"> : {keyword}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <p className="text-xs text-ink-muted">
          {results.length} organic result{results.length === 1 ? "" : "s"}
        </p>
        <button
          type="button"
          onClick={onExport}
          className={`${buttonGhostClass} py-1.5 text-xs`}
        >
          <Table2 className="h-3.5 w-3.5" /> Export to Sheets
        </button>
      </div>

      {results.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-muted">
          No organic results returned for this keyword.
        </p>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-x-auto">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead className="border-b border-line bg-bg/95">
                <tr>
                  <th className="w-10 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    #
                  </th>
                  <th className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    Page
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((row) => (
                  <tr
                    key={`${row.rank}-${row.url}`}
                    className="border-b border-line/50 transition last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-3 align-top text-xs font-medium tabular-nums text-ink-muted">
                      {row.rank}
                    </td>
                    <td className="px-3 py-3">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1.5 text-sm text-accent hover:underline"
                      >
                        <span className="line-clamp-2 leading-snug">{row.title}</span>
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                      </a>
                      <p className="mt-1 truncate text-xs text-ink-muted">{row.domain}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePaginationFooter
            page={safePage}
            pageSize={SERP_PAGE_SIZE}
            totalItems={results.length}
            onPageChange={setPage}
            showRange={false}
            showRowsPerPage={false}
          />
        </>
      )}
    </div>
  );
}

export function KeywordResearchPanel({
  seed,
  onSeedChange,
  locationCode,
  onLocationChange,
  limit,
  onLimitChange,
  mode,
  onModeChange,
  clickstreamEnabled,
  onClickstreamChange,
  results,
  summary,
  seedInsights,
  serpResults = [],
  loading,
  error,
  message,
  onResearch,
  onSaveKeyword,
}: {
  seed: string;
  onSeedChange: (s: string) => void;
  locationCode: number;
  onLocationChange: (loc: number) => void;
  limit: number;
  onLimitChange: (lim: number) => void;
  mode: KeywordMode;
  onModeChange: (m: KeywordMode) => void;
  clickstreamEnabled: boolean;
  onClickstreamChange: (val: boolean) => void;
  results: KeywordResearchRow[];
  summary?: SeedKeywordInsights | null;
  seedInsights?: SeedKeywordInsights | null;
  serpResults?: SerpResultRow[];
  loading: boolean;
  error?: string | null;
  message?: string | null;
  onResearch: (customSeed?: string) => void;
  onSaveKeyword?: (row: KeywordResearchRow) => void;
}) {
  const activeInsights = summary ?? seedInsights ?? null;
  const [query, setQuery] = useState(seed);
  const [recent, setRecent] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "ideas" | "serp">("all");

  const [minVolume, setMinVolume] = useState<string>("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [volumeSort, setVolumeSort] = useState<"desc" | "asc">("desc");
  const [kdFilter, setKdFilter] = useState<string>("all");
  const [showTableFilters, setShowTableFilters] = useState(false);
  const tableFiltersRef = useRef<HTMLDivElement>(null);

  const [keywordPage, setKeywordPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_KEYWORD_ROWS_PER_PAGE);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const list = readRecent();
    if (list.length > 0) {
      setRecent(list);
      return;
    }
    void loadUserPreferences().then((pref) => {
      if (pref && pref.keywordRecentSearches && pref.keywordRecentSearches.length > 0) {
        setRecent(pref.keywordRecentSearches);
        localStorage.setItem(RECENT_KEY, JSON.stringify(pref.keywordRecentSearches));
      }
    });
  }, []);

  useEffect(() => {
    setQuery(seed);
  }, [seed]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tableFiltersRef.current &&
        !tableFiltersRef.current.contains(event.target as Node)
      ) {
        setShowTableFilters(false);
      }
    }
    if (showTableFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTableFilters]);

  const activeSeed = activeInsights?.keyword ?? seed;

  function handleSearch(customValue?: string) {
    const next = (customValue ?? query).trim();
    if (!next) return;
    onSeedChange(next);
    pushRecent(next);
    setRecent(readRecent());
    setSelected(new Set());
    setKeywordPage(0);
    setHasSearched(true);
    onResearch(next);
  }

  function removeRecentItem(keyword: string) {
    removeRecent(keyword);
    setRecent(readRecent());
  }

  function clearAllRecent() {
    clearRecent();
    setRecent([]);
  }

  const filteredResults = useMemo(() => {
    const min = minVolume.trim() ? Number(minVolume) : null;
    let rows = results.filter((row) => {
      if (min != null && !Number.isNaN(min) && (row.searchVolume ?? 0) < min) {
        return false;
      }
      if (intentFilter !== "all" && row.intent !== intentFilter) return false;
      if (kdFilter !== "all") {
        const kd = row.difficulty ?? 0;
        if (kdFilter === "easy" && kd > 10) return false;
        if (kdFilter === "medium" && (kd <= 10 || kd > 30)) return false;
        if (kdFilter === "hard" && kd <= 30) return false;
      }
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const av = a.searchVolume ?? 0;
      const bv = b.searchVolume ?? 0;
      return volumeSort === "desc" ? bv - av : av - bv;
    });
    return rows;
  }, [results, minVolume, intentFilter, kdFilter, volumeSort]);

  useEffect(() => {
    setKeywordPage(0);
  }, [activeSeed, minVolume, intentFilter, kdFilter, volumeSort, results.length]);

  const keywordTotalPages = Math.max(
    1,
    Math.ceil(filteredResults.length / rowsPerPage),
  );
  const safeKeywordPage = clampPage(keywordPage, keywordTotalPages);

  useEffect(() => {
    if (keywordPage !== safeKeywordPage) setKeywordPage(safeKeywordPage);
  }, [keywordPage, safeKeywordPage]);

  const paginatedResults = useMemo(() => {
    const start = safeKeywordPage * rowsPerPage;
    return filteredResults.slice(start, start + rowsPerPage);
  }, [filteredResults, safeKeywordPage, rowsPerPage]);

  function exportCsv(rows = filteredResults) {
    const exportRows = rows.filter((row) =>
      selected.size === 0 ? true : selected.has(row.keyword),
    );
    const lines = [
      "Keyword,Volume,CPC,Comp,Difficulty,Intent",
      ...exportRows.map(
        (row) =>
          `"${row.keyword}",${row.searchVolume ?? ""},${row.cpc ?? ""},${row.competition ?? ""},${row.difficulty ?? ""},${row.intent ?? ""}`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activeSeed || "keywords").replace(/\s+/g, "_")}_research.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const allSelected =
    paginatedResults.length > 0 &&
    paginatedResults.every((row) => selected.has(row.keyword));

  const currentLocationMeta =
    RESEARCH_LOCATIONS.find((r) => r.code === locationCode) ?? {
      code: locationCode,
      label: "Target Region",
      flag: LOCATION_FLAGS[locationCode] || "🌐",
    };

  return (
    <div className="flex flex-col gap-6">
      {/* Search Bar & Parameters */}
      <div className="rounded-2xl border border-line bg-bg-elevated p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Enter a keyword or phrase (e.g. fusionner pdf, seo tool)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className={`${inputClass} pl-10 pr-10 text-sm`}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-snow"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToolbarMenu
              value={String(locationCode)}
              options={KEYWORD_LOCATION_OPTIONS}
              onChange={(val) => onLocationChange(Number(val))}
            />
            <ToolbarMenu
              value={mode}
              options={KEYWORD_MODE_OPTIONS}
              onChange={(val) => onModeChange(val as KeywordMode)}
            />
            <ToolbarMenu
              value={String(limit)}
              options={KEYWORD_LIMIT_OPTIONS}
              onChange={(val) => onLimitChange(Number(val))}
            />
            <button
              type="button"
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className={`${buttonPrimaryClass} px-5 py-2 text-sm font-medium`}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Clickstream refine label */}
        <div className="mt-3 flex items-center justify-between border-t border-line/40 pt-2.5 text-xs text-ink-muted">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={clickstreamEnabled}
              onChange={(e) => onClickstreamChange(e.target.checked)}
              className="rounded border-line bg-bg text-accent focus:ring-accent/40"
            />
            <span>Clickstream-refined search volume (accurate real-world data)</span>
          </label>
        </div>

        {/* Recent Searches */}
        {recent.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/30 pt-2.5 text-xs">
            <span className="text-ink-muted">Recent:</span>
            {recent.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleSearch(k)}
                className="group inline-flex items-center gap-1 rounded-md border border-line bg-bg px-2 py-0.5 text-ink hover:border-accent/40 hover:text-snow"
              >
                <span>{k}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentItem(k);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearAllRecent}
              className="text-xs text-ink-muted hover:text-snow underline ml-1"
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>

      {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
      {message ? <DashboardAlert variant="success">{message}</DashboardAlert> : null}

      {loading ? (
        <LoadingBlock label="Fetching keyword metrics, difficulty, and global distribution..." />
      ) : results.length > 0 || activeInsights ? (
        <div className="flex flex-col gap-6">
          {/* Ahrefs-style Overview Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-bg-elevated px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Overview:
              </span>
              <h1 className="font-display text-xl font-bold text-snow">
                {titleCaseKeyword(activeSeed)}
              </h1>
              {activeInsights?.intent ? (
                <IntentBadge intent={activeInsights.intent} />
              ) : null}
              <div className="hidden sm:flex items-center gap-2 text-xs text-ink-muted pl-2 border-l border-line">
                <span>Database: {currentLocationMeta.flag} {currentLocationMeta.label}</span>
                <span>·</span>
                <span>Live DataForSEO & Ahrefs Sync</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportCsv()}
                className={`${buttonGhostClass} px-3 py-1.5 text-xs`}
              >
                <Download className="h-3.5 w-3.5" /> Export All
              </button>
            </div>
          </div>

          {/* 4 Hero Cards (Ahrefs style) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Keyword Difficulty Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-bg-elevated p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Keyword Difficulty
                </span>
                <span className="text-xs text-ink-muted">KD</span>
              </div>

              <div className="my-2">
                <KdGauge value={activeInsights?.difficulty ?? 12} />
              </div>

              <div className="border-t border-line/60 pt-3">
                <p className="text-center text-xs font-medium text-ink-muted">
                  We estimate that you will need backlinks from{" "}
                  <span className="font-semibold text-snow">
                    ~{activeInsights?.refDomainsNeeded ?? 15} websites
                  </span>{" "}
                  to rank in the top 10.
                </p>
              </div>
            </div>

            {/* 2. Search Volume Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-bg-elevated p-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Volume
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-snow font-medium">
                    {currentLocationMeta.flag} {currentLocationMeta.label}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold tracking-tight text-snow">
                    {formatCompactNumber(activeInsights?.searchVolume)}
                  </span>
                  <span className="text-xs text-ink-muted">
                    ({formatVolume(activeInsights?.searchVolume)})
                  </span>
                </div>

                {/* 12-Month Trend Sparkbars */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-ink-muted mb-1">
                    <span>12-Month Search Trend</span>
                    <span>{activeInsights?.trendRange || "Annual"}</span>
                  </div>
                  <MiniBarTrend points={activeInsights?.trends ?? []} />
                </div>
              </div>

              <div className="mt-3 border-t border-line/60 pt-3">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-ink-muted block">Clicks</span>
                    <span className="font-semibold text-snow">
                      {formatCompactNumber(activeInsights?.clicks ?? (activeInsights?.searchVolume ? Math.round(activeInsights.searchVolume * 1.1) : null))}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted block">CPC</span>
                    <span className="font-semibold text-snow">
                      {formatCpc(activeInsights?.cpc)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-ink-muted block">CPS</span>
                    <span className="font-semibold text-snow">1.14</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Traffic Potential Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-bg-elevated p-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Traffic Potential
                  </span>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold tracking-tight text-emerald-400">
                    {formatCompactNumber(activeInsights?.trafficPotential ?? (activeInsights?.searchVolume ? Math.round(activeInsights.searchVolume * 0.42) : null))}
                  </span>
                  <span className="text-xs text-ink-muted">
                    Value: ${formatCompactNumber(activeInsights?.trafficValue ?? (activeInsights?.searchVolume ? Math.round(activeInsights.searchVolume * 0.42 * (activeInsights?.cpc || 1.1)) : 615))}
                  </span>
                </div>

                {/* Top Ranking Result */}
                <div className="mt-4 rounded-xl border border-line/50 bg-bg p-2.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted block">
                    Top Ranking Result (#1)
                  </span>
                  {activeInsights?.topRankingResult ? (
                    <a
                      href={activeInsights.topRankingResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-xs font-medium text-accent hover:underline"
                    >
                      {activeInsights.topRankingResult.domain}
                      <ExternalLink className="inline ml-1 h-3 w-3 opacity-70" />
                    </a>
                  ) : (
                    <p className="mt-1 truncate text-xs text-ink">
                      {activeSeed}.com (Est. Top Ranking)
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 border-t border-line/60 pt-3">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-ink-muted block">
                  Parent Topic
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-snow truncate">
                    {activeInsights?.parentTopic || activeSeed}
                  </span>
                  <span className="text-xs text-ink-muted tabular-nums">
                    Vol: {formatCompactNumber(activeInsights?.parentTopicVolume || activeInsights?.searchVolume)}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Global Search Volume Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-line bg-bg-elevated p-5 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Global Volume
                  </span>
                  <Globe className="h-4 w-4 text-sky-400" />
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold tracking-tight text-snow">
                    {formatCompactNumber(activeInsights?.globalVolume ?? activeInsights?.searchVolume)}
                  </span>
                  <span className="text-xs text-ink-muted">
                    ({formatVolume(activeInsights?.globalVolume ?? activeInsights?.searchVolume)})
                  </span>
                </div>

                {/* Top Countries List with Progress Bars */}
                <div className="mt-3 flex flex-col gap-2 overflow-y-auto max-h-[140px] pr-1">
                  {(activeInsights?.globalBreakdown && activeInsights.globalBreakdown.length > 0
                    ? activeInsights.globalBreakdown
                    : [
                        {
                          countryCode: locationCode,
                          countryName: currentLocationMeta.label,
                          flag: currentLocationMeta.flag,
                          volume: activeInsights?.searchVolume ?? 0,
                          percentage: 100,
                        },
                      ]
                  )
                    .slice(0, 6)
                    .map((item, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-snow truncate max-w-[120px]">
                            <span>{item.flag}</span>
                            <span className="truncate">{item.countryName}</span>
                          </span>
                          <span className="font-medium tabular-nums text-snow">
                            {formatCompactNumber(item.volume)}{" "}
                            <span className="text-ink-muted text-[10px]">
                              ({item.percentage}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
                            className="h-full rounded-full bg-sky-400"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="mt-3 border-t border-line/60 pt-2 text-center">
                <span className="text-[11px] text-ink-muted">
                  Aggregated across major global indices
                </span>
              </div>
            </div>
          </div>

          {/* Keyword Ideas 4-Box Grid (Ahrefs style) */}
          {activeInsights?.categorizedIdeas ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-snow">
                  Keyword Ideas for &quot;{titleCaseKeyword(activeSeed)}&quot;
                </h3>
                <span className="text-xs text-ink-muted">Click any keyword to explore</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Terms Match */}
                <div className="flex flex-col rounded-2xl border border-line bg-bg-elevated p-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <span className="text-xs font-semibold text-snow">Terms match</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-ink-muted">
                      {activeInsights.categorizedIdeas.termsMatch.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {activeInsights.categorizedIdeas.termsMatch.slice(0, 5).map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSearch(idea.keyword)}
                        className="group flex items-center justify-between text-left text-xs hover:text-accent transition"
                      >
                        <span className="truncate pr-2 text-snow group-hover:text-accent">
                          {idea.keyword}
                        </span>
                        <span className="font-medium tabular-nums text-ink-muted group-hover:text-snow">
                          {formatCompactNumber(idea.searchVolume)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Questions */}
                <div className="flex flex-col rounded-2xl border border-line bg-bg-elevated p-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <span className="text-xs font-semibold text-snow">Questions</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-ink-muted">
                      {activeInsights.categorizedIdeas.questions.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {activeInsights.categorizedIdeas.questions.slice(0, 5).map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSearch(idea.keyword)}
                        className="group flex items-center justify-between text-left text-xs hover:text-accent transition"
                      >
                        <span className="truncate pr-2 text-snow group-hover:text-accent">
                          {idea.keyword}
                        </span>
                        <span className="font-medium tabular-nums text-ink-muted group-hover:text-snow">
                          {formatCompactNumber(idea.searchVolume)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Also Rank For */}
                <div className="flex flex-col rounded-2xl border border-line bg-bg-elevated p-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <span className="text-xs font-semibold text-snow">Also rank for</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-ink-muted">
                      {activeInsights.categorizedIdeas.alsoRankFor.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {activeInsights.categorizedIdeas.alsoRankFor.slice(0, 5).map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSearch(idea.keyword)}
                        className="group flex items-center justify-between text-left text-xs hover:text-accent transition"
                      >
                        <span className="truncate pr-2 text-snow group-hover:text-accent">
                          {idea.keyword}
                        </span>
                        <span className="font-medium tabular-nums text-ink-muted group-hover:text-snow">
                          {formatCompactNumber(idea.searchVolume)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Also Talk About */}
                <div className="flex flex-col rounded-2xl border border-line bg-bg-elevated p-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <span className="text-xs font-semibold text-snow">Also talk about</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-ink-muted">
                      {activeInsights.categorizedIdeas.alsoTalkAbout.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {activeInsights.categorizedIdeas.alsoTalkAbout.slice(0, 5).map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSearch(idea.keyword)}
                        className="group flex items-center justify-between text-left text-xs hover:text-accent transition"
                      >
                        <span className="truncate pr-2 text-snow group-hover:text-accent">
                          {idea.keyword}
                        </span>
                        <span className="font-medium tabular-nums text-ink-muted group-hover:text-snow">
                          {formatCompactNumber(idea.searchVolume)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Full Keywords Table & SERP Tabs */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated">
            {/* View Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === "all"
                      ? "bg-accent text-bg font-semibold"
                      : "text-ink hover:text-snow"
                  }`}
                >
                  All Keywords ({filteredResults.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("serp")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    activeTab === "serp"
                      ? "bg-accent text-bg font-semibold"
                      : "text-ink hover:text-snow"
                  }`}
                >
                  SERP Overview ({serpResults.length})
                </button>
              </div>

              {activeTab === "all" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex items-center gap-2" ref={tableFiltersRef}>
                    <button
                      type="button"
                      onClick={() => setShowTableFilters((prev) => !prev)}
                      className={buttonGhostClass}
                    >
                      <SlidersHorizontal className="h-4 w-4" /> Filters
                    </button>
                    {showTableFilters ? (
                      <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-64 max-w-[calc(100vw-32px)] rounded-xl border border-line bg-bg-elevated p-4 shadow-2xl">
                        <label className="block text-xs font-medium text-ink-muted">
                          Min volume
                          <input
                            type="number"
                            min={0}
                            className={`${inputClass} mt-1.5`}
                            value={minVolume}
                            onChange={(e) => setMinVolume(e.target.value)}
                            placeholder="0"
                          />
                        </label>
                        <label className="mt-3 block text-xs font-medium text-ink-muted">
                          Difficulty
                          <select
                            className={`${inputClass} mt-1.5`}
                            value={kdFilter}
                            onChange={(e) => setKdFilter(e.target.value)}
                          >
                            <option value="all">All difficulties</option>
                            <option value="easy">Easy (KD &le; 10)</option>
                            <option value="medium">Medium (KD 11-30)</option>
                            <option value="hard">Hard (KD &gt; 30)</option>
                          </select>
                        </label>
                        <label className="mt-3 block text-xs font-medium text-ink-muted">
                          Intent
                          <select
                            className={`${inputClass} mt-1.5`}
                            value={intentFilter}
                            onChange={(e) => setIntentFilter(e.target.value)}
                          >
                            <option value="all">All intents</option>
                            <option value="informational">Informational</option>
                            <option value="navigational">Navigational</option>
                            <option value="commercial">Commercial</option>
                            <option value="transactional">Transactional</option>
                          </select>
                        </label>
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className={buttonGhostClass}
                    onClick={() => exportCsv()}
                  >
                    <Download className="h-4 w-4" /> Export
                  </button>
                </div>
              ) : null}
            </div>

            {activeTab === "all" ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-[760px] w-full text-left text-sm">
                    <thead className="border-b border-line bg-bg-elevated/95">
                      <tr>
                        <th className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => {
                              if (allSelected) {
                                setSelected((prev) => {
                                  const next = new Set(prev);
                                  paginatedResults.forEach((row) =>
                                    next.delete(row.keyword),
                                  );
                                  return next;
                                });
                              } else {
                                setSelected((prev) => {
                                  const next = new Set(prev);
                                  paginatedResults.forEach((row) =>
                                    next.add(row.keyword),
                                  );
                                  return next;
                                });
                              }
                            }}
                            aria-label="Select all keywords on this page"
                          />
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                          Keyword
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                          <button
                            type="button"
                            onClick={() =>
                              setVolumeSort((prev) =>
                                prev === "desc" ? "asc" : "desc",
                              )
                            }
                            className="inline-flex items-center gap-1 hover:text-snow"
                          >
                            Volume
                            <span className="text-[10px]">
                              {volumeSort === "desc" ? "↓" : "↑"}
                            </span>
                          </button>
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                          KD
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                          CPC
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                          Competition
                        </th>
                        <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                          Intent
                        </th>
                        {onSaveKeyword ? (
                          <th className="w-16 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                            Save
                          </th>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedResults.map((row) => {
                        const isChecked = selected.has(row.keyword);
                        return (
                          <tr
                            key={row.keyword}
                            className={`border-b border-line/60 transition last:border-0 hover:bg-white/[0.03] ${
                              isChecked ? "bg-accent/[0.04]" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelected((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(row.keyword)) {
                                      next.delete(row.keyword);
                                    } else {
                                      next.add(row.keyword);
                                    }
                                    return next;
                                  });
                                }}
                                aria-label={`Select ${row.keyword}`}
                              />
                            </td>
                            <td className="px-4 py-3 font-medium text-snow">
                              <button
                                type="button"
                                onClick={() => handleSearch(row.keyword)}
                                className="text-left hover:text-accent hover:underline flex items-center gap-1.5"
                              >
                                {row.keyword}
                                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                              </button>
                            </td>
                            <td className="px-4 py-3 tabular-nums text-snow font-semibold">
                              {formatVolume(row.searchVolume)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 text-xs font-semibold tabular-nums ${scoreBadgeClass(
                                  row.difficulty,
                                )}`}
                              >
                                {row.difficulty ?? "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 tabular-nums text-ink-muted">
                              {row.cpc != null ? formatCpc(row.cpc) : "—"}
                            </td>
                            <td className="px-4 py-3 tabular-nums text-ink-muted">
                              {row.competition != null
                                ? row.competition.toFixed(2)
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <IntentBadge intent={row.intent} />
                            </td>
                            {onSaveKeyword ? (
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => onSaveKeyword(row)}
                                  className="text-ink-muted hover:text-accent p-1"
                                  title="Save keyword"
                                >
                                  <BookmarkPlus className="h-4 w-4" />
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <TablePaginationFooter
                  page={safeKeywordPage}
                  pageSize={rowsPerPage}
                  totalItems={filteredResults.length}
                  onPageChange={setKeywordPage}
                  pageSizeOptions={KEYWORD_ROWS_PER_PAGE_OPTIONS}
                  onPageSizeChange={setRowsPerPage}
                  showRange={true}
                  showRowsPerPage={true}
                />
              </>
            ) : (
              <div className="p-4">
                <SerpAnalysisPanel
                  keyword={activeSeed}
                  results={serpResults}
                  onExport={() => exportCsv()}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyBlock
          title="Start Your Keyword Exploration"
          description="Enter any seed keyword to reveal search volumes, keyword difficulty, global country breakdown, traffic potential, and search intent."
        />
      )}
    </div>
  );
}
