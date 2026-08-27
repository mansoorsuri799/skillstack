"use client";

import { useCallback, useEffect, useState } from "react";

export type DashboardProject = {
  id: string;
  name: string;
  domain: string;
  locationCode: number;
  languageCode: string;
  gscConnected: boolean;
  gscSiteUrl: string | null;
  mcpConnected: boolean;
};

export function useDashboardProject() {
  const [project, setProject] = useState<DashboardProject | null>(null);
  const [dataForSeoConfigured, setDataForSeoConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/project");
      if (!res.ok) throw new Error("Could not load project");
      const data = await res.json();
      setProject(data.project);
      setDataForSeoConfigured(Boolean(data.dataForSeoConfigured));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateDomain = useCallback(
    async (domain: string, name?: string) => {
      const res = await fetch("/api/dashboard/project", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setProject(data.project);
      return data.project as DashboardProject;
    },
    [],
  );

  return {
    project,
    dataForSeoConfigured,
    loading,
    error,
    refresh,
    updateDomain,
  };
}
