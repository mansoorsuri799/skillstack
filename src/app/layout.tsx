import type { Metadata } from "next";
import { Syne, Public_Sans } from "next/font/google";
import Providers from "@/components/Providers";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, siteGraphJsonLd } from "@/lib/seo";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  preload: true,
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
    template: "%s · SkillStack",
  },
  description:
    "SkillStack (Skill Stack) — keyword research, Google ranking, SEO blogging, content writing, backlinks, and websites from Gilgit-Baltistan for Pakistan and worldwide. Led by Mansoor Khan.",
  keywords: [
    "SkillStack",
    "Skill Stack",
    "Skillstack",
    "SkillStack.com.pk",
    "SEO company Gilgit-Baltistan",
    "best tech company Gilgit-Baltistan",
    "SEO services Pakistan",
    "keyword research Pakistan",
    "backlink services",
    "content writing",
    "Google ranking",
    "SEO blogging",
    "web development Pakistan",
    "Mansoor Khan",
  ],
  authors: [{ name: "Mansoor Khan", url: `${SITE_URL}/about` }],
  creator: "SkillStack",
  publisher: "SkillStack Private Limited",
  applicationName: "SkillStack",
  category: "Business",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: "SkillStack",
    title: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
    description:
      "Official SkillStack site — keyword research, Google ranking, content writing, blogging, and backlink services from Gilgit-Baltistan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
    description:
      "Keyword research, ranking, content, backlinks, and websites. Based in Gilgit-Baltistan, serving Pakistan and the world.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/skill-stack.webp", type: "image/webp", sizes: "512x512" },
      {
        url: "/brand/skill-stack-icon-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      {
        url: "/brand/skill-stack-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  other: {
    "geo.region": "PK-GB",
    "geo.placename": "Gilgit-Baltistan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-PK"
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${publicSans.variable} h-full bg-[#010409] antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-bg font-sans text-ink"
        suppressHydrationWarning
      >
        <JsonLd data={siteGraphJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
