"use client";

import Link from "next/link";
import FadeIn from "./FadeIn";
import ProcessMarquee from "./ProcessMarquee";
import ReasonsMarquee from "./ReasonsMarquee";
import ServicesScrollStack from "./ServicesScrollStack";

export default function HomeSections() {
  return (
    <>
      <section className="border-t border-white/10 bg-[#0d1117]">
        <ServicesScrollStack />

        <div className="border-t border-white/10 pt-12">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <FadeIn>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                Why choose us
              </p>
              <h2 className="font-display mt-3 max-w-xl text-2xl font-bold tracking-tight text-snow sm:text-3xl">
                Why clients stay with SkillStack.
              </h2>
            </FadeIn>
          </div>
          <ReasonsMarquee />
        </div>
        <div className="h-16 md:h-24" aria-hidden />
      </section>

      <section className="border-t border-white/10 bg-[#161b22] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Process
            </p>
            <h2 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight text-snow sm:text-5xl">
              A straight path from research to revenue.
            </h2>
            <Link
              href="/process"
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
            >
              See the full process →
            </Link>
          </FadeIn>
          <ProcessMarquee />
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0d1117] py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              About
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-snow sm:text-5xl">
              Built in Pakistan. Aimed beyond borders.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink-muted">
              SkillStack is led by{" "}
              <span className="font-semibold text-snow">Mansoor Khan</span>, CEO —
              growing from focused freelance craft into a company that serves
              clients nationwide and worldwide.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
            >
              More about us →
            </Link>
          </FadeIn>
          <FadeIn delay={0.12}>
            <aside className="flex h-full flex-col justify-end md:border-l md:border-white/10 md:pl-10">
              <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight text-snow sm:text-3xl">
                “Rank honestly. Share what you learn. Build people who can stand on
                their own.”
              </blockquote>
              <p className="mt-6 text-sm text-ink-muted">
                — Mansoor Khan, CEO · SkillStack Private Limited
              </p>
            </aside>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#010409] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Contact
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-snow sm:text-5xl">
              Ready to rank a keyword or ship a site?
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
              Tell us your niche, market, and goals — we&apos;ll map the next
              step.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-md bg-accent px-6 py-3 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
            >
              Contact us
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
