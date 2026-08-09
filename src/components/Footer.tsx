import Link from "next/link";
import Logo from "@/components/Logo";
import {
  LINKEDIN_URL,
  OFFICE,
  SITE_EMAIL,
  SITE_EMAIL_HREF,
  SITE_PHONE,
  SITE_PHONE_HREF,
  SITE_URL,
  X_URL,
} from "@/lib/seo";

const explore = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  {
    href: "/seo-company-gilgit-baltistan",
    label: "SEO · Gilgit-Baltistan",
  },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/refund", label: "Refunds" },
  { href: "/service-policy", label: "Service delivery" },
  { href: "/sitemap-index.xml", label: "Sitemap" },
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
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="flex max-w-sm flex-col items-center gap-4 md:items-start">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:justify-start">
              <Logo size="sm" />
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/60">
                smc-private limited
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/65">
              SkillStack — web development &amp; SEO from {OFFICE.region},
              serving Pakistan and worldwide.
            </p>
            <p className="text-sm leading-relaxed text-white/65">
              <a
                href={OFFICE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                {OFFICE.fullLabel}
              </a>
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
              {SITE_PHONE ? (
                <>
                  <span className="hidden text-white/20 sm:inline" aria-hidden>
                    |
                  </span>
                  <a
                    href={SITE_PHONE_HREF}
                    className="text-white/55 transition-colors hover:text-accent"
                  >
                    {SITE_PHONE}
                  </a>
                </>
              ) : null}
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

          <div className="flex flex-col items-center gap-4 md:items-end">
            <nav
              aria-label="Explore"
              className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 md:justify-end"
            >
              {explore.map((link, i) => (
                <span key={link.href} className="flex items-center">
                  {i > 0 ? (
                    <span className="mx-3 text-white/15" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <Link
                    href={link.href}
                    className="text-sm text-white/55 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>
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
                    className="text-sm text-white/65 transition-colors hover:text-snow"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs tracking-wide text-white/55 md:px-8">
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
