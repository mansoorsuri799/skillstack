"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

export function useDomainReport<T>(
  endpoint: string,
  extraBody: Record<string, unknown> = {},
) {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [domain, setDomain] = useState("");
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project?.domain && project.domain !== "example.com") {
      setDomain(project.domain);
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
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, ...extraBody }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setData((json.data ?? json) as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }, [domain, endpoint, extraBody]);

  return {
    domain,
    setDomain,
    data,
    loading,
    error,
    analyze,
    projectLoading,
    dataForSeoConfigured,
  };
}
