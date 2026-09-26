import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "SkillStack — Keyword research, ranking, content, backlinks";
export const size = { width: 1200, height: 628 };
export const contentType = "image/jpeg";

/** Serves the static Twitter / X large card image (JPEG for broad crawler support). */
export default async function Image() {
  const bytes = await readFile(join(process.cwd(), "public/twitter-card.jpg"));
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
