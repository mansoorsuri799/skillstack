import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import ProfileEditor from "@/components/ProfileEditor";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Edit your SkillStack profile, skills, and public details.",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Account"
        title="Your profile"
        lead="Add your headline, skills, and links so clients and teammates know what you ship."
        breadcrumbs={[{ label: "Profile" }]}
      />
      <div className="mx-auto max-w-3xl px-6 py-12 md:px-8 md:py-16">
        <ProfileEditor />
      </div>
    </PageShell>
  );
}
