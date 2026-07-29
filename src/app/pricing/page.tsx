import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import PricingGrid from "@/components/PricingGrid";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "SkillStack packages — Starter, Growth, and Dominate. One-time payments via Stripe.",
};

export default function PricingPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Pricing"
        title="Clear packages. Secure checkout with Stripe."
        lead={
          <>
            One-time payments for research, builds, and full ranking stacks. Need a
            custom quote?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Contact us
            </Link>
            .
          </>
        }
      />
      <PricingGrid />
    </PageShell>
  );
}
