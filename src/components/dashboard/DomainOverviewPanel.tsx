"use client";

import type { ReactNode } from "react";
import { BadgeCheck, ChevronDown } from "lucide-react";

export type DomainOverviewPanelData = {
  domain: string;
  scopeLabel: string;
  health: {
    score: number | null;
    crawled: number | null;
    redirects: number | null;
    broken: number | null;
    blocked: number | null;
  };
  domainRating: MetricBlock;
  referringDomains: MetricBlock;
  googleVisitors: MetricBlock & { connected: boolean };
  organicTraffic: MetricBlock & { valueUsd: number | null };
  organicKeywords: MetricBlock & {
    byCountry: Array<{ code: string; count: number | null; change: number | null }>;
  };
};

type MetricBlock = {
  value: number | null;
  change: number | null;
  trend: number[];
};

function formatCompact(value: number | null, currency = false): string {
  if (value === null || value === undefined) return "—";
  const prefix = currency ? "$" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${prefix}${(value / 1_000).toFixed(1)}K`;
  }
  return `${prefix}${value.toLocaleString()}`;
}

function formatStat(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString();
}

function ChangeBadge({ change }: { change: number | null }) {
  if (change === null || change === 0) return null;
  const positive = change > 0;
  return (
    <span
      className={`text-xs font-semibold tabular-nums sm:text-sm ${
        positive ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {positive ? "+" : ""}
      {formatCompact(change)}
    </span>
  );
}

