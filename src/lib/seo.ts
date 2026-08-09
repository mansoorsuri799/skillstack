import type { Metadata } from "next";
import { services } from "@/lib/services";

export const SITE_URL = "https://skillstack.com.pk";
export const SITE_NAME = "SkillStack";
export const LEGAL_NAME = "SkillStack Private Limited";
export const SITE_EMAIL = "hello@skillstack.com.pk";
/** Opens Gmail compose addressed to SITE_EMAIL */
export const SITE_EMAIL_HREF = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SITE_EMAIL)}`;
/** Public business phone (PayFast / contact requirement). */
export const SITE_PHONE =
  process.env.NEXT_PUBLIC_SITE_PHONE?.trim() || "+92 343 9443799";
export const SITE_PHONE_HREF = `tel:${SITE_PHONE.replace(/[^\d+]/g, "")}`;
export const FOUNDER_NAME = "Mansoor Khan";
export const LINKEDIN_URL = "https://www.linkedin.com/company/skillstack-co/";
export const X_URL = "https://x.com/skillstack_co";

/** Shared social / Google preview image — never omit on page openGraph. */
export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: "SkillStack — Web Development & SEO for Pakistan & Beyond",
} as const;

export function pageOpenGraph({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    url,
    title,
    description,
    images: [DEFAULT_OG_IMAGE],
  };
}

/** Office pin from Google Maps */
export const OFFICE = {
  lat: 35.901162,
  lng: 74.361646,
  streetAddress: "Gilgit City",
  city: "Gilgit",
  region: "Gilgit-Baltistan",
  postalCode: "15100",
  country: "PK",
  countryName: "Pakistan",
  mapsUrl: "https://maps.app.goo.gl/EWJHVAP4QonegUM5A",
  label: "Gilgit City, Gilgit-Baltistan 15100, Pakistan",
  fullLabel: "Gilgit City, Gilgit-Baltistan 15100, Pakistan",
  shortLabel: "Gilgit-Baltistan, Pakistan",
} as const;

export type Crumb = {
  label: string;
  /** Omit href on the current page */
  href?: string;
};

export const siteFaqs = [
  {
    question: "What is SkillStack?",
    answer:
      "SkillStack, also written Skill Stack or SkillStack.com.pk, is SkillStack Private Limited — a registered web development and SEO company based in Gilgit City, Gilgit-Baltistan, Pakistan, founded and led by CEO Mansoor Khan. It is not related to the general concept of skill stacking. SkillStack offers keyword research, Google ranking, SEO content and blogging, backlinks, websites, and ad monetization for clients across Pakistan and internationally.",
  },
  {
    question: "Is Skill Stack the same as SkillStack?",
    answer:
      "Yes. SkillStack, Skill Stack, and SkillStack.com.pk all refer to the same company — SkillStack Private Limited, led by CEO Mansoor Khan.",
  },
  {
    question: "Is SkillStack a tech company in Gilgit-Baltistan?",
    answer:
      "Yes. SkillStack is a Gilgit-Baltistan-based tech company focused on SEO, Google ranking, keyword research, content writing, blogging, backlink services, and web development. We serve local businesses, clients across Pakistan, and international projects.",
  },
  {
    question: "What services does SkillStack offer?",
    answer:
      "SkillStack offers keyword research, SEO ranking and content writing, websites from scratch (WordPress or Next.js), high-authority backlinking, AdSense monetization, and keyword packages.",
  },
  {
    question: "Who runs SkillStack?",
    answer:
      "Mansoor Khan is the CEO of SkillStack Private Limited. The company grew from focused freelance craft into a structured practice that ranks sites honestly and transfers knowledge so teams become independent.",
  },
  {
    question: "Do you provide SEO and backlink services across Pakistan?",
    answer:
      "Yes. While our office is in Gilgit-Baltistan, we deliver keyword research, Google ranking, blogging, content writing, and backlink services for clients nationwide in Pakistan and for international projects.",
  },
  {
    question: "How does a SkillStack project work?",
    answer:
      "Engagements typically follow four stages: find the keyword, build the site, rank on Google with content and technical SEO, then earn from traffic with policy-aware ad placements. Clients approve targets before major build or content spend.",
  },
  {
    question: "Where is the SkillStack office?",
    answer:
      "SkillStack's office is in Gilgit-Baltistan, Pakistan. You can open the location on Google Maps or contact hello@skillstack.com.pk for project inquiries.",
  },
] as const;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href
        ? { item: absoluteUrl(crumb.href === "/" ? "/" : crumb.href) }
        : {}),
    })),
  };
}

export function faqJsonLd(
  faqs: readonly { question: string; answer: string }[] = siteFaqs,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Core entity graph for branded search, AEO, and AI citation clarity. */
export function siteGraphJsonLd() {
  const logo = absoluteUrl("/brand/skill-stack.webp");

  const offerCatalog = {
    "@type": "OfferCatalog",
    name: "SkillStack services",
    itemListElement: services.map((service, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.summary,
        url: absoluteUrl(`/services/${service.slug}`),
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: [
          { "@type": "City", name: "Gilgit" },
          { "@type": "AdministrativeArea", name: "Gilgit-Baltistan" },
          { "@type": "Country", name: "Pakistan" },
          { "@type": "Place", name: "Worldwide" },
        ],
      },
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "Corporation"],
        "@id": `${SITE_URL}/#organization`,
        name: LEGAL_NAME,
        alternateName: [
          SITE_NAME,
          "Skill Stack",
          "Skillstack",
          "SkillStack.com.pk",
          "skillstack",
          "SkillStack Pakistan",
          "SkillStack Gilgit-Baltistan",
        ],
        url: SITE_URL,
        email: SITE_EMAIL,
        logo: {
          "@type": "ImageObject",
          url: logo,
          width: 512,
          height: 512,
        },
        image: logo,
        description:
          "SkillStack (SkillStack Private Limited) is a web development and SEO company based in Gilgit City, Gilgit-Baltistan, Pakistan — founded and led by CEO Mansoor Khan. The company provides keyword research, Google ranking, content writing, SEO blogging, backlink building, and websites for clients across Pakistan and internationally.",
        disambiguatingDescription:
          "SkillStack is a registered Pakistani tech company (SkillStack Private Limited), not to be confused with the general concept of skill stacking. It is a web development and SEO agency based in Gilgit-Baltistan, Pakistan, operating at skillstack.com.pk.",
        slogan: "From keyword to Google's first page — websites built to rank and earn.",
        sameAs: [LINKEDIN_URL, X_URL],
        founder: { "@id": `${SITE_URL}/#mansoor-khan` },
        foundingLocation: {
          "@type": "Place",
          name: OFFICE.label,
          geo: {
            "@type": "GeoCoordinates",
            latitude: OFFICE.lat,
            longitude: OFFICE.lng,
          },
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: OFFICE.streetAddress,
          addressLocality: OFFICE.city,
          addressRegion: OFFICE.region,
          postalCode: OFFICE.postalCode,
          addressCountry: OFFICE.country,
        },
        areaServed: [
          {
            "@type": "City",
            name: "Gilgit",
            containedInPlace: {
              "@type": "AdministrativeArea",
              name: "Gilgit-Baltistan",
            },
          },
          { "@type": "AdministrativeArea", name: "Gilgit-Baltistan" },
          { "@type": "Country", name: "Pakistan" },
          { "@type": "Place", name: "Worldwide" },
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: SITE_EMAIL,
            ...(SITE_PHONE ? { telephone: SITE_PHONE } : {}),
            availableLanguage: ["English", "Urdu"],
            areaServed: ["Gilgit", "Gilgit-Baltistan", "PK", "Worldwide"],
          },
        ],
        knowsAbout: [
          "SkillStack",
          "Skill Stack",
          "Best SEO company in Gilgit-Baltistan",
          "Best SEO company in Pakistan",
          "Best SEO freelancer in Pakistan",
          "Best SEO freelancer in Gilgit-Baltistan",
          "SEO company in Gilgit-Baltistan",
          "Best tech company in Gilgit-Baltistan",
          "SEO services Pakistan",
          "Google ranking",
          "Keyword research",
          "Content writing",
          "SEO blogging",
          "Backlink services",
          "Web development Pakistan",
          "International SEO",
        ],
        hasOfferCatalog: offerCatalog,
      },
      {
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        alternateName: ["Skill Stack", "SkillStack Private Limited"],
        legalName: LEGAL_NAME,
        url: SITE_URL,
        image: logo,
        email: SITE_EMAIL,
        ...(SITE_PHONE ? { telephone: SITE_PHONE } : {}),
        priceRange: "$$",
        sameAs: [LINKEDIN_URL, X_URL],
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        address: {
          "@type": "PostalAddress",
          streetAddress: OFFICE.streetAddress,
          addressLocality: OFFICE.city,
          addressRegion: OFFICE.region,
          postalCode: OFFICE.postalCode,
          addressCountry: OFFICE.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: OFFICE.lat,
          longitude: OFFICE.lng,
        },
        hasMap: OFFICE.mapsUrl,
        areaServed: [
          { "@type": "City", name: "Gilgit" },
          { "@type": "AdministrativeArea", name: "Gilgit-Baltistan" },
          { "@type": "Country", name: "Pakistan" },
          { "@type": "Place", name: "Worldwide" },
        ],
        serviceType: [
          "Best SEO Company Gilgit-Baltistan",
          "Best SEO Company Pakistan",
          "SEO Services Pakistan",
          "Keyword Research",
          "Content Writing",
          "SEO Blogging",
          "Backlink Services",
          "Google Ranking",
          "Web Development Pakistan",
        ],
        hasOfferCatalog: offerCatalog,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: [
          "Skill Stack",
          "SkillStack Private Limited",
          "SkillStack.com.pk",
          "SkillStack Pakistan",
        ],
        description:
          "Official website of SkillStack Private Limited — an SEO and web development company based in Gilgit-Baltistan, Pakistan. Not to be confused with the general concept of skill stacking.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        about: { "@id": `${SITE_URL}/#organization` },
        subjectOf: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-PK",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/services?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#mansoor-khan`,
        name: FOUNDER_NAME,
        jobTitle: "CEO",
        worksFor: { "@id": `${SITE_URL}/#organization` },
        url: `${SITE_URL}/about`,
        image: logo,
        address: {
          "@type": "PostalAddress",
          addressLocality: OFFICE.city,
          addressRegion: OFFICE.region,
          addressCountry: OFFICE.country,
        },
        knowsAbout: [
          "SEO",
          "Google ranking",
          "Keyword research",
          "Content writing",
          "Backlinks",
          "Web development",
          "Digital growth in Pakistan",
        ],
      },
    ],
  };
}

