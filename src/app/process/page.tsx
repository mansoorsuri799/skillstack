import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import ProcessDetail from "@/components/ProcessDetail";
import { processSteps } from "@/lib/content";
import { absoluteUrl, howToJsonLd, webPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Process",
  description:
    "How SkillStack takes projects from keyword research to build, ranking, and monetization.",
  alternates: { canonical: absoluteUrl("/process") },
  openGraph: {
    url: absoluteUrl("/process"),
    title: "SkillStack Process",
    description:
      "Four stages from research to revenue — clear approvals, no black-box SEO.",
  },
};

export default function ProcessPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/process",
            title: "SkillStack Process",
            description:
              "How SkillStack takes projects from keyword research to build, ranking, and monetization.",
          }),
          howToJsonLd(
            processSteps.map((step) => ({
              name: step.title,
              text: `${step.summary} ${step.details.join(" ")}`,
            })),
          ),
        ]}
      />
      <PageHero
        eyebrow="Process"
        title="A straight path from research to revenue."
        lead="Four stages. Clear approvals. No mystery black-box SEO. Here’s exactly how a SkillStack engagement typically runs."
        tone="elevated"
        breadcrumbs={[{ label: "Process" }]}
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
