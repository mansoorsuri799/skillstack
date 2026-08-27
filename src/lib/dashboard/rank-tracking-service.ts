import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { checkKeywordRank } from "@/lib/dataforseo/services";
import type { TrackingDevice } from "@/lib/dashboard/rank-tracking-config";
import type { TrackedDomainDocument } from "@/models/TrackedDomain";

export type IncomingTrackedKeyword = {
  keyword: string;
  searchVolume?: number | null;
  etv?: number | null;
  rank?: number | null;
};

export async function addKeywordsToTrackedDomain(
  tracked: TrackedDomainDocument,
  incoming: IncomingTrackedKeyword[],
) {
  const keywords = incoming
    .map((row) => ({
      keyword: row.keyword.trim().toLowerCase(),
      searchVolume: row.searchVolume ?? null,
      etv: row.etv ?? null,
      rank: row.rank ?? null,
    }))
    .filter((row) => row.keyword);

  if (keywords.length === 0) {
    throw new Error("Select at least one keyword.");
  }

  const device = tracked.device as TrackingDevice;
  const serpDevice =
    device === "desktop" ? "desktop" : device === "both" ? "both" : "mobile";

  for (const row of keywords) {
    const existing = tracked.keywords.find((k) => k.keyword === row.keyword);
    let position = row.rank;
    let url = "";

    if (isDataForSeoConfigured()) {
      const rank = await checkKeywordRank(
        row.keyword,
        tracked.domain,
        tracked.locationCode,
        tracked.languageCode,
        { depth: tracked.searchDepth, device: serpDevice },
      );
      position = rank.position ?? row.rank;
      url = rank.url ?? "";
    }

    if (existing) {
      existing.lastPosition = position ?? null;
      existing.searchVolume = row.searchVolume;
      existing.etv = row.etv;
      if (position != null) {
        existing.snapshots.push({
          date: new Date(),
          position,
          url,
        });
      }
      continue;
    }

    tracked.keywords.push({
      keyword: row.keyword,
      lastPosition: position ?? null,
      searchVolume: row.searchVolume,
      etv: row.etv,
      snapshots:
        position != null ? [{ date: new Date(), position, url }] : [],
    });
  }

  await tracked.save();
  return tracked;
}

export async function refreshTrackedDomainKeywords(
  tracked: TrackedDomainDocument,
  keywordFilter?: string,
) {
  if (!isDataForSeoConfigured()) {
    throw new Error("Add DATAFORSEO_API_KEY to refresh ranks.");
  }

  const targets = keywordFilter
    ? tracked.keywords.filter((k) => k.keyword === keywordFilter.trim().toLowerCase())
    : tracked.keywords;

  const device = tracked.device as TrackingDevice;
  const serpDevice =
    device === "desktop" ? "desktop" : device === "both" ? "both" : "mobile";

  for (const entry of targets) {
    const rank = await checkKeywordRank(
      entry.keyword,
      tracked.domain,
      tracked.locationCode,
      tracked.languageCode,
      { depth: tracked.searchDepth, device: serpDevice },
    );
    entry.lastPosition = rank.position;
    entry.snapshots.push({
      date: new Date(),
      position: rank.position,
      url: rank.url ?? "",
    });
  }

  await tracked.save();
  return { tracked, refreshed: targets.length };
}
