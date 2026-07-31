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
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/login", priority: 0.7, changeFrequency: "monthly" },
  { path: "/register", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

/** Page URL → images that belong on / represent that page (Google image sitemap). */
export type ImageSitemapEntry = {
  pagePath: string;
  images: { loc: string; title?: string }[];
};

export const imageSitemapEntries: ImageSitemapEntry[] = [
  {
    pagePath: "",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack logo",
      },
      {
        loc: `${SITE_URL}/brand/skill-stack-icon-512.png`,
        title: "SkillStack app icon",
      },
      {
        loc: `${SITE_URL}/opengraph-image`,
        title: "SkillStack — Web development and SEO",
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
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack brand mark",
      },
    ],
  },
  {
    pagePath: "/services",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack services",
      },
    ],
  },
  ...services.map((service) => ({
    pagePath: `/services/${service.slug}`,
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: `SkillStack — ${service.title}`,
      },
    ],
  })),
  {
    pagePath: "/pricing",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack pricing",
      },
    ],
  },
  {
    pagePath: "/process",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack process",
      },
    ],
  },
  {
    pagePath: "/contact",
    images: [
      {
        loc: `${SITE_URL}/brand/skill-stack.webp`,
        title: "SkillStack contact",
      },
    ],
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
