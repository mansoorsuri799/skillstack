import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { getAllAiToolUsage } from "@/lib/dashboard/ai-tool-limits";

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  try {
    const usage = await getAllAiToolUsage(result.user.id);
    return NextResponse.json(usage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load usage";
    return NextResponse.json({ message }, { status: 500 });
  }
}
