"use client";

import { Users } from "lucide-react";
import { OrganicSearchLayout } from "@/components/dashboard/OrganicSearchLayout";
import { useOrganicSearch } from "@/components/dashboard/useOrganicSearch";
import {
  DataTable,
  EmptyBlock,
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
            <DataTable
              rows={data.competitors}
              rowKey={(row) => row.domain}
              columns={[
                {
                  key: "domain",
                  header: "Domain",
                  cell: (row) => (
                    <span className="font-medium text-snow">{row.domain}</span>
                  ),
                },
                {
                  key: "intersections",
                  header: "Shared keywords",
                  cell: (row) => (
                    <span className="font-semibold text-accent">
                      {row.intersections?.toLocaleString() ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "avgPosition",
                  header: "Avg. position",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.avgPosition != null ? row.avgPosition.toFixed(1) : "—"}
                    </span>
                  ),
                },
                {
                  key: "organicKeywords",
                  header: "Their keywords",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.organicKeywords?.toLocaleString() ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "organicTraffic",
                  header: "Est. traffic",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.organicTraffic?.toLocaleString() ?? "—"}
                    </span>
                  ),
                },
              ]}
            />
          </ResultsPanel>
        </>
      ) : (
        !loading && (
          <EmptyBlock
            icon={Users}
            title="Analyze organic competitors"
            description="Enter a domain to discover sites competing for the same organic keywords."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
