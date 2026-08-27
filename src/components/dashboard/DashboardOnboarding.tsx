"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Globe,
  Link2,
  Sparkles,
  Target,
} from "lucide-react";
import {
  buttonGhostClass,
  buttonPrimaryClass,
  inputClass,
} from "@/components/dashboard/ui";
import type { DashboardProject } from "@/components/dashboard/useDashboardProject";
import { loadUserPreferences } from "@/lib/dashboard/user-preferences";

type StepId = "domain" | "mcp" | "gsc" | "competitor";

const STEPS: Array<{
  id: StepId;
  label: string;
  title: string;
  body: string;
  cta: string;
  href?: string;
  icon: typeof Globe;
}> = [
  {
    id: "domain",
    label: "Domain",
    title: "What site are you working on?",
    body: "Set your project domain so backlinks, audits, and rank tracking target the right site.",
    cta: "Save domain",
    icon: Globe,
  },
  {
    id: "mcp",
    label: "AI agent",
    title: "Connect your AI agent",
    body: "Generate an API key so Claude, Cursor, or Codex can run keyword research, audits, and rank checks.",
    cta: "Set up AI & MCP",
    href: "/dashboard/connect",
    icon: Bot,
  },
  {
    id: "gsc",
    label: "Search Console",
    title: "Connect Search Console",
    body: "Pull real queries, clicks, and landing-page performance straight from Google.",
    cta: "Connect GSC",
    href: "/dashboard/gsc",
    icon: BarChart3,
  },
  {
    id: "competitor",
    label: "Competitor",
    title: "Size up a competitor",
    body: "Research any domain to see what they rank for, who links to them, and where traffic comes from.",
    cta: "Open domain lookup",
    href: "/dashboard/domain",
    icon: Target,
  },
];

const QUICK_ACTIONS = [
  {
    title: "Google Search Console",
    description: "Real queries & clicks from Google",
    href: "/dashboard/gsc",
    icon: BarChart3,
    cta: "Connect with Google",
    status: (p: DashboardProject) =>
      p.gscConnected ? ("connected" as const) : ("pending" as const),
    primary: true,
  },
  {
    title: "Site Audit",
    description: "Lighthouse crawl for SEO issues",
    href: "/dashboard/audit",
    icon: ClipboardCheck,
    cta: "Run an audit",
    status: () => "ready" as const,
    primary: true,
  },
  {
    title: "Backlink pulse",
    description: "Referring domains & link profile",
    href: "/dashboard/backlinks",
    icon: Link2,
    cta: "View backlinks",
    status: () => "ready" as const,
    primary: false,
  },
  {
    title: "AI & MCP",
    description: "Automate SEO from your editor",
    href: "/dashboard/connect",
    icon: Bot,
    cta: "Set up MCP",
    status: (p: DashboardProject) =>
      p.mcpConnected ? ("connected" as const) : ("pending" as const),
    primary: false,
  },
] as const;

function stepComplete(
  id: StepId,
  project: DashboardProject,
  competitorDone: boolean,
) {
  if (id === "domain") return project.domain !== "example.com";
  if (id === "mcp") return project.mcpConnected;
  if (id === "gsc") return project.gscConnected;
  if (id === "competitor") return competitorDone;
  return false;
}

