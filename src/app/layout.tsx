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
    default: "SkillStack — Web Development & SEO for Pakistan & Beyond",
    template: "%s · SkillStack",
  },
  description:
    "SkillStack builds websites, ranks keywords on Google, and monetizes traffic with AdSense and Adsterra. Led by Mansoor Khan — serving clients nationwide and internationally.",
  keywords: [
    "SkillStack",
    "SkillStack.com.pk",
    "Skill Stack",
    "web development Pakistan",
    "SEO services Pakistan",
    "keyword ranking",
    "AdSense website",
    "backlinking",
    "Mansoor Khan",
    "AEO",
    "GEO SEO",
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
    title: "SkillStack — From keyword to Google's first page",
    description:
      "Web development, SEO blogging, keyword packages, backlinks, and ad monetization — built to rank and earn.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillStack — Web Development & SEO",
    description:
      "Websites and SEO built to rank on Google and earn through ads. Serving Pakistan and international clients.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/skill-stack.webp", type: "image/webp", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
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
