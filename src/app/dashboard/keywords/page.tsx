"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  KeywordResearchPanel,
  type KeywordResearchRow,
} from "@/components/dashboard/keyword-research/KeywordResearchPanel";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { LoadingBlock, PageStack } from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";
import type {
  SeedKeywordInsights,
  SerpResultRow,
} from "@/lib/dataforseo/keyword-research";
import {
  clearKeywordResearchSession,
  loadKeywordResearchSession,
  readLocalKeywordSession,
  saveKeywordResearchSession,
  type KeywordResearchSession,
} from "@/lib/dashboard/keyword-research-session";
import { type KeywordMode } from "@/lib/dashboard/locations";

function applySession(
  session: KeywordResearchSession,
  setters: {
    setSeed: (value: string) => void;
    setLocationCode: (value: number) => void;
    setLimit: (value: number) => void;
    setMode: (value: KeywordMode) => void;
    setClickstreamEnabled: (value: boolean) => void;
    setResults: (value: KeywordResearchRow[]) => void;
    setSeedInsights: (value: SeedKeywordInsights | null) => void;
    setSerpResults: (value: SerpResultRow[]) => void;
  },
) {
  setters.setSeed(session.seed);
  setters.setLocationCode(session.locationCode);
  setters.setLimit(session.limit);
  setters.setMode(session.mode);
  setters.setClickstreamEnabled(session.useClickstream);
  setters.setResults(session.results);
  setters.setSeedInsights(session.seedInsights);
  setters.setSerpResults(session.serpResults);
}

export default function KeywordsPage() {
  const { project, dataForSeoConfigured, loading: projectLoading } =
    useDashboardProject();
  const [seed, setSeed] = useState("");
  const [locationCode, setLocationCode] = useState<number>(2840);
  const [limit, setLimit] = useState<number>(150);
  const [mode, setMode] = useState<KeywordMode>("auto");
  const [clickstreamEnabled, setClickstreamEnabled] = useState(true);
  const [results, setResults] = useState<KeywordResearchRow[]>([]);
  const [seedInsights, setSeedInsights] = useState<SeedKeywordInsights | null>(null);
  const [serpResults, setSerpResults] = useState<SerpResultRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  const restoreSession = useCallback((session: KeywordResearchSession) => {
    applySession(session, {
      setSeed,
      setLocationCode,
      setLimit,
      setMode,
      setClickstreamEnabled,
      setResults,
      setSeedInsights,
      setSerpResults,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const local = readLocalKeywordSession();
      if (local && !cancelled) restoreSession(local);

      const server = await loadKeywordResearchSession();
      if (!cancelled && server) restoreSession(server);

      if (!cancelled) setSessionReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [restoreSession]);

  useEffect(() => {
    if (project?.locationCode && results.length === 0) {
      setLocationCode(project.locationCode);
    }
  }, [project, results.length]);

  async function onResearch(searchSeed?: string) {
    const keyword = (searchSeed ?? seed).trim();
    if (!keyword) return;
    if (searchSeed && searchSeed !== seed) setSeed(searchSeed);

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/dashboard/keywords/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seed: keyword,
          locationCode,
          limit,
          mode,
          useClickstream: clickstreamEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const nextResults = data.results ?? [];
      const nextInsights = data.seedInsights ?? null;
      const nextSerp = data.serpResults ?? [];

      setResults(nextResults);
      setSeedInsights(nextInsights);
      setSerpResults(nextSerp);

      if (nextResults.length > 0) {
        void saveKeywordResearchSession({
          seed: keyword,
          locationCode,
          limit,
          mode,
          useClickstream: clickstreamEnabled,
          results: nextResults,
          seedInsights: nextInsights,
          serpResults: nextSerp,
          savedAt: new Date().toISOString(),
        });
      }

      if (nextResults.length === 0) {
        setError("No keywords found for that seed. Try a different keyword or mode.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
      setResults([]);
      setSeedInsights(null);
      setSerpResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSeedChange(value: string) {
    setSeed(value);
    if (!value.trim()) {
      setResults([]);
      setSeedInsights(null);
      setSerpResults([]);
      setError("");
      void clearKeywordResearchSession();
    }
  }

  async function saveKeyword(row: KeywordResearchRow) {
    setMessage("");
    const res = await fetch("/api/dashboard/keywords/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: [row] }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "Save failed");
      return;
    }
    setMessage(`Saved "${row.keyword}"`);
  }

  return (
    <DashboardShell
      title="Keyword Research"
      description="Discover keyword ideas, search demand, and ranking opportunities."
    >
      <PageStack className="!max-w-none w-full">
        <DataForSeoBanner configured={dataForSeoConfigured} />

        <KeywordResearchPanel
          seed={seed}
          onSeedChange={handleSeedChange}
          locationCode={locationCode}
          onLocationChange={setLocationCode}
          limit={limit}
          onLimitChange={setLimit}
          mode={mode}
          onModeChange={setMode}
          clickstreamEnabled={clickstreamEnabled}
          onClickstreamChange={setClickstreamEnabled}
          results={results}
          seedInsights={seedInsights}
          serpResults={serpResults}
          loading={loading}
          error={error}
          message={message}
          onResearch={(nextSeed) => void onResearch(nextSeed)}
          onSaveKeyword={(row) => void saveKeyword(row)}
        />
      </PageStack>
    </DashboardShell>
  );
}
