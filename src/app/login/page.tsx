import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Login | Sign in to SkillStack",
  description:
    "Sign in to your SkillStack account to manage projects, profile, and SEO services. Official SkillStack login for clients in Pakistan and worldwide.",
  keywords: [
    "SkillStack login",
    "Skill Stack sign in",
    "SkillStack account",
    "login skillstack.com.pk",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: absoluteUrl("/login") },
  openGraph: {
    url: absoluteUrl("/login"),
    title: "Login · SkillStack",
    description: "Sign in to your SkillStack account.",
  },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to SkillStack"
      footer={
        <>
          New to SkillStack?{" "}
          <Link
            href="/register?callbackUrl=/contact"
            className="font-medium text-accent hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
