"use client";

import { useReducedMotion } from "framer-motion";
import { processSteps } from "@/lib/content";

function StepCard({
  step,
  index,
}: {
  step: (typeof processSteps)[number];
  index: number;
}) {
  return (
    <li className="w-[220px] shrink-0 sm:w-[280px] md:w-[300px]">
      <div className="mb-3 h-px w-10 bg-accent sm:mb-4 sm:w-12" aria-hidden="true" />
      <p className="font-display text-3xl font-bold tabular-nums text-accent/30 sm:text-4xl">
        {index + 1}
      </p>
      <h3 className="mt-2 text-base font-semibold text-snow sm:text-lg">
        {step.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.summary}</p>
    </li>
  );
}

export default function ProcessMarquee() {
  const reduceMotion = useReducedMotion();
  const loop = [...processSteps, ...processSteps];

  if (reduceMotion) {
    return (
      <ol className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
        {processSteps.map((step, i) => (
          <StepCard key={step.n} step={step} index={i} />
        ))}
      </ol>
    );
  }

  return (
    <div className="process-marquee relative mt-10 -mx-4 overflow-hidden sm:mt-12 sm:-mx-6 md:-mx-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#161b22] to-transparent sm:w-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#161b22] to-transparent sm:w-20"
      />

      <ol
        className="process-marquee-track flex w-max gap-8 px-4 py-2 sm:gap-10 sm:px-6 md:gap-14 md:px-8"
        aria-label="Process steps"
      >
        {loop.map((step, i) => (
          <StepCard
            key={`${step.n}-${i}`}
            step={step}
            index={i % processSteps.length}
          />
        ))}
      </ol>
    </div>
  );
}
