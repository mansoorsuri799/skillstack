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
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/content";

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

export default function ServicesScrollStack() {
  const reduceMotion = useReducedMotion();
  const mobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  });

  useMotionValueEvent(smoothProgress, "change", (v) => {
    const next = Math.min(
      services.length - 1,
      Math.max(0, Math.round(v * (services.length - 1))),
    );
    setActive((prev) => (prev === next ? prev : next));
  });

  if (reduceMotion) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
          Services
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-2xl font-bold tracking-tight text-snow sm:text-4xl md:text-5xl">
          Everything between a blank domain and a ranking business.
        </h2>
        <Link
          href="/services"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          View all services →
        </Link>
        <ul className="mt-10 space-y-10 sm:mt-12 sm:space-y-14">
          {services.map((s) => (
            <li key={s.n} className="relative max-w-3xl">
              <p className="font-display text-sm tabular-nums tracking-[0.2em] text-accent">
                {s.n}
              </p>
              <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-snow sm:text-2xl">
                {s.title}
              </h3>
              <div className="mt-3 h-px w-14 bg-accent/70" aria-hidden />
              <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                {s.summary}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const unit = mobile ? 72 : 90;

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${services.length * unit}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-start overflow-hidden pt-20 sm:justify-center sm:pt-0">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
            Services
          </p>
          <h2 className="font-display mt-2 max-w-2xl text-2xl font-bold tracking-tight text-snow sm:mt-3 sm:text-4xl md:text-5xl">
            Everything between a blank domain and a ranking business.
          </h2>
          <Link
            href="/services"
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline sm:mt-4"
          >
            View all services →
          </Link>

          <div className="relative mt-8 h-[200px] sm:mt-12 sm:h-[280px] md:h-[300px]">
            {services.map((s, i) => (
              <ServicePanel
                key={s.n}
                index={i}
                active={active}
                n={s.n}
                title={s.title}
                summary={s.summary}
                progress={smoothProgress}
                total={services.length}
                mobile={mobile}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-3">
            <ol className="flex flex-wrap gap-1.5 sm:gap-2" aria-label="Service progress">
              {services.map((s, i) => (
                <li
                  key={s.n}
                  className={`h-1 w-7 rounded-full transition-colors duration-300 sm:w-10 ${
                    i === active ? "bg-accent" : "bg-white/12"
                  }`}
                  aria-current={i === active ? "step" : undefined}
                />
              ))}
            </ol>
            <p className="font-display text-xs tabular-nums text-ink-muted">
              {services[active].n} / {String(services.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicePanel({
  index,
  active,
  n,
  title,
  summary,
  progress,
  total,
  mobile,
}: {
  index: number;
  active: number;
  n: string;
  title: string;
  summary: string;
  progress: MotionValue<number>;
  total: number;
  mobile: boolean;
}) {
  const segment = 1 / Math.max(1, total - 1);
  const center = index * segment;
  const enter = mobile ? 64 : 130;
  const exit = mobile ? -72 : -160;

  const x = useTransform(
    progress,
    [center - segment, center, center + segment],
    [enter, 0, exit],
  );
  const y = useTransform(
    progress,
    [center - segment, center, center + segment],
    [mobile ? 16 : 28, 0, -8],
  );
  const scale = useTransform(
    progress,
    [center - segment, center, center + segment],
    [0.96, 1, 0.97],
  );
  const opacity = useTransform(
    progress,
    [center - segment * 0.85, center, center + segment * 0.85],
    [0, 1, 0],
  );
  const watermarkX = useTransform(
    progress,
    [center - segment, center, center + segment],
    [24, 0, -40],
  );
  const ruleScale = useTransform(
    progress,
    [center - segment * 0.4, center, center + segment * 0.4],
    [0.2, 1, 0.35],
  );

  const isActive = index === active;

  return (
    <motion.article
      className="absolute inset-x-0 top-0 max-w-3xl"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex: isActive ? 30 : 10 + index,
        pointerEvents: isActive ? "auto" : "none",
      }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -left-1 -top-6 select-none font-display text-[4.5rem] font-bold leading-none tabular-nums text-white/[0.05] sm:-left-2 sm:-top-12 sm:text-[9rem]"
        style={{ x: watermarkX }}
      >
        {n}
      </motion.span>

      <div className="relative">
        <p className="font-display text-xs tabular-nums tracking-[0.2em] text-accent sm:text-sm">
          {n}
        </p>
        <h3 className="font-display mt-2 max-w-xl text-xl font-bold tracking-tight text-snow sm:mt-3 sm:text-3xl">
          {title}
        </h3>
        <motion.div
          className="mt-3 h-px origin-left bg-gradient-to-r from-accent to-transparent sm:mt-5"
          style={{ scaleX: ruleScale }}
          aria-hidden
        />
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted sm:mt-5 sm:text-lg">
          {summary}
        </p>
      </div>
    </motion.article>
  );
}
