"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const layers = [
  {
    label: "Keyword Research",
    tone: "from-[#1a3028] to-[#0f2018]",
    border: "border-emerald-500/25",
    text: "text-emerald-100/85",
  },
  {
    label: "Content Writing",
    tone: "from-[#1a3a3a] to-[#0f2a2a]",
    border: "border-teal-500/30",
    text: "text-teal-100/90",
  },
  {
    label: "Web Dev · WP & Next.js",
    tone: "from-[#1c2433] to-[#111820]",
    border: "border-white/15",
    text: "text-white/85",
  },
  {
    label: "SEO · AEO · AIO · GEO",
    tone: "from-[#163040] to-[#0d1f2c]",
    border: "border-sky-500/25",
    text: "text-sky-100/85",
  },
  {
    label: "Backlinks & Authority",
    tone: "from-[#222833] to-[#141820]",
    border: "border-white/12",
    text: "text-white/75",
  },
];

const DESKTOP = { gap: 44, offset: 28, tilt: 12, height: 360 };
const MOBILE = { gap: 34, offset: 12, tilt: 8, height: 268 };

function useCompactStack(breakpoint = 640) {
  const [compact, setCompact] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);
  return compact;
}

export default function SkillAmalgamation() {
  const reduceMotion = useReducedMotion();
  const compact = useCompactStack();
  const metrics = compact ? MOBILE : DESKTOP;
  const [hovered, setHovered] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const resolveHover = useCallback((clientX: number, clientY: number) => {
    const root = rootRef.current;
    if (!root) return;

    const el = document.elementFromPoint(clientX, clientY);
    const hit = el?.closest<HTMLElement>("[data-stack-hit]");
    if (!hit || !root.contains(hit)) return;

    const next = Number(hit.dataset.stackHit);
    if (Number.isNaN(next)) return;
    setHovered((prev) => (prev === next ? prev : next));
  }, []);

  const { gap: GAP, offset: OFFSET, tilt: STACK_TILT, height } = metrics;

  return (
    <div
      ref={rootRef}
      className="relative mx-auto w-full max-w-md touch-pan-y"
      style={{ perspective: "900px", height }}
      onPointerMove={(e) => resolveHover(e.clientX, e.clientY)}
      onPointerDown={(e) => resolveHover(e.clientX, e.clientY)}
      onPointerLeave={() => setHovered(null)}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${STACK_TILT}deg)`,
        }}
      >
        {layers.map((layer, i) => {
          const fromBottom = layers.length - 1 - i;
          const yRest = fromBottom * GAP + OFFSET;
          const isHovered = hovered === i;

          let yOffset = 0;
          if (hovered !== null && !reduceMotion) {
            if (i < hovered) yOffset = compact ? 14 : 22;
            else if (i > hovered) yOffset = compact ? -14 : -22;
            else yOffset = compact ? -12 : -18;
          }

          const idleActive = !reduceMotion && hovered === null;
          const bob = compact ? 6 : 10;
          const animate = idleActive
            ? {
                y: [yRest, yRest - bob, yRest, yRest - bob * 0.6, yRest],
                opacity: 1,
                scale: [1, 1.02, 1, 1, 1],
                rotateX: 0,
              }
            : {
                y: yRest + yOffset,
                opacity: 1,
                scale: isHovered && !reduceMotion ? (compact ? 1.04 : 1.06) : 1,
                rotateX: isHovered && !reduceMotion ? -STACK_TILT : 0,
              };

          return (
            <motion.div
              key={layer.label}
              className={`pointer-events-none absolute left-1/2 w-[94%] max-w-[340px] -translate-x-1/2 rounded-md border bg-gradient-to-br px-3.5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] sm:w-[88%] sm:px-5 sm:py-4 ${layer.tone} ${
                isHovered ? "border-accent/50" : layer.border
              }`}
              style={{
                zIndex: isHovered ? 40 : i + 1,
                transformStyle: "preserve-3d",
                transformOrigin: "center bottom",
              }}
              initial={
                reduceMotion
                  ? { y: yRest, opacity: 1, scale: 1, rotateX: 0 }
                  : { y: yRest + 48, opacity: 0, scale: 0.94, rotateX: 0 }
              }
              animate={animate}
              transition={
                idleActive
                  ? {
                      duration: 4.8,
                      delay: i * 0.14,
                      repeat: Infinity,
                      repeatDelay: 1.4,
                      ease: [0.22, 1, 0.36, 1],
                      times: [0, 0.28, 0.42, 0.62, 1],
                    }
                  : {
                      type: "spring",
                      stiffness: 360,
                      damping: 26,
                      mass: 0.55,
                    }
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`min-w-0 truncate font-display text-[11px] font-semibold tracking-tight sm:text-base ${layer.text}`}
                >
                  {layer.label}
                </span>
                <span className="shrink-0 font-display text-[10px] tabular-nums text-white/35 sm:text-[10px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-1.5 h-px w-full bg-gradient-to-r from-accent/40 to-transparent sm:mt-2" />
            </motion.div>
          );
        })}

        {layers.map((layer, i) => {
          const fromBottom = layers.length - 1 - i;
          const yRest = fromBottom * GAP + OFFSET;

          return (
            <div
              key={`hit-${layer.label}`}
              data-stack-hit={i}
              className="absolute left-1/2 w-[90%] max-w-[340px] -translate-x-1/2"
              style={{
                top: 0,
                height: GAP,
                transform: `translateY(${yRest}px)`,
                zIndex: 50,
              }}
            />
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-1 left-1/2 h-8 w-44 -translate-x-1/2 rounded-[100%] bg-accent/15 blur-2xl sm:bottom-2 sm:h-10 sm:w-52" />
    </div>
  );
}
