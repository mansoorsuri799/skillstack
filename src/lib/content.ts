export {
  services,
  teamCollaborationNote,
  getServiceBySlug,
  getServiceSlugs,
  type Service,
  type ServiceSection,
} from "@/lib/services";

export const processSteps = [
  {
    n: "01",
    title: "Find the keyword",
    summary:
      "Demand, competition, and monetization fit — terms worth ranking for.",
    details: [
      "Kickoff call to clarify niche, geography, and revenue model (ads, leads, or product).",
      "Research pass across seed terms, competitors, and related questions people ask.",
      "Shortlist scored by intent, difficulty, and earning potential.",
      "You approve the target set before any build or content spend begins.",
    ],
  },
  {
    n: "02",
    title: "Build the site",
    summary:
      "Clean architecture, fast pages, on-page SEO from day one.",
    details: [
      "Wireframes and URL map designed around the approved keywords.",
      "Development on WordPress or Next.js with performance budgets in mind.",
      "On-page foundations: meta, headings, internals, images, and indexability checks.",
      "Staging review with you, then launch checklist (Search Console, analytics, sitemap).",
    ],
  },
  {
    n: "03",
    title: "Rank on Google",
    summary:
      "Content, technical fixes, and authority aligned with current guidance.",
    details: [
      "Content calendar executed against the topical map.",
      "Technical hygiene: crawl errors, speed regressions, and index coverage.",
      "Authority building through careful links and brand mentions where it helps.",
      "Monthly or bi-weekly reporting so progress is visible — not mysterious.",
    ],
  },
  {
    n: "04",
    title: "Earn from traffic",
    summary: "Ad placements structured for sustainable yield.",
    details: [
      "Monetization layout that respects reader experience and program policies.",
      "Fine-tuning of placement density after real traffic patterns appear.",
      "Optional support for AdSense, Adsterra, or similar networks.",
      "Handoff playbook so your team can maintain and grow revenue.",
    ],
  },
];

export const aboutHighlights = [
  {
    title: "Mission",
    body: "Help businesses and publishers turn keywords into durable traffic — and traffic into clear outcomes — without gambling their domains on shortcuts.",
  },
  {
    title: "What we believe",
    body: "Rank honestly. Document what works. Transfer knowledge so clients and teammates become independent, not locked into mystery retainer work.",
  },
  {
    title: "How we stay sharp",
    body: "Our team researches and follows Google’s evolving policies and Search updates because our products — and our clients’ income — sit on search.",
  },
  {
    title: "Where we work",
    body: "SkillStack Private Limited is rooted in Pakistan and delivers for national and international clients — from first domain to ranking strategy.",
  },
];
