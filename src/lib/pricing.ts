export type PlanId = "starter" | "growth" | "dominate";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  priceUsd: number;
  featured?: boolean;
  features: string[];
};

/** One-time packages — amounts in USD cents for Stripe */
export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Validate a niche before you build big.",
    priceUsd: 299,
    features: [
      "Keyword research package (primary + supporting terms)",
      "Competitor & intent snapshot",
      "Content / page brief for 1 pillar topic",
      "Email support for 14 days",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    tagline: "Ship a ranking-ready site with content backbone.",
    priceUsd: 899,
    featured: true,
    features: [
      "Everything in Starter",
      "WordPress or Next.js website foundation",
      "On-page SEO setup + Core Web Vitals pass",
      "SEO content cluster (up to 5 articles)",
      "Search Console & analytics handoff",
      "30 days of revision support",
    ],
  },
  {
    id: "dominate",
    name: "Dominate",
    tagline: "Full stack — keyword to traffic to monetization.",
    priceUsd: 2499,
    features: [
      "Everything in Growth",
      "Extended content calendar (up to 12 pieces)",
      "Backlink / authority starter campaign",
      "AdSense / Adsterra layout & policy guidance",
      "Bi-weekly rank reporting (60 days)",
      "Priority roadmap call with SkillStack",
    ],
  },
];

export function getPlan(id: string): Plan | undefined {
  return plans.find((p) => p.id === id);
}
