"use client";

import { type ReactNode } from "react";
import { DashboardMobileToggle } from "@/components/dashboard/DashboardSidebar";

export default function DashboardShell({
  title,
  description,
  children,
  actions,
  fill = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  fill?: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-bg-soft md:rounded-tl-2xl md:border-l md:border-t md:border-line overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-3.5 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <DashboardMobileToggle />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-lg font-semibold text-snow truncate sm:text-xl">{title}</h1>
            {description ? (
              <p className="mt-0.5 text-xs text-ink-muted truncate sm:text-sm">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </header>
      <main
        className={
          fill
            ? "flex min-h-0 flex-1 flex-col overflow-hidden px-3.5 pt-4 sm:px-6 sm:pt-5"
            : "flex-1 overflow-y-auto overscroll-contain px-3.5 py-4 sm:px-6 sm:py-5"
        }
      >
        {children}
      </main>
    </div>
  );
}
