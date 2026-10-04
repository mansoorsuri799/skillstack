"use client";

import { useEffect } from "react";
import {
  ATTRIBUTION_COOKIE,
  attributionCookieOptions,
  attributionFromSearchParams,
  parseAttribution,
  serializeAttribution,
} from "@/lib/attribution";

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

/** First-touch UTM capture for Instagram / ads → signup tagging. */
export default function AttributionCapture() {
  useEffect(() => {
    try {
      if (parseAttribution(readCookie(ATTRIBUTION_COOKIE))) return;

      const attr = attributionFromSearchParams(
        new URLSearchParams(window.location.search),
        window.location.pathname,
      );
      if (!attr) return;

      const secure = window.location.protocol === "https:";
      const opts = attributionCookieOptions(secure);
      document.cookie = [
        `${ATTRIBUTION_COOKIE}=${serializeAttribution(attr)}`,
        `path=${opts.path}`,
        `max-age=${opts.maxAge}`,
        `samesite=${opts.sameSite}`,
        secure ? "secure" : "",
      ]
        .filter(Boolean)
        .join("; ");
    } catch {
      // Ignore cookie / storage failures
    }
  }, []);

  return null;
}
