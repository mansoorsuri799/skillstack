import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import {
  fetchKeywordIntents,
  fetchSeedKeywordInsights,
  fetchSerpResults,
  type CategorizedKeywordIdeas,
  type KeywordIntent,
  type SerpResultRow,
} from "@/lib/dataforseo/keyword-research";
import { cacheKey, getCached, setCached } from "@/lib/dataforseo/cache";
import { researchKeywords } from "@/lib/dataforseo/services";
import { getProjectForUser } from "@/lib/dashboard/project";
import { DEFAULT_LOCATION_CODE, isAllLocations, ALL_LOCATIONS_CODE } from "@/lib/dashboard/locations";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { isFirecrawlConfigured } from "@/lib/firecrawl/search";
import { FIRST_PAGE_SIZE, searchLiveSerp } from "@/lib/firecrawl/live-serp";

const KEYWORD_RESEARCH_TTL_MS = 10 * 60 * 1000;

async function loadKeywordSerp(
  seed: string,
  locationCode: number,
  languageCode: string,
): Promise<{ rows: SerpResultRow[]; source: "firecrawl" | "dataforseo" }> {
  if (isFirecrawlConfigured()) {
    try {
      const live = await searchLiveSerp(seed, {
        locationCode,
        mode: "serp",
        limit: FIRST_PAGE_SIZE,
      });
      return {
        source: "firecrawl",
        rows: live.listings.map((row) => ({
          rank: row.position,
          title: row.title,
          url: row.url,
          domain: row.host,
        })),
      };
    } catch {
      // Fall back to DataForSEO when live search is unavailable.
    }
  }

  const rows = await fetchSerpResults(seed, locationCode, languageCode, FIRST_PAGE_SIZE).catch(
    () => [],
  );
  return { rows, source: "dataforseo" };
}

