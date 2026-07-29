import type { MetadataRoute } from "next";

const base = "https://skillstack.com.pk";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/services", "/pricing", "/process", "/about", "/contact"];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
