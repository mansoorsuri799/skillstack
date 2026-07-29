"use client";

import { motion, useReducedMotion } from "framer-motion";
import JumpingDot from "./JumpingDot";
import SkillAmalgamation from "./SkillAmalgamation";

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.12 },
    },
  };

  const item = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#010409]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(45,212,191,0.1),transparent_55%),radial-gradient(ellipse_60%_40%_at_10%_80%,rgba(56,100,140,0.12),transparent_50%)]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-8 px-4 pb-16 pt-24 sm:gap-12 sm:px-6 sm:py-28 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-xl"
        >
          <motion.div
            variants={item}
            className="relative inline-block overflow-visible pr-3 sm:pr-4"
          >
            <p className="font-display text-4xl font-bold leading-none tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              SkillStack
            </p>
            <JumpingDot />
          </motion.div>
          <motion.h1
            variants={item}
            className="mt-4 max-w-xl text-xl font-medium leading-snug tracking-tight text-white/90 sm:mt-5 sm:text-3xl"
          >
            From keyword to Google&apos;s first page — websites built to rank and
            earn.
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:mt-5 sm:text-lg"
          >
            Web development, SEO content, and monetization — built for clients
            across Pakistan and worldwide.
          </motion.p>
          <motion.div
            variants={item}
            className="mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
          >
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-[#010409] transition-colors hover:bg-accent-deep sm:px-6"
            >
              Talk to Mansoor
            </a>
            <a
              href="/services"
              className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 transition-colors hover:border-white/40 hover:bg-white/10 sm:px-6"
            >
              See services
            </a>
          </motion.div>
        </motion.div>

        <SkillAmalgamation />
      </div>
    </section>
  );
}
