import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "SkillStack pricing";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return createFeatureOgImage({
    eyebrow: "Pricing",
    title: "Plans that scale with your rankings",
    subtitle:
      "Clear packages for SEO, content, and websites — Pakistan & worldwide.",
  });
}
