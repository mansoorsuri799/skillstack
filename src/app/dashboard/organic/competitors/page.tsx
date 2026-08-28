"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Search,
  Users,
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
import type { OrganicCompetitorRow } from "@/lib/dataforseo/organic-search";

type CompetitorsData = {
  domain: string;
  competitors: OrganicCompetitorRow[];
};

type SortField =
  | "intersections"
  | "avgPosition"
  | "organicKeywords"
  | "organicTraffic"
  | "domain";
type SortOrder = "asc" | "desc";

export default function OrganicCompetitorsPage() {
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
  } = useOrganicSearch<CompetitorsData>("competitors");

  const [sortField, setSortField] = useState<SortField>("intersections");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "avgPosition" || field === "domain" ? "asc" : "desc");
    }
  }

  const filteredCompetitors = useMemo(() => {
    if (!data?.competitors) return [];
    let list = [...data.competitors];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => c.domain.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortField === "domain") {
        return sortOrder === "asc"
          ? a.domain.localeCompare(b.domain)
          : b.domain.localeCompare(a.domain);
      }

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      return sortOrder === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return list;
  }, [data?.competitors, searchQuery, sortField, sortOrder]);

  function exportCsv() {
    if (!filteredCompetitors.length) return;
    const header = [
      "Domain",
      "Shared Keywords",
      "Avg. Position",
      "Organic Keywords",
      "Organic Traffic",
    ];
    const rows = filteredCompetitors.map((c) => [
      `"${(c.domain || "").replace(/"/g, '""')}"`,
      c.intersections ?? "",
      c.avgPosition ?? "",
      c.organicKeywords ?? "",
      c.organicTraffic ?? "",
    ]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `competitors-${data?.domain || "report"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OrganicSearchLayout
      title="Organic competitors"
      description="Domains competing for the same organic keywords"
      searchDescription="Find overlapping competitors by shared keyword intersections in Google."
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
      {loading && !data ? <LoadingBlock label="Loading organic competitors..." /> : null}

      {data ? (
        <>
          <MetricGrid className="sm:grid-cols-2">
            <MetricTile
              label="Competitors found"
              value={data.competitors.length}
              icon={Users}
              featured
            />
            <MetricTile
              label="Top overlap"
              value={data.competitors[0]?.intersections ?? null}
              hint="shared keywords"
              icon={Users}
            />
          </MetricGrid>

          <ResultsPanel
            title={`Organic competitors for ${data.domain}`}
            description="Competitors ranked by keyword intersection with your domain."
          >
            <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-bg-soft/60 px-3.5 py-3 md:px-5">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                <div className="relative w-full sm:w-auto sm:min-w-[180px] flex-1 max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Filter domains..."
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
                    <option value="intersections:desc">Shared Keywords: High to Low</option>
                    <option value="intersections:asc">Shared Keywords: Low to High</option>
                    <option value="avgPosition:asc">Avg. Position: Best first</option>
                    <option value="avgPosition:desc">Avg. Position: High to Low</option>
                    <option value="organicKeywords:desc">Keywords: High to Low</option>
                    <option value="organicTraffic:desc">Traffic: High to Low</option>
                    <option value="domain:asc">Domain: A to Z</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs text-ink-muted tabular-nums">
                  Showing <strong className="text-snow">{filteredCompetitors.length}</strong> of{" "}
                  {data.competitors.length}
                </span>
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={filteredCompetitors.length === 0}
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
                        onClick={() => handleSort("domain")}
                        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                          sortField === "domain" ? "text-accent" : "text-ink-muted hover:text-snow"
                        }`}
                      >
                        <span>Domain</span>
                        {sortField === "domain" ? (
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
                        onClick={() => handleSort("intersections")}
                        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                          sortField === "intersections" ? "text-accent" : "text-ink-muted hover:text-snow"
                        }`}
                      >
                        <span>Shared keywords</span>
                        {sortField === "intersections" ? (
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
                        onClick={() => handleSort("avgPosition")}
                        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                          sortField === "avgPosition" ? "text-accent" : "text-ink-muted hover:text-snow"
                        }`}
                      >
                        <span>Avg. position</span>
                        {sortField === "avgPosition" ? (
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
                        onClick={() => handleSort("organicKeywords")}
                        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                          sortField === "organicKeywords" ? "text-accent" : "text-ink-muted hover:text-snow"
                        }`}
                      >
                        <span>Total keywords</span>
                        {sortField === "organicKeywords" ? (
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
                        onClick={() => handleSort("organicTraffic")}
                        className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                          sortField === "organicTraffic" ? "text-accent" : "text-ink-muted hover:text-snow"
                        }`}
                      >
                        <span>Organic traffic</span>
                        {sortField === "organicTraffic" ? (
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
                  {filteredCompetitors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm text-ink-muted">
                        No competitors match the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCompetitors.map((row, idx) => (
                      <tr
                        key={`${row.domain}-${idx}`}
                        className="border-b border-line/50 transition hover:bg-white/[0.02] last:border-0"
                      >
                        <td className="px-4 py-3.5 font-medium text-snow">{row.domain}</td>
                        <td className="px-4 py-3.5 font-semibold text-accent tabular-nums">
                          {row.intersections?.toLocaleString() ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-ink-muted tabular-nums">
                          {row.avgPosition != null ? row.avgPosition.toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-ink-muted tabular-nums">
                          {row.organicKeywords?.toLocaleString() ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-ink-muted tabular-nums">
                          {row.organicTraffic?.toLocaleString() ?? "—"}
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
            icon={Users}
            title="Analyze organic competitors"
            description="Enter a domain and click Analyze to find domains ranking for the same keywords."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
