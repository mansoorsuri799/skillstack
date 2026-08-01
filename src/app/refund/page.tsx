import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import {
  SITE_EMAIL,
  SITE_EMAIL_HREF,
  absoluteUrl,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Return & refund policy",
  description:
    "SkillStack return and refund rules for digital SEO, website, and marketing packages purchased on skillstack.com.pk.",
  alternates: { canonical: absoluteUrl("/refund") },
};

const sections = [
  {
    title: "Scope",
    body: "This Return & Refund Policy applies to one-time packages and project fees paid through skillstack.com.pk (including Lemon Squeezy and PayFast checkouts) and to custom work confirmed by written proposal or email. SkillStack sells digital professional services — not physical goods — so “returns” mean cancellation or refund of service fees as described below.",
  },
  {
    title: "No physical returns",
    body: "We do not ship physical products. There is nothing to mail back. Requests concern unused service time, unused package scope, or billing errors only.",
  },
  {
    title: "Cooling-off before work starts",
    body: "If you cancel in writing (email) before we begin substantive work on your package or project — and before any agreed kickoff call deliverables have started — we will refund 100% of the fees paid for that unused package, minus any non-refundable payment-processor fees charged to SkillStack (if applicable).",
  },
  {
    title: "After work has started",
    body: "Once research, writing, design, development, or outreach has begun under an approved scope, fees for completed or in-progress milestones are non-refundable. Unused future milestones on a multi-phase project may be cancelled by mutual written agreement; any refund for unused phases is calculated at our discretion based on work already delivered.",
  },
  {
    title: "Package-specific notes",
    body: "Keyword packages become non-refundable once the research deliverable has been sent. Website, SEO, content, backlink, and monetization work become non-refundable for any stage that has already been delivered or substantially performed. Change-of-mind after delivery of approved work is not a ground for refund.",
  },
  {
    title: "Billing errors & duplicate charges",
    body: "If you were charged twice for the same order, or charged an incorrect amount due to a system error, contact us within 7 days with your order reference. Confirmed errors will be refunded or corrected promptly.",
  },
  {
    title: "Chargebacks",
    body: "Please contact us before filing a chargeback so we can resolve the issue. Unwarranted chargebacks may result in suspension of account access and recovery of costs where permitted by law.",
  },
  {
    title: "How to request a refund",
    body: `Email ${SITE_EMAIL} with your name, order or invoice reference, payment method (Lemon Squeezy / PayFast), and reason. We aim to respond within 2 business days and to complete approved refunds within 7–14 business days, depending on the payment provider.`,
  },
  {
    title: "Contact",
    body: `Refund questions: ${SITE_EMAIL}. Also see our Terms of service and Service delivery policy.`,
  },
];

export default function RefundPage() {
  return (
    <PageShell>
      <JsonLd
        data={webPageJsonLd({
          path: "/refund",
          title: "Return & refund policy · SkillStack",
          description:
            "Return and refund rules for SkillStack digital service packages.",
        })}
      />
      <PageHero
        eyebrow="Legal"
        title="Return & refund policy"
        lead="Last updated: 1 August 2026. How cancellations and refunds work for SkillStack digital services."
        breadcrumbs={[{ label: "Refund policy" }]}
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
          <Link href="/terms" className="text-accent hover:underline">
            Terms
          </Link>
          {" · "}
          <Link href="/service-policy" className="text-accent hover:underline">
            Service delivery
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
