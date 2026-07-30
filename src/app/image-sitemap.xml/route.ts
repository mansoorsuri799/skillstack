import {
  absolutePageUrl,
  imageSitemapEntries,
  xmlEscape,
} from "@/lib/sitemaps";

export const dynamic = "force-static";

/** Google image sitemap — listed from /sitemap-index.xml */
export async function GET() {
  const now = new Date().toISOString();

  const urls = imageSitemapEntries
    .map((entry) => {
      const images = entry.images
        .map((img) => {
          const title = img.title
            ? `\n      <image:title>${xmlEscape(img.title)}</image:title>`
            : "";
          return `    <image:image>
      <image:loc>${xmlEscape(img.loc)}</image:loc>${title}
    </image:image>`;
        })
        .join("\n");

      return `  <url>
    <loc>${xmlEscape(absolutePageUrl(entry.pagePath))}</loc>
${images}
    <lastmod>${now}</lastmod>
  </url>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
