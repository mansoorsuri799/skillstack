import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { normalizeDomain } from "@/lib/dataforseo/client";
import { getProjectForUser } from "@/lib/dashboard/project";
import {
  addKeywordsToTrackedDomain,
  type IncomingTrackedKeyword,
} from "@/lib/dashboard/rank-tracking-service";
import {
  migrateLegacyRankTracking,
  serializeTrackedDomainDetail,
} from "@/lib/dashboard/rank-tracking";
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

    const body = await request.json();
    const incoming = (body.keywords ?? []) as IncomingTrackedKeyword[];
    await addKeywordsToTrackedDomain(tracked, incoming);

    return NextResponse.json({ domain: serializeTrackedDomainDetail(tracked) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save keywords";
    const status = message.includes("Select at least one") ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
