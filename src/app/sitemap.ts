import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/db";
import { absolutePageUrl, pageSitemapEntries } from "@/lib/sitemaps";
import { User } from "@/models/User";

/** Page URL sitemap — listed from /sitemap-index.xml */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages = pageSitemapEntries.map((entry) => ({
    url: absolutePageUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  let profiles: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const users = await User.find({
      username: { $exists: true, $nin: [null, ""] },
      $or: [
        { bio: { $exists: true, $type: "string" } },
        { "skills.0": { $exists: true } },
      ],
    })
      .select("username updatedAt bio skills")
      .lean();

    profiles = users
      .filter((u) => {
        const bioLen = typeof u.bio === "string" ? u.bio.trim().length : 0;
        const skillCount = Array.isArray(u.skills) ? u.skills.length : 0;
        return bioLen >= 80 || skillCount >= 3;
      })
      .map((u) => ({
        url: absolutePageUrl(`/u/${u.username}`),
        lastModified: u.updatedAt ? new Date(u.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
  } catch (error) {
    console.error("[sitemap] profile URLs skipped:", error);
  }

  return [...pages, ...profiles];
}
