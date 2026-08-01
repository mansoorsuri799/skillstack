import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import { SITE_EMAIL, SITE_EMAIL_HREF, absoluteUrl, webPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How SkillStack Private Limited collects, uses, and protects personal information on skillstack.com.pk.",
  alternates: { canonical: absoluteUrl("/privacy") },
};

const sections = [
  {
    title: "Who we are",
    body: `SkillStack Private Limited (“SkillStack”, “we”, “us”) operates skillstack.com.pk. Contact: ${SITE_EMAIL}.`,
  },
  {
    title: "Information we collect",
    body: "Account details (name, email, password hash or Google profile), profile fields you choose to publish (headline, bio, skills, links), contact-form messages, and basic technical logs needed to run the site (for example IP and user agent on requests).",
  },
  {
    title: "How we use information",
    body: "We use your data to create and secure accounts, send verification and service emails, reply to project briefs, process payments via Lemon Squeezy and/or PayFast, improve the product, and meet legal obligations.",
  },
  {
    title: "Sharing",
    body: "We share data with processors that help us operate: MongoDB (database), Lemon Squeezy and PayFast (payments), Google (OAuth / email delivery when configured), and hosting (for example Vercel). We do not sell your personal information.",
  },
  {
    title: "Public profiles",
    body: "If you set a username and profile details, that information may appear on a public profile URL. Only publish what you are comfortable sharing.",
  },
  {
    title: "Retention",
    body: "We keep account and project-related records while your account is active and for a reasonable period afterward for security, billing, and legal needs. You may ask us to delete your account by emailing us.",
  },
  {
    title: "Your choices",
    body: "You can update profile information while signed in, request access or deletion of your account data, and unsubscribe from non-essential emails where offered.",
  },
  {
    title: "Security",
    body: "We use industry-standard practices (HTTPS, hashed passwords, access controls). No method of transmission is 100% secure.",
  },
  {
    title: "Changes",
    body: "We may update this policy. The “Last updated” date at the top of this page will change when we do.",
  },
];

export default function PrivacyPage() {
  return (
    <PageShell>
      <JsonLd
        data={webPageJsonLd({
          path: "/privacy",
          title: "Privacy policy · SkillStack",
          description:
            "How SkillStack Private Limited collects, uses, and protects personal information.",
        })}
      />
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead="Last updated: 30 July 2026. Clear rules for how we handle your data on SkillStack."
        breadcrumbs={[{ label: "Privacy" }]}
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
          Questions?{" "}
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
          <Link href="/refund" className="text-accent hover:underline">
            Refunds
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
