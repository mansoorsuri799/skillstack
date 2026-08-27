import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { getProjectForUser } from "@/lib/dashboard/project";
import {
  serializeTrackedDomain,
  serializeTrackedDomainDetail,
} from "@/lib/dashboard/rank-tracking";
import { TrackedDomain } from "@/models/TrackedDomain";

type RouteContext = { params: Promise<{ id: string }> };

async function getTrackedDomainForUser(id: string, userId: string) {
  const project = await getProjectForUser(userId);
  await connectDB();
  const tracked = await TrackedDomain.findOne({ _id: id, projectId: project.id });
  if (!tracked) {
    return { error: NextResponse.json({ message: "Tracked domain not found." }, { status: 404 }) };
  }
  return { tracked, project };
}

export async function GET(_request: Request, context: RouteContext) {
  const result = await requireUser(_request);
  if ("response" in result) return result.response;
  const { user } = result;
  const { id } = await context.params;

  const lookup = await getTrackedDomainForUser(id, user.id);
  if ("error" in lookup) return lookup.error;

  return NextResponse.json({
    domain: serializeTrackedDomainDetail(lookup.tracked),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const result = await requireUser(_request);
  if ("response" in result) return result.response;
  const { user } = result;
  const { id } = await context.params;

  const lookup = await getTrackedDomainForUser(id, user.id);
  if ("error" in lookup) return lookup.error;

  await lookup.tracked.deleteOne();
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, context: RouteContext) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;
  const { id } = await context.params;

  const lookup = await getTrackedDomainForUser(id, user.id);
  if ("error" in lookup) return lookup.error;

  const body = await request.json();
  const keyword = String(body.keyword ?? "").trim().toLowerCase();
  if (!keyword) {
    return NextResponse.json({ message: "Keyword required." }, { status: 400 });
  }

  lookup.tracked.keywords.pull({ keyword });
  await lookup.tracked.save();

  return NextResponse.json({ domain: serializeTrackedDomain(lookup.tracked) });
}
