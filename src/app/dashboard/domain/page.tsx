"use client";

import { useCallback, useEffect, useState } from "react";
import { Globe } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  DomainOverviewPanel,
  type DomainOverviewPanelData,
} from "@/components/dashboard/DomainOverviewPanel";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { useAutoAnalyze } from "@/components/dashboard/useAutoAnalyze";
import {
  SearchPanel,
  SearchToolbar,
  TabBar,
  TabPanel,
  ToolbarSelect,
} from "@/components/dashboard/SearchToolbar";
import {
  DashboardAlert,
  DataTable,
  EmptyBlock,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import { DOMAIN_SCOPES, RESEARCH_LOCATIONS } from "@/lib/dashboard/locations";

type Overview = DomainOverviewPanelData & {
  topKeywords: Array<{
    keyword: string;
    searchVolume: number | null;
    cpc: number | null;
    rank: number | null;
    url: string | null;
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
  const [scope, setScope] = useState("subdomains");
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

  const runLookup = useCallback(() => onLookup(), [domain, locationCode, scope]);

  useAutoAnalyze(
    Boolean(project && dataForSeoConfigured && domain && domain !== "example.com"),
    runLookup,
  );

  if (projectLoading) {
    return (
      <DashboardShell title="Domain Overview">
        <LoadingBlock />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Domain Overview"
      description="Domain health, authority, traffic, and keyword visibility"
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Domain analysis"
          description="Analyze a domain to see health score, authority metrics, organic traffic, and top rankings."
        >
          <SearchToolbar
            value={domain}
            onChange={setDomain}
            onSubmit={() => void onLookup()}
            placeholder="competitor.com"
            loading={loading}
            submitLabel="Analyze"
          >
            <ToolbarSelect
              label="Location"
              value={locationCode}
              onChange={(v) => setLocationCode(Number(v))}
              options={RESEARCH_LOCATIONS.map((l) => ({
                value: l.code,
                label: l.label,
              }))}
            />
            <ToolbarSelect
              label="Scope"
              value={scope}
              onChange={setScope}
              options={DOMAIN_SCOPES.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          </SearchToolbar>
        </SearchPanel>

        {loading && !overview ? (
          <LoadingBlock label="Analyzing domain — this can take up to a minute..." />
        ) : null}

        {overview ? (
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
                    count: overview.topKeywords.length,
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
                    rows={overview.topKeywords}
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
                        key: "volume",
                        header: "Volume",
                        cell: (row) => (
                          <span className="text-ink-muted">
                            {row.searchVolume?.toLocaleString() ?? "—"}
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
              title="Analyze any domain"
              description="Enter a domain with location and scope filters to see health, authority, traffic, and ranking data."
            />
          )
        )}
      </PageStack>
    </DashboardShell>
  );
}
