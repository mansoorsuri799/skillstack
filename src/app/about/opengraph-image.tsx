import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "About SkillStack";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return createFeatureOgImage({
    eyebrow: "About",
    title: "Built in Gilgit-Baltistan. Serving the world.",
    subtitle:
      "SkillStack Private Limited — web development & SEO led by Mansoor Khan.",
  });
}
