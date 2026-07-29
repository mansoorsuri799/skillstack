import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";
import { processSteps } from "@/lib/content";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How SkillStack takes projects from keyword research to build, ranking, and monetization.",
};

export default function ProcessPage() {
  return (
    <PageShell>
      <div className="border-b border-white/10 bg-[#161b22] pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Process
            </p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-bold tracking-tight text-snow sm:text-5xl">
              A straight path from research to revenue.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Four stages. Clear approvals. No mystery black-box SEO. Here’s
              exactly how a SkillStack engagement typically runs.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-14 px-6 py-16 md:px-8 md:py-24">
        {processSteps.map((step, i) => (
          <FadeIn key={step.n} delay={i * 0.05}>
            <article className="relative border-l border-accent/40 pl-8 md:pl-10">
              <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-2 border-accent bg-[#010409]" />
              <p className="font-display text-sm tabular-nums text-accent">
                Step {step.n}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-snow sm:text-3xl">
                {step.title}
              </h2>
              <p className="mt-3 max-w-2xl text-base text-ink-muted">
                {step.summary}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {step.details.map((line) => (
                  <li
                    key={line}
                    className="rounded-md border border-white/10 bg-[#0d1117] px-4 py-3 text-sm leading-relaxed text-snow/80"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </article>
          </FadeIn>
        ))}
      </div>

      <div className="border-t border-white/10 bg-[#0d1117] py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p className="max-w-lg text-lg text-snow">
            Ready to run this process on your niche or client site?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-snow hover:bg-white/5"
            >
              View services
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-md bg-accent px-5 py-3 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
            >
              Start a project
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
