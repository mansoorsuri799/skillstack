export type PlanId = "pro" | "keywords" | "growth" | "fullstack";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceUsd: number;
  featured?: boolean;
  topic: string;
  features: string[];
};

/** One package: Complete access to all SEO tools and Dashboard features for $20 USD */
export const plans: Plan[] = [
  {
    id: "pro",
    name: "SkillStack Pro Suite",
    topic: "SkillStack Pro",
    tagline:
      "All-in-one SEO command center — complete dashboard tools, AI research, and automated tracking.",
    priceUsd: 20,
    featured: true,
    features: [
      "Keyword Research with Search Trends, volume, CPC, difficulty & SERP analysis",
      "Domain Overview with SEO Health Score, organic traffic & top ranking pages",
      "Backlinks Dashboard with growth history, new vs. lost charts & referring domains",
      "Rank Tracking suite with position monitoring across Desktop & Mobile devices",
      "Comprehensive Site Audit crawler with technical SEO issues & security grading",
      "Organic Search Intelligence (ranking positions, top pages & competitor research)",
      "Competitive Content Gap analysis to find missing keyword opportunities",
      "Internal Links & Anchors Analyzer (most-linked pages & anchor distribution)",
      "Google Search Console (GSC) direct integration for live search analytics",
      "AI Prompt Explorer & Brand Authority Lookup intelligence tools",
      "AI Agent & MCP integration for Claude, Cursor, and Codex workflows",
      "Multi-project workspace with project switching, renaming & management",
    ],
  },
];

export function getPlan(id: string): Plan | undefined {
  const match = plans.find((p) => p.id === id);
  if (match) return match;
  // Fallback to primary plan if old plan IDs are referenced
  if (id === "keywords" || id === "growth" || id === "fullstack" || id === "pro") {
    return plans[0];
  }
  return plans[0];
}
