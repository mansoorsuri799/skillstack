import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { cacheKey, getCached, setCached, DATAFORSEO_CACHE_TTL_MS } from "@/lib/dataforseo/cache";
import {
  getKeywordDifficulty,
  parseKeywordList,
  MAX_KEYWORDS,
} from "@/lib/dataforseo/keyword-difficulty";
import { getOptionalProjectForUser } from "@/lib/dashboard/project";
import {
  DEFAULT_LOCATION_CODE,
  RESEARCH_LOCATIONS,
} from "@/lib/dashboard/locations";

const TTL_MS = DATAFORSEO_CACHE_TTL_MS;

export async function POST(request: Request) {
  if (!isDataForSeoConfigured()) {
    return NextResponse.json(
      {
        message:
          "Add DATAFORSEO_API_KEY to .env.local to use the keyword difficulty checker.",
      },
      { status: 503 },
    );
  }

  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getOptionalProjectForUser(user.id);
    const body = await request.json();
    const raw = String(body.keywords ?? body.seed ?? "").trim();
    const keywords = parseKeywordList(raw);

    if (keywords.length === 0) {
      return NextResponse.json(
        { message: "Enter at least one keyword." },
        { status: 400 },
      );
    }

    if (keywords.length > MAX_KEYWORDS) {
      return NextResponse.json(
        { message: `Check up to ${MAX_KEYWORDS} keywords at a time.` },
        { status: 400 },
      );
    }

    const locationCode = Number(
      body.locationCode ?? project?.locationCode ?? DEFAULT_LOCATION_CODE,
    );
    const languageCode =
      body.languageCode ??
      RESEARCH_LOCATIONS.find((l) => l.code === locationCode)?.lang ??
      project?.languageCode ??
      "en";

    const key = cacheKey([
      "keyword-difficulty-v1",
      keywords.map((k) => k.toLowerCase()).join("|"),
      locationCode,
      languageCode,
    ]);
    const cached = getCached<unknown>(key);
    if (cached) {
      return NextResponse.json({ data: cached, cached: true });
    }

    const data = await getKeywordDifficulty(
      keywords,
      locationCode,
      languageCode,
    );
    setCached(key, data, TTL_MS);
    return NextResponse.json({ data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Keyword difficulty lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
