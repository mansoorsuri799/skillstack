import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Keyword research, websites, SEO content, monetization, keyword packages, and backlinking from SkillStack Private Limited.",
};

export default function ServicesPage() {
  return (
    <PageShell>
      <div className="border-b border-white/10 bg-[#0d1117] pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Services
            </p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-bold tracking-tight text-snow sm:text-5xl">
              Services that take you from research to revenue.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              One team for research, build, content, authority, and ads — so
              strategy never gets lost between freelancers. Pick a service or
              combine them into a full stack engagement.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-16 md:px-8 md:py-24">
        {services.map((service, i) => (
          <FadeIn key={service.n} delay={i * 0.04}>
            <article className="grid gap-6 border-t border-white/10 pt-10 md:grid-cols-[180px_1fr] md:gap-12">
              <div>
                <p className="font-display text-sm text-ink-muted">{service.n}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-snow md:text-2xl">
                  {service.title}
                </h2>
              </div>
              <div>
                <p className="text-base leading-relaxed text-ink-muted">
                  {service.summary}
                </p>
                <ul className="mt-6 space-y-3">
                  {service.details.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 text-sm leading-relaxed text-snow/80"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>

      <div className="border-t border-white/10 bg-[#0d1117] py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p className="max-w-lg text-lg text-snow">
            Not sure where to start? We’ll map the right mix for your niche.
          </p>
          <Link
            href="/contact"
            className="inline-flex w-fit rounded-md bg-accent px-6 py-3 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
