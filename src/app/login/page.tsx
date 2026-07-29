import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SkillStack account.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-[#010409] px-6 py-24">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="font-display text-sm font-semibold text-accent hover:underline"
        >
          ← SkillStack
        </Link>
        <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-snow">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Access your SkillStack account. New accounts must verify email first.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
