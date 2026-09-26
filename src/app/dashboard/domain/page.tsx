"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Globe } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DomainOverviewToolbar } from "@/components/dashboard/DomainOverviewToolbar";
import {
  DomainOverviewPanel,
  type DomainOverviewPanelData,
} from "@/components/dashboard/DomainOverviewPanel";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { TabBar } from "@/components/dashboard/SearchToolbar";
import {
  DashboardAlert,
  DataTable,
  EmptyBlock,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import {
  sortDomainKeywords,
  type DomainKeywordSort,
  type DomainScope,
} from "@/lib/dashboard/domain-overview-config";

type KeywordRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  rank: number | null;
  url: string | null;
  etv?: number | null;
  difficulty?: number | null;
};

type PageRow = {
  url: string;
  traffic: number | null;
  keywords: number | null;
};

type Overview = DomainOverviewPanelData & {
  topKeywords: KeywordRow[];
  topPages: PageRow[];
  marketLabel?: string | null;
};

type DomainTab = "keywords" | "pages";

const domainMemoryCache = new Map<string, Overview>();

function getDomainCacheKey(domain: string, locationCode: number, scope: string) {
  return `ss_domain_v4_${domain.toLowerCase()}_${locationCode}_${scope}`;
}

function readDomainCache(key: string): Overview | null {
  if (domainMemoryCache.has(key)) return domainMemoryCache.get(key)!;
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Overview;
        domainMemoryCache.set(key, parsed);
        return parsed;
      }
    } catch {
      // Ignore
    }
  }
  return null;
}

function writeDomainCache(key: string, data: Overview) {
  domainMemoryCache.set(key, data);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }
}

