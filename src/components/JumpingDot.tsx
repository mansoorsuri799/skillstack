"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const REST_MS = 2 * 60 * 1000;

/** Rest size — full stop next to the "k" */
const DOT_CLASS =
  "pointer-events-none absolute origin-center rounded-full bg-white";

export default function JumpingDot() {
  const reduceMotion = useReducedMotion();
  // Always start at rest on server+first paint to avoid hydration mismatch
  const [phase, setPhase] = useState<"in" | "rest" | "loop">("rest");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (!reduceMotion) setPhase("in");
  }, [reduceMotion]);

  useEffect(() => {
    if (!ready || reduceMotion || phase !== "rest") return;
    const id = window.setTimeout(() => setPhase("loop"), REST_MS);
    return () => window.clearTimeout(id);
  }, [phase, reduceMotion, ready]);

  // Snug against SkillStack "k", baseline-aligned
  const atStop = {
    left: "100%",
    bottom: "0.38em",
    x: 3,
    y: 0,
    scale: 1,
  };

  const sizeClass =
    "h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5";

  if (reduceMotion) {
    return (
      <span
        aria-hidden="true"
        className={`${DOT_CLASS} ${sizeClass} left-full`}
        style={{ bottom: "0.38em", marginLeft: 3 }}
      />
    );
  }

  return (
    <motion.span
      aria-hidden="true"
      className={`${DOT_CLASS} ${sizeClass}`}
      initial={
        phase === "in"
          ? {
              left: "-8%",
              bottom: "0.38em",
              x: 0,
              y: 0,
              scale: 0.35,
            }
          : atStop
      }
      animate={
        phase === "in"
          ? {
              left: "100%",
              bottom: "0.38em",
              x: 3,
              // bounce up then settle on baseline
              y: [0, -22, 6, -10, 2, 0],
              scale: [0.35, 0.45, 0.7, 0.95, 1.08, 1],
            }
          : phase === "loop"
            ? {
                left: ["100%", "-8%", "100%"],
                bottom: "0.38em",
                x: [3, 0, 3],
                y: [0, 0, -22, 6, -10, 2, 0],
                scale: [1, 0.35, 0.35, 0.7, 0.95, 1.08, 1],
              }
            : atStop
      }
      transition={
        phase === "in"
          ? {
              left: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              // bounce lands after the fast arrival
              y: {
                duration: 0.85,
                delay: 0.28,
                times: [0, 0.28, 0.48, 0.68, 0.86, 1],
                ease: "easeOut",
              },
              scale: {
                duration: 0.85,
                delay: 0.2,
                times: [0, 0.2, 0.45, 0.7, 0.88, 1],
                ease: "easeOut",
              },
            }
          : phase === "loop"
            ? {
                left: {
                  duration: 1.8,
                  times: [0, 0.35, 1],
                  ease: [0.22, 1, 0.36, 1],
                },
                x: {
                  duration: 1.8,
                  times: [0, 0.35, 1],
                  ease: [0.22, 1, 0.36, 1],
                },
                y: {
                  duration: 1.8,
                  times: [0, 0.35, 0.48, 0.62, 0.76, 0.9, 1],
                  ease: "easeOut",
                },
                scale: {
                  duration: 1.8,
                  times: [0, 0.2, 0.35, 0.55, 0.72, 0.88, 1],
                  ease: "easeOut",
                },
              }
            : { duration: 0 }
      }
      onAnimationComplete={() => {
        if (phase === "in" || phase === "loop") setPhase("rest");
      }}
    />
  );
}
