"use client";

import { useReducedMotion } from "framer-motion";

type Step = {
  n: string;
  title: string;
  body: string;
  accent: string;
  final?: boolean;
};

const accentMap: Record<string, { border: string; num: string; title: string; bar: string }> = {
  emerald: { border: "border-emerald-500/30", num: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400", title: "text-snow",   bar: "from-emerald-500/40" },
  sky:     { border: "border-sky-500/30",     num: "border-sky-500/40 bg-sky-500/10 text-sky-400",             title: "text-snow",   bar: "from-sky-500/40" },
  slate:   { border: "border-white/15",        num: "border-white/20 bg-white/5 text-white/60",                 title: "text-snow",   bar: "from-white/20" },
  teal:    { border: "border-teal-500/30",    num: "border-teal-500/40 bg-teal-500/10 text-teal-400",          title: "text-snow",   bar: "from-teal-500/40" },
  violet:  { border: "border-violet-500/30",  num: "border-violet-500/40 bg-violet-500/10 text-violet-400",    title: "text-snow",   bar: "from-violet-500/40" },
  amber:   { border: "border-amber-500/30",   num: "border-amber-500/40 bg-amber-500/10 text-amber-400",       title: "text-snow",   bar: "from-amber-500/40" },
  rose:    { border: "border-rose-500/30",    num: "border-rose-500/40 bg-rose-500/10 text-rose-400",          title: "text-snow",   bar: "from-rose-500/40" },
  accent:  { border: "border-accent/50",      num: "border-accent/60 bg-accent/15 text-accent",                title: "text-accent", bar: "from-accent/50" },
};

function StepCard({ step }: { step: Step }) {
  const c = accentMap[step.accent] ?? accentMap.slate;
  return (
    <div
      className={`flex-shrink-0 w-72 sm:w-80 rounded-xl border bg-white/[0.03] p-5 sm:p-6 backdrop-blur-sm transition-shadow hover:shadow-[0_0_32px_rgba(45,212,191,0.1)] ${c.border} ${step.final ? "ring-1 ring-accent/30" : ""}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums ${c.num}`}>
          {step.n}
        </span>
        {step.final && (
          <span className="text-[9px] font-semibold uppercase tracking-widest text-accent">Goal</span>
        )}
      </div>
      <h3 className={`font-display mt-3 text-sm font-bold leading-snug tracking-tight sm:text-base ${c.title}`}>
        {step.title}
      </h3>
      <div className={`mt-2.5 h-px w-full bg-gradient-to-r ${c.bar} to-transparent`} />
      <p className="mt-2.5 text-xs leading-relaxed text-ink-muted sm:text-sm">
        {step.body}
      </p>
    </div>
  );
}

function MarqueeRow({
  steps,
  direction,
}: {
  steps: Step[];
  direction: "left" | "right";
}) {
  /* Duplicate cards so the loop is seamless */
  const doubled = [...steps, ...steps];
  const trackClass = direction === "left" ? "marquee-track-left" : "marquee-track-right";

  return (
    <div className="marquee-row overflow-hidden" aria-label={`Step cards moving ${direction}`}>
      <div className={`flex gap-4 ${trackClass}`} style={{ width: "max-content" }}>
        {doubled.map((step, i) => (
          <StepCard key={`${step.n}-${i}`} step={step} />
        ))}
      </div>
    </div>
  );
}

/* Reduced-motion / static fallback */
function StaticGrid({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const c = accentMap[step.accent] ?? accentMap.slate;
        return (
          <div key={step.n} className={`rounded-xl border bg-white/[0.025] p-6 sm:p-8 ${c.border} ${step.final ? "ring-1 ring-accent/25" : ""}`}>
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

  if (reduceMotion) return <StaticGrid steps={steps} />;

  const topRow = steps.slice(0, 4);    // 01-04 → right to left
  const bottomRow = steps.slice(4, 8); // 05-08 → left to right

  return (
    <div className="space-y-4">
      <p className="text-[10px] text-white/25 text-center tracking-widest uppercase">Hover to pause · read each step</p>
      <MarqueeRow steps={topRow} direction="left" />
      <MarqueeRow steps={bottomRow} direction="right" />
    </div>
  );
}
