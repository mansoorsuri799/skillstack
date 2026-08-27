"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Link2, Target } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { AiToolLimitNotice } from "@/components/dashboard/AiToolLimitNotice";
import { BrandLookupUnlock } from "@/components/dashboard/BrandLookupUnlock";
import { SearchToolbar } from "@/components/dashboard/SearchToolbar";
import {
  DashboardAlert,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import type { AiToolUsage } from "@/lib/dashboard/ai-tool-limits";

export default function BrandLookupPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [brand, setBrand] = useState("");
  const [usage, setUsage] = useState<AiToolUsage | null>(null);
  const [result, setResult] = useState<{
    brand: string;
    answer: string;
    citations: Array<{ title: string; url: string }>;
    domainMentioned: boolean;
    mentionCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/brand-lookup");
      const data = await res.json();
      if (res.ok) setUsage(data.usage ?? null);
    } catch {
      /* usage banner is optional */
    }
  }, []);

  useEffect(() => {
    if (!projectLoading) void loadUsage();
  }, [projectLoading, loadUsage]);

  async function onSubmit() {
    if (!brand.trim() || usage?.remaining === 0) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/dashboard/brand-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.usage) setUsage(data.usage);
        throw new Error(data.message);
      }
      if (data.usage) setUsage(data.usage);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  if (projectLoading) {
    return (
      <DashboardShell title="Brand Lookup">
        <LoadingBlock />
      </DashboardShell>
    );
  }

  const limitReached = Boolean(usage && !usage.unlimited && usage.remaining === 0);

  const lookupForm =
    dataForSeoConfigured && !limitReached ? (
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-snow">Try Brand Lookup</p>
          <p className="mt-1 text-sm text-ink-muted">
            DataForSEO is connected — check how a brand appears in AI answers and cited sources
            {project ? ` for ${project.domain}.` : "."}
          </p>
          <div className="mt-2">
            <AiToolLimitNotice usage={usage} featureLabel="Brand Lookup" />
          </div>
        </div>
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
        <SearchToolbar
          value={brand}
          onChange={setBrand}
          onSubmit={() => void onSubmit()}
          placeholder="Brand or company name"
          inputLabel="Brand name"
          loading={loading}
          submitLabel={loading ? "Looking up..." : "Lookup brand"}
        />
      </div>
    ) : dataForSeoConfigured && limitReached ? (
      <AiToolLimitNotice usage={usage} featureLabel="Brand Lookup" />
    ) : null;

  return (
    <DashboardShell
      title="Brand Lookup"
      description="See how AI search cites any brand name or domain."
    >
      <PageStack className="max-w-5xl">
        <BrandLookupUnlock footer={lookupForm} />

        {loading ? <LoadingBlock label="Querying AI search data..." /> : null}

        {result ? (
          <>
            <MetricGrid className="sm:grid-cols-2">
              <MetricTile
                label="Citations found"
                value={result.mentionCount}
                icon={Link2}
                featured
              />
              <MetricTile
                label="Your domain cited"
                value={result.domainMentioned ? "Yes" : "No"}
                icon={Target}
                featured
              />
            </MetricGrid>
            <ResultsPanel title="AI answer snapshot">
              <div className="whitespace-pre-wrap rounded-xl border border-line bg-bg p-5 text-sm leading-relaxed text-ink">
                {result.answer || "No answer text returned."}
              </div>
            </ResultsPanel>
            {result.citations.length > 0 ? (
              <ResultsPanel title="Sources cited">
                <ul className="space-y-2">
                  {result.citations.map((c) => (
                    <li
                      key={c.url}
                      className="flex items-start justify-between gap-3 rounded-lg border border-line bg-bg px-4 py-3 text-sm transition hover:border-accent/25"
                    >
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 text-accent hover:underline"
                      >
                        {c.title || c.url}
                      </a>
                      <ExternalLink className="h-4 w-4 shrink-0 text-ink-muted" />
                    </li>
                  ))}
                </ul>
              </ResultsPanel>
            ) : null}
          </>
        ) : null}
      </PageStack>
    </DashboardShell>
  );
}
