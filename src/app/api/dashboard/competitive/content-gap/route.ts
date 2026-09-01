import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { getContentGap } from "@/lib/dataforseo/competitive-analysis";
import { getProjectForUser } from "@/lib/dashboard/project";
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

    const locationCode = body.locationCode ?? project.locationCode;
    const [data, live] = await Promise.all([
      getContentGap(
        yourDomain,
        competitorDomain,
        locationCode,
        body.languageCode ?? project.languageCode,
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

    return NextResponse.json({ data: { ...data, liveSerp } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
