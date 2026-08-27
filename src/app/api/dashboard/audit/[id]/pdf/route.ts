import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { connectDB } from "@/lib/db";
import { generateAuditPdf } from "@/lib/audit/generate-pdf";
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

  const report = audit.report as SiteAuditReport | null;
  if (!report || audit.status !== "completed") {
    return NextResponse.json(
      { message: "Report not available for this audit" },
      { status: 404 },
    );
  }

  const pdf = await generateAuditPdf(report);
  const filename = `seo-audit-${report.domain.replace(/[^a-z0-9.-]/gi, "-")}-${new Date(report.preparedAt).toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
