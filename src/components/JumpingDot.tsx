"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const DOT_CLASS =
  "pointer-events-none absolute origin-center rounded-full bg-[#2cd4bf] will-change-transform";

const sizeClass =
  "h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 lg:h-5 lg:w-5";

/** Desktop: keep the previous resting position. Mobile: period on the baseline (not sunk). */
const DESKTOP = { gapX: 4, baseline: "1.08em" };
const MOBILE = { gapX: 1, baseline: "0.42em" };

function useMobileDot(breakpoint = 640) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [breakpoint]);
  return mobile;
}

export default function JumpingDot() {
  const reduceMotion = useReducedMotion();
  const mobile = useMobileDot();
  const { gapX, baseline } = mobile ? MOBILE : DESKTOP;

  if (reduceMotion) {
    return (
      <span
        aria-hidden="true"
        className={`${DOT_CLASS} ${sizeClass} left-full`}
        style={{ bottom: baseline, marginLeft: gapX }}
      />
    );
  }

  return (
    <motion.span
      aria-hidden="true"
      className={`${DOT_CLASS} ${sizeClass}`}
      style={{ bottom: baseline }}
      initial={{
        left: "-12%",
        x: 0,
        y: 0,
        scale: 0.35,
        opacity: 0,
      }}
      animate={{
        left: "100%",
        x: gapX,
        y: mobile ? [0, -16, 5, -8, 2, 0] : [0, -28, 8, -14, 3, 0],
        scale: [0.35, 0.55, 0.75, 0.95, 1.06, 1],
        opacity: 1,
      }}
      transition={{
        left: { duration: 1.25, ease: [0.22, 1, 0.36, 1] },
        x: { duration: 1.25, ease: [0.22, 1, 0.36, 1] },
        y: {
          duration: 1.4,
          delay: 0.65,
          times: [0, 0.25, 0.45, 0.65, 0.85, 1],
          ease: [0.34, 1.4, 0.64, 1],
        },
        scale: {
          duration: 1.4,
          delay: 0.6,
          times: [0, 0.25, 0.45, 0.65, 0.85, 1],
          ease: [0.22, 1, 0.36, 1],
        },
        opacity: { duration: 0.3, ease: "easeOut" },
      }}
    />
  );
}
