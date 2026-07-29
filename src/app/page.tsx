import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  faqJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: "SkillStack — Web Development & SEO for Pakistan & Beyond",
  },
  description:
    "SkillStack builds websites, ranks keywords on Google, and monetizes traffic. Led by Mansoor Khan — Pakistan and international clients.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: "SkillStack — From keyword to Google's first page",
    description:
      "Web development, SEO, keyword packages, backlinks, and ad monetization.",
  },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          {
            ...webPageJsonLd({
              path: "/",
              title: "SkillStack — Web Development & SEO for Pakistan & Beyond",
              description:
                "SkillStack builds websites, ranks keywords on Google, and monetizes traffic with AdSense and Adsterra.",
            }),
            speakable: {
              "@type": "SpeakableSpecification",
              cssSelector: ["h1", "[data-speakable]"],
            },
          },
          faqJsonLd(),
        ]}
      />
      <Header />
      <main>
        <Hero />
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}
