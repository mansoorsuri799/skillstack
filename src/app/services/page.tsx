import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import ServicesCatalog from "@/components/ServicesCatalog";
import { services } from "@/lib/content";
import { SITE_URL, absoluteUrl, webPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Keyword research, websites, SEO content, monetization, keyword packages, and backlinking from SkillStack Private Limited.",
  alternates: { canonical: absoluteUrl("/services") },
  openGraph: {
    url: absoluteUrl("/services"),
    title: "SkillStack Services",
    description:
      "Research, build, content, authority, and ads — one team from keyword to revenue.",
  },
};

export default function ServicesPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/services",
            title: "SkillStack Services",
            description:
              "Keyword research, websites, SEO content, monetization, keyword packages, and backlinking.",
            type: "CollectionPage",
          }),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "SkillStack services",
            itemListElement: services.map((service, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: service.title,
              description: service.summary,
              url: `${SITE_URL}/services#service-${service.n}`,
              item: {
                "@type": "Service",
                name: service.title,
                description: service.summary,
                provider: { "@id": `${SITE_URL}/#organization` },
                areaServed: ["PK", "Worldwide"],
              },
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Services"
        title="Services that take you from research to revenue."
        lead="One team for research, build, content, authority, and ads — so strategy never gets lost between freelancers. Pick a service or combine them into a full stack engagement."
        breadcrumbs={[{ label: "Services" }]}
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
