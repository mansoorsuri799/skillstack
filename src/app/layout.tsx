import type { Metadata, Viewport } from "next";
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
    default: "SkillStack — Web Development & SEO for Pakistan & Beyond",
    template: "%s · SkillStack",
  },
  description:
    "SkillStack (Skill Stack) — keyword research, Google ranking, SEO blogging, content writing, backlinks, and websites from Gilgit-Baltistan for Pakistan and worldwide. Led by Mansoor Khan.",
  keywords: [
    "SkillStack",
    "Skill Stack",
    "Skillstack",
    "SkillStack.com.pk",
    "best SEO company Gilgit-Baltistan",
    "best SEO company Pakistan",
    "best SEO freelancer Pakistan",
    "best SEO freelancer Gilgit-Baltistan",
    "best freelance company in Gilgit",
    "best freelance company Gilgit-Baltistan",
    "best freelancer in Gilgit",
    "top freelance company Gilgit",
    "freelance services Gilgit",
    "freelance agency Gilgit-Baltistan",
    "SEO company Gilgit-Baltistan",
    "SEO company Pakistan",
    "best tech company Gilgit-Baltistan",
    "SEO services Pakistan",
    "keyword research Pakistan",
    "backlink services",
    "content writing Pakistan",
    "Google ranking Pakistan",
    "SEO blogging",
    "web development Pakistan",
    "Mansoor Khan SEO",
    "digital marketing Gilgit-Baltistan",
  ],
  authors: [{ name: "Mansoor Khan", url: `${SITE_URL}/about` }],
  creator: "SkillStack",
  publisher: "SkillStack Private Limited",
  applicationName: "SkillStack",
  category: "Business",
  appleWebApp: {
    capable: true,
    title: "SkillStack",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: "SkillStack",
    title: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
    description:
      "Official SkillStack site — keyword research, Google ranking, content writing, blogging, and backlink services from Gilgit-Baltistan.",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
    description:
      "Keyword research, ranking, content, backlinks, and websites. Based in Gilgit-Baltistan, serving Pakistan and the world.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/brand/skill-stack-icon-192.webp",
        type: "image/webp",
        sizes: "192x192",
      },
      {
        url: "/brand/skill-stack-icon-512.webp",
        type: "image/webp",
        sizes: "512x512",
      },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
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
    "geo.placename": "Gilgit City, Gilgit-Baltistan",
    "geo.position": "35.901162;74.361646",
    ICBM: "35.901162, 74.361646",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#010409",
  colorScheme: "dark",
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
