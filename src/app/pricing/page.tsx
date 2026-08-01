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
  title: "Pricing | SEO Packages Gilgit-Baltistan, Pakistan & Worldwide",
  description:
    "SkillStack packages: Keyword Package, Growth (website + SEO), and Full Stack — based in Gilgit-Baltistan for Pakistan and worldwide.",
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: pageOpenGraph({
    url: absoluteUrl("/pricing"),
    title: "SkillStack Pricing — Three Clear Packages",
    description:
      "Keyword research, website + SEO growth, or full stack — pay via PayFast (JazzCash, Easypaisa, cards).",
  }),
};

export default function PricingPage() {
  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/pricing",
            title: "SkillStack Pricing",
            description:
              "Three one-time packages: keyword research, website + SEO growth, and full stack.",
          }),
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "SkillStack packages",
            itemListElement: plans.map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              description: plan.tagline,
              category: plan.topic,
              url: absoluteUrl("/pricing"),
              price: plan.priceUsd,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              seller: { "@id": `${SITE_URL}/#organization` },
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Pricing"
        title="Three packages. Built around how clients hire us."
        lead={
          <>
            Start with keywords, grow with a ranking-ready site and SEO, or go
            full stack through backlinks and monetization. Pay in Pakistan via
            PayFast (JazzCash / Easypaisa / local cards). Need website-only,
            backlinks-only, or a custom mix?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Contact us
            </Link>
            .
          </>
        }
        breadcrumbs={[{ label: "Pricing" }]}
      />
      <PricingGrid />
    </PageShell>
  );
}
