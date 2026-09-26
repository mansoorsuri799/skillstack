import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "SkillStack services";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return createFeatureOgImage({
    eyebrow: "Services",
    title: "SEO, websites & growth services",
    subtitle:
      "Keyword research, ranking, content, backlinks, and sites built to earn.",
  });
}
