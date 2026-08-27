import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { normalizeDomain } from "@/lib/dataforseo/client";
import { getProjectForUser } from "@/lib/dashboard/project";
import {
  migrateLegacyRankTracking,
  serializeTrackedDomain,
} from "@/lib/dashboard/rank-tracking";
import { addKeywordsToTrackedDomain } from "@/lib/dashboard/rank-tracking-service";
import {
  SEARCH_DEPTH_OPTIONS,
  TRACKING_DEVICES,
  TRACKING_SCHEDULES,
  type SearchTargeting,
  type TrackingDevice,
  type TrackingSchedule,
} from "@/lib/dashboard/rank-tracking-config";
import { TrackedDomain } from "@/models/TrackedDomain";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const project = await getProjectForUser(user.id);
  await connectDB();

  await migrateLegacyRankTracking(
    user.id,
    project.id,
    project.domain,
    project.locationCode,
    project.languageCode,
  );

  const domains = await TrackedDomain.find({ projectId: project.id }).sort({
    createdAt: -1,
  });

  return NextResponse.json({
    domains: domains.map(serializeTrackedDomain),
  });
}

export async function POST(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const body = await request.json();

    if (body.keyword) {
      await connectDB();
      await migrateLegacyRankTracking(
        user.id,
        project.id,
        project.domain,
        project.locationCode,
        project.languageCode,
      );

      let tracked = body.domainId
        ? await TrackedDomain.findOne({ _id: body.domainId, projectId: project.id })
        : await TrackedDomain.findOne({ projectId: project.id }).sort({ createdAt: -1 });

      if (!tracked) {
        tracked = await TrackedDomain.create({
          userId: user.id,
          projectId: project.id,
          domain: project.domain,
          locationCode: project.locationCode,
          languageCode: project.languageCode,
          keywords: [],
        });
      }

      await addKeywordsToTrackedDomain(tracked, [
        {
          keyword: String(body.keyword),
          searchVolume: body.searchVolume ?? null,
        },
      ]);

      return NextResponse.json({ ok: true, domainId: tracked._id.toString() });
    }

    const domain = normalizeDomain(String(body.domain ?? ""));

    if (!domain) {
      return NextResponse.json({ message: "Enter a domain to track." }, { status: 400 });
    }

    const locationCode = Number(body.locationCode ?? project.locationCode ?? 2840);
    const languageCode = String(body.languageCode ?? project.languageCode ?? "en");
    const searchTargeting = String(
      body.searchTargeting ?? "national",
    ) as SearchTargeting;
    const device = String(body.device ?? "mobile") as TrackingDevice;
    const schedule = String(body.schedule ?? "weekly") as TrackingSchedule;
    const searchDepth = Number(body.searchDepth ?? 40);

    if (!TRACKING_DEVICES.some((d) => d.value === device)) {
      return NextResponse.json({ message: "Invalid device." }, { status: 400 });
    }
    if (!TRACKING_SCHEDULES.some((s) => s.value === schedule)) {
      return NextResponse.json({ message: "Invalid schedule." }, { status: 400 });
    }
    if (!SEARCH_DEPTH_OPTIONS.some((d) => d.depth === searchDepth)) {
      return NextResponse.json({ message: "Invalid search depth." }, { status: 400 });
    }
    if (!["national", "local"].includes(searchTargeting)) {
      return NextResponse.json({ message: "Invalid search targeting." }, { status: 400 });
    }

    await connectDB();

    const existing = await TrackedDomain.findOne({ projectId: project.id, domain });
    if (existing) {
      return NextResponse.json(
        { message: "That domain is already being tracked." },
        { status: 409 },
      );
    }

    const tracked = await TrackedDomain.create({
      userId: user.id,
      projectId: project.id,
      domain,
      locationCode,
      languageCode,
      searchTargeting,
      device,
      schedule,
      searchDepth,
      keywords: [],
    });

    return NextResponse.json({ domain: serializeTrackedDomain(tracked) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add domain";
    return NextResponse.json({ message }, { status: 500 });
  }
}
