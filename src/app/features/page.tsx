import type { Metadata } from "next";
import Link from "next/link";
import FeaturesCatalog from "@/components/FeaturesCatalog";
import JsonLd from "@/components/JsonLd";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import { auth } from "@/auth";
import { productFeatures } from "@/lib/features";
import {
  SITE_URL,
  absoluteUrl,
  webPageJsonLd,
  pageOpenGraph,
  pageTwitter,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Features · SkillStack SEO Dashboard",
  description:
    "Explore SkillStack SEO tools — keyword research, domain overview, backlinks, organic competitors, content gap, GSC insights, rank tracking, and site audit.",
  keywords: [
    "SkillStack features",
    "SEO dashboard tools",
    "keyword research tool",
    "domain overview",
    "backlink checker",
    "rank tracking",
  ],
  alternates: { canonical: absoluteUrl("/features") },
  openGraph: pageOpenGraph({
    url: absoluteUrl("/features"),
    title: "SkillStack Features — SEO Dashboard Tools",
    description:
      "Keyword research, domain overview, backlinks, organic search, competitive analysis, and site tools in one dashboard.",
  }),
  twitter: pageTwitter({
    title: "SkillStack Features — SEO Dashboard Tools",
    description:
      "Keyword research, domain overview, backlinks, organic search, competitive analysis, and site tools in one dashboard.",
  }),
};

export default async function FeaturesPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const primaryHref = isLoggedIn ? "/dashboard" : "/register";
  const primaryLabel = isLoggedIn ? "Open dashboard" : "Start free";
  const ctaLabel = isLoggedIn ? "Open dashboard" : "Create account";

  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path: "/features",
            title: "SkillStack Features — SEO Dashboard Tools",
            description:
              "Explore SkillStack SEO tools including keyword research, domain overview, backlinks, organic competitors, and site audit.",
            type: "CollectionPage",
          }),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "SkillStack SEO dashboard features",
            itemListElement: productFeatures.map((feature, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: feature.title,
              description: feature.summary,
              url: `${SITE_URL}/features/${feature.slug}`,
              item: {
                "@type": "SoftwareApplication",
                name: feature.title,
                applicationCategory: "BusinessApplication",
                description: feature.summary,
                url: `${SITE_URL}/features/${feature.slug}`,
                offers: {
                  "@type": "Offer",
                  url: `${SITE_URL}/pricing`,
                },
              },
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Features"
        title="SEO tools built into the SkillStack dashboard."
        lead="Keyword research, domain overview, backlinks, organic search, competitive gaps, GSC, and site audit — marketing pages you can index, with live tools waiting in the dashboard."
        breadcrumbs={[{ label: "Features" }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/pricing"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            See pricing
          </Link>
        </div>
      </PageHero>

      <FeaturesCatalog />

      <PageCTA
        primary={{ href: primaryHref, label: ctaLabel }}
        secondary={{ href: "/pricing", label: "SkillStack Pro" }}
      >
        Ready to run these tools on your own projects?
      </PageCTA>
    </PageShell>
  );
}
