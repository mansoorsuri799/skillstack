import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "SkillStack — Web Development & SEO for Pakistan & Beyond";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

/** Serves the static branded OG image (JPEG for LinkedIn compatibility). */
export default async function Image() {
  const bytes = await readFile(join(process.cwd(), "public/og-image.jpg"));
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
