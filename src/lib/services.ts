export type ServiceSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type Service = {
  n: string;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  details: string[];
  guide: {
    intro: string;
    sections: ServiceSection[];
    closing: string;
  };
};

export const services: Service[] = [
  {
    n: "01",
    slug: "keyword-research",
    title: "Keyword research",
    shortTitle: "Keyword research",
    summary:
      "Low-competition, high-volume keywords from any country — researched with Ahrefs, Semrush, Moz, Google Keyword Planner, and more.",
    details: [
      "Multi-tool research across Ahrefs, Semrush, Moz, and Google Keyword Planner.",
      "Country- and language-specific opportunities worldwide — not just global averages.",
      "Parent keywords grouped with supporting terms planned as separate articles.",
      "Intent, difficulty, and monetization fit scored before you spend on content or build.",
    ],
    guide: {
      intro:
        "Keyword research is where every SkillStack engagement starts. We do not chase vanity phrases. We find terms people actually search, that you can realistically rank for, and that fit how you plan to earn — ads, leads, or product. Our researchers cross-check multiple professional tools so one platform’s blind spot does not decide your roadmap.",
      sections: [
        {
          title: "The tools we use — and why each matters",
          body: "No single tool owns the truth of search. We combine platforms so volume, difficulty, SERP features, and competitor gaps reinforce each other.",
          bullets: [
            "Ahrefs — keyword difficulty, traffic potential, click metrics, content gap analysis, and backlink context around ranking pages.",
            "Semrush — broad keyword databases, topic research, position tracking, and competitive keyword overlap across markets.",
            "Moz — Domain Authority signals, keyword suggestions, and a second difficulty lens when Ahrefs and Semrush disagree.",
            "Google Keyword Planner — Google’s own volume ranges and bid data, especially useful for commercial intent and ad-supported niches.",
            "Supporting checks — Google Trends, Search Console (on live sites), autocomplete, and People Also Ask to catch real language people type.",
          ],
        },
        {
          title: "Low competition, high search volume — worldwide",
          body: "We filter for keywords where demand is real and competition is manageable. That includes targeting a specific country or language (Pakistan, UAE, US, UK, and beyond), not only “worldwide” averages that hide local opportunities. Volume without a path to rank is noise; easy rankings without traffic waste months.",
          bullets: [
            "Geo-targeted lists for the countries you care about.",
            "Difficulty thresholds matched to your domain age and authority.",
            "Commercial and informational intent separated so pages have a job.",
            "Seasonality and trend checks so you do not build on dying queries.",
          ],
        },
        {
          title: "Keyword grouping and parent–child coverage",
          body: "A strong parent keyword rarely stands alone. High-volume related terms around that parent should each earn a properly written article — not a thin paragraph stuffed into one URL. We map clusters so the pillar page and supporting posts reinforce each other instead of cannibalizing rankings.",
          bullets: [
            "Parent (pillar) keyword with a clear primary landing page.",
            "Supporting keywords grouped by intent — each planned as its own article.",
            "Internal-link map so cluster pages pass relevance to the pillar.",
            "Cannibalization checks so two URLs never fight for the same primary term.",
          ],
        },
        {
          title: "What else we cover before you build",
          body: "Research is only useful if it becomes a plan your writers and developers can execute.",
          bullets: [
            "Competitor SERP review — who ranks, what format wins, and where gaps exist.",
            "Suggested page types (guide, comparison, local, tool, product) per keyword.",
            "Priority order so you publish high-ROI terms first.",
            "Handoff briefs your content and development teams can follow without guessing.",
          ],
        },
      ],
      closing:
        "You approve the keyword set before major content or build spend begins. That way every article and every page has a target worth ranking for.",
    },
  },
  {
    n: "02",
    slug: "seo-ranking",
    title: "SEO ranking",
    shortTitle: "SEO ranking",
    summary:
      "Fully optimized articles — semantic SEO, competitor analysis, and techniques built to outrank the pages already sitting above you.",
    details: [
      "SEO experts write point-perfect articles aimed at outranking competitors.",
      "Semantic SEO, entity coverage, and on-page structure baked into every draft.",
      "Competitor analysis before writing so we know what it takes to win the SERP.",
      "Refresh and expansion cycles so rankings hold after you hit page one.",
    ],
    guide: {
      intro:
        "Once keywords are approved, our SEO ranking team turns them into content that can win. We do not publish generic blogs. We write fully optimized, on-intent articles using semantic SEO and the techniques required to outrank the competitors already ranking for your terms.",
      sections: [
        {
          title: "Competitor analysis before the first draft",
          body: "We study the pages that already occupy the top results — depth, structure, media, E-E-A-T signals, and gaps they leave open. Your article is planned to match search intent better and cover what they miss.",
          bullets: [
            "Top-ranking URL teardown for structure, word count ranges, and topics covered.",
            "Gap list — questions, subtopics, and formats competitors ignore.",
            "SERP feature notes (featured snippets, FAQs, video) so we can compete for them.",
            "Differentiation angle so your page is not a copy of whatever ranks today.",
          ],
        },
        {
          title: "Fully optimized SEO articles",
          body: "Our SEO experts focus on writing that is clear for readers and precise for search engines — titles, headings, intros, and conclusions that map to the primary and supporting terms without stuffing.",
          bullets: [
            "Primary keyword placement that reads naturally in title, H1, and opening.",
            "Heading hierarchy that mirrors how people scan and how Google parses topics.",
            "Internal links to related cluster pages and your money pages.",
            "Meta titles and descriptions written for clicks, not just keywords.",
          ],
        },
        {
          title: "Semantic SEO and related techniques",
          body: "Modern ranking rewards topical completeness. We implement semantic SEO so entities, related questions, and supporting vocabulary are covered properly — helping Google understand that your page is the thorough answer.",
          bullets: [
            "Entity and topic coverage aligned with the keyword cluster.",
            "People Also Ask and related queries answered in clear sections.",
            "Natural language that satisfies intent without awkward keyword stuffing.",
            "Schema-ready structure (FAQ, HowTo, Article) when the page type calls for it.",
          ],
        },
        {
          title: "Built to outrank — then keep the position",
          body: "Publishing is step one. We write for the SERP you want to own, then support updates when competitors publish new pages or Search Console shows opportunity.",
          bullets: [
            "Drafts reviewed against the competitor brief before go-live.",
            "On-page checklist passed before the page is marked done.",
            "Refresh plans for aging posts that start to slip.",
            "Clear briefs so your team (or ours) can expand the cluster consistently.",
          ],
        },
      ],
      closing:
        "When articles are ready, they hand off cleanly to development and publishing — so the site you build already has content engineered to rank.",
    },
  },
  {
    n: "03",
    slug: "websites-from-scratch",
    title: "Websites from scratch",
    shortTitle: "Websites from scratch",
    summary:
      "Expert WordPress and Next.js developers — mobile UX, SEO/AEO/AIO/GEO, schema, and Core Web Vitals that score 100 on PageSpeed Insights.",
    details: [
      "WordPress designers and Next.js / React developers on the same playbook.",
      "Mobile-first UI/UX built to keep visitors reading and converting.",
      "SEO, AEO, AIO, GEO, AggregateRating, and other schema — ask and we implement.",
      "Core Web Vitals tuned for strong PageSpeed Insights scores, including 100 where the stack allows.",
    ],
    guide: {
      intro:
        "After keywords and SEO articles are ready, we build the site that carries them. SkillStack has expert WordPress developers and React / Next.js developers who design for mobile, craft UI/UX that feels premium, and implement the technical search foundations your content needs to perform.",
      sections: [
        {
          title: "WordPress experts — design, mobile, and UX",
          body: "Our WordPress developers design and optimize sites for real phones and real readers. Layouts, typography, and navigation are chosen to enhance user experience — not just to look fine on a desktop mockup.",
          bullets: [
            "Custom or carefully theme-based builds matched to your niche.",
            "Mobile and responsive polish so Core Web Vitals stay healthy on phones.",
            "UI/UX patterns that reduce bounce and make key actions obvious.",
            "Editor-friendly structures so your team can publish without breaking the design.",
          ],
        },
        {
          title: "React and Next.js developers",
          body: "For performance-critical or app-like products, our Next.js developers ship fast, crawlable interfaces with modern React patterns — ideal when you want control over SEO markup, routing, and hosting.",
          bullets: [
            "App Router architectures tuned for content sites and marketing sites.",
            "Image, font, and script discipline for LCP, INP, and CLS.",
            "Clean URL maps aligned with your keyword and content plan.",
            "Deployments on platforms like Vercel with analytics and Search Console ready.",
          ],
        },
        {
          title: "SEO, AEO, AIO, GEO — and schema that goes deep",
          body: "Our developers implement search and answer-engine foundations in the codebase, not as an afterthought. SEO, AEO (answer engines), AIO, and GEO-oriented structure are part of the build. Schema is flexible: AggregateRating, FAQ, HowTo, Organization, Article, LocalBusiness — and more. Tell us what you need; we meet the requirement so you leave satisfied.",
          bullets: [
            "Technical SEO: indexability, sitemaps, canonicals, robots, and clean HTML.",
            "Structured data for rich results and clearer entity signals.",
            "Answer- and AI-oriented page structure when your niche benefits from it.",
            "Custom requests welcome — if it is possible on the stack, we implement it.",
          ],
        },
        {
          title: "Core Web Vitals and PageSpeed Insights",
          body: "Speed is ranking and revenue. We tune pages so Core Web Vitals pass and PageSpeed Insights scores are pushed as high as the design allows — including aiming for 100 on key templates when assets and third parties cooperate.",
          bullets: [
            "LCP, INP, and CLS budgets during design and development.",
            "Compressed media, critical CSS discipline, and lean third-party scripts.",
            "Lab and field checks before handoff.",
            "Guidance on what ads or embeds may cost you in score — so you choose knowingly.",
          ],
        },
      ],
      closing:
        "You get a site built around approved keywords and SEO articles — ready for Search Console, ranking work, and growth.",
    },
  },
  {
    n: "04",
    slug: "backlinking",
    title: "Backlinking",
    shortTitle: "Backlinking",
    summary:
      "After Search Console insights land, our link experts build high-authority backlinks that lift rankings, DA, and DR — without spam.",
    details: [
      "Timed after early Search Console analysis — not random blasts on day one.",
      "Foundational → Web 2.0 → forums → podcasts → NANDLA → cloud stacks.",
      "Spam-score and Ahrefs health checked before links are counted as done.",
      "Authority work aimed at rankings plus measurable DA / DR growth.",
    ],
    guide: {
      intro:
        "After a few weeks of signals from Google Search Console — impressions, queries, and index behavior — our backlinking service steps in. Link building too early wastes budget; link building with junk domains risks the site. Our backlinking experts create high-authority links that help pages climb and strengthen Domain Authority (DA) and Domain Rating (DR).",
      sections: [
        {
          title: "Why we wait on Search Console first",
          body: "Early GSC data shows which pages and queries deserve authority first. We prioritize links to URLs that already show promise, so every placement works harder.",
          bullets: [
            "Query and page review from Search Console before outreach scales.",
            "Target URL list aligned with your keyword and content map.",
            "Anchor strategy that supports brand and topical terms without over-optimization.",
          ],
        },
        {
          title: "Link types — built in a professional sequence",
          body: "Campaigns follow a deliberate ladder. We do not dump every tactic on day one.",
          bullets: [
            "Foundational backlinks — early trust and brand footprint.",
            "Web 2.0 properties — controlled profiles and content hubs that support the domain.",
            "Relevant forums — contextual mentions where your niche already talks.",
            "Podcasts — authority mentions and show-note links when the fit is real.",
            "NANDLA backlinks — our premium tier; treated as the strongest placements in the mix.",
            "Cloud stacks — layered supporting structures used carefully and professionally.",
          ],
        },
        {
          title: "Spam checks on every placement",
          body: "Every link is reviewed before it is accepted. We check spam risk and Ahrefs health so we are not buying a short-term rank bump that damages the domain later.",
          bullets: [
            "Spam score and toxic pattern screening.",
            "Ahrefs metrics reviewed so the referring domain does not look artificially spammy.",
            "Relevance and context preferred over raw volume.",
            "Tracking sheet with sources you can audit anytime.",
          ],
        },
        {
          title: "What you should expect",
          body: "Done right, backlinks support rankings and lift DA / DR over time. Done wrong, they invite penalties. We stay on the careful side of that line.",
          bullets: [
            "Reporting on placements, anchors, and target URLs.",
            "Pace matched to how young or established your domain is.",
            "Coordination with content so links point at pages worth ranking.",
          ],
        },
      ],
      closing:
        "When traffic starts to arrive, monetization can begin on a site that already has content, technical strength, and growing authority.",
    },
  },
  {
    n: "05",
    slug: "ad-monetization",
    title: "Ad monetization",
    shortTitle: "Ad monetization",
    summary:
      "Once you have traffic, our monetization experts set up AdSense, Adsterra, Media.net, and more — with a strong preference for Google AdSense.",
    details: [
      "Applications and setup for AdSense, Adsterra, Media.net, and similar networks.",
      "Google AdSense preferred when the site and niche qualify.",
      "Snippet installation, placement, and ongoing ad management.",
      "Layouts balanced for reader experience and sustainable RPM.",
    ],
    guide: {
      intro:
        "Once the site is ranking and traffic is real, our ad monetization experts take over. Their job is to get you onto strong revenue networks and manage placements so organic visitors turn into earnings — without wrecking UX or risking account health.",
      sections: [
        {
          title: "Networks we work with",
          body: "We help you apply for and implement the networks that fit your traffic profile. Personally, the team prefers Google AdSense when eligibility and niche allow — it remains one of the most trusted revenue engines for content sites.",
          bullets: [
            "Google AdSense — preferred path for policy-aligned content sites.",
            "Adsterra — strong option when AdSense is not the right fit yet.",
            "Media.net — contextual demand for qualifying traffic.",
            "Other reputable networks when your geo or niche needs them.",
          ],
        },
        {
          title: "From snippet to managed placements",
          body: "We handle the practical work: account guidance, code snippets, ad unit placement, and ongoing management so you are not guessing which layout earns without hurting rankings.",
          bullets: [
            "Clean snippet installation on WordPress or Next.js templates.",
            "Above-the-fold and in-content placements tested for UX and RPM.",
            "Policy-aware density — aggressive layouts that get accounts banned are not “wins.”",
            "Iteration after real traffic patterns appear in analytics.",
          ],
        },
        {
          title: "Protecting long-term revenue",
          body: "Traffic is expensive to earn. Monetization should protect it. We keep layouts readable, avoid cloaking risks, and document what we changed so your team can maintain the setup.",
          bullets: [
            "Guidance on AdSense / network program expectations.",
            "Notes on what third-party scripts do to PageSpeed.",
            "Handoff so you understand units, IDs, and where to edit safely.",
          ],
        },
      ],
      closing:
        "Monetization closes the SkillStack loop: research → ranking content → site → authority → revenue — with specialists collaborating at every stage.",
    },
  },
  {
    n: "06",
    slug: "keyword-packages",
    title: "Keyword packages",
    shortTitle: "Keyword packages",
    summary:
      "Validated keyword deliverables for your niche, region, and model — ready before you commission a full build.",
    details: [
      "Primary keywords, supporting terms, and suggested page types in one package.",
      "Difficulty and opportunity scoring so you know what to chase first.",
      "Regional and language nuance for Pakistan or international SERPs.",
      "Ideal when you want research done before hiring build or content at scale.",
    ],
    guide: {
      intro:
        "Keyword packages are for teams that need a clear, validated target list before they invest in a full site or content engine. You receive research you can hand to writers, developers, or agencies — including ours.",
      sections: [
        {
          title: "What a package includes",
          body: "Deliverables are practical, not a raw dump of CSV rows.",
          bullets: [
            "Primary keywords with volume, difficulty, and intent notes.",
            "Supporting terms grouped under each parent.",
            "Suggested page types for each opportunity.",
            "Priority order for publishing or building first.",
          ],
        },
        {
          title: "Scoped to your market",
          body: "We tune packages to niche, geography, and how you earn money — ads, leads, or product — so the list matches your real business.",
          bullets: [
            "Country-specific lists when you are not chasing global SERPs.",
            "Language and local-search nuance where it matters.",
            "Competitor snapshot so you see who you are up against.",
          ],
        },
        {
          title: "How it plugs into the rest of SkillStack",
          body: "Use the package alone, or roll it into SEO ranking, website build, backlinking, and monetization with the same team — so nothing gets lost in translation.",
        },
      ],
      closing:
        "A keyword package is the lowest-friction way to start: clear targets, scored opportunities, and a path into the full SkillStack workflow when you are ready.",
    },
  },
  {
    n: "07",
    slug: "content-writing",
    title: "Content writing & SEO blogging",
    shortTitle: "Content writing",
    summary:
      "On-intent articles and blog posts written for readers and search — semantic coverage, clear structure, and publish-ready drafts.",
    details: [
      "Brief-to-draft content aligned to approved keywords and search intent.",
      "SEO blogging with headings, internals, and entity coverage built in.",
      "Editorial tone matched to your brand — not generic AI filler.",
      "Revision rounds so drafts ship when you are satisfied.",
    ],
    guide: {
      intro:
        "Content writing and SEO blogging turn keyword research into pages that can rank and convert. SkillStack writers work from briefs tied to real search demand — not vague “blog about our industry” requests.",
      sections: [
        {
          title: "What we write",
          body: "Guides, comparisons, local pages, thought pieces, and supporting cluster posts — each with a primary keyword job.",
          bullets: [
            "Pillar and supporting articles mapped to your topical cluster.",
            "Meta titles and descriptions drafted with the page.",
            "Internal-link suggestions to reinforce the site architecture.",
            "Image alt and formatting notes for developers or your CMS.",
          ],
        },
        {
          title: "Quality bar",
          body: "We aim for useful, original pages that satisfy intent and respect Google’s helpful-content expectations.",
          bullets: [
            "Competitor SERP skim before drafting so structure is competitive.",
            "Readable length — long enough to cover the topic, not padded.",
            "Fact-checkable claims; no invented stats.",
            "Optional Urdu/English nuance when your market needs it.",
          ],
        },
        {
          title: "How it fits SkillStack",
          body: "Pair content with keyword research, technical SEO, websites, and backlinks so publishing is part of a ranking system — not a content graveyard.",
        },
      ],
      closing:
        "You approve briefs and drafts. Published content stays yours; we keep process notes so your team can continue the calendar later.",
    },
  },
  {
    n: "08",
    slug: "technical-seo",
    title: "Technical SEO & site audits",
    shortTitle: "Technical SEO",
    summary:
      "Crawlability, indexation, Core Web Vitals, schema, and fix lists so Google can find — and trust — your important pages.",
    details: [
      "Full technical audit with prioritized fix list.",
      "Index coverage, canonicals, redirects, and sitemap hygiene.",
      "Core Web Vitals and PageSpeed-minded recommendations.",
      "Schema and structured-data checks for rich-result eligibility.",
    ],
    guide: {
      intro:
        "Technical SEO makes sure great content is not trapped behind crawl errors, slow templates, or messy indexation. We audit, explain, and help implement fixes on WordPress or Next.js.",
      sections: [
        {
          title: "Audit coverage",
          body: "We inspect how search engines see your site today and what blocks growth.",
          bullets: [
            "Robots, sitemaps, canonicals, and noindex mistakes.",
            "Redirect chains, soft 404s, and orphan pages.",
            "Mobile usability and Core Web Vitals hotspots.",
            "Duplicate content and parameter URL issues.",
          ],
        },
        {
          title: "Implementation support",
          body: "Audits without action waste money. We prioritize by impact and can implement fixes with your developers or ours.",
          bullets: [
            "P0 / P1 / P2 fix ordering so the team knows what to do first.",
            "Staging checks before production changes.",
            "Search Console verification and coverage follow-up.",
            "Re-audit after major releases when you want a second pass.",
          ],
        },
        {
          title: "When to buy this",
          body: "Ideal before a redesign, after a traffic drop, or when rankings stall despite good content — and as part of Growth or Full Stack packages.",
        },
      ],
      closing:
        "Technical health is the foundation under keywords, content, and links. Fix the pipes, then pour in the traffic strategy.",
    },
  },
];

export const teamCollaborationNote =
  "The SkillStack team collaborates side by side in a fair, focused environment. Each member gives their best from their side — research, SEO writing, development, backlinking, and monetization — aiming to deliver the strongest version of the work, together.";

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getServiceSlugs() {
  return services.map((s) => s.slug);
}
