import { getDomainOverviewLight } from "@/lib/dataforseo/services";
import { queryGscAnalytics, getValidGscAccessToken } from "@/lib/google/gsc";
import { hasReadyProjectDomain, missingProjectDomainReply } from "@/lib/chat/project-domain";
import { runSerpCompetitorSearch, wantsLiveSerpSearch } from "@/lib/chat/serp-competitors";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";

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

export type SuriReply = {
  answer: string;
  sources: Array<{ title: string; url: string }>;
};

export type SuriStreamEvent =
  | { type: "token"; text: string }
  | { type: "done"; reply: SuriReply };

/** Yield answer in small chunks so the chat UI paints like a live stream. */
async function* streamReply(reply: SuriReply): AsyncGenerator<SuriStreamEvent> {
  const text = reply.answer;
  const step = 24;
  for (let i = 0; i < text.length; i += step) {
    yield { type: "token", text: text.slice(i, i + step) };
  }
  yield { type: "done", reply };
}

function defaultSources(domain: string) {
  if (domain && domain !== "example.com") {
    return [{ title: domain, url: `https://${domain}` }];
  }
  return [
    {
      title: "Google Search Central Documentation",
      url: "https://developers.google.com/search",
    },
  ];
}

function wantsGsc(promptLower: string) {
  return (
    promptLower.includes("search console") ||
    promptLower.includes("gsc") ||
    promptLower.includes("traffic trend")
  );
}

function wantsKeywordData(promptLower: string) {
  return (
    promptLower.includes("quick win") ||
    promptLower.includes("focus on next") ||
    promptLower.includes("already rank for") ||
    promptLower.includes("keyword") ||
    promptLower.includes("rank for") ||
    promptLower.includes("ranking")
  );
}

function wantsDomainOverview(promptLower: string) {
  return (
    promptLower.includes("overview") ||
    promptLower.includes("how is my site") ||
    promptLower.includes("my domain") ||
    promptLower.includes("organic traffic") ||
    promptLower.includes("authority") ||
    promptLower.includes("performance") ||
    promptLower.includes("audit") ||
    promptLower.includes("analyze")
  );
}

/** Instant path for greetings — no network. */
function tryInstantReply(prompt: string, context: SuriContext): SuriReply | null {
  const cleaned = prompt.trim().toLowerCase();
  if (
    /^(hi|hello|hey|salam|assalam|yo|sup)[\s!.?]*$/.test(cleaned) ||
    cleaned === "hello suri" ||
    cleaned === "hi suri"
  ) {
    const domain =
      context.domain && context.domain !== "example.com" ? context.domain : null;
    return {
      answer: domain
        ? `Hey — Suri here. I am ready on **${domain}**, powered by live DataForSEO data. Ask about keywords, competitors, GSC, content, or technical SEO.`
        : `Hey — Suri here. Set a real project domain, then ask about keywords, competitors, GSC, or technical SEO. Answers use DataForSEO — not ChatGPT.`,
      sources: defaultSources(context.domain),
    };
  }
  return null;
}

