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
import { useRef, useState } from "react";
import { services } from "@/lib/content";

export default function ServicesScrollStack() {
  const reduceMotion = useReducedMotion();
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
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Services
        </p>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-snow sm:text-5xl">
          Everything between a blank domain and a ranking business.
        </h2>
        <Link
          href="/services"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          View all services →
        </Link>
        <ul className="mt-12 space-y-14">
          {services.map((s) => (
            <li key={s.n} className="relative max-w-3xl">
              <span className="font-display absolute -left-2 -top-8 text-7xl font-bold tabular-nums text-white/[0.06]">
                {s.n}
              </span>
              <p className="relative font-display text-sm tabular-nums tracking-[0.2em] text-accent">
                {s.n}
              </p>
              <h3 className="relative mt-2 font-display text-2xl font-bold tracking-tight text-snow sm:text-3xl">
                {s.title}
              </h3>
              <div className="mt-4 h-px w-16 bg-accent/70" aria-hidden />
              <p className="relative mt-4 text-base leading-relaxed text-ink-muted">
                {s.summary}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${services.length * 90}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Services
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-snow sm:text-4xl md:text-5xl">
            Everything between a blank domain and a ranking business.
          </h2>
          <Link
            href="/services"
            className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
          >
            View all services →
          </Link>

          <div className="relative mt-10 h-[260px] sm:mt-12 sm:h-[300px]">
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
              />
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3">
            <ol className="flex gap-2" aria-label="Service progress">
              {services.map((s, i) => (
                <li
                  key={s.n}
                  className={`h-1 w-10 rounded-full transition-colors duration-300 ${
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
}: {
  index: number;
  active: number;
  n: string;
  title: string;
  summary: string;
  progress: MotionValue<number>;
  total: number;
}) {
  const segment = 1 / Math.max(1, total - 1);
  const center = index * segment;

  const x = useTransform(
    progress,
    [center - segment, center, center + segment],
    [130, 0, -160],
  );
  const y = useTransform(
    progress,
    [center - segment, center, center + segment],
    [28, 0, -8],
  );
  const scale = useTransform(
    progress,
    [center - segment, center, center + segment],
    [0.94, 1, 0.97],
  );
  const opacity = useTransform(
    progress,
    [center - segment * 0.85, center, center + segment * 0.85],
    [0, 1, 0],
  );
  const watermarkX = useTransform(
    progress,
    [center - segment, center, center + segment],
    [40, 0, -60],
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
        className="pointer-events-none absolute -left-2 -top-10 select-none font-display text-[7rem] font-bold leading-none tabular-nums text-white/[0.055] sm:-top-12 sm:text-[9rem]"
        style={{ x: watermarkX }}
      >
        {n}
      </motion.span>

      <div className="relative">
        <p className="font-display text-sm tabular-nums tracking-[0.2em] text-accent">
          {n}
        </p>
        <h3 className="font-display mt-3 max-w-xl text-2xl font-bold tracking-tight text-snow sm:text-3xl">
          {title}
        </h3>
        <motion.div
          className="mt-5 h-px origin-left bg-gradient-to-r from-accent to-transparent"
          style={{ scaleX: ruleScale }}
          aria-hidden
        />
        <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
          {summary}
        </p>
      </div>
    </motion.article>
  );
}
