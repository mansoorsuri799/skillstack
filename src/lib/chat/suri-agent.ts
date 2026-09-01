import { getDomainOverview } from "@/lib/dataforseo/services";
import { queryGscAnalytics, getValidGscAccessToken } from "@/lib/google/gsc";
import { runPromptExplorer } from "@/lib/dataforseo/services";
import { hasReadyProjectDomain, missingProjectDomainReply } from "@/lib/chat/project-domain";
import { runSerpCompetitorSearch, wantsLiveSerpSearch } from "@/lib/chat/serp-competitors";

type SuriContext = {
  domain: string;
  projectName: string;
  gscProject?: {
    gscConnected?: boolean;
    gscSiteUrl?: string | null;
    gscRefreshToken?: string | null;
    gscAccessToken?: string | null;
    gscTokenExpiry?: Date | null;
  } | null;
  fileAnalysis?: {
    report: string;
    synthesisBrief: string;
  } | null;
};

export async function runSuriAgentReply(
  prompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  context: SuriContext,
): Promise<{
  answer: string;
  sources: Array<{ title: string; url: string }>;
}> {
  const domain = context.domain;
  const promptLower = prompt.toLowerCase();

  if (context.fileAnalysis?.report) {
    return runFileAnalysisReply(prompt, context);
  }

  if (wantsLiveSerpSearch(promptLower)) {
    if (!hasReadyProjectDomain(domain)) {
      return missingProjectDomainReply();
    }
    try {
      return await runSerpCompetitorSearch(domain);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown error";
      return {
        answer: `I tried a live SERP search for **${domain}** but Firecrawl returned an error: ${detail}\n\nConfirm \`FIRECRAWL_API_KEY\` in \`.env.local\`, then ask again.`,
        sources: [{ title: domain, url: `https://${domain}` }],
      };
    }
  }

  // 1. Check if asking about GSC
  if (
    (promptLower.includes("search console") || promptLower.includes("gsc") || promptLower.includes("traffic trend")) &&
    context.gscProject?.gscConnected &&
    context.gscProject.gscSiteUrl &&
    context.gscProject.gscRefreshToken
  ) {
    try {
      const tokenResult = await getValidGscAccessToken(context.gscProject);
      const accessToken = typeof tokenResult === "string" ? tokenResult : tokenResult.accessToken;
      const rows = await queryGscAnalytics(accessToken, context.gscProject.gscSiteUrl, "query", 28, 20);

      const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
      const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
      const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";
      const top3Queries = rows.slice(0, 5).map((r, i) => `${i + 1}. **"${r.key}"** (${r.clicks.toLocaleString()} clicks, ${r.impressions.toLocaleString()} impressions, Pos #${r.position.toFixed(1)})`).join("\n");

      return {
        answer: `Here is the current 28-day Google Search Console performance summary for **${context.gscProject.gscSiteUrl}**:\n\n- **Total Organic Clicks**: ${totalClicks.toLocaleString()}\n- **Total Impressions**: ${totalImpressions.toLocaleString()}\n- **Average CTR**: ${avgCtr}%\n\n### Top Performing Queries:\n${top3Queries}\n\n**Recommendation**: Look for keywords with high impressions but low CTR (<2%) to optimize your title tags and meta descriptions for an immediate click lift.`,
        sources: [
          { title: `Google Search Console — ${context.gscProject.gscSiteUrl}`, url: `https://search.google.com/search-console` },
        ],
      };
    } catch {
      // Fall through to general synthesis
    }
  }

  // 2. Check if asking about quick wins or keywords
  if (
    promptLower.includes("quick win") ||
    promptLower.includes("focus on next") ||
    promptLower.includes("keywords") ||
    promptLower.includes("rank for")
  ) {
    try {
      if (domain && domain !== "example.com") {
        const overview = await getDomainOverview(domain);
        const topKws = overview.topKeywords.slice(0, 6);
        const striking = topKws.filter((k) => k.rank && k.rank >= 4 && k.rank <= 20);

        if (promptLower.includes("quick win") || promptLower.includes("already rank for")) {
          const kwList = (striking.length > 0 ? striking : topKws).map(
            (k) => `- **"${k.keyword}"** (Rank: #${k.rank ?? "N/A"}, Volume: ${k.searchVolume?.toLocaleString() ?? 0}/mo, CPC: $${k.cpc?.toFixed(2) ?? "0.00"})`,
          ).join("\n");

          return {
            answer: `Here are the top high-potential ranking opportunities for **${domain}**:\n\n${kwList || "No keywords currently ranking in positions #4–#20."}\n\n### Suri's Quick-Win Strategy:\n1. **Add FAQ Schema**: Inject Question/Answer accordions targeting secondary search intent.\n2. **Strengthen Internal Links**: Link from your highest-authority pages to these target URLs using descriptive anchor text.\n3. **Intent Refresh**: Update titles to include the current year and primary benefit.`,
            sources: [
              { title: `Domain Organic Report — ${domain}`, url: `https://${domain}` },
            ],
          };
        }
      }
    } catch {
      // Fall through to live AI scraper
    }
  }

  // 3. Fallback to Live AI Search query with project domain injected for hyper-relevant context
  try {
    const contextualPrompt = domain && domain !== "example.com"
      ? `Acting as Suri, an expert SEO agent for the website ${domain}: ${prompt}`
      : prompt;

    const result = await runPromptExplorer(contextualPrompt);
    return {
      answer: result.answer,
      sources: result.sources || [],
    };
  } catch {
    return {
      answer: `Here are the core SEO recommendations for **${domain || "your website"}** regarding "${prompt}":\n\n1. **Technical & Crawlability**: Ensure clean robots.txt directives, sitemap declarations, and complete HTTPS transport security.\n2. **AEO & Entity Schemas**: Implement Organization and FAQPage JSON-LD markup to capture Google AI Overviews.\n3. **Content Clusters**: Develop pillar topics linked to supporting long-tail question articles to build topical authority.\n4. **Search Console Monitoring**: Continuously track queries with high impressions and optimize snippets for higher CTR.`,
      sources: [
        { title: "Google Search Central Documentation", url: "https://developers.google.com/search" },
      ],
    };
  }
}

