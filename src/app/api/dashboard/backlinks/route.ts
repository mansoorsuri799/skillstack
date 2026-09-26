import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import {
  fetchBacklinkRows,
  fetchBacklinksOverview,
  fetchReferringDomainRows,
  fetchTopPageRows,
} from "@/lib/dataforseo/backlinks-dashboard";
import { cacheKey, getCached, setCached } from "@/lib/dataforseo/cache";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { getProjectForUser } from "@/lib/dashboard/project";

const BACKLINKS_TTL_MS = 10 * 60 * 1000;
const TABLE_LIMIT = 200;

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

    const key = cacheKey(["backlinks", tab, domain, includeSubdomains, mode]);
    const cached = getCached<unknown>(key);
    if (cached) {
      if (tab === "overview") {
        return NextResponse.json({ tab: "overview", overview: cached, cached: true });
      }
      return NextResponse.json({ tab, rows: cached, cached: true });
    }

    if (tab === "backlinks") {
      const rows = await fetchBacklinkRows(domain, includeSubdomains, mode, TABLE_LIMIT);
      setCached(key, rows, BACKLINKS_TTL_MS);
      return NextResponse.json({ tab, rows });
    }

    if (tab === "referring") {
      const rows = await fetchReferringDomainRows(domain, includeSubdomains, TABLE_LIMIT);
      setCached(key, rows, BACKLINKS_TTL_MS);
      return NextResponse.json({ tab, rows });
    }

    if (tab === "pages") {
      const rows = await fetchTopPageRows(domain, includeSubdomains, TABLE_LIMIT);
      setCached(key, rows, BACKLINKS_TTL_MS);
      return NextResponse.json({ tab, rows });
    }

    const overview = await fetchBacklinksOverview(domain, includeSubdomains);
    setCached(key, overview, BACKLINKS_TTL_MS);
    return NextResponse.json({ tab: "overview", overview });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
