"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type DashboardProject = {
  id: string;
  name: string;
  domain: string;
  locationCode: number;
  languageCode: string;
  gscConnected: boolean;
  gscSiteUrl: string | null;
  mcpConnected: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardProjectContextValue = {
  project: DashboardProject | null;
  projects: DashboardProject[];
  dataForSeoConfigured: boolean;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  createProject: (domain: string, name?: string) => Promise<DashboardProject>;
  selectProject: (id: string) => Promise<DashboardProject>;
  updateDomain: (domain: string, name?: string) => Promise<DashboardProject>;
  renameProject: (id: string, name: string) => Promise<DashboardProject>;
  deleteProject: (id: string) => Promise<void>;
};

const DashboardProjectContext =
  createContext<DashboardProjectContextValue | null>(null);

export function DashboardProjectProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [project, setProject] = useState<DashboardProject | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [dataForSeoConfigured, setDataForSeoConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/projects");
      if (!res.ok) throw new Error("Could not load projects");
      const data = await res.json();
      setProject(data.activeProject ?? data.project ?? null);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
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

  const createProject = useCallback(
    async (domain: string, name?: string) => {
      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create project");
      setProject(data.activeProject ?? data.project);
      if (Array.isArray(data.projects)) setProjects(data.projects);
      if (data.dataForSeoConfigured !== undefined) {
        setDataForSeoConfigured(Boolean(data.dataForSeoConfigured));
      }
      return (data.activeProject ?? data.project) as DashboardProject;
    },
    [],
  );

  const selectProject = useCallback(async (id: string) => {
    const res = await fetch(`/api/dashboard/projects/${id}/select`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to select project");
    setProject(data.activeProject ?? data.project);
    if (Array.isArray(data.projects)) setProjects(data.projects);
    return (data.activeProject ?? data.project) as DashboardProject;
  }, []);

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
      setProjects((prev) =>
        prev.map((p) => (p.id === data.project.id ? data.project : p)),
      );
      return data.project as DashboardProject;
    },
    [],
  );

  const renameProject = useCallback(async (id: string, name: string) => {
    const res = await fetch(`/api/dashboard/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to rename project");
    setProject(data.activeProject ?? data.project);
    if (Array.isArray(data.projects)) setProjects(data.projects);
    return (data.activeProject ?? data.project) as DashboardProject;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    const res = await fetch(`/api/dashboard/projects/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete project");
    setProject(data.activeProject ?? data.project);
    if (Array.isArray(data.projects)) setProjects(data.projects);
  }, []);

  return (
    <DashboardProjectContext.Provider
      value={{
        project,
        projects,
        dataForSeoConfigured,
        loading,
        error,
        refresh,
        createProject,
        selectProject,
        updateDomain,
        renameProject,
        deleteProject,
      }}
    >
      {children}
    </DashboardProjectContext.Provider>
  );
}

export function useDashboardProject(): DashboardProjectContextValue {
  const ctx = useContext(DashboardProjectContext);
  if (!ctx) {
    return {
      project: null,
      projects: [],
      dataForSeoConfigured: false,
      loading: false,
      error: "",
      refresh: async () => {},
      createProject: async () => {
        throw new Error("Outside DashboardProjectProvider");
      },
      selectProject: async () => {
        throw new Error("Outside DashboardProjectProvider");
      },
      updateDomain: async () => {
        throw new Error("Outside DashboardProjectProvider");
      },
      renameProject: async () => {
        throw new Error("Outside DashboardProjectProvider");
      },
      deleteProject: async () => {
        throw new Error("Outside DashboardProjectProvider");
      },
    };
  }
  return ctx;
}
