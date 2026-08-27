"use client";

import { Link2 } from "lucide-react";
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
import type { InternalLinkRow } from "@/lib/dataforseo/pages-links";

type LinksData = {
  domain: string;
  links: InternalLinkRow[];
  total: number | null;
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

  return (
    <OrganicSearchLayout
      title="Internal links"
      description="Internal link graph from an OnPage crawl of your site"
      searchDescription="Crawls up to 40 pages and lists internal links found. This may take 1–2 minutes."
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
        <LoadingBlock label="Crawling site and collecting internal links..." />
      ) : null}

      {data ? (
        <>
          <MetricGrid className="sm:grid-cols-2">
            <MetricTile
              label="Internal links"
              value={data.total ?? data.links.length}
              icon={Link2}
              featured
            />
            <MetricTile
              label="Sample returned"
              value={data.links.length}
              hint="links"
              icon={Link2}
            />
          </MetricGrid>

          <ResultsPanel
            title={`Internal links on ${data.domain}`}
            description="From → To with anchor text and follow status."
          >
            <DataTable
              rows={data.links}
              rowKey={(row) => `${row.from}-${row.to}-${row.anchor}`}
              columns={[
                {
                  key: "from",
                  header: "From",
                  cell: (row) => (
                    <span className="block max-w-xs truncate text-xs text-accent">
                      {row.from}
                    </span>
                  ),
                },
                {
                  key: "to",
                  header: "To",
                  cell: (row) => (
                    <span className="block max-w-xs truncate text-xs text-accent">
                      {row.to}
                    </span>
                  ),
                },
                {
                  key: "anchor",
                  header: "Anchor",
                  cell: (row) => (
                    <span className="text-snow">{row.anchor ?? "—"}</span>
                  ),
                },
                {
                  key: "dofollow",
                  header: "Follow",
                  cell: (row) => (
                    <span className={row.dofollow ? "text-accent" : "text-ink-muted"}>
                      {row.dofollow ? "Dofollow" : "Nofollow"}
                    </span>
                  ),
                },
                {
                  key: "broken",
                  header: "Broken",
                  cell: (row) => (
                    <span className={row.broken ? "text-red-400" : "text-ink-muted"}>
                      {row.broken ? "Yes" : "No"}
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
            title="Analyze internal links"
            description="Enter your domain to crawl the site and list internal links."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