function Sparkline({
  values,
  color = "var(--color-accent)",
  filled = false,
}: {
  values: number[];
  color?: string;
  filled?: boolean;
}) {
  if (values.length < 2) {
    return (
      <svg viewBox="0 0 120 32" className="h-8 w-full opacity-40" aria-hidden>
        <line x1="0" y1="16" x2="120" y2="16" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 120;
      const y = 30 - ((value - min) / range) * 26;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPath =
    filled && values.length > 1
      ? `M0,32 L${points.replace(/ /g, " L")} L120,32 Z`
      : null;

  return (
    <svg viewBox="0 0 120 32" className="h-8 w-full" aria-hidden>
      {fillPath ? (
        <path d={fillPath} fill={color} fillOpacity="0.15" stroke="none" />
      ) : null}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}

function MetricColumn({
  title,
  subtitle,
  value,
  change,
  trend,
  trendColor,
  filledTrend = false,
  footer,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  value: ReactNode;
  change?: number | null;
  trend?: number[];
  trendColor?: string;
  filledTrend?: boolean;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const showTrend = Boolean(trend && trend.length > 0);

  return (
    <div
      className={`flex min-h-[12.5rem] flex-col px-4 py-5 sm:px-5 lg:min-h-[13.5rem] ${className}`}
    >
      <div>
        <p className="text-xs font-medium text-ink-muted">{title}</p>
        {subtitle ? (
          <p className="mt-1 text-[11px] leading-snug text-ink-muted/80">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-4 flex items-end gap-2">
        <div className="font-display text-3xl font-semibold tabular-nums leading-none text-snow">
          {value}
        </div>
        {change !== undefined ? <ChangeBadge change={change ?? null} /> : null}
      </div>

      {footer ? <div className="mt-2 text-xs leading-relaxed text-ink-muted">{footer}</div> : null}
      {children ? <div className="mt-3 flex-1">{children}</div> : null}

      {showTrend ? (
        <div className="mt-auto pt-4">
          <Sparkline values={trend!} color={trendColor} filled={filledTrend} />
        </div>
      ) : null}
    </div>
  );
}

function HealthScoreRing({ score }: { score: number | null }) {
  const display = score ?? "—";
  const color =
    score == null
      ? "text-ink-muted"
      : score >= 80
        ? "text-emerald-400"
        : score >= 50
          ? "text-amber-400"
          : "text-red-400";

  return (
    <div
      className={`flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full border-[5px] bg-bg/40 font-display text-2xl font-bold tabular-nums ${color} ${
        score != null && score >= 80
          ? "border-emerald-500/40"
          : score != null && score >= 50
            ? "border-amber-500/40"
            : "border-line"
      }`}
    >
      {display}
    </div>
  );
}

function HealthScoreColumn({
  health,
  className = "",
}: {
  health: DomainOverviewPanelData["health"];
  className?: string;
}) {
  const stats = [
    { label: "Crawled", value: health.crawled },
    { label: "Redirects", value: health.redirects },
    { label: "Broken", value: health.broken },
    { label: "Blocked", value: health.blocked },
  ];

  return (
    <div
      className={`flex min-h-[12.5rem] flex-col px-4 py-5 sm:px-5 lg:min-h-[13.5rem] ${className}`}
    >
      <p className="text-xs font-medium text-ink-muted">Health Score</p>

      <div className="mt-4 flex flex-col gap-4">
        <HealthScoreRing score={health.score} />

        <div className="grid grid-cols-2 gap-2.5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-line/70 bg-bg/60 px-3 py-2.5"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                {stat.label}
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold tabular-nums leading-none text-snow">
                {formatStat(stat.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DomainOverviewPanel({ data }: { data: DomainOverviewPanelData }) {
  const siteLabel = data.domain.replace(/^www\./i, "");

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-bg text-xs font-semibold uppercase text-accent">
            {siteLabel.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate font-display text-base font-semibold capitalize text-snow">
                {siteLabel.split(".")[0]}
              </h2>
              <BadgeCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            </div>
            <button
              type="button"
              className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted"
            >
              <span className="truncate">{data.scopeLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
        <span className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink-muted">
          Overview
        </span>
      </div>

      <div className="divide-y divide-line xl:grid xl:grid-cols-[minmax(13rem,1.35fr)_repeat(5,minmax(0,1fr))] xl:divide-x xl:divide-y-0">
        <HealthScoreColumn health={data.health} />

        <MetricColumn
          title="Domain Rating"
          value={data.domainRating.value ?? "—"}
          change={data.domainRating.change}
          trend={data.domainRating.trend}
          trendColor="#a78bfa"
        />

        <MetricColumn
          title="Referring domains"
          value={formatCompact(data.referringDomains.value)}
          change={data.referringDomains.change}
          trend={data.referringDomains.trend}
          trendColor="#60a5fa"
          filledTrend
        />

        <MetricColumn
          title="Total visitors"
          subtitle="Google Search Console"
          value={formatCompact(data.googleVisitors.value)}
          change={data.googleVisitors.change}
          trend={data.googleVisitors.trend}
          trendColor="#fb923c"
          footer={
            data.googleVisitors.connected
              ? "Last 28 days"
              : "Connect GSC for real traffic"
          }
        />

        <MetricColumn
          title="Organic traffic"
          value={formatCompact(data.organicTraffic.value)}
          change={data.organicTraffic.change}
          trend={data.organicTraffic.trend}
          trendColor="#fb923c"
          filledTrend
          footer={
            data.organicTraffic.valueUsd != null
              ? `Value: ${formatCompact(data.organicTraffic.valueUsd, true)}`
              : undefined
          }
        />

        <MetricColumn
          title="Organic keywords"
          value={formatCompact(data.organicKeywords.value)}
          change={data.organicKeywords.change}
          trend={data.organicKeywords.trend}
          trendColor="#fb923c"
        >
          <ul className="space-y-2.5">
            {data.organicKeywords.byCountry.map((row) => (
              <li
                key={row.code}
                className="flex items-center justify-between gap-3 text-[11px] leading-none"
              >
                <span className="min-w-[1.75rem] font-medium text-ink-muted">{row.code}</span>
                <span className="flex items-center gap-2 tabular-nums text-snow">
                  {row.count?.toLocaleString() ?? "—"}
                  <ChangeBadge change={row.change} />
                </span>
              </li>
            ))}
          </ul>
        </MetricColumn>
      </div>
    </section>
  );
}
