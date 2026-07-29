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

function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);
  return mobile;
}

export default function ReasonsMarquee() {
  const reduceMotion = useReducedMotion();
  const mobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

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

  if (reduceMotion) {
    return (
      <ul className="mx-auto mt-8 grid max-w-6xl gap-3 px-4 sm:mt-10 sm:grid-cols-2 sm:gap-4 sm:px-6 md:px-8 lg:grid-cols-4">
        {reasons.map((reason) => (
          <li
            key={reason.n}
            className="rounded-lg border border-white/10 bg-gradient-to-br from-[#161b22] to-[#0d1117] px-4 py-5 sm:px-5 sm:py-6"
          >
            <span className="font-display text-sm tabular-nums text-accent">
              {reason.n}
            </span>
            <h3 className="mt-2 text-base font-semibold text-snow sm:mt-3 sm:text-lg">
              {reason.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {reason.body}
            </p>
          </li>
        ))}
      </ul>
    );
  }

  const unit = mobile ? 70 : 85;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${reasons.length * unit}vh` }}
    >
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col justify-start overflow-hidden pt-6 sm:top-24 sm:h-[calc(100svh-5rem)] sm:justify-center sm:pt-0">
        <div className="relative mx-auto h-[210px] w-full max-w-2xl px-4 sm:h-[280px] sm:px-6 md:px-8">
          {reasons.map((reason, i) => (
            <ReasonCard
              key={reason.n}
              reason={reason}
              index={i}
              active={active}
              progress={smooth}
              total={reasons.length}
              mobile={mobile}
            />
          ))}
        </div>

        <div className="mx-auto mt-5 flex w-full max-w-2xl flex-wrap items-center gap-2 px-4 sm:mt-8 sm:gap-3 sm:px-6 md:px-8">
          <ol className="flex gap-1.5 sm:gap-2" aria-label="Why choose us progress">
            {reasons.map((r, i) => (
              <li
                key={r.n}
                className={`h-1.5 w-6 rounded-full transition-colors duration-300 sm:w-8 ${
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
  mobile,
}: {
  reason: (typeof reasons)[number];
  index: number;
  active: number;
  progress: MotionValue<number>;
  total: number;
  mobile: boolean;
}) {
  const segment = 1 / Math.max(1, total - 1);
  const center = index * segment;

  const y = useTransform(
    progress,
    [center - segment, center, center + segment],
    [mobile ? 40 : 72, 0, mobile ? -28 : -48],
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
    [mobile ? 3 : 6, 0, 2],
  );
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  const isActive = index === active;
  const isPast = index < active;

  return (
    <motion.article
      className="absolute inset-x-0 top-0 rounded-lg border bg-gradient-to-br from-[#161b22] to-[#0d1117] px-4 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:inset-x-0 sm:px-8 sm:py-9"
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
      <h3 className="font-display mt-3 text-lg font-bold tracking-tight text-snow sm:mt-4 sm:text-3xl">
        {reason.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:mt-3 sm:text-base">
        {reason.body}
      </p>
    </motion.article>
  );
}
