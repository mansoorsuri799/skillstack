"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  RotateCcw,
  Search,
} from "lucide-react";
import { OrganicSearchLayout } from "@/components/dashboard/OrganicSearchLayout";
import { ToolbarMenu } from "@/components/dashboard/ToolbarMenu";
import { useOrganicSearch } from "@/components/dashboard/useOrganicSearch";
import {
  buttonGhostClass,
  CompactSelect,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  ResultsPanel,
} from "@/components/dashboard/ui";
import type { OrganicKeywordRow } from "@/lib/dataforseo/organic-search";

type KeywordsData = {
  domain: string;
  keywords: OrganicKeywordRow[];
};

type SortField = "rank" | "searchVolume" | "cpc" | "keyword";
type SortOrder = "asc" | "desc";
type PositionFilter = "all" | "top3" | "top10" | "11-20" | "21-50" | "51-100";

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

const POSITION_FILTER_OPTIONS = [
  { value: "all", label: "All Positions" },
  { value: "top3", label: "Top 3 (#1 - #3)" },
  { value: "top10", label: "Top 10 (#1 - #10)" },
  { value: "11-20", label: "Positions 11 - 20" },
  { value: "21-50", label: "Positions 21 - 50" },
  { value: "51-100", label: "Positions 51 - 100" },
] as const;

const SORT_OPTIONS = [
  { value: "rank:asc", label: "Position: #1 first (Best)" },
  { value: "rank:desc", label: "Position: High to Low" },
  { value: "searchVolume:desc", label: "Volume: High to Low" },
  { value: "searchVolume:asc", label: "Volume: Low to High" },
  { value: "cpc:desc", label: "CPC: High to Low" },
  { value: "cpc:asc", label: "CPC: Low to High" },
  { value: "keyword:asc", label: "Keyword: A to Z" },
  { value: "keyword:desc", label: "Keyword: Z to A" },
] as const;

