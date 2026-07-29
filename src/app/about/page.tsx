import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import { aboutHighlights } from "@/lib/content";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Meet SkillStack Private Limited and CEO Mansoor Khan — web development and SEO for Pakistan and the world.",
};

const facts = [
  { label: "Legal name", value: "SkillStack Private Limited" },
  { label: "Focus", value: "Web, SEO & digital growth" },
  { label: "Reach", value: "Pakistan & international" },
];

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About us"
        title="Built in Pakistan. Aimed beyond borders."
        lead="SkillStack Private Limited helps clients turn domains into ranking, readable, and monetizable sites — with transparent craft and a team that keeps learning."
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
              SkillStack grew from focused freelance work — websites, SEO blogging,
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
            <aside className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-accent/25 bg-[#0d1117] p-7 md:p-8">
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent via-accent/40 to-transparent"
              />
              <blockquote className="font-display text-xl font-medium leading-snug tracking-tight text-snow sm:text-2xl md:text-3xl">
                “Rank honestly. Share what you learn. Build people who can stand on
                their own.”
              </blockquote>
              <p className="mt-8 text-sm text-ink-muted">
                — Mansoor Khan, CEO · SkillStack Private Limited
              </p>
            </aside>
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

          <FadeIn className="mt-14 grid gap-6 border-t border-white/10 pt-10 sm:grid-cols-3">
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
