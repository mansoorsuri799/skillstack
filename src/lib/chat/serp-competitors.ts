import { isFirecrawlConfigured } from "@/lib/firecrawl/search";
import { liveSerpForDomain } from "@/lib/firecrawl/live-serp";
import { normalizeProjectDomain } from "@/lib/chat/project-domain";

export function wantsLiveSerpSearch(prompt: string): boolean {
  const text = prompt.toLowerCase();
  return (
    text.includes("competitor") ||
    text.includes("serp") ||
    text.includes("who ranks") ||
    text.includes("ranking against") ||
    text.includes("who are my top")
  );
}

export async function runSerpCompetitorSearch(domainInput: string): Promise<{
  answer: string;
  sources: Array<{ title: string; url: string }>;
}> {
  const domain = normalizeProjectDomain(domainInput);
  if (!isFirecrawlConfigured()) {
    return {
      answer: `I can run a live Pakistan SERP search for **${domain}**, but Firecrawl is not configured yet.\n\nAdd \`FIRECRAWL_API_KEY\` to \`.env.local\`, restart the app, then ask again.`,
      sources: [{ title: "Firecrawl search docs", url: "https://docs.firecrawl.dev" }],
    };
  }

  const siteUrl = `https://${domain}`;
  const live = await liveSerpForDomain(domain, {
    location: "Pakistan",
    country: "PK",
  });

  const listings = live.listings;
  const yours = listings.find((row) => row.isYours);
  const siteLine = live.pageTitle
    ? `Checked ${domain} · ${live.pageTitle}`
    : `Checked ${domain}`;

  const rows = listings.length
    ? listings
        .map((row) => {
          const you = row.isYours ? " · your site" : "";
          const snippet =
            row.description && row.description !== row.title ? `\n   ${row.description}` : "";
          return `#${row.position}  ${row.host}${you}\n   ${row.title}${snippet}\n   ${row.url}`;
        })
        .join("\n\n")
    : "No first-page Pakistan results matched this keyword.";

  const yoursLine = yours
    ? `Your site is on page 1 at **#${yours.position}**.`
    : "Your site is not on page 1 for this keyword.";

  return {
    answer: [
      `**Google first page · Pakistan**`,
      `Keyword: **${live.keyword}**\n${siteLine}`,
      `**Results**\n${rows}`,
      yoursLine,
    ].join("\n\n"),
    sources: [
      { title: `${live.keyword} · Pakistan SERP`, url: siteUrl },
      ...listings.slice(0, 8).map((row) => ({ title: `#${row.position} ${row.host}`, url: row.url })),
    ],
  };
}
