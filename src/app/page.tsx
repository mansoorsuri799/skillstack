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
    absolute: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
  },
  description:
    "SkillStack (Skill Stack) — keyword research, Google ranking, SEO blogging, content writing, backlinks, and websites. Based in Gilgit-Baltistan, serving Pakistan and worldwide.",
  keywords: [
    "SkillStack",
    "Skill Stack",
    "SkillStack.com.pk",
    "best tech company Gilgit-Baltistan",
    "SEO company Gilgit-Baltistan",
    "SEO services Pakistan",
    "keyword research",
    "backlink services",
    "content writing",
    "Google ranking",
    "SEO blogging",
    "web development Pakistan",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
    description:
      "Official SkillStack site — SEO, ranking, content, backlinks, and websites from Gilgit-Baltistan for Pakistan and worldwide.",
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
              title: "SkillStack — Grow Your Web Ranking | Pakistan & Beyond",
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
