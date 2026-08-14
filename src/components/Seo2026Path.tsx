"use client";

import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    n: "01",
    label: "Strong SEO Foundations",
    note: "Technical health, crawlability, Core Web Vitals",
    color: "from-[#1a3028] to-[#0f2018]",
    border: "border-emerald-500/30",
    text: "text-emerald-100/90",
    glow: "shadow-emerald-500/10",
  },
  {
    n: "02",
    label: "AI Overviews Appear",
    note: "Google AIO cites your content above the fold",
    color: "from-[#163040] to-[#0d1f2c]",
    border: "border-sky-500/30",
    text: "text-sky-100/90",
    glow: "shadow-sky-500/10",
  },
  {
    n: "03",
    label: "Structure for AI",
    note: "Schema, entity clarity, disambiguating data",
    color: "from-[#1c2433] to-[#111820]",
    border: "border-white/15",
    text: "text-white/85",
    glow: "shadow-white/5",
  },
  {
    n: "04",
    label: "Optimise for AEO",
    note: "Answer Engine Optimisation — speakable, FAQ, HowTo",
    color: "from-[#1a3a3a] to-[#0f2a2a]",
    border: "border-teal-500/30",
    text: "text-teal-100/90",
    glow: "shadow-teal-500/10",
  },
  {
    n: "05",
    label: "ChatGPT · Perplexity · Gemini",
    note: "AI assistants pull from indexed, cited sources",
    color: "from-[#2a1f3a] to-[#1a1228]",
    border: "border-violet-500/30",
    text: "text-violet-100/85",
    glow: "shadow-violet-500/10",
  },
  {
    n: "06",
    label: "Earn Citations",
    note: "High-authority mentions that AI systems trust",
    color: "from-[#2a2418] to-[#1a160e]",
    border: "border-amber-500/25",
    text: "text-amber-100/85",
    glow: "shadow-amber-500/10",
  },
  {
    n: "07",
    label: "Brand Mentions",
    note: "Real-world recognition that signals authority",
    color: "from-[#222833] to-[#141820]",
    border: "border-white/15",
    text: "text-white/80",
    glow: "shadow-white/5",
  },
  {
    n: "08",
    label: "Cited AND Ranked",
    note: "Top of Google + inside every AI answer",
    color: "from-[#0f2a20] to-[#071a12]",
    border: "border-accent/50",
    text: "text-accent",
    glow: "shadow-accent/20",
    final: true,
  },
];

export default function Seo2026Path() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-t border-white/10 bg-[#010409] py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
            SEO in 2026
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-2xl font-bold tracking-tight text-snow sm:text-4xl md:text-5xl">
            SEO looks different today.{" "}
            <span className="text-accent">We build for where it&apos;s going.</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
            Rankings still matter — but in 2026, being cited by AI answers is
            equally important. SkillStack covers every step of the new path.
          </p>
        </motion.div>

        {/* Path grid */}
        <div className="relative mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {/* Animated connector line — desktop only */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px lg:block"
            style={{
              background:
                "linear-gradient(to right, transparent 2%, rgba(45,212,191,0.35) 20%, rgba(45,212,191,0.35) 80%, transparent 98%)",
            }}
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
          {/* Second row connector */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 hidden h-px lg:block"
            style={{
              top: "calc(52px + 50% + 16px)",
              background:
                "linear-gradient(to left, transparent 2%, rgba(45,212,191,0.35) 20%, rgba(45,212,191,0.35) 80%, transparent 98%)",
            }}
            initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={reduceMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.55,
                delay: reduceMotion ? 0 : i * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={reduceMotion ? {} : { y: -4, scale: 1.02 }}
              className={`relative rounded-xl border bg-gradient-to-br p-4 shadow-xl sm:p-5 ${step.color} ${step.border} ${step.glow} ${step.final ? "ring-1 ring-accent/30" : ""}`}
            >
              {step.final && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{
                    background:
                      "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,212,191,0.12), transparent 70%)",
                  }}
                  animate={reduceMotion ? {} : { opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* Step number node */}
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tabular-nums ${
                    step.final
                      ? "border-accent/60 bg-accent/15 text-accent"
                      : "border-white/15 bg-white/5 text-white/50"
                  }`}
                >
                  {step.n}
                </span>
                {step.final && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
                    Goal
                  </span>
                )}
              </div>

              <p className={`font-display text-sm font-semibold leading-snug tracking-tight sm:text-base ${step.text}`}>
                {step.label}
              </p>
              <div className="mt-2 h-px w-full bg-gradient-to-r from-accent/30 to-transparent" />
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                {step.note}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.p
          className="mt-10 text-sm text-ink-muted"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Every SkillStack package covers steps 01–08 —{" "}
          <a href="/services" className="text-accent hover:underline">
            see how we do it →
          </a>
        </motion.p>
      </div>
    </section>
  );
}
