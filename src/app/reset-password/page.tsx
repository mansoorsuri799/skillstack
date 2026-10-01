import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import {
  absoluteUrl,
  pageOpenGraph,
  pageTwitter,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reset Password | SkillStack",
  description: "Choose a new password for your SkillStack account.",
  robots: { index: false, follow: false },
  alternates: { canonical: absoluteUrl("/reset-password") },
  openGraph: pageOpenGraph({
    url: absoluteUrl("/reset-password"),
    title: "Reset password · SkillStack",
    description: "Choose a new password for your SkillStack account.",
  }),
  twitter: pageTwitter({
    title: "Reset password · SkillStack",
    description: "Choose a new password for your SkillStack account.",
  }),
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      footer={
        <>
          Back to{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
