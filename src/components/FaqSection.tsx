"use client";

import { useState } from "react";
import FadeIn from "@/components/FadeIn";
import { siteFaqs } from "@/lib/seo";

export default function FaqSection({
  title = "Questions people ask about SkillStack",
  eyebrow = "FAQ",
}: {
  title?: string;
  eyebrow?: string;
}) {
  const [open, setOpen] = useState(0);

  return (
    <section className="border-t border-white/10 bg-[#0d1117] py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
            {eyebrow}
          </p>
          <h2 className="font-display mt-2 max-w-2xl text-2xl font-bold tracking-tight text-snow sm:text-3xl md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Straight answers for search, answer engines, and anyone comparing SEO
            or web partners — including people looking up SkillStack by name.
          </p>
        </FadeIn>

        <div className="mt-8 divide-y divide-white/10 border-y border-white/10 md:mt-10">
          {siteFaqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <FadeIn key={faq.question} delay={Math.min(i, 4) * 0.04}>
                <div>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-4 py-5 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span className="font-medium text-snow sm:text-lg">
                      {faq.question}
                    </span>
                    <span
                      className={`mt-1 shrink-0 font-display text-accent transition-transform ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                  {isOpen ? (
                    <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-muted sm:text-base">
                      {faq.answer}
                    </p>
                  ) : null}
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
