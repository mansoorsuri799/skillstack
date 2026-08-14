type Step = {
  n: string;
  title: string;
  body: string;
  accent: string;
  final?: boolean;
};

const accentMap: Record<string, { border: string; num: string; title: string; bar: string }> = {
  emerald: { border: "border-emerald-500/30", num: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400", title: "text-snow", bar: "from-emerald-500/40" },
  sky: { border: "border-sky-500/30", num: "border-sky-500/40 bg-sky-500/10 text-sky-400", title: "text-snow", bar: "from-sky-500/40" },
  slate: { border: "border-white/15", num: "border-white/20 bg-white/5 text-white/60", title: "text-snow", bar: "from-white/20" },
  teal: { border: "border-teal-500/30", num: "border-teal-500/40 bg-teal-500/10 text-teal-400", title: "text-snow", bar: "from-teal-500/40" },
  violet: { border: "border-violet-500/30", num: "border-violet-500/40 bg-violet-500/10 text-violet-400", title: "text-snow", bar: "from-violet-500/40" },
  amber: { border: "border-amber-500/30", num: "border-amber-500/40 bg-amber-500/10 text-amber-400", title: "text-snow", bar: "from-amber-500/40" },
  rose: { border: "border-rose-500/30", num: "border-rose-500/40 bg-rose-500/10 text-rose-400", title: "text-snow", bar: "from-rose-500/40" },
  accent: { border: "border-accent/50", num: "border-accent/60 bg-accent/15 text-accent", title: "text-accent", bar: "from-accent/50" },
};

export default function StepCards({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-6">
      {steps.map((step) => {
        const c = accentMap[step.accent] ?? accentMap.slate;
        return (
          <div
            key={step.n}
            className={`rounded-xl border bg-white/[0.025] p-6 sm:p-8 ${c.border} ${step.final ? "ring-1 ring-accent/25" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${c.num}`}
              >
                {step.n}
              </span>
              {step.final ? (
                <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                  Goal
                </span>
              ) : null}
              <h3 className={`font-display text-base font-bold tracking-tight sm:text-xl ${c.title}`}>
                {step.title}
              </h3>
            </div>
            <div className={`mt-3 h-px w-full bg-gradient-to-r ${c.bar} to-transparent`} />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
              {step.body}
            </p>
          </div>
        );
      })}
    </div>
  );
}
