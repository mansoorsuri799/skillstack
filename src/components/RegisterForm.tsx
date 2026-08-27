"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";

const inputClass =
  "mt-1.5 w-full rounded-md border border-white/15 bg-[#010409] px-3 py-2 text-sm text-snow outline-none transition placeholder:text-white/30 focus:border-accent";

function safeCallbackUrl(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function RegisterFormInner() {
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError("");
    setSuccess("");
    setLoading(true);

    const form = new FormData(formEl);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed.");
      return;
    }

    setSuccess(data.message || "Check your email to verify your account.");
    formEl.reset();
  }

  return (
    <div className="space-y-4">
      <GoogleSignInButton
        label="Sign up with Google"
        callbackUrl={callbackUrl}
      />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-[11px] uppercase tracking-wide text-ink-muted">
          or
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {error ? (
          <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
            {success}
          </p>
        ) : null}

        <label className="block">
          <span className="text-sm font-medium text-snow">Full name</span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            minLength={2}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-snow">Email address</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-snow">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className={inputClass}
          />
          <span className="mt-1 block text-xs text-ink-muted">
            At least 8 characters
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#010409] transition hover:bg-accent-deep disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
      <RegisterFormInner />
    </Suspense>
  );
}
