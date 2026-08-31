"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DomainOverviewToolbar } from "@/components/dashboard/DomainOverviewToolbar";
import { TabBar, TabPanel } from "@/components/dashboard/SearchToolbar";
import {
  buttonGhostClass,
  DashboardAlert,
  DataTable,
  EmptyBlock,
  LoadingBlock,
  ResultsPanel,
} from "@/components/dashboard/ui";
import type {
  BacklinkTableRow,
  BacklinksOverview,
  ReferringDomainRow,
  TopPageRow,
} from "@/lib/dataforseo/backlinks-dashboard";
import { formatBacklinkDate } from "@/lib/dataforseo/backlinks-dashboard";
import type { DomainScope } from "@/lib/dashboard/domain-overview-config";

type BacklinksTab = "backlinks" | "referring" | "pages";
type LinkMode = "one_per_domain" | "as_is";

const RECENT_KEY = "ss-backlinks-recent";
const ROWS_PER_PAGE_OPTIONS = [25, 50, 100] as const;
const DEFAULT_ROWS_PER_PAGE = 50;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeRecent(domains: string[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(domains.slice(0, 8)));
}

function pushRecent(domain: string) {
  writeRecent([domain, ...readRecent().filter((item) => item !== domain)].slice(0, 8));
}

function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 0), Math.max(totalPages - 1, 0));
}

function formatMetric(value: number | null, digits = 0) {
  if (value == null) return "—";
  return digits > 0 ? value.toFixed(digits) : value.toLocaleString();
}

function TablePaginationFooter({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = clampPage(page, totalPages);
  const start = totalItems === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min((safePage + 1) * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-xs text-ink-muted md:px-5">
      <span className="tabular-nums">
        {totalItems === 0 ? "0 of 0" : `${start}-${end} of ${totalItems.toLocaleString()}`}
      </span>
      <label className="flex items-center gap-2">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(0);
          }}
          className="rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs text-snow outline-none focus:border-accent/40"
        >
          {ROWS_PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-2">
        <span className="tabular-nums">
          Page {safePage + 1} of {totalPages}
        </span>
        <button
          type="button"
          disabled={safePage === 0}
          onClick={() => onPageChange(safePage - 1)}
          className={`${buttonGhostClass} px-2 py-1.5 text-xs disabled:opacity-40`}
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <button
          type="button"
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(safePage + 1)}
          className={`${buttonGhostClass} px-2 py-1.5 text-xs disabled:opacity-40`}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/70 bg-bg/40 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-snow">
        {value}
      </p>
    </div>
  );
}

