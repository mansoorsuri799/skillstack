import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <div className="relative flex min-h-[70svh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,rgba(45,212,191,0.12),transparent_60%)]"
        />
        <p className="relative text-xs font-medium uppercase tracking-[0.18em] text-accent">
          404
        </p>
        <h1 className="relative mt-4 font-display text-4xl font-bold tracking-tight text-snow sm:text-5xl">
          Page not found
        </h1>
        <p className="relative mt-4 max-w-md text-base text-ink-muted">
          That URL isn&apos;t on SkillStack. Head home or jump to a core page.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-[#010409] hover:bg-accent-deep"
          >
            Home
          </Link>
          <Link
            href="/services"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            Services
          </Link>
          <Link
            href="/contact"
            className="inline-flex rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-snow hover:bg-white/5"
          >
            Contact
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
