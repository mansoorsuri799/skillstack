"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import CheckoutButton from "./CheckoutButton";
import FadeIn from "./FadeIn";
import { plans } from "@/lib/pricing";

export default function PricingGrid() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden px-6 py-14 md:px-8 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(45,212,191,0.08),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan, i) => (
            <FadeIn key={plan.id} delay={reduceMotion ? 0 : i * 0.08}>
              <motion.article
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -6, transition: { type: "spring", stiffness: 320, damping: 24 } }
                }
                className={`relative flex h-full flex-col overflow-hidden rounded-lg border p-6 md:p-8 ${
                  plan.featured
                    ? "border-accent/50 bg-[#0d1117] lg:-mt-3 lg:mb-[-0.75rem] lg:shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
                    : "border-white/10 bg-[#0d1117]/70"
                }`}
              >
                {plan.featured ? (
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
                  />
                ) : null}

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
                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold tracking-tight text-snow md:text-5xl">
                    ${plan.priceUsd}
                  </span>
                  <span className="text-sm text-ink-muted">USD · one-time</span>
                </p>

                <ul className="mt-8 flex-1 space-y-3.5">
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
              </motion.article>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-12 border border-white/10 bg-[#161b22]/80 px-6 py-5 text-sm leading-relaxed text-ink-muted md:px-8">
          Payments are processed securely by{" "}
          <span className="text-snow">Stripe</span>. You’ll be redirected to Stripe
          Checkout, then returned here after payment. For Pakistan-local bank or
          custom enterprise deals, use the{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact form
          </Link>
          .
        </FadeIn>
      </div>
    </div>
  );
}
