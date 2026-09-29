"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  ExternalLink,
  Hash,
  Search,
  TrendingDown,
} from "lucide-react";
import { OrganicSearchLayout } from "@/components/dashboard/OrganicSearchLayout";
import { useOrganicSearch } from "@/components/dashboard/useOrganicSearch";
import {
  buttonGhostClass,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  ResultsPanel,
} from "@/components/dashboard/ui";
import type { OrganicPositionsResult } from "@/lib/dataforseo/organic-search";

type SortField = "keyword" | "searchVolume" | "rank" | "url";
type SortOrder = "asc" | "desc";

export default function OrganicPositionsPage() {
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
  } = useOrganicSearch<OrganicPositionsResult>("positions");

  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchQuery, setSearchQuery] = useState("");

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "searchVolume" ? "desc" : "asc");
    }
  }

  const rows = useMemo(() => {
    if (!data?.keywords) return [];
    let list = [...data.keywords];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (row) =>
          row.keyword.toLowerCase().includes(q) ||
          (row.url ?? "").toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortField === "keyword" || sortField === "url") {
        const aVal = (sortField === "keyword" ? a.keyword : a.url ?? "").toLowerCase();
        const bVal = (sortField === "keyword" ? b.keyword : b.url ?? "").toLowerCase();
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
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

  function exportCsv() {
    if (!rows.length) return;
    const header = ["Keyword", "Vol", "Position", "URL"];
    const csvRows = rows.map((row) => [
      `"${(row.keyword || "").replace(/"/g, '""')}"`,
      row.searchVolume ?? "",
      row.rank ?? "",
      `"${(row.url || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [header.join(","), ...csvRows.map((r) => r.join(","))].join(
      "\n",
    );
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `organic-positions-${data?.domain || "report"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OrganicSearchLayout
      title="Organic positions"
      description="Keywords your domain ranks for, with volume, position, and landing URL"
      searchDescription="See ranked keywords with search volume, position, and URL."
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
      {loading && !data ? <LoadingBlock label="Loading organic positions..." /> : null}

      {data ? (
        data.keywords.length === 0 ? (
          <EmptyBlock
            icon={TrendingDown}
            title="No organic positions found"
            description="No ranked keywords for this domain in the selected location. Try Pakistan for .pk sites, or check the exact domain (e.g. cardrummy.app)."
          />
        ) : (
          <>
            <MetricGrid className="sm:grid-cols-2 lg:grid-cols-3">
              <MetricTile
                label="Keywords"
                value={data.keywords.length}
                icon={Hash}
                featured
              />
              <MetricTile
                label="Position 1"
                value={data.keywords.filter((k) => k.rank === 1).length}
                icon={Hash}
              />
              <MetricTile
                label="Top 10"
                value={data.keywords.filter((k) => (k.rank ?? 999) <= 10).length}
                icon={Hash}
              />
            </MetricGrid>

            <ResultsPanel
              title={`Organic positions for ${data.domain}`}
              description="Keyword, search volume, SERP position, and ranking URL."
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-bg-soft/60 px-3.5 py-3 md:px-5">
                <div className="relative w-full sm:w-auto sm:min-w-[180px] flex-1 max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Filter keywords or URLs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} !py-1.5 !pl-8 !pr-3 text-xs`}
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
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-bg/80">
                      {(
                        [
                          ["keyword", "Keyword"],
                          ["searchVolume", "Vol"],
                          ["rank", "Position"],
                          ["url", "URL"],
                        ] as const
                      ).map(([field, label]) => (
                        <th key={field} className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleSort(field)}
                            className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                              sortField === field
                                ? "text-accent"
                                : "text-ink-muted hover:text-snow"
                            }`}
                          >
                            <span>{label}</span>
                            {sortField === field ? (
                              sortOrder === "desc" ? (
                                <ArrowDown className="h-3.5 w-3.5 text-accent" />
                              ) : (
                                <ArrowUp className="h-3.5 w-3.5 text-accent" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-100" />
                            )}
                          </button>
                        </th>
                      ))}
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
                      rows.map((row, idx) => (
                        <tr
                          key={`${row.keyword}-${row.url}-${idx}`}
                          className="border-b border-line/50 transition hover:bg-white/[0.02] last:border-0"
                        >
                          <td className="px-4 py-3.5 font-medium text-snow">
                            {row.keyword}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-ink-muted">
                            {row.searchVolume?.toLocaleString() ?? "—"}
                          </td>
                          <td className="px-4 py-3.5 font-semibold tabular-nums text-accent">
                            {row.rank ?? "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            {row.url ? (
                              <a
                                href={row.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-md items-center gap-1 truncate text-accent hover:underline"
                                title={row.url}
                              >
                                <span className="truncate">{row.url}</span>
                                <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                              </a>
                            ) : (
                              <span className="text-ink-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ResultsPanel>
          </>
        )
      ) : (
        !loading && (
          <EmptyBlock
            icon={TrendingDown}
            title="Analyze organic positions"
            description="Enter a domain to see ranked keywords with volume, position, and URL."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
