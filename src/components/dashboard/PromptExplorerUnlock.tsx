"use client";

import { Columns3, Search, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import {
  PaidFeatureUnlockCard,
  type UnlockFeature,
} from "@/components/dashboard/PaidFeatureUnlockCard";

const FEATURES: UnlockFeature[] = [
  {
    icon: Columns3,
    title: "Four models side-by-side",
    description:
      "Run one prompt across ChatGPT, Claude, Gemini, and Perplexity and compare answers in a single view.",
  },
  {
    icon: Search,
    title: "See what the models cite",
    description:
      "Every answer lists the sources it drew from, so you can audit where each model gets its information.",
  },
  {
    icon: Sparkles,
    title: "Check brand mentions",
    description:
      "Highlight a brand to instantly see whether it shows up in the answer text or the cited sources.",
  },
];

export function PromptExplorerUnlock({
  footer,
  upgradeHref = "/pricing",
}: {
  footer?: ReactNode;
  upgradeHref?: string;
}) {
  return (
    <PaidFeatureUnlockCard
      title="Unlock Prompt Explorer"
      description="Ask one prompt across ChatGPT, Claude, Gemini, and Perplexity at the same time and compare their answers — including which sources each model cites."
      features={FEATURES}
      footer={footer}
      upgradeHref={upgradeHref}
    />
  );
}
