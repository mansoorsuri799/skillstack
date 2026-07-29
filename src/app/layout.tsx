import type { Metadata } from "next";
import { Syne, Public_Sans } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = "https://skillstack.com.pk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SkillStack — Web Development & SEO for Pakistan & Beyond",
    template: "%s · SkillStack",
  },
  description:
    "SkillStack builds websites, ranks keywords on Google, and monetizes traffic with AdSense and Adsterra. Led by Mansoor Khan — serving clients nationwide and internationally.",
  keywords: [
    "SkillStack",
    "web development Pakistan",
    "SEO services",
    "keyword ranking",
    "AdSense website",
    "backlinking",
    "Mansoor Khan",
  ],
  authors: [{ name: "Mansoor Khan", url: siteUrl }],
  creator: "SkillStack",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "SkillStack",
    title: "SkillStack — From keyword to Google's first page",
    description:
      "Web development, SEO blogging, keyword packages, backlinks, and ad monetization — built to rank and earn.",
    images: [
      {
        url: "/brand/skillstack-logo.png",
        width: 1200,
        height: 675,
        alt: "SkillStack — web development & SEO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillStack — Web Development & SEO",
    description:
      "Websites and SEO built to rank on Google and earn through ads. Serving Pakistan and international clients.",
    images: ["/brand/skillstack-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SkillStack Private Limited",
  url: siteUrl,
  email: "hello@skillstack.com.pk",
  description:
    "Web development and SEO company specializing in keyword ranking, content, backlinks, and ad monetization — serving national and international clients.",
  founder: {
    "@type": "Person",
    name: "Mansoor Khan",
    jobTitle: "CEO",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
    },
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "PK",
  },
  areaServed: ["PK", "Worldwide"],
  logo: `${siteUrl}/brand/skillstack-logo.png`,
  image: `${siteUrl}/brand/skillstack-mark.png`,
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${publicSans.variable} h-full bg-[#010409] antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-bg font-sans text-ink"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
