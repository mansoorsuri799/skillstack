import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

export const alt = "Contact SkillStack";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return createFeatureOgImage({
    eyebrow: "Contact",
    title: "Talk to SkillStack about your next ranking goal",
    subtitle: "Gilgit City office · Pakistan & international projects.",
  });
}
