import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { runLighthouseAudit } from "@/lib/dataforseo/services";
import { getProjectForUser } from "@/lib/dashboard/project";
import { SiteAudit } from "@/models/SiteAudit";

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
    audits: audits.map((a) => ({
      id: a._id.toString(),
      status: a.status,
      score: a.score,
      pagesCrawled: a.pagesCrawled,
      issueCount: a.issues.length,
      createdAt: a.createdAt,
    })),
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

    const url = project.domain.startsWith("http")
      ? project.domain
      : `https://${project.domain}`;

    const audit = await SiteAudit.create({
      userId: user.id,
      projectId: project.id,
      status: "running",
    });

    try {
      const lighthouse = await runLighthouseAudit(url);
      audit.status = "completed";
      audit.score = lighthouse.score;
      audit.pagesCrawled = 1;
      audit.set(
        "issues",
        lighthouse.issues.map((issue) => ({
          type: issue.type,
          severity: issue.severity as "critical" | "warning" | "notice",
          message: issue.message,
          url,
        })),
      );
      await audit.save();

      return NextResponse.json({
        audit: {
          id: audit._id.toString(),
          score: audit.score,
          seoScore: lighthouse.seoScore,
          issues: audit.issues,
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
