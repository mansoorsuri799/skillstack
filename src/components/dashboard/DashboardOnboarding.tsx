"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  ExternalLink,
  Flame,
  Globe,
  LineChart,
  Link2,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  inputClass,
} from "@/components/dashboard/ui";
import type { DashboardProject } from "@/components/dashboard/useDashboardProject";
import { loadUserPreferences } from "@/lib/dashboard/user-preferences";

type StepId = "domain" | "gsc" | "audit" | "agent";

const SETUP_STEPS: Array<{
  id: StepId;
  badge: string;
  title: string;
  description: string;
  icon: typeof Globe;
  cta: string;
  href?: string;
  reward: string;
}> = [
  {
    id: "domain",
    badge: "Step 1 • Target",
    title: "Configure Primary Domain",
    description: "Anchor all automated crawling, backlinks graph, and SERP rankings to your project domain.",
    icon: Globe,
    cta: "Save domain",
    reward: "+25% Setup Complete",
  },
  {
    id: "gsc",
    badge: "Step 2 • Real-Time Traffic",
    title: "Connect Google Search Console",
    description: "Stream verified Google search clicks, impression anomalies, and query rankings automatically.",
    icon: BarChart3,
    cta: "Connect GSC",
    href: "/dashboard/gsc",
    reward: "Unlocks Live CTR Tracking",
  },
  {
    id: "audit",
    badge: "Step 3 • AI Diagnostics",
    title: "Run Deep AI Site Audit",
    description: "Scan robots.txt, JSON-LD Schemas, Core Web Vitals, and uncover root causes of missing #1 rankings.",
    icon: ClipboardCheck,
    cta: "Execute AI Audit",
    href: "/dashboard/audit",
    reward: "Generates 30-Day Recovery Plan",
  },
  {
    id: "agent",
    badge: "Step 4 • Assistant",
    title: "Launch Suri AI SEO Agent",
    description: "Ask your AI co-pilot to uncover competitor gaps, striking distance keywords, and next SEO moves.",
    icon: Bot,
    cta: "Chat with Suri",
    href: "/dashboard/chat",
    reward: "Activates AI SEO Strategy",
  },
];

const CORE_MODULES = [
  {
    title: "Suri SEO Agent",
    tag: "AI Co-pilot",
    description: "Multi-turn conversational agent with real project memory for keyword ideas and traffic strategy.",
    href: "/dashboard/chat",
    icon: MessageSquare,
    color: "from-accent/20 to-accent/5 text-accent border-accent/30",
    cta: "Open Chat",
  },
  {
    title: "AI Site Audit",
    tag: "AEO & GEO Health",
    description: "Deep crawl evaluating Schema.org, robots.txt, Core Web Vitals, and Google algorithm risks.",
    href: "/dashboard/audit",
    icon: ClipboardCheck,
    color: "from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30",
    cta: "Run Audit",
  },
  {
    title: "Search Console Insights",
    tag: "Google OAuth",
    description: "Real-time clicks, impressions, average CTR, and high-impression/low-CTR anomaly detection.",
    href: "/dashboard/gsc",
    icon: LineChart,
    color: "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30",
    cta: "View Telemetry",
  },
  {
    title: "Organic Keyword Explorer",
    tag: "SERP Intelligence",
    description: "Search volumes, keyword difficulty, CPC estimates, and top-ranking competitor pages.",
    href: "/dashboard/keywords",
    icon: Search,
    color: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30",
    cta: "Research Keywords",
  },
];

