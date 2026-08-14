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

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

function cardVariant(dir: "left" | "right") {
  return {
    hidden: { opacity: 0, x: dir === "left" ? -70 : 70 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.55, ease: "easeOut" as const },
    },
  };
}

export default function StepCards({ steps }: { steps: Step[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="space-y-6"
      variants={reduceMotion ? undefined : container}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
    >
      {steps.map((step, idx) => {
        const colors = accentMap[step.accent] ?? "border-white/15 text-white/60";
        const [borderCls, textCls] = colors.split(" ");
        const dir = idx < 4 ? "left" : "right";
        const variants = reduceMotion ? undefined : cardVariant(dir);

        return (
          <motion.div
            key={step.n}
            variants={variants}
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
    </motion.div>
  );
}
