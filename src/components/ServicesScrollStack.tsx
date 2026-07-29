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
import { useRef, useState, useSyncExternalStore } from "react";
import { services } from "@/lib/content";
import FadeIn from "./FadeIn";

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
    </>
  );
}

function MobileServicesList() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <FadeIn>
        <SectionIntro />
      </FadeIn>
      <ul className="mt-8 space-y-0">
        {services.map((s, i) => (
          <FadeIn key={s.n} delay={i * 0.05}>
            <li className="border-t border-white/10 py-5">
              <span className="font-display text-xs tabular-nums text-accent">
                {s.n}
              </span>
              <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-snow">
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {s.summary}
              </p>
            </li>
          </FadeIn>
        ))}
      </ul>
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
    [100, 0, -120],
  );
  const y = useTransform(
    progress,
    [center - segment, center, center + segment],
    [20, 0, -8],
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
      <div className="relative pt-2">
        <p className="font-display text-base tabular-nums tracking-[0.22em] text-accent md:text-lg">
          {n}
        </p>
        <h3 className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-tight text-snow md:mt-4 md:text-4xl">
          {title}
        </h3>
        <motion.div
          className="mt-5 h-px origin-left bg-gradient-to-r from-accent to-transparent md:mt-6"
          style={{ scaleX: ruleScale }}
          aria-hidden
        />
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted md:mt-6 md:text-xl">
          {summary}
        </p>
      </div>
    </motion.article>
  );
}

/** Mounted only when the scroll target div is actually rendered. */
function ServicesStackDesktop() {
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

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${services.length * 80}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-start overflow-hidden pt-16 sm:pt-[4.5rem]">
        <div className="mx-auto w-full max-w-6xl px-6 pb-8 pt-8 md:px-8 md:pt-10">
          <SectionIntro />

          <div className="relative mt-16 h-[320px] md:mt-20 md:h-[360px]">
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

          <div className="mt-10 flex items-center gap-3 md:mt-12">
            <ol className="flex gap-2" aria-label="Service progress">
              {services.map((s, i) => (
                <li
                  key={s.n}
                  className={`h-1.5 w-11 rounded-full transition-colors duration-300 ${
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

export default function ServicesScrollStack() {
  const reduceMotion = useReducedMotion();
  const mobile = useIsMobile();

  if (mobile || reduceMotion) {
    return <MobileServicesList />;
  }

  return <ServicesStackDesktop />;
}
