import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { getContentGap } from "@/lib/dataforseo/competitive-analysis";
import { cacheKey, getCached, setCached, DATAFORSEO_CACHE_TTL_MS } from "@/lib/dataforseo/cache";
import { getProjectForUser } from "@/lib/dashboard/project";
import {
  DEFAULT_LOCATION_CODE,
  resolveLabsLocationCode,
} from "@/lib/dashboard/locations";
import { isFirecrawlConfigured } from "@/lib/firecrawl/search";
import { liveSerpForDomain } from "@/lib/firecrawl/live-serp";

export async function POST(request: Request) {
  if (!isDataForSeoConfigured()) {
    return NextResponse.json(
      { message: "Add DATAFORSEO_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const body = await request.json();

    const yourDomain = normalizeDomain(
      String(body.domain ?? body.yourDomain ?? project.domain),
    );
    const competitorDomain = normalizeDomain(String(body.competitor ?? ""));

    if (!yourDomain || yourDomain === "example.com") {
      return NextResponse.json(
        { message: "Enter your site domain." },
        { status: 400 },
      );
    }

    if (!competitorDomain) {
      return NextResponse.json(
        { message: "Enter a competitor domain." },
        { status: 400 },
      );
    }

    const locationCode = resolveLabsLocationCode(
      Number(body.locationCode ?? project.locationCode ?? DEFAULT_LOCATION_CODE),
    );
    const languageCode = body.languageCode ?? project.languageCode ?? "en";
    const limit = Math.min(Number(body.limit ?? 50) || 50, 75);

    const key = cacheKey([
      "content-gap-v1",
      yourDomain,
      competitorDomain,
      locationCode,
      languageCode,
      limit,
    ]);
    const cached = getCached<{ data: unknown }>(key);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const [data, live] = await Promise.all([
      getContentGap(
        yourDomain,
        competitorDomain,
        locationCode,
        languageCode,
        limit,
      ),
      isFirecrawlConfigured()
        ? liveSerpForDomain(competitorDomain, { locationCode }).catch(() => null)
        : Promise.resolve(null),
    ]);

    const liveSerp = live
      ? {
          keyword: live.keyword,
          location: live.location,
          listings: live.listings
            .filter((row) => !row.isYours)
            .map((row) => ({
              position: row.position,
              domain: row.host,
              title: row.title,
              url: row.url,
            })),
        }
      : null;

    const payload = { data: { ...data, liveSerp } };
    setCached(key, payload, DATAFORSEO_CACHE_TTL_MS);
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
