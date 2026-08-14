import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import {
  SITE_URL,
  FOUNDER_NAME,
  absoluteUrl,
  aggregateRatingJsonLd,
  webPageJsonLd,
  pageOpenGraph,
} from "@/lib/seo";

const PAGE_URL = absoluteUrl("/seo-2026");
const TITLE = "SEO in 2026: How It Actually Works Now | SkillStack";
const DESC =
  "SEO in 2026 is not just keywords and backlinks. Learn how AI Overviews, AEO, structured data, and citations have changed the game — and how SkillStack builds for every step of the new path.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "SEO in 2026",
    "how SEO works in 2026",
    "AI SEO 2026",
    "AEO answer engine optimisation",
    "AI Overviews Google 2026",
    "ChatGPT SEO",
    "Perplexity SEO",
    "Gemini SEO",
    "earn citations SEO",
    "GEO generative engine optimisation",
    "SEO vs AEO",
    "structured data SEO 2026",
    "brand mentions SEO",
    "SEO strategy 2026",
    "SkillStack SEO Pakistan",
    "best SEO company Pakistan 2026",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: pageOpenGraph({ url: PAGE_URL, title: TITLE, description: DESC }),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${PAGE_URL}#article`,
  headline: TITLE,
  description: DESC,
  url: PAGE_URL,
  datePublished: "2026-08-15",
  dateModified: "2026-08-15",
  author: {
    "@type": "Person",
    name: FOUNDER_NAME,
    url: `${SITE_URL}/about`,
  },
  publisher: {
    "@type": "Organization",
    name: "SkillStack",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/skill-stack.webp` },
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is SEO in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SEO in 2026 combines traditional Google ranking with AI visibility. You need strong technical foundations, structured data, AEO-optimised content, and citations that AI assistants like ChatGPT, Perplexity, and Google Gemini use to answer queries.",
      },
    },
    {
      "@type": "Question",
      name: "What is AEO (Answer Engine Optimisation)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AEO is the practice of optimising content so that AI-powered answer engines — including Google AI Overviews, ChatGPT, Perplexity, and Gemini — directly cite your page as the source of an answer. It includes FAQ schema, HowTo schema, speakable markup, and clear entity relationships.",
      },
    },
    {
      "@type": "Question",
      name: "What are Google AI Overviews and how do they affect SEO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google AI Overviews (formerly SGE) are AI-generated summaries that appear above organic results. They pull content from a handful of trusted, well-structured sources. Being cited in an AI Overview can deliver high-intent traffic even without a top-10 ranking.",
      },
    },
    {
      "@type": "Question",
      name: "Do backlinks still matter in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — but the definition of a valuable link has evolved. High-authority editorial citations, brand mentions (even unlinked), and co-citations from AI-trusted domains carry greater weight than low-quality link volume.",
      },
    },
    {
      "@type": "Question",
      name: "How does SkillStack optimise for SEO in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SkillStack covers all eight steps of the 2026 SEO path: technical health, AI Overview optimisation, entity structuring, AEO markup, multi-AI citation building, brand mention campaigns, and turning that authority into Google rankings and AI citations simultaneously.",
      },
    },
  ],
};

const steps = [
  {
    n: "01",
    title: "Strong SEO Foundations",
    body: `Before AI, before citations, before anything — your technical health determines whether Google and AI crawlers can even understand your site. Core Web Vitals (LCP under 2.5 s, CLS under 0.1, INP under 200 ms), clean crawl paths, proper canonical tags, and a schema-rich HTML structure are non-negotiable in 2026. A shaky foundation means none of the steps above it will stick. SkillStack audits every site for over 80 technical signals before writing a single word of content.`,
    accent: "emerald",
  },
  {
    n: "02",
    title: "AI Overviews Appear",
    body: `Google launched AI Overviews (AIO) globally in 2024. By 2026, they appear in the majority of informational and commercial queries. AIO pulls a synthesised answer from three to five sources — appearing above the #1 organic result. This means a page ranked #7 with excellent structure can receive more clicks than the #1 result without AIO inclusion. The goal shifts from "rank first" to "be cited first."`,
    accent: "sky",
  },
  {
    n: "03",
    title: "Structure for AI",
    body: `AI systems — whether Google's Gemini or OpenAI's GPT-4o — build knowledge graphs from structured data. JSON-LD schema markup (Organization, Article, FAQPage, HowTo, BreadcrumbList, Person, LocalBusiness) tells AI exactly what your entities are, how they relate, and why they are authoritative. Entity disambiguation — making clear that "SkillStack" is a company, not a concept — is especially critical for brand queries and AI Overview inclusion.`,
    accent: "slate",
  },
  {
    n: "04",
    title: "Optimise for AEO",
    body: `Answer Engine Optimisation (AEO) targets the AI layer directly. This means writing content in a question-and-answer format, adding FAQPage and HowTo schema, using speakable markup for voice answers, and structuring each page around a single primary query. In 2026, the content that gets cited by ChatGPT or Perplexity is content written specifically to answer — not just to rank. SkillStack's content team writes every article with AEO structure from the first draft.`,
    accent: "teal",
  },
  {
    n: "05",
    title: "ChatGPT · Perplexity · Gemini",
    body: `Users have shifted a significant portion of informational queries away from Google entirely — toward ChatGPT, Perplexity, and Google Gemini. These tools pull answers from indexed, trusted sources. A brand that is not cited in these AI responses is invisible to a growing share of the search market. Optimising for these platforms requires clean indexability, strong backlink authority, and content that directly addresses queries these tools receive most often.`,
    accent: "violet",
  },
  {
    n: "06",
    title: "Earn Citations",
    body: `An AI citation is a reference — linked or unlinked — from a high-authority publication, directory, or AI response. Earning citations requires a combination of digital PR, guest content on reputable domains, and being mentioned in AI-trusted sources. Citations are the currency of 2026 SEO: they tell both Google and AI assistants that your content is verifiable and worth surfacing. A single citation from a site like Dawn.pk or ProPakistani.pk carries far more weight than ten low-quality backlinks.`,
    accent: "amber",
  },
  {
    n: "07",
    title: "Brand Mentions",
    body: `Google's Natural Language Processing can now identify brand mentions without anchor text. A mention of "SkillStack" in a relevant article — even without a link — contributes to the entity's authority. Building brand mentions requires a systematic outreach strategy: press features, podcast appearances, community mentions, and social signals. SkillStack tracks brand mentions across the web and actively builds the off-site authority that AI systems and Google use to gauge trustworthiness.`,
    accent: "rose",
  },
  {
    n: "08",
    title: "Cited AND Ranked",
    body: `The final state of 2026 SEO is dual visibility: appearing in traditional Google rankings and being cited in AI answers simultaneously. Brands that achieve this receive organic traffic from two sources — the 60% of users who still click organic results and the growing segment who act on AI-cited recommendations. SkillStack's packages are designed to deliver this dual outcome, not one or the other.`,
    accent: "accent",
    final: true,
  },
];

