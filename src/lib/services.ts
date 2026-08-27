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
      "Low-competition, high-volume keywords from any country — plus AI-query and People Also Ask mining so you rank on Google and get cited by ChatGPT, Perplexity, and Google AI Overviews.",
    details: [
      "Multi-tool research across Ahrefs, Semrush, Moz, and Google Keyword Planner.",
      "AI-query research — the questions ChatGPT, Perplexity, and Gemini actually answer.",
      "People Also Ask and voice-search intent mapped alongside traditional keywords.",
      "Parent keywords grouped with supporting terms and AEO-ready question clusters.",
    ],
    guide: {
      intro:
        "Keyword research in 2026 has two layers. The first is traditional: find terms people type into Google that you can realistically rank for. The second is new: find the questions AI assistants like ChatGPT, Perplexity, and Google Gemini answer every day — because the sources those tools cite get traffic even without a top-10 Google rank. SkillStack maps both layers so your content wins on every search surface.",
      sections: [
        {
          title: "The tools we use — and why each matters",
          body: "No single tool owns the truth of search. We combine platforms so volume, difficulty, SERP features, and competitor gaps reinforce each other.",
          bullets: [
            "Ahrefs — keyword difficulty, traffic potential, click metrics, content gap analysis, and backlink context around ranking pages.",
            "Semrush — broad keyword databases, topic research, position tracking, and competitive keyword overlap across markets.",
            "Moz — Domain Authority signals, keyword suggestions, and a second difficulty lens when Ahrefs and Semrush disagree.",
            "Google Keyword Planner — Google's own volume ranges and bid data, especially useful for commercial intent and ad-supported niches.",
            "People Also Ask + autocomplete — real question phrasing that maps directly to AI Overview and AEO content targets.",
          ],
        },
        {
          title: "AI-query and answer-engine keyword research",
          body: "In 2026, a significant share of queries never reach a traditional SERP — they are answered directly by ChatGPT, Perplexity, and Google AI Overviews. We research which questions your audience asks these tools, then build a keyword and content plan that targets those queries explicitly.",
          bullets: [
            "Question-format keyword clusters (Who, What, How, Why) mapped for AEO content.",
            "People Also Ask lists mined per topic cluster for FAQ and HowTo schema targets.",
            "Voice-search phrasing captured so your content matches conversational queries.",
            "AI citation opportunity scoring — which queries AI tools already answer and what sources they cite.",
          ],
        },
        {
          title: "Low competition, high search volume — worldwide",
          body: "We filter for keywords where demand is real and competition is manageable — for Pakistan, UAE, US, UK, and beyond.",
          bullets: [
            "Geo-targeted lists for the countries you care about.",
            "Difficulty thresholds matched to your domain age and authority.",
            "Commercial and informational intent separated so pages have a job.",
            "Seasonality and trend checks so you do not build on dying queries.",
          ],
        },
        {
          title: "Keyword grouping and parent-child coverage",
          body: "A strong parent keyword rarely stands alone. We map clusters so the pillar page and supporting posts reinforce each other instead of cannibalizing rankings.",
          bullets: [
            "Parent (pillar) keyword with a clear primary landing page.",
            "Supporting keywords grouped by intent — each planned as its own article.",
            "AI-question clusters appended to each topic so writers cover AEO targets.",
            "Cannibalization checks so two URLs never fight for the same primary term.",
          ],
        },
      ],
      closing:
        "You approve the keyword set before major content or build spend begins. Every article and every page has a Google-ranking target and an AI-citation target — both covered from day one.",
    },
  },
  {
    n: "02",
    slug: "seo-ranking",
    title: "SEO ranking",
    shortTitle: "SEO ranking",
    summary:
      "Fully optimized articles built for Google rankings and AI citations — semantic SEO, AEO structure, entity coverage, and competitor analysis baked into every draft.",
    details: [
      "SEO experts write on-intent articles aimed at outranking competitors on Google.",
      "AEO-structured content — FAQ, HowTo, and speakable markup for AI citation eligibility.",
      "Semantic SEO, entity coverage, and AI Overview-ready formatting in every draft.",
      "Refresh and expansion cycles so rankings hold and AI citations stay current.",
    ],
    guide: {
      intro:
        "SEO ranking in 2026 means winning two channels simultaneously: the traditional Google SERP and the AI answer layer — Google AI Overviews, ChatGPT, Perplexity, and Gemini. SkillStack writes fully optimized, on-intent articles using semantic SEO, AEO structure, and the competitor analysis required to outrank whatever is sitting above you — and get cited by the AI tools your audience is switching to.",
      sections: [
        {
          title: "Competitor analysis before the first draft",
          body: "We study the pages that already occupy the top results — depth, structure, media, E-E-A-T signals, and gaps they leave open. Your article is planned to match search intent better and cover what competitors miss.",
          bullets: [
            "Top-ranking URL teardown for structure, word count ranges, and topics covered.",
            "Gap list — questions, subtopics, and formats competitors ignore.",
            "SERP feature notes (featured snippets, FAQs, AI Overviews, video) so we can compete for them.",
            "Differentiation angle so your page earns its own place — not a copy of what ranks today.",
          ],
        },
        {
          title: "AEO-structured content for AI citation eligibility",
          body: "Answer Engine Optimisation (AEO) is the practice of writing content so AI systems can lift it directly into an answer. We build AEO structure into every article from the first draft — not as an afterthought.",
          bullets: [
            "Question-and-answer formatting aligned to People Also Ask and AI query patterns.",
            "FAQPage and HowTo schema-ready sections so developers can add markup cleanly.",
            "Speakable-ready summaries at the top of key articles for voice and AI responses.",
            "Clear entity definitions so Google and AI tools understand exactly who, what, and where you are.",
          ],
        },
        {
          title: "Semantic SEO and full entity coverage",
          body: "Modern ranking rewards topical completeness. We implement semantic SEO so entities, related questions, and supporting vocabulary are covered — helping Google and AI systems understand that your page is the authoritative answer.",
          bullets: [
            "Entity and topic coverage aligned with the keyword cluster.",
            "People Also Ask and related queries answered in clear, citable sections.",
            "Natural language that satisfies intent without awkward keyword stuffing.",
            "Google AI Overview-friendly structure: direct answers, short paragraphs, clear headers.",
          ],
        },
        {
          title: "Built to rank and stay ranked",
          body: "Publishing is step one. We write for the SERP you want to own, then support updates when competitors improve or Search Console shows opportunity.",
          bullets: [
            "Drafts reviewed against the competitor brief before go-live.",
            "On-page checklist passed before the page is marked done.",
            "Refresh plans for aging posts that start to slip.",
            "Clear briefs so your team or ours can expand the cluster consistently.",
          ],
        },
      ],
      closing:
        "Every article hands off cleanly to development and publishing — already engineered to rank on Google and be cited by AI tools from the moment it goes live.",
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
        "After keywords and SEO articles are ready, we build the site that carries them. SkillStack has expert WordPress developers and React / Next.js developers who design for mobile, craft UI/UX that feels premium, and implement the technical search foundations your content needs to perform — including full 2026 SEO and AEO infrastructure.",
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
          body: "Our developers implement full 2026 search foundations in the codebase — traditional SEO plus AEO (answer engines), AIO (AI Overviews), and GEO (generative engine optimisation). Schema is flexible: AggregateRating, FAQPage, HowTo, Organization, Article, LocalBusiness, BreadcrumbList — and more.",
          bullets: [
            "Technical SEO: indexability, sitemaps, canonicals, robots, and clean HTML.",
            "Structured data for rich results, featured snippets, and AI citation eligibility.",
            "AEO markup — FAQPage, HowTo, speakable — built into templates from the start.",
            "Entity disambiguation in JSON-LD so Google and AI tools understand your brand clearly.",
          ],
        },
        {
          title: "Core Web Vitals and PageSpeed Insights",
          body: "Speed is ranking and revenue. We tune pages so Core Web Vitals pass and PageSpeed Insights scores are pushed as high as the design allows — including 100 on key templates when assets and third parties cooperate.",
          bullets: [
            "LCP, INP, and CLS budgets during design and development.",
            "Compressed media, critical CSS discipline, and lean third-party scripts.",
            "Lab and field checks before handoff.",
            "Guidance on what ads or embeds may cost you in score — so you choose knowingly.",
          ],
        },
      ],
      closing:
        "You get a site built around approved keywords and SEO articles — ready for Search Console, 2026 AI citation, ranking work, and growth.",
    },
  },
  {
    n: "04",
    slug: "backlinking",
    title: "Backlinking",
    shortTitle: "Backlinking",
    summary:
      "After Search Console insights land, our link experts build high-authority backlinks and brand citations that lift rankings, DA, and DR — and signal trust to AI systems.",
    details: [
      "Timed after early Search Console analysis — not random blasts on day one.",
      "Foundational links through to editorial citations and brand mentions.",
      "Spam-score and Ahrefs health checked before links are counted as done.",
      "Authority work aimed at Google rankings plus AI citation signals.",
    ],
    guide: {
      intro:
        "In 2026, backlinks serve two masters: Google's PageRank algorithm and the AI trust signals that determine which sources ChatGPT, Perplexity, and Google AI Overviews cite. SkillStack's backlinking service builds high-authority links and brand citations that satisfy both — timed correctly and screened for quality.",
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
            "Editorial citations — high-authority publications that AI tools trust and cite.",
            "NANDLA backlinks — our premium tier; treated as the strongest placements in the mix.",
          ],
        },
        {
          title: "Brand mentions and AI citation signals",
          body: "In 2026, unlinked brand mentions — a reference to your company name on a relevant, authoritative site — contribute to both Google's NLP entity graph and AI citation pools. We build mention campaigns alongside traditional link building.",
          bullets: [
            "Digital PR outreach to publications your niche respects.",
            "Unlinked brand mention tracking so we see what AI tools are picking up.",
            "Co-citation building — getting mentioned alongside trusted brands in your space.",
            "Monitoring for new citations across Google, ChatGPT, and Perplexity responses.",
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
      ],
      closing:
        "When traffic starts to arrive, monetization can begin on a site that already has content, technical strength, growing authority, and AI citation signals working in its favor.",
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
            "Policy-aware density — aggressive layouts that get accounts banned are not wins.",
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
        "Monetization closes the SkillStack loop: research, ranking content, site, authority, and revenue — with specialists collaborating at every stage.",
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
      "AEO-structured articles and blog posts written for Google rankings and AI citations — FAQ markup, speakable summaries, entity coverage, and publish-ready drafts.",
    details: [
      "Brief-to-draft content aligned to approved keywords and search intent.",
      "AEO-structured writing — question-answer format, FAQ sections, and HowTo coverage.",
      "Entity-rich, semantic SEO blogging built to earn Google AI Overview citations.",
      "Editorial tone matched to your brand — not generic AI filler.",
    ],
    guide: {
      intro:
        "Content writing in 2026 means writing for two audiences simultaneously: the human reader and the AI system that may cite your page in its next answer. SkillStack writers work from briefs tied to real search demand — and every article is structured to rank on Google and be eligible for citation by ChatGPT, Perplexity, and Google AI Overviews.",
      sections: [
        {
          title: "AEO-structured writing — built for AI citation",
          body: "Answer Engine Optimisation starts at the draft stage. We write content in the format AI tools prefer: direct answers, short paragraphs, clear question headings, and summary blocks that can be lifted into AI responses.",
          bullets: [
            "Question-and-answer format aligned to People Also Ask and AI query patterns.",
            "Speakable intro summaries — the answer AI tools quote most often.",
            "FAQ sections with concise, citable answers ready for FAQPage schema.",
            "HowTo-structured instructions where step-by-step content fits.",
          ],
        },
        {
          title: "What we write",
          body: "Guides, comparisons, local pages, thought pieces, and supporting cluster posts — each with a primary keyword job and an AI citation structure.",
          bullets: [
            "Pillar and supporting articles mapped to your topical cluster.",
            "Meta titles and descriptions drafted with the page.",
            "Internal-link suggestions to reinforce the site architecture.",
            "Image alt and formatting notes for developers or your CMS.",
          ],
        },
        {
          title: "Quality bar",
          body: "We aim for useful, original pages that satisfy intent, respect Google's helpful-content expectations, and provide the depth AI systems cite.",
          bullets: [
            "Competitor SERP skim before drafting so structure is competitive.",
            "Readable length — long enough to cover the topic, not padded.",
            "Fact-checkable claims; no invented stats.",
            "Optional Urdu/English nuance when your market needs it.",
          ],
        },
        {
          title: "How it fits SkillStack",
          body: "Pair content with keyword research, technical SEO, websites, and backlinks so publishing is part of a ranking and citation system — not a content graveyard.",
        },
      ],
      closing:
        "You approve briefs and drafts. Published content stays yours — and is built from day one to rank on Google and earn a place in AI answers.",
    },
  },
  {
    n: "08",
    slug: "technical-seo",
    title: "Technical SEO & site audits",
    shortTitle: "Technical SEO",
    summary:
      "Crawlability, Core Web Vitals, entity-rich schema, and AI-ready structure — so Google can rank your pages and AI tools can cite them.",
    details: [
      "Full technical audit with prioritized fix list for Google and AI readiness.",
      "Index coverage, canonicals, redirects, and sitemap hygiene.",
      "Core Web Vitals and PageSpeed-minded recommendations.",
      "Entity-rich schema and structured data for rich results and AI citation eligibility.",
    ],
    guide: {
      intro:
        "Technical SEO in 2026 has expanded beyond crawl paths and sitemaps. Your site must be readable by Google's crawlers, understandable by AI knowledge graphs, and fast enough to pass Core Web Vitals. SkillStack audits all three layers — then helps implement fixes on WordPress or Next.js.",
      sections: [
        {
          title: "Audit coverage — Google and AI readiness",
          body: "We inspect how search engines and AI crawlers see your site today and what blocks growth.",
          bullets: [
            "Robots, sitemaps, canonicals, and noindex mistakes.",
            "Redirect chains, soft 404s, and orphan pages.",
            "Mobile usability and Core Web Vitals hotspots.",
            "Entity disambiguation — is your brand, founder, and service clearly defined in structured data?",
          ],
        },
        {
          title: "Schema and structured data for AI citation eligibility",
          body: "AI systems like Google Gemini and ChatGPT build knowledge graphs from structured data. We audit and implement schema that signals authority to both Google and AI tools.",
          bullets: [
            "Organization, LocalBusiness, and Person schema for brand entity clarity.",
            "FAQPage and HowTo schema for AI Overview and featured snippet eligibility.",
            "Article and BreadcrumbList schema for content page signals.",
            "AggregateRating schema where applicable for star-rich results in SERPs.",
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
          body: "Ideal before a redesign, after a traffic drop, when rankings stall despite good content, or when you want to qualify your site for AI Overview inclusion.",
        },
      ],
      closing:
        "Technical health is the foundation under keywords, content, and links — and in 2026, the gateway to AI citation. Fix the pipes, then let the traffic and citations flow.",
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
