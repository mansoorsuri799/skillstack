import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Checkout canceled",
  description: "Your SkillStack checkout was canceled.",
  robots: { index: false, follow: false },
};

export default function PricingCancelPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Canceled"
        title="Checkout was canceled."
        lead="No charge was made. You can return to pricing anytime, or ask us for a custom package."
        tone="deep"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            View pricing
          </Link>
          <Link
            href="/contact"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            Contact us
          </Link>
        </div>
      </PageHero>
    </PageShell>
  );
}
