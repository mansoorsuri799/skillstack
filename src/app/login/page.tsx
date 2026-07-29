import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SkillStack account.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to SkillStack"
      footer={
        <>
          New to SkillStack?{" "}
          <Link href="/register?callbackUrl=/contact" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
