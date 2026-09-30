"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  GitCompare,
  Link2,
  Minus,
  Search,
  Target,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { SearchPanel, ToolbarSelect } from "@/components/dashboard/SearchToolbar";
import {
  buttonPrimaryClass,
  DashboardAlert,
  DataTable,
  DifficultyBadge,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import {
  KEYWORD_RESEARCH_LOCATIONS,
  DEFAULT_LOCATION_CODE,
} from "@/lib/dashboard/locations";
import type {
  CompetitiveContentReport,
  DomainContentSnapshot,
} from "@/lib/dataforseo/competitive-analysis";

type BacklinksEntitlement = {
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  available: boolean;
};

function formatNum(value: number | null | undefined) {
  if (value == null) return "—";
  return Math.round(value).toLocaleString();
}

function truncateUrl(url: string, max = 48) {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

function VerdictBanner({ report }: { report: CompetitiveContentReport }) {
  const { verdict } = report;
  const tone =
    verdict.status === "leading"
      ? "border-emerald-500/40 bg-emerald-500/10"
      : verdict.status === "trailing"
        ? "border-amber-500/40 bg-amber-500/10"
        : "border-sky-500/40 bg-sky-500/10";
  const label =
    verdict.status === "leading"
      ? "Leading"
      : verdict.status === "trailing"
        ? "Trailing"
        : "Close race";

  return (
    <div className={`rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${tone}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Final comparison · {label}
          </p>
          <h3 className="font-display text-lg font-semibold text-snow sm:text-xl">
            {verdict.headline}
          </h3>
          <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
            {verdict.summary}
          </p>
        </div>
        <div className="rounded-xl border border-line/70 bg-bg/60 px-4 py-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-ink-muted">Score</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-snow">
            {verdict.scoreYou}
            <span className="mx-1 text-ink-muted">–</span>
            {verdict.scoreCompetitor}
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">
            You vs {report.competitorDomain}
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-line/60 text-[11px] uppercase tracking-wider text-ink-muted">
              <th className="py-2 pr-3 font-medium">Metric</th>
              <th className="py-2 pr-3 font-medium">You</th>
              <th className="py-2 pr-3 font-medium">Competitor</th>
              <th className="py-2 font-medium">Winner</th>
            </tr>
          </thead>
          <tbody>
            {verdict.facts.map((fact) => (
              <tr key={fact.metric} className="border-b border-line/40 last:border-0">
                <td className="py-2.5 pr-3">
                  <div className="font-medium text-snow">{fact.metric}</div>
                  <div className="text-[11px] text-ink-muted">{fact.note}</div>
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-snow">{fact.yours}</td>
                <td className="py-2.5 pr-3 tabular-nums text-snow">{fact.competitor}</td>
                <td className="py-2.5">
                  {fact.winner === "you" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <ArrowUpRight className="h-3.5 w-3.5" /> You
                    </span>
                  ) : fact.winner === "competitor" ? (
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      <ArrowDownRight className="h-3.5 w-3.5" /> Them
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-ink-muted">
                      <Minus className="h-3.5 w-3.5" /> Tie
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DomainSnapshotPanel({
  title,
  description,
  snapshot,
  accent,
  showLinks,
}: {
  title: string;
  description: string;
  snapshot: DomainContentSnapshot;
  accent?: boolean;
  showLinks?: boolean;
}) {
  return (
    <ResultsPanel title={title} description={description}>
      <MetricGrid className={`mb-5 ${showLinks ? "lg:grid-cols-4" : "lg:grid-cols-2"}`}>
        <MetricTile
          label="Organic keywords"
          value={snapshot.organicKeywords}
          icon={Search}
          featured={accent}
        />
        <MetricTile
          label="Est. traffic"
          value={
            snapshot.organicTraffic != null
              ? Math.round(snapshot.organicTraffic)
              : null
          }
          icon={Target}
          featured={accent}
        />
        {showLinks ? (
          <>
            <MetricTile
              label="Backlinks"
              value={snapshot.backlinks}
              icon={Link2}
            />
            <MetricTile
              label="Referring domains"
              value={snapshot.referringDomains}
              icon={FileText}
            />
          </>
        ) : null}
      </MetricGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Top ranking keywords
          </h4>
          {snapshot.topKeywords.length > 0 ? (
            <DataTable
              rows={snapshot.topKeywords}
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
                  key: "vol",
                  header: "Monthly vol",
                  cell: (row) => (
                    <span className="tabular-nums text-ink-muted">
                      {row.searchVolume != null
                        ? `${formatNum(row.searchVolume)} / mo`
                        : "—"}
                    </span>
                  ),
                },
                {
                  key: "rank",
                  header: "Pos",
                  cell: (row) => (
                    <span className="font-semibold text-accent">
                      {row.rank ?? "—"}
                    </span>
                  ),
                },
              ]}
            />
          ) : (
            <p className="text-sm text-ink-muted">No keyword data for this market.</p>
          )}
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Top pages / posts
          </h4>
          {snapshot.topPages.length > 0 ? (
            <DataTable
              rows={snapshot.topPages}
              rowKey={(row) => row.url}
              columns={[
                {
                  key: "url",
                  header: "URL",
                  cell: (row) => (
                    <a
                      href={row.url.startsWith("http") ? row.url : `https://${row.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-[220px] truncate text-xs text-accent hover:underline"
                      title={row.url}
                    >
                      {truncateUrl(row.url)}
                    </a>
                  ),
                },
                {
                  key: "traffic",
                  header: "Traffic",
                  cell: (row) => (
                    <span className="text-ink-muted">{formatNum(row.traffic)}</span>
                  ),
                },
                {
                  key: "kw",
                  header: "KWs",
                  cell: (row) => (
                    <span className="text-ink-muted">{formatNum(row.keywords)}</span>
                  ),
                },
              ]}
            />
          ) : (
            <p className="text-sm text-ink-muted">No page data for this market.</p>
          )}
        </div>
      </div>
    </ResultsPanel>
  );
}

