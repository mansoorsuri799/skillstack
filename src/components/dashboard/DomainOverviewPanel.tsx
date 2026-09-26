"use client";

import type { ReactNode } from "react";
import { BadgeCheck, ChevronDown } from "lucide-react";

export type DomainOverviewPanelData = {
  domain: string;
  scopeLabel: string;
  marketLabel?: string | null;
  domainRating: MetricBlock;
  backlinks?: MetricBlock & { allTime?: number | null };
  referringDomains: MetricBlock;
  googleVisitors: MetricBlock & { connected: boolean };
  organicTraffic: MetricBlock & {
    valueUsd: number | null;
    valueChange?: number | null;
  };
  organicKeywords: MetricBlock & {
    top3?: number | null;
    byCountry: Array<{
      code: string;
      count: number | null;
      change: number | null;
      traffic?: number | null;
    }>;
  };
  topKeywords?: Array<{
    keyword: string;
    rank: number | null;
    etv?: number | null;
    searchVolume?: number | null;
    url?: string | null;
  }>;
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
  if (currency) {
    return `${prefix}${value.toFixed(value < 10 ? 2 : 0)}`;
  }
  return `${prefix}${Math.round(value).toLocaleString()}`;
}

function ChangeBadge({ change }: { change: number | null | undefined }) {
  if (change === null || change === undefined || change === 0) return null;
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

function MetricTile({
  title,
  value,
  change,
  footer,
  accent = false,
}: {
  title: string;
  value: ReactNode;
  change?: number | null;
  footer?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-ink-muted">{title}</p>
      <div className="mt-2 flex items-end gap-2">
        <div
          className={`font-display text-3xl font-semibold tabular-nums leading-none ${
            accent ? "text-accent" : "text-snow"
          }`}
        >
          {value}
        </div>
        <ChangeBadge change={change} />
      </div>
      {footer ? <div className="mt-2 text-xs leading-relaxed text-ink-muted">{footer}</div> : null}
    </div>
  );
}

function RatingRing({ value, label }: { value: number | null; label: string }) {
  const score = value ?? 0;
  const pct = Math.max(0, Math.min(100, score));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-[5.25rem] w-[5.25rem] items-center justify-center">
        <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-line"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="text-violet-400"
          />
        </svg>
        <span className="font-display text-2xl font-bold tabular-nums text-snow">
          {value ?? "—"}
        </span>
      </div>
      <div>
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        <p className="mt-1 text-[11px] text-ink-muted/80">out of 100</p>
      </div>
    </div>
  );
}

export function DomainOverviewPanel({ data }: { data: DomainOverviewPanelData }) {
  const siteLabel = data.domain.replace(/^www\./i, "");
  const topKeywords = (data.topKeywords ?? []).slice(0, 8);
  const countryRows = data.organicKeywords.byCountry
    .filter((row) => (row.count ?? 0) > 0 || (row.traffic ?? 0) > 0)
    .slice(0, 5);

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
        <div className="flex items-center gap-2">
          {data.marketLabel ? (
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">
              Market: {data.marketLabel}
            </span>
          ) : null}
          <span className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-ink-muted">
            Overview
          </span>
        </div>
      </div>

      <div className="grid divide-y divide-line lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {/* Backlink profile — Ahrefs-style */}
        <div className="space-y-5 p-5 md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Backlink profile
          </p>
          <RatingRing value={data.domainRating.value} label="Domain Rating" />
          <div className="grid grid-cols-2 gap-5">
            <MetricTile
              title="Backlinks"
              value={formatCompact(data.backlinks?.value ?? null)}
              change={data.backlinks?.change}
              accent
              footer={
                data.backlinks?.allTime != null
                  ? `All time ${formatCompact(data.backlinks.allTime)}`
                  : undefined
              }
            />
            <MetricTile
              title="Ref. domains"
              value={formatCompact(data.referringDomains.value)}
              change={data.referringDomains.change}
              accent
            />
          </div>
        </div>

        {/* Search — Ahrefs-style */}
        <div className="space-y-5 p-5 md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Search
          </p>
          <div className="grid grid-cols-2 gap-5">
            <MetricTile
              title="Organic keywords"
              value={formatCompact(data.organicKeywords.value)}
              change={data.organicKeywords.change}
              accent
              footer={
                data.organicKeywords.top3 != null
                  ? `Top 3 ${formatCompact(data.organicKeywords.top3)}`
                  : undefined
              }
            />
            <MetricTile
              title="Organic traffic"
              value={formatCompact(data.organicTraffic.value)}
              change={data.organicTraffic.change}
              accent
              footer={
                <span className="inline-flex flex-col gap-0.5">
                  {data.organicTraffic.valueUsd != null ? (
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <span>Value {formatCompact(data.organicTraffic.valueUsd, true)}</span>
                      <ChangeBadge change={data.organicTraffic.valueChange} />
                    </span>
                  ) : null}
                  <span>
                    Est. monthly
                    {data.marketLabel ? ` · ${data.marketLabel}` : ""}
                    {" "}· DataForSEO ETV
                  </span>
                </span>
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-ink-muted">
                {data.googleVisitors.connected ? "GSC visitors (28d)" : "Google visitors"}
              </p>
              <p className="mt-2 font-display text-xl font-semibold tabular-nums text-snow">
                {formatCompact(data.googleVisitors.value)}
              </p>
              {!data.googleVisitors.connected ? (
                <p className="mt-1 text-[11px] text-ink-muted">Connect GSC for real clicks</p>
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-ink-muted">Keywords by country</p>
              {countryRows.length > 0 ? (
                <ul className="space-y-1.5">
                  {countryRows.map((row) => (
                    <li
                      key={row.code}
                      className="flex items-center justify-between gap-3 text-[11px] leading-none"
                    >
                      <span className="font-medium text-ink-muted">{row.code}</span>
                      <span className="tabular-nums text-snow">
                        {row.count?.toLocaleString() ?? "—"}
                        {row.traffic != null ? (
                          <span className="ml-2 text-ink-muted">
                            · {formatCompact(row.traffic)} traf.
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-ink-muted">No country rankings yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top traffic keywords — what drives visits */}
      <div className="border-t border-line px-5 py-5 md:px-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Top keywords by traffic
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Keywords sending the most estimated organic visits
            </p>
          </div>
        </div>

        {topKeywords.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-ink-muted">
            No ranking keywords found for this market yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-bg/50 text-[11px] uppercase tracking-[0.08em] text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Keyword</th>
                  <th className="px-4 py-2.5 font-medium">Traffic</th>
                  <th className="px-4 py-2.5 font-medium">Volume</th>
                  <th className="px-4 py-2.5 font-medium">Rank</th>
                  <th className="px-4 py-2.5 font-medium">Page</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {topKeywords.map((row) => (
                  <tr key={`${row.keyword}-${row.url ?? ""}`} className="hover:bg-bg/40">
                    <td className="px-4 py-2.5 font-medium text-snow">{row.keyword}</td>
                    <td className="px-4 py-2.5 tabular-nums text-accent">
                      {formatCompact(row.etv ?? null)}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-ink-muted">
                      {row.searchVolume?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-ink-muted">
                      {row.rank != null ? `#${row.rank}` : "—"}
                    </td>
                    <td className="max-w-[14rem] truncate px-4 py-2.5 text-xs text-ink-muted">
                      {row.url ? (
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-accent hover:underline"
                        >
                          {row.url.replace(/^https?:\/\//i, "")}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
