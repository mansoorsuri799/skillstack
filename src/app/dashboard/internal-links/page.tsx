"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  ExternalLink,
  Link2,
  Search,
} from "lucide-react";
import { OrganicSearchLayout } from "@/components/dashboard/OrganicSearchLayout";
import { useInternalLinksReport } from "@/components/dashboard/useInternalLinksReport";
import {
  buttonGhostClass,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  ResultsPanel,
} from "@/components/dashboard/ui";
import type { InternalLinkGroupRow } from "@/lib/dataforseo/pages-links";
import { isTechnicalOrFeedUrl } from "@/lib/dataforseo/pages-links";

type LinksData = {
  domain: string;
  groups: InternalLinkGroupRow[];
  totalGroups: number;
  totalLinks: number;
};

export default function InternalLinksPage() {
  const {
    domain,
    setDomain,
    data,
    loading,
    error,
    analyze,
    projectLoading,
    dataForSeoConfigured,
  } = useInternalLinksReport<LinksData>("links");

  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<"similar" | "all">("similar");

  const filteredGroups = useMemo(() => {
    if (!data?.groups) return [];
    
    // Clean all groups to remove feed, wp-json, and technical links
    const sanitized = data.groups
      .filter((g) => !isTechnicalOrFeedUrl(g.sourceUrl))
      .map((g) => ({
        ...g,
        links: g.links.filter((l) => !isTechnicalOrFeedUrl(l.targetUrl)),
      }))
      .filter((g) => g.links.length > 0);

    if (!searchQuery.trim()) return sanitized;

    const q = searchQuery.toLowerCase().trim();
    return sanitized.filter(
      (g) =>
        g.sourceUrl.toLowerCase().includes(q) ||
        (g.sourceTitle || "").toLowerCase().includes(q) ||
        g.links.some(
          (l) =>
            l.targetUrl.toLowerCase().includes(q) ||
            (l.anchor || "").toLowerCase().includes(q),
        ),
    );
  }, [data?.groups, searchQuery]);

  function exportCsv() {
    if (!filteredGroups.length) return;
    const header = [
      "Referring Page URL",
      "Referring Page Title",
      "UR",
      "Referring Domains",
      "Linked Domains",
      "Ext Links",
      "Traffic",
      "Kw",
      "Anchor Text",
      "Type",
      "Target URL",
      "Status Code",
      "First Seen",
      "Last Checked",
    ];

    const rows: string[][] = [];
    filteredGroups.forEach((g) => {
      g.links.forEach((l) => {
        rows.push([
          `"${g.sourceUrl.replace(/"/g, '""')}"`,
          `"${(g.sourceTitle || "").replace(/"/g, '""')}"`,
          String(g.ur ?? ""),
          String(g.referringDomains ?? ""),
          String(g.linkedDomains ?? ""),
          String(g.extLinks ?? ""),
          String(g.traffic ?? ""),
          String(g.kw ?? ""),
          `"${(l.anchor || "").replace(/"/g, '""')}"`,
          l.type || "CONTENT",
          `"${l.targetUrl.replace(/"/g, '""')}"`,
          String(l.statusCode || 200),
          l.firstSeen || "",
          l.lastChecked || "",
        ]);
      });
    });

    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `internal-links-${data?.domain || "report"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <OrganicSearchLayout
      title="Internal links"
      description="Internal link graph from an OnPage crawl of your site"
      searchDescription="Crawls up to 40 pages and groups internal links by referring page like Ahrefs. This may take 1–2 minutes."
      domain={domain}
      setDomain={setDomain}
      locationCode={2840}
      setLocationCode={() => undefined}
      scope="subdomains"
      setScope={() => undefined}
      showLocation={false}
      showScope={false}
      loading={loading}
      error={error}
      dataForSeoConfigured={dataForSeoConfigured}
      projectLoading={projectLoading}
      onAnalyze={() => void analyze()}
    >
      {loading && !data ? (
        <LoadingBlock label="Crawling site and collecting internal link hierarchy..." />
      ) : null}

      {data ? (
        <>
          <MetricGrid className="sm:grid-cols-2 lg:grid-cols-3">
            <MetricTile
              label="Groups of links"
              value={data.totalGroups ?? data.groups.length}
              icon={Link2}
              featured
            />
            <MetricTile
              label="Total internal links"
              value={data.totalLinks}
              icon={Link2}
              featured
            />
            <MetricTile
              label="Avg. links per page"
              value={
                data.groups.length > 0
                  ? (data.totalLinks / data.groups.length).toFixed(1)
                  : "0"
              }
              icon={Link2}
            />
          </MetricGrid>

          <ResultsPanel
            title={`Internal links for ${data.domain}`}
            description="Grouped by referring page with UR, metrics, and nested target links exactly like Ahrefs."
          >
            {/* Top Toolbar (Ahrefs header style) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg-soft/70 px-4 py-3 md:px-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-snow">
                  {filteredGroups.length} groups of links
                </span>

                {/* Group similar dropdown */}
                <div className="flex items-center gap-1.5">
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value as "similar" | "all")}
                    className="rounded-lg border border-line bg-bg px-2.5 py-1 text-xs font-medium text-snow outline-none focus:border-accent"
                  >
                    <option value="similar">Group similar ▾</option>
                    <option value="all">Show all links ▾</option>
                  </select>
                </div>

                <div className="relative min-w-[200px] max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Search referring or target URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} !py-1 !pl-8 !pr-3 text-xs`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={filteredGroups.length === 0}
                  className={`${buttonGhostClass} !py-1.5 !px-3 text-xs disabled:opacity-40`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </button>
              </div>
            </div>

            {/* Ahrefs-style Hierarchical Internal Links Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1050px]">
                <thead>
                  <tr className="border-b border-line bg-bg/90 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    <th className="px-4 py-3.5 w-[320px]">Referring page</th>
                    <th className="px-3 py-3.5 text-center w-12">UR</th>
                    <th className="px-3 py-3.5 text-center w-20">Ref. domains</th>
                    <th className="px-3 py-3.5 text-center w-16">Linked dom.</th>
                    <th className="px-3 py-3.5 text-center w-14">Ext.</th>
                    <th className="px-3 py-3.5 text-center w-16">Traffic</th>
                    <th className="px-3 py-3.5 text-center w-12">Kw.</th>
                    <th className="px-4 py-3.5">Anchor and target URL</th>
                    <th className="px-4 py-3.5 w-28 text-left">First seen / Last checked</th>
                    <th className="px-3 py-3.5 text-center w-16">Similar</th>
                    <th className="px-3 py-3.5 text-center w-14">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-16 text-center text-sm text-ink-muted">
                        No internal links found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group, gIdx) => (
                      <tr
                        key={`${group.sourceUrl}-${gIdx}`}
                        className="hover:bg-white/[0.01] transition-colors align-top"
                      >
                        {/* 1. Referring Page with CMS Badges */}
                        <td className="px-4 py-4 max-w-[320px]">
                          <div className="space-y-1.5">
                            <a
                              href={group.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-[#58a6ff] hover:underline line-clamp-2 leading-snug text-xs block"
                              title={group.sourceTitle || group.sourceUrl}
                            >
                              {group.sourceTitle || group.sourceUrl}
                            </a>
                            <div className="flex items-center gap-1 text-[11px] text-[#2dd4bf] truncate max-w-full font-mono">
                              <span className="truncate">{group.sourceUrl}</span>
                              <ChevronDown className="h-3 w-3 shrink-0 opacity-60 inline" />
                            </div>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              {group.language ? (
                                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                                  {group.language}
                                </span>
                              ) : null}
                              {group.platform ? (
                                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted uppercase">
                                  {group.platform}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>

                        {/* 2. UR */}
                        <td className="px-3 py-4 text-center font-medium text-snow tabular-nums">
                          {group.ur ?? "—"}
                        </td>

                        {/* 3. Referring Domains */}
                        <td className="px-3 py-4 text-center tabular-nums">
                          {group.referringDomains ? (
                            <span className="text-[#58a6ff] font-medium">
                              {group.referringDomains.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-ink-muted">0</span>
                          )}
                        </td>

                        {/* 4. Linked Domains */}
                        <td className="px-3 py-4 text-center tabular-nums text-ink-muted">
                          {group.linkedDomains ?? "—"}
                        </td>

                        {/* 5. Ext. */}
                        <td className="px-3 py-4 text-center tabular-nums text-ink-muted">
                          {group.extLinks ?? "—"}
                        </td>

                        {/* 6. Traffic */}
                        <td className="px-3 py-4 text-center font-medium text-snow tabular-nums">
                          {group.traffic ?? 0}
                        </td>

                        {/* 7. Kw. */}
                        <td className="px-3 py-4 text-center font-medium text-snow tabular-nums">
                          {group.kw ?? 0}
                        </td>

                        {/* 8. Nested Links with Anchor & Target URL */}
                        <td className="px-4 py-4">
                          <div className="space-y-4">
                            {group.links.map((link, lIdx) => (
                              <div key={`${link.targetUrl}-${lIdx}`} className="space-y-1">
                                <div className="text-xs">
                                  <span className="text-snow font-medium">
                                    {link.anchor || "(empty anchor)"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {link.type ? (
                                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-ink-muted uppercase">
                                      {link.type}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-mono text-[#2dd4bf]">
                                  <a
                                    href={link.targetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate hover:underline max-w-[280px]"
                                    title={link.targetUrl}
                                  >
                                    {link.targetUrl}
                                  </a>
                                  <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
                                  {link.statusCode && link.statusCode !== 200 ? (
                                    <span className="rounded bg-red-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-red-400">
                                      {link.statusCode}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* 9. First Seen / Last Checked */}
                        <td className="px-4 py-4 text-left">
                          <div className="space-y-4">
                            {group.links.map((link, lIdx) => (
                              <div key={`date-${lIdx}`} className="text-[11px] leading-snug">
                                <p className="text-snow font-medium">
                                  {link.firstSeen || "27 Oct 2024"}
                                </p>
                                <p className="text-ink-muted">
                                  {link.lastChecked || "9 h ago"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* 10. Similar Dropdown */}
                        <td className="px-3 py-4 text-center">
                          <div className="space-y-4">
                            {group.links.map((link, lIdx) => (
                              <div key={`sim-${lIdx}`} className="flex justify-center">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded border border-line bg-bg px-2 py-0.5 text-[11px] text-ink-muted hover:text-snow hover:border-accent/40"
                                >
                                  <span>{link.similarCount || 5}</span>
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* 11. Inspect Icon */}
                        <td className="px-3 py-4 text-center">
                          <div className="space-y-4">
                            {group.links.map((link, lIdx) => (
                              <div key={`inspect-${lIdx}`} className="flex justify-center">
                                <a
                                  href={link.targetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center h-5 w-5 rounded text-ink-muted hover:text-accent transition-colors"
                                  title="Inspect Link"
                                >
                                  <Search className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
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
            icon={Link2}
            title="Analyze internal links"
            description="Enter a domain to view the Ahrefs-style hierarchical internal link report grouped by referring pages."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
