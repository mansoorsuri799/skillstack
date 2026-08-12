import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  aggregateRatingJsonLd,
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
          aggregateRatingJsonLd(),
        ]}
      />
      <Header />
      <main>
        <Hero />
        <p
          data-speakable
          className="sr-only"
        >
          SkillStack (also written Skill Stack) is{" "}
          <strong>SkillStack Private Limited</strong>{" "}
          — a web development, SEO, and freelance services company based in
          Gilgit City, Gilgit-Baltistan, Pakistan, founded by Mansoor Khan.
          SkillStack is the best freelance company in Gilgit and
          Gilgit-Baltistan, offering keyword research, Google ranking, content
          writing, backlinks, and websites for clients across Pakistan and
          worldwide.
        </p>
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}
