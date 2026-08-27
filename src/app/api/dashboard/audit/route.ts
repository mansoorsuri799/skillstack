import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { runFullSiteAudit } from "@/lib/audit/run-site-audit";
import { parseAuditUrl } from "@/lib/audit/parse-url";
import type { SiteAuditReport } from "@/lib/audit/types";
import { getProjectForUser } from "@/lib/dashboard/project";
import { SiteAudit } from "@/models/SiteAudit";

function summarizeAudit(a: {
  _id: { toString(): string };
  status: string;
  score?: number | null;
  seoScore?: number | null;
  securityGrade?: string | null;
  pagesCrawled?: number;
  issues?: unknown[];
  report?: SiteAuditReport | null;
  createdAt: Date;
}) {
  const report = a.report as SiteAuditReport | null | undefined;
  return {
    id: a._id.toString(),
    status: a.status,
    score: a.score ?? null,
    seoScore: a.seoScore ?? report?.performance.mobile.seo ?? null,
    securityGrade: a.securityGrade ?? report?.overallSecurityGrade ?? null,
    pagesCrawled: a.pagesCrawled ?? 0,
    issueCount: report?.findings.length ?? a.issues?.length ?? 0,
    findingCount: report?.findings.length ?? null,
    targetUrl: report?.url ?? report?.domain ?? null,
    createdAt: a.createdAt,
  };
}

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  const project = await getProjectForUser(user.id);
  await connectDB();

  const audits = await SiteAudit.find({ projectId: project.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return NextResponse.json({
    audits: audits.map((a) => summarizeAudit(a)),
  });
}

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
    await connectDB();

    const body = (await request.json().catch(() => ({}))) as { url?: string };
    let auditUrl: string;
    try {
      auditUrl = parseAuditUrl(body.url ?? "");
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof Error ? error.message : "Enter a valid site URL.",
        },
        { status: 400 },
      );
    }

    const audit = await SiteAudit.create({
      userId: user.id,
      projectId: project.id,
      status: "running",
    });

    try {
      const report = await runFullSiteAudit(auditUrl, "SkillStack");

      audit.status = "completed";
      audit.score = report.performance.mobile.performance;
      audit.seoScore = report.performance.mobile.seo;
      audit.securityGrade = report.overallSecurityGrade;
      audit.pagesCrawled = report.crawlability.pagesCrawled;
      audit.report = report;
      audit.set(
        "issues",
        report.lighthouseIssues.map((issue) => ({
          type: issue.type,
          severity: issue.severity as "critical" | "warning" | "notice",
          message: issue.message,
          url: report.url,
        })),
      );
      await audit.save();

      return NextResponse.json({
        audit: {
          ...summarizeAudit(audit.toObject()),
          report,
        },
      });
    } catch (error) {
      audit.status = "failed";
      audit.errorMessage =
        error instanceof Error ? error.message : "Audit failed";
      await audit.save();
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audit failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
