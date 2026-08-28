"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export type UnlockFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function TopUpgradeBanner() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-xs text-snow/90">
      <p>
        We hope you&apos;re enjoying SkillStack!{" "}
        <Link href="/pricing" className="font-semibold text-accent underline hover:text-snow transition">
          Upgrade anytime
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="underline hover:text-accent transition">
          reach out with questions
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
    <section className="overflow-hidden rounded-2xl border border-line bg-bg-elevated/70 p-6 md:p-8 space-y-6 shadow-sm">
      {/* Top Header Row with Paid Plan Pill & Upgrade Button */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Paid plan
        </span>
        <Link
          href={upgradeHref}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-[#010409] transition hover:bg-accent-deep shadow-sm"
        >
          Upgrade
        </Link>
      </div>

      {/* Main Title & Description */}
      <div className="space-y-2">
        <h2 className="font-display text-xl font-bold text-snow md:text-2xl">{title}</h2>
        <p className="max-w-3xl text-xs md:text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>

      {/* 3-Column Features Breakdown */}
      <div className="grid gap-6 pt-2 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-bg text-accent">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-semibold text-snow">
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
      {footer ? <div className="mt-8 border-t border-line/60 pt-8">{footer}</div> : null}
    </section>
  );
}
