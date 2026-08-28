import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured, normalizeDomain } from "@/lib/dataforseo/client";
import { getProjectDocument, getProjectForUser } from "@/lib/dashboard/project";
import { runAiSiteAuditDiagnostic } from "@/lib/audit/ai-diagnostic-engine";

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
    const body = (await request.json().catch(() => ({}))) as { domain?: string };
    const domain = normalizeDomain(String(body.domain ?? project.domain));

    if (!domain || domain === "example.com") {
      return NextResponse.json(
        { message: "Enter a valid website domain to audit." },
        { status: 400 },
      );
    }

    const projectDoc = await getProjectDocument(user.id, true);

    const report = await runAiSiteAuditDiagnostic(domain, {
      gscConnected: projectDoc.gscConnected,
      gscSiteUrl: projectDoc.gscSiteUrl,
      gscRefreshToken: projectDoc.gscRefreshToken,
      gscAccessToken: projectDoc.gscAccessToken,
      gscTokenExpiry: projectDoc.gscTokenExpiry,
    });

    return NextResponse.json({ report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI Site Audit failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const maxDuration = 120;
