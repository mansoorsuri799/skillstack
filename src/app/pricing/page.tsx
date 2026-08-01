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
    "SkillStack packages for keyword research, websites, SEO ranking, content, and backlinks — based in Gilgit-Baltistan, serving Pakistan and international clients. One-time payments via Stripe.",
  alternates: { canonical: absoluteUrl("/pricing") },
  openGraph: pageOpenGraph({
    url: absoluteUrl("/pricing"),
    title: "SkillStack Pricing — Worldwide",
    description:
      "Clear one-time packages for keyword research, website builds, and full ranking stacks.",
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
              "Clear packages with secure Stripe checkout for research, builds, and ranking stacks.",
          }),
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "SkillStack packages",
            itemListElement: plans.map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              description: plan.tagline,
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
        title="Clear packages. Secure checkout with Stripe."
        lead={
          <>
            One-time payments for research, builds, and full ranking stacks. Need a
            custom quote?{" "}
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
