import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { getFeatureBySlug, getFeatureSlugs } from "@/lib/features";

export const alt = "SkillStack feature";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getFeatureSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const feature = getFeatureBySlug(slug);

  return createFeatureOgImage({
    eyebrow: "Feature · Tool",
    title: feature?.title ?? "SkillStack Features",
    subtitle:
      feature?.summary.slice(0, 140) ??
      "Self-serve SEO dashboard tools from SkillStack.",
  });
}
