import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { runPromptExplorer } from "@/lib/dataforseo/services";
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
    const usage = await getAiToolUsage(result.user.id, "promptExplorer");
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
    await assertAiToolAvailable(user.id, "promptExplorer");

    const body = await request.json();
    const prompt = String(body.prompt ?? "").trim();
    if (!prompt) {
      return NextResponse.json({ message: "Enter a prompt." }, { status: 400 });
    }

    const lookup = await runPromptExplorer(prompt);
    const usage = await incrementAiToolUsage(user.id, "promptExplorer");
    return NextResponse.json({ result: lookup, usage });
  } catch (error) {
    if (error instanceof AiToolLimitError) {
      return NextResponse.json(aiToolLimitJson(error), { status: 402 });
    }
    const message = error instanceof Error ? error.message : "Prompt failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
