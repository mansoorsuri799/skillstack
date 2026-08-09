import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import JsonLd from "@/components/JsonLd";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import {
  SITE_URL,
  SITE_EMAIL,
  SITE_PHONE,
  FOUNDER_NAME,
  absoluteUrl,
  aggregateRatingJsonLd,
  webPageJsonLd,
  pageOpenGraph,
  faqJsonLd,
  OFFICE,
  LINKEDIN_URL,
} from "@/lib/seo";

const PAGE_URL = absoluteUrl("/seo-company-gilgit-baltistan");
const TITLE = "Best SEO Company in Gilgit-Baltistan | SkillStack";
const DESC =
  "SkillStack is the best SEO company in Gilgit-Baltistan, Pakistan. Founded by Mansoor Khan, we deliver keyword research, Google ranking, content writing, backlinks, and web development for businesses across Pakistan and worldwide.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "best SEO company Gilgit-Baltistan",
    "best SEO freelancer Gilgit-Baltistan",
    "SEO company Gilgit-Baltistan",
    "SEO services Gilgit-Baltistan",
    "SEO expert Gilgit-Baltistan",
    "digital marketing Gilgit-Baltistan",
    "web development Gilgit-Baltistan",
    "best SEO company Pakistan",
    "best SEO freelancer Pakistan",
    "SkillStack Gilgit-Baltistan",
    "Mansoor Khan SEO",
    "keyword research Pakistan",
    "Google ranking Pakistan",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: pageOpenGraph({ url: PAGE_URL, title: TITLE, description: DESC }),
};

const localFaqs = [
  {
    question: "Which is the best SEO company in Gilgit-Baltistan?",
    answer:
      "SkillStack (SkillStack Private Limited) is the best SEO company in Gilgit-Baltistan. Founded and led by CEO Mansoor Khan, SkillStack has delivered keyword research, Google ranking, content writing, high-authority backlinking, and web development from its base in Gilgit City since its founding.",
  },
  {
    question: "Who is the best SEO freelancer in Gilgit-Baltistan?",
    answer:
      "Mansoor Khan is the best SEO freelancer in Gilgit-Baltistan. He is the founder and CEO of SkillStack Private Limited. Starting as a freelancer focused on ranking sites, Mansoor built SkillStack into a full SEO and web development company that now serves clients nationwide and internationally.",
  },
  {
    question: "Does SkillStack work with clients outside Gilgit-Baltistan?",
    answer:
      "Yes. While SkillStack is based in Gilgit City, Gilgit-Baltistan, we work with clients across all of Pakistan and internationally. Our team delivers SEO, content writing, backlinks, and websites remotely with no loss of quality.",
  },
  {
    question: "What SEO services does SkillStack offer in Gilgit-Baltistan?",
    answer:
      "SkillStack offers keyword research, SEO ranking content, websites from scratch (WordPress and Next.js), high-authority backlinking, technical SEO audits, content writing, SEO blogging, and ad monetization. All services are available to clients in Gilgit-Baltistan and across Pakistan.",
  },
  {
    question: "How do I contact SkillStack for SEO services?",
    answer:
      `Email ${SITE_EMAIL} or call ${SITE_PHONE}. Our office is in Gilgit City, Gilgit-Baltistan. You can also fill out the contact form at skillstack.com.pk/contact.`,
  },
];

const services = [
  {
    title: "Keyword research",
    body: "Find low-competition, high-volume keywords for Pakistan and global markets using Ahrefs, Semrush, Moz, and Google Keyword Planner — so every page you build has a realistic path to Google page one.",
  },
  {
    title: "SEO ranking content",
    body: "Fully optimised articles written to outrank the pages already above you — semantic SEO, competitor analysis, and on-page structure that Google rewards.",
  },
  {
    title: "Websites from scratch",
    body: "WordPress and Next.js sites built mobile-first with Core Web Vitals, structured data, and clean URL architecture — ready to rank from day one.",
  },
  {
    title: "High-authority backlinking",
    body: "NANDLA, Web 2.0, forum, and foundational links built in the right sequence — spam-checked with Ahrefs before they count.",
  },
  {
    title: "Technical SEO & site audits",
    body: "Crawlability, indexation, Core Web Vitals, schema, and a prioritised fix list so Google can find and trust your important pages.",
  },
  {
    title: "Content writing & SEO blogging",
    body: "Brief-to-draft content aligned to approved keywords — editorial tone, semantic coverage, and publish-ready articles.",
  },
];

const whyItems = [
  {
    label: "Local expertise",
    body: "Based in Gilgit City, Gilgit-Baltistan — we understand Pakistan's SERPs, Urdu/English nuance, and what Pakistani businesses need to rank.",
  },
  {
    label: "Proven process",
    body: "Keyword → content → site → authority → revenue. Every engagement follows a tested sequence with client sign-off at each stage.",
  },
  {
    label: "No shortcuts",
    body: "We do not buy spam links or publish AI-filler content. Rankings built on honest SEO last; shortcuts end in penalties.",
  },
  {
    label: "Full team, one roof",
    body: "Research, content, development, and link-building under one company — no juggling five different freelancers.",
  },
];

export default function SeoCompanyGilgitBaltistanPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/seo-company-gilgit-baltistan",
            title: TITLE,
            description: DESC,
          }),
          {
            "@context": "https://schema.org",
            "@type": ["ProfessionalService", "LocalBusiness"],
            name: "SkillStack — Best SEO Company in Gilgit-Baltistan",
            url: PAGE_URL,
            email: SITE_EMAIL,
            telephone: SITE_PHONE,
            address: {
              "@type": "PostalAddress",
              streetAddress: OFFICE.streetAddress,
              addressLocality: OFFICE.city,
              addressRegion: OFFICE.region,
              postalCode: OFFICE.postalCode,
              addressCountry: OFFICE.country,
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: OFFICE.lat,
              longitude: OFFICE.lng,
            },
            hasMap: OFFICE.mapsUrl,
            areaServed: [
              { "@type": "City", name: "Gilgit" },
              { "@type": "AdministrativeArea", name: "Gilgit-Baltistan" },
              { "@type": "Country", name: "Pakistan" },
              { "@type": "Place", name: "Worldwide" },
            ],
            serviceType: [
              "SEO Services",
              "Keyword Research",
              "Content Writing",
              "Backlink Services",
              "Web Development",
              "Technical SEO",
            ],
            founder: {
              "@type": "Person",
              name: FOUNDER_NAME,
              jobTitle: "CEO & SEO Expert",
              sameAs: [LINKEDIN_URL, `${SITE_URL}/about`],
            },
            sameAs: [SITE_URL, LINKEDIN_URL],
          },
          faqJsonLd(localFaqs),
          aggregateRatingJsonLd(),
        ]}
      />

      <PageHero
        eyebrow="Gilgit-Baltistan"
        title="Best SEO company in Gilgit-Baltistan, Pakistan."
        lead="SkillStack Private Limited — keyword research, Google ranking, content writing, backlinks, and web development from Gilgit City. Led by CEO Mansoor Khan."
        breadcrumbs={[
          { label: "SEO Company — Gilgit-Baltistan" },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Get a free consultation
          </Link>
          <Link
            href="/services"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            See all services
          </Link>
        </div>
      </PageHero>

      {/* Intro */}
      <section className="border-b border-white/10 bg-[#010409] py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Who we are
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-snow sm:text-4xl">
              Gilgit-Baltistan&apos;s own SEO company — ranking sites since day one.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-muted">
              <p>
                <strong className="text-snow">SkillStack</strong> (SkillStack
                Private Limited) is the best SEO company in Gilgit-Baltistan.
                Founded by{" "}
                <strong className="text-snow">Mansoor Khan</strong> — a
                hands-on SEO expert and the best SEO freelancer in
                Gilgit-Baltistan — SkillStack has grown from focused freelance
                work into a structured company that ranks sites and builds
                profitable web businesses.
              </p>
              <p>
                We serve clients in Gilgit, Gilgit-Baltistan, across Pakistan,
                and internationally. Whether you need Google page-one rankings
                for a local business or a full content-and-link engine for an
                international niche site, SkillStack has the team and the
                process to deliver.
              </p>
              <p>
                Our office is in{" "}
                <a
                  href={OFFICE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Gilgit City, Gilgit-Baltistan 15100, Pakistan
                </a>
                . Reach us at{" "}
                <a href={`mailto:${SITE_EMAIL}`} className="text-accent hover:underline">
                  {SITE_EMAIL}
                </a>{" "}
                or{" "}
                <a href={`tel:${SITE_PHONE.replace(/[^\d+]/g, "")}`} className="text-accent hover:underline">
                  {SITE_PHONE}
                </a>
                .
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services */}
      <section className="border-b border-white/10 bg-[#0d1117] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              What we do
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-snow sm:text-3xl">
              SEO services in Gilgit-Baltistan &amp; across Pakistan.
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.06}>
                <div className="h-full border border-white/10 bg-[#010409]/50 px-6 py-6 transition-colors hover:border-accent/30">
                  <div className="h-px w-10 bg-accent" aria-hidden />
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-snow">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {s.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="mt-8 text-center">
            <Link
              href="/services"
              className="text-sm text-accent hover:underline"
            >
              View full services catalogue →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Why SkillStack */}
      <section className="border-b border-white/10 bg-[#010409] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Why choose us
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-snow sm:text-3xl">
              Why SkillStack is the best SEO company in Pakistan.
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {whyItems.map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.07}>
                <div className="flex gap-5">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                  <div>
                    <h3 className="font-semibold text-snow">{item.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {item.body}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About the Founder */}
      <section className="border-b border-white/10 bg-[#0d1117] py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Our founder
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-snow sm:text-4xl">
              Mansoor Khan — best SEO freelancer in Gilgit-Baltistan.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-muted">
              Mansoor Khan is the CEO and founder of SkillStack. He started as
              Gilgit-Baltistan&apos;s best SEO freelancer — independently
              delivering keyword research, Google ranking, and web development
              for clients before building a team around his craft. Today
              Mansoor leads SkillStack&apos;s operations, sets the technical SEO
              standards, and actively works with clients on strategy and growth.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              His philosophy: rank honestly, share what you know, and build
              people who can stand on their own. That ethos runs through every
              SkillStack project.
            </p>
            <div className="mt-6 flex gap-4">
              <Link
                href="/about"
                className="text-sm text-accent hover:underline"
              >
                Read more about us →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-white/10 bg-[#010409] py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-6 md:px-8">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              FAQ
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-snow sm:text-3xl">
              Frequently asked questions.
            </h2>
          </FadeIn>
          <div className="mt-10 space-y-8">
            {localFaqs.map((faq, i) => (
              <FadeIn key={faq.question} delay={i * 0.06}>
                <div className="border-l-2 border-accent/40 pl-5">
                  <h3 className="font-semibold text-snow">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {faq.answer}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        primary={{ href: "/contact", label: "Start your SEO project" }}
        secondary={{ href: "/pricing", label: "See packages" }}
      >
        Ready to rank? Get a free consultation from the best SEO company in
        Gilgit-Baltistan.
      </PageCTA>
    </PageShell>
  );
}
