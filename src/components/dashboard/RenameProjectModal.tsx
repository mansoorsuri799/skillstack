"use client";

import { useEffect, useState, type FormEvent } from "react";
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

export function RenameProjectModal({
  project,
  open,
  onClose,
}: {
  project: DashboardProject | null;
  open: boolean;
  onClose: () => void;
}) {
  const { renameProject } = useDashboardProject();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name);
      setError("");
    }
  }, [project, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await renameProject(project.id, name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardModal
      open={open}
      onClose={onClose}
      title="Rename Project"
      description={`Update display name for ${project?.domain || "project"}.`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Project Name
          </label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            className={inputClass}
            disabled={loading}
            required
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
            onClick={onClose}
            disabled={loading}
            className={buttonGhostClass}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={`${buttonPrimaryClass} disabled:opacity-50`}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </DashboardModal>
  );
}
