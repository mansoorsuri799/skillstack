"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

type Step = {
  n: string;
  title: string;
  body: string;
  accent: string;
  final?: boolean;
};

const accentMap: Record<string, { border: string; num: string; title: string; bar: string }> = {
  emerald: { border: "border-emerald-500/30", num: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400", title: "text-snow", bar: "from-emerald-500/40" },
  sky:     { border: "border-sky-500/30",     num: "border-sky-500/40 bg-sky-500/10 text-sky-400",           title: "text-snow", bar: "from-sky-500/40" },
  slate:   { border: "border-white/15",        num: "border-white/20 bg-white/5 text-white/60",               title: "text-snow", bar: "from-white/20" },
  teal:    { border: "border-teal-500/30",    num: "border-teal-500/40 bg-teal-500/10 text-teal-400",        title: "text-snow", bar: "from-teal-500/40" },
  violet:  { border: "border-violet-500/30",  num: "border-violet-500/40 bg-violet-500/10 text-violet-400",  title: "text-snow", bar: "from-violet-500/40" },
  amber:   { border: "border-amber-500/30",   num: "border-amber-500/40 bg-amber-500/10 text-amber-400",     title: "text-snow", bar: "from-amber-500/40" },
  rose:    { border: "border-rose-500/30",    num: "border-rose-500/40 bg-rose-500/10 text-rose-400",        title: "text-snow", bar: "from-rose-500/40" },
  accent:  { border: "border-accent/50",      num: "border-accent/60 bg-accent/15 text-accent",              title: "text-accent", bar: "from-accent/50" },
};

function CardSlide({
  step,
  index,
  total,
  scrollYProgress,
}: {
  step: Step;
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const slot = 1 / total;
  const start = index * slot;
  const end = start + slot;
  const inPoint = start + slot * 0.08;
  const outPoint = end - slot * 0.08;

  const x = useTransform(
    scrollYProgress,
    [start, inPoint, outPoint, end],
    ["110%", "0%", "0%", "-110%"]
  );
  const opacity = useTransform(
    scrollYProgress,
    [start, inPoint, outPoint, end],
    [0, 1, 1, 0]
  );

  const c = accentMap[step.accent] ?? accentMap.slate;

  return (
    <motion.div
      style={{ x, opacity }}
      className="absolute inset-0 flex items-center justify-center px-4 sm:px-8"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border bg-white/[0.03] p-7 shadow-2xl backdrop-blur-sm sm:p-10 ${c.border} ${step.final ? "ring-1 ring-accent/30" : ""}`}
      >
        {/* Step number */}
        <div className="mb-5 flex items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${c.num}`}>
            {step.n}
          </span>
          {step.final && (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
              Goal
            </span>
          )}
        </div>

        <h3 className={`font-display text-2xl font-bold tracking-tight sm:text-3xl ${c.title}`}>
          {step.title}
        </h3>
        <div className={`mt-4 h-px w-full bg-gradient-to-r ${c.bar} to-transparent`} />
        <p className="mt-5 text-sm leading-relaxed text-ink-muted sm:text-base">
          {step.body}
        </p>
      </div>
    </motion.div>
  );
}

function CounterLabel({
  label,
  index,
  total,
  scrollYProgress,
}: {
  label: string;
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const slot = 1 / total;
  const opacity = useTransform(
    scrollYProgress,
    [index * slot, index * slot + slot * 0.1, (index + 1) * slot - slot * 0.1, (index + 1) * slot],
    [0, 1, 1, 0]
  );
  return (
    <motion.span style={{ opacity }} className="absolute inset-0 flex items-center justify-end text-white/30">
      {label}
    </motion.span>
  );
}

function ScrollHint({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const opacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  return (
    <motion.p style={{ opacity }} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/25">
      scroll to continue ↓
    </motion.p>
  );
}

/* Reduced-motion fallback: plain stacked list */
function StaticList({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-6 py-8">
      {steps.map((step) => {
        const c = accentMap[step.accent] ?? accentMap.slate;
        return (
          <div
            key={step.n}
            className={`rounded-xl border bg-white/[0.025] p-6 sm:p-8 ${c.border}`}
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${c.num}`}>
                {step.n}
              </span>
              <h3 className={`font-display text-base font-bold sm:text-xl ${c.title}`}>{step.title}</h3>
            </div>
            <div className={`mt-3 h-px w-full bg-gradient-to-r ${c.bar} to-transparent`} />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">{step.body}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function StepCards({ steps }: { steps: Step[] }) {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (reduceMotion) return <StaticList steps={steps} />;

  /* Each card gets 100vh of scroll space; total height = steps.length × 100vh */
  const totalVh = steps.length * 100;

  return (
    <div ref={containerRef} style={{ height: `${totalVh}vh` }} className="relative">
      {/* Progress bar */}
      <motion.div
        className="fixed left-0 top-0 z-50 h-0.5 bg-accent origin-left"
        style={{ scaleX: scrollYProgress, width: "100%" }}
      />

      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#010409]">
        {/* Step counter */}
        <div className="absolute top-6 right-6 z-10 font-display text-xs tabular-nums sm:top-8 sm:right-8 sm:text-sm">
          {steps.map((step, i) => (
            <CounterLabel
              key={step.n}
              label={`${step.n} / ${String(steps.length).padStart(2, "0")}`}
              index={i}
              total={steps.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* Cards */}
        {steps.map((step, i) => (
          <CardSlide
            key={step.n}
            step={step}
            index={i}
            total={steps.length}
            scrollYProgress={scrollYProgress}
          />
        ))}

        {/* Scroll hint */}
        <ScrollHint scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}
