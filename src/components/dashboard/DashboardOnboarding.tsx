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

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Workspace header */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-elevated/90 p-5 sm:p-7 md:p-8 shadow-sm">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>Project Workspace</span>
              <span className="text-white/20">•</span>
              <span className="text-snow font-medium">{project.name || "Default Project"}</span>
            </div>

            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-snow">
              {hasCustomDomain ? (
                <>
                  Project Overview:{" "}
                  <span className="font-mono text-accent">{project.domain}</span>
                </>
              ) : (
                "Finish setup to unlock live SEO data"
              )}
            </h1>

            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
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
          </div>

          <div className="rounded-xl border border-line/80 bg-bg p-3.5 sm:p-4 font-mono text-xs w-full lg:w-72 shrink-0 space-y-2">
            <div className="flex items-center justify-between border-b border-line/60 pb-2 text-[11px] text-ink-muted">
              <span className="font-sans font-semibold text-snow">Workspace Status</span>
              <span className="flex items-center gap-1.5 text-accent font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between gap-2">
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
                <span className="text-ink-muted">SURI</span>
                <span className="text-accent font-medium">READY</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 pt-5 border-t border-line/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-snow flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Setup Pipeline
            </span>
            <span className="font-mono font-semibold text-accent tabular-nums">
              {completedCount}/{SETUP_STEPS.length} · {progressPercent}%
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-deep to-accent transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Step dots — click to focus card */}
          <div className="flex items-center justify-between gap-2 pt-1">
            {SETUP_STEPS.map((step, index) => {
              const done = completedMap[step.id];
              const isNext = nextStep?.id === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setFocusedStep(step.id);
                    document.getElementById(`setup-step-${step.id}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-lg px-1 py-2 transition ${
                    focusedStep === step.id ? "bg-white/5" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-mono font-bold transition ${
                      done
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                        : isNext
                          ? "border-accent/50 bg-accent/15 text-accent ring-2 ring-accent/20"
                          : "border-line bg-bg text-ink-muted"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.stepNumber}
                  </span>
                  <span
                    className={`hidden sm:block text-[10px] font-medium truncate max-w-full ${
                      done || isNext ? "text-snow" : "text-ink-muted"
                    }`}
                  >
                    {step.title.split(" ")[0]}
                  </span>
                  {index < SETUP_STEPS.length - 1 ? null : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Four setup cards only */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ink-muted flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Setup & Integration Pipeline
          </h2>
          <span className="text-xs text-ink-muted tabular-nums">
            Tap a card to continue
          </span>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
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
                className={`group relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                  isFocused
                    ? `border-accent/45 bg-bg-elevated shadow-lg ${step.glow} scale-[1.01]`
                    : isDone
                      ? "border-line/80 bg-bg-elevated/50 hover:border-line"
                      : "border-line bg-bg-elevated hover:border-accent/30"
                }`}
              >
                {/* Soft accent wash */}
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100 ${
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

                <div className="relative space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                        isDone
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : `border-line bg-bg ${step.accent}`
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        DONE
                      </span>
                    ) : isNext ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] font-mono font-semibold text-accent animate-pulse">
                        NEXT
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono text-ink-muted">
                        PENDING
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted mb-1">
                      Step {step.stepNumber}
                    </p>
                    <h3 className="font-display text-base font-semibold text-snow tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="relative mt-5 pt-4 border-t border-line/60">
                  {step.id === "domain" && !isDone ? (
                    <form onSubmit={handleSaveDomain} className="space-y-2.5">
                      <input
                        type="text"
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        placeholder="yourdomain.com"
                        className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-snow outline-none transition focus:border-accent focus:ring-1 focus:ring-accent/30"
                        disabled={saving}
                      />
                      <button
                        type="submit"
                        disabled={saving || !domainInput.trim()}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-[#010409] transition hover:bg-accent-deep disabled:opacity-50"
                      >
                        {saving ? "Saving…" : step.cta}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>
                  ) : step.id === "domain" && isDone ? (
                    <div className="space-y-2.5">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs font-mono text-emerald-400 truncate">
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
                      className={`w-full inline-flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        isDone
                          ? "border border-line bg-white/5 text-snow hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                          : "bg-accent text-[#010409] hover:bg-accent-deep shadow-md shadow-accent/20"
                      }`}
                    >
                      <span>{step.cta}</span>
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
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
        className="w-full inline-flex items-center justify-between rounded-xl border border-line bg-white/5 px-4 py-2.5 text-sm font-medium text-snow transition hover:border-accent/40 hover:text-accent"
      >
        <span>Change domain</span>
        <ArrowRight className="h-4 w-4" />
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
