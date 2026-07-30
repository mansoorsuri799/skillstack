import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import { SITE_EMAIL, absoluteUrl, webPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "Terms governing use of skillstack.com.pk and SkillStack Private Limited services.",
  alternates: { canonical: absoluteUrl("/terms") },
};

const sections = [
  {
    title: "Agreement",
    body: "By using skillstack.com.pk or purchasing SkillStack services, you agree to these terms. If you do not agree, do not use the site or services.",
  },
  {
    title: "Services",
    body: "SkillStack provides web development, SEO, content, and related digital services. Scopes, timelines, and fees for paid work are confirmed in writing (proposal, checkout plan, or email) before work starts.",
  },
  {
    title: "Accounts",
    body: "You must provide accurate registration details and keep credentials secure. You are responsible for activity under your account. We may suspend accounts that abuse the platform, spam, or violate these terms.",
  },
  {
    title: "Payments",
    body: "Paid plans are processed by Stripe. Prices are shown at checkout. Refunds, if any, follow the written agreement for that project or plan. Chargebacks may result in account suspension pending review.",
  },
  {
    title: "Client content & deliverables",
    body: "You retain rights to materials you provide. Upon full payment, you receive the agreed deliverables for the project. We may showcase anonymized work unless you ask us not to in writing.",
  },
  {
    title: "Acceptable use",
    body: "Do not use the site for illegal activity, malware, scraping that harms the service, or content that violates Google Search policies or applicable law. We may refuse projects that risk policy or brand harm.",
  },
  {
    title: "Disclaimer",
    body: "SEO and rankings depend on search engines, competition, and factors outside our control. We do not guarantee specific rankings, traffic, or revenue. Services are provided “as is” to the fullest extent permitted by law.",
  },
  {
    title: "Limitation of liability",
    body: "To the maximum extent permitted by law, SkillStack’s total liability for any claim related to the site or a project is limited to the fees you paid us for that project in the three months before the claim.",
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws of Pakistan. Disputes will first be addressed in good faith; unresolved disputes may be brought in courts of competent jurisdiction in Pakistan.",
  },
  {
    title: "Contact",
    body: `Questions about these terms: ${SITE_EMAIL}.`,
  },
];

export default function TermsPage() {
  return (
    <PageShell>
      <JsonLd
        data={webPageJsonLd({
          path: "/terms",
          title: "Terms of service · SkillStack",
          description:
            "Terms governing use of skillstack.com.pk and SkillStack services.",
        })}
      />
      <PageHero
        eyebrow="Legal"
        title="Terms of service"
        lead="Last updated: 30 July 2026. The rules for using SkillStack and buying our services."
        breadcrumbs={[{ label: "Terms" }]}
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
          Also read our{" "}
          <Link href="/privacy" className="text-accent hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
