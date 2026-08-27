import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import {
  fetchKeywordIntents,
  fetchSeedKeywordInsights,
  fetchSerpResults,
  type KeywordIntent,
} from "@/lib/dataforseo/keyword-research";
import { researchKeywords } from "@/lib/dataforseo/services";
import { getProjectForUser } from "@/lib/dashboard/project";
import { isAllLocations } from "@/lib/dashboard/locations";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";

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
    const limit = body.limit ?? 150;
    const mode = body.mode ?? "auto";
    const useClickstream = body.useClickstream !== false;
    const insightLocation = isAllLocations(locationCode)
      ? project.locationCode || 2840
      : locationCode;

    const [results, seedInsights, serpResults] = await Promise.all([
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
      fetchSerpResults(seed, insightLocation, languageCode, 40).catch(() => []),
    ]);

    const intentMap = await fetchKeywordIntents(
      results.map((row) => row.keyword),
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
      };
    } else if (insights) {
      insights = {
        ...insights,
        intent: insights.intent ?? seedIntent,
        searchVolume: insights.searchVolume ?? seedRow?.searchVolume ?? null,
        cpc: insights.cpc ?? seedRow?.cpc ?? null,
        competition: insights.competition ?? seedRow?.competition ?? null,
        difficulty: insights.difficulty ?? seedRow?.difficulty ?? null,
      };
    }

    return NextResponse.json({
      seed,
      results: enriched,
      seedInsights: insights,
      serpResults,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
