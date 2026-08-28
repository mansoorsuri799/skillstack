"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, ExternalLink, RefreshCw, Unplug } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { connectWithGoogleClass, GoogleIcon } from "@/components/dashboard/GoogleIcon";
import { TabBar } from "@/components/dashboard/SearchToolbar";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  DashboardAlert,
  EmptyBlock,
  LoadingBlock,
  MetricGrid,
  MetricTile,
  PageStack,
  ResultsPanel,
} from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

type GscTab = "queries" | "pages" | "countries" | "devices";

type GscRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

function formatOAuthError(raw: string) {
  const decoded = decodeURIComponent(raw);
  if (decoded.includes("redirect_uri_mismatch")) {
    return "Google sign-in could not be completed. Please try again or contact support if the problem continues.";
  }
  return decoded;
}

export default function GscInsightsClient() {
  const searchParams = useSearchParams();
  const { project, loading: projectLoading, refresh: refreshProject } =
    useDashboardProject();
  const [tab, setTab] = useState<GscTab>("queries");
  const [rows, setRows] = useState<GscRow[]>([]);
  const [summary, setSummary] = useState<{
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  } | null>(null);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [pendingSites, setPendingSites] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [oauthConfigured, setOauthConfigured] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    const ok = searchParams.get("connected");
    const select = searchParams.get("select");
    if (err) setError(formatOAuthError(err));
    if (ok) {
      setMessage("Search Console connected successfully.");
      void refreshProject();
    }
    if (select) setMessage("Choose which Search Console property to link.");
  }, [searchParams, refreshProject]);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/gsc?tab=queries");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setOauthConfigured(data.oauthConfigured !== false);
      setPendingSites(data.pendingSites ?? []);
      setSelectedSite(data.pendingSites?.[0] ?? "");
      setConnected(Boolean(data.connected));
      if (data.connected) {
        setRows(data.rows ?? []);
        setSummary(data.summary);
        setSiteUrl(data.siteUrl ?? null);
      }
    } catch (err) {
      setError((prev) => prev || (err instanceof Error ? err.message : "Load failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async (nextTab: GscTab = tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/gsc?tab=${nextTab}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setConnected(Boolean(data.connected));
      setRows(data.rows ?? []);
      setSummary(data.summary);
      setSiteUrl(data.siteUrl ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (!projectLoading) {
      void loadStatus();
    }
  }, [projectLoading, loadStatus]);

  useEffect(() => {
    if (!projectLoading && project?.gscConnected && connected) {
      void loadData(tab);
    }
  }, [projectLoading, project?.gscConnected, connected, tab, loadData]);

  function switchTab(next: GscTab) {
    setTab(next);
    if (connected) void loadData(next);
  }

  async function confirmProperty() {
    if (!selectedSite) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/gsc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: selectedSite }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPendingSites([]);
      setMessage("Search Console connected successfully.");
      await refreshProject();
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save property");
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    const res = await fetch("/api/dashboard/gsc", { method: "DELETE" });
    if (res.ok) {
      setConnected(false);
      setPendingSites([]);
      setRows([]);
      setSummary(null);
      setSiteUrl(null);
      setMessage("Search Console disconnected.");
      await refreshProject();
    }
  }

  const showConnect =
    !project?.gscConnected && !connected && pendingSites.length === 0;
  const showPropertyPicker = pendingSites.length > 0;

  return (
    <DashboardShell
      title="GSC Insights"
      description="Google Search Console queries, pages, and performance"
      actions={
        connected ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadData(tab)}
              disabled={loading}
              className={buttonGhostClass}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
              Refresh
            </button>
            <button type="button" onClick={() => void disconnect()} className={buttonGhostClass}>
              <Unplug className="h-4 w-4" /> Disconnect
            </button>
          </div>
        ) : null
      }
    >
      <PageStack>
        {error ? <DashboardAlert variant="error">{error}</DashboardAlert> : null}
        {message ? <DashboardAlert variant="success">{message}</DashboardAlert> : null}

        {showPropertyPicker ? (
          <ResultsPanel title="Choose Search Console property">
            <p className="text-sm text-ink-muted">
              Multiple properties match <strong className="text-snow">{project?.domain}</strong>.
              Pick the one you want SkillStack to use.
            </p>
            <div className="mt-4 space-y-2">
              {pendingSites.map((site) => (
                <label
                  key={site}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-bg px-4 py-3"
                >
                  <input
                    type="radio"
                    name="gsc-site"
                    value={site}
                    checked={selectedSite === site}
                    onChange={() => setSelectedSite(site)}
                  />
                  <span className="truncate text-sm text-snow">{site}</span>
                </label>
              ))}
            </div>
            <div className="mt-6">
              <button
                type="button"
                className={buttonPrimaryClass}
                disabled={loading || !selectedSite}
                onClick={() => void confirmProperty()}
              >
                Use this property
              </button>
            </div>
          </ResultsPanel>
        ) : null}

        {showConnect ? (
          <ResultsPanel title="Connect Google Search Console">
            <p className="text-sm text-ink-muted">
              Sign in with the Google account that has access to Search Console for{" "}
              <strong className="text-snow">{project?.domain}</strong>. Each SkillStack
              user connects their own Google account — your data stays private to your
              project.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-ink-muted">
              <li>1. Verify your site in Google Search Console first</li>
              <li>2. Set your project domain in dashboard settings to match that property</li>
              <li>3. Click connect and approve read-only access</li>
            </ul>
            {!oauthConfigured ? (
              <DashboardAlert variant="error">
                Google OAuth is not configured on this SkillStack deployment.
              </DashboardAlert>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/api/dashboard/gsc/connect" className={connectWithGoogleClass}>
                <GoogleIcon className="h-[18px] w-[18px]" />
                Connect with Google
              </a>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className={buttonGhostClass}
              >
                Open Search Console <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </ResultsPanel>
        ) : null}

        {connected && summary ? (
          <MetricGrid className="lg:grid-cols-4">
            <MetricTile label="Total clicks" value={summary.clicks} hint="Last 28 days" />
            <MetricTile label="Impressions" value={summary.impressions} hint="Last 28 days" />
            <MetricTile label="Avg. CTR" value={`${summary.ctr}%`} />
            <MetricTile label="Avg. position" value={summary.position} />
          </MetricGrid>
        ) : null}

        {connected ? (
          <ResultsPanel
            title="Search performance"
            description={siteUrl ? `Property: ${siteUrl}` : undefined}
          >
            <TabBar
              tabs={[
                { id: "queries", label: "Queries" },
                { id: "pages", label: "Pages" },
                { id: "countries", label: "Countries" },
                { id: "devices", label: "Devices" },
              ]}
              active={tab}
              onChange={switchTab}
            />

            {loading ? (
              <div className="mt-4">
                <LoadingBlock label="Loading Search Console data..." />
              </div>
            ) : rows.length > 0 ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-ink-muted">
                      <th className="pb-3 pr-4 font-medium">
                        {tab === "queries"
                          ? "Query"
                          : tab === "pages"
                            ? "Page"
                            : tab === "countries"
                              ? "Country"
                              : "Device"}
                      </th>
                      <th className="pb-3 pr-4 font-medium">Clicks</th>
                      <th className="pb-3 pr-4 font-medium">Impressions</th>
                      <th className="pb-3 pr-4 font-medium">CTR</th>
                      <th className="pb-3 font-medium">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.key} className="border-b border-line/60">
                        <td className="max-w-md truncate py-3 pr-4 font-medium text-snow">
                          {row.key}
                        </td>
                        <td className="py-3 pr-4 text-ink-muted">{row.clicks}</td>
                        <td className="py-3 pr-4 text-ink-muted">{row.impressions}</td>
                        <td className="py-3 pr-4 text-ink-muted">{row.ctr}%</td>
                        <td className="py-3 text-ink-muted">{row.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4">
                <EmptyBlock
                  title="No data for this tab"
                  description="Search Console may need a few days of data for this property."
                />
              </div>
            )}
          </ResultsPanel>
        ) : null}

        {showConnect ? (
          <EmptyBlock
            icon={BarChart3}
            title="Real clicks & queries from Google"
            description={`After connecting, you'll see query trends, landing pages, and device breakdowns for ${project?.domain ?? "your site"}.`}
          />
        ) : null}
      </PageStack>
    </DashboardShell>
  );
}
