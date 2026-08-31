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

const CACHE_PROJECT_KEY = "ss-active-project";
const CACHE_PROJECTS_KEY = "ss-projects-list";

export const DEFAULT_FALLBACK_PROJECT: DashboardProject = {
  id: "default",
  name: "My Project",
  domain: "example.com",
  locationCode: 2840,
  languageCode: "en",
  gscConnected: false,
  gscSiteUrl: null,
  mcpConnected: false,
};

function readCachedProject(): DashboardProject | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PROJECT_KEY);
    return raw ? (JSON.parse(raw) as DashboardProject) : null;
  } catch {
    return null;
  }
}

function readCachedProjects(): DashboardProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_PROJECTS_KEY);
    return raw ? (JSON.parse(raw) as DashboardProject[]) : [];
  } catch {
    return [];
  }
}

const DashboardProjectContext =
  createContext<DashboardProjectContextValue | null>(null);

export function DashboardProjectProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [project, setProject] = useState<DashboardProject | null>(
    DEFAULT_FALLBACK_PROJECT
  );
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [dataForSeoConfigured, setDataForSeoConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/dashboard/projects");
      if (!res.ok) throw new Error("Could not load projects");
      const data = await res.json();
      const nextActive = data.activeProject ?? data.project ?? null;
      const nextList = Array.isArray(data.projects) ? data.projects : [];

      setProject(nextActive);
      setProjects(nextList);
      setDataForSeoConfigured(Boolean(data.dataForSeoConfigured));

      if (typeof window !== "undefined") {
        if (nextActive) {
          localStorage.setItem(CACHE_PROJECT_KEY, JSON.stringify(nextActive));
        }
        localStorage.setItem(CACHE_PROJECTS_KEY, JSON.stringify(nextList));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Hydrate cached project state safely on client mount
    const cachedP = readCachedProject();
    if (cachedP) {
      setProject(cachedP);
    }
    const cachedList = readCachedProjects();
    if (cachedList && cachedList.length > 0) {
      setProjects(cachedList);
    }
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
      const nextActive = (data.activeProject ?? data.project) as DashboardProject;
      setProject(nextActive);
      if (Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_PROJECTS_KEY, JSON.stringify(data.projects));
        }
      }
      if (typeof window !== "undefined" && nextActive) {
        localStorage.setItem(CACHE_PROJECT_KEY, JSON.stringify(nextActive));
      }
      if (data.dataForSeoConfigured !== undefined) {
        setDataForSeoConfigured(Boolean(data.dataForSeoConfigured));
      }
      return nextActive;
    },
    [],
  );

  const selectProject = useCallback(async (id: string) => {
    const res = await fetch(`/api/dashboard/projects/${id}/select`, {
      method: "POST",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to select project");
    const nextActive = (data.activeProject ?? data.project) as DashboardProject;
    setProject(nextActive);
    if (Array.isArray(data.projects)) {
      setProjects(data.projects);
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_PROJECTS_KEY, JSON.stringify(data.projects));
      }
    }
    if (typeof window !== "undefined" && nextActive) {
      localStorage.setItem(CACHE_PROJECT_KEY, JSON.stringify(nextActive));
    }
    return nextActive;
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
      const nextActive = data.project as DashboardProject;
      setProject(nextActive);
      setProjects((prev) => {
        const nextList = prev.map((p) => (p.id === nextActive.id ? nextActive : p));
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_PROJECTS_KEY, JSON.stringify(nextList));
          localStorage.setItem(CACHE_PROJECT_KEY, JSON.stringify(nextActive));
        }
        return nextList;
      });
      return nextActive;
    },
    [],
  );

  const renameProject = useCallback(
    async (id: string, name: string) => {
      const res = await fetch(`/api/dashboard/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Rename failed");
      const updated = data.project as DashboardProject;
      setProjects((prev) => {
        const nextList = prev.map((p) => (p.id === id ? { ...p, name: updated.name } : p));
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_PROJECTS_KEY, JSON.stringify(nextList));
        }
        return nextList;
      });
      setProject((curr) => {
        if (curr?.id === id) {
          const nextActive = { ...curr, name: updated.name };
          if (typeof window !== "undefined") {
            localStorage.setItem(CACHE_PROJECT_KEY, JSON.stringify(nextActive));
          }
          return nextActive;
        }
        return curr;
      });
      return updated;
    },
    [],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/dashboard/projects/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      const nextActive = data.activeProject as DashboardProject | null;
      setProject(nextActive);
      setProjects((prev) => {
        const nextList = prev.filter((p) => p.id !== id);
        if (typeof window !== "undefined") {
          localStorage.setItem(CACHE_PROJECTS_KEY, JSON.stringify(nextList));
          if (nextActive) {
            localStorage.setItem(CACHE_PROJECT_KEY, JSON.stringify(nextActive));
          } else {
            localStorage.removeItem(CACHE_PROJECT_KEY);
          }
        }
        return nextList;
      });
    },
    [],
  );

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

export function useDashboardProject() {
  const ctx = useContext(DashboardProjectContext);
  if (!ctx) {
    throw new Error(
      "useDashboardProject must be used within DashboardProjectProvider",
    );
  }
  return ctx;
}
