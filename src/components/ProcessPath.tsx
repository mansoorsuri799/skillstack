"use client";

import { motion, useReducedMotion } from "framer-motion";
import { processSteps } from "@/lib/content";

export default function ProcessPath() {
  const reduceMotion = useReducedMotion();

  return (
    <ol className="relative mt-12 md:mt-16">
      {/* Desktop connector rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[22px] hidden h-px md:block"
      >
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-accent/80 via-accent/50 to-accent/20"
          initial={reduceMotion ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {processSteps.map((step, i) => (
          <motion.li
            key={step.n}
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.55,
              delay: reduceMotion ? 0 : i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Node on the path */}
            <div className="mb-5 flex items-center gap-3 md:mb-6 md:flex-col md:items-start md:gap-0">
              <motion.span
                className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-[#161b22] font-display text-sm font-semibold tabular-nums text-accent shadow-[0_0_0_4px_#161b22]"
                initial={reduceMotion ? false : { scale: 0.7 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 22,
                  delay: reduceMotion ? 0 : 0.15 + i * 0.12,
                }}
              >
                {i + 1}
              </motion.span>

              {/* Mobile vertical connector to next */}
              {i < processSteps.length - 1 ? (
                <span
                  aria-hidden
                  className="h-px flex-1 bg-gradient-to-r from-accent/50 to-white/10 md:hidden"
                />
              ) : null}
            </div>

            <div className="h-px w-10 bg-accent md:mt-1" aria-hidden />
            <h3 className="mt-3 text-lg font-semibold tracking-tight text-snow sm:text-xl">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">
              {step.summary}
            </p>
          </motion.li>
        ))}
      </div>
    </ol>
  );
}
