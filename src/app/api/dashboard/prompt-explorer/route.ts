import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { runPromptExplorer } from "@/lib/dataforseo/services";

export async function POST(request: Request) {
  if (!isDataForSeoConfigured()) {
    return NextResponse.json(
      { message: "Add DATAFORSEO_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  const result = await requireUser(request);
  if ("response" in result) return result.response;

  try {
    const body = await request.json();
    const prompt = String(body.prompt ?? "").trim();
    if (!prompt) {
      return NextResponse.json({ message: "Enter a prompt." }, { status: 400 });
    }

    const lookup = await runPromptExplorer(prompt);
    return NextResponse.json({ result: lookup });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Prompt failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
