import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { getCompetitiveContentReport } from "@/lib/dataforseo/competitive-analysis";
import { cacheKey, getCached, setCached, DATAFORSEO_CACHE_TTL_MS } from "@/lib/dataforseo/cache";
import { getOptionalProjectForUser } from "@/lib/dashboard/project";
import {
  assertContentGapBacklinksAvailable,
  consumeContentGapBacklinksOnce,
  ContentGapBacklinksLimitError,
  contentGapBacklinksLimitJson,
  getContentGapBacklinksEntitlement,
} from "@/lib/dashboard/content-gap-backlinks-limit";
import {
  DEFAULT_LOCATION_CODE,
  resolveLabsLocationCode,
  resolveLanguageForLocation,
} from "@/lib/dashboard/locations";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  try {
    const entitlement = await getContentGapBacklinksEntitlement(result.user.id);
    return NextResponse.json({ entitlement });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load entitlement";
    return NextResponse.json({ message }, { status: 500 });
  }
}

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

    if (includeLinks) {
      await assertContentGapBacklinksAvailable(user.id);
    }

    const key = cacheKey([
      "competitive-report-v3",
      yourDomain,
      competitorDomain,
      locationCode,
      languageCode,
      includeLinks ? "links" : "lite",
    ]);
    const cached = getCached<{ data: unknown }>(key);

    let entitlement = await getContentGapBacklinksEntitlement(user.id);

    if (cached) {
      // Cached lite reports are free to replay. Cached link reports still count
      // as the one-time use if not yet consumed (Pro skips).
      if (includeLinks && entitlement.available && !entitlement.unlimited) {
        entitlement = await consumeContentGapBacklinksOnce(user.id);
      } else {
        entitlement = await getContentGapBacklinksEntitlement(user.id);
      }
      return NextResponse.json({ ...cached, cached: true, entitlement });
    }

    const data = await getCompetitiveContentReport(
      yourDomain,
      competitorDomain,
      locationCode,
      languageCode,
      includeLinks,
    );

    if (includeLinks) {
      entitlement = await consumeContentGapBacklinksOnce(user.id);
    }

    const payload = { data, entitlement };
    setCached(key, { data }, DATAFORSEO_CACHE_TTL_MS);
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ContentGapBacklinksLimitError) {
      return NextResponse.json(contentGapBacklinksLimitJson(error), {
        status: 402,
      });
    }
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
