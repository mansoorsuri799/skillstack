"use client";

import Link from "next/link";
import type { AiToolUsage } from "@/lib/dashboard/ai-tool-limits";
import { buttonPrimaryClass, DashboardAlert } from "@/components/dashboard/ui";

export function AiToolLimitNotice({
  usage,
  featureLabel,
}: {
  usage: AiToolUsage | null;
  featureLabel: string;
}) {
  if (!usage || usage.unlimited) return null;

  if (usage.remaining === 0) {
    return (
      <DashboardAlert variant="error">
        <p>You&apos;ve used all {usage.limit} free {featureLabel} searches on your account.</p>
        <Link href="/pricing" className={`${buttonPrimaryClass} mt-4`}>
          View plans & upgrade
        </Link>
      </DashboardAlert>
    );
  }

  return (
    <p className="text-xs text-ink-muted">
      {usage.remaining} of {usage.limit} free {featureLabel} searches remaining on your account.
    </p>
  );
}
