import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import {
  absoluteUrl,
  pageOpenGraph,
  pageTwitter,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Forgot Password | Recover SkillStack Account",
  description:
    "Reset your SkillStack password. Enter your email to receive a secure recovery link.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/forgot-password") },
  openGraph: pageOpenGraph({
    url: absoluteUrl("/forgot-password"),
    title: "Forgot password · SkillStack",
    description: "Reset your SkillStack password.",
  }),
  twitter: pageTwitter({
    title: "Forgot password · SkillStack",
    description: "Reset your SkillStack password.",
  }),
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recover your password"
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
