"use client";

import { ArrowDownLeft, FileText } from "lucide-react";
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
import type { MostLinkedPageRow } from "@/lib/dataforseo/pages-links";

type PagesData = {
  domain: string;
  pages: MostLinkedPageRow[];
};

export default function MostLinkedPagesPage() {
  const {
    domain,
    setDomain,
    data,
    loading,
    error,
    analyze,
    projectLoading,
    dataForSeoConfigured,
  } = useInternalLinksReport<PagesData>("most-linked");

  return (
    <OrganicSearchLayout
      title="Most linked pages"
      description="Pages receiving the most internal links on your site"
      searchDescription="OnPage crawl ranks pages by inbound internal link count. May take 1–2 minutes."
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
        <LoadingBlock label="Crawling site to find most linked pages..." />
      ) : null}

      {data ? (
        <>
          <MetricGrid className="sm:grid-cols-2">
            <MetricTile
              label="Pages crawled"
              value={data.pages.length}
              icon={FileText}
              featured
            />
            <MetricTile
              label="Top inbound links"
              value={data.pages[0]?.inboundLinks ?? null}
              icon={ArrowDownLeft}
              featured
            />
          </MetricGrid>

          <ResultsPanel
            title={`Most linked pages on ${data.domain}`}
            description="Pages sorted by inbound internal links."
          >
            <DataTable
              rows={data.pages}
              rowKey={(row) => row.url}
              columns={[
                {
                  key: "url",
                  header: "Page",
                  cell: (row) => (
                    <span className="block max-w-lg truncate text-accent">{row.url}</span>
                  ),
                },
                {
                  key: "inbound",
                  header: "Inbound links",
                  cell: (row) => (
                    <span className="font-semibold text-accent">
                      {row.inboundLinks?.toLocaleString() ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "internalOut",
                  header: "Internal out",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.internalLinksOut?.toLocaleString() ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "externalOut",
                  header: "External out",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.externalLinksOut?.toLocaleString() ?? "—"}
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
            icon={ArrowDownLeft}
            title="Find hub pages"
            description="See which pages receive the most internal links."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
