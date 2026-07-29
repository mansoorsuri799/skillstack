import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";
import { aboutHighlights } from "@/lib/content";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Meet SkillStack Private Limited and CEO Mansoor Khan — web development and SEO for Pakistan and the world.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <div className="border-b border-white/10 bg-[#0d1117] pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              About us
            </p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-bold tracking-tight text-snow sm:text-5xl">
              Built in Pakistan. Aimed beyond borders.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              SkillStack Private Limited helps clients turn domains into ranking,
              readable, and monetizable sites — with transparent craft and a team
              that keeps learning.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
          <FadeIn>
            <h2 className="font-display text-2xl font-bold tracking-tight text-snow sm:text-3xl">
              Our story
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              SkillStack grew from focused freelance work — websites, SEO
              blogging, keyword systems, and ad-driven traffic sites — into a
              company led by{" "}
              <span className="font-semibold text-snow">Mansoor Khan</span>, CEO.
              What started as shipping reliable ranking projects is now a
              structured practice serving clients nationwide and internationally.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Independence through knowledge is core to how we hire and operate.
              Mansoor transfers what he knows to the team, and everyone is
              expected to research, test, and stay current with Google’s policies
              and updates — because our livelihoods sit on search.
            </p>
            <blockquote className="font-display mt-10 border-l-2 border-accent pl-5 text-xl font-medium leading-snug text-snow sm:text-2xl">
              “Rank honestly. Share what you learn. Build people who can stand on
              their own.”
            </blockquote>
            <p className="mt-4 text-sm text-ink-muted">
              — Mansoor Khan, CEO · SkillStack Private Limited
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ul className="space-y-6">
              {aboutHighlights.map((item) => (
                <li
                  key={item.title}
                  className="border-t border-white/10 pt-5 first:border-t-0 first:pt-0"
                >
                  <h3 className="text-lg font-semibold text-snow">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        <FadeIn className="mt-20 grid gap-6 border-t border-white/10 pt-12 sm:grid-cols-3">
          {[
            { label: "Legal name", value: "SkillStack Private Limited" },
            { label: "Focus", value: "Web, SEO & digital growth" },
            { label: "Reach", value: "Pakistan & international" },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                {row.label}
              </p>
              <p className="mt-2 font-medium text-snow">{row.value}</p>
            </div>
          ))}
        </FadeIn>
      </div>

      <div className="border-t border-white/10 bg-[#161b22] py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p className="max-w-lg text-lg text-snow">
            Want to work with us — or join the team learning culture?
          </p>
          <Link
            href="/contact"
            className="inline-flex w-fit rounded-md bg-accent px-6 py-3 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Contact SkillStack
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
