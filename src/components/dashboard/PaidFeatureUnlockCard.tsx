"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { buttonPrimaryClass } from "@/components/dashboard/ui";

export type UnlockFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

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
    <section className="overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
      <div className="border-b border-line px-5 py-4 md:px-8 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium text-ink-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Paid plan
          </span>
          <Link href={upgradeHref} className={buttonPrimaryClass}>
            Upgrade
          </Link>
        </div>
      </div>

      <div className="px-5 py-8 md:px-8 md:py-10">
        <h2 className="font-display text-2xl font-semibold text-snow md:text-3xl">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted md:text-base">
          {description}
        </p>

        <div className="mt-10 grid gap-8 border-t border-line/60 pt-10 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-bg text-ink-muted">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-snow">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {footer ? <div className="mt-10 border-t border-line/60 pt-10">{footer}</div> : null}
      </div>
    </section>
  );
}
