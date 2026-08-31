import { processSteps } from "@/lib/content";

export default function ProcessPath() {
  return (
    <div className="relative mt-12 md:mt-16">
      {/* Desktop connector rail */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[22px] hidden h-px md:block"
      >
        <div className="h-full origin-left bg-gradient-to-r from-accent/80 via-accent/50 to-accent/20" />
      </div>

      <ol className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {processSteps.map((step, i) => (
          <li key={step.n} className="relative">
            {/* Node on the path */}
            <div className="mb-5 flex items-center gap-3 md:mb-6 md:flex-col md:items-start md:gap-0">
              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-[#161b22] font-display text-sm font-semibold tabular-nums text-accent shadow-[0_0_0_4px_#161b22]">
                {i + 1}
              </span>

              {/* Mobile vertical connector to next */}
              {i < processSteps.length - 1 ? (
                <span
                  aria-hidden
                  className="h-px flex-1 bg-gradient-to-r from-accent/50 to-white/10 md:hidden"
                />
              ) : null}
            </div>

            <span className="font-display text-xs font-medium uppercase tracking-wider text-accent/85">
              Phase {step.n}
            </span>
            <h3 className="font-display mt-2 text-lg font-semibold tracking-tight text-snow">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {step.summary}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
