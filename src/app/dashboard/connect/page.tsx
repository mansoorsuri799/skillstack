"use client";

import { useCallback, useEffect, useState } from "react";
import { Bot, Check, Copy, Key, RefreshCw, Terminal } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  LoadingBlock,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

export default function ConnectPage() {
  const { project, loading: projectLoading } = useDashboardProject();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/connect");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApiKey(data.apiKey);
      setApiBaseUrl(data.apiBaseUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function generateKey() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setApiKey(data.apiKey);
      setApiBaseUrl(data.apiBaseUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate key");
    } finally {
      setGenerating(false);
    }
  }

  async function revokeKey() {
    setGenerating(true);
    try {
      await fetch("/api/dashboard/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });
      setApiKey(null);
    } finally {
      setGenerating(false);
    }
  }

  function copy(text: string, id: string) {
    void navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const curlExample = apiKey
    ? `curl -X POST "${apiBaseUrl}/keywords/research" \\
  -H "Content-Type: application/json" \\
  -H "x-skillstack-key: ${apiKey}" \\
  -d '{"seed":"seo tools pakistan","limit":25}'`
    : "";

  const mcpConfig = apiKey
    ? `{
  "mcpServers": {
    "skillstack-seo": {
      "command": "npx",
      "args": ["-y", "curl", "-s"],
      "env": {
        "SKILLSTACK_API_URL": "${apiBaseUrl}",
        "SKILLSTACK_API_KEY": "${apiKey}"
      }
    }
  }
}`
    : "";

  return (
    <DashboardShell
      title="AI & MCP"
      description="Connect Claude, Cursor, or Codex to your SEO workspace"
    >
      <PageStack className="max-w-4xl">
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}

        <ResultsPanel title="Your dashboard API key">
          <p className="mb-4 text-sm text-ink-muted">
            Generate a personal key to call dashboard APIs from scripts, automations,
            or AI agents. Project domain:{" "}
            <strong className="text-snow">{project?.domain}</strong>
          </p>

          {apiKey ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="flex-1 break-all rounded-lg border border-line bg-bg px-3 py-2 font-mono text-xs text-accent">
                {apiKey}
              </code>
              <button
                type="button"
                onClick={() => copy(apiKey, "key")}
                className={buttonGhostClass}
              >
                {copied === "key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy
              </button>
              <button
                type="button"
                onClick={() => void revokeKey()}
                disabled={generating}
                className={buttonGhostClass}
              >
                Revoke
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void generateKey()}
              disabled={generating}
              className={buttonPrimaryClass}
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" /> Generate API key
                </>
              )}
            </button>
          )}

          {project?.mcpConnected ? (
            <p className="mt-3 text-xs text-accent">MCP integration marked as connected.</p>
          ) : null}
        </ResultsPanel>

        {apiKey ? (
          <>
            <ResultsPanel title="Test with curl">
              <div className="flex items-start gap-2 rounded-lg border border-line bg-bg p-3">
                <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
                <pre className="flex-1 overflow-x-auto whitespace-pre-wrap font-mono text-xs text-ink-muted">
                  {curlExample}
                </pre>
                <button
                  type="button"
                  onClick={() => copy(curlExample, "curl")}
                  className={buttonGhostClass}
                >
                  {copied === "curl" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </ResultsPanel>

            <ResultsPanel title="Available API endpoints">
              <ul className="space-y-2 text-sm text-ink-muted">
                <li><code className="text-accent">POST /keywords/research</code> — keyword ideas</li>
                <li><code className="text-accent">POST /domain</code> — domain overview</li>
                <li><code className="text-accent">POST /backlinks</code> — backlink profile</li>
                <li><code className="text-accent">POST /brand-lookup</code> — AI brand visibility</li>
                <li><code className="text-accent">POST /prompt-explorer</code> — run AI prompts</li>
                <li><code className="text-accent">GET/POST /rank-tracking</code> — SERP positions</li>
                <li><code className="text-accent">POST /audit</code> — Lighthouse site audit</li>
                <li><code className="text-accent">GET /gsc?tab=queries</code> — Search Console data</li>
              </ul>
              <p className="mt-3 text-xs text-ink-muted">
                Send header: <code className="rounded bg-black/30 px-1">x-skillstack-key: your-key</code>
              </p>
            </ResultsPanel>

            <ResultsPanel title="Claude Desktop / Cursor MCP">
              <pre className="overflow-x-auto rounded-lg border border-line bg-bg p-4 text-xs leading-relaxed text-ink-muted">
                {mcpConfig}
              </pre>
              <button
                type="button"
                onClick={() => copy(mcpConfig, "mcp")}
                className={`${buttonGhostClass} mt-3`}
              >
                {copied === "mcp" ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy MCP config
                  </>
                )}
              </button>
            </ResultsPanel>
          </>
        ) : null}

        <ResultsPanel title="Supported agents">
          <div className="grid gap-3 sm:grid-cols-2">
            {["Claude Code", "Claude Desktop", "Cursor", "Codex", "Windsurf"].map(
              (agent) => (
                <div
                  key={agent}
                  className="flex items-center gap-3 rounded-lg border border-line bg-bg p-4"
                >
                  <Bot className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-snow">{agent}</span>
                </div>
              ),
            )}
          </div>
        </ResultsPanel>
      </PageStack>
    </DashboardShell>
  );
}
