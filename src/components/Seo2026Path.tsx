"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const oldStack = [
  { label: "#1 on Google", sub: "The dream", top: true },
  { label: "Clicks", sub: "Traffic" },
  { label: "Rankings", sub: "SERP position" },
  { label: "Content", sub: "Blog posts" },
  { label: "Backlinks", sub: "Link building" },
  { label: "Keywords", sub: "Research" },
];

const newStack = [
  { label: "Cited AND Ranked", sub: "Goal achieved", accent: true },
  { label: "Brand Mentions", sub: "Real-world signals" },
  { label: "Earn Citations", sub: "AI trust signals" },
  { label: "ChatGPT · Perplexity · Gemini", sub: "AI assistants" },
  { label: "Optimise for AEO", sub: "Answer Engine" },
  { label: "Structure for AI", sub: "Schema & entities" },
  { label: "AI Overviews Appear", sub: "Google AIO" },
  { label: "Strong SEO Foundations", sub: "Technical health" },
];

type Card = { label: string; sub: string; top?: boolean; accent?: boolean };

function CardStack({
  cards,
  variant,
}: {
  cards: Card[];
  variant: "old" | "new";
}) {
  const reduceMotion = useReducedMotion();
  const [featured, setFeatured] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = window.setInterval(() => {
      setFeatured((i) => (i + 1) % cards.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [cards.length, paused, reduceMotion]);

  const isNew = variant === "new";
  const peek = 26;
  const pileTop = 96;
  const stackHeight = pileTop + (cards.length - 1) * peek + 72;

  return (
    <div
      className="relative mx-auto w-full max-w-[280px] sm:max-w-xs"
      style={{ perspective: "1100px", height: stackHeight }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(16deg) rotateZ(-4deg)",
        }}
      >
        {cards.map((card, i) => {
          const others = cards.map((_, idx) => idx).filter((idx) => idx !== featured);
          const packed = others.indexOf(i);
          const fromBottom =
            packed === -1 ? 0 : others.length - 1 - packed;
          const restY = fromBottom * peek + pileTop;
          const restX = fromBottom * 2;
          const restRot = fromBottom * 1.1 - 4;
          const isOut = !reduceMotion && featured === i;

          const cardBg = card.accent
            ? "from-[#0f2a20] to-[#071a12]"
            : card.top && !isNew
              ? "from-[#1a1a1a] to-[#111111]"
              : isNew
                ? "from-[#163040] to-[#0d1f2c]"
                : "from-[#1a1a1a] to-[#111111]";
          const cardBorder = isOut
            ? card.accent
              ? "border-accent/70"
              : isNew
                ? "border-sky-400/50"
                : "border-white/30"
            : card.accent
              ? "border-accent/40"
              : isNew
                ? "border-sky-500/20"
                : "border-white/10";
          const labelColor = card.accent
            ? "text-accent"
            : isOut
              ? "text-snow"
              : isNew
                ? "text-sky-100/85"
                : "text-white/70";

          return (
            <motion.button
              type="button"
              key={card.label}
              aria-label={card.label}
              onClick={() => setFeatured(i)}
              className={`absolute left-1/2 w-[92%] -translate-x-1/2 cursor-pointer rounded-xl border bg-gradient-to-br px-4 py-2.5 text-left shadow-[0_18px_40px_rgba(0,0,0,0.55)] ${cardBg} ${cardBorder}`}
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "center bottom",
              }}
              initial={false}
              animate={
                isOut
                  ? {
                      y: 14,
                      x: 0,
                      rotateZ: 0,
                      rotateX: -16,
                      scale: 1.07,
                      zIndex: 50,
                      opacity: 1,
                    }
                  : {
                      y: restY,
                      x: restX,
                      rotateZ: restRot,
                      rotateX: 0,
                      scale: 1 - fromBottom * 0.01,
                      zIndex: packed + 1,
                      opacity: 1,
                    }
              }
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
                mass: 0.7,
              }}
            >
              {isOut && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-xl"
                  style={{
                    background: isNew
                      ? "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(45,212,191,0.22), transparent 70%)"
                      : "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(255,255,255,0.08), transparent 70%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <span
                  className={`min-w-0 truncate font-display text-sm font-semibold tracking-tight ${labelColor}`}
                >
                  {card.label}
                </span>
                <span className="shrink-0 text-[10px] text-white/30">{card.sub}</span>
              </div>
              <div
                className={`relative mt-2 h-px w-full bg-gradient-to-r ${
                  card.accent || isOut
                    ? "from-accent/50"
                    : isNew
                      ? "from-sky-500/25"
                      : "from-white/10"
                } to-transparent`}
              />
            </motion.button>
          );
        })}
      </div>
      <div className="pointer-events-none absolute bottom-2 left-1/2 h-8 w-44 -translate-x-1/2 rounded-[100%] bg-accent/15 blur-2xl" />
    </div>
  );
}

export default function Seo2026Path() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-t border-white/10 bg-[#010409] py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
            SEO in 2026
          </p>
          <h2 className="font-display mx-auto mt-3 max-w-2xl text-2xl font-bold tracking-tight text-snow sm:text-4xl md:text-5xl">
            SEO looks different today.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
            The old linear path no longer works alone. In 2026, winning means ranking on Google{" "}
            <em>and</em> being cited by AI.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-20">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-8 text-center">
              <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/40">
                How Traditional SEO Works
              </span>
            </div>
            <CardStack cards={oldStack} variant="old" />
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="mb-8 text-center">
              <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                How it actually works in 2026
              </span>
            </div>
            <CardStack cards={newStack} variant="new" />
          </motion.div>
        </div>

        <motion.div
          className="mt-14 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-5"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/seo-2026"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Read the full 2026 SEO guide →
          </Link>
          <Link
            href="/services"
            className="text-sm font-medium text-ink-muted hover:text-accent"
          >
            See how SkillStack covers every step
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
