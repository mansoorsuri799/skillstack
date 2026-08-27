"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import type { OrganicReportType } from "@/lib/dataforseo/organic-search";

export function useOrganicSearch<T>(type: OrganicReportType) {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [domain, setDomain] = useState("");
  const [locationCode, setLocationCode] = useState(2840);
  const [scope, setScope] = useState("subdomains");
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setDomain(project.domain);
      setLocationCode(project.locationCode);
    }
  }, [project]);

  const analyze = useCallback(async () => {
    if (!domain.trim()) {
      setError("Enter a domain to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/organic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, domain, locationCode, scope }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData(json.data as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }, [domain, locationCode, scope, type]);

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
  };
}
