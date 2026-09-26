import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "SEO in 2026 — SkillStack";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return createFeatureOgImage({
    eyebrow: "Guide",
    title: "SEO in 2026: rank on Google and get cited by AI",
    subtitle:
      "Practical ranking, AEO, and content strategy from SkillStack Pakistan.",
  });
}