async function runFileAnalysisReply(
  prompt: string,
  context: SuriContext,
): Promise<{
  answer: string;
  sources: Array<{ title: string; url: string }>;
}> {
  const localReport = context.fileAnalysis?.report || "";
  const domainLabel = context.domain && context.domain !== "example.com" ? context.domain : "this project";
  const sources = [
    {
      title: "Uploaded files — Suri extraction",
      url:
        context.domain && context.domain !== "example.com"
          ? `https://${context.domain}`
          : "https://developers.google.com/search",
    },
  ];

  try {
    const synthesisPrompt = `Acting as Suri, an expert SEO agent for ${domainLabel}. The user uploaded files. Extraction notes:\n${context.fileAnalysis?.synthesisBrief || ""}\n\nUser request: ${prompt}\n\nGive concise, actionable recommendations. Do not repeat the file inventory. Focus on SEO, content, technical fixes, and what to do next.`;
    const result = await runPromptExplorer(synthesisPrompt);
    return {
      answer: `${localReport}\n\n---\n\n### Suri's recommendations\n\n${result.answer}`,
      sources: result.sources?.length ? result.sources : sources,
    };
  } catch {
    return {
      answer: `${localReport}\n\n---\n\n### Suri's recommendations\n\n1. Fix the issues listed above first — titles, meta descriptions, image weight, and thin copy move rankings fastest.\n2. Rename files with descriptive hyphenated slugs and add specific alt text before publishing.\n3. If this is a content draft, add H2s that match search intent and a short FAQ block for AI Overviews.\n4. Re-upload after edits if you want Suri to re-check the same files.`,
      sources,
    };
  }
}
