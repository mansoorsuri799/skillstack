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

const columns = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/process", label: "Process" },
      { href: "/contact", label: "Contact us" },
      { href: "/seo-company-gilgit-baltistan", label: "SEO · Gilgit-Baltistan" },
    ],
  },
  {
    heading: "Services",
    links: [
      { href: "/services/keyword-research", label: "Keyword research" },
      { href: "/services/seo-ranking", label: "SEO ranking" },
      { href: "/services/websites-from-scratch", label: "Websites" },
      { href: "/services/backlinking", label: "Backlinking" },
      { href: "/services/content-writing", label: "Content writing" },
      { href: "/services/ad-monetization", label: "Ad monetization" },
    ],
  },
  {
    heading: "Pricing",
    links: [
      { href: "/pricing", label: "All packages" },
      { href: "/pricing#keyword", label: "Keyword package" },
      { href: "/pricing#growth", label: "Growth package" },
      { href: "/pricing#fullstack", label: "Full stack package" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refund", label: "Refund policy" },
      { href: "/service-policy", label: "Service delivery" },
      { href: "/sitemap-index.xml", label: "Sitemap" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0d1117]">
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-6 py-14 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-8">

          {/* Brand column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                Private Limited
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Web development &amp; SEO from Gilgit-Baltistan — serving
              Pakistan and clients worldwide.
            </p>
            <a
              href={OFFICE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/50 transition-colors hover:text-accent"
            >
              {OFFICE.fullLabel}
            </a>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href={SITE_EMAIL_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/55 transition-colors hover:text-accent"
              >
                {SITE_EMAIL}
              </a>
              {SITE_PHONE && (
                <a
                  href={SITE_PHONE_HREF}
                  className="text-white/55 transition-colors hover:text-accent"
                >
                  {SITE_PHONE}
                </a>
              )}
            </div>
            <div className="flex gap-4 text-sm">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer me"
                className="text-white/50 transition-colors hover:text-accent"
              >
                LinkedIn
              </a>
              <a
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer me"
                className="text-white/50 transition-colors hover:text-accent"
              >
                X
              </a>
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-sm font-semibold tracking-wide text-snow">
                {col.heading}
              </h3>
              <nav aria-label={col.heading}>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/55 transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <p className="mx-auto max-w-6xl px-6 py-5 text-center text-xs tracking-wide text-white/55 md:px-8">
          © {year}{" "}
          <Link
            href={SITE_URL}
            className="text-accent underline underline-offset-2 transition-colors hover:opacity-80"
          >
            SkillStack.com.pk
          </Link>
          {" "}· SkillStack Private Limited · Gilgit-Baltistan, Pakistan
        </p>
      </div>
    </footer>
  );
}
