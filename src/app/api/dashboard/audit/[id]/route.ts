import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import type { SiteAuditReport } from "@/lib/audit/types";
import { SiteAudit } from "@/models/SiteAudit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;
  const { id } = await context.params;

  await connectDB();
  const audit = await SiteAudit.findOne({ _id: id, userId: user.id }).lean();
  if (!audit) {
    return NextResponse.json({ message: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({
    audit: {
      id: audit._id.toString(),
      status: audit.status,
      score: audit.score,
      seoScore: audit.seoScore,
      securityGrade: audit.securityGrade,
      pagesCrawled: audit.pagesCrawled,
      issues: audit.issues,
      report: audit.report as SiteAuditReport | null,
      errorMessage: audit.errorMessage,
      createdAt: audit.createdAt,
    },
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;
  const { id } = await context.params;

  await connectDB();
  const deleted = await SiteAudit.deleteOne({ _id: id, userId: user.id });
  if (deleted.deletedCount === 0) {
    return NextResponse.json({ message: "Audit not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
