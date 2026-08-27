"use client";

import { Hash, Type } from "lucide-react";
import { OrganicSearchLayout } from "@/components/dashboard/OrganicSearchLayout";
import { useInternalLinksReport } from "@/components/dashboard/useInternalLinksReport";
import {
  DataTable,
  EmptyBlock,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  ResultsPanel,
} from "@/components/dashboard/ui";
import type { InternalAnchorRow } from "@/lib/dataforseo/pages-links";

type AnchorsData = {
  domain: string;
  anchors: InternalAnchorRow[];
};

export default function InternalAnchorsPage() {
  const {
    domain,
    setDomain,
    data,
    loading,
    error,
    analyze,
    projectLoading,
    dataForSeoConfigured,
  } = useInternalLinksReport<AnchorsData>("anchors");

  return (
    <OrganicSearchLayout
      title="Internal anchors"
      description="Anchor text used in internal links across your site"
      searchDescription="Aggregates anchor text from an OnPage crawl. May take 1–2 minutes."
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
        <LoadingBlock label="Crawling site and aggregating anchor text..." />
      ) : null}

      {data ? (
        <>
          <MetricGrid className="sm:grid-cols-2">
            <MetricTile
              label="Unique anchors"
              value={data.anchors.length}
              icon={Type}
              featured
            />
            <MetricTile
              label="Most used anchor"
              value={data.anchors[0]?.links ?? null}
              hint="uses"
              icon={Hash}
            />
          </MetricGrid>

          <ResultsPanel
            title={`Internal anchor text on ${data.domain}`}
            description="Grouped by anchor text with link count and target pages."
          >
            <DataTable
              rows={data.anchors}
              rowKey={(row) => row.anchor}
              columns={[
                {
                  key: "anchor",
                  header: "Anchor text",
                  cell: (row) => (
                    <span className="font-medium text-snow">{row.anchor}</span>
                  ),
                },
                {
                  key: "links",
                  header: "Links",
                  cell: (row) => (
                    <span className="font-semibold text-accent">
                      {row.links.toLocaleString()}
                    </span>
                  ),
                },
                {
                  key: "targets",
                  header: "Target pages",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.targetPages.toLocaleString()}
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
            icon={Type}
            title="Analyze internal anchors"
            description="Discover which anchor text your site uses for internal linking."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
