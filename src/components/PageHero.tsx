import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";
import FadeIn from "./FadeIn";
import type { Crumb } from "@/lib/seo";

export default function PageHero({
  eyebrow,
  title,
  lead,
  tone = "soft",
  breadcrumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: ReactNode;
  tone?: "soft" | "elevated" | "deep";
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}) {
  const bg =
    tone === "elevated"
      ? "bg-[#161b22]"
      : tone === "deep"
        ? "bg-[#010409]"
        : "bg-[#0d1117]";

  return (
    <div
      className={`relative overflow-hidden border-b border-white/10 ${bg} pb-14 pt-10 md:pb-20 md:pt-14`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_85%_10%,rgba(45,212,191,0.12),transparent_55%),radial-gradient(ellipse_50%_40%_at_5%_90%,rgba(56,100,140,0.14),transparent_50%)]"
      />
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8">
        <FadeIn>
          {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent sm:text-sm">
            {eyebrow}
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-3xl font-bold tracking-tight text-snow sm:text-5xl">
            {title}
          </h1>
          <div className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
            {lead}
          </div>
          {children ? <div className="mt-8">{children}</div> : null}
        </FadeIn>
      </div>
    </div>
  );
}
