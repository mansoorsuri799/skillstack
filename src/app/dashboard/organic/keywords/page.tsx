"use client";

import { Search } from "lucide-react";
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
import type { OrganicKeywordRow } from "@/lib/dataforseo/organic-search";

type KeywordsData = {
  domain: string;
  keywords: OrganicKeywordRow[];
};

export default function OrganicKeywordsPage() {
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
  } = useOrganicSearch<KeywordsData>("keywords");

  return (
    <OrganicSearchLayout
      title="Organic keywords"
      description="Keywords your domain ranks for in Google organic search"
      searchDescription="See ranked keywords with position, volume, CPC, and landing URL."
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
      {loading && !data ? <LoadingBlock label="Loading organic keywords..." /> : null}

      {data ? (
        <>
          <MetricGrid className="sm:grid-cols-2">
            <MetricTile
              label="Keywords returned"
              value={data.keywords.length}
              icon={Search}
              featured
            />
            <MetricTile
              label="Top 10 rankings"
              value={data.keywords.filter((k) => (k.rank ?? 999) <= 10).length}
              icon={Search}
            />
          </MetricGrid>

          <ResultsPanel
            title={`Organic keywords for ${data.domain}`}
            description="Ranked keywords from DataForSEO Labs."
          >
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
                  key: "rank",
                  header: "Position",
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
                  key: "cpc",
                  header: "CPC",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.cpc != null ? `$${row.cpc.toFixed(2)}` : "—"}
                    </span>
                  ),
                },
                {
                  key: "etv",
                  header: "Est. traffic",
                  cell: (row) => (
                    <span className="text-ink-muted">
                      {row.etv?.toLocaleString() ?? "—"}
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
          </ResultsPanel>
        </>
      ) : (
        !loading && (
          <EmptyBlock
            icon={Search}
            title="Analyze organic keywords"
            description="Enter a domain and click Analyze to see keywords it ranks for."
          />
        )
      )}
    </OrganicSearchLayout>
  );
}
