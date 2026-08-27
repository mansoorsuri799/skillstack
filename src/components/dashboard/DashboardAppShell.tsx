"use client";

import { type ReactNode } from "react";
import DashboardSidebar, {
  DashboardMobileMenuProvider,
} from "@/components/dashboard/DashboardSidebar";
import { DashboardProjectProvider } from "@/components/dashboard/useDashboardProject";

export default function DashboardAppShell({ children }: { children: ReactNode }) {
  return (
    <DashboardMobileMenuProvider>
      <DashboardProjectProvider>
        <div className="flex h-[100dvh] bg-bg">
          <DashboardSidebar />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </DashboardProjectProvider>
    </DashboardMobileMenuProvider>
  );
}
