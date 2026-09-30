import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { getCompetitiveContentReport } from "@/lib/dataforseo/competitive-analysis";
import { cacheKey, getCached, setCached, DATAFORSEO_CACHE_TTL_MS } from "@/lib/dataforseo/cache";
import { getOptionalProjectForUser } from "@/lib/dashboard/project";
import {
  DEFAULT_LOCATION_CODE,
  resolveLabsLocationCode,
  resolveLanguageForLocation,
} from "@/lib/dashboard/locations";

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
    const project = await getOptionalProjectForUser(user.id);
    const body = await request.json();

    const yourDomain = normalizeDomain(
      String(body.domain ?? body.yourDomain ?? project?.domain ?? ""),
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
      Number(body.locationCode ?? project?.locationCode ?? DEFAULT_LOCATION_CODE),
    );
    const languageCode =
      body.languageCode ??
      resolveLanguageForLocation(locationCode, project?.languageCode ?? "en");
    const includeLinks = body.includeLinks === true;

    const key = cacheKey([
      "competitive-report-v3",
      yourDomain,
      competitorDomain,
      locationCode,
      languageCode,
      includeLinks ? "links" : "lite",
    ]);
    const cached = getCached<{ data: unknown }>(key);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const data = await getCompetitiveContentReport(
      yourDomain,
      competitorDomain,
      locationCode,
      languageCode,
      includeLinks,
    );

    const payload = { data };
    setCached(key, payload, DATAFORSEO_CACHE_TTL_MS);
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