function SortableHeader({
  label,
  field,
  activeField,
  sortOrder,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  activeField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = activeField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`group inline-flex h-5 items-center gap-1.5 text-[11px] font-semibold uppercase leading-none tracking-[0.1em] transition-colors ${
        isActive ? "text-accent" : "text-ink-muted hover:text-snow"
      } ${align === "right" ? "ml-auto" : ""}`}
      title={`Click to sort by ${label} (${
        isActive && sortOrder === "desc" ? "High to Low" : "Low to High"
      })`}
    >
      <span className="leading-none">{label}</span>
      {isActive ? (
        sortOrder === "desc" ? (
          <ArrowDown className="h-3.5 w-3.5 shrink-0 text-accent" />
        ) : (
          <ArrowUp className="h-3.5 w-3.5 shrink-0 text-accent" />
        )
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

export default function OrganicKeywordsPage() {
  const {
    domain,
    setDomain,
    locationCode,
    setLocationCode,
    scope,
    setScope,
    data,
    loading,
    error,
    analyze,
    projectLoading,
    dataForSeoConfigured,
  } = useOrganicSearch<KeywordsData>("keywords");

  // Sorting & Filtering State
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(50);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      // Default natural order: rank and keyword start asc; volume/cpc start desc
      if (field === "rank" || field === "keyword") {
        setSortOrder("asc");
      } else {
        setSortOrder("desc");
      }
    }
    setPage(0);
  }

  // Filtered & Sorted Keywords
  const filteredKeywords = useMemo(() => {
    if (!data?.keywords) return [];

    let list = [...data.keywords];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((k) => k.keyword.toLowerCase().includes(q));
    }

    // Position filter
    if (positionFilter !== "all") {
      list = list.filter((k) => {
        const rank = k.rank ?? 999;
        switch (positionFilter) {
          case "top3":
            return rank >= 1 && rank <= 3;
          case "top10":
            return rank >= 1 && rank <= 10;
          case "11-20":
            return rank >= 11 && rank <= 20;
          case "21-50":
            return rank >= 21 && rank <= 50;
          case "51-100":
            return rank >= 51 && rank <= 100;
          default:
            return true;
        }
      });
    }

    // Sorting
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "keyword") {
        const strA = (a.keyword || "").toLowerCase();
        const strB = (b.keyword || "").toLowerCase();
        return sortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }

      // Handle nulls: always push to the bottom
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const numA = Number(aVal);
      const numB = Number(bVal);

      return sortOrder === "asc" ? numA - numB : numB - numA;
    });

    return list;
  }, [data?.keywords, searchQuery, positionFilter, sortField, sortOrder]);

  // Pagination calculation
  const totalItems = filteredKeywords.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const pagedKeywords = filteredKeywords.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize,
  );

  const start = totalItems === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min((safePage + 1) * pageSize, totalItems);

  function resetFilters() {
    setSearchQuery("");
    setPositionFilter("all");
    setSortField("rank");
    setSortOrder("asc");
    setPage(0);
  }

  function exportCsv() {
    if (!filteredKeywords.length) return;
    const header = ["Keyword", "Position", "Volume", "CPC", "URL"];
    const rows = filteredKeywords.map((k) => [
      `"${(k.keyword || "").replace(/"/g, '""')}"`,
      k.rank ?? "",
      k.searchVolume ?? "",
      k.cpc ?? "",
      `"${(k.url || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `organic-keywords-${data?.domain || "report"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const isFiltered = searchQuery.trim() !== "" || positionFilter !== "all";

  return (
    <OrganicSearchLayout
      title="Organic keywords"
      description="Keywords your domain ranks for in Google organic search"
      searchDescription="See ranked keywords with position, volume, CPC, and landing URL."
      domain={domain}
      setDomain={setDomain}
      locationCode={locationCode}
      setLocationCode={setLocationCode}
      scope={scope}
      setScope={setScope}
      loading={loading}
      error={error}
      dataForSeoConfigured={dataForSeoConfigured}
      projectLoading={projectLoading}
      onAnalyze={() => void analyze()}
    >
      {loading && !data ? <LoadingBlock label="Loading organic keywords..." /> : null}

      {data ? (
        <>
          <MetricGrid className="sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              label="Keywords returned"
              value={data.keywords.length}
              icon={Search}
              featured
            />
            <MetricTile
              label="Top 3 rankings"
              value={data.keywords.filter((k) => (k.rank ?? 999) <= 3).length}
              icon={Search}
            />
            <MetricTile
              label="Top 10 rankings"
              value={data.keywords.filter((k) => (k.rank ?? 999) <= 10).length}
              icon={Search}
            />
            <MetricTile
              label="Total search volume"
              value={data.keywords.reduce((sum, k) => sum + (k.searchVolume ?? 0), 0)}
              icon={Search}
            />
          </MetricGrid>

          <ResultsPanel
            title={`Organic keywords for ${data.domain}`}
            description="Ranked keywords from DataForSEO Labs with interactive High/Low sorting and filtering."
          >
            {/* Toolbar: Search, Position Filter, Sort by Dropdown, Export */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-bg-soft/60 px-3.5 py-3 md:px-5">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                {/* Search input */}
                <div className="relative w-full sm:w-auto sm:min-w-[180px] flex-1 max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Search keywords..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(0);
                    }}
                    className={`${inputClass} !py-1.5 !pl-8 !pr-3 text-xs`}
                  />
                </div>

                {/* Position Filter Dropdown */}
                <div className="flex items-center gap-1.5">
                  <ToolbarMenu
                    size="sm"
                    minWidth="9rem"
                    menuMinWidth="12rem"
                    value={positionFilter}
                    options={[...POSITION_FILTER_OPTIONS]}
                    onChange={(value) => {
                      setPositionFilter(value as PositionFilter);
                      setPage(0);
                    }}
                  />
                </div>

                {/* Sort By Dropdown (Ahrefs High/Low selector) */}
                <div className="flex items-center gap-1.5">
                  <ToolbarMenu
                    size="sm"
                    minWidth="12.5rem"
                    menuMinWidth="14rem"
                    value={`${sortField}:${sortOrder}`}
                    options={[...SORT_OPTIONS]}
                    onChange={(value) => {
                      const [field, order] = value.split(":") as [SortField, SortOrder];
                      setSortField(field);
                      setSortOrder(order);
                      setPage(0);
                    }}
                  />
                </div>

                {isFiltered ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-accent transition-colors"
                    title="Reset filters"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-ink-muted tabular-nums">
                  Showing <strong className="text-snow">{filteredKeywords.length}</strong> of{" "}
                  {data.keywords.length}
                </span>
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={filteredKeywords.length === 0}
                  className={`${buttonGhostClass} !py-1.5 !px-2.5 text-xs disabled:opacity-40`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[700px]">
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
                      <th className="px-4 py-3 w-28">
                        <SortableHeader
                          label="Position"
                          field="rank"
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
                      <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedKeywords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-ink-muted">
                          No keywords match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      pagedKeywords.map((row, idx) => (
                        <tr
                          key={`${row.keyword}-${idx}`}
                          className="border-b border-line/50 transition hover:bg-white/[0.02] last:border-0"
                        >
                          <td className="px-4 py-3.5 font-medium text-snow">
                            {row.keyword}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-accent tabular-nums">
                            {row.rank != null ? `#${row.rank}` : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-ink-muted tabular-nums">
                            {row.searchVolume != null
                              ? row.searchVolume.toLocaleString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5 text-ink-muted tabular-nums">
                            {row.cpc != null ? `$${row.cpc.toFixed(2)}` : "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            {row.url ? (
                              <a
                                href={row.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 max-w-xs truncate text-xs text-accent hover:underline"
                                title={row.url}
                              >
                                <span className="truncate">{row.url}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                              </a>
                            ) : (
                              <span className="text-ink-muted text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-bg/60 px-4 py-3 text-xs text-ink-muted md:px-5">
                <span className="tabular-nums">
                  {totalItems === 0
                    ? "0 of 0"
                    : `${start}-${end} of ${totalItems.toLocaleString()}`}
                </span>

                <label className="flex items-center gap-2">
                  <span>Rows per page</span>
                  <CompactSelect
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(0);
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </CompactSelect>
                </label>

                <div className="flex items-center gap-2">
                  <span className="tabular-nums">
                    Page {safePage + 1} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className={`${buttonGhostClass} !py-1 !px-2 text-xs disabled:opacity-40`}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className={`${buttonGhostClass} !py-1 !px-2 text-xs disabled:opacity-40`}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </ResultsPanel>
        </>
      ) : (
        !loading && (
          <EmptyBlock
            icon={Search}
            title="Analyze organic keywords"
            description="Enter a domain and click Analyze to see keywords it ranks for."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