function formatDomainOverviewReply(
  domain: string,
  overview: Awaited<ReturnType<typeof getDomainOverviewLight>>,
  mode: "keywords" | "overview" | "general",
): SuriReply {
  const topKws = overview.topKeywords.slice(0, 8);
  const striking = topKws.filter((k) => k.rank && k.rank >= 4 && k.rank <= 20);
  const kwList = (striking.length > 0 ? striking : topKws)
    .map(
      (k) =>
        `- **"${k.keyword}"** (Rank: #${k.rank ?? "N/A"}, Volume: ${k.searchVolume?.toLocaleString() ?? 0}/mo, CPC: $${k.cpc?.toFixed(2) ?? "0.00"})`,
    )
    .join("\n");

  const traffic = overview.organicTraffic?.toLocaleString() ?? "N/A";
  const kwCount = overview.organicKeywords?.toLocaleString() ?? "N/A";
  const pos1 = overview.topPositions.pos1 ?? 0;
  const pos2 = overview.topPositions.pos2_3 ?? 0;
  const pos4 = overview.topPositions.pos4_10 ?? 0;

  if (mode === "keywords") {
    return {
      answer: `Here are high-potential ranking opportunities for **${domain}** (DataForSEO Labs):\n\n${kwList || "No ranked keywords returned for this market yet."}\n\n### Suri's Quick-Win Strategy\n1. **FAQ Schema** on pages already in positions 4–20.\n2. **Internal links** from your strongest pages to these URLs.\n3. **Title refresh** with clear benefit + current year where it fits intent.`,
      sources: [
        { title: `Domain Organic Report — ${domain}`, url: `https://${domain}` },
      ],
    };
  }

  const topPages = overview.topPages
    .slice(0, 5)
    .map(
      (p, i) =>
        `${i + 1}. \`${p.url}\` — ~${p.traffic?.toLocaleString() ?? 0} est. traffic · ${p.keywords ?? 0} keywords`,
    )
    .join("\n");

  return {
    answer: `### ${domain} — live DataForSEO snapshot\n\n- **Est. organic traffic**: ${traffic}/mo\n- **Organic keywords**: ${kwCount}\n- **Positions**: #1 → ${pos1} · #2–3 → ${pos2} · #4–10 → ${pos4}\n\n### Top pages\n${topPages || "No page metrics returned."}\n\n### Keyword opportunities\n${kwList || "No keyword rows returned."}\n\n### Next moves\n1. Push striking-distance keywords (#4–#20) with on-page + internal links.\n2. Strengthen the top pages above — they already earn traffic.\n3. Connect Search Console in SkillStack for click/impression truth alongside Labs estimates.`,
    sources: [
      { title: `Domain Organic Report — ${domain}`, url: `https://${domain}` },
    ],
  };
}

function generalSeoReply(prompt: string, context: SuriContext): SuriReply {
  const domain =
    context.domain && context.domain !== "example.com" ? context.domain : null;
  return {
    answer: `### Suri · DataForSEO-backed guidance\n\nFor **${domain || "your project"}** regarding "${prompt.slice(0, 120)}":\n\n1. **Technical** — clean indexation, HTTPS, sitemap, Core Web Vitals.\n2. **Keywords** — ask me for quick wins or ranking opportunities (pulls live Labs data).\n3. **Content** — match search intent with clear H2s + FAQ blocks for AI Overviews.\n4. **Authority** — earn relevant links; avoid spammy PBNs.\n5. **Measurement** — connect GSC, then ask for a 28-day traffic trend.\n\nTip: Ask *“Find quick-win keywords I already rank for”* or *“Who are my top SERP competitors?”* for live data pulls.`,
    sources: defaultSources(context.domain),
  };
}

async function runDomainDataReply(
  promptLower: string,
  context: SuriContext,
): Promise<SuriReply | null> {
  if (!hasReadyProjectDomain(context.domain)) return null;
  if (!isDataForSeoConfigured()) {
    return {
      answer:
        "DataForSEO is not configured. Add `DATAFORSEO_API_KEY` to `.env.local` (and Vercel) so Suri can pull live Labs data.",
      sources: defaultSources(context.domain),
    };
  }

  try {
    const overview = await getDomainOverviewLight(context.domain);
    const mode = wantsKeywordData(promptLower) ? "keywords" : "overview";
    return formatDomainOverviewReply(context.domain, overview, mode);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown error";
    return {
      answer: `I could not reach DataForSEO Labs for **${context.domain}**: ${detail}\n\nCheck your API key and try again.`,
      sources: defaultSources(context.domain),
    };
  }
}

