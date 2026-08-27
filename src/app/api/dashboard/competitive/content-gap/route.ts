import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { getContentGap } from "@/lib/dataforseo/competitive-analysis";
import { getProjectForUser } from "@/lib/dashboard/project";

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

    const data = await getContentGap(
      yourDomain,
      competitorDomain,
      body.locationCode ?? project.locationCode,
      body.languageCode ?? project.languageCode,
    );

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
