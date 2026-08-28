"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import CheckoutButton from "./CheckoutButton";
import FadeIn from "./FadeIn";
import { plans } from "@/lib/pricing";

export default function PricingGrid() {
  const reduceMotion = useReducedMotion();
  const plan = plans[0];

  if (!plan) return null;

  return (
    <div className="relative overflow-hidden px-6 py-14 md:px-8 md:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(45,212,191,0.12),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-4xl">
        <FadeIn delay={0}>
          <motion.article
            whileHover={
              reduceMotion
                ? undefined
                : { y: -4, transition: { type: "spring", stiffness: 320, damping: 24 } }
            }
            className="relative overflow-hidden rounded-2xl border border-accent/40 bg-[#0d1117] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] md:p-10"
          >
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
            />

            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b border-white/10 pb-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  All-in-One SEO Suite
                </div>
                <h2 className="font-display text-3xl font-bold text-snow md:text-4xl">
                  {plan.name}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                  {plan.tagline}
                </p>
              </div>

              <div className="shrink-0 md:text-right">
                <div className="flex items-baseline gap-1.5 md:justify-end">
                  <span className="font-display text-5xl font-bold tracking-tight text-snow">
                    ${plan.priceUsd}
                  </span>
                  <span className="text-sm font-medium text-ink-muted">USD · one-time</span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Charged in PKR via PayFast at checkout
                </p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                What&apos;s included in your dashboard access:
              </p>
              <ul className="mt-5 grid gap-3.5 sm:grid-cols-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm leading-snug text-snow/90"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="text-xs text-ink-muted">
                  Instant access to all SEO tools, reports & AI workflows upon sign in.
                </p>
              </div>
              <div className="w-full sm:w-auto">
                <CheckoutButton
                  planId={plan.id}
                  featured={true}
                  label={`Get ${plan.name} — $${plan.priceUsd}`}
                />
              </div>
            </div>
          </motion.article>
        </FadeIn>

        <FadeIn className="mt-10 border border-white/10 bg-[#161b22]/80 px-6 py-5 text-sm leading-relaxed text-ink-muted md:px-8 rounded-xl">
          Checkout runs securely through{" "}
          <span className="text-snow font-medium">PayFast</span> (JazzCash, Easypaisa, local
          cards). Need custom agency white-labeling or bespoke enterprise audits? Use our{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact form
          </Link>{" "}
          for a consultation.
        </FadeIn>
      </div>
    </div>
  );
}
