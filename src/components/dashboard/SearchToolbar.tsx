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
      <div className="border-b border-line bg-gradient-to-r from-accent/[0.06] to-transparent px-4 py-3 sm:px-5 sm:py-4 md:px-6">
        <h2 className="font-display text-sm font-semibold text-snow">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs sm:text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      <div className="p-4 sm:p-5 md:p-6">{children}</div>
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
  inputLabel = "Search",
  filterLayout = "inline",
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  loading?: boolean;
  submitLabel?: string;
  inputLabel?: string;
  filterLayout?: "inline" | "stacked";
  children?: ReactNode;
}) {
  const inputField = (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-medium text-ink-muted">
      <span>{inputLabel}</span>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          className={`${inputClass} w-full pl-10 ${loading ? "cursor-not-allowed opacity-70" : ""}`}
          value={value}
          onChange={(e) => {
            if (loading) return;
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          required
          disabled={loading}
          readOnly={loading}
          aria-busy={loading}
        />
      </div>
    </label>
  );

  const submitButton = (
    <button
      type="submit"
      disabled={loading}
      className={`${buttonPrimaryClass} w-full shrink-0 sm:w-auto`}
    >
      {submitLabel}
    </button>
  );

  if (filterLayout === "stacked") {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (loading) return;
          onSubmit();
        }}
        className="space-y-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {inputField}
          {submitButton}
        </div>
        {children ? (
          <div className="grid gap-3 border-t border-line/60 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {children}
          </div>
        ) : null}
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (loading) return;
        onSubmit();
      }}
      className="flex flex-col gap-3 xl:flex-row xl:items-end"
    >
      {inputField}
      {children ? (
        <div className="flex flex-wrap items-end gap-3">{children}</div>
      ) : null}
      {submitButton}
    </form>
  );
}

export function ToolbarSelect({
  value,
  onChange,
  options,
  label,
  disabled,
  className = "",
}: {
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label
      className={`flex min-w-0 flex-col gap-1.5 text-xs font-medium text-ink-muted ${className}`}
    >
      {label ? <span>{label}</span> : null}
      <select
        className={`${inputClass} w-full min-w-0 cursor-pointer sm:min-w-[9.5rem] ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        value={value}
        disabled={disabled}
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
      className={`flex gap-1 overflow-x-auto border-b border-line pb-px scrollbar-none touch-pan-x ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative shrink-0 px-3 py-2 text-xs font-medium transition sm:px-4 sm:py-2.5 sm:text-sm ${
              isActive
                ? "text-accent"
                : "text-ink-muted hover:text-snow"
            }`}
          >
            {isActive ? (
              <span className="absolute inset-x-1.5 bottom-0 h-0.5 rounded-full bg-accent sm:inset-x-2" />
            ) : null}
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span>{tab.label}</span>
              {tab.count != null ? (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-semibold sm:text-[10px] sm:py-0.5 ${
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
