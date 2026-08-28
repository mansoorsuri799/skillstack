"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  ExternalLink,
  FileText,
  Globe,
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

type SortField = "traffic" | "keywords" | "url";
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

  const [sortField, setSortField] = useState<SortField>("traffic");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  const totalTraffic = data?.pages.reduce((sum, p) => sum + (p.traffic ?? 0), 0) ?? null;

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "url" ? "asc" : "desc");
    }
  }

  const filteredPages = useMemo(() => {
    if (!data?.pages) return [];
    let list = [...data.pages];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.url.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortField === "url") {
        return sortOrder === "asc"
          ? a.url.localeCompare(b.url)
          : b.url.localeCompare(a.url);
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      return sortOrder === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return list;
  }, [data?.pages, searchQuery, sortField, sortOrder]);

  function exportCsv() {
    if (!filteredPages.length) return;
    const header = ["URL", "Est. Traffic", "Ranked Keywords"];
    const rows = filteredPages.map((p) => [
      `"${(p.url || "").replace(/"/g, '""')}"`,
      p.traffic ?? "",
      p.keywords ?? "",
    ]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
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
      description="Landing pages driving the most organic traffic"
      searchDescription="See which URLs earn the most organic visibility and keyword coverage."
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
        <>
          <MetricGrid className="sm:grid-cols-2">
            <MetricTile
              label="Pages returned"
              value={data.pages.length}
              icon={FileText}
              featured
            />
            <MetricTile
              label="Combined est. traffic"
              value={totalTraffic}
              icon={Globe}
              featured
            />
          </MetricGrid>

          <ResultsPanel
            title={`Top pages for ${data.domain}`}
            description="Pages ranked by estimated organic traffic with interactive High/Low sorting."
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg-soft/60 px-4 py-3 md:px-5">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
                <div className="relative min-w-[180px] flex-1 max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Filter URLs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} !py-1.5 !pl-8 !pr-3 text-xs`}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={`${sortField}:${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split(":") as [SortField, SortOrder];
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs text-snow outline-none transition focus:border-accent"
                  >
                    <option value="traffic:desc">Traffic: High to Low</option>
                    <option value="traffic:asc">Traffic: Low to High</option>
                    <option value="keywords:desc">Keywords: High to Low</option>
                    <option value="keywords:asc">Keywords: Low to High</option>
                    <option value="url:asc">URL: A to Z</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-ink-muted tabular-nums">
                  Showing <strong className="text-snow">{filteredPages.length}</strong> of{" "}
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
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-line bg-bg/80">
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort("url")}
                        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                          sortField === "url" ? "text-accent" : "text-ink-muted hover:text-snow"
                        }`}
                      >
                        <span>Page</span>
                        {sortField === "url" ? (
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
                    <th className="px-4 py-3 w-36">
                      <button
                        type="button"
                        onClick={() => handleSort("traffic")}
                        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                          sortField === "traffic" ? "text-accent" : "text-ink-muted hover:text-snow"
                        }`}
                      >
                        <span>Est. traffic</span>
                        {sortField === "traffic" ? (
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
                    <th className="px-4 py-3 w-32">
                      <button
                        type="button"
                        onClick={() => handleSort("keywords")}
                        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                          sortField === "keywords" ? "text-accent" : "text-ink-muted hover:text-snow"
                        }`}
                      >
                        <span>Keywords</span>
                        {sortField === "keywords" ? (
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
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-sm text-ink-muted">
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
                            className="inline-flex items-center gap-1 max-w-lg truncate text-accent hover:underline"
                            title={row.url}
                          >
                            <span className="truncate">{row.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                          </a>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-accent tabular-nums">
                          {row.traffic?.toLocaleString() ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-ink-muted tabular-nums">
                          {row.keywords?.toLocaleString() ?? "—"}
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
            icon={FileText}
            title="Analyze top pages"
            description="Enter a domain and click Analyze to discover its most visited organic pages."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
