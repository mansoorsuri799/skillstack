import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Payment successful | SkillStack",
  description: "Your SkillStack Pro payment was received.",
  robots: { index: false, follow: false },
};

export default async function PricingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();

  // If a Stripe session ID is present, verify and ensure Pro status is active
  if (params.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripe();
      const checkoutSession = await stripe.checkout.sessions.retrieve(params.session_id);
      if (checkoutSession.payment_status === "paid") {
        await connectDB();
        const userEmail = checkoutSession.customer_email || session?.user?.email;
        const userId = checkoutSession.metadata?.userId || checkoutSession.client_reference_id || session?.user?.id;
        
        if (userId) {
          await User.findByIdAndUpdate(userId, { dashboardPro: true });
        } else if (userEmail) {
          await User.findOneAndUpdate(
            { email: userEmail.toLowerCase().trim() },
            { dashboardPro: true },
          );
        }
      }
    } catch (err) {
      console.error("[Success Page Verification Error]:", err);
    }
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Success"
        title="Payment received · Welcome to Pro"
        lead={
          <>
            Thanks for choosing SkillStack Pro. Your transaction has been confirmed and
            your all-in-one SEO workspace is ready.
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-[#010409] hover:bg-accent-deep shadow-lg transition"
          >
            <CheckCircle2 className="h-4 w-4" />
            Open SEO Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard/keywords"
            className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-snow hover:bg-white/10 transition"
          >
            Start Keyword Research
          </Link>
        </div>
      </PageHero>
    </PageShell>
  );
}
