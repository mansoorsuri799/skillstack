import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import {
  getInternalLinksReport,
  type InternalLinksReportType,
} from "@/lib/dataforseo/pages-links";
import { getProjectForUser } from "@/lib/dashboard/project";

const REPORT_TYPES = new Set<InternalLinksReportType>([
  "links",
  "most-linked",
  "anchors",
]);

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
    const type = String(body.type ?? "") as InternalLinksReportType;

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

    const data = await getInternalLinksReport(type, domain);
    return NextResponse.json({ type, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const maxDuration = 120;
