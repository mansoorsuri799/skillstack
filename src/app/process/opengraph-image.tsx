import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "SkillStack process";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return createFeatureOgImage({
    eyebrow: "Process",
    title: "From keyword research to revenue",
    subtitle:
      "Find → Build → Rank → Earn — how SkillStack runs every engagement.",
  });
}
