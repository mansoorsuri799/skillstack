import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import {
  attachGscVisitors,
  getDomainDashboard,
} from "@/lib/dataforseo/domain-dashboard";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import {
  getProjectDocument,
  updateGscTokens,
} from "@/lib/dashboard/project";
import {
  getValidGscAccessToken,
  queryGscAnalytics,
} from "@/lib/google/gsc";

export const maxDuration = 120;

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
    const project = await getProjectDocument(user.id, true);
    const body = await request.json();
    const domain = normalizeDomain(String(body.domain ?? project.domain));

    let overview = await getDomainDashboard(
      domain,
      body.locationCode ?? project.locationCode,
      body.languageCode ?? project.languageCode,
      body.scope !== "domain",
    );

    if (project.gscConnected && project.gscSiteUrl) {
      try {
        const tokenResult = await getValidGscAccessToken(project);
        const accessToken =
          typeof tokenResult === "string"
            ? tokenResult
            : tokenResult.accessToken;

        if (typeof tokenResult !== "string") {
          await updateGscTokens(project._id, {
            accessToken: tokenResult.accessToken,
            refreshToken: tokenResult.refreshToken,
            expiresAt: tokenResult.expiresAt,
          });
        }

        const rows = await queryGscAnalytics(
          accessToken,
          project.gscSiteUrl,
          "query",
          28,
          1000,
        );
        const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
        overview = await attachGscVisitors(overview, totalClicks, true);
      } catch {
        overview = await attachGscVisitors(overview, null, true);
      }
    }

    return NextResponse.json({ overview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