function StatusPill({ status }: { status: "connected" | "pending" | "ready" }) {
  const styles = {
    connected: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    pending: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    ready: "border-line bg-white/5 text-ink-muted",
  }[status];
  const label =
    status === "connected" ? "Connected" : status === "pending" ? "Not connected" : "Ready";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles}`}
    >
      {status === "connected" ? <Check className="h-3 w-3" /> : null}
      {label}
    </span>
  );
}

export default function DashboardOnboarding({
  project,
  onSaveDomain,
}: {
  project: DashboardProject;
  onSaveDomain: (domain: string) => Promise<void>;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [domain, setDomain] = useState(project.domain);
  const [saving, setSaving] = useState(false);
  const [competitorDone, setCompetitorDone] = useState(false);
  const [setupDismissed, setSetupDismissed] = useState(false);

  useEffect(() => {
    setDomain(project.domain);
  }, [project.domain]);

  useEffect(() => {
    setCompetitorDone(false);
    void loadUserPreferences().then((prefs) => {
      if (prefs?.onboardingCompetitorDone) {
        setCompetitorDone(true);
        return;
      }
      if (localStorage.getItem("ss-competitor-done") === "1") {
        setCompetitorDone(true);
        void fetch("/api/dashboard/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onboardingCompetitorDone: true }),
        });
      }
    });
  }, []);

  const doneCount = STEPS.filter((s) =>
    stepComplete(s.id, project, competitorDone),
  ).length;
  const progress = Math.round((doneCount / STEPS.length) * 100);
  const allComplete = doneCount === STEPS.length;

  const nextIncomplete = useMemo(() => {
    const idx = STEPS.findIndex(
      (s) => !stepComplete(s.id, project, competitorDone),
    );
    return idx === -1 ? 0 : idx;
  }, [project, competitorDone]);

  useEffect(() => {
    if (!allComplete) setStepIndex(nextIncomplete);
  }, [nextIncomplete, allComplete]);

  const current = STEPS[Math.min(stepIndex, STEPS.length - 1)]!;
  const StepIcon = current.icon;

  async function saveDomain() {
    setSaving(true);
    try {
      await onSaveDomain(domain);
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    } finally {
      setSaving(false);
    }
  }

  function markCompetitorDone() {
    localStorage.setItem("ss-competitor-done", "1");
    setCompetitorDone(true);
    void fetch("/api/dashboard/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingCompetitorDone: true }),
    });
  }

  return (
    <div className="space-y-8">
      {allComplete && setupDismissed ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display font-semibold text-snow">Setup complete</p>
              <p className="text-sm text-ink-muted">
                Your workspace is ready for {project.domain}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSetupDismissed(false)}
            className={buttonGhostClass}
          >
            Show setup guide
          </button>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
          {/* Progress header */}
          <div className="relative border-b border-line bg-gradient-to-br from-accent/[0.07] via-transparent to-transparent px-5 py-5 md:px-8 md:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Workspace setup
                </p>
                <h2 className="mt-1.5 font-display text-xl font-semibold text-snow md:text-2xl">
                  {allComplete ? "You're all set" : "Finish setting up your SEO hub"}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {allComplete
                    ? "Every integration is connected. Jump into any tool below."
                    : `${STEPS.length - doneCount} step${STEPS.length - doneCount === 1 ? "" : "s"} left — about 2 minutes.`}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <span className="font-display text-3xl font-semibold tabular-nums text-accent">
                  {doneCount}
                  <span className="text-lg text-ink-muted">/{STEPS.length}</span>
                </span>
                {allComplete ? (
                  <button
                    type="button"
                    onClick={() => setSetupDismissed(true)}
                    className={buttonGhostClass}
                  >
                    Dismiss
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-deep"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Step rail */}
          <div className="scrollbar-none flex overflow-x-auto border-b border-line">
            {STEPS.map((step, i) => {
              const done = stepComplete(step.id, project, competitorDone);
              const active = i === stepIndex;
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setStepIndex(i)}
                  className={`group relative flex min-w-[7.5rem] flex-1 flex-col items-start gap-2 border-r border-line px-4 py-4 text-left transition last:border-r-0 md:min-w-0 md:px-5 ${
                    active
                      ? "bg-white/[0.03]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  {active ? (
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" />
                  ) : null}
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      done
                        ? "bg-accent text-bg"
                        : active
                          ? "bg-accent/15 text-accent"
                          : "bg-bg text-ink-muted group-hover:text-ink"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      active ? "text-snow" : done ? "text-ink" : "text-ink-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active step panel */}
          <div className="px-5 py-6 md:px-8 md:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6 lg:flex-row lg:items-start"
              >
                <div className="hidden shrink-0 lg:flex">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                    <StepIcon className="h-7 w-7 text-accent" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-bg px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                      Step {stepIndex + 1}
                    </span>
                    {stepComplete(current.id, project, competitorDone) ? (
                      <StatusPill status="connected" />
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-snow md:text-xl">
                    {current.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                    {current.body}
                  </p>

                  <div className="mt-6">
                    {current.id === "domain" ? (
                      <form
                        className="flex max-w-xl flex-col gap-3 sm:flex-row"
                        onSubmit={(e) => {
                          e.preventDefault();
                          void saveDomain();
                        }}
                      >
                        <div className="relative min-w-0 flex-1">
                          <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                          <input
                            className={`${inputClass} pl-9`}
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="yourdomain.com"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className={buttonPrimaryClass}
                        >
                          {saving ? "Saving..." : current.cta}
                        </button>
                      </form>
                    ) : current.href ? (
                      <Link
                        href={current.href}
                        className={buttonPrimaryClass}
                        onClick={
                          current.id === "competitor"
                            ? markCompetitorDone
                            : undefined
                        }
                      >
                        {current.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 lg:flex-col lg:pt-1">
                  <button
                    type="button"
                    onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                    disabled={stepIndex === 0}
                    className={`${buttonGhostClass} !px-3`}
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))
                    }
                    disabled={stepIndex === STEPS.length - 1}
                    className={`${buttonGhostClass} !px-3`}
                    aria-label="Next step"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {!allComplete ? (
              <p className="mt-6 border-t border-line pt-4 text-center text-xs text-ink-muted">
                Next up:{" "}
                <button
                  type="button"
                  className="font-medium text-accent hover:underline"
                  onClick={() => setStepIndex(nextIncomplete)}
                >
                  {STEPS[nextIncomplete]?.label ?? "Continue"}
                </button>
              </p>
            ) : null}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <div>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-semibold text-snow">
              Quick actions
            </h3>
            <p className="mt-0.5 text-sm text-ink-muted">
              Jump into the tools you&apos;ll use most for {project.domain}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            const status = action.status(project);
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden rounded-xl border border-line bg-bg-elevated p-5 transition hover:border-accent/30 hover:bg-white/[0.02]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent/15">
                    <Icon className="h-5 w-5" />
                  </span>
                  <StatusPill status={status} />
                </div>
                <h4 className="mt-4 font-display font-semibold text-snow group-hover:text-accent">
                  {action.title}
                </h4>
                <p className="mt-1 text-sm text-ink-muted">{action.description}</p>
                <span
                  className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium ${
                    action.primary ? "text-accent" : "text-ink-muted group-hover:text-snow"
                  }`}
                >
                  {action.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}

          <Link
            href="/dashboard/domain"
            onClick={markCompetitorDone}
            className="group relative overflow-hidden rounded-xl border border-line bg-bg-elevated p-5 transition hover:border-accent/30 hover:bg-white/[0.02] sm:col-span-2"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Globe className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-display font-semibold text-snow group-hover:text-accent">
                  Domain lookup
                </h4>
                <p className="mt-1 text-sm text-ink-muted">
                  Research any competitor — organic traffic, top keywords, and top pages.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent">
                Open overview
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
