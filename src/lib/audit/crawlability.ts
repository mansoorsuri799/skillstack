import type { CrawlIssue } from "@/lib/audit/types";

const COMMON_PROBE_PATHS = [
  "/cdn-cgi/l/email-protection",
  "/robots.txt",
  "/sitemap.xml",
];

export async function probeCrawlability(
  baseUrl: string,
  domain: string,
): Promise<CrawlIssue[]> {
  const origin = baseUrl.replace(/\/$/, "");
  const issues: CrawlIssue[] = [];

  for (const path of COMMON_PROBE_PATHS) {
    const url = `${origin}${path}`;
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(12_000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; SkillStack-Audit/1.0; +https://skillstack.com.pk)",
        },
      });

      if (response.status === 404 && path === "/cdn-cgi/l/email-protection") {
        issues.push({
          url,
          statusCode: 404,
          issue:
            "Cloudflare email protection path returns 404 — may waste crawl budget or indicate broken email obfuscation.",
        });
      } else if (response.status >= 400 && path !== "/cdn-cgi/l/email-protection") {
        issues.push({
          url,
          statusCode: response.status,
          issue: `${path} returned HTTP ${response.status}.`,
        });
      }
    } catch {
      // Ignore unreachable probe paths
    }
  }

  if (issues.length === 0 && domain) {
    // No issues found on probes — still valid
  }

  return issues;
}
