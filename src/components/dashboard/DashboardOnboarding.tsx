"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileCode2,
  Globe,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
  accent: string;
  glow: string;
}> = [
  {
    id: "domain",
    stepNumber: "01",
    title: "Domain Scope",
    description:
      "Anchor crawls, backlinks, and keyword rankings to your primary target domain.",
    icon: Globe,
    cta: "Set Domain",
    accent: "text-sky-400",
    glow: "group-hover:shadow-sky-500/10",
  },
  {
    id: "gsc",
    stepNumber: "02",
    title: "Search Console",
    description:
      "Stream verified Google clicks, impressions, and query rankings into this workspace.",
    icon: BarChart3,
    cta: "Connect GSC",
    href: "/dashboard/gsc",
    accent: "text-violet-400",
    glow: "group-hover:shadow-violet-500/10",
  },
  {
    id: "audit",
    stepNumber: "03",
    title: "Site Diagnostics",
    description:
      "Check robots.txt, Schema.org, Core Web Vitals, and ranking risk signals.",
    icon: FileCode2,
    cta: "Run Diagnostic",
    href: "/dashboard/audit",
    accent: "text-amber-400",
    glow: "group-hover:shadow-amber-500/10",
  },
  {
    id: "agent",
    stepNumber: "04",
    title: "Suri Intelligence",
    description:
      "Ask Suri about keywords, competitors, GSC, and next SEO moves for this project.",
    icon: MessageSquare,
    cta: "Open Suri",
    href: "/dashboard/chat",
    accent: "text-accent",
    glow: "group-hover:shadow-teal-500/15",
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
  const [focusedStep, setFocusedStep] = useState<StepId | null>(null);

  useEffect(() => {
    setDomainInput(project.domain);
  }, [project.domain]);

  const hasCustomDomain = Boolean(project.domain && project.domain !== "example.com");
  const gscConnected = Boolean(project.gscConnected);

  const completedMap: Record<StepId, boolean> = useMemo(
    () => ({
      domain: hasCustomDomain,
      gsc: gscConnected,
      audit: hasCustomDomain,
      agent: true,
    }),
    [hasCustomDomain, gscConnected],
  );

  const completedCount = Object.values(completedMap).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / SETUP_STEPS.length) * 100);
  const nextStep = SETUP_STEPS.find((s) => !completedMap[s.id]) ?? null;

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

  function focusStep(id: StepId) {
    setFocusedStep(id);
    document.getElementById(`setup-step-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Workspace overview — large + interactive */}
      <div className="group/overview relative overflow-hidden rounded-2xl border border-line bg-bg-elevated/90 p-4 sm:p-5 md:p-6 shadow-sm transition hover:border-accent/25">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl transition duration-700 group-hover/overview:bg-accent/20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-teal-500/5 blur-3xl opacity-0 transition duration-700 group-hover/overview:opacity-100"
          aria-hidden
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>Project Workspace</span>
              <span className="text-white/20">•</span>
              <span className="text-snow font-medium">{project.name || "Default Project"}</span>
            </div>

            <h1 className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-snow">
              {hasCustomDomain ? (
                <>
                  Project Overview:{" "}
                  <span className="font-mono text-accent">{project.domain}</span>
                </>
              ) : (
                "Finish setup to unlock live SEO data"
              )}
            </h1>

            <p className="text-xs text-ink-muted leading-relaxed">
              Complete these four steps — domain, Search Console, diagnostics, and Suri.
              {nextStep ? (
                <>
                  {" "}
                  Next up: <span className="text-snow font-medium">{nextStep.title}</span>.
                </>
              ) : (
                " All steps are ready."
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {nextStep ? (
                nextStep.href ? (
                  <Link
                    href={nextStep.href}
                    prefetch
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-[#010409] shadow-md shadow-accent/20 transition hover:bg-accent-deep"
                  >
                    Continue: {nextStep.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => focusStep(nextStep.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-[#010409] shadow-md shadow-accent/20 transition hover:bg-accent-deep"
                  >
                    Continue: {nextStep.title}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )
              ) : (
                <Link
                  href="/dashboard/chat"
                  prefetch
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-1.5 text-xs font-semibold text-[#010409] shadow-md shadow-accent/20 transition hover:bg-accent-deep"
                >
                  Open Suri
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => focusStep(nextStep?.id ?? "agent")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/5 px-3 py-1.5 text-xs font-medium text-snow transition hover:border-accent/40 hover:text-accent"
              >
                Jump to pipeline
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-line/80 bg-bg p-3 font-mono text-xs w-full lg:w-64 shrink-0 space-y-0.5">
            <div className="flex items-center justify-between border-b border-line/60 pb-2 text-[11px] text-ink-muted">
              <span className="font-sans font-semibold text-snow">Workspace Status</span>
              <span className="flex items-center gap-1.5 text-accent font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                ONLINE
              </span>
            </div>

            <button
              type="button"
              onClick={() => focusStep("domain")}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-white/5"
            >
              <span className="text-ink-muted">DOMAIN</span>
              <span className="text-snow truncate max-w-[140px] font-medium">
                {hasCustomDomain ? project.domain : "UNASSIGNED"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => (gscConnected ? router.push("/dashboard/gsc") : focusStep("gsc"))}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-white/5"
            >
              <span className="text-ink-muted">GSC LINK</span>
              <span className={gscConnected ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                {gscConnected ? "CONNECTED" : "UNLINKED →"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/chat")}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-white/5"
            >
              <span className="text-ink-muted">SURI</span>
              <span className="text-accent font-medium">READY →</span>
            </button>
          </div>
        </div>

        {/* Slim progress only — no large step buttons */}
        <div className="relative mt-4 flex items-center gap-3 border-t border-line/60 pt-3">
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-ink-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Setup
          </span>
          <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-accent">
            {completedCount}/{SETUP_STEPS.length}
          </span>
        </div>
      </div>

      {/* Four setup cards — slightly tighter so the page fits without scroll */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[11px] font-mono uppercase tracking-wider text-ink-muted flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-accent" />
            Setup & Integration Pipeline
          </h2>
          <span className="text-[11px] text-ink-muted tabular-nums">
            Tap a card to continue
          </span>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {SETUP_STEPS.map((step) => {
            const isDone = completedMap[step.id];
            const isNext = nextStep?.id === step.id;
            const isFocused = focusedStep === step.id || isNext;
            const Icon = step.icon;

            return (
              <div
                id={`setup-step-${step.id}`}
                key={step.id}
                onMouseEnter={() => setFocusedStep(step.id)}
                onFocus={() => setFocusedStep(step.id)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3.5 sm:p-4 transition-all duration-300 ${
                  isFocused
                    ? `border-accent/45 bg-bg-elevated shadow-md ${step.glow}`
                    : isDone
                      ? "border-line/80 bg-bg-elevated/50 hover:border-line"
                      : "border-line bg-bg-elevated hover:border-accent/30"
                }`}
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100 ${
                    step.id === "domain"
                      ? "bg-sky-500/20"
                      : step.id === "gsc"
                        ? "bg-violet-500/20"
                        : step.id === "audit"
                          ? "bg-amber-500/20"
                          : "bg-accent/25"
                  }`}
                  aria-hidden
                />

                <div className="relative space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                        isDone
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : `border-line bg-bg ${step.accent}`
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        DONE
                      </span>
                    ) : isNext ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-accent animate-pulse">
                        NEXT
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-ink-muted">
                        PENDING
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-0.5">
                      Step {step.stepNumber}
                    </p>
                    <h3 className="text-sm font-semibold text-snow tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-ink-muted leading-snug line-clamp-2">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="relative mt-3 pt-3 border-t border-line/60">
                  {step.id === "domain" && !isDone ? (
                    <form onSubmit={handleSaveDomain} className="space-y-2">
                      <input
                        type="text"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        placeholder="yourdomain.com"
                        className="w-full rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs text-snow outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30"
                        disabled={saving}
                      />
                      <button
                        type="submit"
                        disabled={saving || !domainInput.trim()}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent py-1.5 text-xs font-semibold text-[#010409] transition hover:bg-accent-deep disabled:opacity-50"
                      >
                        {saving ? "Saving…" : step.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  ) : step.id === "domain" && isDone ? (
                    <div className="space-y-2">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-[11px] font-mono text-emerald-400 truncate">
                        {project.domain}
                      </div>
                      <DomainEditRow
                        domainInput={domainInput}
                        setDomainInput={setDomainInput}
                        saving={saving}
                        onSave={handleSaveDomain}
                      />
                    </div>
                  ) : step.href ? (
                    <Link
                      href={step.href}
                      prefetch
                      onMouseEnter={() => step.href && router.prefetch(step.href)}
                      onTouchStart={() => step.href && router.prefetch(step.href)}
                      className={`w-full inline-flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        isDone
                          ? "border border-line bg-white/5 text-snow hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                          : "bg-accent text-[#010409] hover:bg-accent-deep shadow-md shadow-accent/20"
                      }`}
                    >
                      <span>{step.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DomainEditRow({
  domainInput,
  setDomainInput,
  saving,
  onSave,
}: {
  domainInput: string;
  setDomainInput: (v: string) => void;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full inline-flex items-center justify-between rounded-lg border border-line bg-white/5 px-3 py-1.5 text-xs font-medium text-snow transition hover:border-accent/40 hover:text-accent"
      >
        <span>Change domain</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <form onSubmit={onSave} className="space-y-2">
      <input
        type="text"
        value={domainInput}
        onChange={(e) => setDomainInput(e.target.value)}
        className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-snow outline-none focus:border-accent"
        disabled={saving}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex-1 rounded-xl border border-line px-3 py-2 text-xs text-ink-muted hover:text-snow"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !domainInput.trim()}
          className="flex-1 rounded-xl bg-accent py-2 text-xs font-semibold text-[#010409] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
