import Link from "next/link";
import type { Service } from "@/lib/services";
import { services, teamCollaborationNote } from "@/lib/services";
import FadeIn from "./FadeIn";

export default function ServiceGuide({ service }: { service: Service }) {
  const idx = services.findIndex((s) => s.slug === service.slug);
  const prev = idx > 0 ? services[idx - 1] : null;
  const next = idx >= 0 && idx < services.length - 1 ? services[idx + 1] : null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-14 md:px-8 md:py-20">
      <FadeIn>
        <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
          {service.guide.intro}
        </p>
      </FadeIn>

      <div className="mt-12 space-y-12 md:mt-16 md:space-y-14">
        {service.guide.sections.map((section, i) => (
          <FadeIn key={section.title} delay={Math.min(i, 4) * 0.04}>
            <section>
              <p className="font-display text-xs tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-snow sm:text-3xl">
                {section.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                {section.body}
              </p>
              {section.bullets?.length ? (
                <ul className="mt-6 space-y-3">
                  {section.bullets.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-snow/85 sm:text-base"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </FadeIn>
        ))}
      </div>

      <FadeIn>
        <div className="mt-14 rounded-lg border border-white/10 bg-[#0d1117] p-6 sm:p-8">
          <div className="h-px w-10 bg-accent" aria-hidden />
          <p className="mt-5 text-base leading-relaxed text-snow/90">
            {service.guide.closing}
          </p>
          <p className="mt-5 text-sm leading-relaxed text-ink-muted">
            {teamCollaborationNote}
          </p>
        </div>
      </FadeIn>

      <nav
        aria-label="Other services"
        className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between"
      >
        {prev ? (
          <Link
            href={`/services/${prev.slug}`}
            className="group text-sm text-ink-muted transition-colors hover:text-accent"
          >
            <span className="block text-xs uppercase tracking-[0.14em] text-ink-muted/80">
              Previous
            </span>
            <span className="mt-1 inline-block font-medium text-snow group-hover:text-accent">
              ← {prev.shortTitle}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/services/${next.slug}`}
            className="group text-left text-sm text-ink-muted transition-colors hover:text-accent sm:text-right"
          >
            <span className="block text-xs uppercase tracking-[0.14em] text-ink-muted/80">
              Next
            </span>
            <span className="mt-1 inline-block font-medium text-snow group-hover:text-accent">
              {next.shortTitle} →
            </span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
