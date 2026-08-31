"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Compass,
  Cpu,
  FileCode2,
  Globe,
  Layers,
  LineChart,
  MessageSquare,
  Search,
  ShieldCheck,
  Terminal,
  TrendingUp,
  Zap,
} from "lucide-react";
import { buttonPrimaryClass, buttonGhostClass } from "@/components/dashboard/ui";
import type { DashboardProject } from "@/components/dashboard/useDashboardProject";

type StepId = "domain" | "gsc" | "audit" | "agent";

const SETUP_STEPS: Array<{
  id: StepId;
  stepNumber: string;
  title: string;
  description: string;
  icon: typeof Globe;
  cta: string;
  href?: string;
  metric: string;
}> = [
  {
    id: "domain",
    stepNumber: "01",
    title: "Domain Scope",
    description: "Anchor all crawler operations, backlink topology, and keyword rankings to your primary target domain.",
    icon: Globe,
    cta: "Save Domain",
    metric: "Target Anchor",
  },
  {
    id: "gsc",
    stepNumber: "02",
    title: "Search Console Telemetry",
    description: "Stream verified Google search clicks, impression anomalies, and query rankings directly into your workspace.",
    icon: BarChart3,
    cta: "Connect GSC",
    href: "/dashboard/gsc",
    metric: "Verified CTR Stream",
  },
  {
    id: "audit",
    stepNumber: "03",
    title: "Technical & AEO Diagnostics",
    description: "Evaluate robots.txt, Schema.org entities, Core Web Vitals, and uncover root causes of ranking volatility.",
    icon: FileCode2,
    cta: "Run Diagnostic",
    href: "/dashboard/audit",
    metric: "Crawl & Schema Analysis",
  },
  {
    id: "agent",
    stepNumber: "04",
    title: "Suri SEO Intelligence",
    description: "Multi-turn assistant equipped with project memory for keyword research, striking-distance queries, and ranking strategy.",
    icon: MessageSquare,
    cta: "Open Suri Console",
    href: "/dashboard/chat",
    metric: "Contextual Strategy",
  },
];

const WORKBENCH_MODULES = [
  {
    title: "Suri Intelligence Agent",
    category: "Conversational Copilot",
    description: "Query project memory, evaluate competitor keyword gaps, and generate actionable SEO steps in real time.",
    href: "/dashboard/chat",
    icon: Terminal,
    status: "Ready",
    actionLabel: "Launch Console",
  },
  {
    title: "AI Site Diagnostic",
    category: "Technical & AEO Health",
    description: "Automated site crawl verifying Schema.org JSON-LD, robots.txt directives, and algorithmic ranking factors.",
    href: "/dashboard/audit",
    icon: Cpu,
    status: "Active",
    actionLabel: "Start Crawl",
  },
  {
    title: "Search Console Telemetry",
    category: "Google Search Data",
    description: "Real-time query performance, CTR trend analysis, and high-impression striking distance detection.",
    href: "/dashboard/gsc",
    icon: Activity,
    status: "OAuth 2.0",
    actionLabel: "View Telemetry",
  },
  {
    title: "Keyword & SERP Explorer",
    category: "Market Intelligence",
    description: "Search volumes, CPC metrics, keyword difficulty scores, and top ranking SERP competitor breakdowns.",
    href: "/dashboard/keywords",
    icon: Compass,
    status: "DataForSEO Labs",
    actionLabel: "Explore Keywords",
  },
];

