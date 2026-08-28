"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookmarkPlus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Globe,
  Search,
  SlidersHorizontal,
  Table2,
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
  intentBadgeClass,
  intentShortLabel,
  scoreBadgeClass,
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

function formatVolume(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString();
}

function formatCpc(value: number | null) {
  if (value === null) return "—";
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

function ScoreCircle({ value }: { value: number | null }) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums ${scoreBadgeClass(value)}`}
    >
      {value ?? "—"}
    </span>
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

function SearchTrendChart({
  points,
  range,
}: {
  points: KeywordTrendPoint[];
  range: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 340;
  const height = 190;
  const padding = { top: 16, right: 12, bottom: 36, left: 48 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const values = points.map((p) => p.volume);
  const rawMax = Math.max(...values, 1);
  const rawMin = Math.min(...values, 0);
  const niceMax = Math.ceil(rawMax / 25000) * 25000 || 25000;
  const span = niceMax - rawMin || 1;

  const coords = points.map((point, index) => {
    const x =
      padding.left +
      (points.length <= 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
    const y = padding.top + innerH - ((point.volume - rawMin) / span) * innerH;
    return { x, y, point };
  });

  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${padding.left},${padding.top + innerH} ${line} ${padding.left + innerW},${padding.top + innerH}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    ratio,
    value: Math.round(rawMin + span * (1 - ratio)),
  }));

  const active = hoverIndex != null ? coords[hoverIndex] : null;

  function handlePointerMove(clientX: number, currentTarget: SVGSVGElement) {
    if (coords.length === 0) return;
    const rect = currentTarget.getBoundingClientRect();
    const scaleX = width / rect.width;
    const mouseX = (clientX - rect.left) * scaleX;
    let closest = 0;
    let minDist = Infinity;
    coords.forEach((coord, index) => {
      const dist = Math.abs(coord.x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = index;
      }
    });
    setHoverIndex(closest);
  }

  return (
    <div className="rounded-xl border border-line bg-bg p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-snow">Search Trends</p>
        <p className="text-xs text-ink-muted">{range}</p>
      </div>
      {points.length < 2 ? (
        <p className="py-10 text-center text-sm text-ink-muted">Trend data unavailable.</p>
      ) : (
        <div className="relative">
          {active ? (
            <div
              className="pointer-events-none absolute z-10 min-w-[9rem] rounded-lg border border-line bg-bg-elevated px-3 py-2 shadow-xl"
              style={{
                left: `clamp(0px, calc(${(active.x / width) * 100}% - 4.5rem), calc(100% - 9rem))`,
                top: Math.max(0, (active.y / height) * 100 - 18),
              }}
            >
              <p className="text-sm font-medium text-snow">
                {active.point.shortLabel || active.point.label.split(" ")[0]}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Search volume :{" "}
                <span className="font-semibold text-accent">
                  {active.point.volume.toLocaleString()}
                </span>
              </p>
            </div>
          ) : null}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-48 w-full cursor-crosshair touch-none"
            onMouseMove={(e) => handlePointerMove(e.clientX, e.currentTarget)}
            onMouseLeave={() => setHoverIndex(null)}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              if (touch) handlePointerMove(touch.clientX, e.currentTarget);
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              if (touch) handlePointerMove(touch.clientX, e.currentTarget);
            }}
            onTouchEnd={() => setHoverIndex(null)}
          >
            {yTicks.map(({ ratio, value }) => {
              const y = padding.top + innerH * ratio;
              return (
                <g key={ratio}>
                  <line
                    x1={padding.left}
                    x2={padding.left + innerW}
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-ink-muted text-[9px]"
                  >
                    {value >= 1000 ? `${Math.round(value / 1000)}K` : value}
                  </text>
                </g>
              );
            })}

            {active ? (
              <line
                x1={active.x}
                x2={active.x}
                y1={padding.top}
                y2={padding.top + innerH}
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1"
              />
            ) : null}

            <polygon points={area} fill="rgba(45,212,191,0.14)" />
            <polyline
              points={line}
              fill="none"
              stroke="currentColor"
              className="text-accent"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {coords.map(({ x, y, point }, index) => {
              const isActive = hoverIndex === index;
              return (
                <g key={`${point.label}-${point.volume}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 6 : 4}
                    className={isActive ? "fill-white" : "fill-accent"}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 3.5 : 2.5}
                    className="fill-accent"
                  />
                </g>
              );
            })}
            {coords.map(({ x, point }) => (
              <text
                key={`label-${point.label}`}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="fill-ink-muted text-[9px]"
              >
                {point.shortLabel || point.label.split(" ")[0]}
              </text>
            ))}
          </svg>
        </div>
      )}
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
  seedInsights,
  serpResults,
  loading,
  error,
  message,
  onResearch,
  onSaveKeyword,
}: {
  seed: string;
  onSeedChange: (value: string) => void;
  locationCode: number;
  onLocationChange: (value: number) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  mode: KeywordMode;
  onModeChange: (value: KeywordMode) => void;
  clickstreamEnabled: boolean;
  onClickstreamChange: (value: boolean) => void;
  results: KeywordResearchRow[];
  seedInsights: SeedKeywordInsights | null;
  serpResults: SerpResultRow[];
  loading: boolean;
  error: string;
  message: string;
  onResearch: (seed?: string) => void;
  onSaveKeyword: (row: KeywordResearchRow) => void;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [recent, setRecent] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showTableFilters, setShowTableFilters] = useState(false);
  const [minVolume, setMinVolume] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [volumeSort, setVolumeSort] = useState<"desc" | "asc">("desc");
  const [keywordPage, setKeywordPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_KEYWORD_ROWS_PER_PAGE);
  const tableFiltersRef = useRef<HTMLDivElement>(null);

  const activeSeed = seed.trim();
  const summary = seedInsights;

  useEffect(() => {
    if (results.length > 0 && seed.trim()) {
      setHasSearched(true);
    }
  }, [results.length, seed]);

  useEffect(() => {
    let cancelled = false;
    void loadUserPreferences().then((prefs) => {
      if (cancelled) return;
      const local = readRecent();
      const server = prefs?.keywordRecentSearches ?? [];
      const merged = [...server, ...local.filter((k) => !server.includes(k))].slice(
        0,
        8,
      );
      setRecent(merged);
      if (merged.length > 0) {
        localStorage.setItem(RECENT_KEY, JSON.stringify(merged));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showTableFilters) return;
    function onPointerDown(event: MouseEvent) {
      if (!tableFiltersRef.current?.contains(event.target as Node)) {
        setShowTableFilters(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [showTableFilters]);

  function submitSearch(value: string) {
    const next = value.trim();
    if (!next) return;
    onSeedChange(next);
    pushRecent(next);
    setRecent(readRecent());
    setQuery("");
    setSelected(new Set());
    setKeywordPage(0);
    setHasSearched(true);
    onResearch(next);
  }

  function clearSearch() {
    onSeedChange("");
    setQuery("");
    setSelected(new Set());
    setHasSearched(false);
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
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const av = a.searchVolume ?? 0;
      const bv = b.searchVolume ?? 0;
      return volumeSort === "desc" ? bv - av : av - bv;
    });
    return rows;
  }, [results, minVolume, intentFilter, volumeSort]);

  useEffect(() => {
    setKeywordPage(0);
  }, [activeSeed, minVolume, intentFilter, volumeSort, results.length]);

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
      "Keyword,Volume,CPC,Comp,Score,Intent",
      ...exportRows.map(
        (row) =>
          `"${row.keyword}",${row.searchVolume ?? ""},${row.cpc ?? ""},${row.competition ?? ""},${row.difficulty ?? ""},${row.intent ?? ""}`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeSeed || "keywords"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportSerpCsv() {
    const lines = [
      "Rank,Title,URL,Domain",
      ...serpResults.map(
        (row) => `"${row.rank}","${row.title.replace(/"/g, '""')}","${row.url}","${row.domain}"`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeSeed || "serp"}-analysis.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const allSelected =
    paginatedResults.length > 0 &&
    paginatedResults.every((row) => selected.has(row.keyword));

  return (
    <div className="space-y-4">
      {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
      {message ? <DashboardAlert variant="success">{message}</DashboardAlert> : null}

      <div className="rounded-2xl border border-line bg-bg-elevated p-4 md:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(query || activeSeed);
          }}
          className="flex flex-col gap-3 xl:flex-row xl:items-center"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <div className="flex min-h-[44px] items-center gap-2 rounded-lg border border-line bg-bg pl-10 pr-3 focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/20">
              {activeSeed && hasSearched ? (
                <span className="inline-flex max-w-[45%] items-center gap-1 rounded-md border border-line bg-white/5 px-2 py-1 text-sm text-snow sm:max-w-[55%]">
                  <span className="truncate">{activeSeed}</span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-ink-muted hover:text-snow"
                    aria-label="Clear keyword"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ) : null}
              <input
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-snow outline-none placeholder:text-ink-muted/60"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={hasSearched ? "Search another keyword..." : "Enter a keyword..."}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <ToolbarMenu
              value={String(locationCode)}
              onChange={(v) => onLocationChange(Number(v))}
              options={KEYWORD_LOCATION_OPTIONS}
              searchable
              searchPlaceholder="Search countries"
              minWidth="10.5rem"
              disabled={loading}
            />
            <ToolbarMenu
              value={String(limit)}
              onChange={(v) => onLimitChange(Number(v))}
              options={KEYWORD_LIMIT_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              minWidth="8.5rem"
              disabled={loading}
            />
            <ToolbarMenu
              value={mode}
              onChange={(v) => onModeChange(v as KeywordMode)}
              options={KEYWORD_MODE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              minWidth="7rem"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || (!query.trim() && !activeSeed)}
              className={`${buttonPrimaryClass} col-span-2 sm:col-span-1`}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-ink-muted select-none">
          <input
            type="checkbox"
            checked={clickstreamEnabled}
            onChange={(e) => onClickstreamChange(e.target.checked)}
            className="rounded border-line bg-bg text-accent focus:ring-accent/30"
          />
          <span>Clickstream-refined search volume (accurate real-world data)</span>
        </label>

        {recent.length > 0 ? (
          <div className="mt-4 border-t border-line/60 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                <ArrowLeft className="h-3.5 w-3.5" />
                Recent searches
              </p>
              <button
                type="button"
                onClick={clearAllRecent}
                className="text-xs text-ink-muted transition hover:text-red-300"
              >
                Clear all
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {recent.slice(0, 6).map((item) => (
                <span
                  key={item}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-line bg-bg pl-3 pr-1.5 py-1 text-xs text-ink-muted"
                >
                  <button
                    type="button"
                    onClick={() => submitSearch(item)}
                    disabled={loading}
                    className="truncate transition hover:text-snow disabled:opacity-50"
                  >
                    {item}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecentItem(item)}
                    className="rounded-full p-0.5 transition hover:bg-white/10 hover:text-snow"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {loading ? <LoadingBlock label="Fetching keyword ideas and SERP data..." /> : null}

      {!loading && !hasSearched && results.length === 0 ? (
        <EmptyBlock
          icon={Search}
          title="Enter a keyword to get started"
          description="Search for a seed keyword to explore related ideas, trends, and SERP results."
        />
      ) : null}

      {results.length > 0 && !loading ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_min(360px,34%)] lg:items-start">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-bg-elevated">
            {summary ? (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-4 py-4 md:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <ScoreCircle value={summary.difficulty} />
                  <p className="truncate font-display text-lg font-semibold text-snow">
                    {titleCaseKeyword(summary.keyword)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span>
                    <span className="text-ink-muted">Vol </span>
                    <span className="font-medium tabular-nums text-snow">
                      {formatVolume(summary.searchVolume)}
                    </span>
                  </span>
                  <span>
                    <span className="text-ink-muted">CPC </span>
                    <span className="font-medium tabular-nums text-snow">
                      {summary.cpc != null ? formatCpc(summary.cpc) : "—"}
                    </span>
                  </span>
                  <span>
                    <span className="text-ink-muted">Comp </span>
                    <span className="font-medium tabular-nums text-snow">
                      {summary.competition != null
                        ? summary.competition.toFixed(2)
                        : "—"}
                    </span>
                  </span>
                  <IntentBadge intent={summary.intent} />
                </div>
              </div>
            ) : activeSeed ? (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-4 py-4 md:px-5">
                <p className="font-display text-lg font-semibold text-snow">
                  {titleCaseKeyword(activeSeed)}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 md:px-5">
              <div className="relative flex items-center gap-2" ref={tableFiltersRef}>
                <button
                  type="button"
                  onClick={() => setShowTableFilters((prev) => !prev)}
                  className={buttonGhostClass}
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                {showTableFilters ? (
                  <div className="absolute left-0 top-[calc(100%+0.5rem)] z-20 w-64 max-w-[calc(100vw-32px)] rounded-xl border border-line bg-bg-elevated p-4 shadow-2xl">
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
                <p className="text-sm text-ink-muted">
                  Showing{" "}
                  <span className="font-medium text-snow">{filteredResults.length}</span>{" "}
                  keywords
                  {isAllLocations(locationCode) ? " · all locations" : ""}
                </p>
              </div>
              <button type="button" className={buttonGhostClass} onClick={() => exportCsv()}>
                <Download className="h-4 w-4" /> Export
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
            </div>

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
                              paginatedResults.forEach((row) => next.delete(row.keyword));
                              return next;
                            });
                          } else {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              paginatedResults.forEach((row) => next.add(row.keyword));
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
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setVolumeSort((prev) => (prev === "desc" ? "asc" : "desc"))
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted transition hover:text-snow"
                      >
                        Volume
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition ${volumeSort === "asc" ? "rotate-180" : ""}`}
                        />
                      </button>
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      CPC
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      Comp.
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      Score
                    </th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                      Intent
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((row) => (
                    <tr
                      key={row.keyword}
                      className="border-b border-line/50 transition hover:bg-white/[0.02] last:border-0"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.keyword)}
                          onChange={() => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(row.keyword)) next.delete(row.keyword);
                              else next.add(row.keyword);
                              return next;
                            });
                          }}
                          aria-label={`Select ${row.keyword}`}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-snow">
                        {titleCaseKeyword(row.keyword)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-ink-muted">
                        {formatVolume(row.searchVolume)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-ink-muted">
                        {formatCpc(row.cpc)}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-ink-muted">
                        {row.competition != null ? row.competition.toFixed(2) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ScoreCircle value={row.difficulty} />
                      </td>
                      <td className="px-4 py-3">
                        <IntentBadge intent={row.intent} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSaveKeyword(row)}
                          className={buttonGhostClass}
                          title="Save keyword"
                        >
                          <BookmarkPlus className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
            />
          </div>

          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
            <SearchTrendChart
              points={summary?.trends ?? []}
              range={summary?.trendRange ?? "Last 12 months"}
            />
            <div className="flex min-h-[min(42vh,420px)] flex-col lg:min-h-[360px]">
              <SerpAnalysisPanel
                keyword={activeSeed}
                results={serpResults}
                onExport={exportSerpCsv}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
