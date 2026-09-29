import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FadeIn from "@/components/FadeIn";
import JsonLd from "@/components/JsonLd";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import {
  getFeatureBySlug,
  getFeatureSlugs,
  productFeatures,
} from "@/lib/features";
import {
  SITE_URL,
  absoluteUrl,
  webPageJsonLd,
  pageOpenGraph,
  pageTwitter,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getFeatureSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) return {};

  const title = feature.title;
  const description = feature.summary;
  const url = absoluteUrl(`/features/${feature.slug}`);

  return {
    title,
    description,
    keywords: feature.keywords,
    alternates: { canonical: url },
    openGraph: pageOpenGraph({
      url,
      title: `${feature.title} · SkillStack`,
      description,
    }),
    twitter: pageTwitter({
      title: `${feature.title} · SkillStack`,
      description,
    }),
  };
}

export default async function FeatureDetailPage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);
  if (!feature) notFound();

  const path = `/features/${feature.slug}`;
  const related = productFeatures
    .filter((item) => item.slug !== feature.slug)
    .filter((item) => item.group === feature.group)
    .slice(0, 3);
  const relatedFallback =
    related.length > 0
      ? related
      : productFeatures.filter((item) => item.slug !== feature.slug).slice(0, 3);

  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path,
            title: `${feature.title} · SkillStack`,
            description: feature.summary,
          }),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: feature.title,
            applicationCategory: "BusinessApplication",
            description: feature.description,
            url: absoluteUrl(path),
            provider: { "@id": `${SITE_URL}/#organization` },
            offers: {
              "@type": "Offer",
              url: absoluteUrl("/pricing"),
              priceCurrency: "USD",
            },
            isRelatedTo: relatedFallback.map((item) => ({
              "@type": "SoftwareApplication",
              name: item.title,
              url: absoluteUrl(`/features/${item.slug}`),
            })),
          },
        ]}
      />
      <PageHero
        eyebrow={feature.group}
        title={feature.title}
        lead={feature.summary}
        breadcrumbs={[
          { label: "Features", href: "/features" },
          { label: feature.shortTitle },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href={feature.dashboardHref}
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Open in dashboard
          </Link>
          {feature.relatedServiceSlug ? (
            <Link
              href={`/services/${feature.relatedServiceSlug}`}
              className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
            >
              Prefer our {feature.relatedServiceLabel ?? "service"}?
            </Link>
          ) : (
            <Link
              href="/features"
              className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
            >
              All features
            </Link>
          )}
        </div>
      </PageHero>

      <div className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <FadeIn>
            <p className="text-base leading-relaxed text-ink-muted sm:text-lg">
              {feature.description}
            </p>

            <h2 className="font-display mt-10 text-2xl font-semibold text-snow">
              What you get
            </h2>
            <ul className="mt-5 space-y-3">
              {feature.highlights.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-ink-muted sm:text-base"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="font-display mt-10 text-2xl font-semibold text-snow">
              Outcomes
            </h2>
            <ul className="mt-5 space-y-3">
              {feature.outcomes.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-ink-muted sm:text-base"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.06}>
            <aside className="border border-white/10 bg-[#0d1117] p-6 md:p-7">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                Product tool
              </p>
              <h2 className="font-display mt-3 text-xl font-semibold text-snow">
                {feature.title} in the dashboard
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                This page explains the self-serve tool. Live data and project
                saves live in your SkillStack dashboard after you sign in.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={feature.dashboardHref}
                  className="inline-flex justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
                >
                  Open {feature.shortTitle}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex justify-center rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
                >
                  Create account
                </Link>
              </div>
            </aside>

            {feature.relatedServiceSlug ? (
              <aside className="mt-6 border border-white/10 bg-[#161b22] p-6 md:p-7">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                  Or hire us
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  Prefer SkillStack to do the work and deliver results for you?
                </p>
                <Link
                  href={`/services/${feature.relatedServiceSlug}`}
                  className="mt-4 inline-flex text-sm font-medium text-accent hover:text-accent-deep"
                >
                  {feature.relatedServiceLabel ?? "Related service"} →
                </Link>
              </aside>
            ) : null}

            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                Related tools
              </p>
              <ul className="mt-4 space-y-3">
                {relatedFallback.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/features/${item.slug}`}
                      className="text-sm font-medium text-snow transition-colors hover:text-accent"
                    >
                      {item.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>

      <PageCTA
        primary={{ href: feature.dashboardHref, label: "Open tool" }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      >
        Ready to use {feature.shortTitle.toLowerCase()} on your projects?
      </PageCTA>
    </PageShell>
  );
}
