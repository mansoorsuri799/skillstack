import { RESEARCH_LOCATIONS } from "@/lib/dashboard/locations";

export const TRACKING_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "hi", label: "Hindi" },
  { code: "ur", label: "Urdu" },
  { code: "ar", label: "Arabic" },
] as const;

export const SEARCH_TARGETING_OPTIONS = [
  { value: "national", label: "National" },
  { value: "local", label: "Local" },
] as const;

export type SearchTargeting = (typeof SEARCH_TARGETING_OPTIONS)[number]["value"];

export const TRACKING_DEVICES = [
  { value: "mobile", label: "Mobile only" },
  { value: "desktop", label: "Desktop only" },
  { value: "both", label: "Mobile + desktop" },
] as const;

export type TrackingDevice = (typeof TRACKING_DEVICES)[number]["value"];

export const TRACKING_SCHEDULES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

export type TrackingSchedule = (typeof TRACKING_SCHEDULES)[number]["value"];

export const SEARCH_DEPTH_OPTIONS = [
  { pages: 1, depth: 10, label: "1 page (top 10 results)" },
  { pages: 2, depth: 20, label: "2 pages (top 20 results)" },
  { pages: 4, depth: 40, label: "4 pages (top 40 results)" },
  { pages: 10, depth: 100, label: "10 pages (top 100 results)" },
] as const;

export const DEFAULT_DISCOVER_LIMIT = 100;
export const DEFAULT_KEYWORD_SELECTION = 20;

export function locationLabel(code: number) {
  return RESEARCH_LOCATIONS.find((l) => l.code === code)?.label ?? `Location ${code}`;
}

export function deviceLabel(device: TrackingDevice) {
  return TRACKING_DEVICES.find((d) => d.value === device)?.label ?? device;
}

export function scheduleLabel(schedule: TrackingSchedule) {
  return TRACKING_SCHEDULES.find((s) => s.value === schedule)?.label ?? schedule;
}

export function formatTrackingSummary(input: {
  locationCode: number;
  device: TrackingDevice;
  schedule: TrackingSchedule;
}) {
  const location = locationLabel(input.locationCode);
  const device =
    input.device === "mobile"
      ? "Mobile"
      : input.device === "desktop"
        ? "Desktop"
        : "Mobile + desktop";
  const schedule =
    input.schedule === "daily"
      ? "Daily"
      : input.schedule === "weekly"
        ? "Weekly"
        : "Monthly";
  return `${location} · ${device} · ${schedule}`;
}

/** Rough SERP cost estimate per keyword check (OpenSEO-style). */
export function estimateCheckCost(pages: number, device: TrackingDevice) {
  const deviceMultiplier = device === "both" ? 2 : 1;
  return pages * 0.000625 * deviceMultiplier;
}

export function estimateMonthlyCost(
  keywordCount: number,
  pages: number,
  device: TrackingDevice,
  schedule: TrackingSchedule,
) {
  const checksPerMonth =
    schedule === "daily" ? 30 : schedule === "weekly" ? 4 : 1;
  const perCheck = estimateCheckCost(pages, device);
  return keywordCount * perCheck * checksPerMonth;
}

export function searchDepthPages(depth: number) {
  const match = SEARCH_DEPTH_OPTIONS.find((opt) => opt.depth === depth);
  return match?.pages ?? Math.max(1, Math.ceil(depth / 10));
}
