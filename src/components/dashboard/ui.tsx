"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function DashboardCard({
  title,
  description,
  children,
  className = "",
  flush = false,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] ${
        flush ? "" : "p-4 sm:p-5 md:p-6"
      } ${className}`}
    >
      {title ? (
        <div className={`${flush ? "border-b border-line px-4 py-3.5 sm:px-5 sm:py-4 md:px-6" : "mb-4 sm:mb-5"}`}>
          <h2 className="font-display text-sm sm:text-base font-semibold text-snow">{title}</h2>
          {description ? (
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-ink-muted">{description}</p>
          ) : null}
        </div>
      ) : null}
      {flush ? children : children}
    </section>
  );
}

export function ResultsPanel({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] ${className}`}
    >
      {title ? (
        <div className="border-b border-line bg-gradient-to-r from-accent/[0.05] to-transparent px-4 py-3 sm:px-5 sm:py-4 md:px-6">
          <h2 className="font-display text-sm sm:text-base font-semibold text-snow">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs sm:text-sm text-ink-muted">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="p-3.5 sm:p-5 md:p-6">{children}</div>
    </section>
  );
}

export function MetricGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 ${className}`}
    >
      {children}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  subvalue,
  hint,
  icon: Icon,
  trend,
  featured = false,
}: {
  label: string;
  value: string | number | null;
  subvalue?: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: number; label: string };
  featured?: boolean;
}) {
  const displayValue = value === null || value === undefined ? "—" : value;
  const secondaryText = subvalue ?? hint;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all ${
        featured
          ? "border-accent/30 bg-gradient-to-br from-accent/[0.08] to-transparent shadow-[0_0_30px_-10px_rgba(45,212,191,0.15)]"
          : "border-line bg-bg-elevated hover:border-line/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </p>
        {Icon ? (
          <span
            className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl ${
              featured
                ? "bg-accent/20 text-accent"
                : "bg-white/5 text-ink-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        ) : null}
      </div>

      <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
        <span
          className={`font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight ${
            featured ? "text-snow" : "text-snow"
          }`}
        >
          {displayValue}
        </span>
        {secondaryText ? (
          <span className="text-xs text-ink-muted truncate">{secondaryText}</span>
        ) : null}
      </div>

      {trend ? (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={`font-medium ${
              trend.value >= 0 ? "text-accent" : "text-red-400"
            }`}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-ink-muted">{trend.label}</span>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardAlert({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: "info" | "warning" | "error" | "success";
}) {
  const styles =
    variant === "error"
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : variant === "warning"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
        : variant === "success"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-accent/20 bg-accent/10 text-snow";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}

export function LoadingBlock({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center py-12 w-full ${className}`}>
      <div className="flex items-center gap-2.5 rounded-full border border-line bg-bg-elevated px-4 py-2 text-xs text-ink-muted shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
        </span>
        <span className="font-medium text-snow">{label || "Loading..."}</span>
      </div>
    </div>
  );
}

export function EmptyBlock({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-bg/50 px-6 py-14 text-center">
      {Icon ? (
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <h3 className="font-display text-lg font-semibold text-snow">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  emptyMessage = "No data to display.",
  minWidth = "600px",
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T, index: number) => string;
  emptyMessage?: string;
  minWidth?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-bg/30 px-4 py-10 text-center text-xs sm:text-sm text-ink-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs sm:text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-line bg-bg/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3.5 py-2.5 sm:px-4 sm:py-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                className="border-b border-line/50 transition hover:bg-white/[0.02] last:border-0"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-3.5 py-3 sm:px-4 sm:py-3.5 ${col.className ?? ""}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PageStack({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-6xl space-y-4 sm:space-y-6 ${className}`}>{children}</div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm text-snow outline-none transition placeholder:text-ink-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/20";

export const buttonPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:bg-accent-deep disabled:opacity-50";

export const buttonGhostClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:border-accent/30 hover:bg-white/5 disabled:opacity-50";

export function DifficultyBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-ink-muted">—</span>;
  const tier =
    value < 30
      ? { label: "Easy", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" }
      : value < 60
        ? { label: "Medium", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" }
        : { label: "Hard", color: "text-red-400 bg-red-400/10 border-red-400/20" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tier.color}`}
    >
      <span className="tabular-nums font-semibold">{value}</span>
      <span className="text-[10px] uppercase tracking-wider">{tier.label}</span>
    </span>
  );
}
