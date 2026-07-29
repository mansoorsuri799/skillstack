import type { Metadata } from "next";
import Link from "next/link";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import ServicesCatalog from "@/components/ServicesCatalog";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Keyword research, websites, SEO content, monetization, keyword packages, and backlinking from SkillStack Private Limited.",
};

export default function ServicesPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Services"
        title="Services that take you from research to revenue."
        lead="One team for research, build, content, authority, and ads — so strategy never gets lost between freelancers. Pick a service or combine them into a full stack engagement."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            See packages
          </Link>
          <Link
            href="/contact"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            Ask for a mix
          </Link>
        </div>
      </PageHero>

      <ServicesCatalog />

      <PageCTA
        primary={{ href: "/contact", label: "Talk to us" }}
        secondary={{ href: "/process", label: "See the process" }}
      >
        Not sure where to start? We’ll map the right mix for your niche.
      </PageCTA>
    </PageShell>
  );
}