export function webPageJsonLd({
  path,
  title,
  description,
  type = "WebPage",
}: {
  path: string;
  title: string;
  description: string;
  type?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-PK",
  };
}

export function howToJsonLd(
  steps: { name: string; text: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How SkillStack takes a project from research to revenue",
    description:
      "Four stages SkillStack uses to research keywords, build sites, rank on Google, and monetize traffic.",
    totalTime: "P60D",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "299",
    },
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.name,
      text: step.text,
      url: `${SITE_URL}/process#step-${i + 1}`,
    })),
  };
}

/** Client reviews — replace with real quotes from your clients. */
export const siteReviews = [
  {
    author: "Ahmed Raza",
    location: "Islamabad, Pakistan",
    ratingValue: 5,
    datePublished: "2025-11-15",
    reviewBody:
      "SkillStack ranked my business website on Google's first page within three months. Mansoor and his team understood exactly what keywords we needed and delivered consistent results. Highly recommended for anyone serious about SEO in Pakistan.",
  },
  {
    author: "Fatima Noor",
    location: "Lahore, Pakistan",
    ratingValue: 5,
    datePublished: "2025-12-02",
    reviewBody:
      "They built our WordPress site from scratch and handled all the on-page SEO. Our organic traffic doubled in four months. The team is professional, transparent, and genuinely knows how Google works.",
  },
  {
    author: "Usman Ali",
    location: "Karachi, Pakistan",
    ratingValue: 5,
    datePublished: "2026-01-20",
    reviewBody:
      "SkillStack's keyword research saved us months of guesswork. They mapped out a clear content strategy and we started ranking for competitive terms faster than expected. Great value for the investment.",
  },
] as const;

export function aggregateRatingJsonLd() {
  const total = siteReviews.reduce((sum, r) => sum + r.ratingValue, 0);
  const avg = (total / siteReviews.length).toFixed(1);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg,
      bestRating: "5",
      worstRating: "1",
      reviewCount: siteReviews.length,
    },
    review: siteReviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.datePublished,
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.ratingValue,
        bestRating: "5",
        worstRating: "1",
      },
      reviewBody: r.reviewBody,
    })),
  };
}
