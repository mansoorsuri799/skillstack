import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { exploreBrandMentions } from "@/lib/dataforseo/services";
import { getProjectForUser } from "@/lib/dashboard/project";

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
    const project = await getProjectForUser(user.id);
    const body = await request.json();
    const brand = String(body.brand ?? "").trim();
    if (!brand) {
      return NextResponse.json({ message: "Enter a brand name." }, { status: 400 });
    }

    const lookup = await exploreBrandMentions(brand, project.domain);
    return NextResponse.json({ result: lookup });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
