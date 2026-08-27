"use client";

import { Link2, TrendingUp } from "lucide-react";
import { OrganicSearchLayout } from "@/components/dashboard/OrganicSearchLayout";
import { useDomainReport } from "@/components/dashboard/useDomainReport";
import {
  DataTable,
  EmptyBlock,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  ResultsPanel,
} from "@/components/dashboard/ui";
import type { BestByLinksRow } from "@/lib/dataforseo/pages-links";

type PagesData = {
  domain: string;
  pages: BestByLinksRow[];
};

export default function BestByLinksPage() {
  const {
    domain,
    setDomain,
    data,
    loading,
    error,
    analyze,
    projectLoading,
    dataForSeoConfigured,
  } = useDomainReport<PagesData>("/api/dashboard/pages/best-by-links");

  return (
    <OrganicSearchLayout
      title="Best by links"
      description="Pages on your site with the most backlinks"
      searchDescription="See which URLs earn the most external links and referring domains."
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
        <LoadingBlock label="Loading pages ranked by backlinks..." />
      ) : null}

      {data ? (
        <>
          <MetricGrid className="sm:grid-cols-2">
            <MetricTile
              label="Pages returned"
              value={data.pages.length}
              icon={Link2}
              featured
            />
            <MetricTile
              label="Top page backlinks"
              value={data.pages[0]?.backlinks ?? null}
              icon={TrendingUp}
              featured
            />
          </MetricGrid>

          <ResultsPanel
            title={`Best pages by links for ${data.domain}`}
            description="Sorted by total backlinks from DataForSEO."
          >
            <DataTable
              rows={data.pages}
              rowKey={(row) => row.page}
              columns={[
                {
                  key: "page",
                  header: "Page",
                  cell: (row) => (
                    <a
                      href={row.page}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-lg truncate text-accent hover:underline"
                    >
                      {row.page}
                    </a>
                  ),
                },
                {
                  key: "backlinks",
                  header: "Backlinks",
                  cell: (row) => (
                    <span className="font-semibold text-accent">
                      {row.backlinks?.toLocaleString() ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "domains",
                  header: "Ref. domains",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.referringDomains?.toLocaleString() ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "rank",
                  header: "Page rank",
                  cell: (row) => (
                    <span className="text-ink-muted">{row.rank ?? "—"}</span>
                  ),
                },
                {
                  key: "internal",
                  header: "Internal out",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.internalLinks?.toLocaleString() ?? "—"}
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
            icon={Link2}
            title="Find your strongest pages"
            description="Enter a domain to see which pages have the most backlinks."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
