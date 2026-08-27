import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { getDomainOverview } from "@/lib/dataforseo/services";
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
    const domain = normalizeDomain(String(body.domain ?? project.domain));

    const overview = await getDomainOverview(
      domain,
      body.locationCode ?? project.locationCode,
      body.languageCode ?? project.languageCode,
      body.scope !== "domain",
    );

    return NextResponse.json({ overview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