export async function runSuriAgentReply(
  prompt: string,
  _history: Array<{ role: "user" | "assistant"; content: string }>,
  context: SuriContext,
): Promise<SuriReply> {
  if (context.fileAnalysis?.report) {
    return runFileAnalysisReply(prompt, context);
  }

  const instant = tryInstantReply(prompt, context);
  if (instant) return instant;

  const promptLower = prompt.toLowerCase();

  if (wantsLiveSerpSearch(promptLower)) {
    if (!hasReadyProjectDomain(context.domain)) {
      return missingProjectDomainReply();
    }
    try {
      return await runSerpCompetitorSearch(context.domain);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown error";
      return {
        answer: `I tried a live SERP search for **${context.domain}** but Firecrawl returned an error: ${detail}\n\nConfirm \`FIRECRAWL_API_KEY\` in \`.env.local\`, then ask again.`,
        sources: [{ title: context.domain, url: `https://${context.domain}` }],
      };
    }
  }

  if (
    wantsGsc(promptLower) &&
    context.gscProject?.gscConnected &&
    context.gscProject.gscSiteUrl &&
    context.gscProject.gscRefreshToken
  ) {
    try {
      const tokenResult = await getValidGscAccessToken(context.gscProject);
      const accessToken =
        typeof tokenResult === "string" ? tokenResult : tokenResult.accessToken;
      const rows = await queryGscAnalytics(
        accessToken,
        context.gscProject.gscSiteUrl,
        "query",
        28,
        20,
      );

      const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
      const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
      const avgCtr =
        totalImpressions > 0
          ? ((totalClicks / totalImpressions) * 100).toFixed(2)
          : "0";
      const top3Queries = rows
        .slice(0, 5)
        .map(
          (r, i) =>
            `${i + 1}. **"${r.key}"** (${r.clicks.toLocaleString()} clicks, ${r.impressions.toLocaleString()} impressions, Pos #${r.position.toFixed(1)})`,
        )
        .join("\n");

      return {
        answer: `Here is the current 28-day Google Search Console performance for **${context.gscProject.gscSiteUrl}**:\n\n- **Total Organic Clicks**: ${totalClicks.toLocaleString()}\n- **Total Impressions**: ${totalImpressions.toLocaleString()}\n- **Average CTR**: ${avgCtr}%\n\n### Top Performing Queries:\n${top3Queries}\n\n**Recommendation**: Optimize titles/metas for high-impression, low-CTR (<2%) queries for a fast click lift.`,
        sources: [
          {
            title: `Google Search Console — ${context.gscProject.gscSiteUrl}`,
            url: `https://search.google.com/search-console`,
          },
        ],
      };
    } catch {
      // Fall through to Labs / general
    }
  }

  if (
    wantsKeywordData(promptLower) ||
    wantsDomainOverview(promptLower) ||
    promptLower.includes("what should i") ||
    promptLower.includes("focus on")
  ) {
    const domainReply = await runDomainDataReply(promptLower, context);
    if (domainReply) return domainReply;
  }

  // Fast local guidance — never call DataForSEO ChatGPT / LLM scrapers
  return generalSeoReply(prompt, context);
}

export async function* streamSuriAgentReply(
  prompt: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  context: SuriContext,
): AsyncGenerator<SuriStreamEvent> {
  // Instant paths stream immediately
  if (!context.fileAnalysis?.report) {
    const instant = tryInstantReply(prompt, context);
    if (instant) {
      yield* streamReply(instant);
      return;
    }
  }

  // Status line while DataForSEO / tools run
  const promptLower = prompt.toLowerCase();
  const waitingOnData =
    wantsLiveSerpSearch(promptLower) ||
    wantsKeywordData(promptLower) ||
    wantsDomainOverview(promptLower) ||
    (wantsGsc(promptLower) && Boolean(context.gscProject?.gscConnected)) ||
    Boolean(context.fileAnalysis?.report);

  if (waitingOnData) {
    yield {
      type: "token",
      text: context.fileAnalysis?.report
        ? "Reading your files…\n\n"
        : wantsLiveSerpSearch(promptLower)
          ? "Pulling live SERP data…\n\n"
          : "Fetching live DataForSEO Labs data…\n\n",
    };
  }

  const reply = await runSuriAgentReply(prompt, history, context);

  // If we already showed a status prefix, stream only the final answer body
  yield* streamReply(reply);
}

function runFileAnalysisReply(prompt: string, context: SuriContext): SuriReply {
  const localReport = context.fileAnalysis?.report || "";
  const sources = [
    {
      title: "Uploaded files — Suri extraction",
      url:
        context.domain && context.domain !== "example.com"
          ? `https://${context.domain}`
          : "https://developers.google.com/search",
    },
  ];

  return {
    answer: `${localReport}\n\n---\n\n### Suri's recommendations\n\nBased on your upload and request (“${prompt.slice(0, 100)}”):\n\n1. Fix the issues listed above first — titles, meta descriptions, image weight, and thin copy move rankings fastest.\n2. Rename files with descriptive hyphenated slugs and add specific alt text before publishing.\n3. If this is a content draft, add H2s that match search intent and a short FAQ block for AI Overviews.\n4. Ask me for **quick-win keywords** on your project domain (DataForSEO Labs) to align this file with live demand.\n5. Re-upload after edits if you want Suri to re-check the same files.`,
    sources,
  };
}
