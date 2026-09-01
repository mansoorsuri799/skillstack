import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-session";
import { isDataForSeoConfigured } from "@/lib/dataforseo/client";
import { exploreBrandMentions } from "@/lib/dataforseo/services";
import { getProjectForUser } from "@/lib/dashboard/project";
import {
  aiToolLimitJson,
  AiToolLimitError,
  assertAiToolAvailable,
  getAiToolUsage,
  incrementAiToolUsage,
} from "@/lib/dashboard/ai-tool-limits";
import { isFirecrawlConfigured } from "@/lib/firecrawl/search";
import { FIRST_PAGE_SIZE, isSameSite, searchLiveSerp } from "@/lib/firecrawl/live-serp";

type BrandCitation = { title: string; url: string };

function uniqueCitations(rows: BrandCitation[]): BrandCitation[] {
  const seen = new Set<string>();
  const out: BrandCitation[] = [];
  for (const row of rows) {
    const key = row.url.replace(/\/$/, "").toLowerCase();
    if (!row.url || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out.slice(0, 12);
}

export async function GET(request: Request) {
  const result = await requireUser(request);
  if ("response" in result) return result.response;

  try {
    const usage = await getAiToolUsage(result.user.id, "brandLookup");
    return NextResponse.json({ usage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load usage";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFirecrawlConfigured() && !isDataForSeoConfigured()) {
    return NextResponse.json(
      {
        message:
          "Add FIRECRAWL_API_KEY (or DATAFORSEO_API_KEY) to .env.local to look up a brand.",
      },
      { status: 503 },
    );
  }

  const result = await requireUser(request);
  if ("response" in result) return result.response;
  const { user } = result;

  try {
    await assertAiToolAvailable(user.id, "brandLookup");

    const project = await getProjectForUser(user.id);
    const body = await request.json();
    const brand = String(body.brand ?? "").trim();
    if (!brand) {
      return NextResponse.json({ message: "Enter a brand name." }, { status: 400 });
    }

    const live = isFirecrawlConfigured()
      ? await searchLiveSerp(brand, {
          locationCode: project.locationCode,
          mode: "brand",
          limit: FIRST_PAGE_SIZE,
          excludeDomain: project.domain,
        }).catch(() => null)
      : null;

    const llm = isDataForSeoConfigured()
      ? await exploreBrandMentions(brand, project.domain).catch(() => null)
      : null;

    const liveCitations =
      live?.listings.map((row) => ({
        title: row.title || row.host,
        url: row.url,
      })) ?? [];
    const llmCitations = llm?.citations ?? [];
    const citations = uniqueCitations([...liveCitations, ...llmCitations]);

    const domainMentioned = Boolean(
      (live?.listings.some((row) => row.isYours || isSameSite(row.host, project.domain)) ?? false) ||
        llm?.domainMentioned,
    );

    const liveAnswer = live?.listings.length
      ? [
          `Live Google first page · ${live.location}`,
          `Query: ${brand}`,
          "",
          ...live.listings.map((row) => {
            const you = row.isYours ? " · your site" : "";
            return `#${row.position}  ${row.host}${you}\n${row.title}\n${row.url}`;
          }),
        ].join("\n")
      : "";

    const lookup = {
      brand,
      answer: llm?.answer || liveAnswer || "No live results returned for this brand.",
      citations,
      domainMentioned,
      mentionCount: citations.length,
      liveSearch: Boolean(live?.listings.length),
    };

    const usage = await incrementAiToolUsage(user.id, "brandLookup");
    return NextResponse.json({ result: lookup, usage });
  } catch (error) {
    if (error instanceof AiToolLimitError) {
      return NextResponse.json(aiToolLimitJson(error), { status: 402 });
    }
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
