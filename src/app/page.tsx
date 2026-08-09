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
    absolute: "SkillStack — Web Development & SEO for Pakistan & Beyond",
  },
  description:
    "SkillStack (Skill Stack) — keyword research, Google ranking, SEO blogging, content writing, backlinks, and websites. Based in Gilgit-Baltistan, serving Pakistan and worldwide.",
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
    title: "SkillStack — Web Development & SEO for Pakistan & Beyond",
    description:
      "Official SkillStack site — SEO, ranking, content, backlinks, and websites from Gilgit-Baltistan for Pakistan and worldwide.",
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
              title: "SkillStack — Web Development & SEO for Pakistan & Beyond",
              description:
                "Official website of SkillStack — keyword research, Google ranking, SEO blogging, content writing, backlinks, and websites across Pakistan and worldwide.",
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
