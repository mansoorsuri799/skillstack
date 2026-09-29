import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "stripe", "jszip"],
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "date-fns",
      "dataforseo-client",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/dashboard/keywords",
        destination: "/dashboard/keyword-research-tool",
        permanent: true,
      },
      {
        source: "/dashboard/domain",
        destination: "/dashboard/domain-overview-tool",
        permanent: true,
      },
      {
        source: "/dashboard/backlinks",
        destination: "/dashboard/backlink-checker",
        permanent: true,
      },
      {
        source: "/dashboard/brand-lookup",
        destination: "/dashboard/brand-lookup-tool",
        permanent: true,
      },
      {
        source: "/dashboard/organic/keywords",
        destination: "/dashboard/organic-keyword-checker",
        permanent: true,
      },
      {
        source: "/dashboard/organic/positions",
        destination: "/dashboard/organic-position-checker",
        permanent: true,
      },
      {
        source: "/dashboard/organic-position-tracker",
        destination: "/dashboard/organic-position-checker",
        permanent: true,
      },
      {
        source: "/features/organic-position-tracker",
        destination: "/features/organic-position-checker",
        permanent: true,
      },
      {
        source: "/dashboard/organic/pages",
        destination: "/dashboard/top-pages-finder",
        permanent: true,
      },
      {
        source: "/dashboard/organic/competitors",
        destination: "/dashboard/organic-competitor-finder",
        permanent: true,
      },
      {
        source: "/dashboard/competitive/content-gap",
        destination: "/dashboard/content-gap-finder",
        permanent: true,
      },
      {
        source: "/dashboard/pages/best-by-links",
        destination: "/dashboard/best-by-links-finder",
        permanent: true,
      },
      {
        source: "/dashboard/internal-links",
        destination: "/dashboard/internal-link-checker",
        permanent: true,
      },
      {
        source: "/dashboard/internal-links/most-linked",
        destination: "/dashboard/internal-link-checker/most-linked",
        permanent: true,
      },
      {
        source: "/dashboard/internal-links/anchors",
        destination: "/dashboard/internal-link-checker/anchors",
        permanent: true,
      },
      {
        source: "/dashboard/gsc",
        destination: "/dashboard/gsc-insights-tool",
        permanent: true,
      },
      {
        source: "/dashboard/rank-tracking",
        destination: "/dashboard/rank-tracker",
        permanent: true,
      },
      {
        source: "/dashboard/saved",
        destination: "/dashboard/saved-keywords-manager",
        permanent: true,
      },
      {
        source: "/dashboard/audit",
        destination: "/dashboard/site-audit-tool",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/og-image.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
          { key: "Content-Type", value: "image/jpeg" },
        ],
      },
      {
        source: "/twitter-card.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
          { key: "Content-Type", value: "image/jpeg" },
        ],
      },
    ];
  },
};

export default nextConfig;
