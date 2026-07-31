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
  title: "Services | SEO, Keywords, Content & Backlinks Worldwide",
  description:
    "Keyword research, Google ranking, SEO blogging, content writing, backlinks, and websites from SkillStack — Gilgit-Baltistan-based, serving Pakistan and international clients.",
  keywords: [
    "SEO services Gilgit-Baltistan",
    "keyword research Pakistan",
    "international SEO services",
    "backlink services",
    "content writing SEO",
    "Google ranking services",
  ],
  alternates: { canonical: absoluteUrl("/services") },
  openGraph: {
    url: absoluteUrl("/services"),
    title: "SkillStack Services — SEO & Ranking Worldwide",
    description:
      "Research, ranking content, build, authority, and ads — for Gilgit-Baltistan, Pakistan, and worldwide.",
  },
};

export default function ServicesPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/services",
            title: "SkillStack Services — SEO in Gilgit-Baltistan, Pakistan & Worldwide",
            description:
              "Keyword research, Google ranking, content writing, blogging, backlinks, and websites from Gilgit-Baltistan for Pakistan and international clients.",
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
              url: `${SITE_URL}/services/${service.slug}`,
              item: {
                "@type": "Service",
                name: service.title,
                description: service.summary,
                url: `${SITE_URL}/services/${service.slug}`,
                provider: { "@id": `${SITE_URL}/#organization` },
                areaServed: [
                  { "@type": "City", name: "Gilgit" },
                  { "@type": "Country", name: "Pakistan" },
                  { "@type": "Place", name: "Worldwide" },
                ],
              },
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Services"
        title="SEO, content, and ranking services from SkillStack."
        lead="One team for keyword research, Google ranking, content writing, blogging, backlinks, and websites — based in Gilgit-Baltistan, serving Pakistan and worldwide."
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
