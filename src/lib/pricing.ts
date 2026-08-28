export type PlanId = "pro" | "keywords" | "growth" | "fullstack";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceUsd: number;
  /** Optional fixed PKR price; otherwise derived from USD × rate */
  pricePkr?: number;
  featured?: boolean;
  /** Matches contact form topic where useful */
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

/** Fallback USD→PKR when env rate is unset (approx.; set PAYFAST_USD_TO_PKR in prod). */
export const DEFAULT_USD_TO_PKR = 280;

export function usdToPkrRate() {
  const raw =
    process.env.PAYFAST_USD_TO_PKR ||
    process.env.NEXT_PUBLIC_PAYFAST_USD_TO_PKR ||
    String(DEFAULT_USD_TO_PKR);
  const rate = Number(raw);
  return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_USD_TO_PKR;
}

/** PKR amount for PayFast (JazzCash / Easypaisa / local cards). */
export function planPricePkr(plan: Plan) {
  if (typeof plan.pricePkr === "number" && plan.pricePkr > 0) {
    return Math.round(plan.pricePkr);
  }
  return Math.round(plan.priceUsd * usdToPkrRate());
}
