"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

const D = { gap: 38, offset: 20, tilt: 10, height: 380 };
const M = { gap: 28, offset: 12, tilt: 7, height: 290 };

function useCompact(bp = 640) {
  const [compact, setCompact] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [bp]);
  return compact;
}

function CardStack({
  cards,
  variant,
}: {
  cards: { label: string; sub: string; top?: boolean; accent?: boolean }[];
  variant: "old" | "new";
}) {
  const reduceMotion = useReducedMotion();
  const compact = useCompact();
  const m = compact ? M : D;
  const [hovered, setHovered] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto w-full max-w-xs touch-pan-y"
      style={{ perspective: "900px", height: m.height }}
      onPointerMove={(e) => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const hit = el?.closest<HTMLElement>("[data-hit]");
        if (!hit || !rootRef.current?.contains(hit)) return;
        const n = Number(hit.dataset.hit);
        if (!isNaN(n)) setHovered(n);
      }}
      onPointerLeave={() => setHovered(null)}
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", transform: `rotateX(${m.tilt}deg)` }}
      >
        {cards.map((card, i) => {
          const fromBottom = cards.length - 1 - i;
          const yRest = fromBottom * m.gap + m.offset;
          const isHov = hovered === i;
          let yOff = 0;
          if (hovered !== null && !reduceMotion) {
            if (i < hovered) yOff = compact ? 12 : 18;
            else if (i > hovered) yOff = compact ? -12 : -18;
            else yOff = compact ? -10 : -14;
          }

          const isNew = variant === "new";
          const isOld = variant === "old";

          const cardBg = card.accent
            ? "from-[#0f2a20] to-[#071a12]"
            : card.top && isOld
              ? "from-[#1a1a1a] to-[#111111]"
              : isNew
                ? "from-[#163040] to-[#0d1f2c]"
                : "from-[#1a1a1a] to-[#111111]";
          const cardBorder = card.accent
            ? "border-accent/50"
            : isHov
              ? "border-white/25"
              : isOld
                ? "border-white/8"
                : "border-sky-500/20";
          const labelColor = card.accent
            ? "text-accent"
            : card.top && isOld
              ? "text-white/40"
              : isOld
                ? "text-white/30"
                : "text-sky-100/85";

          const idle = !reduceMotion && hovered === null;
          const bob = compact ? 5 : 8;
          const animate = idle
            ? { y: [yRest, yRest - bob, yRest, yRest - bob * 0.5, yRest], opacity: 1, scale: [1, 1.015, 1, 1, 1], rotateX: 0 }
            : { y: yRest + yOff, opacity: 1, scale: isHov && !reduceMotion ? (compact ? 1.03 : 1.05) : 1, rotateX: isHov && !reduceMotion ? -m.tilt : 0 };

          return (
            <motion.div
              key={card.label}
              className={`pointer-events-none absolute left-1/2 w-[92%] -translate-x-1/2 rounded-lg border bg-gradient-to-br px-3 py-2.5 shadow-[0_10px_32px_rgba(0,0,0,0.5)] sm:px-4 sm:py-3 ${cardBg} ${cardBorder}`}
              style={{ zIndex: isHov ? 40 : i + 1, transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
              initial={reduceMotion ? { y: yRest, opacity: 1, scale: 1, rotateX: 0 } : { y: yRest + 40, opacity: 0, scale: 0.94, rotateX: 0 }}
              animate={animate}
              transition={
                idle
                  ? { duration: 4.5, delay: i * 0.12, repeat: Infinity, repeatDelay: 1.6, ease: [0.22, 1, 0.36, 1], times: [0, 0.28, 0.42, 0.62, 1] }
                  : { type: "spring", stiffness: 340, damping: 24, mass: 0.5 }
              }
            >
              {card.accent && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,212,191,0.14), transparent 70%)" }}
                  animate={reduceMotion ? {} : { opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <div className="flex items-center justify-between gap-2">
                <span className={`min-w-0 truncate font-display text-[10px] font-semibold tracking-tight sm:text-sm ${labelColor}`}>
                  {card.label}
                </span>
                <span className="shrink-0 text-[9px] tabular-nums text-white/20 sm:text-[10px]">
                  {card.sub}
                </span>
              </div>
              <div className={`mt-1.5 h-px w-full bg-gradient-to-r ${card.accent ? "from-accent/50" : isOld ? "from-white/8" : "from-sky-500/25"} to-transparent`} />
            </motion.div>
          );
        })}

        {cards.map((card, i) => {
          const fromBottom = cards.length - 1 - i;
          const yRest = fromBottom * m.gap + m.offset;
          return (
            <div
              key={`hit-${card.label}`}
              data-hit={i}
              className="absolute left-1/2 w-[90%] -translate-x-1/2"
              style={{ top: 0, height: m.gap, transform: `translateY(${yRest}px)`, zIndex: 50 }}
            />
          );
        })}
      </div>
      <div className="pointer-events-none absolute bottom-1 left-1/2 h-6 w-36 -translate-x-1/2 rounded-[100%] bg-accent/10 blur-2xl" />
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
            The old linear path no longer works alone. In 2026, winning means ranking on Google <em>and</em> being cited by AI.
          </p>
        </motion.div>

        {/* Two stacks */}
        <div className="mt-16 grid grid-cols-1 gap-12 sm:gap-6 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* Old way */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 text-center">
              <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/40">
                How people think SEO works
              </span>
            </div>
            <CardStack cards={oldStack} variant="old" />
          </motion.div>

          {/* New way */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="mb-6 text-center">
              <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                How it actually works in 2026
              </span>
            </div>
            <CardStack cards={newStack} variant="new" />
          </motion.div>
        </div>

        {/* CTA */}
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
