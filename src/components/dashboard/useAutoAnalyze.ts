"use client";

import { useEffect, useRef } from "react";

export function useAutoAnalyze(
  enabled: boolean,
  run: () => void | Promise<void>,
) {
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled || ran.current) return;
    ran.current = true;
    void run();
  }, [enabled, run]);
}
