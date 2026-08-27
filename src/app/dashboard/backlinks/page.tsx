"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Globe,
  Link2,
  Network,
  Shield,
  TrendingUp,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { useAutoAnalyze } from "@/components/dashboard/useAutoAnalyze";
import {
  SearchPanel,
  SearchToolbar,
  TabBar,
  TabPanel,
  ToolbarSelect,
} from "@/components/dashboard/SearchToolbar";
import {
  BoolBadge,
  DashboardAlert,
  DataTable,
  EmptyBlock,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import { DOMAIN_SCOPES } from "@/lib/dashboard/locations";

type Summary = {
  domain: string;
  totalBacklinks: number | null;
  referringDomains: number | null;
  referringIps: number | null;
  dofollow: number | null;
  domainRank: number | null;
};

type BacklinkRow = {
  domainFrom: string;
  urlFrom: string;
  urlTo: string;
  dofollow: boolean;
  rank: number | null;
};

type ReferringRow = {
  domain: string;
  backlinks: number | null;
  rank: number | null;
};

type BacklinksTab = "summary" | "backlinks" | "referring";

export default function BacklinksPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [domain, setDomain] = useState("");
  const [scope, setScope] = useState("subdomains");
  const [tab, setTab] = useState<BacklinksTab>("summary");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [backlinkRows, setBacklinkRows] = useState<BacklinkRow[]>([]);
  const [referringRows, setReferringRows] = useState<ReferringRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) setDomain(project.domain);
  }, [project]);

  async function onLookup(nextTab: BacklinksTab = tab) {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/backlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, scope, tab: nextTab }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.tab === "summary") setSummary(data.summary);
      if (data.tab === "backlinks") setBacklinkRows(data.rows);
      if (data.tab === "referring") setReferringRows(data.rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function switchTab(next: BacklinksTab) {
    setTab(next);
    if (domain.trim()) void onLookup(next);
  }

  const runSummary = useCallback(() => onLookup("summary"), [domain, scope]);

  useAutoAnalyze(
    Boolean(project && dataForSeoConfigured && domain && domain !== "example.com"),
    runSummary,
  );

  if (projectLoading) {
    return (
      <DashboardShell title="Backlinks">
        <LoadingBlock />
      </DashboardShell>
    );
  }

  const hasData =
    summary != null || backlinkRows.length > 0 || referringRows.length > 0;

  return (
    <DashboardShell
      title="Backlinks"
      description="Backlink profile, referring domains, and authority signals"
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Analyze backlink profile"
          description="Enter any domain to explore links, referring domains, and authority metrics."
        >
          <SearchToolbar
            value={domain}
            onChange={setDomain}
            onSubmit={() => void onLookup("summary")}
            placeholder="domain.com"
            loading={loading && tab === "summary"}
            submitLabel="Analyze"
          >
            <ToolbarSelect
              label="Scope"
              value={scope}
              onChange={setScope}
              options={DOMAIN_SCOPES.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          </SearchToolbar>
        </SearchPanel>

        {loading && !hasData ? <LoadingBlock label="Analyzing backlink profile..." /> : null}

        {!loading && !hasData ? (
          <EmptyBlock
            icon={Link2}
            title="Explore any backlink profile"
            description="See summary metrics, sample backlinks, and top referring domains."
          />
        ) : null}

        {hasData ? (
          <ResultsPanel
            title={summary ? `Results for ${summary.domain}` : "Backlink data"}
            description="Switch tabs to explore summary metrics, individual links, and referring domains."
          >
            <TabBar
              tabs={[
                { id: "summary", label: "Summary" },
                {
                  id: "backlinks",
                  label: "Backlinks",
                  count: backlinkRows.length || undefined,
                },
                {
                  id: "referring",
                  label: "Referring domains",
                  count: referringRows.length || undefined,
                },
              ]}
              active={tab}
              onChange={switchTab}
            />

            <TabPanel>
              {tab === "summary" && summary ? (
                <MetricGrid>
                  <MetricTile
                    label="Total backlinks"
                    value={summary.totalBacklinks}
                    icon={Link2}
                    featured
                    hint="All links pointing to this domain"
                  />
                  <MetricTile
                    label="Domain rank"
                    value={summary.domainRank}
                    icon={TrendingUp}
                    featured
                    hint="DataForSEO authority score"
                  />
                  <MetricTile
                    label="Referring domains"
                    value={summary.referringDomains}
                    icon={Globe}
                  />
                  <MetricTile
                    label="Referring IPs"
                    value={summary.referringIps}
                    icon={Network}
                  />
                  <MetricTile
                    label="Dofollow links"
                    value={summary.dofollow}
                    icon={Shield}
                    hint="Estimated from total minus nofollow"
                  />
                </MetricGrid>
              ) : null}

              {tab === "backlinks" ? (
                loading ? (
                  <LoadingBlock label="Loading backlink rows..." />
                ) : backlinkRows.length > 0 ? (
                  <DataTable
                    minWidth="720px"
                    rows={backlinkRows}
                    rowKey={(row) => `${row.urlFrom}-${row.urlTo}`}
                    columns={[
                      {
                        key: "domain",
                        header: "From domain",
                        cell: (row) => (
                          <span className="font-medium text-snow">{row.domainFrom}</span>
                        ),
                      },
                      {
                        key: "from",
                        header: "Source URL",
                        cell: (row) => (
                          <span className="block max-w-xs truncate text-accent">
                            {row.urlFrom}
                          </span>
                        ),
                      },
                      {
                        key: "to",
                        header: "Target",
                        cell: (row) => (
                          <span className="block max-w-xs truncate text-ink-muted">
                            {row.urlTo}
                          </span>
                        ),
                      },
                      {
                        key: "dofollow",
                        header: "Dofollow",
                        cell: (row) => <BoolBadge value={row.dofollow} />,
                      },
                      {
                        key: "rank",
                        header: "Rank",
                        cell: (row) => (
                          <span className="text-ink-muted">{row.rank ?? "—"}</span>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <EmptyBlock
                    icon={Link2}
                    title="No backlink rows yet"
                    description="Run an analysis first, then open this tab."
                  />
                )
              ) : null}

              {tab === "referring" ? (
                loading ? (
                  <LoadingBlock label="Loading referring domains..." />
                ) : referringRows.length > 0 ? (
                  <DataTable
                    minWidth="520px"
                    rows={referringRows}
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
                        key: "backlinks",
                        header: "Backlinks",
                        cell: (row) => (
                          <span className="text-ink-muted">
                            {row.backlinks?.toLocaleString() ?? "—"}
                          </span>
                        ),
                      },
                      {
                        key: "rank",
                        header: "Rank",
                        cell: (row) => (
                          <span className="text-ink-muted">{row.rank ?? "—"}</span>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <EmptyBlock
                    icon={Globe}
                    title="No referring domains yet"
                    description="Run an analysis first, then open this tab."
                  />
                )
              ) : null}
            </TabPanel>
          </ResultsPanel>
        ) : null}
      </PageStack>
    </DashboardShell>
  );
}
