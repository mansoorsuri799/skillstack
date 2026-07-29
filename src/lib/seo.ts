export const SITE_URL = "https://skillstack.com.pk";
export const SITE_NAME = "SkillStack";
export const LEGAL_NAME = "SkillStack Private Limited";
export const SITE_EMAIL = "hello@skillstack.com.pk";
export const FOUNDER_NAME = "Mansoor Khan";

/** Office pin from Google Maps */
export const OFFICE = {
  lat: 35.901162,
  lng: 74.361646,
  region: "Gilgit-Baltistan",
  country: "PK",
  mapsUrl: "https://maps.app.goo.gl/EWJHVAP4QonegUM5A",
  label: "Gilgit-Baltistan, Pakistan",
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
      "SkillStack Private Limited is a web development and SEO company that helps clients research keywords, build ranking-ready websites, publish SEO content, earn from traffic with ads, and grow authority with careful backlinking. It is led by CEO Mansoor Khan and serves clients in Pakistan and internationally.",
  },
  {
    question: "What services does SkillStack offer?",
    answer:
      "SkillStack offers keyword research and ranking, websites built from scratch (WordPress or Next.js), SEO blogging and content, AdSense and Adsterra monetization layouts, keyword packages, and risk-aware backlinking.",
  },
  {
    question: "Who runs SkillStack?",
    answer:
      "Mansoor Khan is the CEO of SkillStack Private Limited. The company grows from focused freelance craft into a structured practice that ranks sites honestly and transfers knowledge so teams become independent.",
  },
  {
    question: "Does SkillStack work with international clients?",
    answer:
      "Yes. SkillStack is based in Pakistan and delivers for national and international clients — from first domain to ranking strategy and monetization.",
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

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: LEGAL_NAME,
        alternateName: [SITE_NAME, "Skill Stack", "SkillStack.com.pk"],
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
          "Web development and SEO company specializing in keyword ranking, content, backlinks, and ad monetization — serving national and international clients.",
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
          addressRegion: OFFICE.region,
          addressCountry: OFFICE.country,
        },
        areaServed: [
          { "@type": "Country", name: "Pakistan" },
          { "@type": "Place", name: "Worldwide" },
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: SITE_EMAIL,
            availableLanguage: ["English", "Urdu"],
            areaServed: ["PK", "Worldwide"],
          },
        ],
        knowsAbout: [
          "Web development",
          "Search engine optimization",
          "Keyword research",
          "SEO content",
          "Backlinking",
          "AdSense monetization",
          "Answer engine optimization",
          "Generative engine optimization",
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#business`,
        name: SITE_NAME,
        legalName: LEGAL_NAME,
        url: SITE_URL,
        image: logo,
        email: SITE_EMAIL,
        priceRange: "$$",
        parentOrganization: { "@id": `${SITE_URL}/#organization` },
        address: {
          "@type": "PostalAddress",
          addressRegion: OFFICE.region,
          addressCountry: OFFICE.country,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: OFFICE.lat,
          longitude: OFFICE.lng,
        },
        hasMap: OFFICE.mapsUrl,
        areaServed: ["PK", "Worldwide"],
        serviceType: [
          "Web Development",
          "SEO",
          "Keyword Research",
          "Content Marketing",
          "Link Building",
          "Ad Monetization",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: ["Skill Stack", "SkillStack Private Limited"],
        description:
          "From keyword to Google's first page — websites built to rank and earn.",
        publisher: { "@id": `${SITE_URL}/#organization` },
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
          addressCountry: OFFICE.country,
        },
        knowsAbout: [
          "SEO",
          "Web development",
          "Keyword research",
          "Digital growth",
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
