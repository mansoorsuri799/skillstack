import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import {
  getOrganicReport,
  type OrganicReportType,
} from "@/lib/dataforseo/organic-search";
import { getOrganicCompetitorsReport } from "@/lib/dashboard/organic-competitors";
import { getProjectForUser } from "@/lib/dashboard/project";
import { isFirecrawlConfigured } from "@/lib/firecrawl/search";

const REPORT_TYPES = new Set<OrganicReportType>([
  "keywords",
  "positions",
  "pages",
  "competitors",
]);

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
        body.locationCode ?? project.locationCode,
        body.languageCode ?? project.languageCode,
      );
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
      body.locationCode ?? project.locationCode,
      body.languageCode ?? project.languageCode,
      body.scope !== "domain",
    );

    return NextResponse.json({ type, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
