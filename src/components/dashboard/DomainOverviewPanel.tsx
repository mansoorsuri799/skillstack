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

function ChangeBadge({ change }: { change: number | null }) {
  if (change === null || change === 0) return null;
  const positive = change > 0;
  return (
    <span
      className={`text-sm font-semibold tabular-nums ${
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
}) {
  return (
    <div className="flex min-h-[11rem] flex-col border-line px-4 py-4 first:pl-0 last:pr-0 md:border-r md:last:border-r-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-ink-muted">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 text-[10px] text-ink-muted/80">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <p className="font-display text-3xl font-semibold tabular-nums text-snow">
          {value}
        </p>
        {change !== undefined ? <ChangeBadge change={change ?? null} /> : null}
      </div>

      {footer ? <div className="mt-1 text-xs text-ink-muted">{footer}</div> : null}
      {children}

      {trend ? (
        <div className="mt-auto pt-3">
          <Sparkline values={trend} color={trendColor} filled={filledTrend} />
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
      className={`flex h-16 w-16 items-center justify-center rounded-full border-4 bg-bg/40 font-display text-2xl font-bold tabular-nums ${color} ${
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

export function DomainOverviewPanel({ data }: { data: DomainOverviewPanelData }) {
  const siteLabel = data.domain.replace(/^www\./i, "");

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
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

      <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-6 md:divide-x md:divide-y-0">
        <MetricColumn
          title="Health Score"
          value={<HealthScoreRing score={data.health.score} />}
          trend={[]}
        >
          <ul className="mt-3 space-y-1 text-xs text-ink-muted">
            <li className="flex justify-between gap-4">
              <span>Crawled</span>
              <span className="tabular-nums text-snow">
                {data.health.crawled?.toLocaleString() ?? "—"}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Redirects</span>
              <span className="tabular-nums text-snow">
                {data.health.redirects?.toLocaleString() ?? "—"}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Broken</span>
              <span className="tabular-nums text-snow">
                {data.health.broken?.toLocaleString() ?? "—"}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Blocked</span>
              <span className="tabular-nums text-snow">
                {data.health.blocked?.toLocaleString() ?? "—"}
              </span>
            </li>
          </ul>
        </MetricColumn>

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
          <ul className="mt-3 space-y-1 text-[11px]">
            {data.organicKeywords.byCountry.map((row) => (
              <li key={row.code} className="flex items-center justify-between gap-2">
                <span className="text-ink-muted">{row.code}</span>
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
