"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { BacklinksDashboard } from "@/components/dashboard/backlinks/BacklinksDashboard";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { LoadingBlock, PageStack } from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

export default function BacklinksPage() {
  const { project, dataForSeoConfigured } = useDashboardProject();

  return (
    <DashboardShell
      title="Backlinks"
      description="Understand who links to a site, what changed recently, and which pages attract links."
    >
      <PageStack className="!max-w-none w-full">
        <DataForSeoBanner configured={dataForSeoConfigured} />
        <BacklinksDashboard
          initialDomain={project?.domain ?? ""}
          dataForSeoConfigured={dataForSeoConfigured}
        />
      </PageStack>
    </DashboardShell>
  );
}
