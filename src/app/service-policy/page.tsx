import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import {
  OFFICE,
  SITE_EMAIL,
  SITE_EMAIL_HREF,
  absoluteUrl,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Service delivery & shipping policy",
  description:
    "How SkillStack delivers digital SEO, website, and marketing services — no physical shipping; timelines, handoff, and support.",
  alternates: { canonical: absoluteUrl("/service-policy") },
};

const sections = [
  {
    title: "Digital services only — no physical shipping",
    body: "SkillStack Private Limited provides professional digital services (keyword research, SEO, content, websites, backlinks, monetization, and related packages). We do not sell or ship physical products. There are no courier, freight, or package-delivery charges. “Shipping policy” for our business means how and when service deliverables are provided electronically.",
  },
  {
    title: "How deliverables are provided",
    body: "Work is delivered by email, shared documents, staging URLs, production deployments, analytics/Search Console access, and/or your preferred project channel. Login credentials and files needed for handoff are shared securely with the purchasing account holder or named project contact.",
  },
  {
    title: "Typical timelines",
    body: "Exact timelines are confirmed in writing for each package or proposal. As a general guide: keyword packages often complete within about 5–14 business days after kickoff; Growth-style website + SEO scopes commonly run several weeks depending on content volume; Full Stack and custom projects follow a phased roadmap with milestone dates you approve. Delays caused by late client feedback, missing brand assets, or third-party approvals pause the clock until we receive what we need.",
  },
  {
    title: "Service area",
    body: `Services are delivered remotely from our office in ${OFFICE.fullLabel}, and are available to clients across Pakistan and internationally. On-site visits are not included unless separately agreed in writing.`,
  },
  {
    title: "Revisions & acceptance",
    body: "Packages include the revision window stated at checkout or in your proposal (for example 14 or 30 days of revision support). After you approve a milestone or final handoff in writing (including email), that stage is considered accepted. Further changes may be scoped as new paid work.",
  },
  {
    title: "Support after delivery",
    body: "Post-delivery support matches what you purchased (e.g. email support for a set number of days, reporting periods for Full Stack). Outside that window, ongoing retainers or new tickets are quoted separately.",
  },
  {
    title: "Failed or incomplete delivery",
    body: "If we cannot deliver an agreed scope for reasons within our control, we will offer a remedy: complete the work, substitute equivalent value, or refund unused fees under our Return & Refund Policy. Search-engine ranking and ad-revenue results are never guaranteed — see Terms of service.",
  },
  {
    title: "Contact",
    body: `Delivery questions: ${SITE_EMAIL}. Office: ${OFFICE.fullLabel}. Map: available on our Contact page.`,
  },
];

export default function ServicePolicyPage() {
  return (
    <PageShell>
      <JsonLd
        data={webPageJsonLd({
          path: "/service-policy",
          title: "Service delivery & shipping policy · SkillStack",
          description:
            "How SkillStack delivers digital services — electronic handoff, timelines, and support.",
        })}
      />
      <PageHero
        eyebrow="Legal"
        title="Service delivery & shipping policy"
        lead="Last updated: 1 August 2026. Digital delivery only — how SkillStack provides SEO and web services."
        breadcrumbs={[{ label: "Service policy" }]}
      />
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-12 md:px-8 md:py-16">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-xl font-semibold text-snow">
              {s.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-muted">
              {s.body}
            </p>
          </section>
        ))}
        <p className="text-sm text-ink-muted">
          <a
            href={SITE_EMAIL_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {SITE_EMAIL}
          </a>
          {" · "}
          <Link href="/refund" className="text-accent hover:underline">
            Refund policy
          </Link>
          {" · "}
          <Link href="/contact" className="text-accent hover:underline">
            Contact
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
