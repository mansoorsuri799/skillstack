"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import type { OrganicReportType } from "@/lib/dataforseo/organic-search";

const organicMemoryCache = new Map<string, unknown>();

function getCacheKey(type: string, domain: string, locationCode: number, scope: string) {
  return `ss_organic_v2_${type}_${domain.toLowerCase()}_${locationCode}_${scope}`;
}

function readCachedData<T>(key: string): T | null {
  if (organicMemoryCache.has(key)) {
    return organicMemoryCache.get(key) as T;
  }
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        organicMemoryCache.set(key, parsed);
        return parsed;
      }
    } catch {
      // Ignore sessionStorage parsing errors
    }
  }
  return null;
}

function writeCachedData<T>(key: string, value: T) {
  organicMemoryCache.set(key, value);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota exceeded errors
    }
  }
}

export function useOrganicSearch<T>(type: OrganicReportType) {
  const { project, dataForSeoConfigured, firecrawlConfigured, loading: projectLoading } =
    useDashboardProject();
  const [domain, setDomain] = useState(() => project?.domain ?? "");
  const [locationCode, setLocationCode] = useState(() => project?.locationCode ?? 2586);
  const [scope, setScope] = useState("subdomains");
  const [data, setData] = useState<T | null>(() => {
    if (!project?.domain) return null;
    return readCachedData<T>(getCacheKey(type, project.domain, project.locationCode ?? 2586, "subdomains"));
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoLoadedKey = useRef<string | null>(null);

  const analyze = useCallback(async (override?: {
    domain?: string;
    locationCode?: number;
    scope?: string;
  }) => {
    const targetDomain = (override?.domain ?? domain).trim();
    if (!targetDomain) {
      setError("Enter a domain to analyze.");
      return;
    }

    const nextLocation = override?.locationCode ?? locationCode;
    const nextScope = override?.scope ?? scope;
    const cacheKey = getCacheKey(type, targetDomain, nextLocation, nextScope);
    const cached = readCachedData<T>(cacheKey);
    if (cached) {
      setData(cached);
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/organic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          domain: targetDomain,
          locationCode: nextLocation,
          scope: nextScope,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      const resultData = json.data as T;
      setData(resultData);
      writeCachedData(cacheKey, resultData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }, [domain, locationCode, scope, type]);

  useEffect(() => {
    if (!project?.domain) return;
    setDomain(project.domain);
    setLocationCode(project.locationCode);
    const cacheKey = getCacheKey(type, project.domain, project.locationCode, scope);
    const cached = readCachedData<T>(cacheKey);
    if (cached) setData(cached);

    const autoKey = `${type}|${project.domain}|${project.locationCode}|${scope}`;
    if (autoLoadedKey.current === autoKey) return;
    autoLoadedKey.current = autoKey;
    void analyze({
      domain: project.domain,
      locationCode: project.locationCode,
      scope,
    });
  }, [project, scope, type, analyze]);

  return {
    domain,
    setDomain,
    locationCode,
    setLocationCode,
    scope,
    setScope,
    data,
    loading,
    error,
    analyze,
    projectLoading,
    dataForSeoConfigured,
    firecrawlConfigured,
  };
}
