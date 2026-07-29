import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
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
      <PageHero
        eyebrow="Success"
        title="Payment received."
        lead={
          <>
            Thanks for choosing SkillStack. We’ve recorded your Stripe checkout
            {params.session_id ? " session" : ""}. Our team will follow up by
            email within 1–2 business days to kick off your package.
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Message us
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            Back home
          </Link>
        </div>
      </PageHero>
    </PageShell>
  );
}
