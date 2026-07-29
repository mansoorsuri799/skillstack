import type { Metadata } from "next";
import Link from "next/link";
import CheckoutButton from "@/components/CheckoutButton";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";
import { plans } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "SkillStack packages — Starter, Growth, and Dominate. One-time payments via Stripe.",
};

export default function PricingPage() {
  return (
    <PageShell>
      <div className="border-b border-white/10 bg-[#0d1117] pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
              Pricing
            </p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl font-bold tracking-tight text-snow sm:text-5xl">
              Clear packages. Secure checkout with Stripe.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
              One-time payments for research, builds, and full ranking stacks.
              Need a custom quote?{" "}
              <Link href="/contact" className="text-accent hover:underline">
                Contact us
              </Link>
              .
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <FadeIn key={plan.id} delay={i * 0.08}>
              <article
                className={`flex h-full flex-col rounded-md border p-6 md:p-8 ${
                  plan.featured
                    ? "border-accent/50 bg-[#0d1117] shadow-[0_0_0_1px_rgba(45,212,191,0.15)]"
                    : "border-white/10 bg-[#0d1117]/60"
                }`}
              >
                {plan.featured ? (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    Most popular
                  </p>
                ) : (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-transparent">
                    —
                  </p>
                )}
                <h2 className="font-display text-2xl font-bold text-snow">
                  {plan.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {plan.tagline}
                </p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-snow">
                    ${plan.priceUsd}
                  </span>
                  <span className="text-sm text-ink-muted">USD · one-time</span>
                </p>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-3 text-sm leading-relaxed text-snow/80"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <CheckoutButton
                    planId={plan.id}
                    featured={plan.featured}
                    label={`Buy ${plan.name}`}
                  />
                </div>
              </article>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-14 rounded-md border border-white/10 bg-[#161b22] px-6 py-5 text-sm text-ink-muted md:px-8">
          Payments are processed securely by{" "}
          <span className="text-snow">Stripe</span>. You’ll be redirected to
          Stripe Checkout, then returned here after payment. For Pakistan-local
          bank or custom enterprise deals, use the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact form
          </Link>
          .
        </FadeIn>
      </div>
    </PageShell>
  );
}
