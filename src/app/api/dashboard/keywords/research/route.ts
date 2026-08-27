import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { researchKeywords } from "@/lib/dataforseo/services";
import { getProjectForUser } from "@/lib/dashboard/project";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";

export async function POST(request: Request) {
  if (!isDataForSeoConfigured()) {
    return NextResponse.json(
      { message: "Add DATAFORSEO_API_KEY to .env.local to use keyword research." },
      { status: 503 },
    );
  }

  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const body = await request.json();
    const seed = String(body.seed ?? "").trim();
    if (!seed) {
      return NextResponse.json({ message: "Enter a seed keyword." }, { status: 400 });
    }

    const results = await researchKeywords(
      seed,
      body.locationCode ?? project.locationCode,
      body.languageCode ?? project.languageCode,
      body.limit ?? 50,
      body.mode ?? "auto",
    );

    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
