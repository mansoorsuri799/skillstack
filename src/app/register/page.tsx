import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";
import {
  absoluteUrl,
  pageOpenGraph,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Register | Create a SkillStack Account",
  description:
    "Create a SkillStack account to access SEO, keyword research, content, and web services. Official SkillStack registration for clients in Pakistan and worldwide.",
  keywords: [
    "SkillStack register",
    "Skill Stack sign up",
    "create SkillStack account",
    "register skillstack.com.pk",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: absoluteUrl("/register") },
  openGraph: pageOpenGraph({
    url: absoluteUrl("/register"),
    title: "Register · SkillStack",
    description: "Create your SkillStack account.",
  }),
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Sign up to SkillStack"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
