"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import type { OrganicReportType } from "@/lib/dataforseo/organic-search";
import { DEFAULT_LOCATION_CODE } from "@/lib/dashboard/locations";

const organicMemoryCache = new Map<string, unknown>();

type LastSearch = {
  domain: string;
  locationCode: number;
  scope: string;
};

function getCacheKey(type: string, domain: string, locationCode: number, scope: string) {
  return `ss_organic_v5_${type}_${domain.toLowerCase()}_${locationCode}_${scope}`;
}

function getLastSearchKey(type: string) {
  return `ss_organic_v5_last_${type}`;
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

function readLastSearch(type: string): LastSearch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(getLastSearchKey(type));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastSearch;
    if (!parsed?.domain) return null;
    return {
      domain: parsed.domain,
      locationCode: Number(parsed.locationCode ?? DEFAULT_LOCATION_CODE),
      scope: parsed.scope || "subdomains",
    };
  } catch {
    return null;
  }
}

function writeLastSearch(type: string, search: LastSearch) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(getLastSearchKey(type), JSON.stringify(search));
  } catch {
    // Ignore quota exceeded errors
  }
}

export function useOrganicSearch<T>(type: OrganicReportType) {
  const { project, dataForSeoConfigured, firecrawlConfigured, loading: projectLoading } =
    useDashboardProject();
  const lastSearch = useRef<LastSearch | null>(null);
  if (lastSearch.current === null && typeof window !== "undefined") {
    lastSearch.current = readLastSearch(type);
  }

  const [domain, setDomain] = useState(
    () => lastSearch.current?.domain || project?.domain || "",
  );
  const [locationCode, setLocationCode] = useState(
    () => lastSearch.current?.locationCode ?? DEFAULT_LOCATION_CODE,
  );
  const [scope, setScope] = useState(
    () => lastSearch.current?.scope || "subdomains",
  );
  const [data, setData] = useState<T | null>(() => {
    const saved = lastSearch.current;
    if (!saved?.domain) return null;
    return readCachedData<T>(
      getCacheKey(type, saved.domain, saved.locationCode, saved.scope),
    );
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const syncedProjectKey = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  // Client hydrate: restore last analyzed results after SSR/refresh.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const saved = readLastSearch(type);
    if (!saved?.domain) return;
    lastSearch.current = saved;
    setDomain(saved.domain);
    setLocationCode(saved.locationCode);
    setScope(saved.scope);
    const cached = readCachedData<T>(
      getCacheKey(type, saved.domain, saved.locationCode, saved.scope),
    );
    if (cached) setData(cached);
  }, [type]);

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
      const search = {
        domain: targetDomain,
        locationCode: nextLocation,
        scope: nextScope,
      };
      lastSearch.current = search;
      writeLastSearch(type, search);
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

    // Prefer last analyzed search for this tool; otherwise use project domain + cache.
    const saved = lastSearch.current ?? readLastSearch(type);
    if (saved?.domain) {
      setDomain(saved.domain);
      setLocationCode(saved.locationCode);
      setScope(saved.scope);
      const cached = readCachedData<T>(
        getCacheKey(type, saved.domain, saved.locationCode, saved.scope),
      );
      if (cached) setData(cached);
      setError("");
      return;
    }

    setDomain(project.domain);
    const cached = readCachedData<T>(
      getCacheKey(type, project.domain, DEFAULT_LOCATION_CODE, "subdomains"),
    );
    if (cached) setData(cached);
    setError("");
  }, [project, type]);

  // Changing location/scope/domain: restore matching cached results if available.
  const filtersKey = `${domain}|${locationCode}|${scope}`;
  const filtersKeyRef = useRef(filtersKey);
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (filtersKeyRef.current === filtersKey) return;
    filtersKeyRef.current = filtersKey;
    const target = domain.trim();
    if (!target) {
      setData(null);
      setError("");
      return;
    }
    setData(
      readCachedData<T>(getCacheKey(type, target, locationCode, scope)),
    );
    setError("");
  }, [filtersKey, domain, locationCode, scope, type]);

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
