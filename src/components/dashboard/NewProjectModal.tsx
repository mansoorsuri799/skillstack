"use client";

import { useState, type FormEvent } from "react";
import { Globe, Plus, Sparkles } from "lucide-react";
import { DashboardModal } from "@/components/dashboard/DashboardModal";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  inputClass,
} from "@/components/dashboard/ui";
import {
  useDashboardProject,
  type DashboardProject,
} from "@/components/dashboard/useDashboardProject";
import { normalizeDomain } from "@/lib/dataforseo/client";

export function NewProjectModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (project: DashboardProject) => void;
}) {
  const { createProject } = useDashboardProject();
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cleanDomain = normalizeDomain(domain);
  const derivedPlaceholder = cleanDomain
    ? cleanDomain.split(".")[0]?.charAt(0).toUpperCase() +
      cleanDomain.split(".")[0]?.slice(1)
    : "e.g. Card Rummy";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const targetDomain = normalizeDomain(domain);
    if (!targetDomain || !targetDomain.includes(".")) {
      setError("Please enter a valid domain (e.g. cardrummy.app)");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const newProj = await createProject(targetDomain, name.trim() || undefined);
      setDomain("");
      setName("");
      onCreated?.(newProj);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setError("");
    onClose();
  }

  return (
    <DashboardModal
      open={open}
      onClose={handleClose}
      title="New Project"
      description="Create a dedicated SEO project for a new website. Your worked projects stay saved in your sidebar."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Domain URL <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              autoFocus
              placeholder="e.g. cardrummy.app or mywebsite.com"
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                if (error) setError("");
              }}
              className={`${inputClass} !pl-9`}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Project Name <span className="text-[11px] font-normal normal-case text-ink-muted/70">(optional)</span>
          </label>
          <input
            type="text"
            placeholder={derivedPlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            disabled={loading}
          />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className={buttonGhostClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !domain.trim()}
            className={`${buttonPrimaryClass} inline-flex items-center gap-1.5 disabled:opacity-50`}
          >
            {loading ? (
              "Creating..."
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </DashboardModal>
  );
}
