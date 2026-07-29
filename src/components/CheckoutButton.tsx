"use client";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setError("");
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
