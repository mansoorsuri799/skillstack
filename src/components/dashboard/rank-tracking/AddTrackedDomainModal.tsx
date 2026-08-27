"use client";

import { FormEvent, useMemo, useState } from "react";
import { DashboardModal } from "@/components/dashboard/DashboardModal";
import { ToolbarSelect } from "@/components/dashboard/SearchToolbar";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  inputClass,
} from "@/components/dashboard/ui";
import {
  estimateCheckCost,
  estimateMonthlyCost,
  SEARCH_DEPTH_OPTIONS,
  SEARCH_TARGETING_OPTIONS,
  TRACKING_DEVICES,
  TRACKING_LANGUAGES,
  TRACKING_SCHEDULES,
  searchDepthPages,
  type SearchTargeting,
  type TrackingDevice,
  type TrackingSchedule,
} from "@/lib/dashboard/rank-tracking-config";
import { RESEARCH_LOCATIONS } from "@/lib/dashboard/locations";

export type AddTrackedDomainInput = {
  domain: string;
  locationCode: number;
  languageCode: string;
  searchTargeting: SearchTargeting;
  device: TrackingDevice;
  schedule: TrackingSchedule;
  searchDepth: number;
};

export function AddTrackedDomainModal({
  open,
  onClose,
  onSubmit,
  defaultDomain = "",
  defaultLocationCode = 2840,
  defaultLanguageCode = "en",
  submitting = false,
  error = "",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: AddTrackedDomainInput) => Promise<void>;
  defaultDomain?: string;
  defaultLocationCode?: number;
  defaultLanguageCode?: string;
  submitting?: boolean;
  error?: string;
}) {
  const [domain, setDomain] = useState(defaultDomain);
  const [locationCode, setLocationCode] = useState(defaultLocationCode);
  const [languageCode, setLanguageCode] = useState(defaultLanguageCode);
  const [searchTargeting, setSearchTargeting] = useState<SearchTargeting>("national");
  const [device, setDevice] = useState<TrackingDevice>("mobile");
  const [schedule, setSchedule] = useState<TrackingSchedule>("weekly");
  const [searchDepth, setSearchDepth] = useState(40);

  const pages = searchDepthPages(searchDepth);
  const perCheckCost = estimateCheckCost(pages, device);
  const monthlyEstimate = estimateMonthlyCost(50, pages, device, schedule);

  const fieldClass = "flex flex-col gap-1.5 text-xs font-medium text-ink-muted";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit({
      domain,
      locationCode,
      languageCode,
      searchTargeting,
      device,
      schedule,
      searchDepth,
    });
  }

  const costHint = useMemo(
    () =>
      `~$${perCheckCost.toFixed(4)} per keyword per check · 50 keywords ≈ $${monthlyEstimate.toFixed(2)}/month`,
    [monthlyEstimate, perCheckCost],
  );

  return (
    <DashboardModal
      open={open}
      onClose={onClose}
      title="Add Domain"
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={buttonGhostClass} disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            form="add-tracked-domain-form"
            disabled={submitting}
            className={buttonPrimaryClass}
          >
            {submitting ? "Adding..." : "Add Domain"}
          </button>
        </div>
      }
    >
      <form id="add-tracked-domain-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <label className={fieldClass}>
          <span>Target Domain</span>
          <input
            className={inputClass}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            required
            disabled={submitting}
          />
        </label>

        <ToolbarSelect
          label="Country"
          value={locationCode}
          disabled={submitting}
          onChange={(v) => setLocationCode(Number(v))}
          options={RESEARCH_LOCATIONS.map((l) => ({ value: l.code, label: l.label }))}
        />

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-ink-muted">Search Targeting</legend>
          <div className="flex flex-wrap gap-4">
            {SEARCH_TARGETING_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-snow">
                <input
                  type="radio"
                  name="searchTargeting"
                  value={option.value}
                  checked={searchTargeting === option.value}
                  onChange={() => setSearchTargeting(option.value)}
                  disabled={submitting}
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-muted">
            Local targeting can understate rankings for non-geo-modified terms.
          </p>
        </fieldset>

        <ToolbarSelect
          label="Language"
          value={languageCode}
          disabled={submitting}
          onChange={setLanguageCode}
          options={TRACKING_LANGUAGES.map((l) => ({ value: l.code, label: l.label }))}
        />
        <p className="-mt-3 text-xs text-ink-muted">
          Pick the language your customers search in — any language can be tracked in any country.
        </p>

        <ToolbarSelect
          label="Devices"
          value={device}
          disabled={submitting}
          onChange={(v) => setDevice(v as TrackingDevice)}
          options={TRACKING_DEVICES.map((d) => ({ value: d.value, label: d.label }))}
        />
        <p className="-mt-3 text-xs text-ink-muted">
          Most Google searches come from mobile, but select this based on your customer.
        </p>

        <ToolbarSelect
          label="Schedule"
          value={schedule}
          disabled={submitting}
          onChange={(v) => setSchedule(v as TrackingSchedule)}
          options={TRACKING_SCHEDULES.map((s) => ({ value: s.value, label: s.label }))}
        />

        <ToolbarSelect
          label="Search Depth"
          value={searchDepth}
          disabled={submitting}
          onChange={(v) => setSearchDepth(Number(v))}
          options={SEARCH_DEPTH_OPTIONS.map((d) => ({
            value: d.depth,
            label: d.label,
          }))}
        />
        <p className="-mt-3 text-xs text-ink-muted">
          10 pages is ~8× more expensive than 1 page.
        </p>

        <div className="rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink-muted">
          <p>{costHint}</p>
        </div>
      </form>
    </DashboardModal>
  );
}
