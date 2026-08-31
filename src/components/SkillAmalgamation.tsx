"use client";

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
  {
    label: "Ad Monetization",
    tone: "from-[#2a2418] to-[#1a160e]",
    border: "border-amber-500/25",
    text: "text-amber-100/85",
  },
];

const DESKTOP = { gap: 40, offset: 24, tilt: 12, height: 400 };
const MOBILE = { gap: 30, offset: 10, tilt: 8, height: 300 };

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
      className="relative mx-auto w-full max-w-sm touch-pan-y md:ml-auto md:mr-0 lg:max-w-md"
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
          if (hovered !== null) {
            if (i < hovered) yOffset = compact ? 14 : 22;
            else if (i > hovered) yOffset = compact ? -14 : -22;
            else yOffset = compact ? -12 : -18;
          }

          const currentY = yRest + yOffset;
          const currentScale = isHovered ? (compact ? 1.04 : 1.06) : 1;
          const currentRotateX = isHovered ? -STACK_TILT : 0;

          return (
            <div
              key={layer.label}
              className={`pointer-events-none absolute right-0 w-[96%] max-w-[360px] rounded-md border bg-gradient-to-br px-3.5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out sm:px-5 sm:py-4 ${layer.tone} ${
                isHovered ? "border-accent/50 z-40" : layer.border
              }`}
              style={{
                zIndex: isHovered ? 40 : i + 1,
                transformStyle: "preserve-3d",
                transformOrigin: "center bottom",
                transform: `translate3d(0, ${currentY}px, 0) scale(${currentScale}) rotateX(${currentRotateX}deg)`,
              }}
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
            </div>
          );
        })}

        {layers.map((layer, i) => {
          const fromBottom = layers.length - 1 - i;
          const yRest = fromBottom * GAP + OFFSET;

          return (
            <div
              key={`hit-${layer.label}`}
              data-stack-hit={i}
              className="absolute right-0 w-[96%] max-w-[360px] cursor-pointer"
              style={{
                top: 0,
                transform: `translate3d(0, ${yRest}px, 0)`,
                height: i === 0 ? 72 : GAP + 8,
                zIndex: 50 + i,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
