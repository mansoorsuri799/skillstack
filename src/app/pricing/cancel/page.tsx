import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Checkout canceled",
  description: "Your SkillStack checkout was canceled.",
};

export default function PricingCancelPage() {
  return (
    <PageShell>
      <div className="mx-auto flex max-w-lg flex-col items-start px-6 py-24 md:px-8">
        <FadeIn>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-muted">
            Canceled
          </p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-snow sm:text-4xl">
            Checkout was canceled.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            No charge was made. You can return to pricing anytime, or ask us for
            a custom package.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
            >
              View pricing
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
            >
              Contact us
            </Link>
          </div>
        </FadeIn>
      </div>
    </PageShell>
  );
}
