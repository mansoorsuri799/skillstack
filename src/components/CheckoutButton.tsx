"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import type { PlanId } from "@/lib/pricing";
import { planPricePkr, getPlan } from "@/lib/pricing";

type Provider = "lemonsqueezy" | "payfast";

export default function CheckoutButton({
  planId,
  featured,
}: {
  planId: PlanId;
  featured?: boolean;
  label?: string;
}) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState("");
  const [showPk, setShowPk] = useState(false);

  const plan = getPlan(planId);
  const pkr = plan ? planPricePkr(plan) : 0;

  async function startCheckout(provider: Provider) {
    setError("");
    if (!session?.user) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent("/pricing")}`;
      return;
    }

    if (provider === "payfast" && mobile.replace(/\D/g, "").length < 10) {
      setShowPk(true);
      setError("Enter your JazzCash / Easypaisa mobile number.");
      return;
    }

    setLoading(provider);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          provider,
          mobile: provider === "payfast" ? mobile : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed.");
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.action && data.fields) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.action;
        form.style.display = "none";
        for (const [key, value] of Object.entries(
          data.fields as Record<string, string>,
        )) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        return;
      }

      setError("Unexpected checkout response.");
      setLoading(null);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  const btnBase =
    "w-full rounded-md px-4 py-3 text-sm font-semibold transition disabled:opacity-60";
  const primary = featured
    ? "bg-accent text-[#010409] hover:bg-accent-deep"
    : "border border-white/20 bg-white/5 text-snow hover:border-white/40 hover:bg-white/10";
  const secondary =
    "border border-white/15 bg-transparent text-snow/90 hover:border-accent/40 hover:text-accent";

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
          className={`flex ${btnBase} ${primary} items-center justify-center`}
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
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => void startCheckout("lemonsqueezy")}
        disabled={loading !== null}
        className={`${btnBase} ${primary}`}
      >
        {loading === "lemonsqueezy"
          ? "Opening card checkout…"
          : `Pay with card · $${plan?.priceUsd ?? ""} USD`}
      </button>

      {!showPk ? (
        <button
          type="button"
          onClick={() => {
            setShowPk(true);
            setError("");
          }}
          disabled={loading !== null}
          className={`${btnBase} ${secondary}`}
        >
          Pay in Pakistan · ~₨{pkr.toLocaleString("en-PK")}
        </button>
      ) : (
        <div className="space-y-2 rounded-md border border-white/10 bg-[#010409]/50 p-3">
          <label className="block text-xs text-ink-muted">
            JazzCash / Easypaisa mobile
            <input
              type="tel"
              inputMode="numeric"
              placeholder="03XXXXXXXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-white/10 bg-[#0d1117] px-3 py-2 text-sm text-snow outline-none focus:border-accent/50"
            />
          </label>
          <button
            type="button"
            onClick={() => void startCheckout("payfast")}
            disabled={loading !== null}
            className={`${btnBase} ${secondary}`}
          >
            {loading === "payfast"
              ? "Redirecting to PayFast…"
              : "Continue · JazzCash / Easypaisa / Card"}
          </button>
          <p className="text-[11px] leading-relaxed text-ink-muted">
            Opens PayFast hosted checkout (local cards & wallets).
          </p>
        </div>
      )}

      {error ? (
        <p className="text-center text-xs text-red-300">{error}</p>
      ) : null}
    </div>
  );
}
