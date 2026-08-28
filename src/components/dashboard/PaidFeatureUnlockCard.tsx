"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

export type UnlockFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function TopUpgradeBanner() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-bg-elevated px-4 py-3 text-xs text-snow/90">
      <p>
        SkillStack Project Workspace.{" "}
        <Link href="/pricing" className="font-semibold text-accent underline hover:text-snow transition">
          Upgrade plan
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="underline hover:text-accent transition">
          contact support
        </Link>
        .
      </p>
    </div>
  );
}

export function PaidFeatureUnlockCard({
  title,
  description,
  features,
  footer,
  upgradeHref = "/pricing",
}: {
  title: string;
  description: string;
  features: UnlockFeature[];
  footer?: ReactNode;
  upgradeHref?: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-bg-elevated/70 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-sm">
      {/* Top Header Row with Paid Plan Pill & Upgrade Button */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg px-2.5 py-1 text-xs font-mono font-medium text-ink-muted">
          <Lock className="h-3 w-3 text-accent" />
          ENTERPRISE FEATURE
        </span>
        <Link
          href={upgradeHref}
          className="inline-flex items-center justify-center rounded-md bg-accent px-3.5 py-1.5 text-xs font-semibold text-[#010409] transition hover:bg-accent-deep shadow-sm"
        >
          Upgrade Access
        </Link>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-1.5 sm:space-y-2">
        <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-snow">{title}</h2>
        <p className="max-w-3xl text-xs sm:text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>

      {/* 3-Column Features Breakdown */}
      <div className="grid gap-4 sm:gap-6 pt-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="space-y-1.5 sm:space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-bg text-accent">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="text-xs sm:text-sm font-semibold text-snow">
                {feature.title}
              </h3>
              <p className="text-xs leading-relaxed text-ink-muted">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Optional Interactive Search / Trial Form */}
      {footer ? <div className="mt-6 sm:mt-8 border-t border-line/60 pt-6 sm:pt-8">{footer}</div> : null}
    </section>
  );
}
