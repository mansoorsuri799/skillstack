"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { buttonPrimaryClass, inputClass } from "@/components/dashboard/ui";

export function SearchPanel({
  title = "Search",
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      <div className="border-b border-line bg-gradient-to-r from-accent/[0.06] to-transparent px-5 py-4 md:px-6">
        <h2 className="font-display text-sm font-semibold text-snow">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function SearchToolbar({
  value,
  onChange,
  onSubmit,
  placeholder,
  loading,
  submitLabel = "Search",
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  loading?: boolean;
  submitLabel?: string;
  children?: ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-3 xl:flex-row xl:items-end"
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          className={`${inputClass} pl-10`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
        />
      </div>
      {children ? (
        <div className="flex flex-wrap items-end gap-3">{children}</div>
      ) : null}
      <button type="submit" disabled={loading} className={`${buttonPrimaryClass} shrink-0`}>
        {loading ? "Searching..." : submitLabel}
      </button>
    </form>
  );
}

export function ToolbarSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  label?: string;
}) {
  return (
    <label className="flex shrink-0 flex-col gap-1.5 text-xs font-medium text-ink-muted">
      {label ? <span>{label}</span> : null}
      <select
        className={`${inputClass} min-w-[9rem] cursor-pointer`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  className = "",
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto border-b border-line pb-px scrollbar-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? "text-accent"
                : "text-ink-muted hover:text-snow"
            }`}
          >
            {isActive ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-accent" />
            ) : null}
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count != null ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive ? "bg-accent/15 text-accent" : "bg-white/5 text-ink-muted"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ children }: { children: ReactNode }) {
  return <div className="pt-5">{children}</div>;
}
