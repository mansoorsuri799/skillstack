"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import type { PlanId } from "@/lib/pricing";

export default function CheckoutButton({
  planId,
  featured,
  label = "Get started",
}: {
  planId: PlanId;
  featured?: boolean;
  label?: string;
}) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        setError(data.error || "Checkout failed.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="w-full rounded-md border border-white/10 px-4 py-3 text-center text-sm text-ink-muted">
        Checking session…
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent("/pricing")}`}
          className={`flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-semibold transition ${
            featured
              ? "bg-accent text-[#010409] hover:bg-accent-deep"
              : "border border-white/20 bg-white/5 text-snow hover:border-white/40 hover:bg-white/10"
          }`}
        >
          Sign in to buy
        </Link>
        <p className="mt-2 text-center text-xs text-ink-muted">
          Create an account or log in before checkout.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className={`w-full rounded-md px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
          featured
            ? "bg-accent text-[#010409] hover:bg-accent-deep"
            : "border border-white/20 bg-white/5 text-snow hover:border-white/40 hover:bg-white/10"
        }`}
      >
        {loading ? "Redirecting to Stripe…" : label}
      </button>
      {error ? (
        <p className="mt-3 text-center text-xs text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
