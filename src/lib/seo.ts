import { services } from "@/lib/services";

export const SITE_URL = "https://skillstack.com.pk";
export const SITE_NAME = "SkillStack";
export const LEGAL_NAME = "SkillStack Private Limited";
export const SITE_EMAIL = "hello@skillstack.com.pk";
/** Opens Gmail compose addressed to SITE_EMAIL */
export const SITE_EMAIL_HREF = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SITE_EMAIL)}`;
export const FOUNDER_NAME = "Mansoor Khan";
export const LINKEDIN_URL = "https://www.linkedin.com/company/skillstack-co/";
export const X_URL = "https://x.com/skillstack_co";

/** Office pin from Google Maps */
export const OFFICE = {
  lat: 35.901162,
  lng: 74.361646,
  city: "Gilgit",
  region: "Gilgit-Baltistan",
  country: "PK",
  countryName: "Pakistan",
  mapsUrl: "https://maps.app.goo.gl/EWJHVAP4QonegUM5A",
  label: "Gilgit, Gilgit-Baltistan, Pakistan",
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
      "SkillStack (also written Skill Stack) is SkillStack Private Limited — a web development and SEO company based in Gilgit-Baltistan, Pakistan. We help clients with keyword research, Google ranking, SEO content and blogging, backlinks, websites, and ad monetization across Pakistan and internationally.",
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
      "SkillStack’s office is in Gilgit-Baltistan, Pakistan. You can open the location on Google Maps or contact hello@skillstack.com.pk for project inquiries.",
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
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: LEGAL_NAME,
        alternateName: [
          SITE_NAME,
          "Skill Stack",
          "Skillstack",
          "SkillStack.com.pk",
          "skillstack",
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
          "SkillStack is a tech and SEO company in Gilgit-Baltistan, Pakistan — keyword research, Google ranking, content writing, blogging, backlinks, and websites for local, national, and international clients.",
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
          addressLocality: OFFICE.city,
          addressRegion: OFFICE.region,
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
            availableLanguage: ["English", "Urdu"],
            areaServed: ["Gilgit", "Gilgit-Baltistan", "PK", "Worldwide"],
          },
        ],
        knowsAbout: [
          "SkillStack",
          "Skill Stack",
          "SEO company in Gilgit-Baltistan",
          "Best tech company in Gilgit-Baltistan",
          "SEO services Pakistan",
          "Google ranking",
          "Keyword research",
          "Content writing",
          "SEO blogging",
          "Backlink services",
          "Web development",
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
        priceRange: "$$",
        sameAs: [LINKEDIN_URL, X_URL],
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        address: {
          "@type": "PostalAddress",
          addressLocality: OFFICE.city,
          addressRegion: OFFICE.region,
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
          "SEO Services",
          "Keyword Research",
          "Content Writing",
          "SEO Blogging",
          "Backlink Services",
          "Google Ranking",
          "Web Development",
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
        ],
        description:
          "Official website of SkillStack — SEO, keyword research, content, backlinks, and websites from Gilgit-Baltistan for Pakistan and worldwide.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-PK",
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

/**
 * When you have real client reviews, add AggregateRating here and a matching
 * visible rating UI. Do not invent fake stars — Google may ignore or penalize them.
 */
export function reviewPlaceholderNote() {
  return null;
}