export default function DomainPage() {
  const { project, dataForSeoConfigured } = useDashboardProject();
  const [domain, setDomain] = useState(() => project?.domain ?? "");
  const [locationCode, setLocationCode] = useState(() => project?.locationCode ?? 2586);
  const [scope, setScope] = useState<DomainScope>("subdomains");
  const [sortBy, setSortBy] = useState<DomainKeywordSort>("traffic");
  const [tab, setTab] = useState<DomainTab>("keywords");
  const [overview, setOverview] = useState<Overview | null>(() => {
    if (!project?.domain) return null;
    return readDomainCache(getDomainCacheKey(project.domain, project.locationCode ?? 2586, "subdomains"));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoLoadedKey = useRef<string | null>(null);
  const syncedProjectKey = useRef<string | null>(null);

  const onLookup = useCallback(async (override?: {
    domain?: string;
    locationCode?: number;
    scope?: DomainScope;
  }) => {
    const targetDomain = (override?.domain ?? domain).trim();
    if (!targetDomain) return;

    const nextLocation = override?.locationCode ?? locationCode;
    const nextScope = override?.scope ?? scope;
    const cacheKey = getDomainCacheKey(targetDomain, nextLocation, nextScope);
    const cached = readDomainCache(cacheKey);
    if (cached) setOverview(cached);

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: targetDomain,
          locationCode: nextLocation,
          scope: nextScope,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const nextOverview = data.overview as Overview;
      setOverview(nextOverview);
      writeDomainCache(cacheKey, nextOverview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }, [domain, locationCode, scope]);

  // Sync toolbar from project only when the selected project changes — never while typing.
  useEffect(() => {
    if (!project?.domain) return;
    const projectKey = `${project.id ?? project.domain}|${project.locationCode}`;
    if (syncedProjectKey.current === projectKey) return;
    syncedProjectKey.current = projectKey;
    setDomain(project.domain);
    setLocationCode(project.locationCode);
    const cacheKey = getDomainCacheKey(project.domain, project.locationCode, scope);
    const cached = readDomainCache(cacheKey);
    if (cached) setOverview(cached);
  }, [project, scope]);

  // Auto-load project domain once (and when scope changes for that project).
  useEffect(() => {
    if (!project?.domain) return;
    const autoKey = `${project.domain}|${project.locationCode}|${scope}`;
    if (autoLoadedKey.current === autoKey) return;
    autoLoadedKey.current = autoKey;
    void onLookup({
      domain: project.domain,
      locationCode: project.locationCode,
      scope,
    });
    // Intentionally omit onLookup — it changes when the user types.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- project/scope driven auto-load only
  }, [project?.domain, project?.locationCode, scope]);

  const sortedKeywords = useMemo(() => {
    if (!overview) return [];
    return sortDomainKeywords(overview.topKeywords, sortBy);
  }, [overview, sortBy]);

  return (
    <DashboardShell
      title="Domain Overview"
      description="Analyze any domain's SEO profile: traffic, keywords, and backlinks."
    >
      <PageStack className="!max-w-none w-full">
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <DomainOverviewToolbar
          domain={domain}
          onDomainChange={setDomain}
          scope={scope}
          onScopeChange={setScope}
          locationCode={locationCode}
          onLocationChange={setLocationCode}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSubmit={() => void onLookup()}
          loading={loading}
        />

        {loading && !overview ? (
          <LoadingBlock label="Loading domain overview..." />
        ) : null}

        {overview ? (
          <>
            <DomainOverviewPanel data={overview} />

            <ResultsPanel title="Domain Insights">
              <TabBar
                tabs={[
                  {
                    id: "keywords",
                    label: `Top Keywords (${overview.topKeywords.length})`,
                  },
                  {
                    id: "pages",
                    label: `Top Pages (${overview.topPages.length})`,
                  },
                ]}
                active={tab}
                onChange={(t) => setTab(t as DomainTab)}
              />

              {tab === "keywords" ? (
                sortedKeywords.length === 0 ? (
                  <EmptyBlock
                    title="No keywords found"
                    description="No organic keyword rankings recorded for this domain and location."
                  />
                ) : (
                  <DataTable<KeywordRow>
                    rows={sortedKeywords}
                    rowKey={(k) => `${k.keyword}-${k.url}`}
                    columns={[
                      {
                        key: "keyword",
                        header: "Keyword",
                        cell: (k) => (
                          <span className="font-medium text-snow">{k.keyword}</span>
                        ),
                      },
                      {
                        key: "rank",
                        header: "Rank",
                        cell: (k) => (
                          <span className="tabular-nums text-accent">
                            #{k.rank ?? "—"}
                          </span>
                        ),
                      },
                      {
                        key: "searchVolume",
                        header: "Volume",
                        cell: (k) => (
                          <span className="tabular-nums">
                            {k.searchVolume?.toLocaleString() ?? "—"}
                          </span>
                        ),
                      },
                      {
                        key: "cpc",
                        header: "CPC",
                        cell: (k) => (
                          <span className="tabular-nums">
                            {k.cpc != null ? `$${k.cpc.toFixed(2)}` : "—"}
                          </span>
                        ),
                      },
                      {
                        key: "url",
                        header: "Page",
                        cell: (k) =>
                          k.url ? (
                            <a
                              href={k.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex max-w-xs truncate text-xs text-ink-muted hover:text-accent hover:underline"
                            >
                              {k.url}
                            </a>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          ),
                      },
                    ]}
                  />
                )
              ) : null}

              {tab === "pages" ? (
                overview.topPages.length === 0 ? (
                  <EmptyBlock
                    title="No pages found"
                    description="No top pages recorded for this domain."
                  />
                ) : (
                  <DataTable<PageRow>
                    rows={overview.topPages}
                    rowKey={(p) => p.url}
                    columns={[
                      {
                        key: "url",
                        header: "Page URL",
                        cell: (p) => (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-sm truncate font-medium text-snow hover:text-accent hover:underline"
                          >
                            <Globe className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-60" />
                            {p.url}
                          </a>
                        ),
                      },
                      {
                        key: "traffic",
                        header: "Est. Traffic",
                        cell: (p) => (
                          <span className="tabular-nums text-accent">
                            {p.traffic?.toLocaleString() ?? "—"}
                          </span>
                        ),
                      },
                      {
                        key: "keywords",
                        header: "Ranking Keywords",
                        cell: (p) => (
                          <span className="tabular-nums">
                            {p.keywords?.toLocaleString() ?? "—"}
                          </span>
                        ),
                      },
                    ]}
                  />
                )
              ) : null}
            </ResultsPanel>
          </>
        ) : !loading ? (
          <EmptyBlock
            title="Enter a domain to begin"
            description="Type any website domain above and click Analyze to view its SEO performance."
          />
        ) : null}
      </PageStack>
    </DashboardShell>
  );
}
