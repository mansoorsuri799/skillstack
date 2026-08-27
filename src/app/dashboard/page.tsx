"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardOnboarding from "@/components/dashboard/DashboardOnboarding";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { LoadingBlock, PageStack } from "@/components/dashboard/ui";
import { useDashboardProject } from "@/components/dashboard/useDashboardProject";

export default function DashboardHomePage() {
  const { project, dataForSeoConfigured, loading, updateDomain } =
    useDashboardProject();

  if (loading || !project) {
    return (
      <DashboardShell title="Dashboard" description="Your SEO command center">
        <LoadingBlock />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Dashboard"
      description={`Working on ${project.domain}`}
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        <DashboardOnboarding
          project={project}
          onSaveDomain={async (domain) => {
            await updateDomain(domain);
          }}
        />
      </PageStack>
    </DashboardShell>
  );
}