function DualLineChart({
  title,
  subtitle,
  points,
  series,
}: {
  title: string;
  subtitle: string;
  points: Array<{ label?: string; shortLabel: string; [key: string]: string | number | undefined }>;
  series: Array<{ key: string; label: string; color: string }>;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="rounded-xl border border-line bg-bg p-4">
        <p className="text-sm font-medium text-snow">{title}</p>
        <p className="text-xs text-ink-muted">{subtitle}</p>
        <p className="py-10 text-center text-sm text-ink-muted">Chart data unavailable.</p>
      </div>
    );
  }

  const width = 360;
  const height = 190;
  const padding = { top: 16, right: 12, bottom: 36, left: 48 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allValues = points.flatMap((point) =>
    series.map((item) => Number(point[item.key] ?? 0)),
  );
  const max = Math.max(...allValues, 1);

  const pointCoords = points.map((point, index) => {
    const x =
      padding.left +
      (points.length <= 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
    return { x, point };
  });

  function seriesCoords(key: string) {
    return pointCoords.map(({ x, point }) => {
      const y = padding.top + innerH - (Number(point[key] ?? 0) / max) * innerH;
      return { x, y, point };
    });
  }

  const active = hoverIndex != null ? pointCoords[hoverIndex] : null;
  const activeSeries = series.map((item) => ({
    ...item,
    coord: hoverIndex != null ? seriesCoords(item.key)[hoverIndex] : null,
  }));

  function handlePointerMove(clientX: number, currentTarget: SVGSVGElement) {
    if (pointCoords.length === 0) return;
    const rect = currentTarget.getBoundingClientRect();
    const scaleX = width / rect.width;
    const mouseX = (clientX - rect.left) * scaleX;
    let closest = 0;
    let minDist = Infinity;
    pointCoords.forEach(({ x }, index) => {
      const dist = Math.abs(x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = index;
      }
    });
    setHoverIndex(closest);
  }

  return (
    <div className="rounded-xl border border-line bg-bg p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-snow">{title}</p>
        <p className="text-xs text-ink-muted">{subtitle}</p>
      </div>
      <div className="relative">
        {active ? (
          <div
            className="pointer-events-none absolute z-10 min-w-[10rem] rounded-lg border border-line bg-bg-elevated px-3 py-2 shadow-xl"
            style={{
              left: `clamp(0px, calc(${(active.x / width) * 100}% - 5rem), calc(100% - 10rem))`,
              top: 8,
            }}
          >
            <p className="text-sm font-medium text-snow">
              {active.point.label || active.point.shortLabel}
            </p>
            <div className="mt-1.5 space-y-1">
              {activeSeries.map((item) => (
                <p key={item.key} className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                  <span className="ml-auto font-semibold tabular-nums text-snow">
                    {Number(active.point[item.key] ?? 0).toLocaleString()}
                  </span>
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-48 w-full cursor-crosshair touch-none"
          onMouseMove={(e) => handlePointerMove(e.clientX, e.currentTarget)}
          onMouseLeave={() => setHoverIndex(null)}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            if (touch) handlePointerMove(touch.clientX, e.currentTarget);
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            if (touch) handlePointerMove(touch.clientX, e.currentTarget);
          }}
          onTouchEnd={() => setHoverIndex(null)}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + innerH * ratio;
            const value = Math.round(max * (1 - ratio));
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  x2={padding.left + innerW}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-ink-muted text-[9px]"
                >
                  {value >= 1000 ? `${Math.round(value / 1000)}K` : value}
                </text>
              </g>
            );
          })}

          {active ? (
            <line
              x1={active.x}
              x2={active.x}
              y1={padding.top}
              y2={padding.top + innerH}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
          ) : null}

          {series.map((item) => {
            const coords = seriesCoords(item.key);
            const line = coords.map((point) => `${point.x},${point.y}`).join(" ");
            return (
              <polyline
                key={item.key}
                points={line}
                fill="none"
                stroke={item.color}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {series.map((item) =>
            seriesCoords(item.key).map(({ x, y }, index) => {
              const isActive = hoverIndex === index;
              return (
                <g key={`${item.key}-${index}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 5 : 3}
                    fill={isActive ? "#fff" : item.color}
                    stroke={item.color}
                    strokeWidth={isActive ? 2 : 0}
                  />
                </g>
              );
            }),
          )}

          {pointCoords.map(({ x, point }, index) => (
            <text
              key={`${point.shortLabel}-${index}`}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className={`text-[9px] ${hoverIndex === index ? "fill-snow" : "fill-ink-muted"}`}
            >
              {point.shortLabel}
            </text>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-muted">
        {series.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function FlagBadge({ label }: { label: string }) {
  const tone =
    label === "Broken"
      ? "border-amber-400/40 text-amber-300"
      : "border-line text-ink-muted";
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] ${tone}`}>
      {label}
    </span>
  );
}

const backlinksMemoryCache = new Map<
  string,
  {
    overview: BacklinksOverview;
    backlinks?: BacklinkTableRow[];
    referring?: ReferringDomainRow[];
    pages?: TopPageRow[];
  }
>();

function getBacklinksCacheKey(domain: string, scope: string) {
  return `ss_bl_${domain.toLowerCase()}_${scope}`;
}

export function BacklinksDashboard({
  initialDomain = "",
  dataForSeoConfigured,
}: {
  initialDomain?: string;
  dataForSeoConfigured: boolean;
}) {
  const [domain, setDomain] = useState(initialDomain);
  const [scope, setScope] = useState<DomainScope>("subdomains");
  const [tab, setTab] = useState<BacklinksTab>("backlinks");
  const [linkMode, setLinkMode] = useState<LinkMode>("one_per_domain");
  const cachedInitial = initialDomain ? backlinksMemoryCache.get(getBacklinksCacheKey(initialDomain, "subdomains")) : undefined;
  const [overview, setOverview] = useState<BacklinksOverview | null>(() => cachedInitial?.overview ?? null);
  const [backlinkRows, setBacklinkRows] = useState<BacklinkTableRow[]>(() => cachedInitial?.backlinks ?? []);
  const [referringRows, setReferringRows] = useState<ReferringDomainRow[]>(() => cachedInitial?.referring ?? []);
  const [topPages, setTopPages] = useState<TopPageRow[]>(() => cachedInitial?.pages ?? []);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (cachedInitial?.overview) set.add("overview");
    if (cachedInitial?.backlinks) set.add(`backlinks:one_per_domain`);
    return set;
  });
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingTab, setLoadingTab] = useState(false);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_ROWS_PER_PAGE);

  useEffect(() => {
    if (initialDomain) {
      setDomain(initialDomain);
      const cached = backlinksMemoryCache.get(getBacklinksCacheKey(initialDomain, scope));
      if (cached) {
        setOverview(cached.overview);
        if (cached.backlinks) setBacklinkRows(cached.backlinks);
        if (cached.referring) setReferringRows(cached.referring);
        if (cached.pages) setTopPages(cached.pages);
      }
    }
  }, [initialDomain, scope]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  const hasOverview = overview != null;

  async function fetchTab(nextTab: BacklinksTab, mode = linkMode) {
    setLoadingTab(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/backlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, scope, tab: nextTab, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const rows = data.rows ?? [];
      const blKey = getBacklinksCacheKey(domain, scope);
      const existing = backlinksMemoryCache.get(blKey) || { overview: overview! };

      if (nextTab === "backlinks") {
        setBacklinkRows(rows);
        existing.backlinks = rows;
      }
      if (nextTab === "referring") {
        setReferringRows(rows);
        existing.referring = rows;
      }
      if (nextTab === "pages") {
        setTopPages(rows);
        existing.pages = rows;
      }
      backlinksMemoryCache.set(blKey, existing);

      const cacheKey = nextTab === "backlinks" ? `backlinks:${mode}` : nextTab;
      setLoadedTabs((prev) => new Set(prev).add(cacheKey));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tab data.");
    } finally {
      setLoadingTab(false);
    }
  }

  async function onAnalyze() {
    const nextDomain = domain.trim();
    if (!nextDomain) return;

    const blKey = getBacklinksCacheKey(nextDomain, scope);
    const cached = backlinksMemoryCache.get(blKey);
    if (cached) {
      setOverview(cached.overview);
      if (cached.backlinks) setBacklinkRows(cached.backlinks);
      if (cached.referring) setReferringRows(cached.referring);
      if (cached.pages) setTopPages(cached.pages);
    }

    setLoadingOverview(true);
    setError("");
    if (!cached) {
      setOverview(null);
      setBacklinkRows([]);
      setReferringRows([]);
      setTopPages([]);
      setLoadedTabs(new Set());
    }
    setPage(0);
    setTab("backlinks");

    try {
      const res = await fetch("/api/dashboard/backlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: nextDomain, scope, tab: "overview" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const nextOverview = data.overview ?? null;
      setOverview(nextOverview);
      if (nextOverview) {
        backlinksMemoryCache.set(blKey, { overview: nextOverview });
      }
      pushRecent(nextDomain);
      setRecent(readRecent());
      setLoadedTabs(new Set(["overview"]));
      await fetchTab("backlinks", linkMode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoadingOverview(false);
    }
  }

  function switchTab(next: BacklinksTab) {
    setTab(next);
    setPage(0);
    const cacheKey = next === "backlinks" ? `backlinks:${linkMode}` : next;
    if (hasOverview && !loadedTabs.has(cacheKey)) {
      void fetchTab(next, linkMode);
    }
  }

  function switchLinkMode(next: LinkMode) {
    setLinkMode(next);
    setPage(0);
    if (hasOverview) void fetchTab("backlinks", next);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(
      (tab === "backlinks"
        ? backlinkRows.length
        : tab === "referring"
          ? referringRows.length
          : topPages.length) / rowsPerPage,
    ),
  );
  const safePage = clampPage(page, totalPages);
  const paginatedBacklinks = backlinkRows.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );
  const paginatedReferring = referringRows.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );
  const paginatedPages = topPages.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  useEffect(() => {
    setPage(0);
  }, [tab, rowsPerPage, linkMode]);

  const updatedLabel = overview
    ? new Date(overview.updatedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="space-y-4">
      {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

      <DomainOverviewToolbar
        domain={domain}
        onDomainChange={setDomain}
        scope={scope}
        onScopeChange={setScope}
        locationCode={2840}
        onLocationChange={() => {}}
        sortBy="traffic"
        onSortChange={() => {}}
        onSubmit={() => void onAnalyze()}
        loading={loadingOverview}
        submitLabel="Search"
        showMarketFilters={false}
      />

      {recent.length > 0 ? (
        <div className="rounded-2xl border border-line bg-bg-elevated px-4 py-3 md:px-5">
          <p className="text-xs font-medium text-ink-muted">Recent searches</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {recent.slice(0, 6).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setDomain(item);
                  void onAnalyze();
                }}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink-muted transition hover:text-snow"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {loadingOverview ? (
        <LoadingBlock label="Analyzing backlink profile — summary, growth, and link data..." />
      ) : null}

      {!loadingOverview && !hasOverview ? (
        <EmptyBlock
          icon={Link2}
          title="Understand who links to a site"
          description="Choose scope, enter a domain, then click Search to load backlink metrics and tables."
        />
      ) : null}

      {hasOverview && overview ? (
        <>
          <div className="rounded-2xl border border-line bg-bg-elevated px-4 py-3 text-sm text-ink-muted md:px-5">
            {overview.scopeLabel} | Target:{" "}
            <span className="font-medium text-snow">{overview.domain}</span>
            {updatedLabel ? ` · Updated ${updatedLabel}` : null}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-bg-elevated p-4 md:p-5">
              <MetricCard label="Backlinks" value={formatMetric(overview.backlinks)} />
              <MetricCard
                label="Referring domains"
                value={formatMetric(overview.referringDomains)}
              />
              <MetricCard
                label="Referring pages"
                value={formatMetric(overview.referringPages)}
              />
              <MetricCard label="Rank" value={formatMetric(overview.rank)} />
              <MetricCard
                label="Backlink spam score"
                value={formatMetric(overview.backlinksSpamScore, 1)}
              />
              <MetricCard
                label="Target spam score"
                value={formatMetric(overview.targetSpamScore, 1)}
              />
              <MetricCard
                label="Broken backlinks"
                value={formatMetric(overview.brokenBacklinks)}
              />
              <MetricCard label="Broken pages" value={formatMetric(overview.brokenPages)} />
            </div>

            <DualLineChart
              title="Backlink growth"
              subtitle="Backlinks and referring domains over the last year"
              points={overview.growth}
              series={[
                { key: "backlinks", label: "Backlinks", color: "#38bdf8" },
                { key: "referringDomains", label: "Referring domains", color: "#2dd4bf" },
              ]}
            />

            <DualLineChart
              title="New vs lost"
              subtitle="Backlink acquisition and attrition"
              points={overview.newLost}
              series={[
                { key: "newBacklinks", label: "New backlinks", color: "#34d399" },
                { key: "lostBacklinks", label: "Lost backlinks", color: "#f87171" },
              ]}
            />
          </div>

          <ResultsPanel
            title={`Backlink data for ${overview.domain}`}
            description="Explore individual links, referring domains, and top linked pages."
          >
            <TabBar
              tabs={[
                { id: "backlinks", label: "Backlinks", count: backlinkRows.length || undefined },
                {
                  id: "referring",
                  label: "Referring domains",
                  count: referringRows.length || undefined,
                },
                { id: "pages", label: "Top pages", count: topPages.length || undefined },
              ]}
              active={tab}
              onChange={(next) => switchTab(next as BacklinksTab)}
            />

            <TabPanel>
              {tab === "backlinks" ? (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-ink-muted">
                      See individual links pointing to your target, including source page, anchor
                      text, and link quality signals.
                    </p>
                    <div className="inline-flex rounded-lg border border-line bg-bg p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => switchLinkMode("one_per_domain")}
                        className={`rounded-md px-3 py-1.5 ${
                          linkMode === "one_per_domain"
                            ? "bg-white/10 text-snow"
                            : "text-ink-muted"
                        }`}
                      >
                        One per domain
                      </button>
                      <button
                        type="button"
                        onClick={() => switchLinkMode("as_is")}
                        className={`rounded-md px-3 py-1.5 ${
                          linkMode === "as_is" ? "bg-white/10 text-snow" : "text-ink-muted"
                        }`}
                      >
                        All links
                      </button>
                    </div>
                  </div>

                  {loadingTab ? (
                    <LoadingBlock label="Loading backlinks..." />
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-line">
                      <DataTable
                        minWidth="980px"
                        rows={paginatedBacklinks}
                        rowKey={(row) => row.id}
                        columns={[
                          {
                            key: "source",
                            header: "Source",
                            cell: (row) => (
                              <div className="min-w-[220px]">
                                <p className="font-medium text-snow">{row.domainFrom}</p>
                                <a
                                  href={row.urlFrom}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-xs text-accent hover:underline"
                                >
                                  <span className="max-w-xs truncate">{row.urlFrom}</span>
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              </div>
                            ),
                          },
                          {
                            key: "target",
                            header: "Target",
                            cell: (row) => (
                              <a
                                href={row.urlTo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-xs items-center gap-1 truncate text-accent hover:underline"
                              >
                                {row.urlTo}
                                <ExternalLink className="h-3 w-3 shrink-0" />
                              </a>
                            ),
                          },
                          {
                            key: "anchor",
                            header: "Anchor",
                            cell: (row) => (
                              <span className="line-clamp-3 max-w-xs text-sm text-ink-muted">
                                {row.anchor || "—"}
                              </span>
                            ),
                          },
                          {
                            key: "flags",
                            header: "Flags",
                            cell: (row) => (
                              <div className="flex flex-wrap gap-1">
                                {row.flags.length > 0 ? (
                                  row.flags.map((flag) => <FlagBadge key={flag} label={flag} />)
                                ) : (
                                  <span className="text-ink-muted">—</span>
                                )}
                              </div>
                            ),
                          },
                          {
                            key: "link",
                            header: "Link",
                            cell: (row) => (
                              <span className="tabular-nums text-ink-muted">
                                {row.linksCount ?? "—"}
                              </span>
                            ),
                          },
                          {
                            key: "da",
                            header: "DA",
                            cell: (row) => (
                              <span className="tabular-nums text-ink-muted">
                                {row.domainAuthority ?? "—"}
                              </span>
                            ),
                          },
                          {
                            key: "spam",
                            header: "Spam",
                            cell: (row) => (
                              <span className="tabular-nums text-ink-muted">
                                {row.spam ?? "—"}
                              </span>
                            ),
                          },
                          {
                            key: "firstSeen",
                            header: "First seen",
                            cell: (row) => (
                              <span className="text-ink-muted">
                                {formatBacklinkDate(row.firstSeen)}
                              </span>
                            ),
                          },
                        ]}
                      />
                      <TablePaginationFooter
                        page={safePage}
                        pageSize={rowsPerPage}
                        totalItems={backlinkRows.length}
                        onPageChange={setPage}
                        onPageSizeChange={setRowsPerPage}
                      />
                    </div>
                  )}
                </>
              ) : null}

              {tab === "referring" ? (
                loadingTab ? (
                  <LoadingBlock label="Loading referring domains..." />
                ) : (
                  <div className="overflow-hidden rounded-xl border border-line">
                    <DataTable
                      minWidth="920px"
                      rows={paginatedReferring}
                      rowKey={(row) => row.domain}
                      columns={[
                        {
                          key: "domain",
                          header: "Domain",
                          cell: (row) => (
                            <a
                              href={`https://${row.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                            >
                              {row.domain}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ),
                        },
                        {
                          key: "backlinks",
                          header: "Backlinks",
                          cell: (row) => (
                            <span className="tabular-nums text-ink-muted">
                              {row.backlinks?.toLocaleString() ?? "—"}
                            </span>
                          ),
                        },
                        {
                          key: "referringPages",
                          header: "Referring pages",
                          cell: (row) => (
                            <span className="tabular-nums text-ink-muted">
                              {row.referringPages?.toLocaleString() ?? "—"}
                            </span>
                          ),
                        },
                        {
                          key: "rank",
                          header: "Rank",
                          cell: (row) => (
                            <span className="tabular-nums text-ink-muted">{row.rank ?? "—"}</span>
                          ),
                        },
                        {
                          key: "spam",
                          header: "Spam",
                          cell: (row) => (
                            <span className="tabular-nums text-ink-muted">
                              {row.spam != null ? row.spam.toFixed(1) : "—"}
                            </span>
                          ),
                        },
                        {
                          key: "firstSeen",
                          header: "First seen",
                          cell: (row) => (
                            <span className="text-ink-muted">
                              {formatBacklinkDate(row.firstSeen)}
                            </span>
                          ),
                        },
                        {
                          key: "issues",
                          header: "Issues",
                          cell: (row) => (
                            <div className="text-xs text-ink-muted">
                              {row.brokenBacklinks != null ? (
                                <p>Broken links: {row.brokenBacklinks}</p>
                              ) : null}
                              {row.brokenPages != null ? (
                                <p>Broken pages: {row.brokenPages}</p>
                              ) : null}
                              {row.brokenBacklinks == null && row.brokenPages == null ? "—" : null}
                            </div>
                          ),
                        },
                      ]}
                    />
                    <TablePaginationFooter
                      page={safePage}
                      pageSize={rowsPerPage}
                      totalItems={referringRows.length}
                      onPageChange={setPage}
                      onPageSizeChange={setRowsPerPage}
                    />
                  </div>
                )
              ) : null}

              {tab === "pages" ? (
                loadingTab ? (
                  <LoadingBlock label="Loading top pages..." />
                ) : (
                  <div className="overflow-hidden rounded-xl border border-line">
                    <DataTable
                      minWidth="760px"
                      rows={paginatedPages}
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
                              className="inline-flex max-w-md items-center gap-1 truncate text-accent hover:underline"
                            >
                              {row.page}
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                            </a>
                          ),
                        },
                        {
                          key: "backlinks",
                          header: "Backlinks",
                          cell: (row) => (
                            <span className="tabular-nums text-ink-muted">
                              {row.backlinks?.toLocaleString() ?? "—"}
                            </span>
                          ),
                        },
                        {
                          key: "referringDomains",
                          header: "Referring domains",
                          cell: (row) => (
                            <span className="tabular-nums text-ink-muted">
                              {row.referringDomains?.toLocaleString() ?? "—"}
                            </span>
                          ),
                        },
                        {
                          key: "rank",
                          header: "Rank",
                          cell: (row) => (
                            <span className="tabular-nums text-ink-muted">{row.rank ?? "—"}</span>
                          ),
                        },
                        {
                          key: "brokenBacklinks",
                          header: "Broken backlinks",
                          cell: (row) => (
                            <span className="tabular-nums text-ink-muted">
                              {row.brokenBacklinks?.toLocaleString() ?? "—"}
                            </span>
                          ),
                        },
                      ]}
                    />
                    <TablePaginationFooter
                      page={safePage}
                      pageSize={rowsPerPage}
                      totalItems={topPages.length}
                      onPageChange={setPage}
                      onPageSizeChange={setRowsPerPage}
                    />
                  </div>
                )
              ) : null}
            </TabPanel>
          </ResultsPanel>
        </>
      ) : null}
    </div>
  );
}
