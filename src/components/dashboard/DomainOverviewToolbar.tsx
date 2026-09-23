"use client";

import { Search } from "lucide-react";
import { ToolbarSelect } from "@/components/dashboard/SearchToolbar";
import { buttonPrimaryClass, inputClass } from "@/components/dashboard/ui";
import {
  DOMAIN_KEYWORD_SORTS,
  DOMAIN_OVERVIEW_LOCATIONS,
  DOMAIN_OVERVIEW_SCOPES,
  type DomainKeywordSort,
  type DomainScope,
} from "@/lib/dashboard/domain-overview-config";

export function DomainOverviewToolbar({
  domain,
  onDomainChange,
  scope,
  onScopeChange,
  locationCode,
  onLocationChange,
  sortBy,
  onSortChange,
  onSubmit,
  loading = false,
  submitLabel = "Search",
  showMarketFilters = true,
}: {
  domain: string;
  onDomainChange: (value: string) => void;
  scope: DomainScope;
  onScopeChange: (value: DomainScope) => void;
  locationCode: number;
  onLocationChange: (value: number) => void;
  sortBy: DomainKeywordSort;
  onSortChange: (value: DomainKeywordSort) => void;
  onSubmit: () => void;
  loading?: boolean;
  submitLabel?: string;
  showMarketFilters?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (loading) return;
        onSubmit();
      }}
      className="relative z-20 rounded-2xl border border-line bg-bg-elevated p-4 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] md:p-5"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs font-medium text-ink-muted">
          <span>Domain</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              className={`${inputClass} w-full pl-10 ${loading ? "cursor-not-allowed opacity-70" : ""}`}
              value={domain}
              onChange={(e) => {
                if (loading) return;
                onDomainChange(e.target.value);
              }}
              placeholder="example.com"
              required
              disabled={loading}
              readOnly={loading}
              aria-label="Domain"
            />
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end xl:shrink-0">
          <ToolbarSelect
            label="Scope"
            value={scope}
            onChange={(value) => onScopeChange(value as DomainScope)}
            options={DOMAIN_OVERVIEW_SCOPES.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            disabled={loading}
            className="min-w-[9.5rem]"
          />
          {showMarketFilters ? (
            <>
              <ToolbarSelect
                label="Location"
                value={locationCode}
                onChange={(value) => onLocationChange(Number(value))}
                options={DOMAIN_OVERVIEW_LOCATIONS.map((item) => ({
                  value: item.code,
                  label: item.label,
                }))}
                disabled={loading}
                className="min-w-[11rem]"
              />
              <ToolbarSelect
                label="Sort"
                value={sortBy}
                onChange={(value) => onSortChange(value as DomainKeywordSort)}
                options={DOMAIN_KEYWORD_SORTS.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                disabled={loading}
                className="min-w-[9.5rem]"
              />
            </>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className={`${buttonPrimaryClass} col-span-2 sm:col-span-1`}
          >
            {loading ? "Searching..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
