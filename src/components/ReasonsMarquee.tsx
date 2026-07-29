"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useRef, useState, useSyncExternalStore } from "react";
import FadeIn from "./FadeIn";

const reasons = [
  {
    n: "01",
    title: "One team, full stack",
    body: "Build, SEO, links, and monetization in one place — strategy never gets lost between freelancers.",
  },
  {
    n: "02",
    title: "Google-first craft",
    body: "We track policy updates and search changes so rankings stay honest and durable.",
  },
  {
    n: "03",
    title: "National & international",
    body: "Delivery for clients across Pakistan and beyond borders.",
  },
  {
    n: "04",
    title: "Knowledge that sticks",
    body: "We transfer what we know so your team can grow independent, not dependent.",
  },
];

function useIsMobile(breakpoint = 768) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(`(max-width: ${breakpoint}px)`).matches,
    () => true,
  );
}

function SectionIntro() {
  return (
    <>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
        Why choose us
      </p>
      <h2 className="font-display mt-2 max-w-xl text-xl font-bold tracking-tight text-snow sm:mt-3 sm:text-3xl">
        Why clients stay with SkillStack.
      </h2>
    </>
  );
}

function ReasonFace({
  reason,
  depth = 0,
}: {
  reason: (typeof reasons)[number];
  depth?: number;
}) {
  return (
    <article
      className="h-full w-full rounded-lg border bg-gradient-to-br from-[#161b22] to-[#0d1117] px-7 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:px-8 md:py-9"
      style={{
        borderColor:
          depth === 0
            ? "rgba(45, 212, 191, 0.45)"
            : "rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-sm tabular-nums text-accent">
          {reason.n}
        </span>
        <span
          className={`mt-1 h-2 w-2 rounded-full ${
            depth === 0 ? "bg-accent" : "bg-white/20"
          }`}
          aria-hidden
        />
      </div>
      <h3 className="font-display mt-4 text-xl font-bold tracking-tight text-snow md:text-3xl">
        {reason.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted md:text-lg">
        {reason.body}
      </p>
    </article>
  );
}

function MobileReasonsList() {
  return (
    <div className="border-t border-white/10 px-4 py-10 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <SectionIntro />
        </FadeIn>
        <ul className="mt-6 space-y-0">
          {reasons.map((reason, i) => (
            <FadeIn key={reason.n} delay={i * 0.05}>
              <li className="border-t border-white/10 py-5">
                <span className="font-display text-xs tabular-nums text-accent">
                  {reason.n}
                </span>
                <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-snow">
                  {reason.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {reason.body}
                </p>
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Mounted only when the scroll target div is actually rendered. */
function ReasonsStackDesktop() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.35,
  });

  useMotionValueEvent(smooth, "change", (v) => {
    const next = Math.min(
      reasons.length - 1,
      Math.max(0, Math.round(v * (reasons.length - 1))),
    );
    setActive((prev) => {
      if (prev === next) return prev;
      setDirection(next > prev ? 1 : -1);
      return next;
    });
  });

  const behind = reasons
    .slice(active + 1, active + 3)
    .map((reason, i) => ({ reason, depth: i + 1 }));

  return (
    <div
      ref={containerRef}
      className="relative border-t border-white/10"
      style={{ height: `${100 + (reasons.length - 1) * 55}vh` }}
    >
      <div className="sticky top-16 bg-[#0d1117] py-12 sm:top-[4.5rem] md:py-16">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <SectionIntro />

          <div
            className="relative mx-auto mt-10 h-[240px] max-w-2xl md:mt-12 md:h-[280px]"
            style={{ perspective: "1400px" }}
          >
            {behind
              .slice()
              .reverse()
              .map(({ reason, depth }) => (
                <div
                  key={`behind-${reason.n}`}
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    transform: `translateY(${depth * 14}px) scale(${1 - depth * 0.04})`,
                    opacity: 1 - depth * 0.22,
                    zIndex: 10 - depth,
                  }}
                >
                  <ReasonFace reason={reason} depth={depth} />
                </div>
              ))}

            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={reasons[active].n}
                custom={direction}
                className="absolute inset-0 origin-left"
                style={{ zIndex: 30, transformStyle: "preserve-3d" }}
                initial="enter"
                animate="center"
                exit="exit"
                variants={{
                  enter: (dir: number) => ({
                    rotateY: dir >= 0 ? 78 : -78,
                    x: dir >= 0 ? 40 : -40,
                    opacity: 0,
                    scale: 0.94,
                  }),
                  center: {
                    rotateY: 0,
                    x: 0,
                    opacity: 1,
                    scale: 1,
                  },
                  exit: (dir: number) => ({
                    rotateY: dir >= 0 ? -88 : 88,
                    x: dir >= 0 ? -56 : 56,
                    opacity: 0,
                    scale: 0.92,
                  }),
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  mass: 0.85,
                }}
              >
                <ReasonFace reason={reasons[active]} depth={0} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between gap-4 md:mt-10">
            <ol className="flex gap-2" aria-label="Why choose us progress">
              {reasons.map((r, i) => (
                <li
                  key={r.n}
                  className={`h-1.5 w-10 rounded-full transition-colors duration-300 ${
                    i === active ? "bg-accent" : "bg-white/15"
                  }`}
                />
              ))}
            </ol>
            <p className="font-display text-xs tabular-nums text-ink-muted">
              {reasons[active].n} / 0{reasons.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReasonsMarquee() {
  const reduceMotion = useReducedMotion();
  const mobile = useIsMobile();

  if (mobile || reduceMotion) {
    return <MobileReasonsList />;
  }

  return <ReasonsStackDesktop />;
}
