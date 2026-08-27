import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { checkKeywordRank } from "@/lib/dataforseo/services";
import { getProjectForUser } from "@/lib/dashboard/project";
import { RankTracking } from "@/models/RankTracking";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const project = await getProjectForUser(user.id);
  await connectDB();

  let tracking = await RankTracking.findOne({ projectId: project.id });
  if (!tracking) {
    tracking = await RankTracking.create({
      userId: user.id,
      projectId: project.id,
      keywords: [],
    });
  }

  return NextResponse.json({
    config: {
      id: tracking._id.toString(),
      name: tracking.name,
      keywords: tracking.keywords.map((k) => ({
        id: k._id.toString(),
        keyword: k.keyword,
        lastPosition: k.lastPosition,
        snapshots: k.snapshots.slice(-30),
      })),
    },
  });
}

export async function POST(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const body = await request.json();
    const action = body.action as string | undefined;

    await connectDB();
    let tracking = await RankTracking.findOne({ projectId: project.id });
    if (!tracking) {
      tracking = await RankTracking.create({
        userId: user.id,
        projectId: project.id,
        keywords: [],
      });
    }

    if (action === "refreshAll") {
      if (!isDataForSeoConfigured()) {
        return NextResponse.json(
          { message: "Add DATAFORSEO_API_KEY to refresh ranks." },
          { status: 503 },
        );
      }

      for (const entry of tracking.keywords) {
        const rank = await checkKeywordRank(
          entry.keyword,
          project.domain,
          project.locationCode,
          project.languageCode,
        );
        entry.lastPosition = rank.position;
        entry.snapshots.push({
          date: new Date(),
          position: rank.position,
          url: rank.url ?? "",
        });
      }

      await tracking.save();
      return NextResponse.json({ ok: true, refreshed: tracking.keywords.length });
    }

    const keyword = String(body.keyword ?? "").trim().toLowerCase();
    if (!keyword) {
      return NextResponse.json({ message: "Enter a keyword." }, { status: 400 });
    }

    let position: number | null = null;
    let url: string | null = null;

    if (isDataForSeoConfigured()) {
      const rank = await checkKeywordRank(
        keyword,
        project.domain,
        project.locationCode,
        project.languageCode,
      );
      position = rank.position;
      url = rank.url;
    }

    const existing = tracking.keywords.find((k) => k.keyword === keyword);
    if (existing) {
      existing.lastPosition = position;
      existing.snapshots.push({
        date: new Date(),
        position,
        url: url ?? "",
      });
    } else {
      tracking.keywords.push({
        keyword,
        lastPosition: position,
        snapshots: [{ date: new Date(), position, url: url ?? "" }],
      });
    }

    await tracking.save();

    return NextResponse.json({ ok: true, position, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tracking failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
