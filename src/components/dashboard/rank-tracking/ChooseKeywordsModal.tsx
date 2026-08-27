"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { DashboardModal } from "@/components/dashboard/DashboardModal";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  LoadingBlock,
} from "@/components/dashboard/ui";
import { DEFAULT_KEYWORD_SELECTION } from "@/lib/dashboard/rank-tracking-config";

export type DiscoverKeywordRow = {
  keyword: string;
  rank: number | null;
  searchVolume: number | null;
  etv: number | null;
  url: string | null;
};

type SortKey = "keyword" | "rank" | "searchVolume" | "etv";

export function ChooseKeywordsModal({
  open,
  onClose,
  domain,
  keywords,
  loading,
  saving,
  error,
  onSave,
  onSkip,
}: {
  open: boolean;
  onClose: () => void;
  domain: string;
  keywords: DiscoverKeywordRow[];
  loading: boolean;
  saving: boolean;
  error: string;
  onSave: (selected: DiscoverKeywordRow[]) => Promise<void>;
  onSkip: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("etv");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    if (!open || keywords.length === 0) return;
    const top = [...keywords]
      .sort((a, b) => (b.etv ?? 0) - (a.etv ?? 0))
      .slice(0, DEFAULT_KEYWORD_SELECTION)
      .map((row) => row.keyword);
    setSelected(new Set(top));
  }, [open, keywords]);

  const sortedRows = useMemo(() => {
    const rows = [...keywords];
    rows.sort((a, b) => {
      const av = a[sortKey] ?? (sortKey === "keyword" ? a.keyword : -1);
      const bv = b[sortKey] ?? (sortKey === "keyword" ? b.keyword : -1);
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av);
    });
    return rows;
  }, [keywords, sortAsc, sortKey]);

  const allSelected = keywords.length > 0 && selected.size === keywords.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(keywords.map((row) => row.keyword)));
  }

  function toggleKeyword(keyword: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      return next;
    });
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
      return;
    }
    setSortKey(key);
    setSortAsc(key === "keyword");
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortAsc ? (
      <ArrowUp className="inline h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="inline h-3.5 w-3.5" />
    );
  };

  const selectedRows = keywords.filter((row) => selected.has(row.keyword));

  return (
    <DashboardModal
      open={open}
      onClose={onClose}
      title="Choose keywords to track"
      description={
        loading
          ? `Finding keywords ${domain} ranks for...`
          : `We found ${keywords.length} keywords ${domain} ranks for.`
      }
      size="xl"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">
            {selected.size} of {keywords.length} selected
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onSkip}
              disabled={saving}
              className={buttonGhostClass}
            >
              Skip
            </button>
            <button
              type="button"
              disabled={saving || selected.size === 0}
              onClick={() => void onSave(selectedRows)}
              className={buttonPrimaryClass}
            >
              {saving ? "Saving..." : "Save Keywords"}
            </button>
          </div>
        </div>
      }
    >
      {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

      {loading ? (
        <LoadingBlock label="Discovering ranking keywords..." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all keywords"
                    />
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    <button type="button" onClick={() => toggleSort("keyword")} className="inline-flex items-center gap-1">
                      Keyword <SortIcon column="keyword" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    <button type="button" onClick={() => toggleSort("rank")} className="inline-flex items-center gap-1">
                      Position <SortIcon column="rank" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    <button type="button" onClick={() => toggleSort("searchVolume")} className="inline-flex items-center gap-1">
                      Volume <SortIcon column="searchVolume" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    <button type="button" onClick={() => toggleSort("etv")} className="inline-flex items-center gap-1">
                      Traffic <SortIcon column="etv" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr
                    key={row.keyword}
                    className="border-b border-line/50 transition hover:bg-white/[0.02] last:border-0"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(row.keyword)}
                        onChange={() => toggleKeyword(row.keyword)}
                        aria-label={`Track ${row.keyword}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-snow">{row.keyword}</td>
                    <td className="px-4 py-3 text-ink-muted">{row.rank ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-muted">
                      {row.searchVolume?.toLocaleString() ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {row.etv != null ? Math.round(row.etv).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardModal>
  );
}
