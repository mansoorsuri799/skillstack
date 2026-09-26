import { createFeatureOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { getServiceBySlug, getServiceSlugs } from "@/lib/services";

export const alt = "SkillStack service";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  return createFeatureOgImage({
    eyebrow: "Service",
    title: service?.title ?? "SkillStack Services",
    subtitle:
      service?.summary.slice(0, 140) ??
      "SEO, web development, and ranking from Gilgit-Baltistan.",
  });
}
