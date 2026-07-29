"use client";

import { motion, useReducedMotion } from "framer-motion";

const miniStacks = [
  {
    id: "right",
    className: "right-[6%] top-[22%] hidden w-28 sm:block md:right-[10%] md:w-32",
    count: 3,
    rotate: -9,
  },
  {
    id: "left",
    className: "bottom-[14%] left-[3%] w-24 md:left-[6%] md:w-28",
    count: 3,
    rotate: 8,
  },
];

export default function HeroMiniStacks() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {miniStacks.map((stack) => (
        <motion.div
          key={stack.id}
          className={`absolute flex flex-col items-center gap-1.5 opacity-40 ${stack.className}`}
          style={{ transform: `rotate(${stack.rotate}deg)` }}
          animate={
            reduceMotion
              ? undefined
              : { y: [0, stack.id === "right" ? -8 : 8, 0] }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: stack.id === "left" ? 0.6 : 0,
                }
          }
        >
          {Array.from({ length: stack.count }).map((_, i) => {
            const width = `${100 - i * 14}%`;
            return (
              <motion.div
                key={`${stack.id}-${i}`}
                className="h-7 rounded-md border border-accent/20 bg-gradient-to-br from-white/[0.06] to-accent/[0.05] md:h-8"
                style={{ width }}
                initial={
                  reduceMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 16 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: reduceMotion ? 0 : 0.25 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            );
          })}
        </motion.div>
      ))}
    </div>
  );
}
