import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";
import { auth } from "@/auth";
import {
  absoluteUrl,
  pageOpenGraph,
  pageTwitter,
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
  twitter: pageTwitter({
    title: "Register · SkillStack",
    description: "Create your SkillStack account.",
  }),
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

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
