import { SITE_URL } from "@/lib/seo";
import { xmlEscape } from "@/lib/sitemaps";

export const dynamic = "force-static";

/** Sitemap index: points crawlers to page + image sitemaps. */
export async function GET() {
  const now = new Date().toISOString();
  const children = [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/image-sitemap.xml`];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children
  .map(
    (loc) => `  <sitemap>
    <loc>${xmlEscape(loc)}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
