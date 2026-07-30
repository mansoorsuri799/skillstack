import Link from "next/link";
import Logo from "@/components/Logo";
import { LINKEDIN_URL, SITE_EMAIL, SITE_EMAIL_HREF, SITE_URL, X_URL } from "@/lib/seo";

const legal = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/sitemap.xml", label: "Sitemap" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#010409]">
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6 py-12 md:px-8 md:py-14">
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div className="flex max-w-sm flex-col items-center gap-4 md:items-start">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:justify-start">
              <Logo size="sm" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">
                smc-private limited
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/45">
              Web development &amp; SEO — built to rank and earn.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm md:justify-start">
              <a
                href={SITE_EMAIL_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/55 transition-colors hover:text-accent"
              >
                {SITE_EMAIL}
              </a>
              <span className="hidden text-white/20 sm:inline" aria-hidden>
                |
              </span>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer me"
                className="text-white/55 transition-colors hover:text-accent"
              >
                LinkedIn
              </a>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer me"
                className="text-white/55 transition-colors hover:text-accent"
              >
                X
              </a>
            </div>
          </div>

          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 md:justify-end"
          >
            {legal.map((link, i) => (
              <span key={link.href} className="flex items-center">
                {i > 0 ? (
                  <span className="mx-3 text-white/15" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link
                  href={link.href}
                  className="text-sm text-white/45 transition-colors hover:text-snow"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs tracking-wide text-white/35 md:px-8">
          © {year}{" "}
          <Link
            href={SITE_URL}
            className="text-white/55 transition-colors hover:text-accent"
          >
            SkillStack.com.pk
          </Link>
        </p>
      </div>
    </footer>
  );
}
