import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import PricingGrid from "@/components/PricingGrid";
import { plans } from "@/lib/pricing";
import {
  SITE_URL,
  absoluteUrl,
  webPageJsonLd,
  pageOpenGraph,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing | All-in-One SEO Dashboard Suite",
  description:
    "SkillStack Pro: Complete access to the full SEO dashboard, keyword research, live backlinks tracking, site audits, rank tracking, and AI search tools for $20 USD.",
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: pageOpenGraph({
    url: absoluteUrl("/pricing"),
    title: "SkillStack Pricing — All-in-One SEO Suite",
    description:
      "Unlock the entire SkillStack SEO Dashboard, Keyword Research, Backlinks, Rank Tracking & AI tools for $20 USD.",
  }),
};

export default function PricingPage() {
  const plan = plans[0];

  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/pricing",
            title: "SkillStack Pricing",
            description:
              "All-in-one SEO dashboard package: keyword research, live backlinks, rank tracking, site audit, and AI search tools for $20 USD.",
          }),
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "SkillStack Packages",
            itemListElement: [
              {
                "@type": "Offer",
                name: plan.name,
                description: plan.tagline,
                category: plan.topic,
                url: absoluteUrl("/pricing"),
                price: plan.priceUsd,
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                seller: { "@id": `${SITE_URL}/#organization` },
              },
            ],
          },
        ]}
      />
      <PageHero
        eyebrow="Pricing"
        breadcrumbs={[{ label: "Pricing" }]}
        title="One package. Complete SEO command center."
        lead={
          <>
            Get complete access to all SEO tools, keyword research, live backlinks
            analysis, site audits, rank tracking, and AI search intelligence for just $20 USD.
            Pay in Pakistan via PayFast (JazzCash / Easypaisa / local cards). Need custom enterprise
            requirements?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Contact us
            </Link>
            .
          </>
        }
      />
      <PricingGrid />
    </PageShell>
  );
}
