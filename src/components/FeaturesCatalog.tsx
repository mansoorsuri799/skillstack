import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import { featuresByGroup, type ProductFeature } from "@/lib/features";

function FeatureCard({ feature }: { feature: ProductFeature }) {
  return (
    <Link
      href={`/features/${feature.slug}`}
      className="group block border-b border-white/10 py-6 transition-colors last:border-b-0 hover:border-accent/40 md:py-7"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold text-snow transition-colors group-hover:text-accent sm:text-2xl">
            {feature.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
            {feature.summary}
          </p>
        </div>
        <span className="mt-1 shrink-0 text-sm font-medium text-accent sm:mt-1.5">
          Learn more →
        </span>
      </div>
    </Link>
  );
}

export default function FeaturesCatalog() {
  const groups = featuresByGroup();

  return (
    <div className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-20">
      <div className="space-y-14 md:space-y-16">
        {groups.map(({ group, items }, groupIndex) => (
          <FadeIn key={group} delay={Math.min(groupIndex, 4) * 0.04}>
            <section>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
                {group}
              </p>
              <div className="mt-4 border-t border-white/10">
                {items.map((feature) => (
                  <FeatureCard key={feature.slug} feature={feature} />
                ))}
              </div>
            </section>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
