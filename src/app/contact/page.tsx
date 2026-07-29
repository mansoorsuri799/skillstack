import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn";
import ContactForm from "@/components/ContactForm";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Contact SkillStack Private Limited for websites, SEO, keywords, and backlinking projects.",
};

export default function ContactPage() {
  return (
    <PageShell>
      <div className="border-b border-white/10 bg-[#0d1117] pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Contact us
            </p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-bold tracking-tight text-snow sm:text-5xl">
              Tell us what you want to rank or build.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Share your niche, target market, and whether you need a full stack,
              SEO only, keywords, or links. We’ll reply with next steps.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-24">
        <FadeIn>
          <h2 className="text-lg font-semibold text-snow">Direct</h2>
          <a
            href="mailto:hello@skillstack.com.pk"
            className="mt-4 block font-display text-2xl font-semibold text-accent hover:underline"
          >
            hello@skillstack.com.pk
          </a>
          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="uppercase tracking-[0.16em] text-ink-muted">
                Company
              </dt>
              <dd className="mt-1 text-snow">SkillStack Private Limited</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.16em] text-ink-muted">
                Location
              </dt>
              <dd className="mt-1 text-snow">
                Pakistan · Serving national & international clients
              </dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.16em] text-ink-muted">
                Typical response
              </dt>
              <dd className="mt-1 text-snow">Within 1–2 business days</dd>
            </div>
          </dl>
        </FadeIn>

        <FadeIn delay={0.08}>
          <ContactForm />
        </FadeIn>
      </div>
    </PageShell>
  );
}
