"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardOnboarding from "@/components/dashboard/DashboardOnboarding";
import { DataForSeoBanner } from "@/components/dashboard/ProjectDomainBanner";
import { PageStack } from "@/components/dashboard/ui";
import { useDashboardProject, DEFAULT_FALLBACK_PROJECT } from "@/components/dashboard/useDashboardProject";

export default function DashboardHomePage() {
  const { project, dataForSeoConfigured, updateDomain } =
    useDashboardProject();

  const activeProject = project || DEFAULT_FALLBACK_PROJECT;

  return (
    <DashboardShell
      title="Dashboard"
      description={
        activeProject.domain && activeProject.domain !== "example.com"
          ? `Working on ${activeProject.domain}`
          : "Your SEO command center"
      }
    >
      <PageStack>
        <DataForSeoBanner configured={dataForSeoConfigured} />
        <DashboardOnboarding
          project={activeProject}
          onSaveDomain={async (domain) => {
            await updateDomain(domain);
          }}
        />
      </PageStack>
    </DashboardShell>
  );
}
