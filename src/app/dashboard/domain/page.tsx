"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DomainOverviewToolbar } from "@/components/dashboard/DomainOverviewToolbar";
import {
  DomainOverviewPanel,
  type DomainOverviewPanelData,
} from "@/components/dashboard/DomainOverviewPanel";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { TabBar, TabPanel } from "@/components/dashboard/SearchToolbar";
import {
  DashboardAlert,
  DataTable,
  EmptyBlock,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import {
  sortDomainKeywords,
  type DomainKeywordSort,
  type DomainScope,
} from "@/lib/dashboard/domain-overview-config";

type Overview = DomainOverviewPanelData & {
  topKeywords: Array<{
    keyword: string;
    searchVolume: number | null;
    cpc: number | null;
    rank: number | null;
    url: string | null;
    etv?: number | null;
    difficulty?: number | null;
  }>;
  topPages: Array<{
    url: string;
    traffic: number | null;
    keywords: number | null;
  }>;
};

type DomainTab = "keywords" | "pages";

export default function DomainPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [domain, setDomain] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [scope, setScope] = useState<DomainScope>("subdomains");
  const [sortBy, setSortBy] = useState<DomainKeywordSort>("traffic");
  const [tab, setTab] = useState<DomainTab>("keywords");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setDomain(project.domain);
      setLocationCode(project.locationCode);
    }
  }, [project]);

  async function onLookup() {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setOverview(null);
    try {
      const res = await fetch("/api/dashboard/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, locationCode, scope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOverview(data.overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  const sortedKeywords = useMemo(() => {
    if (!overview) return [];
    return sortDomainKeywords(overview.topKeywords, sortBy);
  }, [overview, sortBy]);

  return (
    <DashboardShell
      title="Domain Overview"
      description="Analyze any domain's SEO profile: traffic, keywords, and backlinks."
    >
      <PageStack className="!max-w-none w-full">
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <DomainOverviewToolbar
          domain={domain}
          onDomainChange={setDomain}
          scope={scope}
          onScopeChange={setScope}
          locationCode={locationCode}
          onLocationChange={setLocationCode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSubmit={() => void onLookup()}
          loading={loading}
        />

        {loading ? (
          <LoadingBlock label="Analyzing domain — this can take up to a minute..." />
        ) : null}

        {overview && !loading ? (
          <>
            <DomainOverviewPanel data={overview} />

            <ResultsPanel
              title={`Ranking data for ${overview.domain}`}
              description="Top keywords and pages driving organic visibility."
            >
              <TabBar
                tabs={[
                  {
                    id: "keywords",
                    label: "Top keywords",
                    count: sortedKeywords.length,
                  },
                  {
                    id: "pages",
                    label: "Top pages",
                    count: overview.topPages?.length ?? 0,
                  },
                ]}
                active={tab}
                onChange={setTab}
              />

              <TabPanel>
                {tab === "keywords" ? (
                  <DataTable
                    rows={sortedKeywords}
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
                        key: "rank",
                        header: "Rank",
                        cell: (row) => (
                          <span className="font-semibold text-accent">{row.rank ?? "—"}</span>
                        ),
                      },
                      {
                        key: "traffic",
                        header: "Traffic",
                        cell: (row) => (
                          <span className="text-ink-muted">
                            {row.etv != null ? Math.round(row.etv).toLocaleString() : "—"}
                          </span>
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
                        key: "score",
                        header: "Score",
                        cell: (row) => (
                          <span className="text-ink-muted">
                            {row.difficulty ?? "—"}
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
                        key: "url",
                        header: "URL",
                        cell: (row) => (
                          <span className="block max-w-xs truncate text-xs text-accent">
                            {row.url ?? "—"}
                          </span>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <DataTable
                    rows={overview.topPages ?? []}
                    rowKey={(row) => row.url}
                    columns={[
                      {
                        key: "page",
                        header: "Page",
                        cell: (row) => (
                          <span className="block max-w-md truncate text-accent">{row.url}</span>
                        ),
                      },
                      {
                        key: "traffic",
                        header: "Est. traffic",
                        cell: (row) => (
                          <span className="text-ink-muted">
                            {row.traffic?.toLocaleString() ?? "—"}
                          </span>
                        ),
                      },
                      {
                        key: "keywords",
                        header: "Keywords",
                        cell: (row) => (
                          <span className="text-ink-muted">
                            {row.keywords?.toLocaleString() ?? "—"}
                          </span>
                        ),
                      },
                    ]}
                  />
                )}
              </TabPanel>
            </ResultsPanel>
          </>
        ) : (
          !loading && (
            <EmptyBlock
              icon={Globe}
              title="Enter a domain to get started"
              description="Choose scope, country, and sort order — then click Search."
            />
          )
        )}
      </PageStack>
    </DashboardShell>
  );
}
