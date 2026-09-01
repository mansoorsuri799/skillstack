"use client";

import { useState } from "react";
import {
  DashboardAlert,
  buttonPrimaryClass,
  inputClass,
} from "@/components/dashboard/ui";
import type { DashboardProject } from "@/components/dashboard/useDashboardProject";

export function ProjectDomainBanner({
  project,
  onSave,
}: {
  project: DashboardProject;
  onSave: (domain: string) => Promise<void>;
}) {
  const [domain, setDomain] = useState(project.domain);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const needsSetup = project.domain === "example.com";

  if (!needsSetup && domain === project.domain) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(domain);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardAlert variant={needsSetup ? "info" : "success"}>
      <form onSubmit={handleSave} className="space-y-3">
        <p className="font-medium text-snow">
          {needsSetup
            ? "Set your site domain to unlock SEO tools"
            : "Update your project domain"}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={inputClass}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="skillstack.com.pk"
          />
          <button type="submit" disabled={saving} className={buttonPrimaryClass}>
            {saving ? "Saving..." : "Save domain"}
          </button>
        </div>
        {error ? <p className="text-red-300">{error}</p> : null}
      </form>
    </DashboardAlert>
  );
}

export function DataForSeoBanner({ configured }: { configured: boolean }) {
  if (configured) return null;
  return (
    <DashboardAlert>
      Add <code className="rounded bg-black/30 px-1">DATAFORSEO_API_KEY</code> to{" "}
      <code className="rounded bg-black/30 px-1">.env.local</code> (base64 of{" "}
      <code className="rounded bg-black/30 px-1">login:password</code>) to enable live
      keyword, domain, backlink, and audit data from DataForSEO.
    </DashboardAlert>
  );
}

export function FirecrawlBanner({ configured }: { configured: boolean }) {
  if (configured) return null;
  return (
    <DashboardAlert>
      Add <code className="rounded bg-black/30 px-1">FIRECRAWL_API_KEY</code> to{" "}
      <code className="rounded bg-black/30 px-1">.env.local</code> to load live Google
      first-page results for competitors, keyword SERP, and brand lookup.
    </DashboardAlert>
  );
}
