"use client";

import { useState } from "react";
import { Link2, Sparkles, Target } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { SearchPanel, SearchToolbar } from "@/components/dashboard/SearchToolbar";
import {
  DashboardAlert,
  EmptyBlock,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

export default function BrandLookupPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [brand, setBrand] = useState("");
  const [result, setResult] = useState<{
    brand: string;
    answer: string;
    citations: Array<{ title: string; url: string }>;
    domainMentioned: boolean;
    mentionCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit() {
    if (!brand.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/brand-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
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

  return (
    <DashboardShell
      title="Brand Lookup"
      description="AI search visibility — see how brands appear in LLM answers"
    >
      <PageStack className="max-w-4xl">
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Brand visibility check"
          description="See how a brand is mentioned and cited in AI-generated answers."
        >
          <SearchToolbar
            value={brand}
            onChange={setBrand}
            onSubmit={() => void onSubmit()}
            placeholder="Brand or company name"
            loading={loading}
            submitLabel="Lookup brand"
          />
          {project ? (
            <p className="mt-4 text-xs text-ink-muted">
              Checking citations against your domain:{" "}
              <span className="text-snow">{project.domain}</span>
            </p>
          ) : null}
        </SearchPanel>

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
                      className="rounded-lg border border-line bg-bg px-4 py-3 text-sm transition hover:border-accent/25"
                    >
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {c.title || c.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </ResultsPanel>
            ) : null}
          </>
        ) : (
          !loading && (
            <EmptyBlock
              icon={Sparkles}
              title="Measure AI brand visibility"
              description="See how often a brand is mentioned and cited in AI-generated answers."
            />
          )
        )}
      </PageStack>
    </DashboardShell>
  );
}
