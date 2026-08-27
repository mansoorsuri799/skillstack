import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import {
  getBacklinksList,
  getBacklinksSummary,
  getReferringDomains,
} from "@/lib/dataforseo/services";
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
    const domain = normalizeDomain(String(body.domain ?? project.domain));
    const includeSubdomains = body.scope !== "domain";
    const tab = body.tab ?? "summary";

    if (tab === "backlinks") {
      const rows = await getBacklinksList(domain, includeSubdomains);
      return NextResponse.json({ tab, rows });
    }

    if (tab === "referring") {
      const rows = await getReferringDomains(domain, includeSubdomains);
      return NextResponse.json({ tab, rows });
    }

    const summary = await getBacklinksSummary(domain, includeSubdomains);
    return NextResponse.json({ tab: "summary", summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