const accentMap: Record<string, string> = {
  emerald: "border-emerald-500/30 text-emerald-400",
  sky: "border-sky-500/30 text-sky-400",
  slate: "border-white/15 text-white/60",
  teal: "border-teal-500/30 text-teal-400",
  violet: "border-violet-500/30 text-violet-400",
  amber: "border-amber-500/30 text-amber-400",
  rose: "border-rose-500/30 text-rose-400",
  accent: "border-accent/50 text-accent",
};

export default function Seo2026Page() {
  return (
    <PageShell>
      <JsonLd data={webPageJsonLd({ path: "/seo-2026", title: TITLE, description: DESC })} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={aggregateRatingJsonLd()} />

      <PageHero
        eyebrow="SEO in 2026"
        title="SEO looks different today — here's how it actually works."
        lead="Keywords and backlinks still matter, but they're now just the foundation. In 2026, the brands that win are the ones that rank on Google and get cited by AI. This is the new 8-step path."
        tone="deep"
        breadcrumbs={[{ label: "SEO in 2026" }]}
      />

      <article className="bg-[#010409] py-16 sm:py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">

          {/* Intro — left-aligned */}
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Overview
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-2xl font-bold tracking-tight text-snow sm:text-4xl">
              Why the old linear path is no longer enough
            </h2>
            <div className="mt-5 max-w-2xl space-y-4 text-sm leading-relaxed text-ink-muted sm:text-base [&_em]:italic [&_strong]:font-semibold [&_strong]:text-snow">
              <p>
                For years, the SEO playbook was simple: research keywords, publish content,
                build backlinks, watch rankings climb, collect clicks. That linear path still
                forms the <strong>bedrock</strong> of search — but it&apos;s no longer the ceiling.
              </p>
              <p>
                In 2026, Google&apos;s AI Overviews appear on the majority of queries. ChatGPT
                fields over 100 million daily queries. Perplexity is growing 10x year over year.
                Users don&apos;t just search — they <em>ask</em>. And the answers they receive come
                from a handful of cited, structured, AI-trusted sources.
              </p>
              <p>
                The brands that succeed in 2026 are not the ones who rank #1 and stop there.
                They are the ones who <strong>rank on Google and get cited in every AI answer</strong>.
                This guide walks through each step of how that actually works — and how SkillStack
                builds for all eight simultaneously.
              </p>
            </div>
          </FadeIn>

          <div className="my-12 h-px w-full bg-white/10" />

          {/* 8 Steps — each triggers individually on scroll */}
          <div className="space-y-6">
            {steps.map((step) => {
              const colors = accentMap[step.accent] ?? "border-white/15 text-white/60";
              const [borderCls, textCls] = colors.split(" ");
              return (
                <FadeIn key={step.n}>
                  <div className={`rounded-xl border bg-white/[0.025] p-6 sm:p-8 ${borderCls} ${step.final ? "ring-1 ring-accent/25" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${
                          step.final
                            ? "border-accent/50 bg-accent/15 text-accent"
                            : `${borderCls} bg-white/5 ${textCls}`
                        }`}
                      >
                        {step.n}
                      </span>
                      <h3 className={`font-display text-base font-bold tracking-tight sm:text-xl ${step.final ? "text-accent" : "text-snow"}`}>
                        {step.title}
                      </h3>
                    </div>
                    <div className={`mt-3 h-px w-full bg-gradient-to-r ${step.final ? "from-accent/40" : "from-white/10"} to-transparent`} />
                    <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          <div className="my-12 h-px w-full bg-white/10" />

          {/* FAQ */}
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Frequently Asked
            </p>
            <h2 className="font-display mt-3 max-w-xl text-xl font-bold tracking-tight text-snow sm:text-3xl">
              Common questions about SEO in 2026
            </h2>
          </FadeIn>

          <div className="mt-8 space-y-4">
            {faqJsonLd.mainEntity.map((item, i) => (
              <FadeIn key={i}>
                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
                  <h3 className="font-display text-sm font-semibold text-snow sm:text-base">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.acceptedAnswer.text}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="my-12 h-px w-full bg-white/10" />

          {/* Closing */}
          <FadeIn>
            <div className="rounded-xl border border-accent/25 bg-accent/5 p-6 sm:p-8">
              <p className="text-xs font-medium uppercase tracking-widest text-accent">
                SkillStack covers all 8 steps
              </p>
              <h2 className="font-display mt-2 max-w-lg text-lg font-bold tracking-tight text-snow sm:text-2xl">
                Ready to rank on Google and get cited by AI?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                SkillStack is a Gilgit-Baltistan-based SEO company. Every package we offer
                is designed around the 2026 path — from technical foundations through to
                earning the AI citations that modern search requires.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
                >
                  View our services
                </Link>
                <Link
                  href="/contact"
                  className="rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold text-snow hover:border-accent/50 hover:text-accent"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </FadeIn>

        </div>
      </article>

      <div className="border-t border-white/10 bg-[#0d1117] py-14 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <FadeIn className="max-w-lg text-lg text-snow md:text-xl">
            Every SkillStack package is built for the 2026 SEO path — from foundations to AI citations.
          </FadeIn>
          <FadeIn delay={0.08} className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-snow hover:bg-white/5"
            >
              Talk to us
            </Link>
            <Link
              href="/services"
              className="inline-flex rounded-md bg-accent px-6 py-3 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
            >
              View our services
            </Link>
          </FadeIn>
        </div>
      </div>
    </PageShell>
  );
}
