import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Payment successful",
  description: "Your SkillStack payment was received.",
};

export default async function PricingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <PageShell>
      <div className="mx-auto flex max-w-lg flex-col items-start px-6 py-24 md:px-8">
        <FadeIn>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Success
          </p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-snow sm:text-4xl">
            Payment received.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Thanks for choosing SkillStack. We’ve recorded your Stripe checkout
            {params.session_id ? " session" : ""}. Our team will follow up by
            email within 1–2 business days to kick off your package.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
            >
              Message us
            </Link>
            <Link
              href="/"
              className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
            >
              Back home
            </Link>
          </div>
        </FadeIn>
      </div>
    </PageShell>
  );
}
