"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DashboardModal } from "@/components/dashboard/DashboardModal";
import { buttonGhostClass } from "@/components/dashboard/ui";
import {
  useDashboardProject,
  type DashboardProject,
} from "@/components/dashboard/useDashboardProject";

export function DeleteProjectModal({
  project,
  open,
  onClose,
}: {
  project: DashboardProject | null;
  open: boolean;
  onClose: () => void;
}) {
  const { deleteProject } = useDashboardProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!project) return;
    setLoading(true);
    setError("");
    try {
      await deleteProject(project.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardModal
      open={open}
      onClose={onClose}
      title="Delete Project"
      description={`Are you sure you want to delete ${project?.name || project?.domain}?`}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-ink-muted leading-relaxed">
          This will remove the project for <strong className="text-snow">{project?.domain}</strong>.
          If this was your active project, the dashboard will automatically switch to another saved project.
        </p>

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
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-red-500 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? "Deleting..." : "Delete project"}
          </button>
        </div>
      </div>
    </DashboardModal>
  );
}