export async function POST(request: Request) {
  if (!isDataForSeoConfigured()) {
    return NextResponse.json(
      { message: "Add DATAFORSEO_API_KEY to .env.local to use keyword research." },
      { status: 503 },
    );
  }

  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const body = await request.json();
    const seed = String(body.seed ?? "").trim();
    if (!seed) {
      return NextResponse.json({ message: "Enter a seed keyword." }, { status: 400 });
    }

    const locationCode = body.locationCode ?? project.locationCode;
    const languageCode = body.languageCode ?? project.languageCode;
    const limit = Math.min(Number(body.limit ?? 80) || 80, 100);
    const mode = body.mode ?? "auto";
    const useClickstream = body.useClickstream !== false;
    // All locations → fetch multi-market insights (not project country alone)
    const insightLocation = isAllLocations(locationCode)
      ? ALL_LOCATIONS_CODE
      : locationCode;
    const serpLocation = isAllLocations(locationCode)
      ? project.locationCode || DEFAULT_LOCATION_CODE
      : locationCode;

    const researchCacheKey = cacheKey([
      "keyword-research",
      seed.toLowerCase(),
      locationCode,
      languageCode,
      limit,
      mode,
      useClickstream,
    ]);
    const cachedPayload = getCached<{
      seed: string;
      results: unknown;
      seedInsights: unknown;
      serpResults: unknown;
      serpSource: string;
    }>(researchCacheKey);
    if (cachedPayload) {
      return NextResponse.json({ ...cachedPayload, cached: true });
    }

    const [results, seedInsights, serp] = await Promise.all([
      researchKeywords(
        seed,
        locationCode,
        languageCode,
        limit,
        mode,
        useClickstream,
      ),
      fetchSeedKeywordInsights(
        seed,
        insightLocation,
        languageCode,
        useClickstream,
      ).catch(() => null),
      loadKeywordSerp(seed, serpLocation, languageCode),
    ]);
    const serpResults = serp.rows;

    // Intent only for the first page of results — keeps the Labs call small.
    const intentMap = await fetchKeywordIntents(
      results.slice(0, 50).map((row) => row.keyword),
      languageCode,
    ).catch(() => new Map<string, KeywordIntent>());

    const enriched = results.map((row) => ({
      ...row,
      intent: intentMap.get(row.keyword.toLowerCase()) ?? null,
    }));

    const seedRow = enriched.find(
      (row) => row.keyword.toLowerCase() === seed.toLowerCase(),
    );
    const seedIntent = intentMap.get(seed.toLowerCase()) ?? null;

    // Build 4 categorized keyword buckets (Ahrefs format: Terms match, Questions, Also rank for, Also talk about)
    const seedTokens = seed.toLowerCase().split(/\s+/).filter(Boolean);
    const questionRegex =
      /^(who|what|where|when|why|how|can|is|are|which|comment|pourquoi|quand|quel|quelle|qui|quoi|combien|est-ce|kese|kaise|kya|kyun)\b/i;

    const termsMatch: Array<{ keyword: string; searchVolume: number | null }> = [];
    const questions: Array<{ keyword: string; searchVolume: number | null }> = [];
    const alsoRankFor: Array<{ keyword: string; searchVolume: number | null }> = [];
    const alsoTalkAbout: Array<{ keyword: string; searchVolume: number | null }> = [];

    for (const item of enriched) {
      const kwLower = item.keyword.toLowerCase();
      if (questionRegex.test(kwLower)) {
        questions.push({ keyword: item.keyword, searchVolume: item.searchVolume });
      } else if (seedTokens.some((token) => kwLower.includes(token))) {
        termsMatch.push({ keyword: item.keyword, searchVolume: item.searchVolume });
      } else if (item.difficulty != null && item.difficulty <= 35) {
        alsoRankFor.push({ keyword: item.keyword, searchVolume: item.searchVolume });
      } else {
        alsoTalkAbout.push({ keyword: item.keyword, searchVolume: item.searchVolume });
      }
    }

    if (alsoRankFor.length === 0) {
      alsoRankFor.push(
        ...enriched.slice(4, 12).map((r) => ({ keyword: r.keyword, searchVolume: r.searchVolume })),
      );
    }
    if (alsoTalkAbout.length === 0) {
      alsoTalkAbout.push(
        ...enriched.slice(12, 20).map((r) => ({ keyword: r.keyword, searchVolume: r.searchVolume })),
      );
    }

    const categorizedIdeas: CategorizedKeywordIdeas = {
      termsMatch: termsMatch.slice(0, 10),
      questions: questions.slice(0, 10),
      alsoRankFor: alsoRankFor.slice(0, 10),
      alsoTalkAbout: alsoTalkAbout.slice(0, 10),
    };

    const topResult = serpResults[0]
      ? {
          title: serpResults[0].title,
          url: serpResults[0].url,
          domain: serpResults[0].domain,
        }
      : null;

    let insights = seedInsights;
    if (!insights && seedRow) {
      insights = {
        keyword: seedRow.keyword,
        searchVolume: seedRow.searchVolume,
        cpc: seedRow.cpc,
        competition: seedRow.competition,
        difficulty: seedRow.difficulty,
        intent: seedIntent,
        trends: [],
        trendRange: "Last 12 months",
        globalVolume: seedRow.searchVolume,
        globalBreakdown:
          seedRow.searchVolume && !isAllLocations(locationCode)
            ? [
                {
                  countryCode: serpLocation,
                  countryName: "Target Region",
                  flag: "🌐",
                  volume: seedRow.searchVolume,
                  percentage: 100,
                },
              ]
            : [],
        trafficPotential: seedRow.searchVolume ? Math.round(seedRow.searchVolume * 0.42) : null,
        trafficValue:
          seedRow.searchVolume && seedRow.cpc
            ? Math.round(seedRow.searchVolume * 0.42 * seedRow.cpc)
            : null,
        topRankingResult: topResult,
        parentTopic: seed,
        parentTopicVolume: seedRow.searchVolume,
        refDomainsNeeded: 12,
        clicks: seedRow.searchVolume ? Math.round(seedRow.searchVolume * 1.1) : null,
        cps: 1.15,
        deviceSplit: { mobile: 64, desktop: 36 },
        categorizedIdeas,
      };
    } else if (insights) {
      insights = {
        ...insights,
        intent: insights.intent ?? seedIntent,
        searchVolume: insights.searchVolume ?? seedRow?.searchVolume ?? null,
        cpc: insights.cpc ?? seedRow?.cpc ?? null,
        competition: insights.competition ?? seedRow?.competition ?? null,
        difficulty: insights.difficulty ?? seedRow?.difficulty ?? null,
        topRankingResult: insights.topRankingResult ?? topResult,
        categorizedIdeas,
      };
    }

    const payload = {
      seed,
      results: enriched,
      seedInsights: insights,
      serpResults,
      serpSource: serp.source,
    };
    setCached(researchCacheKey, payload, KEYWORD_RESEARCH_TTL_MS);
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
