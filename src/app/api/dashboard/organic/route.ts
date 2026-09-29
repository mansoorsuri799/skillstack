import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { cacheKey, getCached, setCached, DATAFORSEO_CACHE_TTL_MS } from "@/lib/dataforseo/cache";
import {
  getOrganicReport,
  type OrganicReportType,
} from "@/lib/dataforseo/organic-search";
import { getOrganicCompetitorsReport } from "@/lib/dashboard/organic-competitors";
import { getProjectForUser } from "@/lib/dashboard/project";
import { isFirecrawlConfigured } from "@/lib/firecrawl/search";
import {
  DEFAULT_LOCATION_CODE,
  isAllLocations,
} from "@/lib/dashboard/locations";

const REPORT_TYPES = new Set<OrganicReportType>([
  "keywords",
  "positions",
  "pages",
  "competitors",
]);

const ORGANIC_TTL_MS = DATAFORSEO_CACHE_TTL_MS;

export async function POST(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    const project = await getProjectForUser(user.id);
    const body = await request.json();
    const type = String(body.type ?? "") as OrganicReportType;

    if (!REPORT_TYPES.has(type)) {
      return NextResponse.json({ message: "Invalid report type." }, { status: 400 });
    }

    const domain = normalizeDomain(String(body.domain ?? project.domain));
    if (!domain || domain === "example.com") {
      return NextResponse.json(
        { message: "Enter a domain to analyze." },
        { status: 400 },
      );
    }

    // Keep All locations (0) as-is — organic-search merges major markets.
    const locationCode = Number(
      body.locationCode ?? project.locationCode ?? DEFAULT_LOCATION_CODE,
    );
    const languageCode = body.languageCode ?? project.languageCode;
    const includeSubdomains = body.scope !== "domain";
    const key = cacheKey([
      "organic-v2",
      type,
      domain,
      isAllLocations(locationCode) ? "all" : locationCode,
      languageCode,
      includeSubdomains,
    ]);
    const cached = getCached<unknown>(key);
    if (cached) {
      return NextResponse.json({ type, data: cached, cached: true });
    }

    if (type === "competitors") {
      if (!isFirecrawlConfigured() && !isDataForSeoConfigured()) {
        return NextResponse.json(
          {
            message:
              "Add FIRECRAWL_API_KEY (or DATAFORSEO_API_KEY) to .env.local to load organic competitors.",
          },
          { status: 503 },
        );
      }

      const data = await getOrganicCompetitorsReport(
        domain,
        locationCode,
        languageCode,
      );
      setCached(key, data, ORGANIC_TTL_MS);
      return NextResponse.json({ type, data });
    }

    if (!isDataForSeoConfigured()) {
      return NextResponse.json(
        { message: "Add DATAFORSEO_API_KEY to .env.local." },
        { status: 503 },
      );
    }

    const data = await getOrganicReport(
      type,
      domain,
      locationCode,
      languageCode,
      includeSubdomains,
    );
    setCached(key, data, ORGANIC_TTL_MS);

    return NextResponse.json({ type, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
