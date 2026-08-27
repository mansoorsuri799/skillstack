import PDFDocument from "pdfkit";
import type { SiteAuditReport } from "@/lib/audit/types";
import { sectionFixes } from "@/lib/audit/report-builder";

const BRAND = "SkillStack";
const ACCENT = "#14b8a6";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function severityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "medium":
      return "#eab308";
    default:
      return "#94a3b8";
  }
}

type PdfDoc = InstanceType<typeof PDFDocument>;

function writeHeading(doc: PdfDoc, text: string, size = 16) {
  doc.moveDown(0.5).font("Helvetica-Bold").fontSize(size).fillColor("#111827").text(text);
  doc.moveDown(0.3);
}

function writeBody(doc: PdfDoc, text: string) {
  doc.font("Helvetica").fontSize(10).fillColor("#374151").text(text, { lineGap: 4 });
}

function writeBulletList(doc: PdfDoc, items: string[]) {
  for (const item of items) {
    doc.font("Helvetica").fontSize(10).fillColor("#374151").text(`•  ${item}`, {
      indent: 12,
      lineGap: 3,
    });
  }
}

function ensureSpace(doc: PdfDoc, needed = 120) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

export function generateAuditPdf(report: SiteAuditReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const fixes = sectionFixes(report);

    // Cover
    doc.font("Helvetica-Bold").fontSize(22).fillColor("#111827").text("SEO & Technical Audit Report");
    doc.moveDown(0.4);
    doc.font("Helvetica-Bold").fontSize(18).fillColor(ACCENT).text(report.domain);
    doc.moveDown(0.6);
    doc.font("Helvetica").fontSize(11).fillColor("#6b7280");
    doc.text(`Prepared: ${formatDate(report.preparedAt)}`);
    doc.text(`Overall Security Grade: ${report.overallSecurityGrade}`);
    doc.text(`By ${report.brandName || BRAND}`);

    doc.moveDown(1.2);
    writeHeading(doc, "Executive Summary", 14);
    for (const paragraph of report.executiveSummary) {
      writeBody(doc, paragraph);
      doc.moveDown(0.4);
    }

    // Findings table
    ensureSpace(doc, 180);
    writeHeading(doc, "Findings Summary", 14);
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
    doc.text("Severity    Area                    Issue");
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(9);
    for (const finding of report.findings) {
      ensureSpace(doc, 40);
      doc.fillColor(severityColor(finding.severity));
      doc.text(finding.severity.padEnd(12), { continued: true });
      doc.fillColor("#374151");
      doc.text(
        `${finding.area.slice(0, 22).padEnd(24)} ${finding.issue.slice(0, 70)}`,
      );
      doc.fontSize(8).fillColor("#6b7280").text(`   Impact: ${finding.impact}`, {
        indent: 12,
      });
      doc.fontSize(9);
      doc.moveDown(0.2);
    }

    // Section 1 — Security
    doc.addPage();
    writeHeading(doc, `1. Security Headers — ${report.overallSecurityGrade} Rating`);
    writeBody(
      doc,
      `A live scan of ${report.securityHeaders.scannedUrl} (scanned ${formatDate(report.securityHeaders.scannedAt)}) returned a ${report.overallSecurityGrade} grade.`,
    );
    doc.moveDown(0.4);
    if (report.securityHeaders.missing.length > 0) {
      writeBody(doc, "The following headers are missing:");
      writeBulletList(doc, report.securityHeaders.missing);
    } else {
      writeBody(doc, "All six recommended security headers are present.");
    }
    doc.moveDown(0.5);
    writeBody(doc, "Why it matters");
    writeBody(
      doc,
      "Without these headers the site has no defense layer against clickjacking, browsers can misinterpret file types, and injected scripts have fewer restrictions.",
    );
    doc.moveDown(0.4);
    writeBody(doc, "How to fix");
    writeBulletList(doc, fixes.security);

    // Section 2 — H1
    ensureSpace(doc, 160);
    writeHeading(doc, "2. Missing H1 Tags");
    const missingH1 = report.onPageSeo.pagesMissingH1;
    if (missingH1.length === 0) {
      writeBody(doc, "All analyzed pages include an H1 heading tag.");
    } else {
      writeBody(doc, "The following pages have no H1 heading tag:");
      writeBulletList(doc, missingH1.map((p) => p.url));
      doc.moveDown(0.4);
      writeBody(doc, "How to fix");
      writeBulletList(doc, fixes.h1);
    }

    // Section 3 — Crawlability
    ensureSpace(doc, 140);
    writeHeading(doc, "3. Crawlability & Technical Issues");
    if (report.crawlability.issues.length === 0) {
      writeBody(doc, "No critical crawlability issues were detected on probed paths.");
    } else {
      for (const issue of report.crawlability.issues) {
        writeBody(doc, `${issue.url} — HTTP ${issue.statusCode}`);
        writeBody(doc, issue.issue);
        doc.moveDown(0.3);
      }
      doc.moveDown(0.3);
      writeBody(doc, "How to fix");
      writeBulletList(doc, fixes.crawl404);
    }

    // Section 4 — Backlinks
    ensureSpace(doc, 140);
    writeHeading(doc, "4. Backlink Profile & Organic Search");
    writeBulletList(doc, [
      `Domain Rating (DR): ${report.backlinks.domainRating ?? "—"}`,
      `Referring domains: ${report.backlinks.referringDomains ?? "—"}`,
      `Total backlinks: ${report.backlinks.totalBacklinks ?? "—"}`,
      `Organic keywords: ${report.domainMetrics.organicKeywords ?? "—"}`,
      `Top 3 rankings: ${report.domainMetrics.top3Rankings ?? "—"}`,
      `Organic traffic (est.): ${report.domainMetrics.organicTraffic ?? "—"}`,
      `Traffic value (est.): ${report.domainMetrics.trafficValue != null ? `$${report.domainMetrics.trafficValue.toLocaleString()}` : "—"}`,
    ]);

    // Section 5 — Performance
    ensureSpace(doc, 160);
    writeHeading(doc, "5. Page Performance & Agentic Browsing");
    const m = report.performance.mobile;
    const d = report.performance.desktop;
    writeBody(
      doc,
      `Mobile: Performance ${m.performance}, Accessibility ${m.accessibility}, Best Practices ${m.bestPractices}, SEO ${m.seo}, Agentic Browsing ${m.agenticBrowsing.score}/${m.agenticBrowsing.max}`,
    );
    doc.moveDown(0.3);
    writeBody(
      doc,
      `Desktop: Performance ${d.performance}, Accessibility ${d.accessibility}, Best Practices ${d.bestPractices}, SEO ${d.seo}, Agentic Browsing ${d.agenticBrowsing.score}/${d.agenticBrowsing.max}`,
    );

    // Action plan
    doc.addPage();
    writeHeading(doc, "Prioritized Action Plan");
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6b7280");
    doc.text("Priority   Action                                          Severity");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(9);
    for (const item of report.actionPlan) {
      doc.fillColor("#374151");
      doc.text(
        `${String(item.priority).padEnd(10)} ${item.action.slice(0, 48).padEnd(50)} ${item.severity}`,
      );
      doc.moveDown(0.15);
    }

    doc.moveDown(1);
    doc.font("Helvetica-Oblique").fontSize(10).fillColor("#6b7280").text("End of report.");

    doc.end();
  });
}
