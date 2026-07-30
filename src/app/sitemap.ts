import type { MetadataRoute } from "next";
import { absolutePageUrl, pageSitemapEntries } from "@/lib/sitemaps";

/** Page URL sitemap — listed from /sitemap-index.xml */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return pageSitemapEntries.map((entry) => ({
    url: absolutePageUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
