import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import {
  OFFICE,
  SITE_EMAIL,
  SITE_URL,
  absoluteUrl,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact SkillStack Private Limited for websites, SEO, keywords, and backlinking projects. Office in Gilgit-Baltistan, Pakistan.",
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: {
    url: absoluteUrl("/contact"),
    title: "Contact SkillStack",
    description:
      "Tell us your niche and goals — hello@skillstack.com.pk · Gilgit-Baltistan, Pakistan.",
  },
};

const OFFICE_EMBED_SRC = `https://www.google.com/maps?q=${OFFICE.lat},${OFFICE.lng}&z=15&output=embed`;

const details: {
  label: string;
  value: string;
  href?: string;
  hint?: string;
}[] = [
  {
    label: "Company",
    value: "SkillStack Private Limited",
  },
  {
    label: "Office",
    value: OFFICE.label,
    href: OFFICE.mapsUrl,
    hint: "Open in Google Maps",
  },
  {
    label: "Reach",
    value: "National & international clients",
  },
  {
    label: "Typical response",
    value: "Within 1–2 business days",
  },
];

export default function ContactPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/contact",
            title: "Contact SkillStack",
            description:
              "Contact SkillStack Private Limited for websites, SEO, keywords, and backlinking projects.",
            type: "ContactPage",
          }),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            url: absoluteUrl("/contact"),
            mainEntity: { "@id": `${SITE_URL}/#business` },
            about: {
              "@type": "Organization",
              name: "SkillStack Private Limited",
              email: SITE_EMAIL,
              url: SITE_URL,
            },
          },
        ]}
      />
      <PageHero
        eyebrow="Contact us"
        title="Tell us what you want to rank or build."
        lead="Share your niche, target market, and whether you need a full stack, SEO only, keywords, or links. We’ll reply with next steps."
        breadcrumbs={[{ label: "Contact" }]}
      />

      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_90%_20%,rgba(45,212,191,0.07),transparent_55%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:px-8 md:py-20">
          <FadeIn>
            <div className="h-full border border-white/10 bg-[#0d1117] p-6 sm:p-8">
              <div className="h-px w-10 bg-accent" aria-hidden />
              <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-accent">
                Direct
              </p>
              <a
                href={`mailto:${SITE_EMAIL}`}
                className="mt-4 block font-display text-2xl font-semibold tracking-tight text-snow transition-colors hover:text-accent sm:text-3xl"
              >
                {SITE_EMAIL}
              </a>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Prefer email? Reach out anytime — attach niche notes or keywords if
                you already have them.
              </p>

              <dl className="mt-10 space-y-0 divide-y divide-white/10 border-t border-white/10">
                {details.map((row) => (
                  <div key={row.label} className="py-5">
                    <dt className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                      {row.label}
                    </dt>
                    <dd className="mt-1.5 text-sm text-snow sm:text-base">
                      {row.href ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex flex-col transition-colors hover:text-accent"
                        >
                          <span>{row.value}</span>
                          {row.hint ? (
                            <span className="mt-1 text-xs text-accent group-hover:underline">
                              {row.hint} →
                            </span>
                          ) : null}
                        </a>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <ContactForm />
          </FadeIn>
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-14 md:px-8 md:pb-20">
          <FadeIn>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0d1117]">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                    Office map
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    SkillStack · {OFFICE.label}
                  </p>
                </div>
                <a
                  href={OFFICE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Get directions →
                </a>
              </div>
              <div className="relative aspect-[16/10] w-full min-h-[240px] sm:aspect-[21/9] sm:min-h-[320px]">
                <iframe
                  title="SkillStack office location on Google Maps"
                  src={OFFICE_EMBED_SRC}
                  className="absolute inset-0 h-full w-full border-0 grayscale-[20%] contrast-[1.05]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageShell>
  );
}
