import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import type { KeywordResearchSession } from "@/lib/dashboard/keyword-research-session";
import { KEYWORD_MODE_OPTIONS } from "@/lib/dashboard/locations";
import { User } from "@/models/User";

const VALID_MODES = new Set(KEYWORD_MODE_OPTIONS.map((option) => option.value));

function sanitizeSession(input: unknown): KeywordResearchSession | null {
  if (!input || typeof input !== "object") return null;
  const body = input as Record<string, unknown>;
  const seed = typeof body.seed === "string" ? body.seed.trim().slice(0, 120) : "";
  if (!seed) return null;

  const locationCode =
    typeof body.locationCode === "number" && Number.isFinite(body.locationCode)
      ? body.locationCode
      : 2840;
  const limit =
    typeof body.limit === "number" && Number.isFinite(body.limit)
      ? Math.min(Math.max(Math.round(body.limit), 1), 150)
      : 150;
  const mode =
    typeof body.mode === "string" && VALID_MODES.has(body.mode as never)
      ? (body.mode as KeywordResearchSession["mode"])
      : "auto";
  const useClickstream = body.useClickstream !== false;

  const results = Array.isArray(body.results) ? body.results.slice(0, 150) : [];
  const serpResults = Array.isArray(body.serpResults) ? body.serpResults.slice(0, 40) : [];
  const seedInsights =
    body.seedInsights && typeof body.seedInsights === "object"
      ? body.seedInsights
      : null;

  return {
    seed,
    locationCode,
    limit,
    mode,
    useClickstream,
    results,
    seedInsights,
    serpResults,
    savedAt:
      typeof body.savedAt === "string" ? body.savedAt : new Date().toISOString(),
  } as KeywordResearchSession;
}

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  await connectDB();
  const user = await User.findById(result.user.id).select("keywordResearchSession");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const session = user.keywordResearchSession ?? null;
  if (!session || typeof session !== "object") {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({ session });
}

export async function PUT(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  try {
    const body = await request.json();
    const session = sanitizeSession(body.session ?? body);
    if (!session) {
      return NextResponse.json({ message: "Invalid session payload" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(result.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.keywordResearchSession = session;
    await user.save();

    return NextResponse.json({ session: user.keywordResearchSession });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save research session";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  await connectDB();
  await User.updateOne(
    { _id: result.user.id },
    { $unset: { keywordResearchSession: "" } },
  );

  return NextResponse.json({ session: null });
}
