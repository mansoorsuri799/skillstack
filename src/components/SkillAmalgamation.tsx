"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

const layers = [
  {
    label: "Content Writing",
    tone: "from-[#1a3a3a] to-[#0f2a2a]",
    border: "border-teal-500/30",
    text: "text-teal-100/90",
  },
  {
    label: "SEO & Fast Ranking",
    tone: "from-[#163040] to-[#0d1f2c]",
    border: "border-sky-500/25",
    text: "text-sky-100/85",
  },
  {
    label: "WordPress & Next.js",
    tone: "from-[#1c2433] to-[#111820]",
    border: "border-white/15",
    text: "text-white/85",
  },
  {
    label: "Keyword Research",
    tone: "from-[#1a3028] to-[#0f2018]",
    border: "border-emerald-500/25",
    text: "text-emerald-100/85",
  },
  {
    label: "Backlinks & Authority",
    tone: "from-[#222833] to-[#141820]",
    border: "border-white/12",
    text: "text-white/75",
  },
];

const GAP = 44;
const OFFSET = 28;

export default function SkillAmalgamation() {
  const reduceMotion = useReducedMotion();
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

  return (
    <div
      ref={rootRef}
      className="relative mx-auto h-[300px] w-full max-w-md touch-none sm:h-[360px]"
      style={{ perspective: "900px" }}
      onPointerMove={(e) => resolveHover(e.clientX, e.clientY)}
      onPointerLeave={() => setHovered(null)}
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(12deg)" }}
      >
        {layers.map((layer, i) => {
          const fromBottom = layers.length - 1 - i;
          const yRest = fromBottom * GAP + OFFSET;

          // Open space around hovered card: ones below slip down, ones above slip up
          let yOffset = 0;
          if (hovered !== null && !reduceMotion) {
            if (i < hovered) yOffset = 22;
            else if (i > hovered) yOffset = -22;
            else yOffset = 4;
          }

          const isHovered = hovered === i;

          return (
            <motion.div
              key={layer.label}
              className={`pointer-events-none absolute left-1/2 w-[88%] max-w-[340px] -translate-x-1/2 rounded-md border bg-gradient-to-br px-5 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] ${layer.tone} ${layer.border}`}
              style={{ zIndex: isHovered ? 30 : i + 1 }}
              initial={
                reduceMotion
                  ? { y: yRest, opacity: 1, scale: 1 }
                  : { y: yRest + 70, opacity: 0, scale: 0.94 }
              }
              animate={{
                y: yRest + yOffset,
                opacity: 1,
                scale: isHovered && !reduceMotion ? 1.03 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 28,
                mass: 0.7,
                delay: hovered === null && !reduceMotion ? i * 0.05 : 0,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`font-display text-sm font-semibold tracking-tight sm:text-base ${layer.text}`}
                >
                  {layer.label}
                </span>
                <span className="font-display text-[10px] tabular-nums text-white/35">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-2 h-px w-full bg-gradient-to-r from-accent/40 to-transparent" />
            </motion.div>
          );
        })}

        {/* Fixed hit strips — cards can slip; hover targets never move */}
        {layers.map((layer, i) => {
          const fromBottom = layers.length - 1 - i;
          const yRest = fromBottom * GAP + OFFSET;

          return (
            <div
              key={`hit-${layer.label}`}
              data-stack-hit={i}
              className="absolute left-1/2 w-[88%] max-w-[340px] -translate-x-1/2"
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

      <div className="pointer-events-none absolute bottom-2 left-1/2 h-10 w-52 -translate-x-1/2 rounded-[100%] bg-accent/15 blur-2xl" />
    </div>
  );
}
