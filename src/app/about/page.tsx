import type { Metadata } from "next";
import Image from "next/image";
import FadeIn from "@/components/FadeIn";
import JsonLd from "@/components/JsonLd";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import { aboutHighlights } from "@/lib/content";
import {
  SITE_URL,
  absoluteUrl,
  webPageJsonLd,
  pageOpenGraph,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "About | SkillStack Pakistan, Best SEO Company",
  description:
    "Meet SkillStack Private Limited and CEO Mansoor Khan — the best SEO company and SEO freelancer in Gilgit-Baltistan. Delivering keyword research, Google ranking, content writing, backlinks, and web development across Pakistan and internationally.",
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: pageOpenGraph({
    url: absoluteUrl("/about"),
    title: "About SkillStack — Gilgit-Baltistan, Pakistan & Worldwide",
    description:
      "Built in Gilgit-Baltistan. Serving Pakistan and international clients. Led by CEO Mansoor Khan.",
  }),
};

const facts = [
  { label: "Legal name", value: "SkillStack Private Limited" },
  { label: "Base", value: "Gilgit-Baltistan, Pakistan" },
  { label: "Focus", value: "SEO, ranking, content & web" },
  { label: "Reach", value: "Pakistan & international" },
];

export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/about",
            title: "About SkillStack",
            description:
              "Meet SkillStack Private Limited and CEO Mansoor Khan — web development and SEO for Pakistan and the world.",
            type: "AboutPage",
          }),
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            mainEntity: { "@id": `${SITE_URL}/#mansoor-khan` },
            url: absoluteUrl("/about"),
          },
        ]}
      />
      <PageHero
        eyebrow="About us"
        title="Built in Gilgit-Baltistan. Aimed across Pakistan and beyond."
        lead="SkillStack Private Limited helps clients turn domains into ranking, readable sites — with transparent craft from our base in Gilgit-Baltistan."
        breadcrumbs={[{ label: "About" }]}
      />

      <div className="relative overflow-hidden border-b border-white/10 bg-[#010409]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_20%,rgba(45,212,191,0.08),transparent_55%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:px-8 md:py-20">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Our story
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-snow sm:text-4xl">
              From freelance craft to a company that ranks and earns.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-muted">
              SkillStack grew from focused freelance work — websites, SEO ranking,
              keyword systems, and ad-driven traffic sites — into a company led by{" "}
              <span className="font-semibold text-snow">Mansoor Khan</span>, CEO.
              What started as shipping reliable ranking projects is now a structured
              practice serving clients nationwide and internationally.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Independence through knowledge is core to how we hire and operate.
              Mansoor transfers what he knows to the team, and everyone is expected to
              research, test, and stay current with Google’s policies and updates —
              because our livelihoods sit on search.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            {/* Studio-style founder portrait */}
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/60 md:min-h-[520px]">
              {/* Photo */}
              <Image
                src="/mansoor-khan.webp"
                alt="Mansoor Khan — CEO, SkillStack Private Limited"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                quality={100}
                className="object-cover"
                style={{
                  objectPosition: "center 30%",
                  filter: "contrast(1.1) brightness(0.9) saturate(1.08)",
                }}
                priority
              />

              {/* Vignette — gives studio depth */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.55) 100%)",
                }}
              />

              {/* Top teal accent line */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-accent via-accent/60 to-transparent"
              />

              {/* Bottom gradient + quote */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/5"
                style={{
                  background:
                    "linear-gradient(to top, rgba(1,4,9,0.97) 0%, rgba(1,4,9,0.7) 60%, transparent 100%)",
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                <blockquote className="font-display text-base font-medium leading-snug tracking-tight text-snow sm:text-lg">
                  &ldquo;Rank honestly. Share what you learn. Build people who
                  can stand on their own.&rdquo;
                </blockquote>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-accent">
                  Mansoor Khan &mdash; CEO, SkillStack Private Limited
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="bg-[#0d1117] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              What drives us
            </p>
            <h2 className="font-display mt-2 max-w-xl text-2xl font-bold tracking-tight text-snow sm:text-3xl">
              Principles we ship with.
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {aboutHighlights.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.05}>
                <div className="h-full border border-white/10 bg-[#010409]/50 px-6 py-6 transition-colors hover:border-accent/30">
                  <div className="h-px w-10 bg-accent" aria-hidden />
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-snow">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="mt-14 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((row) => (
              <div key={row.label}>
                <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                  {row.label}
                </p>
                <p className="mt-2 font-medium text-snow">{row.value}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </div>

      <PageCTA
        tone="elevated"
        primary={{ href: "/contact", label: "Contact SkillStack" }}
        secondary={{ href: "/services", label: "Explore services" }}
      >
        Want to work with us — or join the team learning culture?
      </PageCTA>
    </PageShell>
  );
}
