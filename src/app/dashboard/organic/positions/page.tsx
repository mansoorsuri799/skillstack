"use client";

import { BarChart3, Hash, TrendingDown, TrendingUp } from "lucide-react";
import { OrganicSearchLayout } from "@/components/dashboard/OrganicSearchLayout";
import { useOrganicSearch } from "@/components/dashboard/useOrganicSearch";
import {
  DashboardCard,
  EmptyBlock,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  ResultsPanel,
} from "@/components/dashboard/ui";
import type { OrganicPositionsResult } from "@/lib/dataforseo/organic-search";

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

  const maxBucket = Math.max(
    ...(data?.buckets.map((b) => b.count ?? 0) ?? [1]),
    1,
  );

  return (
    <OrganicSearchLayout
      title="Organic positions"
      description="Distribution of organic keyword rankings by SERP position"
      searchDescription="See how many keywords rank in each position bucket."
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
        <>
          <MetricGrid className="lg:grid-cols-4">
            <MetricTile
              label="Total keywords"
              value={data.totalKeywords}
              icon={Hash}
              featured
            />
            <MetricTile
              label="Est. organic traffic"
              value={data.organicTraffic}
              icon={TrendingUp}
              featured
            />
            <MetricTile
              label="Traffic value"
              value={
                data.trafficValue != null
                  ? `$${Math.round(data.trafficValue).toLocaleString()}`
                  : null
              }
              icon={BarChart3}
            />
            <MetricTile
              label="Position 1"
              value={data.buckets[0]?.count ?? null}
              icon={Hash}
            />
          </MetricGrid>

          <div className="grid gap-5 lg:grid-cols-2">
            <DashboardCard title="Ranking movement">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-ink-muted">New</dt>
                  <dd className="text-lg font-semibold text-accent">
                    {data.movement.new ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Improved</dt>
                  <dd className="text-lg font-semibold text-snow">
                    {data.movement.up ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Declined</dt>
                  <dd className="text-lg font-semibold text-snow">
                    {data.movement.down ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted">Lost</dt>
                  <dd className="text-lg font-semibold text-snow">
                    {data.movement.lost ?? "—"}
                  </dd>
                </div>
              </dl>
            </DashboardCard>

            <DashboardCard title="Top buckets">
              <ul className="space-y-2 text-sm">
                {data.buckets.slice(0, 4).map((bucket) => (
                  <li key={bucket.label} className="flex items-center justify-between">
                    <span className="text-ink-muted">{bucket.label}</span>
                    <span className="font-semibold text-snow">
                      {bucket.count?.toLocaleString() ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </DashboardCard>
          </div>

          <ResultsPanel
            title={`Position distribution for ${data.domain}`}
            description="Number of keywords in each organic ranking range."
          >
            <ul className="space-y-3">
              {data.buckets.map((bucket) => {
                const count = bucket.count ?? 0;
                const width = `${Math.max((count / maxBucket) * 100, count > 0 ? 4 : 0)}%`;
                return (
                  <li key={bucket.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-ink-muted">{bucket.label}</span>
                      <span className="font-semibold text-snow">
                        {bucket.count?.toLocaleString() ?? "—"}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-bg">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </ResultsPanel>
        </>
      ) : (
        !loading && (
          <EmptyBlock
            icon={TrendingDown}
            title="Analyze organic positions"
            description="Enter a domain to see how its rankings are distributed across SERP positions."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
