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
  pageOpenGraph,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute:
      "Best SEO Company in Gilgit-Baltistan & Pakistan | SkillStack",
  },
  description:
    "SkillStack — the best SEO company and web development agency in Gilgit-Baltistan, Pakistan. Keyword research, Google ranking, content writing, backlinks, and websites for businesses across Pakistan and worldwide.",
  keywords: [
    "best SEO company Gilgit-Baltistan",
    "best SEO company Pakistan",
    "best SEO freelancer Pakistan",
    "best SEO freelancer Gilgit-Baltistan",
    "SEO company Gilgit-Baltistan",
    "SEO services Pakistan",
    "web development company Pakistan",
    "SkillStack",
    "Skill Stack",
    "SkillStack.com.pk",
    "keyword research Pakistan",
    "backlink services",
    "content writing Pakistan",
    "Google ranking Pakistan",
    "SEO blogging",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: pageOpenGraph({
    url: SITE_URL,
    title:
      "Best SEO Company in Gilgit-Baltistan & Pakistan | SkillStack",
    description:
      "SkillStack — best SEO company in Gilgit-Baltistan. Keyword research, Google ranking, content writing, backlinks & websites for Pakistan and worldwide.",
  }),
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          {
            ...webPageJsonLd({
              path: "/",
              title:
                "Best SEO Company in Gilgit-Baltistan & Pakistan | SkillStack",
              description:
                "SkillStack — best SEO company in Gilgit-Baltistan and Pakistan. Keyword research, Google ranking, SEO blogging, content writing, backlinks, and websites for clients across Pakistan and worldwide.",
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
