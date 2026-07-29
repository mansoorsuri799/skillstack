import type { Metadata } from "next";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import ProcessDetail from "@/components/ProcessDetail";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How SkillStack takes projects from keyword research to build, ranking, and monetization.",
};

export default function ProcessPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Process"
        title="A straight path from research to revenue."
        lead="Four stages. Clear approvals. No mystery black-box SEO. Here’s exactly how a SkillStack engagement typically runs."
        tone="elevated"
      />
      <ProcessDetail />
      <PageCTA
        tone="soft"
        primary={{ href: "/contact", label: "Start a project" }}
        secondary={{ href: "/services", label: "View services" }}
      >
        Ready to run this process on your niche or client site?
      </PageCTA>
    </PageShell>
  );
}
