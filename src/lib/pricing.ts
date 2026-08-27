export type PlanId = "keywords" | "growth" | "fullstack";

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

/** One-time packages — USD list prices; PKR charged via PayFast */
export const plans: Plan[] = [
  {
    id: "keywords",
    name: "Keyword Package",
    topic: "Keyword package",
    tagline: "Know what to rank for before you spend on content or a build.",
    priceUsd: 299,
    features: [
      "Multi-tool keyword research (Ahrefs, Semrush, Moz, Keyword Planner)",
      "Primary + supporting terms with intent & difficulty notes",
      "Competitor keyword overlap snapshot",
      "Content / page brief for 1 pillar topic",
      "Deliverable list ready for writers or your team",
      "Email support for 14 days",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    topic: "SEO & ranking",
    tagline:
      "Website build plus SEO content and ranking setup — ship ready to climb.",
    priceUsd: 1299,
    featured: true,
    features: [
      "WordPress or Next.js website foundation",
      "Keyword research package (primary + supporting cluster)",
      "On-page & semantic SEO for key pages",
      "SEO content cluster (up to 5 ranking articles)",
      "Technical SEO + Core Web Vitals–minded setup",
      "Search Console & analytics handoff",
      "30 days of revision support",
    ],
  },
  {
    id: "fullstack",
    name: "Full Stack",
    topic: "Full stack project",
    tagline: "Keywords → website → content → backlinks → monetization.",
    priceUsd: 2499,
    features: [
      "Everything in Growth",
      "Extended SEO content calendar (up to 12 pieces)",
      "Backlink / authority campaign with quality checks",
      "AdSense / Adsterra layout & policy guidance",
      "Bi-weekly rank reporting (60 days)",
      "Priority roadmap call with SkillStack",
    ],
  },
];

export function getPlan(id: string): Plan | undefined {
  return plans.find((p) => p.id === id);
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
