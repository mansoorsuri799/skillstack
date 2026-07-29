"use client";

import { motion, useReducedMotion } from "framer-motion";

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

export default function SkillAmalgamation() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative mx-auto h-[300px] w-full max-w-md sm:h-[360px]"
      style={{ perspective: "900px" }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(12deg)" }}
      >
        {layers.map((layer, i) => {
          const fromBottom = layers.length - 1 - i;
          const yRest = fromBottom * 44 + 28;

          return (
            <motion.div
              key={layer.label}
              className={`absolute left-1/2 w-[88%] max-w-[340px] -translate-x-1/2 rounded-md border bg-gradient-to-br px-5 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] ${layer.tone} ${layer.border}`}
              style={{ zIndex: i + 1 }}
              initial={
                reduceMotion
                  ? { y: yRest, opacity: 1 }
                  : { y: yRest + 70, opacity: 0, scale: 0.94 }
              }
              animate={
                reduceMotion
                  ? { y: yRest, opacity: 1 }
                  : {
                      y: [yRest + 70, yRest - 10, yRest, yRest - 6, yRest],
                      opacity: [0, 1, 1, 1, 1],
                      scale: [0.94, 1.03, 1, 1, 1],
                    }
              }
              transition={
                reduceMotion
                  ? undefined
                  : {
                      duration: 4.8,
                      delay: i * 0.14,
                      repeat: Infinity,
                      repeatDelay: 1.4,
                      ease: [0.22, 1, 0.36, 1],
                      times: [0, 0.28, 0.42, 0.62, 1],
                    }
              }
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
      </div>

      <div className="pointer-events-none absolute bottom-2 left-1/2 h-10 w-52 -translate-x-1/2 rounded-[100%] bg-accent/15 blur-2xl" />
    </div>
  );
}
