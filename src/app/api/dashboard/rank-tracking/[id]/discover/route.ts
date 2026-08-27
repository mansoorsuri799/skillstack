import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { getOrganicKeywords } from "@/lib/dataforseo/organic-search";
import { getProjectForUser } from "@/lib/dashboard/project";
import { DEFAULT_DISCOVER_LIMIT } from "@/lib/dashboard/rank-tracking-config";
import { TrackedDomain } from "@/models/TrackedDomain";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  if (!isDataForSeoConfigured()) {
    return NextResponse.json(
      { message: "Add DATAFORSEO_API_KEY to discover ranking keywords." },
      { status: 503 },
    );
  }

  const result = await requireUser(_request);
  if ("response" in result) return result.response;
  const { user } = result;
  const { id } = await context.params;

  try {
    const project = await getProjectForUser(user.id);
    await connectDB();

    const tracked = await TrackedDomain.findOne({ _id: id, projectId: project.id });
    if (!tracked) {
      return NextResponse.json({ message: "Tracked domain not found." }, { status: 404 });
    }

    const report = await getOrganicKeywords(
      tracked.domain,
      tracked.locationCode,
      tracked.languageCode,
      true,
      DEFAULT_DISCOVER_LIMIT,
    );

    const keywords = [...report.keywords].sort(
      (a, b) => (b.etv ?? 0) - (a.etv ?? 0),
    );

    return NextResponse.json({
      domain: tracked.domain,
      keywords: keywords.map((row) => ({
        keyword: row.keyword,
        rank: row.rank,
        searchVolume: row.searchVolume,
        etv: row.etv,
        url: row.url,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Discovery failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
