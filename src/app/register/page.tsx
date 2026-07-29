import type { Metadata } from "next";
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a SkillStack account.",
};

export default function RegisterPage() {
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
          Create account
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          We&apos;ll send a verification link to your email before you can sign
          in.
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}
