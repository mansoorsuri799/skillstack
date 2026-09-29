"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  ExternalLink,
  FileText,
  Search,
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
import type { OrganicPageRow } from "@/lib/dataforseo/organic-search";

type PagesData = {
  domain: string;
  pages: OrganicPageRow[];
};

type SortField = "url" | "keyword" | "searchVolume" | "position";
type SortOrder = "asc" | "desc";

export default function OrganicTopPagesPage() {
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
  } = useOrganicSearch<PagesData>("pages");

  const [sortField, setSortField] = useState<SortField>("position");
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

  const filteredPages = useMemo(() => {
    if (!data?.pages) return [];
    let list = [...data.pages];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.url.toLowerCase().includes(q) ||
          p.keyword.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortField === "url" || sortField === "keyword") {
        const aVal = a[sortField].toLowerCase();
        const bVal = b[sortField].toLowerCase();
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
  }, [data?.pages, searchQuery, sortField, sortOrder]);

  function exportCsv() {
    if (!filteredPages.length) return;
    const header = ["URL", "Keyword", "Vol", "Position"];
    const rows = filteredPages.map((p) => [
      `"${(p.url || "").replace(/"/g, '""')}"`,
      `"${(p.keyword || "").replace(/"/g, '""')}"`,
      p.searchVolume ?? "",
      p.position ?? "",
    ]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join(
      "\n",
    );
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `top-pages-${data?.domain || "report"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OrganicSearchLayout
      title="Top pages"
      description="Landing pages ranked by best organic position, with top keyword and volume"
      searchDescription="See ranking URLs with their top keyword, volume, and position."
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
      {loading && !data ? <LoadingBlock label="Loading top pages..." /> : null}

      {data ? (
        data.pages.length === 0 ? (
          <EmptyBlock
            icon={FileText}
            title="No top pages found"
            description="No ranked pages for this domain in the selected location. Try Pakistan for .pk sites, or check the exact domain."
          />
        ) : (
          <>
            <MetricGrid className="sm:grid-cols-2">
              <MetricTile
                label="Pages returned"
                value={data.pages.length}
                icon={FileText}
                featured
              />
              <MetricTile
                label="Top 10 pages"
                value={
                  data.pages.filter((p) => (p.position ?? 999) <= 10).length
                }
                icon={FileText}
              />
            </MetricGrid>

            <ResultsPanel
              title={`Top pages for ${data.domain}`}
              description="URL, top keyword, search volume, and best position."
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-bg-soft/60 px-3.5 py-3 md:px-5">
                <div className="relative w-full sm:w-auto sm:min-w-[180px] flex-1 max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Filter URLs or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} !py-1.5 !pl-8 !pr-3 text-xs`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-ink-muted tabular-nums">
                    Showing{" "}
                    <strong className="text-snow">{filteredPages.length}</strong> of{" "}
                    {data.pages.length}
                  </span>
                  <button
                    type="button"
                    onClick={exportCsv}
                    disabled={filteredPages.length === 0}
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
                          ["url", "URL"],
                          ["keyword", "Keyword"],
                          ["searchVolume", "Vol"],
                          ["position", "Position"],
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
                    {filteredPages.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-sm text-ink-muted"
                        >
                          No pages match the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPages.map((row, idx) => (
                        <tr
                          key={`${row.url}-${idx}`}
                          className="border-b border-line/50 transition hover:bg-white/[0.02] last:border-0"
                        >
                          <td className="px-4 py-3.5">
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
                          </td>
                          <td className="px-4 py-3.5 font-medium text-snow">
                            {row.keyword || "—"}
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-ink-muted">
                            {row.searchVolume?.toLocaleString() ?? "—"}
                          </td>
                          <td className="px-4 py-3.5 font-semibold tabular-nums text-accent">
                            {row.position ?? "—"}
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
            icon={FileText}
            title="Analyze top pages"
            description="Enter a domain to see ranking URLs with keyword, volume, and position."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
