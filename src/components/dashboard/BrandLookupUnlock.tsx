"use client";

import { BarChart3, LineChart, Quote } from "lucide-react";
import type { ReactNode } from "react";
import {
  PaidFeatureUnlockCard,
  type UnlockFeature,
} from "@/components/dashboard/PaidFeatureUnlockCard";

const FEATURES: UnlockFeature[] = [
  {
    icon: LineChart,
    title: "Track AI visibility",
    description:
      "See estimated counts for ChatGPT and Google AI Overview answers that cite your brand, and watch the trend month over month.",
  },
  {
    icon: Quote,
    title: "See the prompts",
    description:
      "View sample user questions where LLMs reference your brand or domain.",
  },
  {
    icon: BarChart3,
    title: "Map the competition",
    description:
      "Spot the pages LLMs cite alongside you so you know who's competing for attention in AI answers.",
  },
];

export function BrandLookupUnlock({
  footer,
  upgradeHref = "/pricing",
}: {
  footer?: ReactNode;
  upgradeHref?: string;
}) {
  return (
    <PaidFeatureUnlockCard
      title="Unlock Brand Lookup"
      description="See how ChatGPT and Google AI Overview cite any brand name or domain — total mentions, sample prompts where it appears, and the pages cited alongside it."
      features={FEATURES}
      footer={footer}
      upgradeHref={upgradeHref}
    />
  );
}
