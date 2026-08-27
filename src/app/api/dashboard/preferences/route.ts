import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  await connectDB();
  const user = await User.findById(result.user.id).select(
    "keywordRecentSearches onboardingCompetitorDone",
  );
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    keywordRecentSearches: user.keywordRecentSearches ?? [],
    onboardingCompetitorDone: Boolean(user.onboardingCompetitorDone),
  });
}

export async function PATCH(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  try {
    const body = await request.json();
    await connectDB();
    const user = await User.findById(result.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (Array.isArray(body.keywordRecentSearches)) {
      user.keywordRecentSearches = body.keywordRecentSearches
        .map((item: unknown) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 8);
    }

    if (typeof body.onboardingCompetitorDone === "boolean") {
      user.onboardingCompetitorDone = body.onboardingCompetitorDone;
    }

    await user.save();

    return NextResponse.json({
      keywordRecentSearches: user.keywordRecentSearches ?? [],
      onboardingCompetitorDone: Boolean(user.onboardingCompetitorDone),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save preferences";
    return NextResponse.json({ message }, { status: 500 });
  }
}
