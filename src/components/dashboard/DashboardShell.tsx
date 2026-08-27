"use client";

import { type ReactNode } from "react";
import { DashboardMobileToggle } from "@/components/dashboard/DashboardSidebar";

export default function DashboardShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg-soft md:rounded-tl-2xl md:border-l md:border-t md:border-line">
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-4 md:px-6">
        <DashboardMobileToggle />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold text-snow">{title}</h1>
          {description ? (
            <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6">{children}</main>
    </div>
  );
}
