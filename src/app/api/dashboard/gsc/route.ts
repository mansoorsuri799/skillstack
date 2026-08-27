import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import {
  getValidGscAccessToken,
  queryGscAnalytics,
} from "@/lib/google/gsc";
import {
  disconnectGsc,
  getProjectDocument,
  updateGscTokens,
} from "@/lib/dashboard/project";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") ?? "queries";

  try {
    const project = await getProjectDocument(user.id, true);
    if (!project.gscConnected || !project.gscSiteUrl) {
      return NextResponse.json({
        connected: false,
        rows: [],
        summary: null,
      });
    }

    const tokenResult = await getValidGscAccessToken(project);
    const accessToken =
      typeof tokenResult === "string" ? tokenResult : tokenResult.accessToken;

    if (typeof tokenResult !== "string") {
      await updateGscTokens(project._id, {
        accessToken: tokenResult.accessToken,
        refreshToken: tokenResult.refreshToken,
        expiresAt: tokenResult.expiresAt,
      });
    }

    const dimension =
      tab === "pages"
        ? "page"
        : tab === "countries"
          ? "country"
          : tab === "devices"
            ? "device"
            : "query";

    const rows = await queryGscAnalytics(
      accessToken,
      project.gscSiteUrl,
      dimension,
    );

    const summaryRows = await queryGscAnalytics(
      accessToken,
      project.gscSiteUrl,
      "query",
      28,
      100,
    );

    const totals = summaryRows.reduce(
      (acc, row) => ({
        clicks: acc.clicks + row.clicks,
        impressions: acc.impressions + row.impressions,
      }),
      { clicks: 0, impressions: 0 },
    );

    const avgCtr =
      totals.impressions > 0
        ? Math.round((totals.clicks / totals.impressions) * 1000) / 10
        : 0;
    const avgPosition =
      summaryRows.length > 0
        ? Math.round(
            (summaryRows.reduce((s, r) => s + r.position, 0) /
              summaryRows.length) *
              10,
          ) / 10
        : 0;

    return NextResponse.json({
      connected: true,
      siteUrl: project.gscSiteUrl,
      tab,
      rows,
      summary: {
        clicks: totals.clicks,
        impressions: totals.impressions,
        ctr: avgCtr,
        position: avgPosition,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "GSC load failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  await disconnectGsc(user.id);
  return NextResponse.json({ ok: true });
}
