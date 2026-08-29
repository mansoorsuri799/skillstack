"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import type { PlanId } from "@/lib/pricing";
import { getPlan } from "@/lib/pricing";

export default function CheckoutButton({
  planId,
  featured = true,
  label,
}: {
  planId: PlanId;
  featured?: boolean;
  label?: string;
}) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = getPlan(planId);

  async function startCheckout() {
    setError("");
    if (!session?.user) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent("/pricing")}`;
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start checkout.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("Unexpected checkout response.");
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const btnBase =
    "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition shadow-lg disabled:opacity-60 cursor-pointer";
  const primary = featured
    ? "bg-accent text-[#010409] hover:bg-accent-deep active:scale-[0.99] font-bold"
    : "border border-white/20 bg-white/5 text-snow hover:border-white/40 hover:bg-white/10";

  if (status === "loading") {
    return (
      <div className="w-full rounded-xl border border-white/10 px-5 py-3.5 text-center text-sm text-ink-muted">
        Checking session…
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="w-full space-y-2">
        <Link
          href={`/login?callbackUrl=${encodeURIComponent("/pricing")}`}
          className={`${btnBase} ${primary}`}
        >
          <CreditCard className="h-4 w-4" />
          Sign in to get Pro access
        </Link>
        <p className="text-center text-xs text-ink-muted">
          Create an account or sign in to complete checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      <button
        type="button"
        onClick={() => void startCheckout()}
        disabled={loading}
        className={`${btnBase} ${primary}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to Stripe...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            <span>{label || `Get ${plan?.name || "Pro"} — $${plan?.priceUsd ?? 20}`}</span>
          </>
        )}
      </button>

      {error ? (
        <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-center text-xs leading-relaxed text-snow">
          <p className="font-semibold text-accent mb-1">Testing Mode Active</p>
          <p className="text-ink-muted">{error}</p>
          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-[#010409] hover:bg-accent-deep transition"
          >
            Go to Dashboard (Free) →
          </Link>
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-muted/80">
        <ShieldCheck className="h-3.5 w-3.5 text-accent" />
        <span>Secured 256-bit Stripe Checkout · Credit / Debit Card</span>
      </div>
    </div>
  );
}
