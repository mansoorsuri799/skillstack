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
        flush ? "" : "p-5 md:p-6"
      } ${className}`}
    >
      {title ? (
        <div className={`${flush ? "border-b border-line px-5 py-4 md:px-6" : "mb-5"}`}>
          <h2 className="font-display text-base font-semibold text-snow">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-ink-muted">{description}</p>
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
        <div className="border-b border-line bg-gradient-to-r from-accent/[0.05] to-transparent px-5 py-4 md:px-6">
          <h2 className="font-display text-base font-semibold text-snow">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  icon: Icon,
  featured = false,
}: {
  label: string;
  value: string | number | null;
  hint?: string;
  icon?: LucideIcon;
  featured?: boolean;
}) {
  const display =
    value === null || value === undefined
      ? "—"
      : typeof value === "number"
        ? value.toLocaleString()
        : value;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition hover:border-accent/25 ${
        featured
          ? "border-accent/20 bg-gradient-to-br from-accent/[0.12] via-accent/[0.04] to-transparent p-5 sm:min-h-[8.5rem]"
          : "border-line bg-bg p-4 hover:bg-white/[0.02]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {label}
        </p>
        {Icon ? (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              featured
                ? "bg-accent/20 text-accent"
                : "bg-white/5 text-ink-muted group-hover:text-accent"
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p
        className={`mt-3 font-display font-semibold tabular-nums text-snow ${
          featured ? "text-3xl md:text-4xl" : "text-2xl"
        }`}
      >
        {display}
      </p>
      {hint ? <p className="mt-1.5 text-xs text-ink-muted">{hint}</p> : null}
    </div>
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
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {children}
    </div>
  );
}

export function DashboardAlert({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: "info" | "error" | "success";
}) {
  const styles = {
    info: "border-accent/30 bg-accent/10 text-ink",
    error: "border-red-500/30 bg-red-500/10 text-red-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  }[variant];

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}

export function LoadingBlock({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line py-16 text-sm text-ink-muted">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      {label}
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
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  minWidth = "640px",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  minWidth?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-line bg-bg/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted ${col.className ?? ""}`}
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
                  <td key={col.key} className={`px-4 py-3.5 ${col.className ?? ""}`}>
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
    <div className={`mx-auto max-w-6xl space-y-6 ${className}`}>{children}</div>
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
    value <= 20 ? "Easy" : value <= 40 ? "Medium" : value <= 60 ? "Hard" : "Very hard";
  const color =
    value <= 20
      ? "text-emerald-400"
      : value <= 40
        ? "text-yellow-400"
        : value <= 60
          ? "text-orange-400"
          : "text-red-400";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-2 py-0.5 text-xs ${color}`}
    >
      {value} · {tier}
    </span>
  );
}

export function BoolBadge({ value, trueLabel = "Yes", falseLabel = "No" }: { value: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        value
          ? "bg-emerald-500/10 text-emerald-300"
          : "bg-white/5 text-ink-muted"
      }`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}
