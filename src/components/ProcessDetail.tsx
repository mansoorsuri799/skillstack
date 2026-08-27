"use client";

import { motion, useReducedMotion } from "framer-motion";
import { processSteps } from "@/lib/content";
import FadeIn from "./FadeIn";

export default function ProcessDetail() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-6 py-14 md:space-y-14 md:px-8 md:py-20">
      {processSteps.map((step, i) => (
        <FadeIn key={step.n} delay={reduceMotion ? 0 : i * 0.05}>
          <article
            id={`step-${i + 1}`}
            className="grid scroll-mt-28 gap-8 md:grid-cols-[minmax(0,200px)_1fr] md:gap-12"
          >
            <div className="md:sticky md:top-[5.5rem] md:self-start">
              <motion.span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-[#0d1117] font-display text-sm font-semibold tabular-nums text-accent"
                initial={reduceMotion ? false : { scale: 0.75, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                {i + 1}
              </motion.span>
              <p className="mt-4 font-display text-xs uppercase tracking-[0.16em] text-accent">
                Step {step.n}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-snow sm:text-3xl">
                {step.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                {step.summary}
              </p>
            </div>

            <ul className="relative space-y-0 border-l border-accent/30 pl-6 md:pl-8">
              {step.details.map((line, di) => (
                <li key={line} className="relative pb-6 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-accent bg-[#010409] md:-left-[39px]"
                  />
                  <p className="rounded-md border border-white/10 bg-[#0d1117] px-4 py-3.5 text-sm leading-relaxed text-snow/85">
                    <span className="mr-2 font-display text-xs tabular-nums text-ink-muted">
                      {String(di + 1).padStart(2, "0")}
                    </span>
                    {line}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </FadeIn>
      ))}
    </div>
  );
}
