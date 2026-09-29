import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import PageCTA from "@/components/PageCTA";
import PageHero from "@/components/PageHero";
import PageShell from "@/components/PageShell";
import ServiceGuide from "@/components/ServiceGuide";
import {
  getServiceBySlug,
  getServiceSlugs,
  services,
} from "@/lib/services";
import {
  SITE_URL,
  absoluteUrl,
  webPageJsonLd,
  pageOpenGraph,
  pageTwitter,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  const title = service.title;
  const description = `${service.summary} Available from SkillStack for clients across Pakistan and internationally.`;
  const url = absoluteUrl(`/services/${service.slug}`);
  const keywords = [
    `${service.title} Pakistan`,
    `${service.shortTitle} SEO service`,
    "SkillStack SEO services",
    "SEO agency Pakistan",
    "international SEO",
  ];
  if (service.relatedFeatureSlug) {
    keywords.push(`${service.shortTitle} done for you`);
  }

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: pageOpenGraph({
      url,
      title: `${service.title} · SkillStack`,
      description,
    }),
    twitter: pageTwitter({
      title: `${service.title} · SkillStack`,
      description,
    }),
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const path = `/services/${service.slug}`;

  return (
    <PageShell>
      <JsonLd
        data={[
          webPageJsonLd({
            path,
            title: `${service.title} · SkillStack`,
            description: `${service.summary} From SkillStack for clients across Pakistan and worldwide.`,
          }),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.summary,
            url: absoluteUrl(path),
            provider: { "@id": `${SITE_URL}/#organization` },
            areaServed: [
              { "@type": "City", name: "Gilgit" },
              { "@type": "AdministrativeArea", name: "Gilgit-Baltistan" },
              { "@type": "Country", name: "Pakistan" },
              { "@type": "Place", name: "Worldwide" },
            ],
            isRelatedTo: services
              .filter((s) => s.slug !== service.slug)
              .slice(0, 3)
              .map((s) => ({
                "@type": "Service",
                name: s.title,
                url: absoluteUrl(`/services/${s.slug}`),
              })),
          },
        ]}
      />
      <PageHero
        eyebrow={`Service ${service.n}`}
        title={service.title}
        lead={`${service.summary} Delivered from Gilgit-Baltistan for clients across Pakistan and worldwide.`}
        breadcrumbs={[
          { label: "Services", href: "/services" },
          { label: service.shortTitle },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Discuss this service
          </Link>
          {service.relatedFeatureSlug ? (
            <Link
              href={`/features/${service.relatedFeatureSlug}`}
              className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
            >
              Prefer the {service.relatedFeatureLabel ?? "dashboard tool"}?
            </Link>
          ) : (
            <Link
              href="/services"
              className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
            >
              All services
            </Link>
          )}
        </div>
      </PageHero>

      <ServiceGuide service={service} />

      {service.relatedFeatureSlug ? (
        <div className="border-t border-white/10 bg-[#161b22] py-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <p className="max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
              Want to run this yourself in the SkillStack dashboard instead of
              hiring our team?
            </p>
            <Link
              href={`/features/${service.relatedFeatureSlug}`}
              className="inline-flex shrink-0 rounded-md border border-accent/40 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent hover:bg-accent/15"
            >
              See {service.relatedFeatureLabel ?? "the product feature"} →
            </Link>
          </div>
        </div>
      ) : null}

      <PageCTA
        primary={{ href: "/contact", label: "Talk to us" }}
        secondary={{ href: "/pricing", label: "See packages" }}
      >
        Ready to run {service.shortTitle.toLowerCase()} with SkillStack?
      </PageCTA>
    </PageShell>
  );
}
