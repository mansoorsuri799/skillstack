import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { getProjectForUser } from "@/lib/dashboard/project";
import { SavedKeyword } from "@/models/SavedKeyword";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const project = await getProjectForUser(user.id);
  await connectDB();
  const keywords = await SavedKeyword.find({ projectId: project.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    keywords: keywords.map((k) => ({
      id: k._id.toString(),
      keyword: k.keyword,
      searchVolume: k.searchVolume,
      cpc: k.cpc,
      difficulty: k.difficulty,
      tags: k.tags,
    })),
  });
}

export async function POST(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const body = await request.json();
    const keywords = Array.isArray(body.keywords) ? body.keywords : [body];

    await connectDB();
    const saved = [];

    for (const item of keywords) {
      const keyword = String(item.keyword ?? "").trim().toLowerCase();
      if (!keyword) continue;

      const doc = await SavedKeyword.findOneAndUpdate(
        { projectId: project.id, keyword },
        {
          userId: user.id,
          projectId: project.id,
          keyword,
          searchVolume: item.searchVolume ?? null,
          cpc: item.cpc ?? null,
          difficulty: item.difficulty ?? null,
        },
        { upsert: true, new: true },
      );
      saved.push({
        id: doc._id.toString(),
        keyword: doc.keyword,
        searchVolume: doc.searchVolume,
        cpc: doc.cpc,
        difficulty: doc.difficulty,
      });
    }

    return NextResponse.json({ saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const project = await getProjectForUser(user.id);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  await connectDB();
  await SavedKeyword.deleteOne({ _id: id, projectId: project.id, userId: user.id });
  return NextResponse.json({ ok: true });
}