export default function DashboardOnboarding({
  project,
  onSaveDomain,
}: {
  project: DashboardProject;
  onSaveDomain: (domain: string) => Promise<void>;
}) {
  const router = useRouter();
  const [domainInput, setDomainInput] = useState(project.domain);
  const [saving, setSaving] = useState(false);

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
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Platform Workspace Header */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-elevated/90 p-5 sm:p-7 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              <span className="flex h-2 w-2 rounded-full bg-accent" />
              <span>Project Workspace</span>
              <span className="text-white/20">•</span>
              <span className="text-snow font-medium">{project.name || "Default Project"}</span>
            </div>

            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-snow">
              {hasCustomDomain ? (
                <>
                  Project Overview: <span className="font-mono text-accent">{project.domain}</span>
                </>
              ) : (
                "SEO Overview & Performance Dashboard"
              )}
            </h1>

            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              All-in-one control center for keyword rankings, site audits, backlinks analysis, and AI SEO recommendations.
            </p>
          </div>

          {/* Technical Telemetry Metadata Panel */}
          <div className="rounded-xl border border-line/80 bg-bg p-3.5 sm:p-4 font-mono text-xs w-full lg:w-72 shrink-0 space-y-2">
            <div className="flex items-center justify-between border-b border-line/60 pb-2 text-[11px] text-ink-muted">
              <span className="font-sans font-semibold text-snow">Workspace Status</span>
              <span className="flex items-center gap-1.5 text-accent font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                ONLINE
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">DOMAIN</span>
                <span className="text-snow truncate max-w-[140px]">
                  {hasCustomDomain ? project.domain : "UNASSIGNED"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">GSC LINK</span>
                <span className={gscConnected ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                  {gscConnected ? "CONNECTED" : "UNLINKED"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">AGENT</span>
                <span className="text-snow font-medium">SURI V2.4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Readiness Progress Bar */}
        <div className="mt-6 pt-5 border-t border-line/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-snow flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Workspace Pipeline Status
            </span>
            <span className="font-mono font-semibold text-accent tabular-nums">
              {progressPercent}% CONFIGURED
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4-Step Operational Pipeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            Setup & Integration Pipeline
          </h2>
          <span className="text-xs text-ink-muted tabular-nums">
            {completedCount} of {SETUP_STEPS.length} Steps Completed
          </span>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {SETUP_STEPS.map((step) => {
            const isDone = completedMap[step.id];
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`relative flex flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all ${
                  isDone
                    ? "border-line bg-bg-elevated/40"
                    : "border-line/90 bg-bg-elevated hover:border-accent/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-ink-muted">
                      {step.stepNumber}
                    </span>

                    {isDone ? (
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> CONFIGURED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-ink-muted">
                        PENDING
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-accent" />
                      <h3 className="font-medium text-sm text-snow">{step.title}</h3>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed min-h-[44px]">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line/60">
                  {step.id === "domain" && !isDone ? (
                    <form onSubmit={handleSaveDomain} className="space-y-2">
                      <input
                        type="text"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        placeholder="yourdomain.com"
                        className="w-full rounded-md border border-line bg-bg px-2.5 py-1.5 text-xs text-snow outline-none focus:border-accent"
                        disabled={saving}
                      />
                      <button
                        type="submit"
                        disabled={saving || !domainInput.trim()}
                        className="w-full inline-flex items-center justify-center rounded-md bg-accent py-1.5 text-xs font-semibold text-[#010409] hover:bg-accent-deep transition disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Set Domain"}
                      </button>
                    </form>
                  ) : step.href ? (
                    <Link
                      href={step.href}
                      prefetch={true}
                      onMouseEnter={() => step.href && router.prefetch(step.href)}
                      onTouchStart={() => step.href && router.prefetch(step.href)}
                      className={`w-full inline-flex items-center justify-between rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        isDone
                          ? "border border-line bg-white/5 text-snow hover:bg-white/10"
                          : "bg-accent text-[#010409] hover:bg-accent-deep font-semibold"
                      }`}
                    >
                      <span>{step.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
                      <span>{step.metric}</span>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEO Tools & Features */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-wider text-ink-muted">
              SEO Tools & Quick Launch
            </h2>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {WORKBENCH_MODULES.map((mod, i) => {
            const ModIcon = mod.icon;
            return (
              <Link
                key={i}
                href={mod.href}
                prefetch={true}
                onMouseEnter={() => router.prefetch(mod.href)}
                onTouchStart={() => router.prefetch(mod.href)}
                className="group relative flex flex-col justify-between rounded-xl border border-line bg-bg-elevated p-4 sm:p-5 transition hover:border-line/80 hover:bg-white/[0.02]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-bg text-snow group-hover:text-accent transition-colors">
                      <ModIcon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-[10px] text-ink-muted/80 uppercase">
                      {mod.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent/80 block mb-0.5">
                      {mod.category}
                    </span>
                    <h3 className="font-medium text-sm text-snow group-hover:text-accent transition-colors">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs text-ink-muted group-hover:text-snow transition-colors">
                  <span className="font-medium">{mod.actionLabel}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
