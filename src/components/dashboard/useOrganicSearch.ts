"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import type { OrganicReportType } from "@/lib/dataforseo/organic-search";
import { DEFAULT_LOCATION_CODE } from "@/lib/dashboard/locations";

const organicMemoryCache = new Map<string, unknown>();

function getCacheKey(type: string, domain: string, locationCode: number, scope: string) {
  return `ss_organic_v5_${type}_${domain.toLowerCase()}_${locationCode}_${scope}`;
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
  const [locationCode, setLocationCode] = useState(DEFAULT_LOCATION_CODE);
  const [scope, setScope] = useState("subdomains");
  // Never hydrate prior results on open — only show data after an explicit Analyze click.
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const syncedProjectKey = useRef<string | null>(null);

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

    setLoading(true);
    setError("");
    try {
      const cacheKey = getCacheKey(type, targetDomain, nextLocation, nextScope);
      const cached = readCachedData<T>(cacheKey);
      if (cached) setData(cached);

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
      const nextData = (json.data ?? json) as T;
      setData(nextData);
      writeCachedData(cacheKey, nextData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }, [domain, locationCode, scope, type]);

  useEffect(() => {
    if (!project?.domain) return;
    const projectKey = `${project.id ?? project.domain}|${type}`;
    if (syncedProjectKey.current === projectKey) return;
    syncedProjectKey.current = projectKey;
    setDomain(project.domain);
    setData(null);
    setError("");
  }, [project, type]);

  // Changing location/scope clears prior results until Analyze is clicked again.
  const filtersKey = `${locationCode}|${scope}`;
  const filtersKeyRef = useRef(filtersKey);
  useEffect(() => {
    if (filtersKeyRef.current === filtersKey) return;
    filtersKeyRef.current = filtersKey;
    setData(null);
    setError("");
  }, [filtersKey]);

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
