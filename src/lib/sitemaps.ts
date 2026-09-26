import { services } from "@/lib/services";
import { SITE_URL } from "@/lib/seo";

export type PageSitemapEntry = {
  path: string;
  priority: number;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

/** Static marketing + legal pages (service detail pages added from `services`). */
export const pageSitemapEntries: PageSitemapEntry[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  ...services.map((service) => ({
    path: `/services/${service.slug}`,
    priority: 0.85,
    changeFrequency: "monthly" as const,
  })),
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/process", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  {
    path: "/seo-company-gilgit-baltistan",
    priority: 0.95,
    changeFrequency: "monthly",
  },
  { path: "/seo-2026", priority: 0.9, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/login", priority: 0.7, changeFrequency: "monthly" },
  { path: "/register", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund", priority: 0.3, changeFrequency: "yearly" },
  { path: "/service-policy", priority: 0.3, changeFrequency: "yearly" },
];

/** Page URL → images that belong on / represent that page (Google image sitemap). */
export type ImageSitemapEntry = {
  pagePath: string;
  images: { loc: string; title?: string }[];
};

function pageFeatureImage(pagePath: string, title: string) {
  const ogPath = pagePath ? `${pagePath}/opengraph-image` : "/opengraph-image";
  return {
    loc: `${SITE_URL}${ogPath}`,
    title,
  };
}

export const imageSitemapEntries: ImageSitemapEntry[] = [
  {
    pagePath: "",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack logo",
      },
      {
        loc: `${SITE_URL}/brand/skill-stack-icon-512.webp`,
        title: "SkillStack app icon",
      },
      {
        loc: `${SITE_URL}/og-image.webp`,
        title: "SkillStack Open Graph image",
      },
      {
        loc: `${SITE_URL}/og-image-square.webp`,
        title: "SkillStack square social image",
      },
      {
        loc: `${SITE_URL}/twitter-card.webp`,
        title: "SkillStack Twitter / X card",
      },
      {
        loc: `${SITE_URL}/apple-icon.png`,
        title: "SkillStack apple touch icon",
      },
    ],
  },
  {
    pagePath: "/about",
    images: [
      pageFeatureImage("/about", "About SkillStack"),
      {
        loc: `${SITE_URL}/mansoor-khan.webp`,
        title: "Mansoor Khan — CEO of SkillStack",
      },
    ],
  },
  {
    pagePath: "/services",
    images: [pageFeatureImage("/services", "SkillStack services")],
  },
  ...services.map((service) => ({
    pagePath: `/services/${service.slug}`,
    images: [
      pageFeatureImage(
        `/services/${service.slug}`,
        `SkillStack — ${service.title}`,
      ),
    ],
  })),
  {
    pagePath: "/pricing",
    images: [pageFeatureImage("/pricing", "SkillStack pricing")],
  },
  {
    pagePath: "/process",
    images: [pageFeatureImage("/process", "SkillStack process")],
  },
  {
    pagePath: "/seo-company-gilgit-baltistan",
    images: [
      pageFeatureImage(
        "/seo-company-gilgit-baltistan",
        "Best SEO Company in Gilgit-Baltistan — SkillStack",
      ),
    ],
  },
  {
    pagePath: "/seo-2026",
    images: [pageFeatureImage("/seo-2026", "SEO in 2026 — SkillStack")],
  },
  {
    pagePath: "/contact",
    images: [pageFeatureImage("/contact", "Contact SkillStack")],
  },
  {
    pagePath: "/login",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack login",
      },
    ],
  },
  {
    pagePath: "/register",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack register",
      },
    ],
  },
  {
    pagePath: "/privacy",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack privacy policy",
      },
    ],
  },
  {
    pagePath: "/terms",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack terms of service",
      },
    ],
  },
];

export function absolutePageUrl(path: string) {
  return path ? `${SITE_URL}${path}` : SITE_URL;
}

export function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