export default function ContentGapPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [yourDomain, setYourDomain] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [locationCode, setLocationCode] = useState(DEFAULT_LOCATION_CODE);
  const [includeLinks, setIncludeLinks] = useState(false);
  const [backlinksEntitlement, setBacklinksEntitlement] =
    useState<BacklinksEntitlement | null>(null);
  const [data, setData] = useState<CompetitiveContentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backlinksLocked = Boolean(
    backlinksEntitlement &&
      !backlinksEntitlement.unlimited &&
      !backlinksEntitlement.available,
  );

  useEffect(() => {
    if (project?.domain && project.domain !== "example.com") {
      setYourDomain(project.domain);
    }
  }, [project]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/competitive/content-gap");
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json.entitlement) {
          setBacklinksEntitlement(json.entitlement as BacklinksEntitlement);
        }
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (backlinksLocked && includeLinks) setIncludeLinks(false);
  }, [backlinksLocked, includeLinks]);

  async function analyze() {
    if (!yourDomain.trim()) {
      setError("Enter your site domain.");
      return;
    }
    if (!competitor.trim()) {
      setError("Enter a competitor domain.");
      return;
    }
    if (includeLinks && backlinksLocked) {
      setError(
        "You've already used your one free Include backlinks run. Upgrade to unlock more.",
      );
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/competitive/content-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: yourDomain,
          competitor,
          locationCode,
          includeLinks,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json.data as CompetitiveContentReport);
      if (json.entitlement) {
        setBacklinksEntitlement(json.entitlement as BacklinksEntitlement);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell
      title="Content gap"
      description="Analyze your content first, then compare keywords, pages, backlinks, and referring domains against a competitor."
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Competitive content report"
          description="Credit-efficient mode: ~4 DataForSEO calls by default (your content first, then competitor). Keyword & page gaps are computed locally for accuracy. Link metrics are optional."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void analyze();
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-ink-muted">Your site</span>
                <input
                  className={inputClass}
                  value={yourDomain}
                  onChange={(e) => setYourDomain(e.target.value)}
                  placeholder="yoursite.com"
                  required
                  disabled={loading || projectLoading}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-ink-muted">Competitor</span>
                <input
                  className={inputClass}
                  value={competitor}
                  onChange={(e) => setCompetitor(e.target.value)}
                  placeholder="competitor.com"
                  required
                  disabled={loading}
                />
              </label>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
              <ToolbarSelect
                label="Location"
                value={locationCode}
                onChange={(v) => setLocationCode(Number(v))}
                options={KEYWORD_RESEARCH_LOCATIONS.map((l) => ({
                  value: l.code,
                  label: l.label,
                }))}
                disabled={loading}
              />
              <div className="flex flex-col gap-1 xl:pb-1">
                <label
                  className={`flex items-center gap-2 text-sm ${
                    backlinksLocked ? "text-ink-muted/60" : "text-ink-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={includeLinks && !backlinksLocked}
                    onChange={(e) => setIncludeLinks(e.target.checked)}
                    disabled={loading || backlinksLocked}
                    className="rounded border-line"
                  />
                  Include backlinks
                  {!backlinksEntitlement?.unlimited ? (
                    <span className="text-[11px] text-ink-muted">
                      {backlinksLocked
                        ? "(used — upgrade for more)"
                        : "(1 free use per account)"}
                    </span>
                  ) : null}
                </label>
              </div>
              <button type="submit" disabled={loading} className={buttonPrimaryClass}>
                {loading ? "Building report..." : "Generate comparison report"}
              </button>
            </div>
          </form>
        </SearchPanel>

        {loading ? (
          <LoadingBlock label="Analyzing your content, then comparing with the competitor..." />
        ) : null}

        {data && !loading ? (
          <>
            <VerdictBanner report={data} />
            <p className="text-xs text-ink-muted">
              Used ~{data.apiCallsUsed} DataForSEO call{data.apiCallsUsed === 1 ? "" : "s"}
              {data.includeLinks ? " (including backlink summaries)" : " (lite mode — links off)"}.
              Results cached briefly to avoid repeat spend.
            </p>

            <DomainSnapshotPanel
              title={`1. Your content · ${data.yourDomain}`}
              description="Organic metrics plus your highest-volume ranking keywords (monthly search volume). Pages are derived from those ranking URLs."
              snapshot={data.yours}
              accent
              showLinks={data.includeLinks}
            />

            <DomainSnapshotPanel
              title={`2. Competitor · ${data.competitorDomain}`}
              description="Same lite metrics for the competitor."
              snapshot={data.competitor}
              showLinks={data.includeLinks}
            />

            <ResultsPanel
              title="3. Topics & keywords you miss"
              description={`Head terms / topics ${data.competitorDomain} ranks for that ${data.yourDomain} does not (from volume-ranked samples).`}
            >
              {data.keywordGaps.length > 0 ? (
                <DataTable
                  rows={data.keywordGaps}
                  rowKey={(row) => row.keyword}
                  columns={[
                    {
                      key: "keyword",
                      header: "Topic / keyword",
                      cell: (row) => (
                        <span className="font-medium text-snow">{row.keyword}</span>
                      ),
                    },
                    {
                      key: "volume",
                      header: "Monthly vol",
                      cell: (row) => (
                        <span className="tabular-nums text-ink-muted">
                          {row.searchVolume != null
                            ? `${formatNum(row.searchVolume)} / mo`
                            : "—"}
                        </span>
                      ),
                    },
                    {
                      key: "difficulty",
                      header: "KD",
                      cell: (row) => <DifficultyBadge value={row.difficulty} />,
                    },
                    {
                      key: "rank",
                      header: "Their pos",
                      cell: (row) => (
                        <span className="font-semibold text-accent">
                          {row.competitorRank ?? "—"}
                        </span>
                      ),
                    },
                    {
                      key: "url",
                      header: "Their page",
                      cell: (row) => (
                        <span className="block max-w-xs truncate text-xs text-accent">
                          {row.competitorUrl ?? "—"}
                        </span>
                      ),
                    },
                  ]}
                />
              ) : (
                <p className="text-sm text-ink-muted">
                  No clear topic gaps in this keyword sample — try another competitor or market.
                </p>
              )}
            </ResultsPanel>

            <ResultsPanel
              title="4. Pages / blogs they cover (you don’t)"
              description={`Competitor URLs whose path is not on your sampled pages — missed articles, landing pages, or blog posts.`}
            >
              {data.pageGaps.length > 0 ? (
                <DataTable
                  rows={data.pageGaps}
                  rowKey={(row) => row.url}
                  columns={[
                    {
                      key: "topic",
                      header: "Topic (from URL)",
                      cell: (row) => (
                        <span className="font-medium text-snow">{row.topic}</span>
                      ),
                    },
                    {
                      key: "url",
                      header: "Competitor page",
                      cell: (row) => (
                        <a
                          href={
                            row.url.startsWith("http") ? row.url : `https://${row.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-[260px] truncate text-xs text-accent hover:underline"
                          title={row.url}
                        >
                          {truncateUrl(row.url, 56)}
                        </a>
                      ),
                    },
                    {
                      key: "traffic",
                      header: "Est. traffic",
                      cell: (row) => (
                        <span className="text-ink-muted">{formatNum(row.traffic)}</span>
                      ),
                    },
                    {
                      key: "kw",
                      header: "KWs",
                      cell: (row) => (
                        <span className="text-ink-muted">{formatNum(row.keywords)}</span>
                      ),
                    },
                  ]}
                />
              ) : (
                <p className="text-sm text-ink-muted">
                  No extra competitor pages found beyond overlapping paths in this sample
                  (both may only show the homepage).
                </p>
              )}
            </ResultsPanel>

            <ResultsPanel
              title="5. Shared keywords (both rank)"
              description="Where you already compete on the same queries — compare positions."
            >
              {data.sharedKeywords.length > 0 ? (
                <DataTable
                  rows={data.sharedKeywords}
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
                      key: "volume",
                      header: "Monthly vol",
                      cell: (row) => (
                        <span className="tabular-nums text-ink-muted">
                          {row.searchVolume != null
                            ? `${formatNum(row.searchVolume)} / mo`
                            : "—"}
                        </span>
                      ),
                    },
                    {
                      key: "yours",
                      header: "Your pos",
                      cell: (row) => (
                        <span className="font-semibold text-snow">
                          {row.yourRank ?? "—"}
                        </span>
                      ),
                    },
                    {
                      key: "theirs",
                      header: "Their pos",
                      cell: (row) => (
                        <span className="font-semibold text-accent">
                          {row.competitorRank ?? "—"}
                        </span>
                      ),
                    },
                  ]}
                />
              ) : (
                <p className="text-sm text-ink-muted">
                  No exact overlapping keywords in this sample (near-duplicates like
                  “cardrummy” vs “card rummy” count as different topics above).
                </p>
              )}
            </ResultsPanel>

            {data.includeLinks ? (
              <ResultsPanel
                title="6. Link totals"
                description="Backlink and referring-domain counts (optional). Detailed referring-domain lists are skipped to save credits."
              >
                <p className="text-sm text-ink-muted">
                  {data.yourDomain}: {formatNum(data.yours.backlinks)} backlinks ·{" "}
                  {formatNum(data.yours.referringDomains)} referring domains
                  <br />
                  {data.competitorDomain}: {formatNum(data.competitor.backlinks)}{" "}
                  backlinks · {formatNum(data.competitor.referringDomains)} referring
                  domains
                </p>
              </ResultsPanel>
            ) : null}
          </>
        ) : (
          !loading && (
            <EmptyBlock
              icon={GitCompare}
              title="Build a competitive content report"
              description="Enter your domain and a competitor. We’ll analyze your keywords, pages, backlinks, and referring domains first — then compare and tell you who’s performing better with facts."
            />
          )
        )}
      </PageStack>
    </DashboardShell>
  );
}
