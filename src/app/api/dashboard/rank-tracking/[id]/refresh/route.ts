import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { getProjectForUser } from "@/lib/dashboard/project";
import { refreshTrackedDomainKeywords } from "@/lib/dashboard/rank-tracking-service";
import { serializeTrackedDomainDetail } from "@/lib/dashboard/rank-tracking";
import { TrackedDomain } from "@/models/TrackedDomain";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const result = await requireUser(request);
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

    const body = await request.json().catch(() => ({}));
    const keywordFilter = String(body.keyword ?? "").trim().toLowerCase();
    const { refreshed } = await refreshTrackedDomainKeywords(
      tracked,
      keywordFilter || undefined,
    );

    return NextResponse.json({
      ok: true,
      refreshed,
      domain: serializeTrackedDomainDetail(tracked),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Refresh failed";
    const status = message.includes("DATAFORSEO_API_KEY") ? 503 : 500;
    return NextResponse.json({ message }, { status });
  }
}
