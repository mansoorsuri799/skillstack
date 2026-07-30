import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillStack",
    short_name: "SkillStack",
    description:
      "Web development and SEO for Pakistan and beyond — websites built to rank and earn.",
    start_url: "/",
    display: "standalone",
    background_color: "#010409",
    theme_color: "#010409",
    icons: [
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/skill-stack-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/skill-stack.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
    ],
  };
}
