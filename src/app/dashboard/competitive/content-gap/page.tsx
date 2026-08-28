"use client";

import { useEffect, useState } from "react";
import { GitCompare, Search, Target } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { SearchPanel, ToolbarSelect } from "@/components/dashboard/SearchToolbar";
import {
  buttonPrimaryClass,
  DashboardAlert,
  DataTable,
  DifficultyBadge,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import { RESEARCH_LOCATIONS } from "@/lib/dashboard/locations";
import type { ContentGapResult } from "@/lib/dataforseo/competitive-analysis";

export default function ContentGapPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [yourDomain, setYourDomain] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [data, setData] = useState<ContentGapResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project?.domain && project.domain !== "example.com") {
      setYourDomain(project.domain);
    }
  }, [project]);

  async function analyze() {
    if (!yourDomain.trim()) {
      setError("Enter your site domain.");
      return;
    }
    if (!competitor.trim()) {
      setError("Enter a competitor domain.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/competitive/content-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: yourDomain, competitor, locationCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json.data as ContentGapResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  const totalVolume =
    data?.keywords.reduce((sum, row) => sum + (row.searchVolume ?? 0), 0) ?? null;

  return (
    <DashboardShell
      title="Content gap"
      description="Keywords your competitor ranks for that your site does not"
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Compare domains"
          description="Find organic keywords the competitor ranks for where your site has no ranking."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void analyze();
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-ink-muted">Your site</span>
                <input
                  className={inputClass}
                  value={yourDomain}
                  onChange={(e) => setYourDomain(e.target.value)}
                  placeholder="yoursite.com"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-ink-muted">Competitor</span>
                <input
                  className={inputClass}
                  value={competitor}
                  onChange={(e) => setCompetitor(e.target.value)}
                  placeholder="competitor.com"
                  required
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
              <ToolbarSelect
                label="Location"
                value={locationCode}
                onChange={(v) => setLocationCode(Number(v))}
                options={RESEARCH_LOCATIONS.map((l) => ({
                  value: l.code,
                  label: l.label,
                }))}
              />
              <button type="submit" disabled={loading} className={buttonPrimaryClass}>
                {loading ? "Analyzing..." : "Find content gap"}
              </button>
            </div>
          </form>
        </SearchPanel>

        {loading ? (
          <LoadingBlock label="Finding keywords your competitor ranks for..." />
        ) : null}

        {data ? (
          <>
            <MetricGrid className="lg:grid-cols-3">
              <MetricTile
                label="Gap keywords"
                value={data.keywords.length}
                icon={GitCompare}
                featured
              />
              <MetricTile
                label="Combined volume"
                value={totalVolume}
                icon={Search}
                featured
              />
              <MetricTile
                label="Competitor"
                value={data.competitorDomain}
                icon={Target}
              />
            </MetricGrid>

            <ResultsPanel
              title={`Content gap vs ${data.competitorDomain}`}
              description={`Keywords ${data.competitorDomain} ranks for organically that ${data.yourDomain} does not.`}
            >
              {data.keywords.length > 0 ? (
                <DataTable
                  rows={data.keywords}
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
                      key: "volume",
                      header: "Volume",
                      cell: (row) => (
                        <span className="text-ink-muted">
                          {row.searchVolume?.toLocaleString() ?? "—"}
                        </span>
                      ),
                    },
                    {
                      key: "difficulty",
                      header: "KD",
                      cell: (row) => <DifficultyBadge value={row.difficulty} />,
                    },
                    {
                      key: "rank",
                      header: "Their rank",
                      cell: (row) => (
                        <span className="font-semibold text-accent">
                          {row.competitorRank ?? "—"}
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
                      header: "Their URL",
                      cell: (row) => (
                        <span className="block max-w-xs truncate text-xs text-accent">
                          {row.competitorUrl ?? "—"}
                        </span>
                      ),
                    },
                  ]}
                />
              ) : (
                <p className="text-sm text-ink-muted">
                  No content gap found for this competitor pairing in the selected location.
                </p>
              )}
            </ResultsPanel>
          </>
        ) : (
          !loading && (
            <EmptyBlock
              icon={GitCompare}
              title="Find your content gap"
              description="Enter your domain and a competitor to discover keywords they rank for that you are missing."
            />
          )
        )}
      </PageStack>
    </DashboardShell>
  );
}
