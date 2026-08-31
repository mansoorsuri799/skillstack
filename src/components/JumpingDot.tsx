"use client";

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
  const mobile = useMobileDot();
  const { gapX, baseline } = mobile ? MOBILE : DESKTOP;

  return (
    <span
      aria-hidden="true"
      className={`${DOT_CLASS} ${sizeClass} jumping-dot-anim`}
      style={{
        bottom: baseline,
        marginLeft: gapX,
      }}
    />
  );
}
