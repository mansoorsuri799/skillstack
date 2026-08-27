import { OnPageLighthouseLiveJsonRequestInfo } from "dataforseo-client";
import { onPageApi, taskItems } from "@/lib/dataforseo/client";
import type { LighthouseScores } from "@/lib/audit/types";

type LighthouseItem = {
  categories?: {
    performance?: { score?: number | null } | null;
    seo?: { score?: number | null } | null;
    accessibility?: { score?: number | null } | null;
    "best-practices"?: { score?: number | null } | null;
  } | null;
  audits?: Record<
    string,
    { title?: string; score?: number | null; description?: string }
  > | null;
};

function score100(value: number | null | undefined): number {
  return Math.round((value ?? 0) * 100);
}

function extractAgenticBrowsing(
  audits: Record<string, { title?: string; score?: number | null }>,
): { score: number; max: number } {
  for (const [id, audit] of Object.entries(audits)) {
    if (
      id.includes("agentic") ||
      audit.title?.toLowerCase().includes("agentic")
    ) {
      const raw = audit.score ?? 0;
      return { score: raw >= 1 ? 2 : raw >= 0.5 ? 1 : 0, max: 2 };
    }
  }

  const structured = audits["structured-data"]?.score ?? 0;
  const crawlable = audits["crawlable-anchors"]?.score ?? 0;
  const meta = audits["meta-description"]?.score ?? 0;
  const avg = (structured + crawlable + meta) / 3;
  return { score: avg >= 0.9 ? 2 : avg >= 0.5 ? 1 : 0, max: 2 };
}

export async function runLighthouseScores(
  url: string,
  forMobile: boolean,
): Promise<{
  scores: LighthouseScores;
  issues: Array<{ type: string; severity: string; message: string }>;
}> {
  const api = onPageApi();
  const response = await api.lighthouseLiveJson([
    {
      url,
      for_mobile: forMobile,
    } as OnPageLighthouseLiveJsonRequestInfo,
  ]);

  const item = taskItems<LighthouseItem>(response)[0];
  const audits = item?.audits ?? {};

  const scores: LighthouseScores = {
    performance: score100(item?.categories?.performance?.score),
    accessibility: score100(item?.categories?.accessibility?.score),
    bestPractices: score100(item?.categories?.["best-practices"]?.score),
    seo: score100(item?.categories?.seo?.score),
    agenticBrowsing: extractAgenticBrowsing(audits),
  };

  const issues: Array<{ type: string; severity: string; message: string }> =
    [];
  for (const [id, audit] of Object.entries(audits)) {
    if (audit.score === 1 || audit.score === null || audit.score === undefined) {
      continue;
    }
    issues.push({
      type: id,
      severity: audit.score < 0.5 ? "critical" : "warning",
      message: audit.title ?? id,
    });
    if (issues.length >= 20) break;
  }

  return { scores, issues };
}
