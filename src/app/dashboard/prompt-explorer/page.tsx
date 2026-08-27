"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { AiToolLimitNotice } from "@/components/dashboard/AiToolLimitNotice";
import { PromptExplorerUnlock } from "@/components/dashboard/PromptExplorerUnlock";
import {
  buttonPrimaryClass,
  DashboardAlert,
  inputClass,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import type { AiToolUsage } from "@/lib/dashboard/ai-tool-limits";

export default function PromptExplorerPage() {
  const { dataForSeoConfigured, loading: projectLoading } = useDashboardProject();
  const [prompt, setPrompt] = useState("");
  const [usage, setUsage] = useState<AiToolUsage | null>(null);
  const [result, setResult] = useState<{
    prompt: string;
    answer: string;
    sources: Array<{ title: string; url: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/prompt-explorer");
      const data = await res.json();
      if (res.ok) setUsage(data.usage ?? null);
    } catch {
      /* usage banner is optional */
    }
  }, []);

  useEffect(() => {
    if (!projectLoading) void loadUsage();
  }, [projectLoading, loadUsage]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (usage?.remaining === 0) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/dashboard/prompt-explorer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.usage) setUsage(data.usage);
        throw new Error(data.message);
      }
      if (data.usage) setUsage(data.usage);
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

  const limitReached = Boolean(usage && !usage.unlimited && usage.remaining === 0);

  const promptForm =
    dataForSeoConfigured && !limitReached ? (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-snow">Try Prompt Explorer</p>
          <p className="mt-1 text-sm text-ink-muted">
            DataForSEO is connected — run a prompt and inspect the model answer with cited sources.
          </p>
          <div className="mt-2">
            <AiToolLimitNotice usage={usage} featureLabel="Prompt Explorer" />
          </div>
        </div>
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            className={`${inputClass} min-h-[120px] resize-y`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything — e.g. What are the best SEO tools for e-commerce in 2026?"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading} className={buttonPrimaryClass}>
            {loading ? "Running prompt..." : "Run prompt"}
          </button>
        </form>
      </div>
    ) : dataForSeoConfigured && limitReached ? (
      <AiToolLimitNotice usage={usage} featureLabel="Prompt Explorer" />
    ) : null;

  return (
    <DashboardShell
      title="Prompt Explorer"
      description="Ask any prompt across ChatGPT, Claude, Gemini, and Perplexity side-by-side."
    >
      <PageStack className="max-w-5xl">
        <PromptExplorerUnlock footer={promptForm} />

        {loading ? <LoadingBlock label="Running prompt across AI models..." /> : null}

        {result ? (
          <>
            <ResultsPanel title="Response">
              <div className="whitespace-pre-wrap rounded-xl border border-line bg-bg p-5 text-sm leading-relaxed text-ink">
                {result.answer}
              </div>
            </ResultsPanel>
            {result.sources.length > 0 ? (
              <ResultsPanel title="Sources cited">
                <ul className="space-y-2">
                  {result.sources.map((s) => (
                    <li
                      key={s.url}
                      className="flex items-start justify-between gap-3 rounded-lg border border-line bg-bg px-4 py-3 text-sm transition hover:border-accent/25"
                    >
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 text-accent hover:underline"
                      >
                        {s.title || s.url}
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
