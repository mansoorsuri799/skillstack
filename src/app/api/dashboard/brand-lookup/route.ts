import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { exploreBrandMentions } from "@/lib/dataforseo/services";
import { getProjectForUser } from "@/lib/dashboard/project";
import {
  aiToolLimitJson,
  AiToolLimitError,
  assertAiToolAvailable,
  getAiToolUsage,
  incrementAiToolUsage,
} from "@/lib/dashboard/ai-tool-limits";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  try {
    const usage = await getAiToolUsage(result.user.id, "brandLookup");
    return NextResponse.json({ usage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load usage";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDataForSeoConfigured()) {
    return NextResponse.json(
      { message: "Add DATAFORSEO_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    await assertAiToolAvailable(user.id, "brandLookup");

    const project = await getProjectForUser(user.id);
    const body = await request.json();
    const brand = String(body.brand ?? "").trim();
    if (!brand) {
      return NextResponse.json({ message: "Enter a brand name." }, { status: 400 });
    }

    const lookup = await exploreBrandMentions(brand, project.domain);
    const usage = await incrementAiToolUsage(user.id, "brandLookup");
    return NextResponse.json({ result: lookup, usage });
  } catch (error) {
    if (error instanceof AiToolLimitError) {
      return NextResponse.json(aiToolLimitJson(error), { status: 402 });
    }
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
