"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const inputClass =
  "mt-1.5 w-full rounded-md border border-white/15 bg-[#010409] px-3 py-2 text-sm text-snow outline-none transition placeholder:text-white/30 focus:border-accent";

function ResetPasswordFormInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [error, setError] = useState(token ? "" : "Missing reset token.");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token.");
      return;
    }

    const formEl = e.currentTarget;
    setError("");
    setSuccess("");
    setLoading(true);

    const form = new FormData(formEl);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password !== confirm) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Could not reset password.");
        return;
      }

      setSuccess(data.message || "Password updated. You can sign in now.");
      formEl.reset();
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          {success}
        </p>
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#010409] transition hover:bg-accent-deep"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-snow">New password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          disabled={!token}
          className={inputClass}
        />
        <span className="mt-1 block text-xs text-ink-muted">
          At least 8 characters
        </span>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-snow">Confirm password</span>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          disabled={!token}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={loading || !token}
        className="mt-1 w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-[#010409] transition hover:bg-accent-deep disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update password"}
      </button>

      <p className="pt-1 text-center text-sm text-ink-muted">
        <Link href="/login" className="font-medium text-accent hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-muted">Loading…</p>}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
