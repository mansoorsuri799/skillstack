"use client";

import { FileText, Globe } from "lucide-react";
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
import type { OrganicPageRow } from "@/lib/dataforseo/organic-search";

type PagesData = {
  domain: string;
  pages: OrganicPageRow[];
};

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

  const totalTraffic = data?.pages.reduce((sum, p) => sum + (p.traffic ?? 0), 0) ?? null;

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
            description="Pages ranked by estimated organic traffic."
          >
            <DataTable
              rows={data.pages}
              rowKey={(row) => row.url}
              columns={[
                {
                  key: "page",
                  header: "Page",
                  cell: (row) => (
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-lg truncate text-accent hover:underline"
                    >
                      {row.url}
                    </a>
                  ),
                },
                {
                  key: "traffic",
                  header: "Est. traffic",
                  cell: (row) => (
                    <span className="font-semibold text-accent">
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
          </ResultsPanel>
        </>
      ) : (
        !loading && (
          <EmptyBlock
            icon={Globe}
            title="Analyze top pages"
            description="Enter a domain to see its highest-traffic organic landing pages."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
