export type ProductFeature = {
  slug: string;
  title: string;
  shortTitle: string;
  group: string;
  summary: string;
  description: string;
  dashboardHref: string;
  /** Matching agency service page when intent overlaps (e.g. tool vs done-for-you). */
  relatedServiceSlug?: string;
  relatedServiceLabel?: string;
  highlights: string[];
  outcomes: string[];
  keywords: string[];
};

export const productFeatures: ProductFeature[] = [
  {
    slug: "keyword-research-tool",
    title: "Keyword Research Tool",
    shortTitle: "Keywords",
    group: "Research",
    summary:
      "Self-serve keyword research in the SkillStack dashboard — volume, difficulty, intent, and SERP context you run yourself.",
    description:
      "The SkillStack Keyword Research Tool is a product feature, not a done-for-you service. Sign in, enter a seed keyword, review volume and competition signals, inspect SERP context, and save winners to your project. Prefer a team to research and deliver the list for you? Use our keyword research service instead.",
    dashboardHref: "/dashboard/keyword-research-tool",
    relatedServiceSlug: "keyword-research",
    relatedServiceLabel: "Keyword research service",
    highlights: [
      "Seed-based keyword ideas with volume and competition signals",
      "Intent labels and market-aware research options",
      "SERP snapshot so you see what already ranks",
      "Save keywords into your SkillStack project",
    ],
    outcomes: [
      "Build topic clusters faster on your own schedule",
      "Prioritize keywords you can actually win",
      "Align content with real search demand",
    ],
    keywords: [
      "keyword research tool",
      "SEO keyword research software",
      "keyword finder dashboard",
      "SkillStack keyword research tool",
    ],
  },
  {
    slug: "domain-overview-tool",
    title: "Domain Overview Tool",
    shortTitle: "Domain",
    group: "Research",
    summary:
      "See organic traffic estimates, keyword footprint, backlink strength, and top traffic keywords for any domain.",
    description:
      "The Domain Overview Tool gives you an Ahrefs-style snapshot of a site’s SEO profile: estimated organic traffic, ranking keywords by country, referring domains, and the keywords driving the most visits.",
    dashboardHref: "/dashboard/domain-overview-tool",
    highlights: [
      "Organic traffic and traffic value estimates",
      "Keywords by country with flags and traffic",
      "Domain rating and referring domain metrics",
      "Top keywords sorted by estimated traffic",
      "All locations mode for multi-market totals",
    ],
    outcomes: [
      "Benchmark competitors quickly",
      "Spot which markets and keywords matter most",
      "Brief clients with a clear domain snapshot",
    ],
    keywords: [
      "domain overview tool",
      "website traffic estimator",
      "domain SEO checker",
      "SkillStack domain overview tool",
    ],
  },
  {
    slug: "backlink-checker",
    title: "Backlink Checker",
    shortTitle: "Backlinks",
    group: "Research",
    summary:
      "Analyze any domain’s link profile in the dashboard — growth, referring domains, and top linked pages.",
    description:
      "The SkillStack Backlink Checker is a research tool for inspecting link profiles yourself. Review overview metrics, backlink rows, referring domains, and top linked pages to judge authority. Need SkillStack to build high-authority placements for you? That is our backlinking service.",
    dashboardHref: "/dashboard/backlink-checker",
    relatedServiceSlug: "backlinking",
    relatedServiceLabel: "Backlinking service",
    highlights: [
      "Backlink and referring domain overview",
      "Growth and new/lost link signals",
      "Referring domain and top page tables",
      "Scope controls for domain vs subdomains",
    ],
    outcomes: [
      "Audit link strength before outreach",
      "Find pages that already attract links",
      "Compare authority between domains",
    ],
    keywords: [
      "backlink checker tool",
      "referring domains analyzer",
      "link profile dashboard",
      "SkillStack backlink checker",
    ],
  },
  {
    slug: "brand-lookup-tool",
    title: "Brand Lookup Tool",
    shortTitle: "Brand",
    group: "Research",
    summary:
      "Look up brand presence and related signals to understand how a name shows up online.",
    description:
      "The Brand Lookup Tool helps you explore how a brand appears across search-related signals so you can plan content, reputation, and competitive positioning with clearer context.",
    dashboardHref: "/dashboard/brand-lookup-tool",
    highlights: [
      "Fast brand-focused lookup workflow",
      "Useful for competitive and reputation checks",
      "Works alongside domain and keyword research",
    ],
    outcomes: [
      "Understand brand search footprint",
      "Support content and PR planning",
    ],
    keywords: [
      "brand lookup tool",
      "brand search analysis",
      "SkillStack brand lookup tool",
    ],
  },
  {
    slug: "organic-keyword-checker",
    title: "Organic Keyword Checker",
    shortTitle: "Organic keywords",
    group: "Organic search",
    summary:
      "See the keywords a domain ranks for — positions, volume, and landing pages.",
    description:
      "The Organic Keyword Checker lists ranking terms for a target domain so you can find content that already works, gaps to fill, and pages that deserve more internal support.",
    dashboardHref: "/dashboard/organic-keyword-checker",
    highlights: [
      "Ranked keyword table with positions",
      "Volume and traffic-oriented sorting",
      "Landing page URLs for each ranking",
    ],
    outcomes: [
      "Mine competitor keyword lists",
      "Protect pages already ranking",
      "Find easy content expansion ideas",
    ],
    keywords: [
      "organic keyword checker",
      "ranked keywords tool",
      "SkillStack organic keyword checker",
    ],
  },
  {
    slug: "organic-position-tracker",
    title: "Organic Position Tracker",
    shortTitle: "Positions",
    group: "Organic search",
    summary:
      "Break down ranking distribution — top spots, page-two clusters, and movement signals.",
    description:
      "The Organic Position Tracker shows how a domain’s rankings are spread across SERP buckets so you can see concentration in positions 1–3, 4–10, and beyond.",
    dashboardHref: "/dashboard/organic-position-tracker",
    highlights: [
      "Position bucket breakdown",
      "Traffic and keyword totals in one view",
      "Useful for tracking visibility health",
    ],
    outcomes: [
      "Spot over-reliance on low positions",
      "Prioritize pages close to page one",
    ],
    keywords: [
      "organic position tracker",
      "SERP position distribution tool",
      "SkillStack organic positions",
    ],
  },
  {
    slug: "top-pages-finder",
    title: "Top Pages Finder",
    shortTitle: "Top pages",
    group: "Organic search",
    summary:
      "Find which URLs pull the most organic traffic and ranking keywords.",
    description:
      "The Top Pages Finder ranks a domain’s strongest organic URLs by estimated traffic and keyword count — ideal for content refreshes and internal linking priorities.",
    dashboardHref: "/dashboard/top-pages-finder",
    highlights: [
      "Pages sorted by estimated organic traffic",
      "Keyword counts per URL",
      "Clear targets for optimization",
    ],
    outcomes: [
      "Refresh pages that already earn traffic",
      "Build internal links toward winners",
    ],
    keywords: [
      "top pages finder",
      "best ranking pages tool",
      "SkillStack top pages finder",
    ],
  },
  {
    slug: "organic-competitor-finder",
    title: "Organic Competitor Finder",
    shortTitle: "Competitors",
    group: "Organic search",
    summary:
      "Discover domains competing in the same organic landscape.",
    description:
      "The Organic Competitor Finder surfaces sites overlapping your keyword space so you can study their pages, content angles, and link profiles with clearer targets.",
    dashboardHref: "/dashboard/organic-competitor-finder",
    highlights: [
      "Competitor domain discovery",
      "Overlap-focused competitive view",
      "Pairs with content gap analysis",
    ],
    outcomes: [
      "Build a realistic competitor shortlist",
      "Focus research on sites you actually fight",
    ],
    keywords: [
      "organic competitor finder",
      "SEO competitor finder tool",
      "SkillStack competitor finder",
    ],
  },
  {
    slug: "content-gap-finder",
    title: "Content Gap Finder",
    shortTitle: "Content gap",
    group: "Competitive analysis",
    summary:
      "Find keywords competitors rank for that you do not — then plan content to close the gap.",
    description:
      "The Content Gap Finder compares domains to highlight missing keyword opportunities so your content roadmap targets proven demand instead of guesswork.",
    dashboardHref: "/dashboard/content-gap-finder",
    highlights: [
      "Competitor vs your domain keyword gaps",
      "Opportunity-oriented research workflow",
      "Supports editorial planning",
    ],
    outcomes: [
      "Fill missing topics competitors already own",
      "Reduce wasted content ideas",
    ],
    keywords: [
      "content gap finder",
      "keyword gap analysis tool",
      "SkillStack content gap finder",
    ],
  },
  {
    slug: "best-by-links-finder",
    title: "Best by Links Finder",
    shortTitle: "Best by links",
    group: "Pages",
    summary:
      "See which pages attract the strongest link attention on a domain.",
    description:
      "The Best by Links Finder highlights pages that earn referring domains and backlinks — useful for outreach templates, content formats that attract links, and internal promotion.",
    dashboardHref: "/dashboard/best-by-links-finder",
    highlights: [
      "Pages ranked by link strength",
      "Useful for digital PR research",
      "Pairs with the Backlink Checker",
    ],
    outcomes: [
      "Clone formats that earn links",
      "Promote linkable assets harder",
    ],
    keywords: [
      "best by links finder",
      "most linked pages tool",
      "SkillStack best by links",
    ],
  },
  {
    slug: "internal-link-checker",
    title: "Internal Link Checker",
    shortTitle: "Internal links",
    group: "Internal links",
    summary:
      "Map how pages connect inside a site — structure, anchors, and most-linked URLs.",
    description:
      "The Internal Link Checker helps you understand crawl paths and authority flow: overview links, most-linked pages, and internal anchor text so you can strengthen important URLs.",
    dashboardHref: "/dashboard/internal-link-checker",
    highlights: [
      "Internal link overview",
      "Most linked pages",
      "Internal anchor analysis",
    ],
    outcomes: [
      "Improve crawlability and topical clusters",
      "Push equity toward money pages",
    ],
    keywords: [
      "internal link checker",
      "internal linking analysis tool",
      "SkillStack internal links",
    ],
  },
  {
    slug: "gsc-insights-tool",
    title: "GSC Insights Tool",
    shortTitle: "GSC",
    group: "My Site",
    summary:
      "Connect Google Search Console and review clicks, queries, and performance inside SkillStack.",
    description:
      "The GSC Insights Tool pulls Search Console data into your dashboard so real clicks and impressions sit next to keyword research and rank tracking — not in a separate tab forever.",
    dashboardHref: "/dashboard/gsc-insights-tool",
    highlights: [
      "Google Search Console connection",
      "Query and performance insights",
      "Complements estimated Labs traffic",
    ],
    outcomes: [
      "Validate estimates with real clicks",
      "Find queries already earning impressions",
    ],
    keywords: [
      "GSC insights tool",
      "Google Search Console dashboard",
      "SkillStack GSC insights",
    ],
  },
  {
    slug: "rank-tracker",
    title: "Rank Tracker",
    shortTitle: "Ranks",
    group: "My Site",
    summary:
      "Track keyword positions over time for the markets and domains you care about.",
    description:
      "The Rank Tracker monitors the keywords you choose so you can see movement, protect wins, and report progress without rebuilding spreadsheets every week.",
    dashboardHref: "/dashboard/rank-tracker",
    highlights: [
      "Keyword lists tied to your project",
      "Refresh and discover workflows",
      "Built for ongoing SEO reporting",
    ],
    outcomes: [
      "Catch ranking drops earlier",
      "Report progress with clearer charts",
    ],
    keywords: [
      "rank tracker tool",
      "keyword position tracker",
      "SkillStack rank tracker",
    ],
  },
  {
    slug: "saved-keywords-manager",
    title: "Saved Keywords Manager",
    shortTitle: "Saved",
    group: "My Site",
    summary:
      "Keep a living list of keywords you want to target, track, or brief to writers.",
    description:
      "The Saved Keywords Manager stores research wins in one place so keyword research, content planning, and rank tracking stay connected inside SkillStack.",
    dashboardHref: "/dashboard/saved-keywords-manager",
    highlights: [
      "Save keywords from research",
      "Project-scoped keyword lists",
      "Bridge between research and execution",
    ],
    outcomes: [
      "Stop losing good keywords in notes",
      "Hand cleaner briefs to your team",
    ],
    keywords: [
      "saved keywords manager",
      "SEO keyword list tool",
      "SkillStack saved keywords",
    ],
  },
  {
    slug: "site-audit-tool",
    title: "Site Audit Tool",
    shortTitle: "Audit",
    group: "My Site",
    summary:
      "Self-serve technical SEO checks in the dashboard — crawl signals, schema, performance, and fix priorities.",
    description:
      "The SkillStack Site Audit Tool helps you scan for technical issues yourself: crawl directives, structured data, performance signals, and prioritized findings. Want SkillStack to audit and implement fixes as a service? See Technical SEO & site audits.",
    dashboardHref: "/dashboard/site-audit-tool",
    relatedServiceSlug: "technical-seo",
    relatedServiceLabel: "Technical SEO & site audits",
    highlights: [
      "Technical SEO diagnostics",
      "Schema and crawler-related checks",
      "Prioritized issues for fixes",
    ],
    outcomes: [
      "Catch indexing blockers early",
      "Improve technical readiness for growth",
    ],
    keywords: [
      "SEO site audit tool",
      "technical SEO checker software",
      "website audit dashboard",
      "SkillStack site audit tool",
    ],
  },
];

export function getFeatureBySlug(slug: string) {
  return productFeatures.find((feature) => feature.slug === slug) ?? null;
}

export function getFeatureSlugs() {
  return productFeatures.map((feature) => feature.slug);
}

export function featuresByGroup() {
  const map = new Map<string, ProductFeature[]>();
  for (const feature of productFeatures) {
    const list = map.get(feature.group) ?? [];
    list.push(feature);
    map.set(feature.group, list);
  }
  return [...map.entries()].map(([group, items]) => ({ group, items }));
}
