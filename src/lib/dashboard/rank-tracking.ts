import type { TrackedDomainDocument } from "@/models/TrackedDomain";
import { RankTracking } from "@/models/RankTracking";
import { TrackedDomain } from "@/models/TrackedDomain";
import {
  formatTrackingSummary,
  type SearchTargeting,
  type TrackingDevice,
  type TrackingSchedule,
} from "@/lib/dashboard/rank-tracking-config";

export type TrackedDomainSummary = {
  id: string;
  domain: string;
  locationCode: number;
  languageCode: string;
  searchTargeting: SearchTargeting;
  device: TrackingDevice;
  schedule: TrackingSchedule;
  searchDepth: number;
  keywordCount: number;
  summary: string;
  createdAt: string;
};

export type TrackedKeywordRow = {
  id: string;
  keyword: string;
  lastPosition: number | null;
  searchVolume: number | null;
  etv: number | null;
  snapshots: Array<{ date: string; position: number | null; url: string }>;
};

export type TrackedDomainDetail = TrackedDomainSummary & {
  keywords: TrackedKeywordRow[];
};

export function serializeTrackedDomain(doc: TrackedDomainDocument): TrackedDomainSummary {
  return {
    id: doc._id.toString(),
    domain: doc.domain,
    locationCode: doc.locationCode,
    languageCode: doc.languageCode,
    searchTargeting: doc.searchTargeting as SearchTargeting,
    device: doc.device as TrackingDevice,
    schedule: doc.schedule as TrackingSchedule,
    searchDepth: doc.searchDepth,
    keywordCount: doc.keywords.length,
    summary: formatTrackingSummary({
      locationCode: doc.locationCode,
      device: doc.device as TrackingDevice,
      schedule: doc.schedule as TrackingSchedule,
    }),
    createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  };
}

export function serializeTrackedDomainDetail(
  doc: TrackedDomainDocument,
): TrackedDomainDetail {
  return {
    ...serializeTrackedDomain(doc),
    keywords: doc.keywords.map((k) => ({
      id: k._id.toString(),
      keyword: k.keyword,
      lastPosition: k.lastPosition ?? null,
      searchVolume: k.searchVolume ?? null,
      etv: k.etv ?? null,
      snapshots: k.snapshots.slice(-30).map((s) => ({
        date: s.date.toISOString(),
        position: s.position ?? null,
        url: s.url ?? "",
      })),
    })),
  };
}

export async function migrateLegacyRankTracking(
  userId: string,
  projectId: string,
  domain: string,
  locationCode: number,
  languageCode: string,
) {
  const existing = await TrackedDomain.countDocuments({ projectId });
  if (existing > 0) return;

  const legacy = await RankTracking.findOne({ projectId });
  if (!legacy || legacy.keywords.length === 0) return;

  await TrackedDomain.create({
    userId,
    projectId,
    domain,
    locationCode,
    languageCode,
    keywords: legacy.keywords.map((k) => ({
      keyword: k.keyword,
      lastPosition: k.lastPosition,
      snapshots: k.snapshots,
    })),
  });
}
