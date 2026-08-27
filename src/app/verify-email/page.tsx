"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    token ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    token ? "Verifying your email..." : "Missing verification token.",
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          return;
        }
        setStatus("ok");
        setMessage(data.message || "Email verified.");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="w-full max-w-md text-center">
      <Link
        href="/"
        className="font-display text-sm font-semibold text-accent hover:underline"
      >
        ← SkillStack
      </Link>
      <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-snow">
        Email verification
      </h1>
      <p
        className={`mt-4 text-sm ${
          status === "error"
            ? "text-red-300"
            : status === "ok"
              ? "text-accent"
              : "text-ink-muted"
        }`}
      >
        {message}
      </p>
      {status === "ok" ? (
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
        >
          Sign in
        </Link>
      ) : null}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#010409] px-6 py-24">
      <Suspense
        fallback={
          <p className="text-sm text-ink-muted">Verifying your email...</p>
        }
      >
        <VerifyContent />
      </Suspense>
    </main>
  );
}
