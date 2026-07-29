"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { services } from "@/lib/content";
import FadeIn from "./FadeIn";

export default function ServicesCatalog() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = nodes.indexOf(visible.target as HTMLElement);
        if (idx >= 0) setActive(idx);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.15, 0.4, 0.7] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  function jumpTo(i: number) {
    refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[140px_1fr] md:gap-14 md:px-8 md:py-20 lg:grid-cols-[160px_1fr]">
      <aside className="hidden md:block">
        <nav
          aria-label="Services"
                className="sticky top-[5.5rem] space-y-1 border-l border-white/10"
        >
          {services.map((service, i) => {
            const on = i === active;
            return (
              <button
                key={service.n}
                type="button"
                onClick={() => jumpTo(i)}
                className={`relative block w-full py-2.5 pl-4 text-left transition-colors ${
                  on ? "text-accent" : "text-ink-muted hover:text-snow"
                }`}
              >
                {on ? (
                  <motion.span
                    layoutId="service-rail"
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="font-display text-xs tabular-nums">
                  {service.n}
                </span>
                <span className="mt-0.5 block text-sm font-medium leading-snug">
                  {service.title.split("&")[0].trim()}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="space-y-6 md:space-y-8">
        {services.map((service, i) => (
          <FadeIn key={service.n} delay={reduceMotion ? 0 : Math.min(i, 3) * 0.04}>
            <article
              id={`service-${service.n}`}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`relative overflow-hidden rounded-lg border px-6 py-7 transition-[border-color,box-shadow] duration-500 sm:px-8 sm:py-9 ${
                active === i
                  ? "border-accent/40 bg-[#0d1117] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
                  : "border-white/10 bg-[#0d1117]/55"
              }`}
            >
              <div
                aria-hidden
                className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-accent/80 via-accent/30 to-transparent transition-opacity duration-500 ${
                  active === i ? "opacity-100" : "opacity-40"
                }`}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-display text-sm tabular-nums text-accent">
                  {service.n}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-ink-muted md:hidden">
                  Service
                </p>
              </div>
              <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-snow sm:text-3xl">
                {service.title}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
                {service.summary}
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {service.details.map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-snow/80"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </article>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
