import { Suspense } from "react";
import { LoadingBlock } from "@/components/dashboard/ui";
import DashboardShell from "@/components/dashboard/DashboardShell";
import GscInsightsPage from "./GscInsightsClient";

export default function GscPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell title="GSC Insights">
          <LoadingBlock />
        </DashboardShell>
      }
    >
      <GscInsightsPage />
    </Suspense>
  );
}
