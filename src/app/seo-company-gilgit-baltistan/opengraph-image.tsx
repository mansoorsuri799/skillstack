import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Best SEO company Gilgit-Baltistan — SkillStack";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return createFeatureOgImage({
    eyebrow: "Gilgit-Baltistan",
    title: "Best SEO company in Gilgit-Baltistan",
    subtitle:
      "Local SEO agency in Gilgit City serving Pakistan and international clients.",
  });
}
