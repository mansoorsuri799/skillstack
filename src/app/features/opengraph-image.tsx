import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "SkillStack features";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return createFeatureOgImage({
    eyebrow: "Features",
    title: "SEO dashboard tools",
    subtitle:
      "Keyword research, domain overview, backlinks, organic search, and more.",
  });
}
