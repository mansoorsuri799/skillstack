import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import {
  fetchBacklinkRows,
  fetchBacklinksOverview,
  fetchReferringDomainRows,
  fetchTopPageRows,
} from "@/lib/dataforseo/backlinks-dashboard";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
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
    const scope = String(body.scope ?? "subdomains");
    const includeSubdomains = scope === "subdomains" || scope === "subfolder";
    const tab = body.tab ?? "overview";
    const mode =
      body.mode === "as_is" ? ("as_is" as const) : ("one_per_domain" as const);

    if (!domain) {
      return NextResponse.json({ message: "Enter a domain to analyze." }, { status: 400 });
    }

    if (tab === "backlinks") {
      const rows = await fetchBacklinkRows(domain, includeSubdomains, mode);
      return NextResponse.json({ tab, rows });
    }

    if (tab === "referring") {
      const rows = await fetchReferringDomainRows(domain, includeSubdomains);
      return NextResponse.json({ tab, rows });
    }

    if (tab === "pages") {
      const rows = await fetchTopPageRows(domain, includeSubdomains);
      return NextResponse.json({ tab, rows });
    }

    const overview = await fetchBacklinksOverview(domain, includeSubdomains);
    return NextResponse.json({ tab: "overview", overview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
