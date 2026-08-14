"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function SlideIn({
  children,
  direction = "left",
  className = "",
}: {
  children: ReactNode;
  direction?: "left" | "right";
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const xStart = direction === "left" ? -64 : 64;

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, x: xStart }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
