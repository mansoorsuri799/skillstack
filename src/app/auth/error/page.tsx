"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const MESSAGES: Record<string, string> = {
  AccessDenied:
    "Sign-in was blocked after Google. Check Vercel logs for [auth] Google sign-in failed, and confirm MONGODB_URI plus Google OAuth redirect URIs.",
  Database:
    "Google sign-in worked, but the database could not save your account. On Vercel, set MONGODB_URI (Atlas connection string) for Production and Redeploy. Atlas Network Access should allow 0.0.0.0/0.",
  NoEmail:
    "Google did not share an email address for this account. Use a Google account that has an email, or allow the email permission and try again.",
  Configuration:
    "Auth is misconfigured. Confirm AUTH_SECRET, AUTH_URL=https://skillstack.com.pk, AUTH_GOOGLE_ID, and AUTH_GOOGLE_SECRET are set on Vercel (Production) and redeploy.",
  Verification:
    "The sign-in link is invalid or expired. Try again.",
  OAuthAccountNotLinked:
    "This email is already used with another sign-in method. Use email/password, or contact support to link Google.",
  Default: "Something went wrong during sign-in. Please try again.",
};

function AuthErrorContent() {
  const params = useSearchParams();
  const code = params.get("error") || "Default";
  const message = MESSAGES[code] || MESSAGES.Default;

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#010409] px-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#0d1117] px-6 py-8 text-center">
        <h1 className="font-display text-2xl font-bold text-snow">
          Sign-in issue
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{message}</p>
        <p className="mt-2 font-display text-xs tabular-nums text-white/30">
          {code}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Back to sign in
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100svh] items-center justify-center bg-[#010409] text-ink-muted">
          Loading…
        </main>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