export default function DashboardOnboarding({
  project,
  onSaveDomain,
}: {
  project: DashboardProject;
  onSaveDomain: (domain: string) => Promise<void>;
}) {
  const [domainInput, setDomainInput] = useState(project.domain);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<StepId>("domain");
  const [quickSearch, setQuickSearch] = useState("");

  useEffect(() => {
    setDomainInput(project.domain);
  }, [project.domain]);

  const hasCustomDomain = project.domain && project.domain !== "example.com";
  const gscConnected = Boolean(project.gscConnected);

  const completedMap: Record<StepId, boolean> = useMemo(
    () => ({
      domain: Boolean(hasCustomDomain),
      gsc: gscConnected,
      audit: Boolean(hasCustomDomain),
      agent: true,
    }),
    [hasCustomDomain, gscConnected],
  );

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / SETUP_STEPS.length) * 100);

  async function handleSaveDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setSaving(true);
    try {
      await onSaveDomain(domainInput.trim());
      setActiveTab("gsc");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Command Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-[#161b22]/90 via-[#0d1117] to-[#010409] p-6 md:p-10 shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#388bfd]/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SkillStack SEO Command Hub</span>
            </div>
            <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-snow">
              {hasCustomDomain ? (
                <>
                  Optimizing <span className="text-accent">{project.domain}</span>
                </>
              ) : (
                "Launch Your SEO Command Center"
              )}
            </h1>
            <p className="text-sm md:text-base text-ink-muted leading-relaxed">
              Real-time Google search telemetry, AI audit diagnostics, AEO schema generators, and keyword intelligence unified into one workspace.
            </p>
          </div>

          {/* Live System Status Pill Box */}
          <div className="flex flex-col gap-2 rounded-2xl border border-line/80 bg-bg/80 p-4 backdrop-blur-md min-w-[260px]">
            <div className="flex items-center justify-between text-xs text-ink-muted pb-2 border-b border-white/[0.06]">
              <span className="font-semibold text-snow">Hub Telemetry</span>
              <span className="flex items-center gap-1.5 text-accent text-[11px] font-medium">
                <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
                Live Engine
              </span>
            </div>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Active Domain</span>
                <span className="font-mono font-medium text-snow truncate max-w-[130px]">
                  {hasCustomDomain ? project.domain : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">GSC Status</span>
                <span className={`font-semibold ${gscConnected ? "text-emerald-400" : "text-amber-400"}`}>
                  {gscConnected ? "Connected" : "Not linked"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Suri Agent</span>
                <span className="text-accent font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-snow flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Workspace Setup Readiness
            </span>
            <span className="font-bold text-accent tabular-nums">{progressPercent}% Completed</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 p-[1px] border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-accent-deep to-emerald-400 transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive 4-Step Action Matrix */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {SETUP_STEPS.map((step, idx) => {
          const isDone = completedMap[step.id];
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                isDone
                  ? "border-emerald-500/30 bg-emerald-500/[0.03] shadow-sm hover:border-emerald-500/50"
                  : "border-line bg-bg-elevated/90 hover:border-accent/40 hover:bg-bg-elevated shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between pb-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                    isDone
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-line bg-bg text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {isDone ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </span>
                ) : (
                  <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                    {step.badge}
                  </span>
                )}
              </div>

              <h3 className="font-display text-sm font-semibold text-snow mt-1">{step.title}</h3>
              <p className="mt-1.5 text-xs text-ink-muted leading-relaxed min-h-[36px]">
                {step.description}
              </p>

              <div className="mt-4 pt-3 border-t border-white/[0.04]">
                {step.id === "domain" && !isDone ? (
                  <form onSubmit={handleSaveDomain} className="space-y-2">
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="mysite.com"
                      className="w-full rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs text-snow outline-none focus:border-accent"
                      disabled={saving}
                    />
                    <button
                      type="submit"
                      disabled={saving || !domainInput.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent py-1.5 text-xs font-semibold text-[#010409] hover:bg-accent-deep transition disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Domain"}
                    </button>
                  </form>
                ) : step.href ? (
                  <Link
                    href={step.href}
                    className={`w-full inline-flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isDone
                        ? "bg-white/5 text-snow hover:bg-white/10"
                        : "bg-accent text-[#010409] hover:bg-accent-deep shadow-md font-bold"
                    }`}
                  >
                    <span>{step.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium">
                    <span>{step.reward}</span>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Power Modules Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-snow">Core SEO & AI Engine Tools</h2>
            <p className="text-xs text-ink-muted">Launch deep diagnostics, track rankings, or query intelligence.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CORE_MODULES.map((mod, i) => {
            const ModIcon = mod.icon;
            return (
              <Link
                key={i}
                href={mod.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-bg-elevated p-5 transition-all hover:border-accent/40 hover:bg-bg-elevated/80 shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-gradient-to-br ${mod.color}`}>
                      <ModIcon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                      {mod.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-semibold text-snow group-hover:text-accent transition">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-accent pt-3 border-t border-white/[0.04] group-hover:translate-x-1 transition-transform">
                  <span>{mod.cta}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
