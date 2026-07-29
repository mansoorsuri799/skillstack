"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function RegisterForm() {
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
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
        <span className="text-sm text-ink-muted">Full name</span>
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          minLength={2}
          className="mt-2 w-full rounded-md border border-white/10 bg-[#0d1117] px-3 py-2.5 text-snow outline-none transition focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink-muted">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-white/10 bg-[#0d1117] px-3 py-2.5 text-snow outline-none transition focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink-muted">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="mt-2 w-full rounded-md border border-white/10 bg-[#0d1117] px-3 py-2.5 text-snow outline-none transition focus:border-accent"
        />
        <span className="mt-1 block text-xs text-ink-muted">
          At least 8 characters
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-[#010409] transition hover:bg-accent-deep disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-ink-muted">
        Already registered?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
