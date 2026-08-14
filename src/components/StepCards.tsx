"use client";

import { motion, useReducedMotion } from "framer-motion";

type Step = {
  n: string;
  title: string;
  body: string;
  accent: string;
  final?: boolean;
};

const accentMap: Record<string, string> = {
  emerald: "border-emerald-500/30 text-emerald-400",
  sky: "border-sky-500/30 text-sky-400",
  slate: "border-white/15 text-white/60",
  teal: "border-teal-500/30 text-teal-400",
  violet: "border-violet-500/30 text-violet-400",
  amber: "border-amber-500/30 text-amber-400",
  rose: "border-rose-500/30 text-rose-400",
  accent: "border-accent/50 text-accent",
};

export default function StepCards({ steps }: { steps: Step[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-6">
      {steps.map((step, idx) => {
        const colors = accentMap[step.accent] ?? "border-white/15 text-white/60";
        const [borderCls, textCls] = colors.split(" ");

        /* 01-04 enter from the left, 05-08 from the right */
        const xStart = idx < 4 ? -60 : 60;

        return (
          <motion.div
            key={step.n}
            initial={reduceMotion ? false : { opacity: 0, x: xStart, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`rounded-xl border bg-white/[0.025] p-6 sm:p-8 ${borderCls} ${step.final ? "ring-1 ring-accent/25" : ""}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${
                  step.final
                    ? "border-accent/50 bg-accent/15 text-accent"
                    : `${borderCls} bg-white/5 ${textCls}`
                }`}
              >
                {step.n}
              </span>
              <h3
                className={`font-display text-base font-bold tracking-tight sm:text-xl ${
                  step.final ? "text-accent" : "text-snow"
                }`}
              >
                {step.title}
              </h3>
            </div>
            <div
              className={`mt-3 h-px w-full bg-gradient-to-r ${
                step.final ? "from-accent/40" : "from-white/10"
              } to-transparent`}
            />
            <p className="mt-4 text-sm leading-relaxed text-ink-muted sm:text-base">
              {step.body}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
