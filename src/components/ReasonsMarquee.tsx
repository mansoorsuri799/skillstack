"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
  const [mobile, setMobile] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);
  return mobile;
}

function MobileReasonsList() {
  return (
    <ul className="mx-auto mt-6 max-w-6xl space-y-0 px-4 sm:px-6">
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
  );
}

export default function ReasonsMarquee() {
  const reduceMotion = useReducedMotion();
  const mobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  useMotionValueEvent(smooth, "change", (v) => {
    const next = Math.min(
      reasons.length - 1,
      Math.max(0, Math.round(v * (reasons.length - 1))),
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  if (!ready || mobile || reduceMotion) {
    return <MobileReasonsList />;
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${reasons.length * 75}vh` }}
    >
      <div className="sticky top-24 flex h-[calc(100svh-6rem)] flex-col justify-center overflow-hidden">
        <div className="relative mx-auto h-[260px] w-full max-w-2xl px-6 md:px-8">
          {reasons.map((reason, i) => (
            <ReasonCard
              key={reason.n}
              reason={reason}
              index={i}
              active={active}
              progress={smooth}
              total={reasons.length}
            />
          ))}
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-3 px-6 md:px-8">
          <ol className="flex gap-2" aria-label="Why choose us progress">
            {reasons.map((r, i) => (
              <li
                key={r.n}
                className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
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
  );
}

function ReasonCard({
  reason,
  index,
  active,
  progress,
  total,
}: {
  reason: (typeof reasons)[number];
  index: number;
  active: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const segment = 1 / Math.max(1, total - 1);
  const center = index * segment;

  const y = useTransform(
    progress,
    [center - segment, center, center + segment],
    [56, 0, -40],
  );
  const scale = useTransform(
    progress,
    [center - segment, center, center + segment],
    [0.92, 1, 0.94],
  );
  const opacity = useTransform(
    progress,
    [center - segment * 0.85, center, center + segment * 0.85],
    [0, 1, 0.2],
  );
  const blur = useTransform(
    progress,
    [center - segment, center, center + segment],
    [4, 0, 2],
  );
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  const isActive = index === active;
  const isPast = index < active;

  return (
    <motion.article
      className="absolute inset-x-0 top-0 rounded-lg border bg-gradient-to-br from-[#161b22] to-[#0d1117] px-8 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
      style={{
        y,
        scale,
        opacity,
        filter,
        zIndex: isActive ? 30 : isPast ? 10 + index : 5,
        borderColor: isActive
          ? "rgba(45, 212, 191, 0.45)"
          : "rgba(255, 255, 255, 0.1)",
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-sm tabular-nums text-accent">
          {reason.n}
        </span>
        <span
          className={`mt-1 h-2 w-2 rounded-full transition-colors ${
            isActive ? "bg-accent" : "bg-white/20"
          }`}
          aria-hidden
        />
      </div>
      <h3 className="font-display mt-4 text-2xl font-bold tracking-tight text-snow md:text-3xl">
        {reason.title}
      </h3>
      <p className="mt-3 text-base leading-relaxed text-ink-muted">
        {reason.body}
      </p>
    </motion.article>
  );
}
