"use client";

import { FormEvent, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { SearchPanel } from "@/components/dashboard/SearchToolbar";
import {
  buttonPrimaryClass,
  DashboardAlert,
  EmptyBlock,
  inputClass,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

export default function PromptExplorerPage() {
  const { dataForSeoConfigured, loading: projectLoading } = useDashboardProject();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{
    prompt: string;
    answer: string;
    sources: Array<{ title: string; url: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/prompt-explorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prompt failed");
    } finally {
      setLoading(false);
    }
  }

  if (projectLoading) {
    return (
      <DashboardShell title="Prompt Explorer">
        <LoadingBlock />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Prompt Explorer"
      description="Run prompts across AI models and inspect answers with citations"
    >
      <PageStack className="max-w-4xl">
        <DataForSeoBanner configured={dataForSeoConfigured} />
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <SearchPanel
          title="Run an AI prompt"
          description="Test how models answer SEO-relevant questions with cited sources."
        >
          <form onSubmit={onSubmit} className="space-y-4">
            <textarea
              className={`${inputClass} min-h-[140px] resize-y`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything — e.g. What are the best SEO tools for e-commerce in 2026?"
              required
            />
            <button type="submit" disabled={loading} className={buttonPrimaryClass}>
              {loading ? "Running prompt..." : "Run prompt"}
            </button>
          </form>
        </SearchPanel>

        {loading ? <LoadingBlock label="Running prompt across AI models..." /> : null}

        {result ? (
          <>
            <ResultsPanel title="Response">
              <div className="whitespace-pre-wrap rounded-xl border border-line bg-bg p-5 text-sm leading-relaxed text-ink">
                {result.answer}
              </div>
            </ResultsPanel>
            {result.sources.length > 0 ? (
              <ResultsPanel title="Sources">
                <ul className="space-y-2">
                  {result.sources.map((s) => (
                    <li
                      key={s.url}
                      className="rounded-lg border border-line bg-bg px-4 py-3 text-sm transition hover:border-accent/25"
                    >
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {s.title || s.url}
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
              icon={MessageSquare}
              title="Explore AI search prompts"
              description="Test how AI models answer questions relevant to your SEO strategy."
            />
          )
        )}
      </PageStack>
    </DashboardShell>
  );
}
