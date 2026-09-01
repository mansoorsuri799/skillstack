import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import {
  getOrganicCompetitors,
  type OrganicCompetitorRow,
} from "@/lib/dataforseo/organic-search";
import { isFirecrawlConfigured } from "@/lib/firecrawl/search";
import { isSameSite, liveSerpForDomain } from "@/lib/firecrawl/live-serp";

export type OrganicCompetitorsReport = {
  domain: string;
  keyword: string | null;
  location: string | null;
  source: "firecrawl" | "dataforseo";
  competitors: OrganicCompetitorRow[];
};

function labsMetricsByDomain(
  rows: OrganicCompetitorRow[],
  targetDomain: string,
): Map<string, OrganicCompetitorRow> {
  const map = new Map<string, OrganicCompetitorRow>();
  for (const row of rows) {
    if (!row.domain || isSameSite(row.domain, targetDomain)) continue;
    const key = row.domain.replace(/^www\./i, "").toLowerCase();
    if (!map.has(key)) map.set(key, row);
  }
  return map;
}

export async function getOrganicCompetitorsReport(
  domain: string,
  locationCode = 2840,
  languageCode = "en",
): Promise<OrganicCompetitorsReport> {
  const labs = isDataForSeoConfigured()
    ? await getOrganicCompetitors(domain, locationCode, languageCode).catch(
        () => ({ domain, competitors: [] as OrganicCompetitorRow[] }),
      )
    : { domain, competitors: [] as OrganicCompetitorRow[] };

  const labsByHost = labsMetricsByDomain(labs.competitors, domain);

  if (isFirecrawlConfigured()) {
    const live = await liveSerpForDomain(domain, { locationCode });
    const competitors = live.listings
      .filter((row) => !row.isYours && !isSameSite(row.host, domain))
      .map((row) => {
        const labsRow = labsByHost.get(row.host);
        return {
          domain: row.host,
          intersections: labsRow?.intersections ?? null,
          avgPosition: row.position,
          organicKeywords: labsRow?.organicKeywords ?? null,
          organicTraffic: labsRow?.organicTraffic ?? null,
          title: row.title,
          url: row.url,
        } satisfies OrganicCompetitorRow;
      });

    if (competitors.length > 0) {
      return {
        domain,
        keyword: live.keyword,
        location: live.location,
        source: "firecrawl",
        competitors,
      };
    }
  }

  return {
    domain,
    keyword: null,
    location: null,
    source: "dataforseo",
    competitors: [...labsByHost.values()],
  };
}
